import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { RefreshCw, UserPlus, Search, Phone, Mail, Filter } from "lucide-react";

const STATUS_CONFIG = {
  new:       { label: "New",       color: "#6366f1", bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.3)"  },
  contacted: { label: "Contacted", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)"  },
  qualified: { label: "Qualified", color: "#10b981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)"  },
  lost:      { label: "Lost",      color: "#f43f5e", bg: "rgba(244,63,94,0.15)",  border: "rgba(244,63,94,0.3)"   },
};

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };

const LeadsCRM = () => {
  const { data, refreshData } = useWorkspace();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"pipeline" | "list">("pipeline");
  const [sourceFilter, setSourceFilter] = useState("all");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshData) await refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const sources = ["all", ...Array.from(new Set(data.leads.map(l => l.source).filter(Boolean)))];

  const filtered = data.leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === "all" || l.source === sourceFilter;
    return matchSearch && matchSource;
  });

  const conversionRate = data.leads.length > 0
    ? ((data.leads.filter(l => l.status === "qualified").length / data.leads.length) * 100).toFixed(1)
    : "0";

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f, #0d1117)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-5">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-2xl font-bold text-white">Leads & CRM</h1>
              <p className="text-slate-400 text-sm mt-0.5">Manage your pipeline · {data.leads.length} total leads · {conversionRate}% conversion</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", color: "#c4b5fd" }}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>
          </div>

          {/* Summary Tiles */}
          <div className="grid grid-cols-4 gap-3">
            {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([status, cfg]) => {
              const count = data.leads.filter(l => l.status === status).length;
              return (
                <div key={status} className="rounded-2xl p-4 hover:scale-[1.01] transition-all" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-sm mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{data.leads.length > 0 ? ((count / data.leads.length) * 100).toFixed(0) : 0}% of total</p>
                </div>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 max-w-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
                className="bg-transparent text-sm text-white placeholder:text-slate-500 outline-none flex-1" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-300 outline-none">
                {sources.map(s => <option key={s} value={s} style={{ background: "#1a1a2e" }}>{s === "all" ? "All Sources" : s}</option>)}
              </select>
            </div>
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["pipeline", "list"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="px-4 py-2 text-xs font-medium capitalize transition-all"
                  style={view === v
                    ? { background: "rgba(99,102,241,0.3)", color: "#a5b4fc" }
                    : { background: "rgba(255,255,255,0.03)", color: "#64748b" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline View */}
          {view === "pipeline" ? (
            <div className="grid grid-cols-4 gap-4">
              {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([status, cfg]) => {
                const leads = filtered.filter(l => l.status === status);
                return (
                  <div key={status} className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", minHeight: 200 }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                        <span className="text-xs font-semibold text-white">{cfg.label}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>{leads.length}</span>
                    </div>
                    {leads.length === 0 ? (
                      <div className="flex items-center justify-center h-24 rounded-xl" style={{ border: `1px dashed ${cfg.border}` }}>
                        <p className="text-xs text-slate-600">No leads</p>
                      </div>
                    ) : leads.map(l => (
                      <div key={l.id} className="rounded-xl p-3 space-y-2 group cursor-pointer hover:scale-[1.01] transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: cfg.color }}>
                            {l.name[0]}
                          </div>
                          <p className="text-sm font-medium text-white truncate">{l.name}</p>
                        </div>
                        <div className="space-y-1">
                          {l.email && <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</p>}
                          {l.phone && <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" />{l.phone}</p>}
                        </div>
                        {l.source && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                            {l.source}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="rounded-2xl overflow-hidden" style={cardStyle}>
              <div className="grid text-xs font-semibold text-slate-500 px-4 py-3 uppercase tracking-wider" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span>Name</span><span>Contact</span><span>Source</span><span>Status</span><span></span>
              </div>
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <UserPlus className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No leads found</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {filtered.map(l => {
                    const cfg = STATUS_CONFIG[l.status];
                    return (
                      <div key={l.id} className="grid items-center px-4 py-3 hover:bg-white/5 transition-all" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr" }}>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: cfg.color }}>
                            {l.name[0]}
                          </div>
                          <p className="text-sm font-medium text-white">{l.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-300">{l.email}</p>
                          <p className="text-xs text-slate-500">{l.phone}</p>
                        </div>
                        <span className="text-xs text-slate-400">{l.source || "—"}</span>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg w-fit" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LeadsCRM;