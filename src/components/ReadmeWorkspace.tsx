import type { ReadmeData, RepoInfo } from "../types";
interface Props { selectedRepo: RepoInfo | null; readme: ReadmeData | null; }
export default function ReadmeWorkspace({ selectedRepo, readme }: Props) {
  if (!selectedRepo) return null;
  return <div className="github-readme-workspace">{readme && <div>{readme.content}</div>}</div>;
}
