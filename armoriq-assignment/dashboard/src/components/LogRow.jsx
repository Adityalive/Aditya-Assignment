import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const statusConfig = {
  allowed: { icon: CheckCircle, class: "text-emerald-400", bg: "bg-emerald-500/10" },
  blocked: { icon: XCircle, class: "text-red-400", bg: "bg-red-500/10" },
  pending_approval: { icon: Clock, class: "text-amber-400", bg: "bg-amber-500/10" },
  error: { icon: AlertCircle, class: "text-red-400", bg: "bg-red-500/10" },
};

export default function LogRow({ log, index }) {
  const config = statusConfig[log.status] || statusConfig.error;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.03, duration: 0.2 }}
      className="group flex items-start gap-3.5 px-4 py-3.5 hover:bg-white/[0.02] rounded-xl transition-all duration-200"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}
      >
        <Icon className={`w-4 h-4 ${config.class}`} />
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-semibold text-gray-100">{log.toolName}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider ${config.class} ${config.bg} border border-current/10`}
          >
            {log.status}
          </span>
        </div>
        {log.reason && (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{log.reason}</p>
        )}
        {log.toolInput && Object.keys(log.toolInput).length > 0 && (
          <pre className="mt-2 text-xs text-gray-500 bg-gray-950/80 border border-white/5 rounded-lg p-2.5 overflow-x-auto font-mono leading-relaxed">
            {JSON.stringify(log.toolInput, null, 1)}
          </pre>
        )}
      </div>

      <span className="text-[11px] text-gray-600 shrink-0 font-medium tabular-nums">
        {new Date(log.createdAt || log.timestamp).toLocaleTimeString()}
      </span>
    </motion.div>
  );
}
