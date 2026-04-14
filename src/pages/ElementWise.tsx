import { useState, useMemo, useCallback } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, Intro, FormulaBar, ControlsRow, Slider, Select, Divider, OpSymbol, ArrayInput, Panel } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, add, subtract, multiply, divide, power, mod, greater, fmt, type Matrix } from "../lib/ndarray";

const OPS = [
  { value: "add", label: "+", fn: add }, { value: "sub", label: "-", fn: subtract },
  { value: "mul", label: "x", fn: multiply }, { value: "div", label: "/", fn: divide },
  { value: "pow", label: "**", fn: power }, { value: "mod", label: "%", fn: mod },
  { value: "gt", label: ">", fn: greater },
] as const;
type OpKey = typeof OPS[number]["value"];

export default function ElementWise() {
  const [rows, setRows] = useState(3), [cols, setCols] = useState(4), [seed, setSeed] = useState(42);
  const [opKey, setOpKey] = useState<OpKey>("add");
  const [A, setA] = useState<Matrix|null>(null), [B, setB] = useState<Matrix|null>(null);
  const op = OPS.find(o => o.value === opKey)!;
  const Am = useMemo(() => A ?? randMatrix(rows,cols,1,10,seed), [rows,cols,seed,A]);
  const Bm = useMemo(() => B ?? randMatrix(rows,cols,1,10,seed+99), [rows,cols,seed,B]);
  const result = useMemo(() => op.fn(Am,Bm), [Am,Bm,op]);
  const total = rows*cols;
  const anim = useAnimation({ totalSteps: total, intervalMs: 450 });
  const sr = Math.floor(anim.step/cols), sc = anim.step%cols;
  const editA = useCallback((r:number,c:number,v:number) => { const cp=Am.map(r=>[...r]); cp[r][c]=v; setA(cp); }, [Am]);
  const editB = useCallback((r:number,c:number,v:number) => { const cp=Bm.map(r=>[...r]); cp[r][c]=v; setB(cp); }, [Bm]);

  return (
    <PageShell title="Element-wise Operations" accent="violet">
      <Intro
        what="Element-wise operations apply a function independently to each pair of corresponding cells in two arrays of the same shape."
        why="They are the foundation of vectorized computation in NumPy — replacing slow Python loops with fast C-level operations on entire arrays at once."
        how="Press Play to watch the operation process one cell at a time. Each step reads A[i,j] and B[i,j], computes the result, and writes it to the output array." />

      <ControlsRow>
        <Slider label="Rows" value={rows} min={2} max={6} onChange={setRows} />
        <Slider label="Cols" value={cols} min={2} max={6} onChange={setCols} />
        <Slider label="Seed" value={seed} min={1} max={100} onChange={setSeed} />
        <Select label="Operation" value={opKey} options={OPS.map(o => ({ value: o.value, label: `${o.label}  ${o.value}` }))} onChange={setOpKey as any} />
      </ControlsRow>

      <div className="flex gap-3 flex-wrap">
        <ArrayInput onParsed={setA} accent="cyan" />
        <ArrayInput onParsed={setB} accent="violet" />
      </div>

      <Panel title="Result">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <ArrayGrid data={Am} title="A" accent="cyan" onCellEdit={editA} decimals={0} />
          <OpSymbol symbol={op.label} accent="cyan" />
          <ArrayGrid data={Bm} title="B" accent="violet" onCellEdit={editB} decimals={0} />
          <OpSymbol symbol="=" accent="amber" />
          <ArrayGrid data={result} title="Result" accent="amber" decimals={2} />
        </div>
      </Panel>

      <CodePanel code={`result = np.${opKey === "gt" ? "greater" : opKey}(A, B)`} />
      <Divider />

      <Panel title="Step-by-step" accent="amber">
        <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} />
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <ArrayGrid data={Am} title="A" accent="cyan" decimals={0}
            cellMeta={(r,c) => (r===sr&&c===sc ? {glow:"cyan"} : {dim:true})} />
          <OpSymbol symbol={op.label} />
          <ArrayGrid data={Bm} title="B" accent="violet" decimals={0}
            cellMeta={(r,c) => (r===sr&&c===sc ? {glow:"violet"} : {dim:true})} />
          <OpSymbol symbol="=" accent="amber" />
          <ArrayGrid data={result.map((row,i) => row.map((v,j) => (i*cols+j <= anim.step ? v : NaN)))}
            title="Building..." accent="amber" decimals={2}
            cellMeta={(r,c) => (r===sr&&c===sc ? {glow:"amber"} : {})} />
        </div>
        <FormulaBar accent="amber">
          <span className="text-txt-muted">cell [{sr},{sc}]:</span>{" "}
          <span className="accent-cyan">{fmt(Am[sr][sc],0)}</span>{" "}
          <span className="text-txt-muted">{op.label}</span>{" "}
          <span className="accent-violet">{fmt(Bm[sr][sc],0)}</span>{" = "}
          <span className="accent-amber font-bold">{fmt(result[sr][sc],2)}</span>
        </FormulaBar>
      </Panel>
    </PageShell>
  );
}
