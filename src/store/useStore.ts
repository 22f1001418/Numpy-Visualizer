import { create } from "zustand";

export type PageId =
  | "home"
  | "elementwise"
  | "matmul"
  | "reshape"
  | "broadcasting"
  | "slicing"
  | "aggregation"
  | "stacking"
  | "sorting"
  | "cumulative";

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  accent: string;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "home",         label: "Home",             icon: "🔬", accent: "cyan",    description: "Overview & quick start" },
  { id: "elementwise",  label: "Element-wise",     icon: "➕", accent: "violet",  description: "Add, multiply, compare — cell by cell" },
  { id: "matmul",       label: "Matrix Multiply",  icon: "✖️", accent: "amber",   description: "Step-through A @ B with dot-product drill" },
  { id: "reshape",      label: "Reshape & Transpose", icon: "🔢", accent: "cyan", description: "Watch elements flow into new shapes" },
  { id: "broadcasting", label: "Broadcasting",     icon: "📡", accent: "rose",    description: "See arrays stretch to fit each other" },
  { id: "slicing",      label: "Slicing & Indexing", icon: "✂️", accent: "emerald", description: "Highlight sub-arrays and masks" },
  { id: "aggregation",  label: "Aggregations",     icon: "📊", accent: "cyan",    description: "Collapse axes — sum, mean, max" },
  { id: "stacking",     label: "Stacking & Splitting", icon: "📐", accent: "violet", description: "vstack, hstack, split" },
  { id: "sorting",      label: "Sorting",          icon: "🔃", accent: "amber",   description: "sort, argsort, unique — animated" },
  { id: "cumulative",   label: "Cumulative Ops",   icon: "📈", accent: "rose",    description: "cumsum, cumprod, diff" },
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
