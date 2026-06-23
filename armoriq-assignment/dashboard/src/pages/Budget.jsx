import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Settings2,
  Trash2,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Infinity,
  Save,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import * as api from "../api";

/* ── Token Usage Bar ───────────────────────────────────────────── */
function UsageBar({ used, budget }) {
  const pct = budget ? Math.min((used / budget) * 100, 100) : 0;
  const color =
    pct >= 90 ? "from-red-500 to-rose-600" :
    pct >= 70 ? "from-amber-500 to-orange-500" :
    "from-emerald-500 to-cyan-500";

  return (
    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

/* ── Usage Card ────────────────────────────────────────────────── */
function UsageCard({ usage, budget, onReset, index }) {
  const pct = budget ? Math.min(((usage.tokensUsed / budget) * 100), 100) : null;
  const exceeded = budget && usage.tokensUsed >= budget;
  const warning = budget && pct >= 70 && !exceeded;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl border border-white/[0.07] p-5 group"
      style={{
        background: "linear-gradient(145deg, rgba(15,20,35,0.9), rgba(10,15,25,0.9))",
        boxShadow: exceeded
          ? "0 0 0 1px rgba(239,68,68,0.2), 0 8px 32px rgba(0,0,0,0.3)"
          : "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      {exceeded && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent rounded-t-2xl" />
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {exceeded ? (
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <Activity className="w-4 h-4 text-emerald-400/70 flex-shrink-0" />
            )}
            <p className="text-xs font-mono text-gray-400 truncate">{usage.conversationId}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${exceeded ? "text-red-400" : warning ? "text-amber-400" : "text-white"}`}>
              {usage.tokensUsed.toLocaleString()}
            </span>
            <span className="text-gray-600 text-sm">tokens</span>
            {budget && (
              <span className="text-gray-600 text-sm">/ {budget.toLocaleString()}</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">{usage.callCount} LLM calls</p>
        </div>

        <div className="flex items-center gap-2">
          {exceeded && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold">
              <AlertTriangle className="w-3 h-3" /> Budget Exceeded
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReset(usage.conversationId)}
            className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.05] hover:border-red-500/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="Reset usage"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {budget && (
        <div>
          <UsageBar used={usage.tokensUsed} budget={budget} />
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-gray-600">0</span>
            <span className={`text-[10px] font-semibold ${exceeded ? "text-red-400" : warning ? "text-amber-400" : "text-gray-500"}`}>
              {pct?.toFixed(1)}%
            </span>
            <span className="text-[10px] text-gray-600">{budget.toLocaleString()}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function Budget() {
  const [budgetCap, setBudgetCap] = useState(null);
  const [inputBudget, setInputBudget] = useState("");
  const [usages, setUsages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, usageRes] = await Promise.all([
        api.getBudgetSettings(),
        api.getBudgetUsage(),
      ]);
      setBudgetCap(settingsRes.data.budget);
      setInputBudget(settingsRes.data.budget !== null ? String(settingsRes.data.budget) : "");
      setUsages(usageRes.data.usages || []);
    } catch {
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const val = inputBudget.trim() === "" ? null : Number(inputBudget);
      await api.setBudgetSettings(val);
      setBudgetCap(val);
      toast.success(val === null ? "Budget cap removed (unlimited)" : `Budget set to ${val.toLocaleString()} tokens/conversation`);
    } catch {
      toast.error("Failed to save budget settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (conversationId) => {
    try {
      await api.resetConversationUsage(conversationId);
      toast.success("Usage reset for conversation");
      fetchData();
    } catch {
      toast.error("Failed to reset usage");
    }
  };

  const totalTokens = usages.reduce((sum, u) => sum + u.tokensUsed, 0);
  const exceededCount = budgetCap ? usages.filter(u => u.tokensUsed >= budgetCap).length : 0;

  return (
    <div className="relative">
      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 via-violet-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <Coins className="w-7 h-7 text-gray-950" strokeWidth={2.5} />
            </div>
            <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-cyan-500 blur-xl opacity-40" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Token Budget</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Set per-conversation token limits and monitor usage across all sessions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total Tokens Used", value: totalTokens.toLocaleString(), color: "violet", icon: Zap },
          { label: "Active Sessions", value: usages.length, color: "cyan", icon: Activity },
          { label: "Exceeded Budget", value: exceededCount, color: "red", icon: AlertTriangle },
        ].map((stat, i) => {
          const colorClasses = {
            violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400",
            cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
            red: "from-red-500/20 to-red-500/5 border-red-500/20 text-red-400",
          };
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br border p-4 ${colorClasses[stat.color]}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-current blur-2xl" />
            </motion.div>
          );
        })}
      </div>

      {/* Budget Settings Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative rounded-3xl border border-white/10 mb-8 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(10,15,30,0.95))",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 0 1px rgba(139,92,246,0.08), 0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Global Token Budget</p>
              <p className="text-xs text-gray-500">Max tokens the agent can use per conversation before being blocked</p>
            </div>
            {budgetCap === null && (
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Infinity className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-medium">Unlimited</span>
              </div>
            )}
            {budgetCap !== null && (
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <CheckCircle2 className="w-3 h-3 text-violet-400" />
                <span className="text-[11px] text-violet-400 font-medium">{budgetCap.toLocaleString()} tokens/conv</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Token Limit per Conversation
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5000  (leave blank for unlimited)"
                value={inputBudget}
                onChange={(e) => setInputBudget(e.target.value)}
                className="w-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 rounded-2xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all duration-200 font-mono"
              />
              <p className="text-[11px] text-gray-600 mt-1.5">Leave blank to set unlimited. Tokens are counted across all LLM calls in a conversation.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-gray-950 transition-all duration-200 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                boxShadow: "0 0 20px rgba(139,92,246,0.3), 0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving…" : "Save Budget"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Usage List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Conversation Usage</h2>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-500 hover:text-gray-300 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          </motion.div>
        ) : usages.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center mb-4">
              <Coins className="w-10 h-10 text-violet-400/40" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-1">No conversations yet</h3>
            <p className="text-sm text-gray-600">Token usage will appear here as users chat with the agent.</p>
          </motion.div>
        ) : (
          <motion.div key="list" className="space-y-3">
            {usages.map((usage, i) => (
              <UsageCard
                key={usage.conversationId}
                usage={usage}
                budget={budgetCap}
                onReset={handleReset}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
