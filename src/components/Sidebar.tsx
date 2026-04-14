import { motion } from "framer-motion";
import { Sun, Moon, PanelLeftClose, PanelLeft, Microscope, icons } from "lucide-react";
import { useStore, NAV_ITEMS, CATEGORIES } from "../store/useStore";
import type { LucideIcon } from "lucide-react";

function getIcon(name: string): LucideIcon {
  const pascal = name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
  return (icons as Record<string, LucideIcon>)[pascal] ?? Microscope;
}

export default function Sidebar() {
  const { page, setPage, theme, toggleTheme, sidebarOpen, toggleSidebar } = useStore();

  return (
    <>
      {!sidebarOpen && (
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-surface-1 border border-edge text-txt-secondary hover:text-txt-primary transition-colors">
          <PanelLeft size={16} />
        </motion.button>
      )}

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="shrink-0 h-full border-r border-edge flex flex-col overflow-hidden"
        style={{ background: "var(--s1)" }}>
        <div className="min-w-[260px] flex flex-col h-full">
          <div className="flex items-center justify-between px-4 pt-5 pb-3">
            <button className="flex items-center gap-2.5" onClick={() => setPage("home")}>
              <Microscope size={20} className="accent-cyan" />
              <div>
                <div className="font-bold text-sm text-grad-cyan leading-tight">NumPy Visualizer</div>
                <div className="text-[9px] text-txt-muted font-mono mt-0.5">Interactive learning tool</div>
              </div>
            </button>
            <div className="flex items-center gap-0.5">
              <IcoBtn onClick={toggleTheme} tip={theme === "dark" ? "Light" : "Dark"}>
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </IcoBtn>
              <IcoBtn onClick={toggleSidebar} tip="Collapse"><PanelLeftClose size={14} /></IcoBtn>
            </div>
          </div>
          <div className="h-px bg-edge mx-4" />
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {CATEGORIES.map((cat) => {
              const items = NAV_ITEMS.filter((n) => n.category === cat.key);
              return (
                <div key={cat.key} className="mb-3">
                  <div className="text-[9px] uppercase tracking-[0.15em] text-txt-muted font-bold px-2 mb-1.5">{cat.label}</div>
                  {items.map((item) => {
                    const active = page === item.id;
                    const Icon = getIcon(item.iconName);
                    return (
                      <motion.button key={item.id} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setPage(item.id)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left w-full transition-all duration-150 mb-0.5
                          ${active ? `accent-bg-${item.accent}` : "hover:bg-surface-2"}`}>
                        <Icon size={16} className={active ? `accent-${item.accent}` : "text-txt-muted"} />
                        <span className={`text-[13px] font-medium truncate ${active ? `accent-${item.accent}` : "text-txt-secondary"}`}>
                          {item.label}
                        </span>
                        {active && <motion.div layoutId="nav-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
          <div className="px-4 py-3 border-t border-edge text-[9px] text-txt-muted font-mono">
            Double-click cells to edit values
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function IcoBtn({ children, onClick, tip }: { children: React.ReactNode; onClick: () => void; tip: string }) {
  return (
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClick} title={tip}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-2 transition-colors">
      {children}
    </motion.button>
  );
}
