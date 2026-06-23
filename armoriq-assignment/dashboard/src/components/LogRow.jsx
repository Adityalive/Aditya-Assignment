import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const statusConfig = {
  allowed: { icon: CheckCircle, class: "text-emerald-400" },
  blocked: { icon: XCircle, class: "text-red-400" },
  pending_approval: { icon: Clock, class: "text-amber-400" },
  error: { icon: AlertCircle, class: "text-red-400" },
};

export default function LogRow({ log, index }) {
  const config = statusConfig[log.status] || statusConfig.error;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.03, duration: 0.2 }}
      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.class}`} />
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{log.toolName}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded uppercase font-semibold ${
              config.class
            } bg-current/10`}
          >
            {log.status}
          </span>
        </div>
        {log.reason && (
          <p className="text-xs text-gray-500 mt-0.5">{log.reason}</p>
        )}
        {log.toolInput && Object.keys(log.toolInput).length > 0 && (
          <pre className="mt-1 text-xs text-gray-600 bg-gray-950 rounded p-2 overflow-x-auto">
            {JSON.stringify(log.toolInput, null, 1)}
          </pre>
        )}
      </div>
      <span className="text-xs text-gray-600 shrink-0">
        {new Date(log.createdAt || log.timestamp).toLocaleTimeString()}
      </span>
    </motion.div>
  );
}
