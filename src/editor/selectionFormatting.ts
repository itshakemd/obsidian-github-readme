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

  const markerLength = marker.length;
  const selectedText = view.state.doc.sliceString(selection.from, selection.to);
  const prefixStart = selection.from - markerLength;
  const suffixEnd = selection.to + markerLength;
  let markersBefore = 0;
  let markersAfter = 0;
  while (selection.from - markersBefore - 1 >= 0
    && view.state.doc.sliceString(selection.from - markersBefore - 1, selection.from - markersBefore) === marker[0]) {
    markersBefore += 1;
  }
  while (selection.to + markersAfter < view.state.doc.length
    && view.state.doc.sliceString(selection.to + markersAfter, selection.to + markersAfter + 1) === marker[0]) {
    markersAfter += 1;
  }
  const surroundingCount = Math.min(markersBefore, markersAfter);
  const hasOuterMarkers = marker === "*"
    ? surroundingCount % 2 === 1
    : surroundingCount >= markerLength;

  if (hasOuterMarkers) {
    view.dispatch({
      changes: [
        { from: prefixStart, to: selection.from },
        { from: selection.to, to: suffixEnd },
      ],
      selection: EditorSelection.range(prefixStart, selection.to - markerLength),
      scrollIntoView: true,
      userEvent: "input.format",
    });
    view.focus();
    return;
  }

  if (selectedText.length >= markerLength * 2
    && selectedText.startsWith(marker)
    && selectedText.endsWith(marker)) {
    const innerText = selectedText.slice(markerLength, -markerLength);
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: innerText },
      selection: EditorSelection.range(selection.from, selection.from + innerText.length),
      scrollIntoView: true,
      userEvent: "input.format",
    });
    view.focus();
    return;
  }

  const insert = `${marker}${selectedText}${marker}`;
  view.dispatch({
    changes: { from: selection.from, to: selection.to, insert },
    selection: EditorSelection.range(selection.from + markerLength, selection.to + markerLength),
    scrollIntoView: true,
    userEvent: "input.format",
  });
  view.focus();
}
