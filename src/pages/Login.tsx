// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Building2, Mail, Lock, AlertCircle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shake, setShake] = useState(false);

  const { resetPassword } = useAuth();

useEffect(() => {
  if (user) navigate(from, { replace: true });
}, [user, navigate, from]);

  // Animated background dots
  const dots = Array.from({ length: 20 }, (_, i) => i);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Enter your email address."); return; }
    setLoading(true); setError("");
    try {
      await resetPassword(email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch {
      setError("Failed to send reset email. Check the address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #080810 0%, #0d0d1f 50%, #080810 100%)" }}>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {dots.map(i => (
          <div key={i} className="absolute rounded-full opacity-20"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: "#6366f1",
              left: `${(i * 5.3) % 100}%`,
              top: `${(i * 7.7) % 100}%`,
              animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }} />
        ))}
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }} />
      </div>

      {/* Card */}
      <div className={`relative w-full max-w-md mx-4 transition-all duration-300 ${shake ? "animate-shake" : ""}`}>
        <div className="rounded-3xl p-8 backdrop-blur-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">RealEstate CRM</p>
              <p className="text-xs text-slate-500">Secure Portal</p>
            </div>
          </div>

          {mode === "login" ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                <p className="text-slate-400 text-sm mt-1">Sign in to access your dashboard</p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.25)" }}>
                  <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                  <span className="text-rose-300">{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@company.com" autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)"}
                      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type={showPassword ? "text" : "password"} value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••" autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)"}
                      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me + forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="sr-only" />
                      <div className="h-4 w-4 rounded flex items-center justify-center transition-all"
                        style={{ background: rememberMe ? "#6366f1" : "rgba(255,255,255,0.08)", border: rememberMe ? "none" : "1px solid rgba(255,255,255,0.2)" }}>
                        {rememberMe && <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">Remember me</span>
                  </label>
                  <button type="button" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] hover:shadow-lg disabled:opacity-60 disabled:scale-100 mt-2"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>

              {/* Security notice */}
              <p className="text-center text-xs text-slate-600 mt-6">
                🔒 Protected by Firebase Auth · Account locks after {5} failed attempts
              </p>
            </>
          ) : (
            <>
              <div className="mb-6">
                <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4 flex items-center gap-1">
                  ← Back to login
                </button>
                <h1 className="text-2xl font-bold text-white">Reset password</h1>
                <p className="text-slate-400 text-sm mt-1">Enter your email to receive a reset link</p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.25)" }}>
                  <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                  <span className="text-rose-300">{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-emerald-300">{success}</span>
                </div>
              )}

              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)"}
                      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.5); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;