import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Send, Bot, User, Sparkles } from "lucide-react";
import * as api from "../api";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I can search the web and manage notes. What would you like me to do?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(null);
  const bottomRef = useRef(null);

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
      const { data } = await api.sendChat(msg, convId);
      setConvId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
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
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 7rem)' }}>
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

      <div className="flex-1 overflow-y-auto space-y-5 pr-2 mb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
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
              <motion.div
                layout
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
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
                      strong: ({ children }) => (
                        <span className="font-semibold text-emerald-400">{children}</span>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-base font-bold mt-3 mb-1 text-gray-100">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-sm font-bold mt-2 mb-1 text-gray-100">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-semibold mt-2 mb-1 text-gray-200">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 my-1 text-gray-300">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1 my-1 text-gray-300">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-300">{children}</li>
                      ),
                      p: ({ children }) => (
                        <p className="my-1.5 text-gray-300">{children}</p>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-800/80 px-1.5 py-0.5 rounded-md text-xs text-emerald-300 font-mono border border-white/5">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-950/80 border border-white/5 rounded-xl p-3 my-2 overflow-x-auto text-xs font-mono">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </motion.div>
            </motion.div>
          ))}
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
        className="relative"
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
  );
}
