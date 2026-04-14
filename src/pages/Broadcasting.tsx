import { useState, useMemo } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, ShapeBadge, Slider, Select, Divider } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, broadcastAdd, shape, fmt, type Matrix } from "../lib/ndarray";

type Scenario = "2d_row" | "2d_col" | "col_x_row" | "custom";

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "2d_row",    label: "2D + row vector" },
  { value: "2d_col",    label: "2D + column vector" },
  { value: "col_x_row", label: "Column × Row → 2D" },
  { value: "custom",    label: "Custom shapes" },
];

export default function Broadcasting() {
  const [scenario, setScenario] = useState<Scenario>("2d_row");
  const [seed, setSeed] = useState(5);
  const [aRows, setARows] = useState(3);
  const [aCols, setACols] = useState(4);
  const [bRows, setBRows] = useState(1);
  const [bCols, setBCols] = useState(4);

  const A = useMemo(() => {
    if (scenario === "2d_row") return randMatrix(3, 4, 1, 9, seed);
    if (scenario === "2d_col") return randMatrix(4, 3, 1, 9, seed);
    if (scenario === "col_x_row") return randMatrix(4, 1, 1, 9, seed);
    return randMatrix(aRows, aCols, 1, 9, seed);
  }, [scenario, seed, aRows, aCols]);

  const B = useMemo(() => {
    if (scenario === "2d_row") return randMatrix(1, 4, 1, 9, seed + 10);
    if (scenario === "2d_col") return randMatrix(4, 1, 1, 9, seed + 10);
    if (scenario === "col_x_row") return randMatrix(1, 5, 1, 9, seed + 10);
    return randMatrix(bRows, bCols, 1, 9, seed + 10);
  }, [scenario, seed, bRows, bCols]);

  // Broadcast expand
  const [rA, cA] = shape(A);
  const [rB, cB] = shape(B);
  const outR = Math.max(rA, rB);
  const outC = Math.max(cA, cB);

  const Aexp: Matrix = Array.from({ length: outR }, (_, i) =>
    Array.from({ length: outC }, (_, j) => A[i % rA][j % cA]));
  const Bexp: Matrix = Array.from({ length: outR }, (_, i) =>
    Array.from({ length: outC }, (_, j) => B[i % rB][j % cB]));

  let result: Matrix;
  let compatible = true;
  try { result = broadcastAdd(A, B); } catch { result = []; compatible = false; }

  // Stages: 0=originals shown, 1=expanded shown, 2..2+cells=result building
  const resultCells = outR * outC;
  const totalSteps = 2 + resultCells;
  const anim = useAnimation({ totalSteps, baseMs: 350 });
  const stage = anim.step < 1 ? 0 : anim.step < 2 ? 1 : 2;
  const cellIdx = Math.max(0, anim.step - 2);

  return (
    <PageShell title="Broadcasting" icon="📡" accent="rose">
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Scenario" value={scenario} onChange={setScenario as any} options={SCENARIOS} />
        <Slider label="Seed" value={seed} min={1} max={99} onChange={setSeed} />
        {scenario === "custom" && (
          <>
            <Slider label="A rows" value={aRows} min={1} max={5} onChange={setARows} />
            <Slider label="A cols" value={aCols} min={1} max={6} onChange={setACols} />
            <Slider label="B rows" value={bRows} min={1} max={5} onChange={setBRows} />
            <Slider label="B cols" value={bCols} min={1} max={6} onChange={setBCols} />
          </>
        )}
      </div>

      <AnimControls {...anim} onToggle={anim.toggle} onPrev={anim.prev}
        onNext={anim.next} onReset={anim.reset} onEnd={anim.goEnd}
        label={stage === 0 ? "originals" : stage === 1 ? "expanded" : "computing"} />

      {/* Stage 0: Originals */}
      <div>
        <h3 className="text-sm font-semibold text-txt-secondary mb-2 font-mono uppercase tracking-wider">
          Stage 1 — Original shapes
        </h3>
        <div className="flex gap-6 flex-wrap items-start">
          <div>
            <ArrayGrid data={A} title="A" accent="cyan" decimals={0} label={`${rA}×${cA}`} />
          </div>
          <div>
            <ArrayGrid data={B} title="B" accent="violet" decimals={0} label={`${rB}×${cB}`} />
          </div>
        </div>
      </div>

      {/* Stage 1: Expanded */}
      {stage >= 1 && (
        <div>
          <Divider />
          <h3 className="text-sm font-semibold text-txt-secondary mb-2 mt-4 font-mono uppercase tracking-wider">
            Stage 2 — Virtual expansion (no data copy)
          </h3>
          <div className="flex gap-6 flex-wrap items-start">
            <ArrayGrid data={Aexp} title="A broadcast" accent="cyan" decimals={0} label={`${outR}×${outC}`} />
            <ArrayGrid data={Bexp} title="B broadcast" accent="violet" decimals={0} label={`${outR}×${outC}`} />
          </div>
        </div>
      )}

      {/* Stage 2: Result building */}
      {stage >= 2 && compatible && (
        <div>
          <Divider />
          <h3 className="text-sm font-semibold text-txt-secondary mb-2 mt-4 font-mono uppercase tracking-wider">
            Stage 3 — Element-wise result
          </h3>
          {(() => {
            const cr = Math.floor(cellIdx / outC);
            const cc = cellIdx % outC;
            const partial: Matrix = result.map((row, i) =>
              row.map((v, j) => (i * outC + j <= cellIdx ? v : NaN)));
            return (
              <>
                <ArrayGrid data={partial} title="A + B" accent="amber" decimals={0}
                  cellMeta={(r, c) => (r === cr && c === cc ? { glow: "amber" } : {})} />
                <FormulaBar accent="amber">
                  [{cr},{cc}]: <span className="accent-cyan">{fmt(Aexp[cr]?.[cc] ?? 0, 0)}</span>
                  {" + "}<span className="accent-violet">{fmt(Bexp[cr]?.[cc] ?? 0, 0)}</span>
                  {" = "}<span className="accent-amber font-bold">{fmt(result[cr]?.[cc] ?? 0, 0)}</span>
                </FormulaBar>
              </>
            );
          })()}
        </div>
      )}

      {!compatible && (
        <div className="accent-rose accent-bg-rose border accent-border-rose rounded-xl px-5 py-3 text-sm accent-rose">
          Shapes ({rA}×{cA}) and ({rB}×{cB}) are not broadcast-compatible.
        </div>
      )}

      <CodePanel code={`# A.shape = (${rA}, ${cA}), B.shape = (${rB}, ${cB})
result = A + B  # broadcast → (${outR}, ${outC})`} />
    </PageShell>
  );
}
