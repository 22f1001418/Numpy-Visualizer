import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Panel, Slider, Select, StepExplainer, OpSymbol, ValueInput } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, scalarOp, fmt, type Matrix } from "../lib/ndarray";

type OpKey = "mul" | "add" | "pow" | "mod";
const OPS: { value: OpKey; label: string; sym: string; fn: (a: number, b: number) => number }[] = [
  { value: "mul", label: "Multiply", sym: "\u00d7", fn: (a, b) => a * b },
  { value: "add", label: "Add",      sym: "+",      fn: (a, b) => a + b },
  { value: "pow", label: "Power",    sym: "**",     fn: (a, b) => Math.pow(a, b) },
  { value: "mod", label: "Modulo",   sym: "%",      fn: (a, b) => a % b },
];

const DESCRIPTION = "Vectorization is the key reason NumPy is fast. Instead of writing a Python for-loop that processes one element at a time, you apply the operation to the entire array in a single expression. Under the hood, NumPy executes optimized C code across all elements simultaneously. The animation compares both approaches: the loop walks cell by cell (N steps), while the vectorized version completes in one step — same result, dramatically fewer Python-level operations.";

export default function Vectorization() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(5);
  const [opKey, setOpKey] = useState<OpKey>("mul");
  const [scalar, setScalar] = useState(3);
  const [mode, setMode] = useState<"loop" | "vectorized">("loop");
  const [customArr, setCustomArr] = useState<Matrix | null>(null);

  const op = OPS.find((o) => o.value === opKey)!;
  const arr = useMemo(() => customArr ?? randMatrix(rows, cols, 1, 15, 42), [rows, cols, customArr]);
  const aR = arr.length;
  const aC = arr[0]?.length ?? 0;
  const result = useMemo(() => scalarOp(arr, scalar, op.fn), [arr, scalar, op]);

  const totalCells = aR * aC;
  // Loop mode: one step per cell. Vectorized: 1 step that does everything.
  const loopAnim = useAnimation({ totalSteps: totalCells, baseMs: 500 });
  const vecAnim = useAnimation({ totalSteps: 1, baseMs: 800 });
  const anim = mode === "loop" ? loopAnim : vecAnim;

  const sr = Math.floor(loopAnim.step / aC);
  const sc = loopAnim.step % aC;

  return (
    <PageShell title="Vectorization" icon={<Zap size={22} />} accent="teal" description={DESCRIPTION}>
      <div className="flex flex-wrap gap-4 items-end">
        <Slider label="Rows" value={rows} min={2} max={6} onChange={(v) => { setRows(v); setCustomArr(null); }} />
        <Slider label="Cols" value={cols} min={2} max={8} onChange={(v) => { setCols(v); setCustomArr(null); }} />
        <Select label="Operation" value={opKey} onChange={setOpKey as any}
          options={OPS.map((o) => ({ value: o.value, label: `${o.sym}  ${o.label}` }))} />
        <Slider label="Scalar" value={scalar} min={1} max={10} onChange={setScalar} />
      </div>

      <ValueInput label="array values" onParsed={setCustomArr} accent="teal" />

      {/* Mode selector */}
      <div className="flex gap-2">
        <ModeBtn active={mode === "loop"} onClick={() => setMode("loop")}
          label="Loop (element-by-element)" accent="coral" />
        <ModeBtn active={mode === "vectorized"} onClick={() => setMode("vectorized")}
          label="Vectorized (all at once)" accent="teal" />
      </div>

      {/* ── Loop mode ── */}
      {mode === "loop" && (
        <Panel title="Python for-loop approach" accent="coral">
          <AnimControls {...loopAnim} onToggle={loopAnim.toggle} onReset={loopAnim.reset} label="iteration" />

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <ArrayGrid data={arr} title="Input" accent="teal" decimals={0}
              cellMeta={(r, c) => {
                const idx = r * aC + c;
                if (idx === loopAnim.step) return { glow: "coral" };
                if (idx < loopAnim.step) return { glow: "teal" };
                return { dim: true };
              }} />
            <OpSymbol symbol={`${op.sym} ${scalar}`} accent="coral" />
            <ArrayGrid
              data={result.map((row, i) => row.map((v, j) => (i * aC + j <= loopAnim.step ? v : NaN)))}
              title="Output (building...)" accent="amber" decimals={1}
              cellMeta={(r, c) => (r === sr && c === sc ? { glow: "amber" } : {})} />
          </div>

          <FormulaBar accent="coral">
            <span className="text-txt-muted">Step {loopAnim.step + 1}/{totalCells}:</span>{" "}
            result[{sr},{sc}] = <span className="accent-teal">{fmt(arr[sr]?.[sc] ?? 0, 0)}</span>
            {" "}<span className="text-txt-muted">{op.sym}</span>{" "}
            <span className="accent-coral">{scalar}</span>
            {" = "}<span className="accent-amber font-bold">{fmt(result[sr]?.[sc] ?? 0, 1)}</span>
          </FormulaBar>

          {/* Step counter bar showing N iterations */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-txt-muted font-mono">Iterations:</span>
            <div className="flex-1 flex gap-[2px]">
              {Array.from({ length: totalCells }, (_, i) => (
                <motion.div
                  key={i}
                  className={`flex-1 h-2 rounded-sm ${i <= loopAnim.step ? "bg-[var(--accent)]" : "bg-surface-2"}`}
                  initial={false}
                  animate={{ opacity: i <= loopAnim.step ? 1 : 0.3 }}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono accent-coral font-bold">{loopAnim.step + 1}</span>
          </div>

          <StepExplainer accent="coral"
            text={`The for-loop processes one cell at a time. After ${loopAnim.step + 1} Python-level iterations, ${loopAnim.step + 1} of ${totalCells} cells are done. Each iteration has Python interpreter overhead — function call, type checking, memory access.`} />

          <CodePanel code={`# Slow: Python for-loop\nresult = np.empty_like(arr)\nfor i in range(${aR}):\n    for j in range(${aC}):\n        result[i, j] = arr[i, j] ${op.sym} ${scalar}\n# Total iterations: ${totalCells}`} />
        </Panel>
      )}

      {/* ── Vectorized mode ── */}
      {mode === "vectorized" && (
        <Panel title="NumPy vectorized approach" accent="teal">
          <AnimControls {...vecAnim} onToggle={vecAnim.toggle} onReset={vecAnim.reset} label="operation" />

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <ArrayGrid data={arr} title="Input" accent="teal" decimals={0}
              cellMeta={() => (vecAnim.step >= 0 ? { glow: "teal" } : {})} />
            <OpSymbol symbol={`${op.sym} ${scalar}`} accent="teal" />
            <ArrayGrid
              data={vecAnim.step >= 0 ? result : result.map((row) => row.map(() => NaN))}
              title="Output (instant)" accent="amber" decimals={1}
              cellMeta={() => (vecAnim.step >= 0 ? { glow: "amber" } : {})} />
          </div>

          <FormulaBar accent="teal">
            <span className="accent-teal font-bold">1 operation</span>
            <span className="text-txt-muted"> — all {totalCells} cells computed at C-level speed</span>
          </FormulaBar>

          {/* Single-step bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-txt-muted font-mono">Operations:</span>
            <motion.div
              className="flex-1 h-3 rounded bg-surface-2 overflow-hidden"
              initial={false}
            >
              <motion.div
                className="h-full rounded"
                style={{ background: "linear-gradient(90deg, var(--accent), rgba(20,184,166,0.6))" }}
                initial={{ width: "0%" }}
                animate={{ width: vecAnim.step >= 0 ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            </motion.div>
            <span className="text-[10px] font-mono accent-teal font-bold">1</span>
          </div>

          <StepExplainer accent="teal"
            text={`NumPy applies the operation to the entire array in a single expression. Internally, a compiled C loop runs over contiguous memory — no Python interpreter overhead per element. For a ${aR}\u00d7${aC} array that's ${totalCells}\u00d7 fewer Python-level operations than the for-loop.`} />

          <CodePanel code={`# Fast: NumPy vectorized\nresult = arr ${op.sym} ${scalar}\n# 1 Python expression → C-level loop over ${totalCells} elements`} />
        </Panel>
      )}

      {/* Comparison summary */}
      <Panel title="Why it matters">
        <div className="grid grid-cols-2 gap-3">
          <CompareCard label="for-loop" value={`${totalCells} Python iterations`} accent="coral" />
          <CompareCard label="Vectorized" value="1 NumPy expression" accent="teal" />
        </div>
        <p className="text-xs text-txt-muted leading-relaxed mt-1">
          The speedup grows with array size. For a 1000x1000 array, the loop needs 1,000,000 Python iterations.
          The vectorized version still takes one expression. Real-world speedups are typically 10–100x.
        </p>
      </Panel>
    </PageShell>
  );
}

function ModeBtn({ active, onClick, label, accent }: { active: boolean; onClick: () => void; label: string; accent: string }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border
        ${active
          ? `accent-bg-${accent} accent-${accent} accent-border-${accent}`
          : "bg-surface-2 text-txt-muted border-edge hover:text-txt-secondary"
        }
      `}
    >
      {label}
    </button>
  );
}

function CompareCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className={`glass-panel px-4 py-3 border accent-border-${accent} text-center`}>
      <div className="text-[9px] uppercase tracking-[0.15em] text-txt-muted font-mono mb-1">{label}</div>
      <div className={`text-sm font-bold accent-${accent}`}>{value}</div>
    </div>
  );
}
