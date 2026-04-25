import { useState, useMemo } from "react";
import { Radio } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select, Divider } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, broadcastAdd, isBroadcastCompatible, shape, fmt, type Matrix } from "../lib/ndarray";

type Scenario = "2d_row" | "2d_col" | "col_x_row" | "custom";

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "2d_row",    label: "2D + row vector" },
  { value: "2d_col",    label: "2D + column vector" },
  { value: "col_x_row", label: "Column × Row → 2D" },
  { value: "custom",    label: "Custom shapes" },
];

const DESCRIPTION =
  "Broadcasting is how NumPy handles arithmetic between arrays of different shapes. " +
  "When dimensions don't match, NumPy virtually stretches the smaller array to align with the larger one — " +
  "without copying data. The animation shows three stages: (1) the original shapes, " +
  "(2) how each array expands to a common shape, and (3) the element-wise computation on the expanded arrays.";

function CompatibilityRules({ rA, cA, rB, cB }: { rA: number; cA: number; rB: number; cB: number }) {
  const rowOk = rA === rB || rA === 1 || rB === 1;
  const colOk = cA === cB || cA === 1 || cB === 1;
  const compatible = rowOk && colOk;

  return (
    <div className={`rounded-xl border px-5 py-4 text-sm flex flex-col gap-3 ${
      compatible
        ? "bg-emerald-500/5 border-emerald-500/30"
        : "bg-rose-500/5 border-rose-500/30"
    }`}>
      <div className="font-semibold text-txt-primary">
        {compatible ? "✓ Shapes are broadcast-compatible" : "✗ Shapes are NOT broadcast-compatible"}
      </div>

      {/* Per-axis check */}
      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <DimCheck axis="rows" d1={rA} d2={rB} ok={rowOk} />
        <DimCheck axis="cols" d1={cA} d2={cB} ok={colOk} />
      </div>

      {/* Error explanation */}
      {!compatible && (
        <div className="text-xs text-txt-secondary leading-relaxed border-t border-edge pt-3">
          <strong>Why is this incompatible?</strong>
          <ul className="mt-1.5 list-disc list-inside space-y-1">
            {!rowOk && (
              <li>
                Row dimension mismatch: A has <strong>{rA}</strong> row{rA !== 1 ? "s" : ""} and B has{" "}
                <strong>{rB}</strong> row{rB !== 1 ? "s" : ""}. Neither is 1, so NumPy cannot stretch either
                array along this axis.
              </li>
            )}
            {!colOk && (
              <li>
                Column dimension mismatch: A has <strong>{cA}</strong> col{cA !== 1 ? "s" : ""} and B has{" "}
                <strong>{cB}</strong> col{cB !== 1 ? "s" : ""}. Neither is 1, so NumPy cannot stretch either
                array along this axis.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Always show the rules */}
      <div className="text-xs text-txt-muted leading-relaxed border-t border-edge pt-3">
        <strong className="text-txt-secondary">Broadcasting conditions (checked per axis):</strong>
        <ol className="mt-1.5 list-decimal list-inside space-y-1">
          <li>The two dimensions are equal → no stretching needed.</li>
          <li>One of the dimensions is exactly 1 → that array is virtually repeated along that axis.</li>
          <li>If neither condition holds → shapes are incompatible and NumPy raises a ValueError.</li>
        </ol>
      </div>
    </div>
  );
}

function DimCheck({ axis, d1, d2, ok }: { axis: string; d1: number; d2: number; ok: boolean }) {
  const reason =
    d1 === d2 ? "equal" : d1 === 1 ? "A is 1 → stretches" : d2 === 1 ? "B is 1 → stretches" : "incompatible";
  return (
    <div className={`flex items-center gap-2 ${ok ? "text-emerald-400" : "text-rose-400"}`}>
      <span className="w-4">{ok ? "✓" : "✗"}</span>
      <span className="text-txt-muted w-10">{axis}:</span>
      <span>
        {d1} vs {d2}
      </span>
      <span className="text-txt-muted">→ {reason}</span>
    </div>
  );
}

export default function Broadcasting() {
  const [scenario, setScenario] = useState<Scenario>("2d_row");
  const [aRows, setARows] = useState(3);
  const [aCols, setACols] = useState(4);
  const [bRows, setBRows] = useState(1);
  const [bCols, setBCols] = useState(4);

  const A = useMemo(() => {
    if (scenario === "2d_row") return randMatrix(3, 4, 1, 9, 5);
    if (scenario === "2d_col") return randMatrix(4, 3, 1, 9, 5);
    if (scenario === "col_x_row") return randMatrix(4, 1, 1, 9, 5);
    return randMatrix(aRows, aCols, 1, 9, 5);
  }, [scenario, aRows, aCols]);

  const B = useMemo(() => {
    if (scenario === "2d_row") return randMatrix(1, 4, 1, 9, 15);
    if (scenario === "2d_col") return randMatrix(4, 1, 1, 9, 15);
    if (scenario === "col_x_row") return randMatrix(1, 5, 1, 9, 15);
    return randMatrix(bRows, bCols, 1, 9, 15);
  }, [scenario, bRows, bCols]);

  const [rA, cA] = shape(A);
  const [rB, cB] = shape(B);

  const rowOk = rA === rB || rA === 1 || rB === 1;
  const colOk = cA === cB || cA === 1 || cB === 1;
  const compatible = rowOk && colOk;

  const outR = compatible ? Math.max(rA, rB) : 0;
  const outC = compatible ? Math.max(cA, cB) : 0;

  const Aexp: Matrix = compatible
    ? Array.from({ length: outR }, (_, i) => Array.from({ length: outC }, (_, j) => A[i % rA][j % cA]))
    : [];
  const Bexp: Matrix = compatible
    ? Array.from({ length: outR }, (_, i) => Array.from({ length: outC }, (_, j) => B[i % rB][j % cB]))
    : [];

  let result: Matrix = [];
  if (compatible) {
    try { result = broadcastAdd(A, B); } catch { /* no-op — isBroadcastCompatible already guards this */ }
  }

  const resultCells = compatible ? outR * outC : 0;
  const totalSteps = 2 + resultCells;
  const anim = useAnimation({ totalSteps, baseMs: 600 });
  const stage = anim.step < 1 ? 0 : anim.step < 2 ? 1 : 2;
  const cellIdx = Math.max(0, anim.step - 2);

  const codeStr = compatible
    ? `# A.shape = (${rA}, ${cA}), B.shape = (${rB}, ${cB})\nresult = A + B  # broadcast → (${outR}, ${outC})`
    : `# A.shape = (${rA}, ${cA}), B.shape = (${rB}, ${cB})\nresult = A + B\n# → ValueError: operands could not be broadcast together\n#   with shapes (${rA},${cA}) (${rB},${cB})`;

  return (
    <PageShell title="Broadcasting" icon={<Radio size={22} />} accent="violet" description={DESCRIPTION}>
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Scenario" value={scenario} onChange={setScenario as any} options={SCENARIOS} />
        {scenario === "custom" && (
          <>
            <Slider label="A rows" value={aRows} min={1} max={5} onChange={setARows} />
            <Slider label="A cols" value={aCols} min={1} max={6} onChange={setACols} />
            <Slider label="B rows" value={bRows} min={1} max={5} onChange={setBRows} />
            <Slider label="B cols" value={bCols} min={1} max={6} onChange={setBCols} />
          </>
        )}
      </div>

      {/* Compatibility check — always visible */}
      <CompatibilityRules rA={rA} cA={cA} rB={rB} cB={cB} />

      {compatible && (
        <AnimControls
          {...anim}
          onToggle={anim.toggle}
          onReset={anim.reset}
          label={stage === 0 ? "originals" : stage === 1 ? "expanded" : "computing"}
        />
      )}

      {/* Stage 0: Originals */}
      <div>
        <h3 className="text-sm font-semibold text-txt-secondary mb-2 font-mono uppercase tracking-wider">
          Stage 1 — Original shapes
        </h3>
        <div className="flex gap-6 flex-wrap items-start">
          <ArrayGrid data={A} title="A" accent="teal" decimals={0} label={`${rA}×${cA}`} />
          <ArrayGrid data={B} title="B" accent="coral" decimals={0} label={`${rB}×${cB}`} />
        </div>
      </div>

      {/* Stage 1: Expanded — only when compatible */}
      {compatible && stage >= 1 && (
        <div>
          <Divider />
          <h3 className="text-sm font-semibold text-txt-secondary mb-2 mt-4 font-mono uppercase tracking-wider">
            Stage 2 — Virtual expansion (no data copy)
          </h3>
          <div className="flex gap-6 flex-wrap items-start">
            <ArrayGrid data={Aexp} title="A broadcast" accent="teal" decimals={0} label={`${outR}×${outC}`} />
            <ArrayGrid data={Bexp} title="B broadcast" accent="coral" decimals={0} label={`${outR}×${outC}`} />
          </div>
        </div>
      )}

      {/* Stage 2: Result — only when compatible */}
      {compatible && stage >= 2 && result.length > 0 && (
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
                <ArrayGrid
                  data={partial}
                  title="A + B"
                  accent="amber"
                  decimals={0}
                  cellMeta={(r, c) => (r === cr && c === cc ? { glow: "amber" } : {})}
                />
                <FormulaBar accent="amber">
                  [{cr},{cc}]:{" "}
                  <span className="accent-teal">{fmt(Aexp[cr]?.[cc] ?? 0, 0)}</span>
                  {" + "}
                  <span className="accent-coral">{fmt(Bexp[cr]?.[cc] ?? 0, 0)}</span>
                  {" = "}
                  <span className="accent-amber font-bold">{fmt(result[cr]?.[cc] ?? 0, 0)}</span>
                </FormulaBar>
              </>
            );
          })()}
        </div>
      )}

      <CodePanel code={codeStr} />
    </PageShell>
  );
}
