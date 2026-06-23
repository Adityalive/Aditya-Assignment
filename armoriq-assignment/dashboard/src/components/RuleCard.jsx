import { motion } from "framer-motion";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const badges = {
  allow: { label: "Allow", class: "bg-emerald-500/10 text-emerald-400" },
  block: { label: "Block", class: "bg-red-500/10 text-red-400" },
  require_approval: {
    label: "Require Approval",
    class: "bg-amber-500/10 text-amber-400",
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
      className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => onToggle(rule._id)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          {rule.active ? (
            <ToggleRight className="w-6 h-6 text-emerald-400" />
          ) : (
            <ToggleLeft className="w-6 h-6" />
          )}
        </motion.button>
        <div>
          <p className="font-mono text-sm font-medium">{rule.toolName}</p>
          <span
            className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              badge.class
            } ${!rule.active ? "opacity-50" : ""}`}
          >
            {badge.label}
          </span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onDelete(rule._id)}
        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
