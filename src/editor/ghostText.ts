import { StateEffect, StateField } from "@codemirror/state";
import type { EditorState } from "@codemirror/state";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";

export interface GhostText {
  pos: number;
  text: string;
}

export const setGhostText = StateEffect.define<GhostText | null>();

class GhostTextWidget extends WidgetType {
  readonly text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  eq(other: GhostTextWidget): boolean {
    return other.text === this.text;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "cm-inline-suggestion";
    span.setAttribute("aria-hidden", "true");
    span.textContent = this.text;
    return span;
  }

  ignoreEvent(): boolean {
    return true;
  }
}

export const ghostTextField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, transaction) {
    let next = value.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (!effect.is(setGhostText)) continue;
      next = effect.value
        ? Decoration.set([
            Decoration.widget({
              widget: new GhostTextWidget(effect.value.text),
              side: 1,
            }).range(effect.value.pos),
          ])
        : Decoration.none;
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export function currentGhostText(state: EditorState): GhostText | null {
  const range = state.field(ghostTextField, false)?.iter();
  if (!range || !range.value) return null;
  const widget = range.value.spec.widget;
  return widget instanceof GhostTextWidget ? { pos: range.from, text: widget.text } : null;
}

export function showInlineSuggestion(view: EditorView, text: string | null): void {
  const selection = view.state.selection.main;
  view.dispatch({ effects: setGhostText.of(text ? { pos: selection.head, text } : null) });
}
