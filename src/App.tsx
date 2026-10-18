import { useEffect, useRef, useState } from "react";
import "./App.css";
import ReposSidebar from "./components/ReposSidebar";
import TabHeader from "./components/TabHeader";
import ConnectCard from "./components/ConnectCard";
import ReadmeWorkspace from "./components/ReadmeWorkspace";
import { useReadmeEditor } from "./hooks/useReadmeEditor";
import { useIsSmallOrPortrait } from "./hooks/useIsSmallOrPortrait";
import type { ReadmeData, RepoInfo, UserProfile, ViewMode } from "./types";

interface AppProps {
  getToken: () => string;
  saveToken: (token: string) => Promise<void>;
  listRepos: () => Promise<RepoInfo[]>;
  fetchReadme: (fullName: string) => Promise<ReadmeData>;
  saveReadme: (fullName: string, content: string, sha: string | null, message?: string) => Promise<string>;
  openReadme: (fullName: string, content: string) => Promise<string>;
  watchFile: (vaultPath: string, onChange: (content: string) => void) => () => void;
  fetchProfile: () => Promise<UserProfile>;
  openSettings: () => void;
  defaultViewMode: ViewMode;
  showLineNumbers: boolean;
  inlineSuggestions: boolean;
  showSelectionToolbar: boolean;
  renderMarkdown: (markdown: string, el: HTMLElement) => Promise<() => void>;
}

export default function App({
  getToken,
  listRepos,
  fetchReadme,
  saveReadme,
  fetchProfile,
  openSettings,
  openReadme,
  watchFile,
  defaultViewMode,
  showLineNumbers,
  inlineSuggestions,
  showSelectionToolbar,
  renderMarkdown,
}: AppProps) {
  const hasToken = getToken().length > 0;
  const layoutRef = useRef<HTMLDivElement>(null);
  const isSmallOrPortrait = useIsSmallOrPortrait(layoutRef);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reposModalOpen, setReposModalOpen] = useState(false);

  // Close repos modal on Escape key
  useEffect(() => {
    if (!isSmallOrPortrait || !reposModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReposModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSmallOrPortrait, reposModalOpen]);

  // Reset modal state when switching back to desktop landscape
  useEffect(() => {
    if (!isSmallOrPortrait) {
      setReposModalOpen(false);
    }
  }, [isSmallOrPortrait]);

  const handleToggleRepos = () => {
    if (isSmallOrPortrait) {
      setReposModalOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  const {
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
    handleSelectRepo,
    handlePushCommit,
    handleOpenInObsidian,
  } = useReadmeEditor(defaultViewMode, fetchReadme, saveReadme, openReadme, watchFile);

  return (
    <div
      ref={layoutRef}
      className={`github-readme-layout ${isSmallOrPortrait ? "is-small-or-portrait" : ""}`}
    >
      {/* Backdrop for small or portrait bottom modal */}
      {isSmallOrPortrait && (
        <div
          className={`github-readme-modal-backdrop ${reposModalOpen ? "visible" : ""}`}
          onClick={() => setReposModalOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`github-readme-sidebar ${
          isSmallOrPortrait
            ? `modal-mode ${reposModalOpen ? "modal-open" : "modal-closed"}`
            : sidebarOpen
            ? ""
            : "collapsed"
        }`}
        aria-hidden={isSmallOrPortrait ? !reposModalOpen : !sidebarOpen}
      >
        <ReposSidebar
          getToken={getToken}
          listRepos={listRepos}
          fetchProfile={fetchProfile}
          onOpenSettings={() => {
            if (isSmallOrPortrait) setReposModalOpen(false);
            openSettings();
          }}
          onSelectRepo={(repo) => {
            if (isSmallOrPortrait) setReposModalOpen(false);
            void handleSelectRepo(repo);
          }}
          selectedFullName={selectedRepo?.full_name ?? null}
          openingFullName={readmeLoading ? selectedRepo?.full_name ?? null : null}
          onClose={isSmallOrPortrait ? () => setReposModalOpen(false) : undefined}
        />
      </aside>

      <div className="github-readme-main">
        <TabHeader
          commitMsg={commitMsg}
          setCommitMsg={setCommitMsg}
          handlePushCommit={handlePushCommit}
          selectedRepo={!!selectedRepo}
          hasReadme={!!readme}
          hasDraftChanges={readmeDraft !== readme?.content}
          readmeSaving={readmeSaving}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isWatching={isWatching}
          handleOpenInObsidian={handleOpenInObsidian}
          repoFullName={selectedRepo?.full_name ?? null}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className={`github-readme-root ${selectedRepo ? "fill" : ""}`}>
          <ReadmeWorkspace
            selectedRepo={selectedRepo}
            readmeLoading={readmeLoading}
            readmeError={readmeError}
            readme={readme}
            readmeDraft={readmeDraft}
            setReadmeDraft={setReadmeDraft}
            viewMode={viewMode}
            editorKey={editorKey}
            viewerRef={viewerRef}
            showLineNumbers={showLineNumbers}
            inlineSuggestions={inlineSuggestions}
            showSelectionToolbar={showSelectionToolbar}
            renderMarkdown={renderMarkdown}
            readmeSaved={readmeSaved}
          />

          {!hasToken && <ConnectCard openSettings={openSettings} />}

          {!selectedRepo && hasToken && (
            <div className="github-readme-empty">
              <div className="github-readme-empty-title">GitHub README</div>
              {isSmallOrPortrait && (
                <button
                  type="button"
                  className="mod-cta github-readme-empty-btn"
                  onClick={() => setReposModalOpen(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                  Select Repository
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
