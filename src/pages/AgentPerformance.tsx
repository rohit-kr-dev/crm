import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { RefreshCw, Star, TrendingUp, Award, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const COLORS = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#f43f5e"];
const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };

const AgentPerformance = () => {
  const { data, refreshData } = useWorkspace();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"revenue" | "salesCount" | "rating">("revenue");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshData) await refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const sorted = [...data.agents].sort((a, b) => b[sortBy] - a[sortBy]);
  const totalRevenue = data.agents.reduce((s, a) => s + a.revenue, 0);
  const totalSales = data.agents.reduce((s, a) => s + a.salesCount, 0);
  const avgRating = data.agents.length > 0 ? (data.agents.reduce((s, a) => s + a.rating, 0) / data.agents.length).toFixed(1) : "0";
  const topAgent = sorted[0];

  const chartData = sorted.slice(0, 8).map(a => ({
    name: a.name.split(" ")[0],
    revenue: a.revenue,
    sales: a.salesCount,
  }));

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f, #0d1117)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-5">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-2xl font-bold text-white">Agent Performance</h1>
              <p className="text-slate-400 text-sm mt-0.5">Monitor your team's metrics and rankings</p>
            </div>
            <button onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)", color: "#67e8f9" }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Agents", value: String(data.agents.length), icon: Users, color: "#22d3ee" },
              { label: "Total Revenue", value: formatINR(totalRevenue), icon: TrendingUp, color: "#10b981" },
              { label: "Total Sales", value: String(totalSales), icon: Award, color: "#f59e0b" },
              { label: "Avg Rating", value: avgRating, icon: Star, color: "#6366f1" },
            ].map(card => (
              <div key={card.label} className="rounded-2xl p-5 hover:scale-[1.01] transition-all" style={cardStyle}>
                <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${card.color}18` }}>
                  <card.icon className="h-4.5 w-4.5" style={{ color: card.color }} />
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Top performer highlight */}
          {topAgent && (
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {topAgent.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Award className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Top Performer</span>
                  </div>
                  <p className="text-lg font-bold text-white">{topAgent.name}</p>
                  <p className="text-sm text-slate-400">{topAgent.email}</p>
                </div>
                <div className="ml-auto grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-xl font-bold text-white">{formatINR(topAgent.revenue)}</p>
                    <p className="text-xs text-slate-500">Revenue</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{topAgent.salesCount}</p>
                    <p className="text-xs text-slate-500">Sales</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-400">⭐ {topAgent.rating}</p>
                    <p className="text-xs text-slate-500">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Chart */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">Revenue by Agent</h3>
              {chartData.length === 0 ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No agents yet</div> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatINR} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} formatter={(v: number) => formatINR(v)} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={4} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Agent Rankings */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Rankings</h3>
                <div className="flex gap-1">
                  {(["revenue", "salesCount", "rating"] as const).map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className="px-2.5 py-1 rounded-lg text-xs capitalize transition-all"
                      style={sortBy === s
                        ? { background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }
                        : { color: "#64748b" }}>
                      {s === "salesCount" ? "Sales" : s}
                    </button>
                  ))}
                </div>
              </div>
              {sorted.length === 0 ? <p className="text-slate-500 text-sm">No agents yet</p> : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {sorted.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <span className="text-xs font-bold w-5 text-center" style={{ color: i < 3 ? COLORS[i] : "#475569" }}>#{i + 1}</span>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: COLORS[i % COLORS.length] }}>
                        {a.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{a.name}</p>
                        <p className="text-xs text-slate-500">{a.phone}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-white">{sortBy === "revenue" ? formatINR(a.revenue) : sortBy === "salesCount" ? `${a.salesCount} sales` : `⭐ ${a.rating}`}</p>
                      </div>
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

export default AgentPerformance;