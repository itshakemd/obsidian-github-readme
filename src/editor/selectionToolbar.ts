import { EditorView, ViewPlugin } from "@codemirror/view";
import { applyFormat, formatActions } from "./selectionFormatting";

export const selectionToolbar = ViewPlugin.fromClass(class {
  readonly view: EditorView;
  readonly toolbar: HTMLDivElement;

  constructor(view: EditorView) {
    this.view = view;
    this.toolbar = document.createElement("div");
    this.toolbar.className = "cm-selection-toolbar";
    this.toolbar.setAttribute("role", "toolbar");
    this.toolbar.setAttribute("aria-label", "Text formatting");

    for (const action of formatActions) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `cm-selection-toolbar-button format-${action.title.toLocaleLowerCase()}`;
      button.textContent = action.label;
      button.title = action.title;
      button.setAttribute("aria-label", action.title);
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();
        applyFormat(this.view, action.marker);
      });
      this.toolbar.appendChild(button);
    }

    this.view.dom.ownerDocument.body.appendChild(this.toolbar);
  }

  destroy(): void {
    this.toolbar.remove();
  }
});
