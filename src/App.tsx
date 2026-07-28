import ConnectCard from "./components/ConnectCard";
export default function App({ openSettings }: { openSettings: () => void }) {
  return <div className="github-readme-root"><ConnectCard openSettings={openSettings} /></div>;
}
