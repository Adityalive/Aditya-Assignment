import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Rules from "./pages/Rules";
import Logs from "./pages/Logs";
import Chat from "./pages/Chat";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/rules" />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
}
