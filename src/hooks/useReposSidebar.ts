import { useCallback, useEffect, useState } from "react";
import type { RepoInfo, UserProfile } from "../types";
export type Visibility = "all" | "public" | "private";
export function useReposSidebar(getToken: () => string, listRepos: () => Promise<RepoInfo[]>, fetchProfile: () => Promise<UserProfile>) {
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchRepos = useCallback(async () => {
    const t = getToken();
    if (!t) { setRepos([]); return; }
    setLoading(true);
    try { const data = await listRepos(); setRepos(data); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setLoading(false); }
  }, [getToken, listRepos]);
  useEffect(() => { void fetchRepos(); }, [fetchRepos]);
  return { repos, loading, error, fetchRepos };
}
