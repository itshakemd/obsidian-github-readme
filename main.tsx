import { Component, ItemView, MarkdownRenderer, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from "obsidian";
import { DEFAULT_SETTINGS, type GitHubReadmeSettings } from "./src/settings";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import App from "./src/App";

const VIEW_TYPE = "github-readme-view";

class GitHubView extends ItemView {
  private root: Root | null = null;
  constructor(leaf: WorkspaceLeaf) { super(leaf); }
  getViewType(): string { return VIEW_TYPE; }
  getDisplayText(): string { return "GitHub README"; }
  getIcon(): string { return "github"; }
  async onOpen(): Promise<void> {}
  async onClose(): Promise<void> { this.root?.unmount(); this.root = null; }
}

class GitHubReadmeSettingTab extends PluginSettingTab {
  private pluginInstance: GitHubReadmePlugin;
  constructor(pluginInstance: GitHubReadmePlugin) { super(pluginInstance.app, pluginInstance); this.pluginInstance = pluginInstance; }
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "GitHub README" });
    // default view mode setting added
    let tokenInput: HTMLInputElement | null = null;
    new Setting(containerEl).setName("GitHub Personal Access Token").setDesc("Used to read/write README files via GitHub API. Stored locally in data.json.").addText((text) => {
      text.setPlaceholder("ghp_… or github_pat_…").setValue(this.pluginInstance.settings.githubToken).onChange(async (value) => {
        const trimmed = value.trim();
        this.pluginInstance.settings.githubToken = trimmed;
        await this.pluginInstance.saveSettings();
        this.pluginInstance.refreshViews();
      });
      text.inputEl.type = "password";
      text.inputEl.style.width = "260px";
      tokenInput = text.inputEl;
    }).addExtraButton((btn) => {
      btn.setIcon("eye").setTooltip("Show token").onClick(() => {
        if (!tokenInput) return;
        const hidden = tokenInput.type === "password";
        tokenInput.type = hidden ? "text" : "password";
        btn.setIcon(hidden ? "eye-off" : "eye");
      });
    });
    new Setting(containerEl).setName("Default view mode").setDesc("How READMEs open: editor only, rendered viewer only, or editor and viewer side by side.").addDropdown((dropdown) => {
      dropdown.addOption("editor", "Editor").addOption("viewer", "Viewer").addOption("split", "Split").setValue(this.pluginInstance.settings.defaultViewMode).onChange(async (value) => { this.pluginInstance.settings.defaultViewMode = value as any; await this.pluginInstance.saveSettings(); });
    });
    new Setting(containerEl).setName("Clear token").setDesc("Remove the stored token.").addButton((btn) => {
      btn.setButtonText("Clear").setWarning().onClick(async () => {
        this.pluginInstance.settings.githubToken = "";
        await this.pluginInstance.saveSettings();
        this.pluginInstance.refreshViews();
        this.display();
      });
    });
  }
}

export default class GitHubReadmePlugin extends Plugin {
  settings: GitHubReadmeSettings = { ...DEFAULT_SETTINGS };
  async onload(): Promise<void> {
    await this.loadSettings();
    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => new GitHubView(leaf));
    const ribbonIconEl = this.addRibbonIcon("github", "Open GitHub README", () => {
      void this.activateView();
    });
    ribbonIconEl.addClass("github-readme-ribbon-icon");
    this.addSettingTab(new GitHubReadmeSettingTab(this));
    this.addCommand({
      id: "open-github-readme-view",
      name: "Open GitHub README",
      callback: () => { void this.activateView(); },
    });
  }
  private async activateView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) { await this.app.workspace.revealLeaf(existing[0]); return; }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }
  async loadSettings(): Promise<void> { const data = (await this.loadData()) as Partial<GitHubReadmeSettings> | null; this.settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) }; }
  async saveSettings(): Promise<void> { await this.saveData(this.settings); }
  async listRepos(): Promise<RepoInfo[]> {
    const token = this.settings.githubToken.trim();
    if (!token) throw new Error("No GitHub token — connect your token first");
    const repos: RepoInfo[] = [];
    let page = 1;
    while (true) {
      const res = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" } });
      if (!res.ok) { const body = await res.text(); let msg = `${res.status} ${res.statusText}`; try { const j = JSON.parse(body) as { message?: string }; if (j.message) msg = j.message; } catch {} throw new Error(msg); }
      const batch = (await res.json()) as RepoInfo[];
      repos.push(...batch);
      if (batch.length < 100) break;
      page += 1;
      if (page > 10) break;
    }
    return repos;
  }
  async fetchReadme(fullName: string): Promise<{ content: string; sha: string; path: string }> {
    const token = this.settings.githubToken.trim();
    const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, { headers });
    if (!res.ok) { const body = await res.text(); let msg = `${res.status} ${res.statusText}`; try { const j = JSON.parse(body) as { message?: string }; if (j.message) msg = j.message; } catch {} if (res.status === 404) throw new Error("No README found for this repository"); throw new Error(msg); }
    const data = (await res.json()) as { content: string; encoding: string; sha: string; path: string; name: string };
    if (data.encoding !== "base64" || !data.content) throw new Error("Unexpected README encoding");
    const b64 = data.content.replace(/\n/g, "");
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    return { content: text, sha: data.sha, path: data.path ?? "README.md" };
  }
  async fetchProfile(): Promise<{ login: string; name: string | null; avatar_url: string; html_url: string; bio: string | null; public_repos: number; followers: number }> {
    const token = this.settings.githubToken.trim(); if (!token) throw new Error("No token"); const res = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" } }); if (!res.ok) { const body = await res.text(); let msg = `${res.status} ${res.statusText}`; try { const j = JSON.parse(body) as { message?: string }; if (j.message) msg = j.message; } catch {} throw new Error(msg); } return (await res.json()) as any; }
  async saveReadme(fullName: string, content: string, sha: string | null, message = "Update README via Obsidian"): Promise<string> {
    const token = this.settings.githubToken.trim(); if (!token) throw new Error("No GitHub token"); const bytes = new TextEncoder().encode(content); let binary=""; for(const b of bytes) binary+=String.fromCharCode(b); const b64=btoa(binary); const res=await fetch(`https://api.github.com/repos/${fullName}/contents/README.md`, { method:"PUT", headers:{ Authorization:`Bearer ${token}`, Accept:"application/vnd.github.v3+json","Content-Type":"application/json"}, body: JSON.stringify({ message, content: b64, sha: sha ?? undefined })}); if(!res.ok){ const body=await res.text(); let msg=`${res.status} ${res.statusText}`; try{const j=JSON.parse(body) as {message?:string}; if(j.message) msg=j.message;}catch{} throw new Error(msg);} const data= (await res.json()) as {content?:{sha:string}}; return data.content?.sha ?? ""; }
  async saveToken(token: string): Promise<void> { this.settings.githubToken = token.trim(); await this.saveSettings(); this.refreshViews(); }
  refreshViews(): void { for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) { const view = leaf.view as any; view.renderApp?.(); } }
  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
}
