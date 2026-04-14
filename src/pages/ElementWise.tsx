import { useState, useMemo, useCallback } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, ShapeBadge, Slider, Select, Divider, OpSymbol } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, add, subtract, multiply, divide, power, mod, greater, scalarOp, shape, fmt, type Matrix } from "../lib/ndarray";

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

  const op = OPS.find((o) => o.value === opKey)!;

  const [A, setA] = useState<Matrix | null>(null);
  const [B, setB] = useState<Matrix | null>(null);

  const Amat = useMemo(() => A ?? randMatrix(rows, cols, 1, 10, seed), [rows, cols, seed, A]);
  const Bmat = useMemo(() => B ?? randMatrix(rows, cols, 1, 10, seed + 99), [rows, cols, seed, B]);
  const result = useMemo(() => op.fn(Amat, Bmat), [Amat, Bmat, op]);

  const total = rows * cols;
  const anim = useAnimation({ totalSteps: total, intervalMs: 400 });

  const editA = useCallback((r: number, c: number, v: number) => {
    const copy = Amat.map((row) => [...row]);
    copy[r][c] = v;
    setA(copy);
  }, [Amat]);

  const editB = useCallback((r: number, c: number, v: number) => {
    const copy = Bmat.map((row) => [...row]);
    copy[r][c] = v;
    setB(copy);
  }, [Bmat]);

  const sr = Math.floor(anim.step / cols);
  const sc = anim.step % cols;

  return (
    <PageShell title="Element-wise Operations" icon="➕" accent="violet">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <Slider label="Rows" value={rows} min={2} max={6} onChange={setRows} />
        <Slider label="Cols" value={cols} min={2} max={6} onChange={setCols} />
        <Slider label="Seed" value={seed} min={1} max={100} onChange={setSeed} />
        <Select label="Operation" value={opKey}
          options={OPS.map((o) => ({ value: o.value, label: `${o.label} (${o.value})` }))}
          onChange={setOpKey as any} />
      </div>

      {/* Static overview */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div><ArrayGrid data={Amat} title="A" accent="cyan" onCellEdit={editA} decimals={0} /></div>
        <OpSymbol symbol={op.label} accent="cyan" />
        <div><ArrayGrid data={Bmat} title="B" accent="violet" onCellEdit={editB} decimals={0} /></div>
        <OpSymbol symbol="=" accent="amber" />
        <div><ArrayGrid data={result} title="Result" accent="amber" decimals={2} /></div>
      </div>

      <CodePanel code={`result = np.${opKey === "gt" ? "greater" : opKey}(A, B)`} />

      <Divider />

      {/* Animated walkthrough */}
      <h2 className="text-lg font-semibold text-txt-primary">🎬 Step-by-step</h2>
      <AnimControls {...anim} onToggle={anim.toggle} onPrev={anim.prev}
        onNext={anim.next} onReset={anim.reset} onEnd={anim.goEnd} label="cell" />

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <ArrayGrid data={Amat} title="A" accent="cyan" decimals={0}
          cellMeta={(r, c) => (r === sr && c === sc ? { highlight: "cyan" } : { dim: true })} />
        <OpSymbol symbol={op.label} />
        <ArrayGrid data={Bmat} title="B" accent="violet" decimals={0}
          cellMeta={(r, c) => (r === sr && c === sc ? { highlight: "violet" } : { dim: true })} />
        <OpSymbol symbol="=" accent="amber" />
        <ArrayGrid
          data={result.map((row, i) =>
            row.map((v, j) => (i * cols + j <= anim.step ? v : NaN))
          )}
          title="Building…" accent="amber" decimals={2}
          cellMeta={(r, c) => (r === sr && c === sc ? { highlight: "amber" } : {})}
        />
      </div>

      <FormulaBar accent="amber">
        <span className="text-txt-muted">cell [{sr},{sc}]:</span>{" "}
        <span className="text-accent-cyan">{fmt(Amat[sr][sc], 0)}</span>{" "}
        <span className="text-txt-muted">{op.label}</span>{" "}
        <span className="text-accent-violet">{fmt(Bmat[sr][sc], 0)}</span>{" "}
        <span className="text-txt-muted">=</span>{" "}
        <span className="text-accent-amber font-bold">{fmt(result[sr][sc], 2)}</span>
      </FormulaBar>
    </PageShell>
  );
}
