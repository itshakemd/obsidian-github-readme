import { useEffect, useState } from "react";
import "./App.css";
import ReposSidebar from "./components/ReposSidebar";
import TabHeader from "./components/TabHeader";
import ConnectCard from "./components/ConnectCard";
import ReadmeWorkspace from "./components/ReadmeWorkspace";
import { useReadmeEditor } from "./hooks/useReadmeEditor";
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
  renderMarkdown,
}: AppProps) {
  const [hasToken, setHasToken] = useState(() => getToken().length > 0);

  useEffect(() => {
    setHasToken(getToken().length > 0);
  }, [getToken]);

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
    editorScrollerRef,
    syncScroll,
    handleViewerScroll,
    handleSelectRepo,
    handlePushCommit,
    handleOpenInObsidian,
  } = useReadmeEditor(defaultViewMode, fetchReadme, saveReadme, openReadme, watchFile);

  return (
    <div className="github-readme-layout">
      <aside className="github-readme-sidebar">
        <ReposSidebar
          getToken={getToken}
          listRepos={listRepos}
          fetchProfile={fetchProfile}
          onOpenSettings={openSettings}
          onSelectRepo={handleSelectRepo}
          selectedFullName={selectedRepo?.full_name ?? null}
          openingFullName={readmeLoading ? selectedRepo?.full_name ?? null : null}
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
            syncScroll={syncScroll}
            editorScrollerRef={editorScrollerRef}
            viewerRef={viewerRef}
            handleViewerScroll={handleViewerScroll}
            renderMarkdown={renderMarkdown}
            readmeSaved={readmeSaved}
          />

          {!hasToken && <ConnectCard openSettings={openSettings} />}

          {!selectedRepo && hasToken && (
            <div className="github-readme-empty">GitHub readme</div>
          )}
        </div>
      </div>
    </div>
  );
}