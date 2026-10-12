import { EditorSelection } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { currentGhostText, ghostTextField, setGhostText, showInlineSuggestion } from "./ghostText";

export { createLocalInlineSuggestion } from "./inlineSuggestionSource";
export { showInlineSuggestion };

export const inlineSuggestionExtension = [
  ghostTextField,
  keymap.of([
    {
      key: "Tab",
      run(view) {
        const suggestion = currentGhostText(view.state);
        if (!suggestion) return false;
        view.dispatch({
          changes: { from: suggestion.pos, insert: suggestion.text },
          selection: EditorSelection.cursor(suggestion.pos + suggestion.text.length),
          effects: setGhostText.of(null),
          scrollIntoView: true,
          userEvent: "input.complete",
        });
        return true;
      },
    },
    {
      key: "Escape",
      run(view) {
        if (!currentGhostText(view.state)) return false;
        view.dispatch({ effects: setGhostText.of(null) });
        return true;
      },
    },
  ]),
];
