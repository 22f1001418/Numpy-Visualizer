# 🔬 NumPy Visualizer

A cinematic, animation-first interactive tool for visualizing NumPy operations — built with React, Framer Motion, and Tailwind CSS.

**No page reloads. No spinners. Every computation animates cell by cell with spring physics.**

---

## Quick Start

```bash
cd numpy-viz
npm install
npm run dev
```

Opens at **http://localhost:3000**.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **React 18** + TypeScript | Component model, hooks |
| Build | **Vite 6** | Sub-second HMR, instant startup |
| Animations | **Framer Motion 11** | Spring physics, layout animations, AnimatePresence |
| Styling | **Tailwind CSS 3** | Utility-first, dark/light theming via CSS variables |
| State | **Zustand 5** | Minimal, no boilerplate, single store |
| Code display | **prism-react-renderer** | Syntax-highlighted Python snippets |
| Icons | **Lucide React** | Crisp, consistent icon set |
| Math engine | **Custom TypeScript** | `src/lib/ndarray.ts` — lightweight NumPy-like ops |

---

## Features

### 🎬 Step-by-step Animations
Every operation has a transport bar (⏮ ◀ ▶ ▶ ⏭) powered by `requestAnimationFrame` intervals — no page reloads. Hit Play and watch matmul fill cell by cell, cumsum grow a line chart, or a boolean mask scan every element.

### ✏️ Editable Arrays
Double-click any cell → type a new value → press Enter. The entire visualization updates instantly. Every page also has seed/size sliders for quick randomisation.

### 🌙 ☀️ Theme Toggle
One-click dark/light switch in the sidebar. Both themes use CSS custom properties so Plotly charts, grids, and code blocks all adapt seamlessly.

### 🧲 Spring Physics
Cell appearances use Framer Motion springs (`stiffness: 500, damping: 30`) — values animate in/out, highlighted cells glow with CSS box-shadows, and layout shifts use `layout` animations for smooth reshaping.

---

## Pages

| Page | Operations |
|---|---|
| **Element-wise** | `+ − × ÷ ** % >` — animated cell-by-cell with partial result build |
| **Matrix Multiply** | Step-through `A @ B` — highlights active row/column, shows dot product breakdown |
| **Reshape & Transpose** | Elements flow from 1-D into 2-D grid; transpose maps `[i,j] → [j,i]`; flatten animates C-order |
| **Broadcasting** | 3-stage: originals → virtual expansion → element-wise result building |
| **Slicing & Indexing** | Basic slice, fancy indexing (toggle row/col buttons), boolean mask with animated scan |
| **Aggregations** | `sum mean max min` along axis 0/1/None — animated group collapse + inline bar chart |
| **Stacking** | `vstack` / `hstack` — rows/columns assemble one by one with origin tracking |
| **Sorting** | `sort` (animated bar chart), `argsort` (index tracing), `unique` (count bars) |
| **Cumulative Ops** | `cumsum`, `cumprod`, `diff` — animated line chart with running formula |

---

## Project Structure

```
numpy-viz/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Shell: sidebar + page router
│   ├── index.css                   # Tailwind + theme variables + cell glow classes
│   ├── lib/
│   │   └── ndarray.ts              # NumPy-like matrix ops in TypeScript
│   ├── store/
│   │   └── useStore.ts             # Zustand: theme, page, sidebar state
│   ├── hooks/
│   │   └── useAnimation.ts         # Step controller with play/pause/interval
│   ├── components/
│   │   ├── ArrayGrid.tsx           # ⭐ Core array heatmap — animated cells
│   │   ├── AnimControls.tsx        # Transport bar (⏮ ◀ ▶ ▶ ⏭)
│   │   ├── Sidebar.tsx             # Navigation + theme toggle
│   │   ├── CodePanel.tsx           # Syntax-highlighted Python code
│   │   └── UI.tsx                  # PageShell, FormulaBar, Slider, Select, etc.
│   └── pages/
│       ├── Home.tsx
│       ├── ElementWise.tsx
│       ├── MatMul.tsx
│       ├── Reshape.tsx
│       ├── Broadcasting.tsx
│       ├── Slicing.tsx
│       ├── Aggregation.tsx
│       ├── Stacking.tsx
│       ├── Sorting.tsx
│       └── Cumulative.tsx
```

---

## Design Tokens

The entire app is themed via CSS custom properties (`--surface-0` through `--surface-3`, `--text-primary`, `--border-color`, etc.) defined in `src/index.css`. Accent colors (`cyan`, `violet`, `amber`, `emerald`, `rose`) are shared across themes.

Cell highlights use dedicated CSS classes (`.cell-highlight-cyan`, etc.) with `box-shadow` glow effects that adapt to theme brightness.

---

## Extending

**Add a new operation page:**
1. Create `src/pages/MyOp.tsx` using `PageShell`, `ArrayGrid`, `AnimControls`, `CodePanel`
2. Add entry to `NAV_ITEMS` in `src/store/useStore.ts`
3. Import and add to `PAGE_MAP` in `src/App.tsx`

**Add a new NumPy function:**
1. Implement in `src/lib/ndarray.ts`
2. Use in your page component

---

## Deployment

```bash
npm run build        # outputs to dist/
npx serve dist       # preview locally
```

Deploy `dist/` to Vercel, Netlify, Cloudflare Pages, or any static host.

---

## License

MIT
