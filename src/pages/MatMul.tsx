import { useState, useMemo } from "react";
import { Grid3x3 } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, ShapeBadge, ControlsRow, StepExplainer, Slider, Divider, Panel } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, matmul, shape, fmt, type Matrix } from "../lib/ndarray";

const DESCRIPTION = "Matrix multiplication computes each cell of the output by taking the dot product of a row from A and a column from B. The goal is to see exactly which elements participate in each output cell. The animation selects one output cell at a time, highlights the corresponding row and column, shows the element-wise products, and sums them to produce the result.";

export default function MatMul() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(3);
  const [p, setP] = useState(4);

  const A = useMemo(() => randMatrix(m, n, 1, 9, 7), [m, n]);
  const B = useMemo(() => randMatrix(n, p, 1, 9, 57), [n, p]);
  const C = useMemo(() => matmul(A, B), [A, B]);
  const totalSteps = m * p;
  const anim = useAnimation({ totalSteps, baseMs: 900 });
  const si = Math.floor(anim.step / p), sj = anim.step % p;

  const pairs = Array.from({ length: n }, (_, k) => ({ a: A[si][k], b: B[k][sj], prod: A[si][k] * B[k][sj] }));
  const dotVal = pairs.reduce((s, pp) => s + pp.prod, 0);

  return (
    <PageShell title="Matrix Multiply" icon={<Grid3x3 size={22} />} accent="amber" description={DESCRIPTION}>
      <ControlsRow>
        <Slider label="A rows (m)" value={m} min={2} max={5} onChange={setM} />
        <Slider label="Shared (n)" value={n} min={2} max={5} onChange={setN} />
        <Slider label="B cols (p)" value={p} min={2} max={6} onChange={setP} />
      </ControlsRow>

      <div className="flex items-center gap-2 font-mono text-sm text-txt-secondary flex-wrap">
        <span className="accent-cyan font-bold">A</span> <ShapeBadge shape={[m, n]} accent="cyan" />
        <span className="text-txt-muted">@</span>
        <span className="accent-violet font-bold">B</span> <ShapeBadge shape={[n, p]} accent="violet" />
        <span className="text-txt-muted">&rarr;</span>
        <span className="accent-amber font-bold">C</span> <ShapeBadge shape={[m, p]} accent="amber" />
      </div>

      <Divider />

      <Panel title="Step-by-step Matmul" accent="amber">
        <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} label="cell" />

        <div className="flex gap-5 flex-wrap items-start">
          <ArrayGrid data={A} title="A" accent="cyan" decimals={0}
            cellMeta={(r) => (r === si ? { glow: "cyan" } : { dim: true })} />
          <ArrayGrid data={B} title="B" accent="violet" decimals={0}
            cellMeta={(_, c) => (c === sj ? { glow: "violet" } : { dim: true })} />
          <ArrayGrid
            data={C.map((row, i) => row.map((v, j) => (i * p + j <= anim.step ? v : NaN)))}
            title="C = A @ B" accent="amber" decimals={0}
            cellMeta={(r, c) => (r === si && c === sj ? { glow: "amber" } : {})} />
        </div>

        {/* Dot product drill-down */}
        <div className="glass-panel p-4 border border-edge">
          <div className="text-[10px] text-txt-muted font-mono uppercase tracking-wider mb-2">
            C[{si},{sj}] = row {si} of A &middot; col {sj} of B
          </div>
          <div className="flex items-center gap-2 flex-wrap font-mono text-sm">
            {pairs.map((pp, k) => (
              <span key={k} className="flex items-center gap-1">
                {k > 0 && <span className="text-txt-muted">+</span>}
                <span className="accent-cyan">{fmt(pp.a, 0)}</span>
                <span className="text-txt-muted">&times;</span>
                <span className="accent-violet">{fmt(pp.b, 0)}</span>
              </span>
            ))}
            <span className="text-txt-muted">=</span>
            {pairs.map((pp, k) => (
              <span key={k} className="flex items-center gap-1">
                {k > 0 && <span className="text-txt-muted">+</span>}
                <span className="text-txt-secondary">{fmt(pp.prod, 0)}</span>
              </span>
            ))}
            <span className="text-txt-muted">=</span>
            <span className="accent-amber font-bold text-lg">{fmt(dotVal, 0)}</span>
          </div>
        </div>

        <StepExplainer accent="amber"
          text={`To compute C[${si},${sj}], NumPy takes the entire row ${si} from A (${n} values) and the entire column ${sj} from B (${n} values), multiplies them element-wise, then sums the products. This dot product equals ${fmt(dotVal, 0)}.`} />
      </Panel>

      <CodePanel code={`C = A @ B          # np.matmul(A, B)\n# C[${si},${sj}] = sum(A[${si},:] * B[:,${sj}]) = ${fmt(dotVal, 0)}`} />
    </PageShell>
  );
}
