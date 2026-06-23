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
    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(rule._id)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          {rule.active ? (
            <ToggleRight className="w-6 h-6 text-emerald-400" />
          ) : (
            <ToggleLeft className="w-6 h-6" />
          )}
        </button>
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
      <button
        onClick={() => onDelete(rule._id)}
        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
