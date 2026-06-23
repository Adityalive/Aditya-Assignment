import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ScrollText, MessageSquare, FileText } from "lucide-react";

const links = [
  { to: "/rules", label: "Rules", icon: Shield },
  { to: "/logs", label: "Logs", icon: ScrollText },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/notes", label: "Notes", icon: FileText },
];

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>ArmorIQ</span>
        </motion.div>
        <div className="flex gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
