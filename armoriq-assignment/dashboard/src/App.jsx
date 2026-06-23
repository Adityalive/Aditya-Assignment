import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Rules from "./pages/Rules";
import Logs from "./pages/Logs";
import Chat from "./pages/Chat";

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#f3f4f6",
            border: "1px solid #374151",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#1f2937" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#1f2937" } },
        }}
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/rules" />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
