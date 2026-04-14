import { motion } from "framer-motion";
import { Play, Square, RotateCcw } from "lucide-react";

interface Props {
  step: number; totalSteps: number; playing: boolean; progress: number;
  onToggle: () => void; onReset: () => void;
}

export default function AnimControls({ step, totalSteps, playing, progress, onToggle, onReset }: Props) {
  return (
    <div className="glass-panel px-4 py-3 flex flex-col gap-2">
      <div className="relative h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]"
          initial={false} animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onReset}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-txt-secondary hover:text-txt-primary border border-edge transition-colors">
            <RotateCcw size={14} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onToggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg accent-bg-cyan accent-cyan border accent-border-cyan transition-colors">
            {playing ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </motion.button>
        </div>
        <span className="font-mono text-xs text-txt-secondary">
          <span className="accent-cyan font-semibold">{step + 1}</span>
          <span className="text-txt-muted"> / {totalSteps}</span>
        </span>
      </div>
    </div>
  );
}
