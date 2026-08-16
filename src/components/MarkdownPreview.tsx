import { useEffect, useRef } from "react";

interface Props {
  source: string;
  renderMarkdown: (markdown: string, el: HTMLElement) => Promise<() => void>;
}

export default function MarkdownPreview({ source, renderMarkdown }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const timer = window.setTimeout(async () => {
      const next = document.createElement("div");
      const dispose = await renderMarkdown(source, next);
      if (cancelled) {
        dispose();
        return;
      }
      cleanup = dispose;
      el.replaceChildren(...Array.from(next.childNodes));
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cleanup?.();
    };
  }, [source, renderMarkdown]);

  return <div ref={ref} className="github-readme-markdown markdown-preview-view markdown-rendered" />;
}