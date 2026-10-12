import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RepoInfo, UserProfile } from "../types";

export type Visibility = "all" | "public" | "private";

export function useReposSidebar(
  getToken: () => string,
  listRepos: () => Promise<RepoInfo[]>,
  fetchProfile: () => Promise<UserProfile>
) {
  const currentToken = getToken();
  const [token, setToken] = useState(currentToken);
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const getTokenRef = useRef(getToken);
  const listReposRef = useRef(listRepos);
  const fetchProfileRef = useRef(fetchProfile);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    listReposRef.current = listRepos;
  }, [listRepos]);

  useEffect(() => {
    fetchProfileRef.current = fetchProfile;
  }, [fetchProfile]);

  const fetchRepos = useCallback(async () => {
    const t = getTokenRef.current();
    setToken(t);
    if (!t) {
      setRepos([]);
      setProfile(null);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await listReposRef.current();
      setRepos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const t = getTokenRef.current();
    if (!t) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const data = await fetchProfileRef.current();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastTokenRef.current === currentToken) {
      return;
    }
    lastTokenRef.current = currentToken;
    setToken(currentToken);
    void fetchRepos();
    void fetchUser();
  }, [currentToken, fetchRepos, fetchUser]);

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
