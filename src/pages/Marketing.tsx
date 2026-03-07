import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { RefreshCw, Megaphone, TrendingUp, IndianRupee, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formatINR = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const STATUS_CONFIG = {
  active:    { color: "#10b981", bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.3)"  },
  paused:    { color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.3)"  },
  completed: { color: "#6366f1", bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.3)"  },
};

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };

const Marketing = () => {
  const { data, refreshData } = useWorkspace();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshData) await refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const totalBudget = data.campaigns.reduce((s, c) => s + c.budget, 0);
  const totalLeads = data.campaigns.reduce((s, c) => s + c.leads, 0);
  const avgCPL = totalLeads > 0 ? totalBudget / totalLeads : 0;

  const filtered = data.campaigns.filter(c => filter === "all" || c.status === filter);

  const chartData = data.campaigns.map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
    budget: c.budget,
    leads: c.leads,
    cpl: c.leads > 0 ? Math.round(c.budget / c.leads) : 0,
  }));

  // Platform breakdown
  const byPlatform: Record<string, { budget: number; leads: number }> = {};
  data.campaigns.forEach(c => {
    const p = c.platform || "Other";
    if (!byPlatform[p]) byPlatform[p] = { budget: 0, leads: 0 };
    byPlatform[p].budget += c.budget;
    byPlatform[p].leads += c.leads;
  });

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f, #0d1117)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-5">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-2xl font-bold text-white">Marketing</h1>
              <p className="text-slate-400 text-sm mt-0.5">Campaign performance & ROI tracking</p>
            </div>
            <button onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.3)", color: "#fdba74" }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Campaigns", value: String(data.campaigns.length), icon: Megaphone, color: "#fb923c" },
              { label: "Total Budget", value: formatINR(totalBudget), icon: IndianRupee, color: "#10b981" },
              { label: "Leads Generated", value: String(totalLeads), icon: Users, color: "#6366f1" },
              { label: "Avg Cost/Lead", value: formatINR(avgCPL), icon: TrendingUp, color: "#22d3ee" },
            ].map(card => (
              <div key={card.label} className="rounded-2xl p-5 hover:scale-[1.01] transition-all" style={cardStyle}>
                <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${card.color}18` }}>
                  <card.icon className="h-4 w-4" style={{ color: card.color }} />
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campaign Performance Chart */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">Budget vs Leads per Campaign</h3>
              {chartData.length === 0 ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No campaigns yet</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }}
                      formatter={(v: number, name: string) => [name === "budget" ? formatINR(v) : v, name]} />
                    <Bar dataKey="budget" fill="#fb923c" radius={4} name="Budget" />
                    <Bar dataKey="leads" fill="#6366f1" radius={4} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Platform Breakdown */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-sm font-semibold text-white mb-4">Platform Breakdown</h3>
              {Object.keys(byPlatform).length === 0 ? <p className="text-slate-500 text-sm">No data yet</p> : (
                <div className="space-y-3">
                  {Object.entries(byPlatform).map(([platform, stats], i) => {
                    const pct = totalLeads > 0 ? (stats.leads / totalLeads) * 100 : 0;
                    const colors = ["#6366f1", "#10b981", "#fb923c", "#22d3ee", "#f43f5e"];
                    return (
                      <div key={platform}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white font-medium">{platform}</span>
                          <div className="text-right">
                            <span className="text-xs text-slate-400">{stats.leads} leads · {formatINR(stats.budget)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10">
                          <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Campaign List */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Campaigns ({filtered.length})</h3>
              <div className="flex gap-1">
                {["all", "active", "paused", "completed"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
                    style={filter === f
                      ? { background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }
                      : { color: "#64748b" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0 ? (
              <p className="text-slate-500 text-sm">No campaigns yet.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map(c => {
                  const cfg = STATUS_CONFIG[c.status];
                  const cpl = c.leads > 0 ? Math.round(c.budget / c.leads) : 0;
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 transition-all" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                          <Megaphone className="h-4 w-4" style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.platform} · CPL: {formatINR(cpl)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm font-bold text-white">{formatINR(c.budget)}</p>
                          <p className="text-[10px] text-slate-500">Budget</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-white">{c.leads}</p>
                          <p className="text-[10px] text-slate-500">Leads</p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Marketing;