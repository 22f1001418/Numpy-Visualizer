import { motion } from "framer-motion";
import { useStore, NAV_ITEMS, CATEGORIES, type PageId } from "../store/useStore";
import { Sparkles, Zap, Palette, MousePointerClick } from "lucide-react";

export default function Home() {
  const { setPage } = useStore();
  const cards = NAV_ITEMS;

  return (
    <div className="flex-1 overflow-y-auto mesh-bg">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-10 relative z-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="text-center mb-14">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }}
            className="inline-block mb-4">
            <span className="text-5xl">🔬</span>
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            <span className="text-grad-cyan">NumPy</span>{" "}
            <span className="text-txt-primary">Visualizer</span>
          </h1>
          <p className="text-txt-secondary text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
            See every operation. Understand every computation.
          </p>

          {/* Animated demo array */}
          <motion.div className="mt-8 flex justify-center gap-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {[3, 7, 1, 9, 4, 2, 8, 5, 6].map((v, i) => (
              <motion.div
                key={i}
                className={`w-11 h-11 rounded-lg border-[1.5px] flex items-center justify-center font-mono text-sm font-medium cell-heat-cyan-${Math.min(4, Math.floor(v / 2.5))}`}
                style={{ borderColor: "var(--cell-border)" }}
                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 300 }}
              >
                {v}
              </motion.div>
            ))}
          </motion.div>

          {/* Feature pills */}
          <div className="flex justify-center gap-3 mt-6 flex-wrap">
            {[
              { icon: <Zap size={12} />, label: "Step-by-step animations", color: "cyan" },
              { icon: <MousePointerClick size={12} />, label: "Editable cells & array input", color: "violet" },
              { icon: <Palette size={12} />, label: "Dark & light themes", color: "amber" },
              { icon: <Sparkles size={12} />, label: "Heatmap coloring", color: "emerald" },
            ].map((f) => (
              <span key={f.label} className={`flex items-center gap-1.5 text-[11px] font-medium accent-${f.color} accent-bg-${f.color} px-3 py-1.5 rounded-full border accent-border-${f.color}`}>
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Categorized cards */}
        {CATEGORIES.map((cat) => {
          const items = cards.filter((n) => n.category === cat.key);
          return (
            <div key={cat.key} className="mb-8">
              <h2 className="text-[10px] uppercase tracking-[0.15em] text-txt-muted font-bold mb-3 px-1">
                {cat.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.04, type: "spring", stiffness: 200 }}
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPage(item.id)}
                    className={`text-left glass-panel px-5 py-4 group hover:accent-border-${item.accent} border transition-all duration-200`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div className={`font-semibold text-sm mb-0.5 accent-${item.accent}`}>{item.label}</div>
                        <div className="text-[11px] text-txt-muted leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                    <div className={`mt-2.5 text-[9px] font-mono uppercase tracking-wider accent-${item.accent} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                      Explore <span className="text-base">→</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="text-center text-[10px] text-txt-muted mt-8 font-mono">
          Space = play/pause · ← → = step · Double-click cells to edit · Paste arrays via terminal icon
        </motion.p>
      </div>
    </div>
  );
}
