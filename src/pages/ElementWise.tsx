import { useState, useMemo, useCallback } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, ControlsRow, StepExplainer, Slider, Select, Divider, OpSymbol, ArrayInput, Panel } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, add, subtract, multiply, divide, power, mod, greater, fmt, type Matrix } from "../lib/ndarray";

const OPS = [
  { value: "add", label: "+", fn: add },
  { value: "sub", label: "−", fn: subtract },
  { value: "mul", label: "×", fn: multiply },
  { value: "div", label: "÷", fn: divide },
  { value: "pow", label: "**", fn: power },
  { value: "mod", label: "%", fn: mod },
  { value: "gt",  label: ">", fn: greater },
] as const;
type OpKey = typeof OPS[number]["value"];

export default function ElementWise() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [seed, setSeed] = useState(42);
  const [opKey, setOpKey] = useState<OpKey>("add");
  const [A, setA] = useState<Matrix | null>(null);
  const [B, setB] = useState<Matrix | null>(null);

  const op = OPS.find((o) => o.value === opKey)!;
  const Amat = useMemo(() => A ?? randMatrix(rows, cols, 1, 10, seed), [rows, cols, seed, A]);
  const Bmat = useMemo(() => B ?? randMatrix(rows, cols, 1, 10, seed + 99), [rows, cols, seed, B]);
  const result = useMemo(() => op.fn(Amat, Bmat), [Amat, Bmat, op]);

  const total = rows * cols;
  const anim = useAnimation({ totalSteps: total, baseMs: 400 });
  const sr = Math.floor(anim.step / cols);
  const sc = anim.step % cols;

  const editA = useCallback((r: number, c: number, v: number) => {
    const copy = Amat.map((row) => [...row]); copy[r][c] = v; setA(copy);
  }, [Amat]);
  const editB = useCallback((r: number, c: number, v: number) => {
    const copy = Bmat.map((row) => [...row]); copy[r][c] = v; setB(copy);
  }, [Bmat]);

  return (
    <PageShell title="Element-wise Operations" icon="➕" accent="violet">
      <ControlsRow>
        <Slider label="Rows" value={rows} min={2} max={6} onChange={setRows} />
        <Slider label="Cols" value={cols} min={2} max={6} onChange={setCols} />
        <Slider label="Seed" value={seed} min={1} max={100} onChange={setSeed} />
        <Select label="Operation" value={opKey}
          options={OPS.map((o) => ({ value: o.value, label: `${o.label}  ${o.value}` }))}
          onChange={setOpKey as any} />
      </ControlsRow>

      {/* Custom input */}
      <div className="flex gap-4 flex-wrap">
        <ArrayInput onParsed={setA} placeholder="A = [[1,2],[3,4]]" accent="cyan" />
        <ArrayInput onParsed={setB} placeholder="B = [[5,6],[7,8]]" accent="violet" />
      </div>

      {/* Overview */}
      <Panel title="Result Overview">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <ArrayGrid data={Amat} title="A" accent="cyan" onCellEdit={editA} decimals={0} />
          <OpSymbol symbol={op.label} accent="cyan" />
          <ArrayGrid data={Bmat} title="B" accent="violet" onCellEdit={editB} decimals={0} />
          <OpSymbol symbol="=" accent="amber" />
          <ArrayGrid data={result} title="Result" accent="amber" decimals={2} />
        </div>
      </Panel>

      <CodePanel code={`result = np.${opKey === "gt" ? "greater" : opKey}(A, B)`} />
      <Divider />

      {/* Animated walkthrough */}
      <Panel title="Step-by-step Animation" accent="amber">
        <AnimControls {...anim} onToggle={anim.toggle} onPrev={anim.prev}
          onNext={anim.next} onReset={anim.reset} onEnd={anim.goEnd} label="cell" />

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <ArrayGrid data={Amat} title="A" accent="cyan" decimals={0}
            cellMeta={(r, c) => (r === sr && c === sc ? { glow: "cyan" } : { dim: true })} />
          <OpSymbol symbol={op.label} />
          <ArrayGrid data={Bmat} title="B" accent="violet" decimals={0}
            cellMeta={(r, c) => (r === sr && c === sc ? { glow: "violet" } : { dim: true })} />
          <OpSymbol symbol="=" accent="amber" />
          <ArrayGrid
            data={result.map((row, i) => row.map((v, j) => (i * cols + j <= anim.step ? v : NaN)))}
            title="Building…" accent="amber" decimals={2}
            cellMeta={(r, c) => (r === sr && c === sc ? { glow: "amber" } : {})} />
        </div>

        <FormulaBar accent="amber">
          <span className="text-txt-muted">cell [{sr}, {sc}]:</span>{" "}
          <span className="accent-cyan">{fmt(Amat[sr][sc], 0)}</span>{" "}
          <span className="text-txt-muted">{op.label}</span>{" "}
          <span className="accent-violet">{fmt(Bmat[sr][sc], 0)}</span>{" "}
          <span className="text-txt-muted">=</span>{" "}
          <span className="accent-amber font-bold">{fmt(result[sr][sc], 2)}</span>
        </FormulaBar>

        <StepExplainer accent="violet"
          text={`Reading A[${sr},${sc}] = ${fmt(Amat[sr][sc], 0)} and B[${sr},${sc}] = ${fmt(Bmat[sr][sc], 0)}, applying ${op.label}, and writing ${fmt(result[sr][sc], 2)} into Result[${sr},${sc}]. Element-wise means each cell is independent — no cross-cell dependencies.`} />
      </Panel>
    </PageShell>
  );
}
