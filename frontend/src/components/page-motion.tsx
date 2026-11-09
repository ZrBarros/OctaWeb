"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import styles from "@/app/template.module.css";

const revealSelector = [
  "main section",
  "main article",
  "main aside",
  "main form",
  "main table",
  "main [data-reveal]",
].join(",");

function revealCandidates(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(revealSelector)).filter((element) => {
    if (element.closest('[role="dialog"], [aria-modal="true"]')) return false;
    if (element.hidden || element.getAttribute("aria-hidden") === "true") return false;

    return !Array.from(element.querySelectorAll<HTMLElement>(revealSelector)).some(
      (child) => child !== element && !child.closest('[role="dialog"], [aria-modal="true"]'),
    );
  });
}

export function PageMotion({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observed = new WeakSet<HTMLElement>();
    let observer: IntersectionObserver | null = null;

    const show = (element: HTMLElement) => {
      element.dataset.scrollReveal = "visible";
      observer?.unobserve(element);
    };

    if (!reducedMotion && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) show(entry.target as HTMLElement);
          });
        },
        { rootMargin: "0px 0px -9%", threshold: 0.08 },
      );
    }

    const prepare = () => {
      revealCandidates(root).forEach((element, index) => {
        if (observed.has(element)) return;
        observed.add(element);

        if (reducedMotion || !observer) {
          show(element);
          return;
        }

        const bounds = element.getBoundingClientRect();
        const startsInView = bounds.top < window.innerHeight * 0.88 && bounds.bottom > 0;

        if (startsInView) {
          show(element);
          return;
        }

        element.style.setProperty("--reveal-order", String(index % 4));
        element.dataset.scrollReveal = "pending";
        observer.observe(element);
      });
    };

    prepare();

    const mutations = new MutationObserver(prepare);
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [pathname]);

  return (
    <div className={styles.motionRoot} key={pathname} ref={rootRef}>
      {children}
    </div>
  );
}
