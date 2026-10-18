import { useEffect, useState, type RefObject } from "react";

export function useIsSmallOrPortrait(ref: RefObject<HTMLElement | null>): boolean {
  const [isSmallOrPortrait, setIsSmallOrPortrait] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const mql = window.matchMedia ? window.matchMedia("(max-width: 768px), (orientation: portrait)") : null;
    return mql ? mql.matches : false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = () => {
      let matches = false;
      if (window.matchMedia) {
        matches = window.matchMedia("(max-width: 768px), (orientation: portrait)").matches;
      }
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          if (width <= 768 || height > width) {
            matches = true;
          }
        }
      }
      setIsSmallOrPortrait(matches);
    };

    check();

    const mql = window.matchMedia ? window.matchMedia("(max-width: 768px), (orientation: portrait)") : null;
    const onMqlChange = () => check();
    mql?.addEventListener?.("change", onMqlChange);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && ref.current) {
      ro = new ResizeObserver(() => check());
      ro.observe(ref.current);
    }

    window.addEventListener("resize", check);

    return () => {
      mql?.removeEventListener?.("change", onMqlChange);
      ro?.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [ref]);

  return isSmallOrPortrait;
}
