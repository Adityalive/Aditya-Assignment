import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Listbox } from "@headlessui/react";
import { Plus, Shield, ChevronDown, Check, ShieldPlus } from "lucide-react";
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
  { value: "allow", label: "Allow" },
  { value: "block", label: "Block" },
  { value: "require_approval", label: "Require Approval" },
];

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTool, setNewTool] = useState(TOOL_NAMES[0]);
  const [newType, setNewType] = useState(RULE_TYPES[0]);

  const fetchRules = useCallback(async () => {
    try {
      const { data } = await api.getRules();
      setRules(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchRules();
    const interval = setInterval(fetchRules, 3000);
    return () => clearInterval(interval);
  }, [fetchRules]);

  const handleCreate = async () => {
    try {
      await api.createRule({ toolName: newTool, ruleType: newType.value });
      toast.success(`Rule created: ${newTool} → ${newType.label}`);
      setShowAdd(false);
      fetchRules();
    } catch {
      toast.error("Failed to create rule");
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.toggleRule(id);
      const rule = rules.find((r) => r._id === id);
      toast.success(`${rule?.toolName} ${rule?.active ? "deactivated" : "activated"}`);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            Policy Rules
          </h1>
          <p className="text-sm text-gray-500 mt-2 ml-[52px]">
            {rules.length > 0 ? (
              <>
                <span className="text-emerald-400 font-medium">{activeCount}</span>
                {activeCount === 1 ? " rule" : " rules"} active
                <span className="text-gray-600 mx-2">·</span>
                {rules.length - activeCount} inactive
              </>
            ) : (
              "Rules apply instantly — no restart needed"
            )}
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd((p) => !p)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-gray-950 font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-emerald-500/20"
        >
          <Plus className={`w-4 h-4 transition-transform duration-300 ${showAdd ? "rotate-45" : ""}`} />
          {showAdd ? "Close" : "Add Rule"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5 glass rounded-2xl border border-white/5 glow-emerald-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldPlus className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">New Rule</span>
              </div>
              <div className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-medium">
                    Tool
                  </label>
                  <Listbox value={newTool} onChange={setNewTool}>
                    <div className="relative">
                      <Listbox.Button className="w-full flex items-center justify-between bg-gray-800/80 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all">
                        <span className="font-mono text-gray-200">{newTool}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-20 mt-2 w-full bg-gray-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                        {TOOL_NAMES.map((t) => (
                          <Listbox.Option
                            key={t}
                            value={t}
                            className={({ active }) =>
                              `px-4 py-2.5 text-sm cursor-pointer font-mono transition-colors ${
                                active ? "bg-emerald-500/15 text-emerald-400" : "text-gray-300 hover:bg-white/5"
                              }`
                            }
                          >
                            {({ selected }) => (
                              <span className="flex items-center justify-between">
                                {t}
                                {selected && <Check className="w-4 h-4 text-emerald-400" />}
                              </span>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-medium">
                    Rule Type
                  </label>
                  <Listbox value={newType} onChange={setNewType}>
                    <div className="relative">
                      <Listbox.Button className="w-full flex items-center justify-between bg-gray-800/80 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all">
                        <span className="text-gray-200">{newType.label}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-20 mt-2 w-full bg-gray-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                        {RULE_TYPES.map((t) => (
                          <Listbox.Option
                            key={t.value}
                            value={t}
                            className={({ active }) =>
                              `px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                active ? "bg-emerald-500/15 text-emerald-400" : "text-gray-300 hover:bg-white/5"
                              }`
                            }
                          >
                            {({ selected }) => (
                              <span className="flex items-center justify-between">
                                {t.label}
                                {selected && <Check className="w-4 h-4 text-emerald-400" />}
                              </span>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-gray-950 font-semibold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20"
                >
                  Create
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {rules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <Shield className="w-10 h-10 text-emerald-400/50" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No rules yet</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              Create your first rule to start guarding your agent's tool usage.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <RuleCard
                key={rule._id}
                rule={rule}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
