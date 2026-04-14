import { useState, useMemo, useCallback } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, ShapeBadge, Slider, Divider } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, matmul, shape, fmt, type Matrix } from "../lib/ndarray";

export default function MatMul() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(3);
  const [p, setP] = useState(4);
  const [seed, setSeed] = useState(7);

  const [Aedit, setAedit] = useState<Matrix | null>(null);
  const [Bedit, setBedit] = useState<Matrix | null>(null);

  const A = useMemo(() => Aedit ?? randMatrix(m, n, 1, 9, seed), [m, n, seed, Aedit]);
  const B = useMemo(() => Bedit ?? randMatrix(n, p, 1, 9, seed + 50), [n, p, seed, Bedit]);
  const C = useMemo(() => matmul(A, B), [A, B]);

  const totalSteps = m * p;
  const anim = useAnimation({ totalSteps, intervalMs: 600 });

  const si = Math.floor(anim.step / p);
  const sj = anim.step % p;

  // Dot product breakdown for current step
  const pairs = Array.from({ length: n }, (_, k) => ({
    a: A[si][k], b: B[k][sj], product: A[si][k] * B[k][sj],
  }));
  const dotVal = pairs.reduce((s, p) => s + p.product, 0);

  const editA = useCallback((r: number, c: number, v: number) => {
    const copy = A.map((row) => [...row]); copy[r][c] = v; setAedit(copy);
  }, [A]);
  const editB = useCallback((r: number, c: number, v: number) => {
    const copy = B.map((row) => [...row]); copy[r][c] = v; setBedit(copy);
  }, [B]);

  return (
    <PageShell title="Matrix Multiply" icon="✖️" accent="amber">
      <div className="flex flex-wrap gap-4 items-end">
        <Slider label="A rows (m)" value={m} min={2} max={5} onChange={setM} />
        <Slider label="Shared (n)" value={n} min={2} max={5} onChange={setN} />
        <Slider label="B cols (p)" value={p} min={2} max={6} onChange={setP} />
        <Slider label="Seed" value={seed} min={1} max={100} onChange={setSeed} />
      </div>

      <div className="flex items-center gap-2 font-mono text-sm text-txt-secondary flex-wrap">
        <span className="text-accent-cyan font-semibold">A</span>
        <ShapeBadge shape={[m, n]} accent="cyan" />
        <span className="text-txt-muted">@</span>
        <span className="text-accent-violet font-semibold">B</span>
        <ShapeBadge shape={[n, p]} accent="violet" />
        <span className="text-txt-muted">→</span>
        <span className="text-accent-amber font-semibold">C</span>
        <ShapeBadge shape={[m, p]} accent="amber" />
      </div>

      <Divider />

      <h2 className="text-lg font-semibold text-txt-primary">🎬 Step-by-step Matmul</h2>
      <AnimControls {...anim} onToggle={anim.toggle} onPrev={anim.prev}
        onNext={anim.next} onReset={anim.reset} onEnd={anim.goEnd} label="cell" />

      <div className="flex gap-6 flex-wrap items-start">
        {/* A — highlight active row */}
        <ArrayGrid data={A} title="A" accent="cyan" decimals={0} onCellEdit={editA}
          cellMeta={(r, c) => {
            if (r === si) return { highlight: "cyan" };
            return { dim: true };
          }} />

        {/* B — highlight active column */}
        <ArrayGrid data={B} title="B" accent="violet" decimals={0} onCellEdit={editB}
          cellMeta={(r, c) => {
            if (c === sj) return { highlight: "violet" };
            return { dim: true };
          }} />

        {/* C — partial result */}
        <ArrayGrid
          data={C.map((row, i) =>
            row.map((v, j) => (i * p + j <= anim.step ? v : NaN))
          )}
          title="C = A @ B" accent="amber" decimals={0}
          cellMeta={(r, c) => {
            if (r === si && c === sj) return { highlight: "amber" };
            return {};
          }} />
      </div>

      {/* Dot product drill-down */}
      <div className="bg-surface-1 border border-edge rounded-xl p-5">
        <div className="text-xs text-txt-muted font-mono mb-3 uppercase tracking-wider">
          C[{si},{sj}] computation
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono text-sm">
          {pairs.map((p, k) => (
            <span key={k} className="flex items-center gap-1">
              {k > 0 && <span className="text-txt-muted">+</span>}
              <span className="text-accent-cyan">{fmt(p.a, 0)}</span>
              <span className="text-txt-muted">×</span>
              <span className="text-accent-violet">{fmt(p.b, 0)}</span>
            </span>
          ))}
          <span className="text-txt-muted">=</span>

          <div className="flex items-center gap-1">
            {pairs.map((p, k) => (
              <span key={k} className="flex items-center gap-1">
                {k > 0 && <span className="text-txt-muted">+</span>}
                <span className="text-txt-secondary">{fmt(p.product, 0)}</span>
              </span>
            ))}
          </div>

          <span className="text-txt-muted">=</span>
          <span className="text-accent-amber font-bold text-lg">{fmt(dotVal, 0)}</span>
        </div>
      </div>

      <CodePanel code={`C = A @ B          # np.matmul(A, B)
# C[${si},${sj}] = sum(A[${si},:] * B[:,${sj}]) = ${fmt(dotVal, 0)}`} />
    </PageShell>
  );
}
