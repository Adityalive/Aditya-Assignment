import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { FileText, Clock, RotateCcw } from "lucide-react";
import * as api from "../api";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [connected, setConnected] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await api.getNotes();
      setNotes(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotes();

    const socket = io(import.meta.env.VITE_AGENT_URL || "", {
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("notes:changed", fetchNotes);
    return () => socket.disconnect();
  }, [fetchNotes]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Notes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Live mirror — updates when the agent creates, edits, or deletes notes
          </p>
        </motion.div>
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 text-xs ${
              connected ? "text-emerald-400" : "text-red-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {connected ? "Live" : "Disconnected"}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchNotes}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            Refresh
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {notes.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 py-12"
          >
            No notes yet. Ask the agent to create one.
          </motion.p>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <motion.div
                key={note._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-colors"
              >
                <h3 className="font-semibold text-sm text-gray-100 truncate">
                  {note.title}
                </h3>
                {note.content && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                    {note.content}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
