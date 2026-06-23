import { NavLink } from "react-router-dom";
import { Shield, ScrollText, MessageSquare } from "lucide-react";

const links = [
  { to: "/rules", label: "Rules", icon: Shield },
  { to: "/logs", label: "Logs", icon: ScrollText },
  { to: "/chat", label: "Chat", icon: MessageSquare },
];

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>ArmorIQ</span>
        </div>
        <div className="flex gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
