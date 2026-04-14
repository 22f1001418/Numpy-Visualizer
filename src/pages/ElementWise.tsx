import { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, ControlsRow, StepExplainer, Slider, Select, Divider, OpSymbol, Panel } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, add, subtract, multiply, divide, power, mod, greater, fmt, type Matrix } from "../lib/ndarray";

const OPS = [
  { value: "add", label: "+", fn: add },
  { value: "sub", label: "\u2212", fn: subtract },
  { value: "mul", label: "\u00d7", fn: multiply },
  { value: "div", label: "\u00f7", fn: divide },
  { value: "pow", label: "**", fn: power },
  { value: "mod", label: "%", fn: mod },
  { value: "gt",  label: ">", fn: greater },
] as const;
type OpKey = typeof OPS[number]["value"];

const DESCRIPTION = "Element-wise operations apply a mathematical function independently to each corresponding pair of cells in two arrays of the same shape. The goal is to understand that there are no cross-cell dependencies \u2014 each output cell depends only on the two inputs at the same position. The animation walks through every cell one by one, showing the operation and the resulting value.";

export default function ElementWise() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [opKey, setOpKey] = useState<OpKey>("add");

  const op = OPS.find((o) => o.value === opKey)!;
  const Amat = useMemo(() => randMatrix(rows, cols, 1, 10, 42), [rows, cols]);
  const Bmat = useMemo(() => randMatrix(rows, cols, 1, 10, 141), [rows, cols]);
  const result = useMemo(() => op.fn(Amat, Bmat), [Amat, Bmat, op]);

  const total = rows * cols;
  const anim = useAnimation({ totalSteps: total, baseMs: 600 });
  const sr = Math.floor(anim.step / cols);
  const sc = anim.step % cols;

  return (
    <PageShell title="Element-wise Operations" icon={<Plus size={22} />} accent="violet" description={DESCRIPTION}>
      <ControlsRow>
        <Slider label="Rows" value={rows} min={2} max={6} onChange={setRows} />
        <Slider label="Cols" value={cols} min={2} max={6} onChange={setCols} />
        <Select label="Operation" value={opKey}
          options={OPS.map((o) => ({ value: o.value, label: `${o.label}  ${o.value}` }))}
          onChange={setOpKey as any} />
      </ControlsRow>

      {/* Overview */}
      <Panel title="Result Overview">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <ArrayGrid data={Amat} title="A" accent="cyan" decimals={0} />
          <OpSymbol symbol={op.label} accent="cyan" />
          <ArrayGrid data={Bmat} title="B" accent="violet" decimals={0} />
          <OpSymbol symbol="=" accent="amber" />
          <ArrayGrid data={result} title="Result" accent="amber" decimals={2} />
        </div>
      </Panel>

      <CodePanel code={`result = np.${opKey === "gt" ? "greater" : opKey}(A, B)`} />
      <Divider />

      {/* Animated walkthrough */}
      <Panel title="Step-by-step Animation" accent="amber">
        <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} label="cell" />

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <ArrayGrid data={Amat} title="A" accent="cyan" decimals={0}
            cellMeta={(r, c) => (r === sr && c === sc ? { glow: "cyan" } : { dim: true })} />
          <OpSymbol symbol={op.label} />
          <ArrayGrid data={Bmat} title="B" accent="violet" decimals={0}
            cellMeta={(r, c) => (r === sr && c === sc ? { glow: "violet" } : { dim: true })} />
          <OpSymbol symbol="=" accent="amber" />
          <ArrayGrid
            data={result.map((row, i) => row.map((v, j) => (i * cols + j <= anim.step ? v : NaN)))}
            title="Building..." accent="amber" decimals={2}
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
          text={`Reading A[${sr},${sc}] = ${fmt(Amat[sr][sc], 0)} and B[${sr},${sc}] = ${fmt(Bmat[sr][sc], 0)}, applying ${op.label}, and writing ${fmt(result[sr][sc], 2)} into Result[${sr},${sc}]. Element-wise means each cell is independent.`} />
      </Panel>
    </PageShell>
  );
}
