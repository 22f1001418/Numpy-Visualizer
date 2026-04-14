import { motion } from "framer-motion";
import { Sun, Moon, PanelLeftClose, PanelLeft } from "lucide-react";
import { useStore, NAV_ITEMS } from "../store/useStore";

export default function Sidebar() {
  const { page, setPage, theme, toggleTheme, sidebarOpen, toggleSidebar } = useStore();

  return (
    <>
      {/* Collapsed toggle button */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center
                     rounded-lg bg-surface-1 border border-edge text-txt-secondary
                     hover:text-txt-primary hover:bg-surface-2 transition-colors"
        >
          <PanelLeft size={16} />
        </motion.button>
      )}

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="shrink-0 h-full bg-surface-1 border-r border-edge flex flex-col overflow-hidden"
      >
        <div className="min-w-[260px] flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage("home")}>
              <span className="text-xl">🔬</span>
              <div>
                <div className="font-semibold text-sm text-gradient-cyan leading-tight">NumPy Viz</div>
                <div className="text-[10px] text-txt-muted font-mono">v2.0</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-txt-muted hover:text-txt-primary hover:bg-surface-2 transition-colors"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-txt-muted hover:text-txt-primary hover:bg-surface-2 transition-colors"
              >
                <PanelLeftClose size={15} />
              </motion.button>
            </div>
          </div>

          <div className="h-px bg-edge mx-3 my-2" />

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            <div className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => {
                const active = page === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPage(item.id)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                      transition-colors duration-150 group w-full
                      ${active
                        ? "bg-accent-cyan/10 text-accent-cyan"
                        : "text-txt-secondary hover:text-txt-primary hover:bg-surface-2"}
                    `}
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${active ? "text-accent-cyan" : ""}`}>
                        {item.label}
                      </div>
                    </div>
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-edge">
            <p className="text-[10px] text-txt-muted font-mono text-center">
              Double-click cells to edit values
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
