import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { RefreshCw, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const COLORS = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#f43f5e", "#a78bfa"];
const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };

const Analytics = () => {
  const { data, refreshData } = useWorkspace();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshData) await refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const totalRevenue = data.transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = data.transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const conversionRate = data.leads.length > 0
    ? ((data.leads.filter(l => l.status === "qualified").length / data.leads.length) * 100).toFixed(1) : "0";

  // Lead source breakdown
  const sourcePie = Object.entries(
    data.leads.reduce((acc, l) => { const s = l.source || "Unknown"; acc[s] = (acc[s] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Property type breakdown
  const propTypePie = Object.entries(
    data.properties.reduce((acc, p) => { acc[p.type || "Other"] = (acc[p.type || "Other"] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Monthly revenue trend
  const monthlyMap: Record<string, { month: string; revenue: number; expenses: number }> = {};
  data.transactions.forEach(t => {
    const m = t.date ? t.date.slice(0, 7) : "Unknown";
    if (!monthlyMap[m]) monthlyMap[m] = { month: m, revenue: 0, expenses: 0 };
    if (t.type === "income") monthlyMap[m].revenue += t.amount;
    else monthlyMap[m].expenses += t.amount;
  });
  const monthlyData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  // Agent comparison
  const agentChart = [...data.agents].sort((a, b) => b.revenue - a.revenue).slice(0, 6).map(a => ({
    name: a.name.split(" ")[0],
    revenue: a.revenue,
    sales: a.salesCount * 100000,
  }));

  const kpis = [
    { label: "Total Revenue", value: formatINR(totalRevenue), sub: `${data.transactions.filter(t => t.type === "income").length} income txns` },
    { label: "Total Expenses", value: formatINR(totalExpenses), sub: `${data.transactions.filter(t => t.type === "expense").length} expense txns` },
    { label: "Net Profit", value: formatINR(totalRevenue - totalExpenses), sub: totalRevenue > totalExpenses ? "Profitable" : "In deficit" },
    { label: "Conversion Rate", value: `${conversionRate}%`, sub: `${data.leads.filter(l => l.status === "qualified").length}/${data.leads.length} qualified` },
    { label: "Avg Deal Size", value: data.properties.length > 0 ? formatINR(data.properties.reduce((s, p) => s + p.price, 0) / data.properties.length) : "₹0", sub: "Avg property value" },
    { label: "Active Campaigns", value: String(data.campaigns.filter(c => c.status === "active").length), sub: `${data.campaigns.length} total` },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f, #0d1117)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-5">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <p className="text-slate-400 text-sm mt-0.5">Full business intelligence overview</p>
            </div>
            <button onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d" }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-6 gap-3">
            {kpis.map((k, i) => (
              <div key={k.label} className="rounded-2xl p-4 hover:scale-[1.02] transition-all" style={cardStyle}>
                <div className="h-1 w-8 rounded-full mb-3" style={{ background: COLORS[i % COLORS.length] }} />
                <p className="text-xl font-bold text-white">{k.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">{k.label}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue Trend */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Revenue Trend</h3>
            </div>
            {monthlyData.length === 0 ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No transaction data yet</div> : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="aRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aExpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatINR} />
                  <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} formatter={(v: number) => formatINR(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#aRevGrad)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#aExpGrad)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Lead Sources */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">Lead Sources</h3>
              {sourcePie.length === 0 ? <div className="h-40 flex items-center justify-center text-slate-500 text-sm">No leads</div> : (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={sourcePie} cx="50%" cy="50%" outerRadius={55} innerRadius={30} dataKey="value" strokeWidth={0}>
                        {sourcePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {sourcePie.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-slate-400">{d.name}</span>
                        </div>
                        <span className="text-xs font-bold text-white">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Property Types */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">Property Types</h3>
              {propTypePie.length === 0 ? <div className="h-40 flex items-center justify-center text-slate-500 text-sm">No properties</div> : (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={propTypePie} cx="50%" cy="50%" outerRadius={55} innerRadius={30} dataKey="value" strokeWidth={0}>
                        {propTypePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {propTypePie.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-slate-400">{d.name}</span>
                        </div>
                        <span className="text-xs font-bold text-white">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Agent Chart */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">Top Agent Revenue</h3>
              {agentChart.length === 0 ? <div className="h-40 flex items-center justify-center text-slate-500 text-sm">No agents</div> : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={agentChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatINR} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
                    <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} formatter={(v: number) => formatINR(v)} />
                    <Bar dataKey="revenue" radius={3} name="Revenue">
                      {agentChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;