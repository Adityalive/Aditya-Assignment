import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ScrollText, RotateCcw } from "lucide-react";
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
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-emerald-400" />
            Tool Call Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Every tool call in real time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 text-xs ${
              connected ? "text-emerald-400" : "text-red-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            {connected ? "Live" : "Disconnected"}
          </span>
          <button
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
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
        {logs.length === 0 ? (
          <p className="text-center text-gray-600 py-12">
            No logs yet. Start a chat to see tool calls.
          </p>
        ) : (
          logs.map((log, i) => <LogRow key={log._id || i} log={log} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
