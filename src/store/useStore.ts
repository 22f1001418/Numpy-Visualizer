import { create } from "zustand";

export type PageId =
  | "home" | "elementwise" | "matmul" | "reshape"
  | "broadcasting" | "slicing" | "aggregation"
  | "stacking" | "sorting" | "cumulative";

export type Accent = "cyan" | "violet" | "amber" | "emerald" | "rose";

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  accent: Accent;
  desc: string;
  category: "core" | "transform" | "analysis";
}

export const NAV_ITEMS: NavItem[] = [
  { id: "elementwise",  label: "Element-wise",        icon: "➕", accent: "violet",  desc: "Add, multiply, compare — cell by cell",            category: "core" },
  { id: "matmul",       label: "Matrix Multiply",     icon: "✖️", accent: "amber",   desc: "Step-through A @ B with dot-product drill-down",   category: "core" },
  { id: "reshape",      label: "Reshape & Transpose",  icon: "🔢", accent: "cyan",    desc: "Watch elements flow into new shapes",              category: "transform" },
  { id: "broadcasting", label: "Broadcasting",         icon: "📡", accent: "rose",    desc: "See arrays stretch to fit each other",              category: "transform" },
  { id: "slicing",      label: "Slicing & Indexing",   icon: "✂️", accent: "emerald", desc: "Highlight sub-arrays, masks, np.where",             category: "transform" },
  { id: "stacking",     label: "Stacking & Splitting", icon: "📐", accent: "violet",  desc: "vstack, hstack, concatenate, split",                category: "transform" },
  { id: "aggregation",  label: "Aggregations",         icon: "📊", accent: "cyan",    desc: "Collapse axes — sum, mean, max, std",               category: "analysis" },
  { id: "sorting",      label: "Sorting",              icon: "🔃", accent: "amber",   desc: "sort, argsort, unique — animated",                  category: "analysis" },
  { id: "cumulative",   label: "Cumulative Ops",       icon: "📈", accent: "rose",    desc: "cumsum, cumprod, diff with live charts",             category: "analysis" },
];

export const CATEGORIES: { key: string; label: string }[] = [
  { key: "core", label: "Core Operations" },
  { key: "transform", label: "Shape & Transform" },
  { key: "analysis", label: "Analysis & Stats" },
];

interface AppState {
  page: PageId;
  theme: "dark" | "light";
  sidebarOpen: boolean;
  speed: number; // multiplier: 0.5, 1, 1.5, 2
  setPage: (p: PageId) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSpeed: (s: number) => void;
}

export const useStore = create<AppState>((set) => ({
  page: "home",
  theme: "dark",
  sidebarOpen: true,
  speed: 1,
  setPage: (p) => set({ page: p }),
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(next);
      return { theme: next };
    }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSpeed: (speed) => set({ speed }),
}));

/** Returns the right CSS class prefix for the current theme's accent */
export function accentClass(a: Accent, type: "text" | "bg" | "border" | "glow" | "heat"): string {
  if (type === "text") return `accent-${a}`;
  if (type === "bg") return `accent-bg-${a}`;
  if (type === "border") return `accent-border-${a}`;
  if (type === "glow") return `cell-glow-${a}`;
  return `cell-heat-${a}`;
}
