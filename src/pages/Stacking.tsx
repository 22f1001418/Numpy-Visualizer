import { useState, useMemo } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, vstack, hstack, shape, fmt, type Matrix } from "../lib/ndarray";

type Op = "vstack" | "hstack" | "split_v" | "split_h";

export default function Stacking() {
  const [op, setOp] = useState<Op>("vstack");
  const [seed, setSeed] = useState(3);
  const [sharedDim, setSharedDim] = useState(4);
  const [dimA, setDimA] = useState(2);
  const [dimB, setDimB] = useState(3);

  const A = useMemo(() => randMatrix(
    op === "hstack" || op === "split_h" ? sharedDim : dimA,
    op === "vstack" || op === "split_v" ? sharedDim : dimA,
    1, 9, seed
  ), [op, sharedDim, dimA, seed]);

  const B = useMemo(() => randMatrix(
    op === "hstack" || op === "split_h" ? sharedDim : dimB,
    op === "vstack" || op === "split_v" ? sharedDim : dimB,
    10, 19, seed + 50
  ), [op, sharedDim, dimB, seed]);

  const isVert = op === "vstack" || op === "split_v";
  const result = useMemo(() => isVert ? vstack(A, B) : hstack(A, B), [A, B, isVert]);
  const [rR, cR] = shape(result);

  const totalSteps = isVert ? rR : cR;
  const anim = useAnimation({ totalSteps, baseMs: 450 });

  const [rA] = shape(A);
  const origin = isVert
    ? (anim.step < rA ? "A" : "B")
    : (anim.step < shape(A)[1] ? "A" : "B");

  return (
    <PageShell title="Stacking & Splitting" icon="📐" accent="violet">
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Operation" value={op} onChange={setOp as any}
          options={[
            { value: "vstack", label: "vstack (vertical)" },
            { value: "hstack", label: "hstack (horizontal)" },
          ]} />
        <Slider label="Shared dim" value={sharedDim} min={2} max={6} onChange={setSharedDim} />
        <Slider label="A size" value={dimA} min={1} max={4} onChange={setDimA} />
        <Slider label="B size" value={dimB} min={1} max={4} onChange={setDimB} />
        <Slider label="Seed" value={seed} min={1} max={99} onChange={setSeed} />
      </div>

      <AnimControls {...anim} onToggle={anim.toggle} onPrev={anim.prev}
        onNext={anim.next} onReset={anim.reset} onEnd={anim.goEnd}
        label={isVert ? "row" : "col"} />

      <div className="flex gap-6 flex-wrap items-start">
        <ArrayGrid data={A} title="A" accent="cyan" decimals={0} />
        <ArrayGrid data={B} title="B" accent="violet" decimals={0} />
        <ArrayGrid
          data={isVert
            ? result.map((row, i) => (i <= anim.step ? row : row.map(() => NaN)))
            : result.map((row) => row.map((v, j) => (j <= anim.step ? v : NaN)))
          }
          title={`${op} → (${rR}×${cR})`}
          accent="amber" decimals={0}
          cellMeta={(r, c) => {
            const active = isVert ? r === anim.step : c === anim.step;
            return active ? { glow: "amber" } : {};
          }}
        />
      </div>

      <FormulaBar accent="amber">
        {isVert ? "Row" : "Col"} {anim.step} comes from <span className={`font-bold ${origin === "A" ? "accent-cyan" : "accent-violet"}`}>{origin}</span>
      </FormulaBar>

      <CodePanel code={`np.${op}([A, B])`} />
    </PageShell>
  );
}
