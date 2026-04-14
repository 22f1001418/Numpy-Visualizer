import {
  Plus, Grid3x3, LayoutGrid, Radio, Scissors,
  Layers, BarChart3, ArrowUpDown, TrendingUp, Box,
} from "lucide-react";
import type { IconKey } from "../store/useStore";

const ICON_MAP: Record<IconKey, React.FC<{ size?: number; className?: string }>> = {
  plus: Plus,
  grid3x3: Grid3x3,
  layoutGrid: LayoutGrid,
  radio: Radio,
  scissors: Scissors,
  layers: Layers,
  barChart3: BarChart3,
  arrowUpDown: ArrowUpDown,
  trendingUp: TrendingUp,
};

export default function NavIcon({ iconKey, size = 16, className }: { iconKey: IconKey; size?: number; className?: string }) {
  const Icon = ICON_MAP[iconKey] ?? Box;
  return <Icon size={size} className={className} />;
}
