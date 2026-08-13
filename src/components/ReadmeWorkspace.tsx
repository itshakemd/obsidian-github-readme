import type { ReadmeData, RepoInfo } from "../types";
interface Props { selectedRepo: RepoInfo | null; readme: ReadmeData | null; readmeLoading: boolean; }
export default function ReadmeWorkspace({ selectedRepo, readme, readmeLoading }: Props) {
  if (!selectedRepo) return null;
  if (readmeLoading) return <div className="github-readme-loading"><span className="github-spinner" /></div>;
  return <div className="github-readme-workspace">{readme && <div>{readme.content}</div>}</div>;
}
