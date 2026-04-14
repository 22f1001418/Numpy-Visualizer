import { motion } from "framer-motion";
import { type ReactNode, useState, useCallback } from "react";
import { Terminal, AlertCircle, BookOpen } from "lucide-react";
import { parseMatrix, type Matrix } from "../lib/ndarray";

/* ═══ Page Shell ═══════════════════════════════════════════ */
export function PageShell({ title, accent = "cyan", children }: {
  title: string; accent?: string; children: ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="flex flex-col gap-5 p-6 lg:p-8 max-w-[1400px] mx-auto w-full relative z-10">
      <h1 className={`text-xl lg:text-2xl font-bold accent-${accent}`}>{title}</h1>
      <div className="flex flex-col gap-5">{children}</div>
    </motion.div>
  );
}

/* ═══ Intro — brief explainer at top of each page ══════════ */
export function Intro({ what, why, how }: { what: string; why: string; how: string }) {
  return (
    <div className="glass-panel p-4 flex items-start gap-3 border-l-[3px] accent-border-cyan">
      <BookOpen size={18} className="accent-cyan shrink-0 mt-0.5" />
      <div className="text-sm text-txt-secondary leading-relaxed space-y-1">
        <p><span className="font-semibold text-txt-primary">What:</span> {what}</p>
        <p><span className="font-semibold text-txt-primary">Why:</span> {why}</p>
        <p><span className="font-semibold text-txt-primary">How:</span> {how}</p>
      </div>
    </div>
  );
}

/* ═══ Panel ════════════════════════════════════════════════ */
export function Panel({ title, children, accent }: { title?: string; children: ReactNode; accent?: string }) {
  return (
    <div className="glass-panel p-4 lg:p-5 flex flex-col gap-3">
      {title && <h3 className={`text-xs font-bold uppercase tracking-[0.12em] ${accent ? `accent-${accent}` : "text-txt-muted"}`}>{title}</h3>}
      {children}
    </div>
  );
}

/* ═══ Formula Bar ══════════════════════════════════════════ */
export function FormulaBar({ children, accent = "cyan" }: { children: ReactNode; accent?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel font-mono text-sm text-center px-5 py-3 accent-border-${accent} border`}>
      {children}
    </motion.div>
  );
}

/* ═══ Shape Badge ══════════════════════════════════════════ */
export function ShapeBadge({ shape, accent = "cyan" }: { shape: number[]; accent?: string }) {
  return (
    <span className={`inline-flex items-center font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-surface-2 border border-edge accent-${accent}`}>
      ({shape.join(" x ")})
    </span>
  );
}

/* ═══ Op Symbol ════════════════════════════════════════════ */
export function OpSymbol({ symbol, accent = "cyan" }: { symbol: string; accent?: string }) {
  return <div className={`flex items-center justify-center text-2xl font-bold font-mono accent-${accent}`}>{symbol}</div>;
}

/* ═══ Big Result ═══════════════════════════════════════════ */
export function BigResult({ value, label, accent = "amber" }: { value: string; label: string; accent?: string }) {
  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`glass-panel flex flex-col items-center gap-1 px-8 py-5 accent-border-${accent} border`}>
      <span className="text-[9px] uppercase tracking-[0.2em] text-txt-muted font-mono">{label}</span>
      <span className={`text-3xl font-bold font-mono accent-${accent}`}>{value}</span>
    </motion.div>
  );
}

/* ═══ Slider ═══════════════════════════════════════════════ */
export function Slider({ label, value, min, max, onChange, step = 1 }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void; step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 min-w-[110px]">
      <div className="flex justify-between items-baseline">
        <span className="text-[11px] text-txt-secondary">{label}</span>
        <span className="font-mono text-[11px] accent-cyan font-semibold">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-surface-3 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-white/20" />
    </label>
  );
}

/* ═══ Select ═══════════════════════════════════════════════ */
export function Select<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 min-w-[130px]">
      <span className="text-[11px] text-txt-secondary">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}
        className="bg-surface-2 border border-edge rounded-lg px-3 py-2 font-mono text-sm text-txt-primary outline-none focus:border-[var(--accent)]/50 cursor-pointer">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/* ═══ Array Input ══════════════════════════════════════════ */
export function ArrayInput({ onParsed, accent = "cyan" }: { onParsed: (m: Matrix) => void; accent?: string }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const handleParse = useCallback(() => {
    const r = parseMatrix(text);
    if (r.ok) { onParsed(r.data); setError(null); setOpen(false); } else setError(r.error);
  }, [text, onParsed]);

  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-[11px] font-mono accent-${accent} hover:underline underline-offset-2`}>
        <Terminal size={12} /> {open ? "Close" : "Enter custom array"}
      </button>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="glass-panel p-3 flex flex-col gap-2">
          <textarea value={text} onChange={(e) => { setText(e.target.value); setError(null); }}
            placeholder={"[[1,2,3],[4,5,6]]  or  1 2 3\\n4 5 6"}
            className="bg-surface-2 border border-edge rounded-lg px-3 py-2 font-mono text-xs text-txt-primary resize-y min-h-[50px] outline-none placeholder:text-txt-muted/40" rows={2} />
          <div className="flex items-center gap-2">
            <button onClick={handleParse} className={`px-3 py-1.5 rounded-lg text-xs font-semibold accent-bg-${accent} accent-${accent} border accent-border-${accent}`}>Apply</button>
            {error && <span className="text-xs accent-rose flex items-center gap-1"><AlertCircle size={12} />{error}</span>}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function Divider() { return <div className="h-px bg-edge" />; }
export function ControlsRow({ children }: { children: ReactNode }) {
  return <Panel title="Controls"><div className="flex flex-wrap gap-4 items-end">{children}</div></Panel>;
}
