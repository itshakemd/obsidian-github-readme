import { useReposSidebar } from "../hooks/useReposSidebar";
import type { RepoInfo, UserProfile } from "../types";
interface Props { getToken: () => string; listRepos: () => Promise<RepoInfo[]>; fetchProfile: () => Promise<UserProfile>; onSelectRepo: (repo: RepoInfo) => void; }
export default function ReposSidebar({ getToken, listRepos, fetchProfile, onSelectRepo }: Props) {
  const { repos, loading, error } = useReposSidebar(getToken, listRepos, fetchProfile);
  return <div className="github-repos-sidebar">{repos.map(r => <div key={r.id}>{r.name}</div>)}</div>;
}
