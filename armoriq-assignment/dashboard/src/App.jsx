import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Rules from "./pages/Rules";
import Logs from "./pages/Logs";
import Chat from "./pages/Chat";
import Notes from "./pages/Notes";

export default function App() {
  const location = useLocation();

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100 bg-mesh relative">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-3xl" />
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(17, 24, 39, 0.9)",
            backdropFilter: "blur(16px)",
            color: "#f3f4f6",
            border: "1px solid rgba(55, 65, 81, 0.5)",
            borderRadius: "16px",
            fontSize: "14px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#1f2937" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#1f2937" } },
        }}
      />

      <Navbar />

      <main className="relative flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Navigate to="/rules" />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/notes" element={<Notes />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
