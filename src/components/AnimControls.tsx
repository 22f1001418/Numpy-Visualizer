import { motion } from "framer-motion";
import { SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward } from "lucide-react";

interface Props {
  step: number;
  totalSteps: number;
  playing: boolean;
  progress: number;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onEnd: () => void;
  label?: string;
}

export default function AnimControls({
  step, totalSteps, playing, progress,
  onToggle, onPrev, onNext, onReset, onEnd, label,
}: Props) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Progress bar */}
      <div className="relative h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent-cyan rounded-full"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Btn onClick={onReset} title="Reset"><SkipBack size={14} /></Btn>
          <Btn onClick={onPrev} title="Previous"><ChevronLeft size={16} /></Btn>
          <Btn onClick={onToggle} title={playing ? "Pause" : "Play"} primary>
            {playing
              ? <Pause size={16} fill="currentColor" />
              : <Play size={16} fill="currentColor" />}
          </Btn>
          <Btn onClick={onNext} title="Next"><ChevronRight size={16} /></Btn>
          <Btn onClick={onEnd} title="End"><SkipForward size={14} /></Btn>
        </div>

        <div className="font-mono text-xs text-txt-secondary">
          {label && <span className="text-txt-muted mr-2">{label}</span>}
          <span className="text-accent-cyan font-semibold">{step + 1}</span>
          <span className="text-txt-muted"> / {totalSteps}</span>
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, title, primary }: {
  children: React.ReactNode; onClick: () => void; title: string; primary?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={title}
      className={`
        flex items-center justify-center rounded-lg
        transition-colors duration-150
        ${primary
          ? "w-9 h-9 bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan/25 border border-accent-cyan/30"
          : "w-8 h-8 bg-surface-2 text-txt-secondary hover:bg-surface-3 hover:text-txt-primary border border-transparent"
        }
      `}
    >
      {children}
    </motion.button>
  );
}
