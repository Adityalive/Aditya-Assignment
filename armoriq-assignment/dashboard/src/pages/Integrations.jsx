import { useState, useEffect } from "react";
import { getIntegrations, saveIntegration } from "../api";
import { Link2, Save, Key, CheckCircle2, AlertCircle } from "lucide-react";

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [alphaKey, setAlphaKey] = useState("");
  const [status, setStatus] = useState("idle"); // idle, saving, success, error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getIntegrations().then(setIntegrations).catch(console.error);
  }, []);

  const alphaIntegration = integrations.find(i => i.provider === "alphavantage");

  const handleSave = async () => {
    if (!alphaKey) return;
    setStatus("saving");
    setErrorMsg("");
    try {
      const saved = await saveIntegration({ provider: "alphavantage", apiKey: alphaKey, isActive: true });
      setIntegrations(prev => {
        const filtered = prev.filter(i => i.provider !== "alphavantage");
        return [...filtered, saved];
      });
      setStatus("success");
      setAlphaKey("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Integrations</h1>
        <p className="text-slate-400">Manage connections to external MCP servers and APIs.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm relative shadow-2xl p-6 lg:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Link2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Alpha Vantage</h2>
              <p className="text-sm text-slate-400 mt-1">Real-time and historical stock market data via official MCP.</p>
            </div>
          </div>
          {alphaIntegration?.isActive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-500" /> API Key
            </label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 block p-3 placeholder-slate-600 transition-all"
              placeholder={alphaIntegration ? "Enter new key to update..." : "Your Alpha Vantage API Key..."}
              value={alphaKey}
              onChange={(e) => setAlphaKey(e.target.value)}
            />
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={status === "saving" || !alphaKey}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-emerald-50 bg-emerald-600 rounded-lg hover:bg-emerald-500 focus:ring-4 focus:outline-none focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              {status === "saving" ? "Saving & Connecting..." : status === "success" ? "Saved!" : "Save Connection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
