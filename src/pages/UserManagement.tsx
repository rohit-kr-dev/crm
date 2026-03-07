// src/pages/UserManagement.tsx
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useAuth, Role, PERMISSIONS } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { validatePassword } from "@/contexts/AuthContext";
import {
  Users, Shield, UserPlus, CheckCircle, XCircle,
  RefreshCw, AlertCircle, Eye, EyeOff, ChevronDown, Loader2
} from "lucide-react";

interface UserRecord {
  uid: string; email: string; displayName: string; role: Role;
  isActive: boolean; lastLogin: { toDate?: () => Date } | null; createdAt: { toDate?: () => Date } | null; loginAttempts: number;
}

const ROLES: Role[] = ["Admin", "Manager", "Agent", "Viewer"];

const ROLE_COLORS: Record<Role, { color: string; bg: string }> = {
  Admin:   { color: "#f43f5e", bg: "rgba(244,63,94,0.15)"  },
  Manager: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  Agent:   { color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
  Viewer:  { color: "#94a3b8", bg: "rgba(148,163,184,0.15)"},
};

const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };
const inp: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" };

const UserManagement = () => {
  const { register, profile } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwErrors, setPwErrors] = useState<string[]>([]);

  const [form, setForm] = useState({ displayName: "", email: "", password: "", role: "Agent" as Role });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
    setUsers(snap.docs.map(d => d.data() as UserRecord));
    setLoadingUsers(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const validatePw = (pw: string) => {
    const errs: string[] = [];
    if (pw.length < 8) errs.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errs.push("One uppercase letter");
    if (!/[0-9]/.test(pw)) errs.push("One number");
    if (!/[^A-Za-z0-9]/.test(pw)) errs.push("One special character");
    setPwErrors(errs);
    return errs.length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFormSuccess("");
    if (!form.displayName || !form.email || !form.password) { setFormError("All fields are required."); return; }
    if (!validatePw(form.password)) { setFormError("Password doesn't meet requirements."); return; }
    setSaving("create");
    try {
      await register(form.email, form.password, form.displayName, form.role);
      setFormSuccess(`User ${form.displayName} created successfully!`);
      setForm({ displayName: "", email: "", password: "", role: "Agent" });
      await fetchUsers();
      setTimeout(() => setShowForm(false), 1500);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create user");
    } finally { setSaving(null); }
  };

  const toggleActive = async (u: UserRecord) => {
    setSaving(u.uid);
    try {
      await updateDoc(doc(db, "users", u.uid), { isActive: !u.isActive });
      setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, isActive: !x.isActive } : x));
    } finally { setSaving(null); }
  };

  const changeRole = async (u: UserRecord, role: Role) => {
    setSaving(u.uid + "_role");
    try {
      await updateDoc(doc(db, "users", u.uid), { role });
      setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, role } : x));
    } finally { setSaving(null); }
  };

  const formatDate = (ts: { toDate?: () => Date } | null) => {
    if (!ts?.toDate) return "Never";
    return ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const pwRequirements = [
    { label: "8+ characters", test: (p: string) => p.length >= 8 },
    { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Number", test: (p: string) => /[0-9]/.test(p) },
    { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f, #0d1117)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-5">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-slate-400 text-sm mt-0.5">Manage team members, roles, and access control</p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchUsers} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                <RefreshCw className="h-4 w-4" />
              </button>
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 15px rgba(99,102,241,0.3)" }}>
                <UserPlus className="h-4 w-4" /> Add User
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {ROLES.map(role => {
              const cfg = ROLE_COLORS[role];
              const count = users.filter(u => u.role === role).length;
              return (
                <div key={role} className="rounded-2xl p-4" style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: cfg.color }}>{role}s</p>
                  <p className="text-xs text-slate-500 mt-0.5">{users.filter(u => u.role === role && u.isActive).length} active</p>
                </div>
              );
            })}
          </div>

          {/* Create User Form */}
          {showForm && (
            <div className="rounded-2xl p-6" style={card}>
              <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" /> Create New User
              </h3>
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}>
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="text-rose-300">{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">{formSuccess}</span>
                </div>
              )}
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Full Name *</label>
                    <input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })}
                      placeholder="e.g. Rahul Sharma" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={inp} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. rahul@company.com" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={inp} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={form.password}
                        onChange={e => { setForm({ ...form, password: e.target.value }); validatePw(e.target.value); }}
                        placeholder="Min 8 chars, uppercase, number, symbol"
                        className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
                        style={inp} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password strength indicators */}
                    {form.password && (
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {pwRequirements.map(r => (
                          <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(form.password) ? "text-emerald-400" : "text-slate-600"}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${r.test(form.password) ? "bg-emerald-400" : "bg-slate-600"}`} />
                            {r.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Role *</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ ...inp, background: "rgba(255,255,255,0.05)" }}>
                      {ROLES.map(r => <option key={r} value={r} style={{ background: "#1a1a2e" }}>{r}</option>)}
                    </select>
                    <p className="text-xs text-slate-600 mt-1">{PERMISSIONS[form.role].length} permissions</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={saving === "create"}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    {saving === "create" ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : <><UserPlus className="h-4 w-4" />Create User</>}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setFormError(""); setFormSuccess(""); }}
                    className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" />
                Team Members ({users.length})
              </h3>
            </div>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-10 w-10 text-slate-700 mb-2" />
                <p className="text-slate-500 text-sm">No users yet.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {users.map(u => {
                  const cfg = ROLE_COLORS[u.role];
                  const isMe = u.uid === profile?.uid;
                  return (
                    <div key={u.uid} className="flex items-center px-5 py-4 hover:bg-white/5 transition-all gap-4">
                      {/* Avatar */}
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: cfg.color }}>
                        {u.displayName?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{u.displayName}</p>
                          {isMe && <span className="text-[10px] text-indigo-400 px-1.5 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.15)" }}>You</span>}
                        </div>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>

                      {/* Last login */}
                      <div className="text-center hidden md:block">
                        <p className="text-xs text-slate-400">{formatDate(u.lastLogin)}</p>
                        <p className="text-[10px] text-slate-600">Last login</p>
                      </div>

                      {/* Role selector */}
                      <div className="relative">
                        <select
                          value={u.role}
                          onChange={e => changeRole(u, e.target.value as Role)}
                          disabled={isMe || saving === u.uid + "_role"}
                          className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold outline-none cursor-pointer transition-all disabled:opacity-50"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                          {ROLES.map(r => <option key={r} value={r} style={{ background: "#1a1a2e", color: "#e2e8f0" }}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" style={{ color: cfg.color }} />
                      </div>

                      {/* Active toggle */}
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={isMe || saving === u.uid}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                        style={u.isActive
                          ? { background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }
                          : { background: "rgba(244,63,94,0.15)",  color: "#f43f5e", border: "1px solid rgba(244,63,94,0.3)" }}>
                        {saving === u.uid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                          u.isActive ? <><CheckCircle className="h-3.5 w-3.5" />Active</> : <><XCircle className="h-3.5 w-3.5" />Inactive</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RBAC Permission Matrix */}
          <div className="rounded-2xl p-6" style={card}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" /> Permission Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left text-slate-500 pb-3 pr-4 font-medium">Permission</th>
                    {ROLES.map(r => (
                      <th key={r} className="text-center pb-3 px-3 font-semibold" style={{ color: ROLE_COLORS[r].color }}>{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {[
                    "view_dashboard", "view_financial", "view_agents", "view_analytics",
                    "view_leads", "view_properties", "view_marketing", "view_workspace",
                    "add_property", "delete_property", "add_agent", "delete_agent",
                    "add_transaction", "delete_transaction", "add_lead", "delete_lead",
                    "add_campaign", "delete_campaign", "manage_users",
                  ].map(perm => (
                    <tr key={perm} className="hover:bg-white/5 transition-all">
                      <td className="py-2 pr-4 text-slate-400 font-mono">{perm.replace(/_/g, " ")}</td>
                      {ROLES.map(r => (
                        <td key={r} className="py-2 px-3 text-center">
                          {PERMISSIONS[r].includes(perm)
                            ? <CheckCircle className="h-3.5 w-3.5 mx-auto text-emerald-400" />
                            : <XCircle className="h-3.5 w-3.5 mx-auto text-slate-700" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;