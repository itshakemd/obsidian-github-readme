import { useState } from "react";
import ReposSidebar from "./components/ReposSidebar";
import ConnectCard from "./components/ConnectCard";
import type { RepoInfo } from "./types";
export default function App(props: any) {
  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(null);
  const handleSelectRepo = (repo: RepoInfo) => setSelectedRepo(repo);
  return (
    <div className="github-readme-layout">
      <aside className="github-readme-sidebar"><ReposSidebar {...props} onSelectRepo={handleSelectRepo} selectedFullName={selectedRepo?.full_name ?? null} /></aside>
      <div className="github-readme-main">
        {selectedRepo ? <div>{selectedRepo.full_name}</div> : <ConnectCard openSettings={props.openSettings} />}
      </div>
    </div>
  );
}
