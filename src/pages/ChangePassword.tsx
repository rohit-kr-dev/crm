// src/pages/ChangePassword.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",           test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const inp: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e2e8f0",
};

const ChangePassword = () => {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const strength = requirements.filter(r => r.test(next)).length;
  const strengthLabel = ["Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["#f43f5e", "#f59e0b", "#f59e0b", "#10b981", "#10b981"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!current || !next || !confirm) { setError("All fields are required."); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (strength < 4) { setError("Password doesn't meet all requirements."); return; }
    setLoading(true);
    try {
      await changePassword(current, next);
      setSuccess("Password changed successfully!");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f, #0d1117)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8 flex items-start justify-center pt-10">
          <div className="w-full max-w-md">
            <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Change Password</h1>
                  <p className="text-xs text-slate-400">Update your account password</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}>
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="text-rose-300">{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current password */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type={showCurrent ? "text" : "password"} value={current}
                      onChange={e => setCurrent(e.target.value)} placeholder="Your current password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none"
                      style={inp} />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type={showNext ? "text" : "password"} value={next}
                      onChange={e => setNext(e.target.value)} placeholder="New secure password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none"
                      style={inp} />
                    <button type="button" onClick={() => setShowNext(!showNext)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {next && (
                    <div>
                      <div className="flex gap-1 mt-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all"
                            style={{ background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)" }} />
                        ))}
                      </div>
                      <p className="text-xs mt-1" style={{ color: strengthColor }}>{strengthLabel}</p>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {requirements.map(r => (
                          <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(next) ? "text-emerald-400" : "text-slate-600"}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${r.test(next) ? "bg-emerald-400" : "bg-slate-600"}`} />
                            {r.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{ ...inp, borderColor: confirm && next !== confirm ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.1)" }} />
                    {confirm && next === confirm && (
                      <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60 mt-2"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Updating...</> : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChangePassword;