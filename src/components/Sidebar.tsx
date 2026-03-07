import { LayoutDashboard, DollarSign, Users, BarChart3, UserCheck, Building2, Send, Briefcase, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", color: "#6366f1" },
  { icon: DollarSign, label: "Financial", path: "/financial", color: "#10b981" },
  { icon: Users, label: "Agents", path: "/agent-performance", color: "#22d3ee" },
  { icon: BarChart3, label: "Analytics", path: "/analytics", color: "#f59e0b" },
  { icon: UserCheck, label: "Leads & CRM", path: "/leads-crm", color: "#a78bfa" },
  { icon: Building2, label: "Properties", path: "/properties", color: "#34d399" },
  { icon: Send, label: "Marketing", path: "/marketing", color: "#fb923c" },
  { icon: Briefcase, label: "Workspace", path: "/workspace", color: "#94a3b8" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-[220px] min-h-screen flex flex-col shrink-0" style={{
      background: "linear-gradient(180deg, #0d0d1a 0%, #0f0f1e 100%)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">RealEstate</p>
          <p className="text-[10px] text-slate-500 leading-tight">CRM Platform</p>
        </div>
      </div>

      <div className="px-3 mt-1">
        <p className="text-[10px] font-semibold text-slate-600 px-3 mb-2 uppercase tracking-widest">Navigation</p>
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-200"
                )}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${item.color}22, ${item.color}10)`,
                  border: `1px solid ${item.color}30`,
                } : {}}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: item.color }} />
                )}
                <div className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                )} style={isActive ? { background: `${item.color}25` } : {}}>
                  <item.icon className="h-3.5 w-3.5" style={{ color: isActive ? item.color : "currentColor" }} />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-3 w-3 opacity-50" style={{ color: item.color }} />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-auto px-4 py-4">
        <div className="rounded-xl p-3" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <p className="text-xs font-semibold text-indigo-400 mb-0.5">Pro Plan</p>
          <p className="text-[10px] text-slate-500">All features unlocked</p>
          <div className="mt-2 h-1 rounded-full bg-white/10">
            <div className="h-1 rounded-full w-3/4" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;