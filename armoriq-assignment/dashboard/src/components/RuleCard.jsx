import { motion } from "framer-motion";
import { Trash2, ToggleLeft, ToggleRight, Zap } from "lucide-react";

const badges = {
  allow: {
    label: "Allow",
    class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  block: {
    label: "Block",
    class: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    glow: "shadow-red-500/20",
  },
  require_approval: {
    label: "Require Approval",
    class: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
  },
};

export default function RuleCard({ rule, onToggle, onDelete }) {
  const badge = badges[rule.ruleType] || badges.allow;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
        rule.active
          ? "bg-gray-900/80 border-white/5 hover:border-white/10 hover:bg-gray-900"
          : "bg-gray-900/40 border-white/5 opacity-60 hover:opacity-80"
      }`}
    >
      {rule.active && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${
          rule.ruleType === "allow" ? "from-emerald-400 to-emerald-600" :
          rule.ruleType === "block" ? "from-red-400 to-red-600" :
          "from-amber-400 to-amber-600"
        }`} />
      )}

      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onToggle(rule._id)}
          className="relative group/toggle"
        >
          {rule.active ? (
            <div className="relative">
              <ToggleRight className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
          ) : (
            <ToggleLeft className="w-7 h-7 text-gray-600 group-hover/toggle:text-gray-400 transition-colors" />
          )}
        </motion.button>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm font-semibold text-gray-100">{rule.toolName}</p>
            <Zap className={`w-3 h-3 ${rule.active ? "text-emerald-400" : "text-gray-600"}`} />
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium border ${badge.class}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${rule.active ? `shadow-sm ${badge.glow}` : ""}`} />
            {badge.label}
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onDelete(rule._id)}
        className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
