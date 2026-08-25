import { useEffect, useRef, useState } from "react";
import "../App.css";
import { useReposSidebar, type Visibility } from "../hooks/useReposSidebar";
import type { RepoInfo, UserProfile } from "../types";

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: "all", label: "All repos" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

function VisibilityIcon({ visibility }: { visibility: Visibility }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {visibility === "all" && <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />}
      {visibility === "public" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </>
      )}
      {visibility === "private" && (
        <>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      )}
    </svg>
  );
}

interface Props {
  getToken: () => string;
  listRepos: () => Promise<RepoInfo[]>;
  fetchProfile: () => Promise<UserProfile>;
  onOpenSettings: () => void;
  onSelectRepo: (repo: RepoInfo) => void;
  selectedFullName?: string | null;
  openingFullName?: string | null;
}

export default function ReposSidebar({
  getToken,
  listRepos,
  fetchProfile,
  onOpenSettings,
  onSelectRepo,
  selectedFullName,
  openingFullName,
}: Props) {
  const {
    hasToken,
    repos,
    filtered,
    loading,
    error,
    filter,
    setFilter,
    visibility,
    setVisibility,
    profile,
    profileLoading,
    fetchRepos,
  } = useReposSidebar(getToken, listRepos, fetchProfile);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const doc = menuRef.current?.ownerDocument ?? document;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    doc.addEventListener("mousedown", onDown);
    doc.addEventListener("keydown", onKey);
    return () => {
      doc.removeEventListener("mousedown", onDown);
      doc.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (!hasToken) {
    return (
      <div className="github-repos-sidebar empty">
        <div className="github-repos-sidebar-header">
          <h4>GitHub Repos</h4>
        </div>
        <div className="github-repos-waiting">Waiting for you to connect…</div>
      </div>
    );
  }

  return (
    <div className="github-repos-sidebar">
      <div className="github-repos-sidebar-header">
        <h4>GitHub Repos</h4>
        <button onClick={() => void fetchRepos()} disabled={loading} type="button" className="github-repos-refresh" title="Refresh repos">
          {loading ? "…" : "↻"}
        </button>
      </div>

      <div className="github-repos-filter">
        <div className="github-repos-filter-group">
          <input
            type="text"
            placeholder="Filter…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="github-repos-filter-input"
          />
          <span className="github-repos-count">{filtered.length}/{repos.length}</span>
          <div className="github-repos-visibility-wrap" ref={menuRef}>
            <button
              type="button"
              className={`github-repos-visibility ${visibility !== "all" ? "active" : ""}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={`Show: ${VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.label ?? ""}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              data-tooltip-position="bottom"
            >
              <VisibilityIcon visibility={visibility} />
              <svg className="github-repos-visibility-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {menuOpen && (
              <div className="github-repos-visibility-menu" role="menu">
                {VISIBILITY_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={visibility === o.value}
                    className={`github-repos-visibility-option ${visibility === o.value ? "selected" : ""}`}
                    onClick={() => {
                      setVisibility(o.value);
                      setMenuOpen(false);
                    }}
                  >
                    <VisibilityIcon visibility={o.value} />
                    <span>{o.label}</span>
                    {visibility === o.value && (
                      <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="github-readme-loading" role="status" aria-label="Loading repositories">
          <span className="github-spinner" />
        </div>
      )}
      {error && <div className="github-readme-error" role="alert">{error}</div>}

      {!loading && !error && filtered.length === 0 && repos.length > 0 && (
        <div className="github-readme-muted">{filter.trim() ? `No match for “${filter}”.` : `No ${visibility} repositories.`}</div>
      )}
      {!loading && !error && repos.length === 0 && (
        <div className="github-readme-muted">No repositories found.</div>
      )}

      <div className="github-repos-list">
        {filtered.map((repo) => (
          <button
            key={repo.id}
            className={`github-repos-item ${selectedFullName === repo.full_name ? "active" : ""}`}
            onClick={() => onSelectRepo(repo)}
            disabled={openingFullName === repo.full_name}
            title={repo.full_name}
            type="button"
          >
            <div className="github-repos-item-top">
              <span className="github-repos-name">{repo.name}</span>
              {repo.private && <span className="github-repos-private">private</span>}
              {openingFullName === repo.full_name && (
                <span className="github-spinner small" role="status" aria-label="Loading README" />
              )}
            </div>
            {repo.description && <div className="github-repos-desc">{repo.description}</div>}
            {(repo.language || (profile && repo.full_name.split("/")[0] !== profile.login)) && (
              <div className="github-repos-meta">
                {repo.language && <span>{repo.language}</span>}
                {profile && repo.full_name.split("/")[0] !== profile.login && (
                  <span>{repo.full_name.split("/")[0]}</span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="github-profile-card">
        {profile ? (
          <div className="github-profile-info">
            <img src={profile.avatar_url} alt={profile.login} className="github-profile-avatar" />
            <div className="github-profile-text">
              <div className="github-profile-name">{profile.name ?? profile.login}</div>
            </div>
          </div>
        ) : (
          <div className="github-profile-info">
            <div className="github-profile-avatar placeholder" />
            <div className="github-profile-text">
              <div className="github-profile-name">{profileLoading ? "Loading…" : hasToken ? "GitHub User" : "Not connected"}</div>
              <div className="github-profile-login">{hasToken ? "Token saved" : "Connect token"}</div>
            </div>
          </div>
        )}
        <button className="github-profile-settings-btn" onClick={onOpenSettings} type="button" title="Open settings" aria-label="Open settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}