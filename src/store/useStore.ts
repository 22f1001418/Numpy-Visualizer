import { create } from "zustand";

export type PageId =
  | "home" | "elementwise" | "matmul" | "reshape"
  | "broadcasting" | "slicing" | "aggregation"
  | "stacking" | "sorting" | "cumulative";

export type Accent = "cyan" | "violet" | "amber" | "emerald" | "rose";

// iconName refers to a Lucide icon — rendered in Sidebar/Home via <Icon>
export interface NavItem {
  id: PageId;
  label: string;
  iconName: string;       // lucide icon key
  accent: Accent;
  desc: string;
  category: "core" | "transform" | "analysis";
}

export const NAV_ITEMS: NavItem[] = [
  { id: "elementwise",  label: "Element-wise Ops",     iconName: "plus-circle",    accent: "violet",  desc: "Add, multiply, compare cell by cell",             category: "core" },
  { id: "matmul",       label: "Matrix Multiply",      iconName: "grid-3x3",       accent: "amber",   desc: "Step through A @ B with dot-product breakdown",   category: "core" },
  { id: "reshape",      label: "Reshape & Transpose",  iconName: "move-3d",        accent: "cyan",    desc: "Watch elements flow into new shapes",              category: "transform" },
  { id: "broadcasting", label: "Broadcasting",          iconName: "radio",          accent: "rose",    desc: "See how arrays stretch to fit each other",         category: "transform" },
  { id: "slicing",      label: "Slicing & Indexing",    iconName: "scissors",       accent: "emerald", desc: "Extract sub-arrays, masks, and selections",        category: "transform" },
  { id: "stacking",     label: "Stacking & Splitting",  iconName: "layers",         accent: "violet",  desc: "Combine and divide arrays along axes",             category: "transform" },
  { id: "aggregation",  label: "Aggregations",          iconName: "bar-chart-2",    accent: "cyan",    desc: "Collapse axes with sum, mean, max",                category: "analysis" },
  { id: "sorting",      label: "Sorting",               iconName: "arrow-up-down",  accent: "amber",   desc: "Sort, argsort, and unique with animation",         category: "analysis" },
  { id: "cumulative",   label: "Cumulative Ops",        iconName: "trending-up",    accent: "rose",    desc: "Running totals with cumsum, cumprod, diff",        category: "analysis" },
];

export const CATEGORIES = [
  { key: "core",      label: "Core Operations" },
  { key: "transform", label: "Shape & Transform" },
  { key: "analysis",  label: "Analysis" },
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
