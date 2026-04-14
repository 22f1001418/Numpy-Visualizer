/**
 * Lightweight NumPy-like matrix operations in TypeScript.
 * Uses number[][] for 2-D and number[] for 1-D.
 */

export type Matrix = number[][];
export type Vector = number[];

// ── Seeded PRNG (xoshiro128**) ────────────────────────────
function splitmix32(a: number) {
  return () => {
    a |= 0; a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16); t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15); t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

export function seededRandom(seed: number) {
  const rng = splitmix32(seed);
  return {
    random: () => rng(),
    randint: (lo: number, hi: number) => Math.floor(rng() * (hi - lo)) + lo,
  };
}

// ── Creation ──────────────────────────────────────────────
export function zeros(r: number, c: number): Matrix {
  return Array.from({ length: r }, () => Array(c).fill(0));
}

export function ones(r: number, c: number): Matrix {
  return Array.from({ length: r }, () => Array(c).fill(1));
}

export function arange(start: number, stop: number, step = 1): Vector {
  const out: number[] = [];
  for (let i = start; i < stop; i += step) out.push(i);
  return out;
}

export function randMatrix(r: number, c: number, lo: number, hi: number, seed: number): Matrix {
  const { randint } = seededRandom(seed);
  return Array.from({ length: r }, () =>
    Array.from({ length: c }, () => randint(lo, hi))
  );
}

export function randVector(n: number, lo: number, hi: number, seed: number): Vector {
  const { randint } = seededRandom(seed);
  return Array.from({ length: n }, () => randint(lo, hi));
}

// ── Shape helpers ─────────────────────────────────────────
export function shape(m: Matrix): [number, number] {
  return [m.length, m[0]?.length ?? 0];
}

export function reshape(flat: Vector, r: number, c: number): Matrix {
  const out: Matrix = [];
  for (let i = 0; i < r; i++) out.push(flat.slice(i * c, (i + 1) * c));
  return out;
}

export function flatten(m: Matrix): Vector {
  return m.flat();
}

export function transpose(m: Matrix): Matrix {
  const [r, c] = shape(m);
  return Array.from({ length: c }, (_, j) =>
    Array.from({ length: r }, (_, i) => m[i][j])
  );
}

// ── Element-wise ──────────────────────────────────────────
type BinOp = (a: number, b: number) => number;

function elementwise(a: Matrix, b: Matrix, fn: BinOp): Matrix {
  return a.map((row, i) => row.map((v, j) => fn(v, b[i][j])));
}

export const add      = (a: Matrix, b: Matrix) => elementwise(a, b, (x, y) => x + y);
export const subtract = (a: Matrix, b: Matrix) => elementwise(a, b, (x, y) => x - y);
export const multiply = (a: Matrix, b: Matrix) => elementwise(a, b, (x, y) => x * y);
export const divide   = (a: Matrix, b: Matrix) => elementwise(a, b, (x, y) => y !== 0 ? x / y : NaN);
export const power    = (a: Matrix, b: Matrix) => elementwise(a, b, (x, y) => Math.pow(x, y));
export const mod      = (a: Matrix, b: Matrix) => elementwise(a, b, (x, y) => x % y);
export const greater  = (a: Matrix, b: Matrix) => elementwise(a, b, (x, y) => x > y ? 1 : 0);

export function scalarOp(m: Matrix, s: number, fn: BinOp): Matrix {
  return m.map((row) => row.map((v) => fn(v, s)));
}

// ── Matrix multiply ───────────────────────────────────────
export function matmul(a: Matrix, b: Matrix): Matrix {
  const [rA, cA] = shape(a);
  const [, cB] = shape(b);
  const out = zeros(rA, cB);
  for (let i = 0; i < rA; i++)
    for (let j = 0; j < cB; j++)
      for (let k = 0; k < cA; k++)
        out[i][j] += a[i][k] * b[k][j];
  return out;
}

export function dot(a: Vector, b: Vector): number {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

// ── Aggregations ──────────────────────────────────────────
export function sumAxis(m: Matrix, axis: 0 | 1 | null): Vector | number {
  const [r, c] = shape(m);
  if (axis === null) return m.flat().reduce((s, v) => s + v, 0);
  if (axis === 0) return Array.from({ length: c }, (_, j) =>
    m.reduce((s, row) => s + row[j], 0));
  return m.map((row) => row.reduce((s, v) => s + v, 0));
}

export function meanAxis(m: Matrix, axis: 0 | 1 | null): Vector | number {
  const [r, c] = shape(m);
  const s = sumAxis(m, axis);
  if (axis === null) return (s as number) / (r * c);
  if (axis === 0) return (s as Vector).map((v) => v / r);
  return (s as Vector).map((v) => v / c);
}

export function maxAxis(m: Matrix, axis: 0 | 1 | null): Vector | number {
  const [r, c] = shape(m);
  if (axis === null) return Math.max(...m.flat());
  if (axis === 0) return Array.from({ length: c }, (_, j) =>
    Math.max(...m.map((row) => row[j])));
  return m.map((row) => Math.max(...row));
}

export function minAxis(m: Matrix, axis: 0 | 1 | null): Vector | number {
  const [r, c] = shape(m);
  if (axis === null) return Math.min(...m.flat());
  if (axis === 0) return Array.from({ length: c }, (_, j) =>
    Math.min(...m.map((row) => row[j])));
  return m.map((row) => Math.min(...row));
}

// ── Slicing ───────────────────────────────────────────────
export function slice2d(
  m: Matrix,
  rowStart: number, rowEnd: number,
  colStart: number, colEnd: number
): Matrix {
  return m.slice(rowStart, rowEnd).map((r) => r.slice(colStart, colEnd));
}

// ── Broadcasting (simple: scalar or matching dim-1) ───────
export function broadcastAdd(a: Matrix, b: Matrix): Matrix {
  const [rA, cA] = shape(a);
  const [rB, cB] = shape(b);
  const rOut = Math.max(rA, rB);
  const cOut = Math.max(cA, cB);
  const out = zeros(rOut, cOut);
  for (let i = 0; i < rOut; i++)
    for (let j = 0; j < cOut; j++)
      out[i][j] = a[i % rA][j % cA] + b[i % rB][j % cB];
  return out;
}

// ── Stacking ──────────────────────────────────────────────
export function vstack(a: Matrix, b: Matrix): Matrix {
  return [...a.map((r) => [...r]), ...b.map((r) => [...r])];
}

export function hstack(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => [...row, ...b[i]]);
}

// ── Sorting ───────────────────────────────────────────────
export function sort(v: Vector): Vector {
  return [...v].sort((a, b) => a - b);
}

export function argsort(v: Vector): Vector {
  return v.map((_, i) => i).sort((a, b) => v[a] - v[b]);
}

// ── Cumulative ────────────────────────────────────────────
export function cumsum(v: Vector): Vector {
  const out: Vector = [];
  let s = 0;
  for (const x of v) { s += x; out.push(s); }
  return out;
}

export function cumprod(v: Vector): Vector {
  const out: Vector = [];
  let p = 1;
  for (const x of v) { p *= x; out.push(p); }
  return out;
}

export function diff(v: Vector): Vector {
  return v.slice(1).map((x, i) => x - v[i]);
}

// ── Formatting ────────────────────────────────────────────
export function fmt(n: number, decimals = 1): string {
  if (Number.isNaN(n)) return "—";
  if (!Number.isFinite(n)) return "∞";
  return Number.isInteger(n) ? n.toString() : n.toFixed(decimals);
}
