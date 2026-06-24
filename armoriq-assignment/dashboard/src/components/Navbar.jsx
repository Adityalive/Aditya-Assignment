import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ScrollText, MessageSquare, FileText, Coins, Wrench, Link2 } from "lucide-react";

const links = [
  { to: "/rules", label: "Rules", icon: Shield },
  { to: "/logs", label: "Logs", icon: ScrollText },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/notes", label: "Notes", icon: FileText },
  { to: "/budget", label: "Budget", icon: Coins },
  { to: "/integrations", label: "Integrations", icon: Link2 },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-gray-950" strokeWidth={2.5} />
            </div>
            <div className="absolute inset-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 blur-lg opacity-40" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-gradient">ArmorIQ</span>
            <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase -mt-0.5">Agent Guard</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/5"
        >
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-emerald-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </motion.div>
      </div>
    </nav>
  );
}
