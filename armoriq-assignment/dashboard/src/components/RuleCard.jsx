import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Zap,
  Shield,
  ShieldOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react";

const ruleConfig = {
  allow: {
    label: "Allow",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/25",
    badgeText: "text-emerald-300",
    dot: "bg-emerald-400",
    glowColor: "rgba(16,185,129,0.15)",
    borderActive: "border-emerald-500/20",
    accent: "from-emerald-400 to-emerald-600",
    ringColor: "ring-emerald-500/20",
    pill: "bg-emerald-400",
  },
  block: {
    label: "Block",
    icon: XCircle,
    iconColor: "text-red-400",
    badgeBg: "bg-red-500/10",
    badgeBorder: "border-red-500/25",
    badgeText: "text-red-300",
    dot: "bg-red-400",
    glowColor: "rgba(239,68,68,0.15)",
    borderActive: "border-red-500/20",
    accent: "from-red-400 to-red-600",
    ringColor: "ring-red-500/20",
    pill: "bg-red-400",
  },
  require_approval: {
    label: "Needs Approval",
    icon: Clock,
    iconColor: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/25",
    badgeText: "text-amber-300",
    dot: "bg-amber-400",
    glowColor: "rgba(245,158,11,0.15)",
    borderActive: "border-amber-500/20",
    accent: "from-amber-400 to-amber-600",
    ringColor: "ring-amber-500/20",
    pill: "bg-amber-400",
  },
};

const toolIcons = {
  create_note: "📝",
  read_note: "📖",
  update_note: "✏️",
  delete_note: "🗑️",
  list_notes: "📋",
  search_web: "🔍",
};

export default function RuleCard({ rule, onToggle, onDelete, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cfg = ruleConfig[rule.ruleType] || ruleConfig.allow;
  const TypeIcon = cfg.icon;
  const emoji = toolIcons[rule.toolName] || "⚙️";

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(rule._id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: 40 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        delay: index * 0.04,
      }}
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
        rule.active
          ? `${cfg.borderActive} hover:border-white/15`
          : "border-white/[0.05] opacity-55 hover:opacity-75"
      }`}
      style={{
        background: rule.active
          ? `linear-gradient(145deg, rgba(15,20,35,0.9), rgba(10,14,26,0.9))`
          : "rgba(10,14,26,0.5)",
        boxShadow: rule.active
          ? `0 0 0 1px rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3), inset 0 0 30px ${cfg.glowColor}`
          : "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Active state accent bar */}
      <AnimatePresence>
        {rule.active && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${cfg.accent} rounded-l-2xl origin-top`}
          />
        )}
      </AnimatePresence>

      {/* Top shimmer line */}
      {rule.active && (
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-40"
          style={{
            background: `linear-gradient(90deg, transparent, ${cfg.glowColor.replace("0.15", "0.6")}, transparent)`,
          }}
        />
      )}

      <div className="px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Tool emoji icon */}
          <div
            className={`relative w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300 ${
              rule.active ? "bg-white/[0.06]" : "bg-white/[0.03]"
            }`}
          >
            {emoji}
            {rule.active && (
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${cfg.pill} border-2 border-gray-950 shadow-sm`}
              />
            )}
          </div>

          {/* Tool name + badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-white tracking-tight truncate">
                {rule.toolName}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}`}
              >
                <TypeIcon className="w-3 h-3" />
                {cfg.label}
              </span>
              {!rule.active && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-gray-500 border border-white/5">
                  <ShieldOff className="w-3 h-3" />
                  Off
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-gray-700" />
              {rule.active ? "Enforced · takes effect immediately" : "Disabled · not enforcing"}
            </p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Toggle Switch */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggle(rule._id)}
              className="relative group/toggle focus:outline-none"
              title={rule.active ? "Deactivate rule" : "Activate rule"}
            >
              <div
                className={`w-11 h-6 rounded-full border transition-all duration-300 flex items-center ${
                  rule.active
                    ? `bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30`
                    : "bg-white/5 border-white/10 group-hover/toggle:bg-white/10"
                }`}
              >
                <motion.div
                  animate={{ x: rule.active ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`w-4 h-4 rounded-full shadow-sm transition-colors duration-200 ${
                    rule.active ? "bg-white" : "bg-gray-500 group-hover/toggle:bg-gray-400"
                  }`}
                />
              </div>
            </motion.button>

            {/* Expand details */}
            <button
              onClick={() => setExpanded((p) => !p)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="View details"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Delete */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-30"
              title="Delete rule"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expandable Details Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 border-t border-white/[0.05]">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${rule.active ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-gray-600"} ${rule.active ? "animate-pulse" : ""}`} />
                    <span className="text-xs font-semibold text-gray-300">
                      {rule.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Type</p>
                  <div className="flex items-center gap-1.5">
                    <TypeIcon className={`w-3 h-3 ${cfg.iconColor}`} />
                    <span className="text-xs font-semibold text-gray-300">{cfg.label}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Tool</p>
                  <span className="text-xs font-mono font-semibold text-gray-300 truncate block">
                    {rule.toolName}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-gray-600 flex-shrink-0" />
                <p className="text-[11px] text-gray-600">
                  {rule.ruleType === "allow"
                    ? "This tool is permitted to run without any restrictions."
                    : rule.ruleType === "block"
                    ? "This tool is completely blocked from execution."
                    : "This tool requires explicit user approval before each execution."}
                </p>
              </div>

              {rule.inputPattern && rule.inputPatternField && (
                <div className="mt-3 rounded-xl bg-amber-500/5 border border-amber-500/15 p-3">
                  <p className="text-[10px] text-amber-500/70 uppercase tracking-widest mb-2 font-semibold">Input Validation</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] text-gray-500">Field:</span>
                    <code className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{rule.inputPatternField}</code>
                    <span className="text-[11px] text-gray-500">must match:</span>
                    <code className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{rule.inputPattern}</code>
                    <span className="text-[11px] text-gray-500">or be</span>
                    <code className="text-[11px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                      {rule.inputPatternAction === "require_approval" ? "sent for approval" : "blocked"}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
