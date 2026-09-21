import { useCallback, useEffect, useRef, useState } from "react";
import type { ReadmeData, RepoInfo, ViewMode } from "../types";

export function useReadmeEditor(
  defaultViewMode: ViewMode,
  fetchReadme: (fullName: string) => Promise<ReadmeData>,
  saveReadme: (fullName: string, content: string, sha: string | null, message?: string) => Promise<string>,
  openReadme: (fullName: string, content: string) => Promise<string>,
  watchFile: (vaultPath: string, onChange: (content: string) => void) => () => void
) {
  const [editorKey, setEditorKey] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const watcherUnsubRef = useRef<(() => void) | null>(null);

  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(null);
  const [readme, setReadme] = useState<ReadmeData | null>(null);
  const [readmeDraft, setReadmeDraft] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState("");
  const [readmeSaving, setReadmeSaving] = useState(false);
  const [readmeSaved, setReadmeSaved] = useState(false);
  const [commitMsg, setCommitMsg] = useState("Update README via Obsidian");
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync viewMode with plugin default setting
    setViewMode(defaultViewMode);
  }, [defaultViewMode]);

  const viewerRef = useRef<HTMLDivElement>(null);
  const editorScrollerRef = useRef<HTMLElement | null>(null);
  const ignoreScrollFrom = useRef<"editor" | "viewer" | null>(null);

  useEffect(() => {
    ignoreScrollFrom.current = null;
  }, [viewMode, selectedRepo]);

  const syncScroll = useCallback((from: "editor" | "viewer", ratio: number) => {
    if (viewMode !== "split") return;
    if (ignoreScrollFrom.current === from) {
      ignoreScrollFrom.current = null;
      return;
    }
    if (from === "editor") {
      const dst = viewerRef.current;
      if (!dst) return;
      const max = dst.scrollHeight - dst.clientHeight;
      if (max <= 0) return;
      const before = dst.scrollTop;
      dst.scrollTop = ratio * max;
      if (dst.scrollTop !== before) ignoreScrollFrom.current = "viewer";
    } else {
      const dst = editorScrollerRef.current;
      if (!dst) return;
      const max = dst.scrollHeight - dst.clientHeight;
      if (max <= 0) return;
      const before = dst.scrollTop;
      dst.scrollTop = ratio * max;
      if (dst.scrollTop !== before) ignoreScrollFrom.current = "editor";
    }
  }, [viewMode]);

  const handleViewerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    if (max > 0) syncScroll("viewer", el.scrollTop / max);
  }, [syncScroll]);

  const handleSelectRepo = useCallback(async (repo: RepoInfo) => {
    watcherUnsubRef.current?.();
    watcherUnsubRef.current = null;
    setIsWatching(false);

    setSelectedRepo(repo);
    setReadme(null);
    setReadmeDraft("");
    setReadmeError("");
    setReadmeSaved(false);
    setReadmeLoading(true);
    try {
      const data = await fetchReadme(repo.full_name);
      setReadme(data);
      setReadmeDraft(data.content);
      setEditorKey((k) => k + 1);
    } catch (e) {
      setReadmeError(e instanceof Error ? e.message : String(e));
    } finally {
      setReadmeLoading(false);
    }
  }, [fetchReadme]);

  useEffect(() => () => { watcherUnsubRef.current?.(); }, []);

  const handleSaveReadme = useCallback(async () => {
    if (!selectedRepo || !readme) return;
    if (readmeDraft === readme.content) return;
    const msg = commitMsg.trim() || "Update README via Obsidian";
    setReadmeSaving(true);
    setReadmeError("");
    setReadmeSaved(false);
    try {
      const newSha = await saveReadme(selectedRepo.full_name, readmeDraft, readme.sha, msg);
      setReadme({ ...readme, content: readmeDraft, sha: newSha || readme.sha });
      setReadmeSaved(true);
      window.setTimeout(() => setReadmeSaved(false), 2000);
    } catch (e) {
      setReadmeError(e instanceof Error ? e.message : String(e));
    } finally {
      setReadmeSaving(false);
    }
  }, [selectedRepo, readme, readmeDraft, commitMsg, saveReadme]);

  const handlePushCommit = useCallback(async () => {
    await handleSaveReadme();
  }, [handleSaveReadme]);

  const handleOpenInObsidian = useCallback(async () => {
    if (!selectedRepo || !readme) return;
    try {
      const vaultPath = await openReadme(selectedRepo.full_name, readmeDraft);
      watcherUnsubRef.current?.();
      watcherUnsubRef.current = watchFile(vaultPath, (newContent) => {
        setReadmeDraft(newContent);
        setEditorKey((k) => k + 1);
      });
      setIsWatching(true);
    } catch (e) {
      setReadmeError(e instanceof Error ? e.message : String(e));
    }
  }, [selectedRepo, readme, openReadme, readmeDraft, watchFile]);

  return {
    editorKey,
    isWatching,
    selectedRepo,
    readme,
    readmeDraft,
    setReadmeDraft,
    readmeLoading,
    readmeError,
    readmeSaving,
    readmeSaved,
    commitMsg,
    setCommitMsg,
    viewMode,
    setViewMode,
    viewerRef,
    editorScrollerRef,
    syncScroll,
    handleViewerScroll,
    handleSelectRepo,
    handlePushCommit,
    handleOpenInObsidian
  };
}
