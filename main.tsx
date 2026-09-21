import { Component, ItemView, MarkdownRenderer, MarkdownView, normalizePath, Notice, Plugin, PluginSettingTab, requestUrl, Setting, TFile, WorkspaceLeaf } from "obsidian";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import App from "./src/App";
import { DEFAULT_SETTINGS, type GitHubReadmeSettings } from "./src/settings";
import type { RepoInfo, ViewMode } from "./src/types";
import { VIEW_MODES } from "./src/types";

const VIEW_TYPE = "github-readme-view";

class GitHubView extends ItemView {
  private root: Root | null = null;
  private plugin: GitHubReadmePlugin;

  constructor(leaf: WorkspaceLeaf, plugin: GitHubReadmePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return "GitHub README";
  }

  getIcon(): string {
    return "github";
  }

  async onOpen(): Promise<void> {
    this.renderApp();
  }

  private renderMarkdown = async (markdown: string, el: HTMLElement): Promise<() => void> => {
    const component = new Component();
    component.load();
    await MarkdownRenderer.render(this.app, markdown, el, "", component);
    return () => component.unload();
  };

  renderApp(): void {
    const container = this.containerEl.children[1] as HTMLElement;
    if (!this.root) {
      this.root = createRoot(container);
    }
    this.root.render(
      <App
        getToken={() => this.plugin.settings.githubToken}
        saveToken={(token) => this.plugin.saveToken(token)}
        listRepos={() => this.plugin.listRepos()}
        fetchReadme={(fullName) => this.plugin.fetchReadme(fullName)}
        saveReadme={(fullName, content, sha, message) => this.plugin.saveReadme(fullName, content, sha, message)}
        openReadme={(fullName, content) => this.plugin.openReadme(fullName, content)}
        watchFile={(vaultPath, onChange) => this.plugin.watchFile(vaultPath, onChange)}
        fetchProfile={() => this.plugin.fetchProfile()}
        openSettings={() => this.plugin.openSettings()}
        defaultViewMode={this.plugin.settings.defaultViewMode}
        renderMarkdown={this.renderMarkdown}
      />
    );
  }

  async onClose(): Promise<void> {
    this.root?.unmount();
    this.root = null;
  }
}

class GitHubReadmeSettingTab extends PluginSettingTab {
  private pluginInstance: GitHubReadmePlugin;

  constructor(pluginInstance: GitHubReadmePlugin) {
    super(pluginInstance.app, pluginInstance);
    this.pluginInstance = pluginInstance;
  }

  getSettingDefinitions() {
    return [
      {
        name: "GitHub Personal Access Token",
        desc: "Used to read/write README files via GitHub API. Stored locally in data.json.",
        control: {
          type: "text" as const,
          key: "githubToken",
          placeholder: "ghp_… or github_pat_…",
        },
      },
      {
        name: "Default view mode",
        desc: "How READMEs open: editor only, rendered viewer only, or editor and viewer side by side.",
        control: {
          type: "dropdown" as const,
          key: "defaultViewMode",
          options: {
            editor: "Editor",
            viewer: "Viewer",
            split: "Split",
          },
        },
      },
    ];
  }

  getControlValue(key: string): unknown {
    if (key === "githubToken") return this.pluginInstance.settings.githubToken;
    if (key === "defaultViewMode") return this.pluginInstance.settings.defaultViewMode;
    return (this.pluginInstance.settings as unknown as Record<string, unknown>)[key];
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    if (key === "githubToken") {
      this.pluginInstance.settings.githubToken = String(value).trim();
    } else if (key === "defaultViewMode") {
      this.pluginInstance.settings.defaultViewMode = value as ViewMode;
    } else {
      (this.pluginInstance.settings as unknown as Record<string, unknown>)[key] = value;
    }
    await this.pluginInstance.saveSettings();
    this.pluginInstance.refreshViews();
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl).setName("GitHub README").setHeading();

    let tokenInput: HTMLInputElement | null = null;

    new Setting(containerEl)
      .setName("GitHub Personal Access Token")
      .setDesc("Used to read/write README files via GitHub API. Stored locally in data.json.")
      .addText((text) => {
        text
          .setPlaceholder("ghp_… or github_pat_…")
          .setValue(this.pluginInstance.settings.githubToken)
          .onChange(async (value) => {
            const trimmed = value.trim();
            this.pluginInstance.settings.githubToken = trimmed;
            await this.pluginInstance.saveSettings();
            this.pluginInstance.refreshViews();
          });
        text.inputEl.type = "password";
        text.inputEl.addClass("github-readme-token-input");
        tokenInput = text.inputEl;
      })
      .addExtraButton((btn) => {
        btn
          .setIcon("eye")
          .setTooltip("Show token")
          .onClick(() => {
            if (!tokenInput) return;
            const hidden = tokenInput.type === "password";
            tokenInput.type = hidden ? "text" : "password";
            btn.setIcon(hidden ? "eye-off" : "eye");
            btn.setTooltip(hidden ? "Hide token" : "Show token");
          });
      });

    new Setting(containerEl)
      .setName("Clear token")
      .setDesc("Remove the stored token.")
      .addButton((btn) => {
        btn.setButtonText("Clear").setDestructive().onClick(async () => {
          this.pluginInstance.settings.githubToken = "";
          await this.pluginInstance.saveSettings();
          this.pluginInstance.refreshViews();
          this.display();
          new Notice("Token cleared");
        });
      });

    containerEl.createEl("p", { text: "Create a token at github.com/settings/tokens (classic, scope: repo) or fine-grained with Contents: Read & write.", cls: "setting-item-description" });

    new Setting(containerEl)
      .setName("Default view mode")
      .setDesc("How READMEs open: editor only, rendered viewer only, or editor and viewer side by side.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("editor", "Editor")
          .addOption("viewer", "Viewer")
          .addOption("split", "Split")
          .setValue(this.pluginInstance.settings.defaultViewMode)
          .onChange(async (value) => {
            this.pluginInstance.settings.defaultViewMode = value as ViewMode;
            await this.pluginInstance.saveSettings();
            this.pluginInstance.refreshViews();
          });
      });
  }
}

export default class GitHubReadmePlugin extends Plugin {
  settings: GitHubReadmeSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => new GitHubView(leaf, this));

    const ribbonIconEl = this.addRibbonIcon("github", "Open GitHub README", () => {
      void this.activateView();
    });
    ribbonIconEl.addClass("github-readme-ribbon-icon");

    this.addCommand({
      id: "open-view",
      name: "Open view",
      callback: () => {
        void this.activateView();
      },
    });

    this.addSettingTab(new GitHubReadmeSettingTab(this));
  }

  async loadSettings(): Promise<void> {
    const data = (await this.loadData()) as Partial<GitHubReadmeSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
    if (!VIEW_MODES.includes(this.settings.defaultViewMode)) {
      this.settings.defaultViewMode = DEFAULT_SETTINGS.defaultViewMode;
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async saveToken(token: string): Promise<void> {
    this.settings.githubToken = token.trim();
    await this.saveSettings();
    this.refreshViews();
    new Notice(token ? "GitHub token saved" : "GitHub token cleared");
  }

  async listRepos(): Promise<RepoInfo[]> {
    const token = this.settings.githubToken.trim();
    if (!token) throw new Error("No GitHub token — connect your token first");
    const repos: RepoInfo[] = [];
    let page = 1;
    while (true) {
      const res = await requestUrl({
        url: `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        throw: false,
      });
      if (res.status < 200 || res.status >= 300) {
        const body = res.text;
        let msg = `${res.status} ${res.headers["status"] ?? ""}`.trim();
        if (!msg || msg === String(res.status)) msg = `${res.status}`;
        try {
          const j = JSON.parse(body) as { message?: string };
          if (j.message) msg = j.message;
        } catch {
          // ignore JSON parse failure, use status message
        }
        throw new Error(msg);
      }
      const batch = res.json as RepoInfo[];
      repos.push(...batch);
      if (batch.length < 100) break;
      page += 1;
      if (page > 10) break;
    }
    return repos;
  }

  async fetchReadme(fullName: string): Promise<{ content: string; sha: string; path: string }> {
    const token = this.settings.githubToken.trim();
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await requestUrl({
      url: `https://api.github.com/repos/${fullName}/readme`,
      headers,
      throw: false,
    });
    if (res.status < 200 || res.status >= 300) {
      const body = res.text;
      let msg = `${res.status}`;
      try {
        const j = JSON.parse(body) as { message?: string };
        if (j.message) msg = j.message;
      } catch {
        // ignore JSON parse failure
      }
      if (res.status === 404) throw new Error("No README found for this repository");
      throw new Error(msg);
    }
    const data = res.json as { content: string; encoding: string; sha: string; path: string; name: string };
    if (data.encoding !== "base64" || !data.content) throw new Error("Unexpected README encoding");
    const b64 = data.content.replace(/\n/g, "");
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    return { content: text, sha: data.sha, path: data.path ?? "README.md" };
  }

  async fetchProfile(): Promise<{ login: string; name: string | null; avatar_url: string; html_url: string; bio: string | null; public_repos: number; followers: number }> {
    const token = this.settings.githubToken.trim();
    if (!token) throw new Error("No token");
    const res = await requestUrl({
      url: "https://api.github.com/user",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      throw: false,
    });
    if (res.status < 200 || res.status >= 300) {
      const body = res.text;
      let msg = `${res.status}`;
      try {
        const j = JSON.parse(body) as { message?: string };
        if (j.message) msg = j.message;
      } catch {
        // ignore JSON parse failure
      }
      throw new Error(msg);
    }
    return res.json as { login: string; name: string | null; avatar_url: string; html_url: string; bio: string | null; public_repos: number; followers: number };
  }

  openSettings(): void {
    const setting = (this.app as unknown as { setting: { open: () => void; openTabById: (id: string) => void } }).setting;
    try {
      setting.open();
      setting.openTabById(this.manifest.id);
    } catch {
      try { setting.open(); } catch {
        // ignore: setting modal may not be available
      }
    }
  }

  async saveReadme(fullName: string, content: string, sha: string | null, message = "Update README via Obsidian"): Promise<string> {
    const token = this.settings.githubToken.trim();
    if (!token) throw new Error("No GitHub token");
    const bytes = new TextEncoder().encode(content);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    const b64 = btoa(binary);

    let path = "README.md";
    if (sha) {
      try {
        const info = await this.fetchReadme(fullName);
        path = info.path;
      } catch {
        // ignore: fallback to default README.md path
      }
    }

    const res = await requestUrl({
      url: `https://api.github.com/repos/${fullName}/contents/${encodeURIComponent(path)}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: b64,
        sha: sha ?? undefined,
      }),
      throw: false,
    });
    if (res.status < 200 || res.status >= 300) {
      const body = res.text;
      let msg = `${res.status}`;
      try {
        const j = JSON.parse(body) as { message?: string };
        if (j.message) msg = j.message;
      } catch {
        // ignore JSON parse failure
      }
      throw new Error(msg);
    }
    const data = res.json as { content?: { sha: string } };
    return data.content?.sha ?? "";
  }

  async openReadme(fullName: string, content: string): Promise<string> {
    const path = normalizePath(`GitHub/${fullName}/README.md`);
    const folder = path.substring(0, path.lastIndexOf("/"));
    if (folder) {
      const parts = folder.split("/");
      let cur = "";
      for (const p of parts) {
        cur = cur ? `${cur}/${p}` : p;
        if (!this.app.vault.getAbstractFileByPath(cur)) {
          try {
            await this.app.vault.createFolder(cur);
          } catch {
            // ignore: folder may already exist
          }
        }
      }
    }
    let file = this.app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) {
      await this.app.vault.modify(file, content);
    } else {
      file = await this.app.vault.create(path, content);
    }
    if (!(file instanceof TFile)) return path;

    let target: WorkspaceLeaf | null = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (!target && leaf.view instanceof MarkdownView && leaf.view.file?.path === file.path) target = leaf;
    });
    const leaf: WorkspaceLeaf = target ?? this.app.workspace.getLeaf("tab");
    await leaf.openFile(file);
    await this.app.workspace.revealLeaf(leaf);
    return path;
  }

  watchFile(vaultPath: string, onChange: (content: string) => void): () => void {
    const ref = this.app.vault.on("modify", async (file) => {
      if (file instanceof TFile && file.path === vaultPath) {
        try {
          const content = await this.app.vault.read(file);
          onChange(content);
        } catch {
          // ignore: file may have been deleted
        }
      }
    });
    return () => this.app.vault.offref(ref);
  }

  refreshViews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      const view = leaf.view as GitHubView;
      if (view instanceof GitHubView) view.renderApp();
    }
  }

  private async activateView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);

    if (existing.length > 0) {
      await this.app.workspace.revealLeaf(existing[0]);
      return;
    }

    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({
      type: VIEW_TYPE,
      active: true,
    });
    await this.app.workspace.revealLeaf(leaf);
  }
}