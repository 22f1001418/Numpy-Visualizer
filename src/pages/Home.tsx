import { motion } from "framer-motion";
import { useStore, NAV_ITEMS, CATEGORIES } from "../store/useStore";
import { Microscope, icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function getIcon(name: string): LucideIcon {
  const pascal = name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
  return (icons as Record<string, LucideIcon>)[pascal] ?? Microscope;
}

export default function Home() {
  const { setPage } = useStore();

  return (
    <div className="flex-1 overflow-y-auto mesh-bg">
      <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Microscope size={36} className="accent-cyan mx-auto mb-3" />
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-grad-cyan">NumPy</span> <span className="text-txt-primary">Visualizer</span>
          </h1>
          <p className="text-txt-secondary text-sm max-w-md mx-auto">
            Interactive visual exploration of NumPy array operations.
            Pick a topic below to start learning.
          </p>
        </motion.div>

        {CATEGORIES.map((cat) => {
          const items = NAV_ITEMS.filter((n) => n.category === cat.key);
          return (
            <div key={cat.key} className="mb-6">
              <h2 className="text-[10px] uppercase tracking-[0.15em] text-txt-muted font-bold mb-2.5 px-1">{cat.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, idx) => {
                  const Icon = getIcon(item.iconName);
                  return (
                    <motion.button key={item.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + idx * 0.03 }}
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setPage(item.id)}
                      className={`text-left glass-panel px-4 py-4 group hover:accent-border-${item.accent} border transition-all`}>
                      <div className="flex items-start gap-3">
                        <Icon size={18} className={`accent-${item.accent} shrink-0 mt-0.5`} />
                        <div>
                          <div className={`font-semibold text-sm mb-0.5 accent-${item.accent}`}>{item.label}</div>
                          <div className="text-[11px] text-txt-muted leading-relaxed">{item.desc}</div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
