import { VIEW_MODES, type ViewMode } from "./types";

export { VIEW_MODES, type ViewMode };

export interface GitHubReadmeSettings {
  githubToken: string;
  defaultViewMode: ViewMode;
  showLineNumbers: boolean;
}

export const DEFAULT_SETTINGS: GitHubReadmeSettings = {
  githubToken: "",
  defaultViewMode: "editor",
  showLineNumbers: true,
};