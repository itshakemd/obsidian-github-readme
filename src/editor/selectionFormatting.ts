export interface FormatAction {
  label: string;
  title: string;
  marker: string;
}

export const formatActions: FormatAction[] = [
  { label: "B", title: "Bold", marker: "**" },
  { label: "I", title: "Italic", marker: "*" },
  { label: "S", title: "Strikethrough", marker: "~~" },
];
import { EditorSelection } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";


export function applyFormat(view: EditorView, marker: string): void {
  const selection = view.state.selection.main;
  if (selection.empty) return;

  const selectedText = view.state.doc.sliceString(selection.from, selection.to);
  const insert = `${marker}${selectedText}${marker}`;
  view.dispatch({
    changes: { from: selection.from, to: selection.to, insert },
    selection: EditorSelection.range(selection.from + marker.length, selection.to + marker.length),
    scrollIntoView: true,
    userEvent: "input.format",
  });
  view.focus();
}
