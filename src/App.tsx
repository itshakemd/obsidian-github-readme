import { useState, useRef, useCallback } from "react";
import ReposSidebar from "./components/ReposSidebar";
import ConnectCard from "./components/ConnectCard";
import ReadmeWorkspace from "./components/ReadmeWorkspace";
import type { RepoInfo, ReadmeData } from "./types";
export default function App(props: any) {
  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(null);
  const [readme, setReadme] = useState<ReadmeData | null>(null);
  const [readmeDraft, setReadmeDraft] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const editorScrollerRef = useRef<HTMLElement | null>(null);
  const syncScroll = useCallback((from: "editor" | "viewer", ratio: number) => {
    if (from === "editor") { const dst = viewerRef.current; if (!dst) return; const max = dst.scrollHeight - dst.clientHeight; if (max <=0) return; dst.scrollTop = ratio * max; } else { const dst = editorScrollerRef.current; if (!dst) return; const max = dst.scrollHeight - dst.clientHeight; if (max <=0) return; dst.scrollTop = ratio * max; }
  }, []);
  const handleViewerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => { const el = e.currentTarget; const max = el.scrollHeight - el.clientHeight; if (max>0) syncScroll("viewer", el.scrollTop / max); }, [syncScroll]);
  const handleSelectRepo = async (repo: RepoInfo) => { setSelectedRepo(repo); setReadme(null); setReadmeDraft(""); setReadmeError(""); setReadmeLoading(true); try { const data = await props.fetchReadme(repo.full_name); setReadme(data); setReadmeDraft(data.content); setEditorKey(k=>k+1);} catch(e){ setReadmeError(e instanceof Error? e.message: String(e));} finally { setReadmeLoading(false);} };
  return (<div className="github-readme-layout"><aside className="github-readme-sidebar"><ReposSidebar {...props} onSelectRepo={handleSelectRepo} selectedFullName={selectedRepo?.full_name ?? null} /></aside><div className="github-readme-main"><ReadmeWorkspace selectedRepo={selectedRepo} readme={readme} readmeLoading={readmeLoading} readmeError={readmeError} readmeDraft={readmeDraft} setReadmeDraft={setReadmeDraft} editorKey={editorKey} viewerRef={viewerRef} editorScrollerRef={editorScrollerRef} syncScroll={syncScroll} handleViewerScroll={handleViewerScroll} renderMarkdown={props.renderMarkdown} /></div></div>);
}
