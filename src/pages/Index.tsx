import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  IndianRupee, Users, Home, TrendingUp, TrendingDown,
  RefreshCw, ArrowUpRight, ArrowDownRight, Clock, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const formatINR = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

const CACHE_KEY = "dashboard_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e"];

const Index = () => {
  const { data, refreshData } = useWorkspace();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedStats, setCachedStats] = useState<Record<string, number> | null>(null);
  const [animateCards, setAnimateCards] = useState(false);

  // Cache computed stats to avoid re-computing on every render
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data: cData, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        setCachedStats(cData);
        return;
      }
    }
    computeAndCache();
  }, [data]);

  const computeAndCache = useCallback(() => {
    const income = data.transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = data.transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const stats = {
      income, expenses,
      net: income - expenses,
      agents: data.agents.length,
      properties: data.properties.length,
      available: data.properties.filter(p => p.status === "available").length,
      leads: data.leads.length,
      qualified: data.leads.filter(l => l.status === "qualified").length,
      campaigns: data.campaigns.filter(c => c.status === "active").length,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: stats, timestamp: Date.now() }));
    setCachedStats(stats);
  }, [data]);

  useEffect(() => {
    setTimeout(() => setAnimateCards(true), 100);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    localStorage.removeItem(CACHE_KEY);
    if (refreshData) await refreshData();
    computeAndCache();
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const stats = cachedStats || {
    income: 0, expenses: 0, net: 0, agents: 0,
    properties: 0, available: 0, leads: 0, qualified: 0, campaigns: 0,
  };

  const conversionRate = stats.leads > 0 ? ((stats.qualified / stats.leads) * 100).toFixed(1) : "0";

  // Monthly chart data
  const monthlyData = (() => {
    const map: Record<string, { month: string; income: number; expenses: number }> = {};
    data.transactions.forEach(t => {
      const month = t.date ? t.date.slice(0, 7) : "Unknown";
      if (!map[month]) map[month] = { month, income: 0, expenses: 0 };
      if (t.type === "income") map[month].income += t.amount;
      else map[month].expenses += t.amount;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  })();

  // Lead status pie
  const leadPie = ["new", "contacted", "qualified", "lost"].map(s => ({
    name: s, value: data.leads.filter(l => l.status === s).length,
  })).filter(d => d.value > 0);

  // Top agents
  const topAgents = [...data.agents].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const statCards = [
    {
      label: "Total Revenue", value: formatINR(stats.income),
      sub: `${data.transactions.filter(t => t.type === "income").length} transactions`,
      icon: IndianRupee, color: "#6366f1", bg: "from-indigo-500/20 to-indigo-500/5",
      trend: "+12.5%", up: true,
    },
    {
      label: "Active Agents", value: String(stats.agents),
      sub: `${stats.campaigns} active campaigns`,
      icon: Users, color: "#22d3ee", bg: "from-cyan-500/20 to-cyan-500/5",
      trend: "+2", up: true,
    },
    {
      label: "Properties", value: String(stats.properties),
      sub: `${stats.available} available`,
      icon: Home, color: "#10b981", bg: "from-emerald-500/20 to-emerald-500/5",
      trend: `${stats.available} live`, up: true,
    },
    {
      label: "Conversion Rate", value: `${conversionRate}%`,
      sub: `${stats.qualified}/${stats.leads} qualified`,
      icon: TrendingUp, color: "#f59e0b", bg: "from-amber-500/20 to-amber-500/5",
      trend: conversionRate > "50" ? "Above avg" : "Below avg",
      up: conversionRate > "50",
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #12131f 50%, #0d1117 100%)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Updated {lastUpdated.toLocaleTimeString("en-IN")}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <div
                key={card.label}
                className={`rounded-2xl p-5 transition-all duration-500 cursor-default group hover:scale-[1.02] hover:shadow-2xl ${animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
                  border: "1px solid rgba(255,255,255,0.08)",
                  transitionDelay: `${i * 80}ms`,
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.bg}`}>
                    <card.icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 ${card.up ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}>
                    {card.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {card.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                <p className="text-xs text-slate-400">{card.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Revenue Chart */}
            <div className="col-span-2 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Revenue vs Expenses</h3>
                <span className="text-xs text-slate-500">Last 6 months</span>
              </div>
              {monthlyData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Add transactions to see chart</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatINR(v)} />
                    <Tooltip
                      contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
                      formatter={(v: number) => formatINR(v)}
                    />
                    <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expGrad)" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Lead Pie */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-sm font-semibold text-white mb-4">Lead Pipeline</h3>
              {leadPie.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No leads yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={leadPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                        {leadPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {leadPie.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-slate-400 capitalize">{d.name}</span>
                        </div>
                        <span className="text-xs font-medium text-white">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Agents */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Top Agents</h3>
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              {topAgents.length === 0 ? (
                <p className="text-slate-500 text-sm">No agents yet</p>
              ) : (
                <div className="space-y-3">
                  {topAgents.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}>
                        {a.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{a.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 rounded-full bg-white/10">
                            <div className="h-1 rounded-full transition-all duration-700"
                              style={{
                                background: COLORS[i % COLORS.length],
                                width: `${Math.min(100, (a.revenue / (topAgents[0]?.revenue || 1)) * 100)}%`
                              }} />
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">{formatINR(a.revenue)}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-amber-400">⭐ {a.rating}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="text-sm font-semibold text-white mb-4">Recent Transactions</h3>
              {data.transactions.length === 0 ? (
                <p className="text-slate-500 text-sm">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {[...data.transactions].slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center gap-2.5">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${t.type === "income" ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                          {t.type === "income"
                            ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                            : <TrendingDown className="h-3.5 w-3.5 text-rose-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white truncate max-w-[140px]">{t.description}</p>
                          <p className="text-[10px] text-slate-500">{t.category} · {t.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.type === "income" ? "+" : "-"}{formatINR(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;