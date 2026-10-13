"use client";

import { useEffect } from "react";

const SLIDE_MS = 9000;

/**
 * Takes over from the randomly drawn opening slide, then advances the hero slides by rewriting their
 * data-state; CSS does the cross-fade. Renders nothing.
 */
export function HeroSlideCycler({ rootId }: { rootId: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.getElementById(rootId);
    if (!root) return;
    const slides = Array.from(root.querySelectorAll<HTMLElement>(".hero-slide"));
    const n = slides.length;
    if (n < 2) return;
    const show = (cur: number, prev: number | null) =>
      slides.forEach((s, k) => {
        s.dataset.state = k === cur ? "active" : k === prev ? "prev" : k === (cur + 1) % n ? "next" : "";
      });
    let cur = Number(root.dataset.start) || 0;
    show(cur, null);
    root.dataset.live = "";
    const id = setInterval(() => {
      if (document.hidden) return;
      const prev = cur;
      cur = (cur + 1) % n;
      show(cur, prev);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [rootId]);

  return null;
}
