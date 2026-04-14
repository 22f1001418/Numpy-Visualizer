import { useState, useMemo, useCallback } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, FormulaBar, Slider, Select, Divider } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, slice2d, shape, fmt, type Matrix } from "../lib/ndarray";

type Mode = "basic" | "fancy" | "boolean";

export default function Slicing() {
  const [mode, setMode] = useState<Mode>("basic");
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [seed, setSeed] = useState(9);
  const [rStart, setRStart] = useState(1);
  const [rEnd, setREnd] = useState(4);
  const [cStart, setCStart] = useState(1);
  const [cEnd, setCEnd] = useState(5);
  const [thresh, setThresh] = useState(25);

  const [editMat, setEditMat] = useState<Matrix | null>(null);
  const arr = useMemo(() => editMat ?? randMatrix(rows, cols, 1, 50, seed), [rows, cols, seed, editMat]);
  const editCell = useCallback((r: number, c: number, v: number) => {
    const copy = arr.map((row) => [...row]); copy[r][c] = v; setEditMat(copy);
  }, [arr]);

  // Basic slice
  const sliced = useMemo(() => slice2d(arr, rStart, rEnd, cStart, cEnd), [arr, rStart, rEnd, cStart, cEnd]);

  // Boolean mask
  const mask = useMemo(() => arr.map((row) => row.map((v) => v > thresh)), [arr, thresh]);
  const maskCells = useMemo(() => {
    const cells: [number, number][] = [];
    mask.forEach((row, i) => row.forEach((v, j) => { if (v) cells.push([i, j]); }));
    return cells;
  }, [mask]);
  const selected = useMemo(() => maskCells.map(([r, c]) => arr[r][c]), [maskCells, arr]);

  const totalScan = rows * cols;
  const anim = useAnimation({ totalSteps: mode === "boolean" ? totalScan : 1, intervalMs: 200 });

  const modeOpts: { value: Mode; label: string }[] = [
    { value: "basic", label: "Basic Slice" },
    { value: "fancy", label: "Fancy Indexing" },
    { value: "boolean", label: "Boolean Mask" },
  ];

  return (
    <PageShell title="Slicing & Indexing" icon="✂️" accent="emerald">
      <div className="flex flex-wrap gap-4 items-end">
        <Select label="Mode" value={mode} onChange={setMode as any} options={modeOpts} />
        <Slider label="Rows" value={rows} min={3} max={8} onChange={setRows} />
        <Slider label="Cols" value={cols} min={3} max={8} onChange={setCols} />
        <Slider label="Seed" value={seed} min={1} max={99} onChange={setSeed} />
      </div>

      {mode === "basic" && (
        <>
          <div className="flex flex-wrap gap-4 items-end">
            <Slider label="Row start" value={rStart} min={0} max={rows - 1} onChange={setRStart} />
            <Slider label="Row end" value={rEnd} min={rStart + 1} max={rows} onChange={setREnd} />
            <Slider label="Col start" value={cStart} min={0} max={cols - 1} onChange={setCStart} />
            <Slider label="Col end" value={cEnd} min={cStart + 1} max={cols} onChange={setCEnd} />
          </div>
          <div className="flex gap-8 flex-wrap items-start">
            <ArrayGrid data={arr} title="Original" accent="cyan" decimals={0} onCellEdit={editCell}
              cellMeta={(r, c) =>
                r >= rStart && r < rEnd && c >= cStart && c < cEnd
                  ? { highlight: "amber" } : { dim: true }
              } />
            <ArrayGrid data={sliced} title="Sliced" accent="amber" decimals={0} />
          </div>
          <CodePanel code={`arr[${rStart}:${rEnd}, ${cStart}:${cEnd}]`} />
        </>
      )}

      {mode === "fancy" && (
        <>
          <p className="text-sm text-txt-secondary">
            Select specific rows and columns by toggling the indices below.
          </p>
          {(() => {
            const [selRows, setSelRows] = useState([0, 2]);
            const [selCols, setSelCols] = useState([1, 3, 4]);
            const fancied = selRows.length && selCols.length
              ? selRows.map((r) => selCols.map((c) => arr[r]?.[c] ?? 0))
              : [];
            return (
              <>
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <span className="text-xs text-txt-muted block mb-1">Rows</span>
                    <div className="flex gap-1">
                      {Array.from({ length: rows }, (_, i) => (
                        <button key={i} onClick={() => setSelRows((p) =>
                          p.includes(i) ? p.filter((x) => x !== i) : [...p, i].sort()
                        )}
                          className={`w-8 h-8 rounded font-mono text-xs border transition-colors
                            ${selRows.includes(i) ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan" : "bg-surface-2 border-edge text-txt-muted"}`}
                        >{i}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-txt-muted block mb-1">Cols</span>
                    <div className="flex gap-1">
                      {Array.from({ length: cols }, (_, j) => (
                        <button key={j} onClick={() => setSelCols((p) =>
                          p.includes(j) ? p.filter((x) => x !== j) : [...p, j].sort()
                        )}
                          className={`w-8 h-8 rounded font-mono text-xs border transition-colors
                            ${selCols.includes(j) ? "bg-accent-violet/20 border-accent-violet text-accent-violet" : "bg-surface-2 border-edge text-txt-muted"}`}
                        >{j}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-8 flex-wrap items-start">
                  <ArrayGrid data={arr} title="Original" accent="cyan" decimals={0} onCellEdit={editCell}
                    cellMeta={(r, c) =>
                      selRows.includes(r) && selCols.includes(c) ? { highlight: "violet" } : { dim: true }
                    } />
                  {fancied.length > 0 && (
                    <ArrayGrid data={fancied} title="Fancy indexed" accent="violet" decimals={0} />
                  )}
                </div>
                <CodePanel code={`arr[np.ix_(${JSON.stringify(selRows)}, ${JSON.stringify(selCols)})]`} />
              </>
            );
          })()}
        </>
      )}

      {mode === "boolean" && (
        <>
          <Slider label="Threshold (arr > X)" value={thresh} min={1} max={49} onChange={setThresh} />
          <AnimControls {...anim} onToggle={anim.toggle} onPrev={anim.prev}
            onNext={anim.next} onReset={anim.reset} onEnd={anim.goEnd} label="cell scan" />
          {(() => {
            const scanR = Math.floor(anim.step / cols);
            const scanC = anim.step % cols;
            const matchesSoFar = maskCells.filter(
              ([r, c]) => r * cols + c <= anim.step
            );
            return (
              <>
                <div className="flex gap-8 flex-wrap items-start">
                  <ArrayGrid data={arr} title="Scanning…" accent="cyan" decimals={0} onCellEdit={editCell}
                    cellMeta={(r, c) => {
                      const idx = r * cols + c;
                      if (idx === anim.step) return { highlight: mask[r][c] ? "emerald" : "rose" };
                      if (idx < anim.step && mask[r][c]) return { highlight: "emerald" };
                      if (idx > anim.step) return { dim: true };
                      return {};
                    }} />
                  <ArrayGrid
                    data={[matchesSoFar.map(([r, c]) => arr[r][c])].filter((r) => r.length > 0)}
                    title={`Selected (${matchesSoFar.length})`}
                    accent="emerald" decimals={0}
                    compact />
                </div>
                <FormulaBar accent="emerald">
                  [{scanR},{scanC}] = {fmt(arr[scanR]?.[scanC] ?? 0, 0)}{" "}
                  {mask[scanR]?.[scanC]
                    ? <span className="text-accent-emerald font-bold"> ✓ &gt; {thresh}</span>
                    : <span className="text-accent-rose"> ✗ ≤ {thresh}</span>}
                </FormulaBar>
              </>
            );
          })()}
          <CodePanel code={`arr[arr > ${thresh}]`} />
        </>
      )}
    </PageShell>
  );
}
