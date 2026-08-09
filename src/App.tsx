import { useState } from "react";
import ReposSidebar from "./components/ReposSidebar";
import ConnectCard from "./components/ConnectCard";
import ReadmeWorkspace from "./components/ReadmeWorkspace";
import type { RepoInfo, ReadmeData } from "./types";
export default function App(props: any) {
  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(null);
  const [readme, setReadme] = useState<ReadmeData | null>(null);
  const handleSelectRepo = async (repo: RepoInfo) => {
    setSelectedRepo(repo);
    const data = await props.fetchReadme(repo.full_name);
    setReadme(data);
  };
  return (
    <div className="github-readme-layout">
      <aside className="github-readme-sidebar"><ReposSidebar {...props} onSelectRepo={handleSelectRepo} selectedFullName={selectedRepo?.full_name ?? null} /></aside>
      <div className="github-readme-main">
        <ReadmeWorkspace selectedRepo={selectedRepo} readme={readme} />
        {!selectedRepo && <ConnectCard openSettings={props.openSettings} />}
      </div>
    </div>
  );
}
