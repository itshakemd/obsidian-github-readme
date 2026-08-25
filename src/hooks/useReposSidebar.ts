import { useCallback, useEffect, useMemo, useState } from "react";
import type { RepoInfo, UserProfile } from "../types";

export type Visibility = "all" | "public" | "private";

export function useReposSidebar(
  getToken: () => string,
  listRepos: () => Promise<RepoInfo[]>,
  fetchProfile: () => Promise<UserProfile>
) {
  const [token, setToken] = useState(() => getToken());
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchRepos = useCallback(async () => {
    const t = getToken();
    setToken(t);
    if (!t) {
      setRepos([]);
      setProfile(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await listRepos();
      setRepos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [getToken, listRepos]);

  const fetchUser = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const data = await fetchProfile();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [getToken, fetchProfile]);

  useEffect(() => {
    void fetchRepos();
    void fetchUser();
  }, [fetchRepos, fetchUser]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return repos.filter((r) => {
      if (visibility === "public" && r.private) return false;
      if (visibility === "private" && !r.private) return false;
      if (!q) return true;
      return (
        r.full_name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.language ?? "").toLowerCase().includes(q)
      );
    });
  }, [repos, filter, visibility]);

  return {
    token,
    hasToken: token.length > 0,
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
  };
}
