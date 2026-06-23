import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Send, Bot, User } from "lucide-react";
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <MessageSquare className="w-5 h-5 text-emerald-400" />
        <h1 className="text-xl font-bold">Agent Chat</h1>
      </motion.div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
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
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-emerald-500/10" : "bg-gray-800"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-400" />
                )}
              </motion.div>
              <motion.div
                layout
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-gray-900 border border-gray-800"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content
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
                        <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-300">{children}</li>
                      ),
                      p: ({ children }) => (
                        <p className="my-1 text-gray-300">{children}</p>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-800 px-1 py-0.5 rounded text-xs text-emerald-300">
                          {children}
                        </code>
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
            <div className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-400" />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-gray-500 rounded-full inline-block"
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
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask the agent to do something..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-600"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
