import { motion, AnimatePresence } from "framer-motion";
import { type Matrix, fmt } from "../lib/ndarray";
import { useState, useCallback } from "react";

type AccentColor = "cyan" | "violet" | "amber" | "emerald" | "rose";

interface CellMeta {
  highlight?: AccentColor;
  dim?: boolean;
  computed?: boolean;
}

interface Props {
  data: Matrix;
  title?: string;
  accent?: AccentColor;
  cellMeta?: (row: number, col: number) => CellMeta;
  onCellEdit?: (row: number, col: number, value: number) => void;
  decimals?: number;
  compact?: boolean;
  label?: string;
  showIndices?: boolean;
}

const ACCENT_BG: Record<AccentColor, string> = {
  cyan:    "bg-cyan-500/10",
  violet:  "bg-violet-500/10",
  amber:   "bg-amber-500/10",
  emerald: "bg-emerald-500/10",
  rose:    "bg-rose-500/10",
};

const ACCENT_BORDER: Record<AccentColor, string> = {
  cyan:    "border-cyan-500/30",
  violet:  "border-violet-500/30",
  amber:   "border-amber-500/30",
  emerald: "border-emerald-500/30",
  rose:    "border-rose-500/30",
};

const ACCENT_TEXT: Record<AccentColor, string> = {
  cyan:    "text-accent-cyan",
  violet:  "text-accent-violet",
  amber:   "text-accent-amber",
  emerald: "text-accent-emerald",
  rose:    "text-accent-rose",
};

export default function ArrayGrid({
  data, title, accent = "cyan", cellMeta, onCellEdit,
  decimals = 1, compact = false, label, showIndices = true,
}: Props) {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const cellSize = compact ? "min-w-[42px] h-[38px] text-xs" : "min-w-[56px] h-[48px] text-sm";

  const [editingCell, setEditingCell] = useState<[number, number] | null>(null);
  const [editVal, setEditVal] = useState("");

  const handleDoubleClick = useCallback((r: number, c: number) => {
    if (!onCellEdit) return;
    setEditingCell([r, c]);
    setEditVal(fmt(data[r][c], decimals));
  }, [onCellEdit, data, decimals]);

  const commitEdit = useCallback(() => {
    if (!editingCell || !onCellEdit) return;
    const n = parseFloat(editVal);
    if (!isNaN(n)) onCellEdit(editingCell[0], editingCell[1], n);
    setEditingCell(null);
  }, [editingCell, editVal, onCellEdit]);

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      {(title || label) && (
        <div className="flex items-center gap-3">
          {title && (
            <span className={`font-mono text-xs font-semibold tracking-wide uppercase ${ACCENT_TEXT[accent]}`}>
              {title}
            </span>
          )}
          {label && (
            <span className="font-mono text-[11px] text-txt-muted bg-surface-2 px-2 py-0.5 rounded">
              {label}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {/* Column indices */}
        {showIndices && cols > 0 && (
          <div className="flex ml-8 mb-1">
            {Array.from({ length: cols }, (_, j) => (
              <div key={j} className={`${compact ? "min-w-[42px]" : "min-w-[56px]"} text-center font-mono text-[10px] text-txt-muted`}>
                {j}
              </div>
            ))}
          </div>
        )}

        {/* Grid rows */}
        <div className="flex flex-col gap-[3px]">
          <AnimatePresence mode="popLayout">
            {data.map((row, i) => (
              <motion.div
                key={`row-${i}`}
                className="flex items-center gap-[3px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Row index */}
                {showIndices && (
                  <div className="w-7 text-right font-mono text-[10px] text-txt-muted pr-1 shrink-0">
                    {i}
                  </div>
                )}

                {/* Cells */}
                {row.map((val, j) => {
                  const meta = cellMeta?.(i, j) ?? {};
                  const isEditing = editingCell?.[0] === i && editingCell?.[1] === j;
                  const hlClass = meta.highlight ? `cell-highlight-${meta.highlight}` : "";
                  const isNan = Number.isNaN(val);

                  return (
                    <motion.div
                      key={`cell-${i}-${j}`}
                      layout
                      className={`
                        ${cellSize} flex items-center justify-center
                        rounded-md border font-mono font-medium
                        transition-colors duration-200 select-none
                        ${meta.dim ? "opacity-30" : ""}
                        ${meta.computed ? ACCENT_BG[accent] + " " + ACCENT_BORDER[accent] : ""}
                        ${hlClass}
                        ${!hlClass && !meta.computed ? "bg-surface-1 border-edge" : ""}
                        ${onCellEdit ? "cursor-pointer hover:border-accent-cyan/50" : ""}
                        ${isNan ? "bg-surface-2 text-txt-muted italic" : ""}
                      `}
                      onDoubleClick={() => handleDoubleClick(i, j)}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: meta.dim ? 0.3 : 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30, delay: (i * cols + j) * 0.01 }}
                    >
                      {isEditing ? (
                        <input
                          className="w-full h-full bg-transparent text-center text-accent-cyan outline-none font-mono text-sm"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingCell(null); }}
                          autoFocus
                        />
                      ) : (
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={val}
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={meta.highlight ? ACCENT_TEXT[meta.highlight] + " font-bold" : ""}
                          >
                            {isNan ? "—" : fmt(val, decimals)}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
