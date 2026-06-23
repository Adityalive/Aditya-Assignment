import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Send, Bot, User, Sparkles, Plus, Trash2, Wrench } from "lucide-react";
import * as api from "../api";

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await api.getChatSessions();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        loadSession(data[0].conversationId);
      } else if (data.length === 0) {
        handleNewSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSession = async (id) => {
    setCurrentSessionId(id);
    try {
      const { data } = await api.getChatHistory(id);
      // Filter out system messages
      setMessages(data.messages.filter(m => m.role !== "system"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
    setMessages([{ role: "assistant", content: "Hello! I can search the web and manage notes. What would you like me to do?" }]);
  };

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteChatSession(id);
      const newSessions = sessions.filter(s => s.conversationId !== id);
      setSessions(newSessions);
      if (currentSessionId === id) {
        if (newSessions.length > 0) loadSession(newSessions[0].conversationId);
        else handleNewSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const { data } = await api.sendChat(msg, currentSessionId);
      if (!currentSessionId) {
        fetchSessions();
      }
      setCurrentSessionId(data.conversationId);
      await loadSession(data.conversationId);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-[calc(100dvh-7rem)] gap-4">
      {/* Sidebar */}
      <div className="w-64 shrink-0 glass-strong border border-white/5 rounded-3xl flex flex-col overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-white/5">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium transition-colors border border-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.conversationId}
              onClick={() => loadSession(session.conversationId)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                currentSessionId === session.conversationId
                  ? "bg-white/10 text-gray-100"
                  : "hover:bg-white/5 text-gray-400"
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm font-medium truncate">{session.title}</span>
                <span className="text-[10px] text-gray-500">
                  {new Date(session.updatedAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <button
                onClick={(e) => handleDeleteSession(e, session.conversationId)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Agent Chat</h1>
            <p className="text-sm text-gray-500">Powered by ArmorIQ agent</p>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-2 mb-4 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              if (msg.role === "tool") return null;
              
              return (
                <div key={i} className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.05 }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20"
                          : "bg-gray-800 border border-white/5"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-gray-950" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-400" />
                      )}
                    </motion.div>
                    
                    <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {msg.content && (
                        <motion.div
                          layout
                          className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20"
                              : "glass border border-white/5"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <p className="text-gray-100">{msg.content}</p>
                          ) : (
                            <ReactMarkdown
                              components={{
                                strong: ({ children }) => <span className="font-semibold text-emerald-400">{children}</span>,
                                h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1 text-gray-100">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1 text-gray-100">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-gray-200">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1 text-gray-300">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-1 text-gray-300">{children}</ol>,
                                li: ({ children }) => <li className="text-gray-300">{children}</li>,
                                p: ({ children }) => <p className="my-1.5 text-gray-300">{children}</p>,
                                code: ({ children }) => <code className="bg-gray-800/80 px-1.5 py-0.5 rounded-md text-xs text-emerald-300 font-mono border border-white/5">{children}</code>,
                                pre: ({ children }) => <pre className="bg-gray-950/80 border border-white/5 rounded-xl p-3 my-2 overflow-x-auto text-xs font-mono">{children}</pre>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </motion.div>
                      )}

                      {/* Render Tool Calls Inline */}
                      {msg.toolCalls?.map((tc, idx) => (
                        <div key={idx} className="flex items-center gap-2 mt-1">
                          <div className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-white/5 flex items-center gap-2 text-xs font-mono text-gray-400">
                            <Wrench className="w-3 h-3 text-cyan-400" />
                            Called <span className="text-cyan-300 font-semibold">{tc.function.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-400" />
              </div>
              <div className="glass border border-white/5 rounded-2xl px-5 py-3.5">
                <span className="flex gap-1.5 items-center">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full inline-block"
                    />
                  ))}
                </span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-auto"
        >
          <div className="flex gap-2 p-1.5 glass rounded-2xl border border-white/5 focus-within:border-emerald-500/30 focus-within:glow-emerald-sm transition-all duration-300">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask the agent to do something..."
              className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-gray-600 text-gray-100"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-20 disabled:cursor-not-allowed text-gray-950 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
