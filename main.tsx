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
  }
  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
}
