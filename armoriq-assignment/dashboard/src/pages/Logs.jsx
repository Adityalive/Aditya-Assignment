import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { ScrollText, RotateCcw, ShieldCheck, ShieldX } from "lucide-react";
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
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-emerald-400" />
            Activity Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tool calls + policy changes in real time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: 1 }}
            className={`flex items-center gap-1.5 text-xs ${
              connected ? "text-emerald-400" : "text-red-400"
            }`}
          >
            <motion.span
              animate={{ scale: connected ? [1, 1.3, 1] : 1 }}
              transition={{ repeat: connected ? Infinity : 0, duration: 2 }}
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            {connected ? "Live" : "Disconnected"}
          </motion.span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              api
                .getLogs()
                .then(({ data }) => setLogs(data.slice(0, 50)))
                .catch(() => {})
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
        {logs.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 py-12"
          >
            No activity yet. Start a chat or modify a rule.
          </motion.p>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((entry, i) =>
              entry.type === "rule" ? (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  {entry.action === "deleted" ? (
                    <ShieldX className="w-5 h-5 text-red-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      Policy {entry.action}
                    </span>
                    {entry.rule && (
                      <span className="text-sm text-gray-400 ml-2">
                        {entry.rule.toolName} → {entry.rule.ruleType}
                        {!entry.rule.active && " (inactive)"}
                      </span>
                    )}
                    {entry.id && (
                      <span className="text-sm text-gray-500 ml-2">
                        rule {entry.id.slice(-6)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              ) : (
                <LogRow key={entry._id || i} log={entry} index={i} />
              )
            )}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
