export interface RepoInfo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  updated_at: string;
  language: string | null;
  stargazers_count: number;
}

export interface ReadmeData {
  content: string;
  sha: string;
  path: string;
}

export interface UserProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
}

export const VIEW_MODES = ["editor", "viewer", "split"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];
