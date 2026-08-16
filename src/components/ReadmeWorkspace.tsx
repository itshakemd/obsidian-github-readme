import CodeMirrorEditor from "./CodeMirrorEditor";
import type { ReadmeData, RepoInfo } from "../types";
interface Props { selectedRepo: RepoInfo | null; readme: ReadmeData | null; readmeLoading: boolean; readmeError: string; readmeDraft: string; setReadmeDraft: (v: string) => void; editorKey: number; }
export default function ReadmeWorkspace({ selectedRepo, readme, readmeLoading, readmeError, readmeDraft, setReadmeDraft, editorKey }: Props) {
  if (!selectedRepo) return null;
  if (readmeLoading) return <div className="github-readme-loading"><span className="github-spinner" /></div>;
  if (readmeError) return <div className="github-readme-error" role="alert">{readmeError}</div>;
  return <div className="github-readme-workspace">{readme && <div className="github-readme-editor-wrap"><CodeMirrorEditor key={editorKey} value={readmeDraft} onChange={setReadmeDraft} /></div>}</div>;
}
