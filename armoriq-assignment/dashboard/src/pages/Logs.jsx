import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { ScrollText, RotateCcw, ShieldCheck, ShieldX, Activity } from "lucide-react";
import LogRow from "../components/LogRow";
import * as api from "../api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.getLogs().then(({ data }) => setLogs(data.slice(0, 50))).catch(() => {});

    const socket = io(import.meta.env.VITE_AGENT_URL || "", {
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("log:new", (log) => {
      setLogs((prev) => [log, ...prev].slice(0, 100));
    });
    socket.on("log:result", (log) => {
      setLogs((prev) => [log, ...prev].slice(0, 100));
    });
    socket.on("rule:updated", (data) => {
      setLogs((prev) => [{ type: "rule", action: "updated", ...data }, ...prev].slice(0, 100));
    });
    socket.on("rule:toggled", (data) => {
      setLogs((prev) => [{ type: "rule", action: "toggled", ...data }, ...prev].slice(0, 100));
    });
    socket.on("rule:deleted", (data) => {
      setLogs((prev) => [{ type: "rule", action: "deleted", ...data }, ...prev].slice(0, 100));
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-emerald-400" />
            </div>
            Activity Logs
          </h1>
          <p className="text-sm text-gray-500 mt-2 ml-[52px]">
            Tool calls + policy changes in real time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${
              connected
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            <motion.div
              animate={connected ? { scale: [1, 1.4, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
            />
            <Activity className="w-3 h-3" />
            {connected ? "Live" : "Offline"}
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              api
                .getLogs()
                .then(({ data }) => setLogs(data.slice(0, 50)))
                .catch(() => {})
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-xs text-gray-400 hover:text-gray-200"
          >
            <RotateCcw className="w-3 h-3" />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {logs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <ScrollText className="w-10 h-10 text-emerald-400/50" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No activity yet</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              Start a chat or modify a rule to see activity here.
            </p>
          </motion.div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {logs.map((entry, i) =>
                entry.type === "rule" ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      entry.action === "deleted" ? "bg-red-500/10" : "bg-emerald-500/10"
                    }`}>
                      {entry.action === "deleted" ? (
                        <ShieldX className="w-4 h-4 text-red-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-gray-200">
                        Policy {entry.action}
                      </span>
                      {entry.rule && (
                        <span className="text-sm text-gray-400 ml-2">
                          {entry.rule.toolName} → {entry.rule.ruleType}
                          {!entry.rule.active && (
                            <span className="text-gray-600 ml-1">(inactive)</span>
                          )}
                        </span>
                      )}
                      {entry.id && (
                        <span className="text-xs text-gray-600 ml-2 font-mono">
                          {entry.id.slice(-6)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-600 shrink-0 font-medium tabular-nums">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </motion.div>
                ) : (
                  <LogRow key={entry._id || i} log={entry} index={i} />
                )
              )}
            </AnimatePresence>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
