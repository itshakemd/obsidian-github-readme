import ReposSidebar from "./components/ReposSidebar";
import ConnectCard from "./components/ConnectCard";
export default function App(props: any) {
  return (
    <div className="github-readme-layout">
      <aside className="github-readme-sidebar"><ReposSidebar {...props} onSelectRepo={() => {}} /></aside>
      <div className="github-readme-main"><ConnectCard openSettings={props.openSettings} /></div>
    </div>
  );
}
