import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { WaveformLoader } from "@/components/ui/waveform-loader";

const FIRST_LOAD_MIN_MS = 800;
const ROUTE_CHANGE_MIN_MS = 600;
const FADE_MS = 400;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SiteLoadingOverlay() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [phase, setPhase] = useState<"visible" | "hiding" | "gone">("visible");
  const firstLoadDone = useRef(false);
  const isFirstPath = useRef(true);
  const hideTimer = useRef<number | undefined>(undefined);
  const unmountTimer = useRef<number | undefined>(undefined);

  const clearTimers = () => {
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(unmountTimer.current);
  };

  const dismiss = (delayMs: number) => {
    clearTimers();
    hideTimer.current = window.setTimeout(() => {
      setPhase("hiding");
      unmountTimer.current = window.setTimeout(() => {
        setPhase("gone");
        firstLoadDone.current = true;
      }, FADE_MS);
    }, delayMs);
  };

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPhase("gone");
      firstLoadDone.current = true;
      return;
    }

    const startedAt = Date.now();
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      dismiss(Math.max(0, FIRST_LOAD_MIN_MS - (Date.now() - startedAt)));
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", finish);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    if (!firstLoadDone.current || prefersReducedMotion()) return;

    setPhase("visible");
    dismiss(ROUTE_CHANGE_MIN_MS);

    return () => {
      clearTimers();
    };
  }, [pathname]);

  if (phase === "gone") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity ease-out ${
        phase === "hiding" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-busy={phase === "visible"}
      aria-hidden={phase === "hiding"}
    >
      <WaveformLoader />
      <p className="mt-6 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        The Visionary Frame
      </p>
    </div>
  );
}
