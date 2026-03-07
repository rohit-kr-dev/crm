import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { TrendingUp, TrendingDown, RefreshCw, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const CACHE_KEY = "financial_cache";
const CACHE_TTL = 5 * 60 * 1000;

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };

const Financial = () => {
  const { data, refreshData } = useWorkspace();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [cachedStats, setCachedStats] = useState<{ income: number; expenses: number; net: number } | null>(null);

  const computeAndCache = useCallback(() => {
    const income = data.transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = data.transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const stats = { income, expenses, net: income - expenses };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: stats, timestamp: Date.now() }));
    setCachedStats(stats);
  }, [data]);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data: cd, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) { setCachedStats(cd); return; }
    }
    computeAndCache();
  }, [data, computeAndCache]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    localStorage.removeItem(CACHE_KEY);
    if (refreshData) await refreshData();
    computeAndCache();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const stats = cachedStats || { income: 0, expenses: 0, net: 0 };

  const byCategory: Record<string, { income: number; expense: number }> = {};
  data.transactions.forEach(t => {
    const cat = t.category || "Other";
    if (!byCategory[cat]) byCategory[cat] = { income: 0, expense: 0 };
    if (t.type === "income") byCategory[cat].income += t.amount;
    else byCategory[cat].expense += t.amount;
  });
  const chartData = Object.entries(byCategory).map(([name, v]) => ({ name, ...v }));

  const byMonth: Record<string, { month: string; income: number; expense: number }> = {};
  data.transactions.forEach(t => {
    const month = t.date ? t.date.slice(0, 7) : "Unknown";
    if (!byMonth[month]) byMonth[month] = { month, income: 0, expense: 0 };
    if (t.type === "income") byMonth[month].income += t.amount;
    else byMonth[month].expense += t.amount;
  });
  const trendData = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));

  const filtered = data.transactions.filter(t => filter === "all" || t.type === filter);

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f, #0d1117)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-5">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-2xl font-bold text-white">Financial</h1>
              <p className="text-slate-400 text-sm mt-0.5">Track revenue, expenses & net profit</p>
            </div>
            <button onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Income", value: formatINR(stats.income), icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.1)", count: data.transactions.filter(t => t.type === "income").length, up: true },
              { label: "Total Expenses", value: formatINR(stats.expenses), icon: TrendingDown, color: "#f43f5e", bg: "rgba(244,63,94,0.1)", count: data.transactions.filter(t => t.type === "expense").length, up: false },
              { label: "Net Profit", value: formatINR(Math.abs(stats.net)), icon: PiggyBank, color: stats.net >= 0 ? "#6366f1" : "#f43f5e", bg: stats.net >= 0 ? "rgba(99,102,241,0.1)" : "rgba(244,63,94,0.1)", count: data.transactions.length, up: stats.net >= 0 },
            ].map(card => (
              <div key={card.label} className="rounded-2xl p-5 hover:scale-[1.01] transition-all duration-200" style={cardStyle}>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                    <card.icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-semibold ${card.up ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}>
                    {card.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {card.count} txns
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">By Category</h3>
              {chartData.length === 0 ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatINR} />
                    <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} formatter={(v: number) => formatINR(v)} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" radius={4} name="Income" />
                    <Bar dataKey="expense" fill="#f43f5e" radius={4} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">Monthly Trend</h3>
              {trendData.length === 0 ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatINR} />
                    <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} formatter={(v: number) => formatINR(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} dot={false} name="Expense" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Transaction List */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Transactions ({filtered.length})</h3>
              <div className="flex gap-1">
                {(["all", "income", "expense"] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
                    style={filter === f
                      ? { background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }
                      : { color: "#64748b", border: "1px solid transparent" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0 ? (
              <p className="text-slate-500 text-sm">No transactions yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filtered.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${t.type === "income" ? "bg-emerald-500/15" : "bg-rose-500/15"}`}>
                        {t.type === "income" ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-rose-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{t.description}</p>
                        <p className="text-xs text-slate-500">{t.category} · {t.date}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.type === "income" ? "+" : "-"}{formatINR(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Financial;