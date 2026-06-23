import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Listbox } from "@headlessui/react";
import { Plus, Shield, ChevronDown, Check } from "lucide-react";
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            Policy Rules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rules apply instantly — no restart needed
          </p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd((p) => !p)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-xl transition-colors text-sm"
        >
          <Plus className={`w-4 h-4 transition-transform ${showAdd ? "rotate-45" : ""}`} />
          {showAdd ? "Close" : "Add Rule"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">
                    Tool
                  </label>
                  <Listbox value={newTool} onChange={setNewTool}>
                    <div className="relative">
                      <Listbox.Button className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                        <span className="font-mono">{newTool}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                        {TOOL_NAMES.map((t) => (
                          <Listbox.Option
                            key={t}
                            value={t}
                            className={({ active }) =>
                              `px-3 py-2 text-sm cursor-pointer font-mono ${
                                active ? "bg-emerald-500/20 text-emerald-400" : "text-gray-300"
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
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">
                    Rule Type
                  </label>
                  <Listbox value={newType} onChange={setNewType}>
                    <div className="relative">
                      <Listbox.Button className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                        <span>{newType.label}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                        {RULE_TYPES.map((t) => (
                          <Listbox.Option
                            key={t.value}
                            value={t}
                            className={({ active }) =>
                              `px-3 py-2 text-sm cursor-pointer ${
                                active ? "bg-emerald-500/20 text-emerald-400" : "text-gray-300"
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreate}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-xl transition-colors text-sm"
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 py-12"
          >
            No rules yet. Add one to start guarding your agent.
          </motion.p>
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
