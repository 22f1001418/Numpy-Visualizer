import { create } from "zustand";

export type PageId =
  | "home" | "elementwise" | "matmul" | "reshape"
  | "broadcasting" | "slicing" | "aggregation"
  | "stacking" | "sorting" | "cumulative";

export type Accent = "cyan" | "violet" | "amber" | "emerald" | "rose";

export type IconKey =
  | "plus" | "grid3x3" | "layoutGrid" | "radio" | "scissors"
  | "layers" | "barChart3" | "arrowUpDown" | "trendingUp";

export interface NavItem {
  id: PageId;
  label: string;
  iconKey: IconKey;
  accent: Accent;
  desc: string;
  category: "core" | "transform" | "analysis";
}

export const NAV_ITEMS: NavItem[] = [
  { id: "elementwise",  label: "Element-wise",         iconKey: "plus",        accent: "violet",  desc: "Add, multiply, compare — cell by cell",            category: "core" },
  { id: "matmul",       label: "Matrix Multiply",      iconKey: "grid3x3",     accent: "amber",   desc: "Step-through A @ B with dot-product drill-down",   category: "core" },
  { id: "reshape",      label: "Reshape & Transpose",  iconKey: "layoutGrid",  accent: "cyan",    desc: "Watch elements flow into new shapes",              category: "transform" },
  { id: "broadcasting", label: "Broadcasting",          iconKey: "radio",       accent: "rose",    desc: "See arrays stretch to fit each other",             category: "transform" },
  { id: "slicing",      label: "Slicing & Indexing",    iconKey: "scissors",    accent: "emerald", desc: "Highlight sub-arrays and boolean masks",           category: "transform" },
  { id: "stacking",     label: "Stacking & Splitting",  iconKey: "layers",      accent: "violet",  desc: "vstack, hstack, concatenate, split",               category: "transform" },
  { id: "aggregation",  label: "Aggregations",          iconKey: "barChart3",   accent: "cyan",    desc: "Collapse axes — sum, mean, max, std",              category: "analysis" },
  { id: "sorting",      label: "Sorting",               iconKey: "arrowUpDown", accent: "amber",   desc: "sort, argsort, unique — animated",                 category: "analysis" },
  { id: "cumulative",   label: "Cumulative Ops",        iconKey: "trendingUp",  accent: "rose",    desc: "cumsum, cumprod, diff with live charts",           category: "analysis" },
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
  setPage: (p: PageId) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  page: "home",
  theme: "dark",
  sidebarOpen: true,
  setPage: (p) => set({ page: p }),
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(next);
      return { theme: next };
    }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

/** Returns the right CSS class prefix for the current theme's accent */
export function accentClass(a: Accent, type: "text" | "bg" | "border" | "glow" | "heat"): string {
  if (type === "text") return `accent-${a}`;
  if (type === "bg") return `accent-bg-${a}`;
  if (type === "border") return `accent-border-${a}`;
  if (type === "glow") return `cell-glow-${a}`;
  return `cell-heat-${a}`;
}
