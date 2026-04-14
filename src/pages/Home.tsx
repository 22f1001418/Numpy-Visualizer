import { motion } from "framer-motion";
import { useStore, NAV_ITEMS, type PageId } from "../store/useStore";

const ACCENT_MAP: Record<string, string> = {
  cyan: "border-accent-cyan/30 hover:border-accent-cyan/60",
  violet: "border-accent-violet/30 hover:border-accent-violet/60",
  amber: "border-accent-amber/30 hover:border-accent-amber/60",
  rose: "border-accent-rose/30 hover:border-accent-rose/60",
  emerald: "border-accent-emerald/30 hover:border-accent-emerald/60",
};

const ACCENT_TEXT: Record<string, string> = {
  cyan: "text-accent-cyan", violet: "text-accent-violet",
  amber: "text-accent-amber", rose: "text-accent-rose",
  emerald: "text-accent-emerald",
};

export default function Home() {
  const { setPage } = useStore();
  const cards = NAV_ITEMS.filter((n) => n.id !== "home");

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-8 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-3 tracking-tight">
            <span className="text-gradient-cyan">NumPy</span>{" "}
            <span className="text-txt-primary">Visualizer</span>
          </h1>
          <p className="text-txt-secondary text-lg font-mono max-w-xl mx-auto leading-relaxed">
            See every operation. Understand every computation.
            <br />
            <span className="text-txt-muted text-sm">
              Animated step-by-step · Editable arrays · Light & dark themes
            </span>
          </p>

          {/* Floating array animation */}
          <motion.div
            className="mt-10 flex justify-center gap-1 opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.3 }}
          >
            {[3, 7, 1, 9, 4, 2, 8, 5, 6].map((v, i) => (
              <motion.div
                key={i}
                className="w-10 h-10 rounded-md bg-surface-2 border border-edge
                           flex items-center justify-center font-mono text-sm text-txt-muted"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.06, type: "spring", stiffness: 200 }}
              >
                {v}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPage(item.id)}
              className={`
                text-left px-5 py-5 rounded-xl bg-surface-1 border
                transition-all duration-200 group
                ${ACCENT_MAP[item.accent]}
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <div className={`font-semibold text-sm mb-1 ${ACCENT_TEXT[item.accent]}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-txt-muted leading-relaxed">
                    {item.description}
                  </div>
                </div>
              </div>
              <div className={`
                mt-3 text-[10px] font-mono uppercase tracking-wider
                ${ACCENT_TEXT[item.accent]} opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              `}>
                Open →
              </div>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-txt-muted mt-12 font-mono"
        >
          Double-click any cell to edit · Use ▶ Play to animate · Toggle 🌙/☀️ in sidebar
        </motion.p>
      </div>
    </div>
  );
}
