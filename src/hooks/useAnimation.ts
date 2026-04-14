import { useState, useRef, useCallback, useEffect } from "react";

export function useAnimation({ totalSteps, intervalMs = 600 }: { totalSteps: number; intervalMs?: number }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
  }, []);

  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const reset = useCallback(() => { stop(); setStep(0); }, [stop]);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setStep((s) => { if (s >= totalSteps - 1) { setPlaying(false); return s; } return s + 1; });
      }, intervalMs);
    } else if (timer.current) { clearInterval(timer.current); timer.current = null; }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, intervalMs, totalSteps]);

  useEffect(() => { setStep(0); stop(); }, [totalSteps, stop]);

  return { step, playing, progress: totalSteps > 0 ? (step + 1) / totalSteps : 0, totalSteps, toggle, reset };
}
