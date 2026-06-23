import { useState, useEffect, useCallback } from "react";
import { Plus, Shield } from "lucide-react";
import RuleCard from "../components/RuleCard";
import * as api from "../api";

const TOOL_NAMES = [
  "create_note",
  "read_note",
  "update_note",
  "delete_note",
  "list_notes",
  "search",
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
  const [newType, setNewType] = useState("allow");

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
      await api.createRule({ toolName: newTool, ruleType: newType });
      setShowAdd(false);
      fetchRules();
    } catch {}
  };

  const handleToggle = async (id) => {
    try {
      await api.toggleRule(id);
      fetchRules();
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteRule(id);
      fetchRules();
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            Policy Rules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rules apply instantly — no restart needed
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">
                Tool
              </label>
              <select
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                {TOOL_NAMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">
                Rule Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                {RULE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-xl transition-colors text-sm"
            >
              Create
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rules.length === 0 ? (
          <p className="text-center text-gray-600 py-12">
            No rules yet. Add one to start guarding your agent.
          </p>
        ) : (
          rules.map((rule) => (
            <RuleCard
              key={rule._id}
              rule={rule}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
