import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { FileText, Clock, RotateCcw, StickyNote, Activity } from "lucide-react";
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
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            Notes
          </h1>
          <p className="text-sm text-gray-500 mt-2 ml-[52px]">
            {notes.length > 0 ? (
              <>
                <span className="text-emerald-400 font-medium">{notes.length}</span>
                {notes.length === 1 ? " note" : " notes"} saved
              </>
            ) : (
              "Live mirror — updates when the agent creates, edits, or deletes notes"
            )}
          </p>
        </motion.div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${
            connected
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            <Activity className="w-3 h-3" />
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {connected ? "Live" : "Offline"}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchNotes}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-xs text-gray-400 hover:text-gray-200"
          >
            <RotateCcw className="w-3 h-3" />
            Refresh
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <StickyNote className="w-10 h-10 text-emerald-400/50" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No notes yet</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              Ask the agent to create a note and it will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note, i) => (
              <motion.div
                key={note._id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.05 }}
                className="group glass rounded-2xl border border-white/5 p-5 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-default"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-100 line-clamp-2 flex-1">
                    {note.title}
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 ml-2 group-hover:bg-emerald-500/20 transition-colors">
                    <FileText className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
                {note.content && (
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {note.content}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-4 text-[11px] text-gray-600">
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
