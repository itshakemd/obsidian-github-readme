import CodeMirrorEditor from "./CodeMirrorEditor";
import MarkdownPreview from "./MarkdownPreview";
import type { ReadmeData, RepoInfo } from "../types";
interface Props { viewMode: string;  selectedRepo: RepoInfo | null; readme: ReadmeData | null; readmeLoading: boolean; readmeError: string; readmeDraft: string; setReadmeDraft: (v: string) => void; editorKey: number; renderMarkdown: (markdown: string, el: HTMLElement) => Promise<() => void>; }
export default function ReadmeWorkspace({ selectedRepo, readme, viewMode, readmeLoading, readmeError, readmeDraft, setReadmeDraft, editorKey, renderMarkdown }: Props) {
  if (!selectedRepo) return null;
  if (readmeLoading) return <div className="github-readme-loading"><span className="github-spinner" /></div>;
  if (readmeError) return <div className="github-readme-error">{readmeError}</div>;
  if (!readme) return null;
  return <div className="github-readme-workspace"><div className="github-readme-editor-wrap"><CodeMirrorEditor key={editorKey} value={readmeDraft} onChange={setReadmeDraft} /></div><div className="github-readme-viewer"><MarkdownPreview source={readmeDraft} renderMarkdown={renderMarkdown} /></div></div>;
}
