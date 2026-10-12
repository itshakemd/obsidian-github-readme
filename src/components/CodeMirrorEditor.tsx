import { useEffect, useRef } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { EditorState, Compartment, StateEffect } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import {
  createLocalInlineSuggestion,
  inlineSuggestionExtension,
  showInlineSuggestion,
} from "../editor/inlineSuggestions";
import { selectionToolbar } from "../editor/selectionToolbar";

const obsidianHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, color: "var(--text-accent, #7c3aed)", fontWeight: "700" },
  { tag: tags.strong, color: "var(--code-important, #d97706)", fontWeight: "700" },
  { tag: tags.emphasis, color: "var(--code-function, #2563eb)", fontStyle: "italic" },
  { tag: [tags.link, tags.url], color: "var(--link-color, #3b82f6)" },
  { tag: tags.comment, color: "var(--code-comment, #6b7280)" },
  { tag: [tags.keyword, tags.operatorKeyword], color: "var(--code-keyword, #c026d3)" },
  { tag: [tags.string, tags.regexp], color: "var(--code-string, #15803d)" },
  { tag: [tags.number, tags.bool, tags.atom], color: "var(--code-value, #b45309)" },
  { tag: [tags.typeName, tags.className, tags.propertyName], color: "var(--code-property, #0f766e)" },
  { tag: [tags.variableName, tags.function(tags.variableName)], color: "var(--code-function, #2563eb)" },
  { tag: tags.punctuation, color: "var(--code-punctuation, var(--text-muted, #6b7280))" },
  { tag: tags.invalid, color: "var(--text-error, #dc2626)" },
]);

interface Props {
  value: string;
  onChange: (v: string) => void;
  onScroll?: (ratio: number) => void;
  scrollerRef?: React.RefObject<HTMLElement | null>;
  showLineNumbers?: boolean;
  inlineSuggestions?: boolean;
  showSelectionToolbar?: boolean;
  className?: string;
}

export default function CodeMirrorEditor({ value, onChange, onScroll, scrollerRef, showLineNumbers = true, inlineSuggestions = true, showSelectionToolbar = true, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onScrollRef = useRef(onScroll);
  const lineNumbersCompartment = useRef(new Compartment());
  const selectionToolbarCompartment = useRef(new Compartment());
  const inlineSuggestionsRef = useRef(inlineSuggestions);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onScrollRef.current = onScroll;
  }, [onScroll]);

  useEffect(() => {
    inlineSuggestionsRef.current = inlineSuggestions;
  }, [inlineSuggestions]);

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          markdown(),
          syntaxHighlighting(obsidianHighlightStyle),
          inlineSuggestionExtension,
          selectionToolbarCompartment.current.of(showSelectionToolbar ? selectionToolbar : []),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          lineNumbersCompartment.current.of(showLineNumbers ? [lineNumbers(), highlightActiveLineGutter()] : []),
          highlightActiveLine(),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
          EditorView.domEventHandlers({
            scroll(_e, v) {
              const el = v.scrollDOM;
              const max = el.scrollHeight - el.clientHeight;
              if (max > 0) onScrollRef.current?.(el.scrollTop / max);
            },
          }),
          EditorView.theme({
            "&": {
              height: "100%",
              fontSize: "var(--font-text-size, 14px)",
              fontFamily: "var(--font-monospace)",
              backgroundColor: "var(--background-primary)",
              color: "var(--text-normal)",
            },
            ".cm-content": {
              caretColor: "var(--text-accent)",
              padding: "8px 0",
            },
            ".cm-gutters": {
              backgroundColor: "var(--background-secondary)",
              color: "var(--text-muted)",
              borderRight: "1px solid var(--background-modifier-border)",
            },
            ".cm-activeLineGutter": {
              backgroundColor: "var(--background-modifier-hover)",
            },
            ".cm-activeLine": {
              backgroundColor: "var(--background-modifier-hover)",
            },
            ".cm-selectionBackground, ::selection": {
              backgroundColor: "var(--text-selection)",
            },
            ".cm-cursor": {
              borderLeftColor: "var(--text-accent)",
            },
            ".cm-scroller": {
              overflow: "auto",
              fontFamily: "inherit",
            },
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    let suggestionTimer: number | null = null;
    const scheduleSuggestion = EditorView.updateListener.of((update) => {
      if (!update.docChanged && !update.selectionSet && !update.focusChanged) return;
      if (suggestionTimer !== null) window.clearTimeout(suggestionTimer);
      showInlineSuggestion(update.view, null);
      if (!inlineSuggestionsRef.current || !update.view.hasFocus) return;
      suggestionTimer = window.setTimeout(() => {
        suggestionTimer = null;
        if (!inlineSuggestionsRef.current || !update.view.hasFocus) return;
        showInlineSuggestion(update.view, createLocalInlineSuggestion(update.view.state));
      }, 180);
    });
    view.dispatch({ effects: StateEffect.appendConfig.of(scheduleSuggestion) });

    if (scrollerRef) scrollerRef.current = view.scrollDOM;

    return () => {
      if (suggestionTimer !== null) window.clearTimeout(suggestionTimer);
      view.destroy();
      viewRef.current = null;
      if (scrollerRef) scrollerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: lineNumbersCompartment.current.reconfigure(showLineNumbers ? [lineNumbers(), highlightActiveLineGutter()] : [])
      });
    }
  }, [showLineNumbers]);

  useEffect(() => {
    if (!inlineSuggestions && viewRef.current) showInlineSuggestion(viewRef.current, null);
  }, [inlineSuggestions]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: selectionToolbarCompartment.current.reconfigure(showSelectionToolbar ? selectionToolbar : []),
    });
  }, [showSelectionToolbar]);

  return <div ref={containerRef} className={`github-readme-cm-editor${className ? ` ${className}` : ""}`} />;
}
