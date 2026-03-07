// src/components/TopBar.tsx
import { Bell, ChevronDown, Settings, User, Shield, LogOut, Search, KeyRound } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ROLE_COLORS: Record<string, string> = {
  Admin: "#f43f5e", Manager: "#f59e0b", Agent: "#6366f1", Viewer: "#94a3b8",
};

const TopBar = () => {
  const { data } = useWorkspace();
  const { profile, logout, can } = useAuth();
  const navigate = useNavigate();
  const newLeads = data.leads.filter(l => l.status === "new").length;

  const initials = profile?.displayName
    ? profile.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  const roleColor = ROLE_COLORS[profile?.role || "Viewer"] || "#94a3b8";

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <header className="flex items-center justify-between px-6 py-3.5 shrink-0" style={{
      background: "rgba(13,13,26,0.8)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl w-64"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Search className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-sm text-slate-500">Search anything...</span>
        <kbd className="ml-auto text-[10px] text-slate-600 px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)" }}>⌘K</kbd>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative h-9 w-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Bell className="h-4 w-4 text-slate-400" />
          {newLeads > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
              style={{ background: "#6366f1" }}>{newLeads}</span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)` }}>
                {initials}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white leading-tight">{profile?.displayName || "User"}</p>
                <p className="text-[10px] leading-tight font-semibold" style={{ color: roleColor }}>{profile?.role}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52"
            style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}>
            <DropdownMenuLabel>
              <p className="text-slate-300 font-semibold">{profile?.displayName}</p>
              <p className="text-xs text-slate-500 font-normal">{profile?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.08)" }} />
            <DropdownMenuItem onClick={() => navigate("/")} className="text-slate-300 hover:text-white focus:bg-white/5 cursor-pointer">
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            {can("view_workspace") && (
              <DropdownMenuItem onClick={() => navigate("/workspace")} className="text-slate-300 hover:text-white focus:bg-white/5 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Workspace
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate("/change-password")} className="text-slate-300 hover:text-white focus:bg-white/5 cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4" /> Change Password
            </DropdownMenuItem>
            {can("manage_users") && (
              <>
                <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.08)" }} />
                <DropdownMenuItem onClick={() => navigate("/users")} className="text-amber-400 hover:text-amber-300 focus:bg-amber-500/10 cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" /> User Management
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.08)" }} />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-400 focus:bg-rose-500/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;