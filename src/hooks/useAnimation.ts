import { useState, useRef, useCallback, useEffect } from "react";

interface AnimationOpts {
  totalSteps: number;
  intervalMs?: number;
}

export function useAnimation({ totalSteps, intervalMs = 500 }: AnimationOpts) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const play = useCallback(() => {
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const next = useCallback(() => {
    stop();
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps, stop]);

  const prev = useCallback(() => {
    stop();
    setStep((s) => Math.max(s - 1, 0));
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setStep(0);
  }, [stop]);

  const goEnd = useCallback(() => {
    stop();
    setStep(totalSteps - 1);
  }, [totalSteps, stop]);

  // Auto-advance timer
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= totalSteps - 1) {
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, intervalMs, totalSteps]);

  // Reset step when totalSteps changes
  useEffect(() => { setStep(0); stop(); }, [totalSteps, stop]);

  const progress = totalSteps > 0 ? (step + 1) / totalSteps : 0;

  return {
    step, playing, progress, totalSteps,
    play, stop, toggle, next, prev, reset, goEnd,
    setStep,
  };
}
