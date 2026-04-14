import { useState, useMemo, useCallback } from "react";
import ArrayGrid from "../components/ArrayGrid";
import AnimControls from "../components/AnimControls";
import CodePanel from "../components/CodePanel";
import { PageShell, Intro, FormulaBar, ControlsRow, Slider, Select, Divider, Panel, ArrayInput } from "../components/UI";
import { useAnimation } from "../hooks/useAnimation";
import { randMatrix, slice2d, fmt, type Matrix } from "../lib/ndarray";

type Mode = "basic" | "fancy" | "boolean";

export default function Slicing() {
  const [mode, setMode] = useState<Mode>("basic");
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [seed, setSeed] = useState(9);

  // Basic slice params
  const [rStart, setRStart] = useState(1);
  const [rEnd, setREnd] = useState(4);
  const [cStart, setCStart] = useState(1);
  const [cEnd, setCEnd] = useState(5);

  // Fancy indexing params
  const [selRows, setSelRows] = useState([0, 2]);
  const [selCols, setSelCols] = useState([1, 3, 4]);

  // Boolean mask params
  const [thresh, setThresh] = useState(25);

  // Array data
  const [editMat, setEditMat] = useState<Matrix | null>(null);
  const arr = useMemo(() => editMat ?? randMatrix(rows, cols, 1, 50, seed), [rows, cols, seed, editMat]);
  const editCell = useCallback((r: number, c: number, v: number) => {
    const copy = arr.map((row) => [...row]); copy[r][c] = v; setEditMat(copy);
  }, [arr]);

  // Basic slice result
  const sliced = useMemo(() => slice2d(arr, rStart, rEnd, cStart, cEnd), [arr, rStart, rEnd, cStart, cEnd]);
  const sliceCells = useMemo(() => {
    const cells: [number, number][] = [];
    for (let r = rStart; r < rEnd; r++) for (let c = cStart; c < cEnd; c++) cells.push([r, c]);
    return cells;
  }, [rStart, rEnd, cStart, cEnd]);

  // Fancy indexing result
  const fancied = useMemo(() =>
    selRows.length && selCols.length ? selRows.map((r) => selCols.map((c) => arr[r]?.[c] ?? 0)) : [],
    [arr, selRows, selCols]
  );
  const fancyCells = useMemo(() => {
    const cells: [number, number][] = [];
    for (const r of selRows) for (const c of selCols) cells.push([r, c]);
    return cells;
  }, [selRows, selCols]);

  // Boolean mask
  const mask = useMemo(() => arr.map((row) => row.map((v) => v > thresh)), [arr, thresh]);
  const maskCells = useMemo(() => {
    const cells: [number, number][] = [];
    mask.forEach((row, i) => row.forEach((v, j) => { if (v) cells.push([i, j]); }));
    return cells;
  }, [mask]);

  // Animation: steps depend on mode
  const totalSteps = mode === "basic" ? sliceCells.length
    : mode === "fancy" ? fancyCells.length
    : rows * cols;
  const anim = useAnimation({ totalSteps, intervalMs: mode === "boolean" ? 250 : 450 });

  const modeOpts: { value: Mode; label: string }[] = [
    { value: "basic", label: "Basic Slice" },
    { value: "fancy", label: "Fancy Indexing" },
    { value: "boolean", label: "Boolean Mask" },
  ];

  return (
    <PageShell title="Slicing & Indexing" accent="emerald">
      <Intro
        what="Slicing extracts a sub-region of an array without copying data. Fancy indexing selects arbitrary rows/columns. Boolean masking filters elements by a condition."
        why="These are the primary ways you select, filter, and subset data in NumPy — essential for data cleaning, feature selection, and any analysis workflow."
        how="Adjust the parameters, then press Play to watch the selection process animate cell by cell. Highlighted cells are included in the result." />

      <ControlsRow>
        <Select label="Mode" value={mode} onChange={setMode as any} options={modeOpts} />
        <Slider label="Rows" value={rows} min={3} max={8} onChange={setRows} />
        <Slider label="Cols" value={cols} min={3} max={8} onChange={setCols} />
        <Slider label="Seed" value={seed} min={1} max={99} onChange={setSeed} />
      </ControlsRow>

      <ArrayInput onParsed={setEditMat} accent="emerald" />

      {/* ═══ BASIC SLICE ═══ */}
      {mode === "basic" && (
        <>
          <div className="flex flex-wrap gap-4 items-end">
            <Slider label="Row start" value={rStart} min={0} max={rows - 1} onChange={setRStart} />
            <Slider label="Row end" value={rEnd} min={rStart + 1} max={rows} onChange={setREnd} />
            <Slider label="Col start" value={cStart} min={0} max={cols - 1} onChange={setCStart} />
            <Slider label="Col end" value={cEnd} min={cStart + 1} max={cols} onChange={setCEnd} />
          </div>

          <Panel title="Animated selection" accent="amber">
            <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} />
            <div className="flex gap-8 flex-wrap items-start">
              <ArrayGrid data={arr} title="Original" accent="cyan" decimals={0} onCellEdit={editCell}
                cellMeta={(r, c) => {
                  const cellIdx = sliceCells.findIndex(([sr, sc]) => sr === r && sc === c);
                  if (cellIdx >= 0 && cellIdx <= anim.step) return { glow: "amber" };
                  if (cellIdx === anim.step + 1) return {};
                  if (cellIdx >= 0) return { dim: false };
                  return { dim: true };
                }} />
              <ArrayGrid
                data={sliced.map((row, i) =>
                  row.map((v, j) => {
                    const flatIdx = i * (cEnd - cStart) + j;
                    return flatIdx <= anim.step ? v : NaN;
                  })
                )}
                title="Sliced result" accent="amber" decimals={0} />
            </div>
            {anim.step < sliceCells.length && (() => {
              const [cr, cc] = sliceCells[anim.step] ?? [rStart, cStart];
              return (
                <FormulaBar accent="amber">
                  Selecting [{cr}, {cc}] = <span className="accent-amber font-bold">{fmt(arr[cr]?.[cc] ?? 0, 0)}</span>
                </FormulaBar>
              );
            })()}
          </Panel>
          <CodePanel code={`arr[${rStart}:${rEnd}, ${cStart}:${cEnd}]`} />
        </>
      )}

      {/* ═══ FANCY INDEXING ═══ */}
      {mode === "fancy" && (
        <>
          <Panel title="Select rows and columns">
            <div className="flex gap-6 flex-wrap">
              <div>
                <span className="text-xs text-txt-muted block mb-1">Rows</span>
                <div className="flex gap-1">
                  {Array.from({ length: rows }, (_, i) => (
                    <button key={i} onClick={() => setSelRows((p) =>
                      p.includes(i) ? p.filter(x => x !== i) : [...p, i].sort()
                    )}
                      className={`w-8 h-8 rounded font-mono text-xs border transition-colors
                        ${selRows.includes(i) ? "accent-bg-cyan accent-border-cyan accent-cyan" : "bg-surface-2 border-edge text-txt-muted"}`}
                    >{i}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-txt-muted block mb-1">Columns</span>
                <div className="flex gap-1">
                  {Array.from({ length: cols }, (_, j) => (
                    <button key={j} onClick={() => setSelCols((p) =>
                      p.includes(j) ? p.filter(x => x !== j) : [...p, j].sort()
                    )}
                      className={`w-8 h-8 rounded font-mono text-xs border transition-colors
                        ${selCols.includes(j) ? "accent-bg-violet accent-border-violet accent-violet" : "bg-surface-2 border-edge text-txt-muted"}`}
                    >{j}</button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          {fancyCells.length > 0 && (
            <Panel title="Animated selection" accent="violet">
              <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} />
              <div className="flex gap-8 flex-wrap items-start">
                <ArrayGrid data={arr} title="Original" accent="cyan" decimals={0} onCellEdit={editCell}
                  cellMeta={(r, c) => {
                    const cellIdx = fancyCells.findIndex(([fr, fc]) => fr === r && fc === c);
                    if (cellIdx >= 0 && cellIdx <= anim.step) return { glow: "violet" };
                    if (cellIdx >= 0) return {};
                    return { dim: true };
                  }} />
                <ArrayGrid
                  data={fancied.map((row, i) =>
                    row.map((v, j) => {
                      const flatIdx = i * selCols.length + j;
                      return flatIdx <= anim.step ? v : NaN;
                    })
                  )}
                  title="Fancy indexed" accent="violet" decimals={0} />
              </div>
              {anim.step < fancyCells.length && (() => {
                const [cr, cc] = fancyCells[anim.step];
                return (
                  <FormulaBar accent="violet">
                    Picking [{cr}, {cc}] = <span className="accent-violet font-bold">{fmt(arr[cr]?.[cc] ?? 0, 0)}</span>
                  </FormulaBar>
                );
              })()}
            </Panel>
          )}
          <CodePanel code={`arr[np.ix_(${JSON.stringify(selRows)}, ${JSON.stringify(selCols)})]`} />
        </>
      )}

      {/* ═══ BOOLEAN MASK ═══ */}
      {mode === "boolean" && (
        <>
          <Slider label={`Threshold (arr > ${thresh})`} value={thresh} min={1} max={49} onChange={setThresh} />

          <Panel title="Animated scan" accent="emerald">
            <AnimControls {...anim} onToggle={anim.toggle} onReset={anim.reset} />
            {(() => {
              const scanR = Math.floor(anim.step / cols);
              const scanC = anim.step % cols;
              const matchesSoFar = maskCells.filter(([r, c]) => r * cols + c <= anim.step);
              return (
                <>
                  <div className="flex gap-8 flex-wrap items-start">
                    <ArrayGrid data={arr} title="Scanning" accent="cyan" decimals={0} onCellEdit={editCell}
                      cellMeta={(r, c) => {
                        const idx = r * cols + c;
                        if (idx === anim.step) return { glow: mask[r][c] ? "emerald" : "rose" };
                        if (idx < anim.step && mask[r][c]) return { glow: "emerald" };
                        if (idx > anim.step) return { dim: true };
                        return {};
                      }} />
                    {matchesSoFar.length > 0 && (
                      <ArrayGrid
                        data={[matchesSoFar.map(([r, c]) => arr[r][c])]}
                        title={`Selected (${matchesSoFar.length})`}
                        accent="emerald" decimals={0} compact />
                    )}
                  </div>
                  <FormulaBar accent="emerald">
                    [{scanR}, {scanC}] = {fmt(arr[scanR]?.[scanC] ?? 0, 0)}
                    {mask[scanR]?.[scanC]
                      ? <span className="accent-emerald font-bold"> — passes (greater than {thresh})</span>
                      : <span className="accent-rose"> — filtered out</span>}
                  </FormulaBar>
                </>
              );
            })()}
          </Panel>
          <CodePanel code={`arr[arr > ${thresh}]`} />
        </>
      )}
    </PageShell>
  );
}
