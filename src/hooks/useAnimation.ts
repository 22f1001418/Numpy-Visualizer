import { useState, useRef, useCallback, useEffect } from "react";
import { useStore } from "../store/useStore";

interface AnimOpts {
  totalSteps: number;
  baseMs?: number; // base interval before speed multiplier
}

export function useAnimation({ totalSteps, baseMs = 500 }: AnimOpts) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const speed = useStore((s) => s.speed);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalMs = baseMs / speed;

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const next = useCallback(() => { stop(); setStep((s) => Math.min(s + 1, totalSteps - 1)); }, [totalSteps, stop]);
  const prev = useCallback(() => { stop(); setStep((s) => Math.max(s - 1, 0)); }, [stop]);
  const reset = useCallback(() => { stop(); setStep(0); }, [stop]);
  const goEnd = useCallback(() => { stop(); setStep(totalSteps - 1); }, [totalSteps, stop]);

  // Auto-advance
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep((s) => { if (s >= totalSteps - 1) { setPlaying(false); return s; } return s + 1; });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current); timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, intervalMs, totalSteps]);

  // Reset on totalSteps change
  useEffect(() => { setStep(0); stop(); }, [totalSteps, stop]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); toggle(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Home") { e.preventDefault(); reset(); }
      if (e.key === "End") { e.preventDefault(); goEnd(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle, next, prev, reset, goEnd]);

  return {
    step, playing, progress: totalSteps > 0 ? (step + 1) / totalSteps : 0,
    totalSteps, toggle, next, prev, reset, goEnd, setStep,
  };
}
