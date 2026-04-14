import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randVector, cumsum, cumprod, diff, fmt } from "../lib/ndarray";

type Op = "cumsum" | "cumprod" | "diff";

export default function Cumulative() {
  const [op, setOp] = useState<Op>("cumsum");
  const [n, setN] = useState(8);
  const [seed, setSeed] = useState(15);

  const arr = useMemo(
    () => op === "cumprod" ? randVector(n, 1, 4, seed) : randVector(n, 1, 15, seed),
    [n, seed, op]
  );

  const result = useMemo(() => {
    if (op === "cumsum") return cumsum(arr);
    if (op === "cumprod") return cumprod(arr);
    return diff(arr);
  }, [arr, op]);

  const anim = useAnimation({ totalSteps: result.length, baseMs: 420 });
  const maxResult = Math.max(...result.map(Math.abs), 1);

  // Build formula for current step
  const formulaText = useMemo(() => {
    const s = anim.step;
    if (op === "cumsum") {
      const parts = arr.slice(0, s + 1).map((v) => fmt(v, 0)).join(" + ");
      return `${parts} = ${fmt(result[s], 0)}`;
    }
    if (op === "cumprod") {
      const parts = arr.slice(0, s + 1).map((v) => fmt(v, 0)).join(" × ");
      return `${parts} = ${fmt(result[s], 0)}`;
    }
    return `arr[${s + 1}] − arr[${s}] = ${fmt(arr[s + 1], 0)} − ${fmt(arr[s], 0)} = ${fmt(result[s], 0)}`;
  }, [anim.step, arr, result, op]);

  return (
    <PageShell title="Cumulative Operations" icon="📈" accent="rose">
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Operation" value={op} onChange={setOp as any}
          options={[{ value: "cumsum", label: "cumsum" }, { value: "cumprod", label: "cumprod" },
                    { value: "diff", label: "diff" }]} />
        <Slider label="Elements" value={n} min={4} max={14} onChange={setN} />
        <Slider label="Seed" value={seed} min={1} max={99} onChange={setSeed} />
      </div>

      <AnimControls {...anim} onToggle={anim.toggle} onPrev={anim.prev}
        onNext={anim.next} onReset={anim.reset} onEnd={anim.goEnd} label="step" />

      {/* Arrays */}
      <div className="flex gap-8 flex-wrap items-start">
        <ArrayGrid data={[arr]} title="Input" accent="cyan" decimals={0}
          cellMeta={(_, c) => {
            if (op === "diff") {
              if (c === anim.step || c === anim.step + 1) return { glow: "cyan" };
            } else {
              if (c <= anim.step) return { glow: "cyan" };
            }
            return { dim: true };
          }} />
        <ArrayGrid
          data={[result.map((v, i) => (i <= anim.step ? v : NaN))]}
          title={`np.${op}()`} accent="rose" decimals={0}
          cellMeta={(_, c) => (c === anim.step ? { glow: "rose" } : {})} />
      </div>

      {/* Line chart */}
      <div className="relative h-36 bg-surface-1 border border-edge rounded-xl p-4 overflow-hidden">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((p) => (
          <div key={p} className="absolute left-0 right-0 border-t border-edge/50"
            style={{ bottom: `${p * 100}%` }} />
        ))}

        {/* Result line */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${result.length * 2} 100`}
          preserveAspectRatio="none">
          {/* Filled area */}
          <motion.path
            d={(() => {
              const pts = result.slice(0, anim.step + 1).map((v, i) => {
                const x = (i / (result.length - 1)) * (result.length * 2);
                const y = 100 - ((v - Math.min(...result)) / (maxResult - Math.min(...result) + 0.01)) * 80 - 10;
                return `${x},${y}`;
              });
              if (!pts.length) return "";
              const lastX = ((anim.step) / (result.length - 1)) * (result.length * 2);
              return `M${pts[0]} L${pts.join(" L")} L${lastX},100 L0,100 Z`;
            })()}
            fill="rgba(244, 63, 94, 0.1)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          {/* Line */}
          <motion.polyline
            points={result.slice(0, anim.step + 1).map((v, i) => {
              const x = (i / (result.length - 1)) * (result.length * 2);
              const y = 100 - ((v - Math.min(...result)) / (maxResult - Math.min(...result) + 0.01)) * 80 - 10;
              return `${x},${y}`;
            }).join(" ")}
            fill="none" stroke="#f43f5e" strokeWidth="1.5"
          />
        </svg>

        {/* Dots */}
        <div className="absolute inset-0 flex items-end px-4 pb-4">
          {result.slice(0, anim.step + 1).map((v, i) => {
            const left = (i / (result.length - 1)) * 100;
            const bottom = ((v - Math.min(...result)) / (maxResult - Math.min(...result) + 0.01)) * 80 + 10;
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[var(--accent)]"
                style={{ left: `${left}%`, bottom: `${bottom}%`, marginLeft: -4, marginBottom: -4 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            );
          })}
        </div>
      </div>

      <FormulaBar accent="rose">{formulaText}</FormulaBar>
      <CodePanel code={`np.${op}(arr)`} />
    </PageShell>
  );
}
