import { Plugin } from "obsidian";
export default class GitHubReadmePlugin extends Plugin {
  async onload(): Promise<void> {
    console.log("GitHub README plugin loaded");
  }
  onunload(): void {}
}
