import { ItemView, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from "obsidian";
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
  async saveToken(token: string): Promise<void> { this.settings.githubToken = token.trim(); await this.saveSettings(); this.refreshViews(); }
  refreshViews(): void { for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) { const view = leaf.view as any; view.renderApp?.(); } }
  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
}
