import { motion } from "framer-motion";
import { type ReactNode } from "react";

/* ═══ Page Shell ═══════════════════════════════════════════ */
export function PageShell({ title, icon, accent = "cyan", children }: {
  title: string; icon: string; accent?: string; children: ReactNode;
}) {
  const colorMap: Record<string, string> = {
    cyan: "text-accent-cyan", violet: "text-accent-violet", amber: "text-accent-amber",
    emerald: "text-accent-emerald", rose: "text-accent-rose",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto w-full"
    >
      <div>
        <h1 className={`text-2xl font-bold ${colorMap[accent] ?? "text-accent-cyan"}`}>
          <span className="mr-2">{icon}</span>{title}
        </h1>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </motion.div>
  );
}

/* ═══ Formula Bar ══════════════════════════════════════════ */
export function FormulaBar({ children, accent = "cyan" }: {
  children: ReactNode; accent?: string;
}) {
  const borderMap: Record<string, string> = {
    cyan: "border-accent-cyan/40", violet: "border-accent-violet/40",
    amber: "border-accent-amber/40", rose: "border-accent-rose/40",
    emerald: "border-accent-emerald/40",
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        font-mono text-sm text-center px-5 py-3 rounded-xl
        bg-surface-1 border ${borderMap[accent] ?? borderMap.cyan}
      `}
    >
      {children}
    </motion.div>
  );
}

/* ═══ Shape Badge ══════════════════════════════════════════ */
export function ShapeBadge({ shape, accent = "cyan" }: {
  shape: number[]; accent?: string;
}) {
  const textMap: Record<string, string> = {
    cyan: "text-accent-cyan", violet: "text-accent-violet",
    amber: "text-accent-amber", rose: "text-accent-rose",
    emerald: "text-accent-emerald",
  };
  return (
    <span className={`
      inline-flex items-center font-mono text-xs font-semibold px-2.5 py-1 rounded-md
      bg-surface-2 border border-edge ${textMap[accent] ?? textMap.cyan}
    `}>
      ({shape.join(" × ")})
    </span>
  );
}

/* ═══ OP Symbol ════════════════════════════════════════════ */
export function OpSymbol({ symbol, accent = "cyan" }: {
  symbol: string; accent?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "text-accent-cyan", violet: "text-accent-violet",
    amber: "text-accent-amber", rose: "text-accent-rose",
  };
  return (
    <div className={`
      flex items-center justify-center text-3xl font-bold font-mono
      ${colorMap[accent] ?? colorMap.cyan}
    `}>
      {symbol}
    </div>
  );
}

/* ═══ Slider ═══════════════════════════════════════════════ */
export function Slider({ label, value, min, max, onChange, step = 1 }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; step?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-txt-secondary">{label}</span>
        <span className="font-mono text-xs text-accent-cyan font-semibold">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-surface-2 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
                   [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-accent-cyan [&::-webkit-slider-thumb]:shadow-lg
                   [&::-webkit-slider-thumb]:shadow-cyan-500/30"
      />
    </label>
  );
}

/* ═══ Select ═══════════════════════════════════════════════ */
export function Select<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-txt-secondary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-surface-2 border border-edge rounded-lg px-3 py-1.5
                   font-mono text-sm text-txt-primary outline-none
                   focus:border-accent-cyan/50 transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

/* ═══ Big Result ═══════════════════════════════════════════ */
export function BigResult({ value, label, accent = "amber" }: {
  value: string; label: string; accent?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "text-accent-cyan border-accent-cyan/30",
    amber: "text-accent-amber border-accent-amber/30",
    violet: "text-accent-violet border-accent-violet/30",
    rose: "text-accent-rose border-accent-rose/30",
  };
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        flex flex-col items-center gap-1 px-8 py-5 rounded-2xl
        bg-surface-1 border ${colorMap[accent] ?? colorMap.amber}
      `}
    >
      <span className="text-[10px] uppercase tracking-widest text-txt-muted font-mono">{label}</span>
      <span className={`text-3xl font-bold font-mono ${colorMap[accent]?.split(" ")[0]}`}>{value}</span>
    </motion.div>
  );
}

/* ═══ Section Divider ══════════════════════════════════════ */
export function Divider() {
  return <div className="h-px bg-edge" />;
}
