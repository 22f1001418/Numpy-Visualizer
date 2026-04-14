import { useState, useMemo, useCallback } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, Intro, FormulaBar, ShapeBadge, ControlsRow, Slider, Divider, Panel, ArrayInput } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, matmul, fmt, type Matrix } from "../lib/ndarray";

export default function MatMul() {
  const [m, setM] = useState(3), [n, setN] = useState(3), [p, setP] = useState(4), [seed, setSeed] = useState(7);
  const [Ae, setAe] = useState<Matrix|null>(null), [Be, setBe] = useState<Matrix|null>(null);
  const A = useMemo(() => Ae ?? randMatrix(m,n,1,9,seed), [m,n,seed,Ae]);
  const B = useMemo(() => Be ?? randMatrix(n,p,1,9,seed+50), [n,p,seed,Be]);
  const C = useMemo(() => matmul(A,B), [A,B]);
  const anim = useAnimation({ totalSteps: m*p, intervalMs: 650 });
  const si = Math.floor(anim.step/p), sj = anim.step%p;
  const pairs = Array.from({length:n}, (_,k) => ({a:A[si][k], b:B[k][sj], prod:A[si][k]*B[k][sj]}));
  const dotVal = pairs.reduce((s,pp) => s+pp.prod, 0);
  const editA = useCallback((r:number,c:number,v:number) => { const cp=A.map(r=>[...r]); cp[r][c]=v; setAe(cp); }, [A]);
  const editB = useCallback((r:number,c:number,v:number) => { const cp=B.map(r=>[...r]); cp[r][c]=v; setBe(cp); }, [B]);

  return (
    <PageShell title="Matrix Multiply" accent="amber">
      <Intro
        what="Matrix multiplication (A @ B) combines two matrices by computing the dot product of each row of A with each column of B to produce a new matrix."
        why="It is the core operation in linear algebra, used extensively in machine learning (weight layers), computer graphics (transformations), and data science (projections)."
        how="Press Play to step through each output cell. For C[i,j], the animation highlights row i in A and column j in B, multiplies element-wise, and sums the products." />

      <ControlsRow>
        <Slider label="A rows (m)" value={m} min={2} max={5} onChange={setM} />
        <Slider label="Shared (n)" value={n} min={2} max={5} onChange={setN} />
        <Slider label="B cols (p)" value={p} min={2} max={6} onChange={setP} />
        <Slider label="Seed" value={seed} min={1} max={100} onChange={setSeed} />
      </ControlsRow>
      <div className="flex gap-3 flex-wrap">
        <ArrayInput onParsed={setAe} accent="cyan" />
        <ArrayInput onParsed={setBe} accent="violet" />
      </div>

      <div className="flex items-center gap-2 font-mono text-sm text-txt-secondary flex-wrap">
        <span className="accent-cyan font-bold">A</span> <ShapeBadge shape={[m,n]} accent="cyan" />
        <span className="text-txt-muted">@</span>
        <span className="accent-violet font-bold">B</span> <ShapeBadge shape={[n,p]} accent="violet" />
        <span className="text-txt-muted">=</span>
        <span className="accent-amber font-bold">C</span> <ShapeBadge shape={[m,p]} accent="amber" />
      </div>

      <Divider />
      <Panel title="Step-by-step" accent="amber">
        <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} />
        <div className="flex gap-5 flex-wrap items-start">
          <ArrayGrid data={A} title="A" accent="cyan" decimals={0} onCellEdit={editA}
            cellMeta={r => (r===si ? {glow:"cyan"} : {dim:true})} />
          <ArrayGrid data={B} title="B" accent="violet" decimals={0} onCellEdit={editB}
            cellMeta={(_,c) => (c===sj ? {glow:"violet"} : {dim:true})} />
          <ArrayGrid data={C.map((row,i) => row.map((v,j) => (i*p+j <= anim.step ? v : NaN)))}
            title="C = A @ B" accent="amber" decimals={0}
            cellMeta={(r,c) => (r===si&&c===sj ? {glow:"amber"} : {})} />
        </div>
        <div className="glass-panel p-4 border border-edge">
          <div className="text-[10px] text-txt-muted font-mono uppercase tracking-wider mb-2">C[{si},{sj}] = row {si} of A . col {sj} of B</div>
          <div className="flex items-center gap-2 flex-wrap font-mono text-sm">
            {pairs.map((pp,k) => (
              <span key={k} className="flex items-center gap-1">
                {k>0 && <span className="text-txt-muted">+</span>}
                <span className="accent-cyan">{fmt(pp.a,0)}</span>
                <span className="text-txt-muted">x</span>
                <span className="accent-violet">{fmt(pp.b,0)}</span>
              </span>
            ))}
            <span className="text-txt-muted">=</span>
            <span className="accent-amber font-bold text-lg">{fmt(dotVal,0)}</span>
          </div>
        </div>
      </Panel>
      <CodePanel code={`C = A @ B   # np.matmul(A, B)`} />
    </PageShell>
  );
}
