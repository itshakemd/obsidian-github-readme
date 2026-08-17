import type { ViewMode } from "../types";
const MODES: { mode: ViewMode; label: string }[] = [{mode:"editor", label:"Editor"}, {mode:"viewer", label:"Viewer"}, {mode:"split", label:"Split"}];
export default function TabHeader({ viewMode, setViewMode }: any) {
  return <div className="github-tab-header"><div className="github-readme-mode-toggle">{MODES.map(({mode,label}) => <button key={mode} className={`github-readme-mode-btn ${viewMode===mode?"active":""}`} onClick={()=>setViewMode(mode)}>{label}</button>)}</div></div>;
}
