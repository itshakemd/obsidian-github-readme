import CodeMirrorEditor from "./CodeMirrorEditor";
import MarkdownPreview from "./MarkdownPreview";
import type { ViewMode, ReadmeData, RepoInfo } from "../types";

interface Props {
  selectedRepo: RepoInfo | null;
  readmeLoading: boolean;
  readmeError: string;
  readme: ReadmeData | null;
  readmeDraft: string;
  setReadmeDraft: (content: string) => void;
  viewMode: ViewMode;
  editorKey: number;
  syncScroll: (from: "editor" | "viewer", ratio: number) => void;
  editorScrollerRef: React.MutableRefObject<HTMLElement | null>;
  viewerRef: React.RefObject<HTMLDivElement | null>;
  handleViewerScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  renderMarkdown: (markdown: string, el: HTMLElement) => Promise<() => void>;
  readmeSaved: boolean;
}

export default function ReadmeWorkspace({
  selectedRepo,
  readmeLoading,
  readmeError,
  readme,
  readmeDraft,
  setReadmeDraft,
  viewMode,
  editorKey,
  syncScroll,
  editorScrollerRef,
  viewerRef,
  handleViewerScroll,
  renderMarkdown,
  readmeSaved,
}: Props) {
  if (!selectedRepo) return null;

  return (
    <div className="github-readme-workspace">
      {readmeLoading && (
        <div className="github-readme-loading" role="status" aria-label="Loading README">
          <span className="github-spinner" />
        </div>
      )}
      {readmeError && <div className="github-readme-error" role="alert">{readmeError}</div>}

      {!readmeLoading && readme && (
        <>
          <div className={`github-readme-content mode-${viewMode}`}>
            {(viewMode === "editor" || viewMode === "split") && (
              <div className="github-readme-editor-wrap">
                <CodeMirrorEditor
                  key={editorKey}
                  value={readmeDraft}
                  onChange={setReadmeDraft}
                  onScroll={(ratio) => syncScroll("editor", ratio)}
                  scrollerRef={editorScrollerRef}
                />
              </div>
            )}
            {(viewMode === "viewer" || viewMode === "split") && (
              <div className="github-readme-viewer" ref={viewerRef} onScroll={handleViewerScroll}>
                {readmeDraft ? (
                  <MarkdownPreview source={readmeDraft} renderMarkdown={renderMarkdown} />
                ) : (
                  <div className="github-readme-muted">Nothing to preview.</div>
                )}
              </div>
            )}
          </div>

          {readmeSaved && <div className="github-readme-verify ok">✅ Saved to GitHub</div>}
          {readmeError && <div className="github-readme-verify failed">❌ {readmeError}</div>}
        </>
      )}
    </div>
  );
}
