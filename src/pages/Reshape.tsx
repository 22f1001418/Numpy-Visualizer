import { useState, useMemo } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, Intro, FormulaBar, Slider, Select } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { arange, reshape, transpose, flatten, randMatrix, fmt, type Matrix } from "../lib/ndarray";

export default function Reshape() {
  const [mode, setMode] = useState<"reshape" | "transpose" | "flatten">("reshape");
  const [total, setTotal] = useState(12);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [seed, setSeed] = useState(7);

  const divisors = useMemo(
    () => Array.from({ length: total }, (_, i) => i + 1).filter((d) => total % d === 0),
    [total]
  );
  const newRows = divisors.includes(rows) ? rows : divisors[0];
  const newCols = total / newRows;

  const flat = useMemo(() => arange(1, total + 1), [total]);
  const target = useMemo(() => reshape(flat, newRows, newCols), [flat, newRows, newCols]);

  const srcMat = useMemo(() => randMatrix(rows, cols, 1, 15, seed), [rows, cols, seed]);
  const srcT = useMemo(() => transpose(srcMat), [srcMat]);

  const flatSrc = useMemo(() => reshape(arange(1, rows * cols + 1), rows, cols), [rows, cols]);
  const flatResult = useMemo(() => flatten(flatSrc), [flatSrc]);

  const stepCount =
    mode === "reshape" ? total :
    mode === "transpose" ? rows * cols :
    rows * cols;

  const anim = useAnimation({ totalSteps: stepCount, intervalMs: 320 });

  const modeOpts = [
    { value: "reshape" as const, label: "Reshape" },
    { value: "transpose" as const, label: "Transpose" },
    { value: "flatten" as const, label: "Flatten" },
  ];

  return (
    <PageShell title="Reshape & Transpose" accent="cyan">
      <Intro what="Reshape changes how array elements are arranged in memory without altering the data itself. Transpose swaps rows and columns. Flatten collapses dimensions into 1-D." why="Understanding reshape is key to preparing data for ML models, image processing, and matrix operations where specific shapes are required." how="Press Play to watch each element move from its source position into the new shape, one at a time." />
      <div className="flex flex-wrap gap-4 items-end">
        <Select value={mode} onChange={setMode as any} options={modeOpts} />
        {mode === "reshape" && (
          <>
            <Slider value={total} min={4} max={24} onChange={setTotal} />
            <Select value={String(newRows)} onChange={(v) => setRows(Number(v))}
              options={divisors.map((d) => ({ value: String(d), label: `${d} → (${d}×${total / d})` }))} />
          </>
        )}
        {mode === "transpose" && (
          <>
            <Slider value={rows} min={2} max={6} onChange={setRows} />
            <Slider value={cols} min={2} max={6} onChange={setCols} />
            <Slider value={seed} min={1} max={99} onChange={setSeed} />
          </>
        )}
        {mode === "flatten" && (
          <>
            <Slider value={rows} min={2} max={6} onChange={setRows} />
            <Slider value={cols} min={2} max={6} onChange={setCols} />
          </>
        )}
      </div>

      <AnimControls {...anim} onToggle={anim.toggle}
        onReset={anim.reset} />

      {/* ── Reshape ───────────────────── */}
      {mode === "reshape" && (() => {
        const tr = Math.floor(anim.step / newCols);
        const tc = anim.step % newCols;
        const partial: Matrix = target.map((row) => row.map(() => NaN));
        for (let i = 0; i <= anim.step; i++) {
          const r = Math.floor(i / newCols);
          const c = i % newCols;
          partial[r][c] = target[r][c];
        }
        return (
          <>
            <div className="flex gap-8 flex-wrap items-start">
              <ArrayGrid data={[flat]} title="1-D (source)" accent="cyan" decimals={0}
                cellMeta={(_, c) => (c === anim.step ? { glow: "cyan" } : c < anim.step ? { computed: true } : { dim: true })} />
              <ArrayGrid data={partial} title={`Reshaped (${newRows}×${newCols})`} accent="amber" decimals={0}
                cellMeta={(r, c) => (r === tr && c === tc ? { glow: "amber" } : {})} />
            </div>
            <FormulaBar accent="cyan">
              flat[<span className="accent-cyan">{anim.step}</span>] = {fmt(flat[anim.step], 0)}
              {" → "} reshaped[<span className="accent-amber">{tr}</span>,<span className="accent-amber">{tc}</span>]
            </FormulaBar>
            <CodePanel code={`arr = np.arange(1, ${total + 1})\nreshaped = arr.reshape(${newRows}, ${newCols})`} />
          </>
        );
      })()}

      {/* ── Transpose ─────────────────── */}
      {mode === "transpose" && (() => {
        const r = Math.floor(anim.step / cols);
        const c = anim.step % cols;
        return (
          <>
            <div className="flex gap-8 flex-wrap items-start">
              <ArrayGrid data={srcMat} title="Original" accent="cyan" decimals={0}
                cellMeta={(ri, ci) => (ri === r && ci === c ? { glow: "cyan" } : { dim: true })} />
              <ArrayGrid data={srcT} title="Transposed (.T)" accent="violet" decimals={0}
                cellMeta={(ri, ci) => (ri === c && ci === r ? { glow: "violet" } : { dim: true })} />
            </div>
            <FormulaBar accent="violet">
              arr[{r},{c}] = <span className="accent-cyan">{fmt(srcMat[r]?.[c] ?? 0, 0)}</span>
              {" → "} arr.T[{c},{r}]
            </FormulaBar>
            <CodePanel code="transposed = arr.T  # np.transpose(arr)" />
          </>
        );
      })()}

      {/* ── Flatten ───────────────────── */}
      {mode === "flatten" && (() => {
        const fr = Math.floor(anim.step / cols);
        const fc = anim.step % cols;
        return (
          <>
            <div className="flex gap-8 flex-wrap items-start">
              <ArrayGrid data={flatSrc} title={`2-D (${rows}×${cols})`} accent="cyan" decimals={0}
                cellMeta={(r, c) => (r === fr && c === fc ? { glow: "cyan" } : {})} />
              <ArrayGrid
                data={[flatResult.map((v, i) => (i <= anim.step ? v : NaN))]}
                title="Flattened" accent="amber" decimals={0}
                cellMeta={(_, c) => (c === anim.step ? { glow: "amber" } : {})} />
            </div>
            <FormulaBar accent="amber">
              arr[{fr},{fc}] = {fmt(flatSrc[fr]?.[fc] ?? 0, 0)} → flat[{anim.step}]
            </FormulaBar>
            <CodePanel code="flat = arr.flatten()  # C-order (row-major)" />
          </>
        );
      })()}
    </PageShell>
  );
}
