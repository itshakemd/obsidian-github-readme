import type { ViewMode } from "../types";

const MODES: { mode: ViewMode; label: string }[] = [
  { mode: "editor", label: "Editor" },
  { mode: "viewer", label: "Viewer" },
  { mode: "split", label: "Split" },
];

function ModeIcon({ mode }: { mode: ViewMode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {mode === "editor" && (
        <>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </>
      )}
      {mode === "viewer" && (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {mode === "split" && (
        <>
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M12 3v18" />
        </>
      )}
    </svg>
  );
}

interface Props {
  commitMsg: string;
  setCommitMsg: (msg: string) => void;
  handlePushCommit: () => Promise<void>;
  selectedRepo: boolean;
  hasReadme: boolean;
  hasDraftChanges: boolean;
  readmeSaving: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isWatching: boolean;
  handleOpenInObsidian: () => Promise<void>;
  repoFullName: string | null;
}

export default function TabHeader({
  commitMsg,
  setCommitMsg,
  handlePushCommit,
  selectedRepo,
  hasReadme,
  hasDraftChanges,
  readmeSaving,
  viewMode,
  setViewMode,
  isWatching,
  handleOpenInObsidian,
  repoFullName,
}: Props) {
  return (
    <div className="github-tab-header">
      <div className="github-commit-group">
        <input
          className="github-commit-input"
          type="text"
          placeholder="Commit message — e.g., Update README"
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          aria-label="Commit message"
        />
        <button
          className="mod-cta github-push-btn"
          onClick={() => void handlePushCommit()}
          disabled={!selectedRepo || !hasReadme || !hasDraftChanges || readmeSaving || !commitMsg.trim()}
          type="button"
          title={repoFullName ? `Push to ${repoFullName}` : "Select a repo first"}
        >
          {readmeSaving ? "Pushing…" : "Push commit"}
        </button>
      </div>
      <div className="github-readme-mode-toggle" role="group" aria-label="README view mode">
        {MODES.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            className={`github-readme-mode-btn ${viewMode === mode ? "active" : ""}`}
            aria-label={label}
            aria-pressed={viewMode === mode}
            data-tooltip-position="bottom"
            onClick={() => setViewMode(mode)}
            disabled={!selectedRepo}
          >
            <ModeIcon mode={mode} />
          </button>
        ))}
      </div>
      <button
        type="button"
        className="github-readme-open-btn"
        aria-label={isWatching ? "Syncing with Obsidian tab" : "Open in Obsidian tab"}
        title={isWatching ? "Live-syncing with Obsidian tab — edits there will appear here" : "Open in Obsidian tab"}
        data-tooltip-position="bottom"
        onClick={() => void handleOpenInObsidian()}
        disabled={!selectedRepo || !hasReadme}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      </button>
    </div>
  );
}
