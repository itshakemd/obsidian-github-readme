import { useState, useRef, useEffect } from "react";
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
  viewerRef: React.RefObject<HTMLDivElement | null>;
  showLineNumbers: boolean;
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
  viewerRef,
  showLineNumbers,
  renderMarkdown,
  readmeSaved,
}: Props) {
  const [editorWidth, setEditorWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const newFlex = ((e.clientX - left) / width) * 100;
      setEditorWidth(Math.max(10, Math.min(90, newFlex)));
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.classList.add("github-readme-dragging");
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("github-readme-dragging");
    };
  }, [isDragging]);

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
          <div className={`github-readme-content mode-${viewMode}`} ref={containerRef}>
            {(viewMode === "editor" || viewMode === "split") && (
              <div
                className="github-readme-editor-wrap"
                style={viewMode === "split" ? { "--editor-width": `${editorWidth}%` } as React.CSSProperties : undefined}
              >
                <CodeMirrorEditor
                  key={editorKey}
                  value={readmeDraft}
                  onChange={setReadmeDraft}
                  showLineNumbers={showLineNumbers}
                />
              </div>
            )}
            {viewMode === "split" && (
              <div className="github-readme-resizer-wrap">
                <div className="github-readme-resizer" onMouseDown={() => setIsDragging(true)} />
              </div>
            )}
            {(viewMode === "viewer" || viewMode === "split") && (
              <div className="github-readme-viewer" ref={viewerRef}>
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
