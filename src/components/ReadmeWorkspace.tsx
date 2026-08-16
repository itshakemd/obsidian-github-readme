import type { ReadmeData, RepoInfo } from "../types";
interface Props { selectedRepo: RepoInfo | null; readme: ReadmeData | null; readmeLoading: boolean; readmeError: string; }
export default function ReadmeWorkspace({ selectedRepo, readme, readmeLoading, readmeError }: Props) {
  if (!selectedRepo) return null;
  if (readmeLoading) return <div className="github-readme-loading"><span className="github-spinner" /></div>;
  if (readmeError) return <div className="github-readme-error" role="alert">{readmeError}</div>;
  return <div className="github-readme-workspace">{readmeError && <div className="github-readme-error">{readmeError}</div>}{readme && <div>{readme.content}</div>}</div>;
}
