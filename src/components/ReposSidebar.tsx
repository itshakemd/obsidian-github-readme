import { useReposSidebar } from "../hooks/useReposSidebar";
import type { RepoInfo, UserProfile } from "../types";
interface Props { getToken: () => string; listRepos: () => Promise<RepoInfo[]>; fetchProfile: () => Promise<UserProfile>; onSelectRepo: (repo: RepoInfo) => void; }
export default function ReposSidebar({ getToken, listRepos, fetchProfile, onSelectRepo }: Props) {
  const { repos, loading, error } = useReposSidebar(getToken, listRepos, fetchProfile);
  return <div className="github-repos-sidebar"><div className="github-repos-sidebar-header"><h4>GitHub Repos</h4></div>{repos.map((repo) => (<button key={repo.id} className="github-repos-item" onClick={() => onSelectRepo(repo)}><span className="github-repos-name">{repo.name}</span></button>))}</div>;
}
