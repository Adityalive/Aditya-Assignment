import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Shield,
  ShieldPlus,
  ChevronDown,
  Check,
  Sparkles,
  Activity,
  TrendingUp,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import RuleCard from "../components/RuleCard";
import * as api from "../api";

const TOOL_NAMES = [
  "create_note",
  "read_note",
  "update_note",
  "delete_note",
  "list_notes",
  "search_web",
];

const RULE_TYPES = [
  {
    value: "allow",
    label: "Allow",
    icon: "✓",
    color: "emerald",
    desc: "Permit tool execution",
  },
  {
    value: "block",
    label: "Block",
    icon: "✕",
    color: "red",
    desc: "Deny tool execution",
  },
  {
    value: "require_approval",
    label: "Require Approval",
    icon: "◎",
    color: "amber",
    desc: "Ask before executing",
  },
];

const colorMap = {
  emerald: {
    badge:
      "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 ring-1 ring-emerald-500/20",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/30",
    btn: "hover:bg-emerald-500/10 hover:text-emerald-300",
  },
  red: {
    badge: "bg-red-500/15 text-red-300 border-red-500/30 ring-1 ring-red-500/20",
    dot: "bg-red-400",
    glow: "shadow-red-500/30",
    btn: "hover:bg-red-500/10 hover:text-red-300",
  },
  amber: {
    badge:
      "bg-amber-500/15 text-amber-300 border-amber-500/30 ring-1 ring-amber-500/20",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/30",
    btn: "hover:bg-amber-500/10 hover:text-amber-300",
  },
};

/* ── Custom Select ────────────────────────────────────────────── */
function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o === value || o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl px-4 py-3 text-sm text-left transition-all duration-200 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
      >
        <span className="font-mono text-gray-200 truncate">
          {typeof selected === "string" ? selected : selected?.label || placeholder}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-50 top-full mt-2 w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
              style={{
                background:
                  "linear-gradient(145deg, rgba(15,20,35,0.98), rgba(10,15,25,0.98))",
                backdropFilter: "blur(24px)",
              }}
            >
              {options.map((opt, i) => {
                const isObj = typeof opt === "object";
                const val = isObj ? opt.value : opt;
                const label = isObj ? opt.label : opt;
                const isSelected = isObj
                  ? value?.value === val || value === val
                  : value === val;
                const color = isObj ? opt.color : null;
                const colors = color ? colorMap[color] : null;

                return (
                  <motion.button
                    key={val}
                    type="button"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    } ${i !== 0 ? "border-t border-white/[0.04]" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isObj && opt.icon && (
                        <span
                          className={`text-xs font-bold w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                            colors ? colors.badge : "bg-white/10"
                          }`}
                        >
                          {opt.icon}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-mono text-sm truncate">{label}</p>
                        {isObj && opt.desc && (
                          <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Stat Card ─────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, delay }) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    red: "from-red-500/20 to-red-500/5 border-red-500/20 text-red-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br border p-4 ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-current blur-2xl" />
    </motion.div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function Rules() {
  const [rules, setRules] = useState([]);
  const [availableTools, setAvailableTools] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTool, setNewTool] = useState("");
  const [newType, setNewType] = useState(RULE_TYPES[0]);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchRules = useCallback(async () => {
    try {
      const { data } = await api.getRules();
      setRules(data);
    } catch {}
  }, []);

  const fetchTools = useCallback(async () => {
    try {
      const { data } = await api.getTools();
      if (data && data.length > 0) {
        const names = data.map(t => t.name);
        setAvailableTools(names);
        setNewTool(prev => prev || names[0]);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchRules();
    fetchTools();
    const interval = setInterval(fetchRules, 3000);
    return () => clearInterval(interval);
  }, [fetchRules, fetchTools]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.createRule({ toolName: newTool, ruleType: newType.value });
      toast.success(`Rule created: ${newTool} → ${newType.label}`);
      setShowAdd(false);
      fetchRules();
    } catch {
      toast.error("Failed to create rule");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.toggleRule(id);
      const rule = rules.find((r) => r._id === id);
      toast.success(
        `${rule?.toolName} ${rule?.active ? "deactivated" : "activated"}`
      );
      fetchRules();
    } catch {
      toast.error("Failed to toggle rule");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteRule(id);
      toast.success("Rule deleted");
      fetchRules();
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  const activeCount = rules.filter((r) => r.active).length;
  const blockCount = rules.filter((r) => r.ruleType === "block").length;
  const approvalCount = rules.filter((r) => r.ruleType === "require_approval").length;

  const filteredRules = rules.filter((r) => {
    if (filter === "all") return true;
    if (filter === "active") return r.active;
    if (filter === "inactive") return !r.active;
    return r.ruleType === filter;
  });

  const filterTabs = [
    { id: "all", label: "All", count: rules.length },
    { id: "active", label: "Active", count: activeCount },
    { id: "allow", label: "Allow", count: rules.filter((r) => r.ruleType === "allow").length },
    { id: "block", label: "Block", count: blockCount },
    { id: "require_approval", label: "Approval", count: approvalCount },
  ];

  return (
    <div className="relative">
      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/3 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <Shield className="w-7 h-7 text-gray-950" strokeWidth={2.5} />
              </div>
              <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 blur-xl opacity-40" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-gray-950 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-950 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-3xl font-bold tracking-tight text-white">Policy Rules</h1>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  LIVE
                </span>
              </div>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-500/60" />
                {rules.length > 0 ? (
                  <>
                    <span className="text-emerald-400 font-medium">{activeCount}</span>
                    {" "}active ·{" "}
                    <span className="text-gray-400">{rules.length - activeCount}</span>
                    {" "}inactive · Rules apply instantly
                  </>
                ) : (
                  "Rules apply instantly — no restart needed"
                )}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAdd((p) => !p)}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 relative overflow-hidden group"
            style={{
              background: showAdd
                ? "rgba(239,68,68,0.1)"
                : "linear-gradient(135deg, rgba(16,185,129,0.9), rgba(6,182,212,0.9))",
              border: showAdd ? "1px solid rgba(239,68,68,0.3)" : "none",
              color: showAdd ? "#f87171" : "#030712",
              boxShadow: showAdd ? "none" : "0 0 30px rgba(16,185,129,0.25), 0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            {!showAdd && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            )}
            <motion.div animate={{ rotate: showAdd ? 45 : 0 }} transition={{ duration: 0.2 }}>
              <Plus className="w-4 h-4" />
            </motion.div>
            {showAdd ? "Cancel" : "New Rule"}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total Rules" value={rules.length} icon={Shield} color="blue" delay={0.05} />
        <StatCard label="Active" value={activeCount} icon={Activity} color="emerald" delay={0.1} />
        <StatCard label="Blocked" value={blockCount} icon={Lock} color="red" delay={0.15} />
        <StatCard label="Awaiting" value={approvalCount} icon={TrendingUp} color="amber" delay={0.2} />
      </div>

      {/* Add Rule Panel */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "visible" }}
            className="mb-6"
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="relative rounded-3xl border border-white/10 overflow-visible"
              style={{
                background:
                  "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(10,15,30,0.95))",
                backdropFilter: "blur(24px)",
                boxShadow:
                  "0 0 0 1px rgba(16,185,129,0.08), 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(16,185,129,0.05)",
              }}
            >
              {/* Accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-t-3xl" />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <ShieldPlus className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Create New Rule</p>
                    <p className="text-xs text-gray-500">Rules take effect immediately after creation</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400 font-medium">Instant</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      Tool Name
                    </label>
                    <CustomSelect
                      value={newTool}
                      onChange={(opt) => setNewTool(typeof opt === "string" ? opt : opt)}
                      options={availableTools.length > 0 ? availableTools : TOOL_NAMES}
                      placeholder="Select tool..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      Rule Type
                    </label>
                    <CustomSelect
                      value={newType}
                      onChange={(opt) => setNewType(opt)}
                      options={RULE_TYPES}
                      placeholder="Select type..."
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCreate}
                    disabled={creating}
                    className="relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-gray-950 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981, #06b6d4)",
                      boxShadow:
                        "0 0 20px rgba(16,185,129,0.3), 0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                    {creating ? (
                      <div className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {creating ? "Creating…" : "Create Rule"}
                  </motion.button>
                </div>

                {/* Preview */}
                <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-3">
                  <span className="text-[11px] text-gray-600 uppercase tracking-widest">Preview:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      {newTool}
                    </span>
                    <span className="text-gray-600">→</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                        colorMap[newType?.color || "emerald"].badge
                      }`}
                    >
                      {newType?.label || "Allow"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      {rules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center gap-1.5 mb-5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit flex-wrap"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                filter === tab.id
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shadow-lg shadow-emerald-500/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  filter === tab.id
                    ? "bg-emerald-500/25 text-emerald-300"
                    : "bg-white/5 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Rules List */}
      <AnimatePresence mode="popLayout">
        {rules.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 border border-emerald-500/15 flex items-center justify-center">
                <Shield className="w-12 h-12 text-emerald-400/40" strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 w-24 h-24 rounded-3xl bg-emerald-500/10 blur-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No rules configured</h3>
            <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
              Create your first policy rule to start controlling your agent's tool access and behavior.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowAdd(true)}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create First Rule
            </motion.button>
          </motion.div>
        ) : filteredRules.length === 0 ? (
          <motion.div
            key="no-filter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center text-gray-600 text-sm"
          >
            No rules match the current filter.
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredRules.map((rule, i) => (
              <RuleCard
                key={rule._id}
                rule={rule}
                onToggle={handleToggle}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
