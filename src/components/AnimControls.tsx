import { motion } from "framer-motion";
import { SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward, Gauge } from "lucide-react";
import { useStore } from "../store/useStore";

interface Props {
  step: number; totalSteps: number; playing: boolean; progress: number;
  onToggle: () => void; onPrev: () => void; onNext: () => void;
  onReset: () => void; onEnd: () => void; label?: string;
}

const SPEEDS = [0.5, 1, 1.5, 2, 3];

export default function AnimControls({
  step, totalSteps, playing, progress, onToggle, onPrev, onNext, onReset, onEnd, label,
}: Props) {
  const { speed, setSpeed } = useStore();

  return (
    <div className="glass-panel px-4 py-3 flex flex-col gap-2">
      {/* Progress bar */}
      <div className="relative h-2 bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "linear-gradient(90deg, var(--accent), rgba(167,139,250,0.8))" }}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        {/* Knob */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg shadow-black/20 border-2 border-[var(--accent)]"
          initial={false}
          animate={{ left: `calc(${progress * 100}% - 6px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">
        {/* Transport buttons */}
        <div className="flex items-center gap-1">
          <Btn onClick={onReset} tip="Home"><SkipBack size={13} /></Btn>
          <Btn onClick={onPrev} tip="←"><ChevronLeft size={15} /></Btn>
          <Btn onClick={onToggle} tip="Space" primary>
            {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
          </Btn>
          <Btn onClick={onNext} tip="→"><ChevronRight size={15} /></Btn>
          <Btn onClick={onEnd} tip="End"><SkipForward size={13} /></Btn>
        </div>

        {/* Step counter */}
        <div className="font-mono text-xs text-txt-secondary flex items-center gap-2">
          {label && <span className="text-txt-muted">{label}</span>}
          <span className="accent-cyan font-bold">{step + 1}</span>
          <span className="text-txt-muted">/</span>
          <span className="text-txt-muted">{totalSteps}</span>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          <Gauge size={12} className="text-txt-muted" />
          {SPEEDS.map((s) => (
            <button
              key={s} onClick={() => setSpeed(s)}
              className={`
                px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-all
                ${s === speed
                  ? "accent-bg-cyan accent-cyan border border-[var(--accent)]/30"
                  : "text-txt-muted hover:text-txt-secondary bg-surface-2 border border-transparent"
                }
              `}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, tip, primary }: {
  children: React.ReactNode; onClick: () => void; tip: string; primary?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
      onClick={onClick} title={tip}
      className={`
        flex items-center justify-center rounded-lg transition-all duration-150
        ${primary
          ? "w-10 h-10 accent-bg-cyan accent-cyan border border-[var(--accent)]/30 shadow-glow-sm"
          : "w-8 h-8 bg-surface-2 text-txt-secondary hover:text-txt-primary hover:bg-surface-3 border border-edge"
        }
      `}
    >
      {children}
    </motion.button>
  );
}
