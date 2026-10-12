import { EditorView, ViewPlugin } from "@codemirror/view";
import { applyFormat, formatActions } from "./selectionFormatting";

export const selectionToolbar = ViewPlugin.fromClass(class {
  readonly view: EditorView;
  readonly toolbar: HTMLDivElement;
  readonly handleScroll: () => void;
  readonly handleSelection: () => void;

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
    this.handleScroll = () => this.position();
    this.handleSelection = () => {
      this.view.dom.ownerDocument.defaultView?.requestAnimationFrame(() => this.position());
    };
    this.view.scrollDOM.addEventListener("scroll", this.handleScroll);
    this.view.dom.addEventListener("mouseup", this.handleSelection);
    this.view.dom.addEventListener("keyup", this.handleSelection);
    window.addEventListener("resize", this.handleScroll);
    this.handleSelection();
  }

  update(): void {
    this.handleSelection();
  }

  position(): void {
    const selection = this.view.state.selection.main;
    if (selection.empty) {
      this.toolbar.classList.remove("visible");
      return;
    }

    const start = this.view.coordsAtPos(selection.from);
    const end = this.view.coordsAtPos(selection.to);
    if (!start || !end) {
      this.toolbar.classList.remove("visible");
      return;
    }

    this.toolbar.classList.add("visible");
    const bounds = this.toolbar.getBoundingClientRect();
    const center = (start.left + end.right) / 2;
    const left = Math.max(8, Math.min(window.innerWidth - bounds.width - 8, center - bounds.width / 2));
    const above = Math.min(start.top, end.top) - bounds.height - 8;
    const top = above >= 8 ? above : Math.max(start.bottom, end.bottom) + 8;
    this.toolbar.style.left = `${left}px`;
    this.toolbar.style.top = `${top}px`;
  }

  destroy(): void {
    this.view.scrollDOM.removeEventListener("scroll", this.handleScroll);
    this.view.dom.removeEventListener("mouseup", this.handleSelection);
    this.view.dom.removeEventListener("keyup", this.handleSelection);
    window.removeEventListener("resize", this.handleScroll);
    this.toolbar.remove();
  }
});
