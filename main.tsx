import { ItemView, Plugin, WorkspaceLeaf } from "obsidian";
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

export default class GitHubReadmePlugin extends Plugin {
  async onload(): Promise<void> {
    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => new GitHubView(leaf));
    const ribbonIconEl = this.addRibbonIcon("github", "Open GitHub README", () => {
      void this.activateView();
    });
    ribbonIconEl.addClass("github-readme-ribbon-icon");
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
  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
}
