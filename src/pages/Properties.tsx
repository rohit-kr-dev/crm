import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { RefreshCw, Home, Search, MapPin, IndianRupee, LayoutGrid, List } from "lucide-react";

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const STATUS_CONFIG = {
  available: { color: "#10b981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)" },
  pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" },
  sold:      { color: "#f43f5e", bg: "rgba(244,63,94,0.15)",  border: "rgba(244,63,94,0.3)"  },
};

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" };

const Properties = () => {
  const { data, refreshData } = useWorkspace();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshData) await refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const filtered = data.properties.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = data.properties.reduce((s, p) => s + p.price, 0);
  const availableValue = data.properties.filter(p => p.status === "available").reduce((s, p) => s + p.price, 0);

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f, #0d1117)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8 space-y-5">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-2xl font-bold text-white">Properties</h1>
              <p className="text-slate-400 text-sm mt-0.5">Portfolio value: {formatINR(totalValue)} · {data.properties.length} listings</p>
            </div>
            <button onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#6ee7b7" }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {(["available", "pending", "sold"] as const).map(status => {
              const cfg = STATUS_CONFIG[status];
              const props = data.properties.filter(p => p.status === status);
              const val = props.reduce((s, p) => s + p.price, 0);
              return (
                <div key={status} className="rounded-2xl p-5 hover:scale-[1.01] transition-all" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold capitalize" style={{ color: cfg.color }}>{status}</p>
                    <span className="text-xl font-bold text-white">{props.length}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{formatINR(val)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Total value</p>
                </div>
              );
            })}
          </div>

          {/* Available portfolio highlight */}
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)" }}>
              <IndianRupee className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Available Portfolio Value</p>
              <p className="text-xl font-bold text-white">{formatINR(availableValue)}</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 max-w-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search properties..."
                className="bg-transparent text-sm text-white placeholder:text-slate-500 outline-none flex-1" />
            </div>
            <div className="flex gap-1">
              {["all", "available", "pending", "sold"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                  style={statusFilter === s
                    ? { background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }
                    : { color: "#64748b", border: "1px solid transparent" }}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {([["grid", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className="p-2 transition-all"
                  style={view === v ? { background: "rgba(99,102,241,0.3)", color: "#a5b4fc" } : { background: "rgba(255,255,255,0.03)", color: "#64748b" }}>
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Grid View */}
          {view === "grid" ? (
            <div className="grid grid-cols-3 gap-4">
              {filtered.length === 0 ? (
                <div className="col-span-3 flex items-center justify-center py-16">
                  <div className="text-center">
                    <Home className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500">No properties found</p>
                  </div>
                </div>
              ) : filtered.map(p => {
                const cfg = STATUS_CONFIG[p.status];
                return (
                  <div key={p.id} className="rounded-2xl overflow-hidden group hover:scale-[1.01] hover:shadow-2xl transition-all duration-200" style={cardStyle}>
                    {/* Property image placeholder */}
                    <div className="h-36 flex items-center justify-center relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${cfg.color}22, ${cfg.color}08)` }}>
                      <Home className="h-12 w-12 opacity-20" style={{ color: cfg.color }} />
                      <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {p.status}
                      </span>
                      <span className="absolute top-3 left-3 text-xs text-slate-400 px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.4)" }}>
                        {p.type}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-white mb-1">{p.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mb-3"><MapPin className="h-3 w-3" />{p.location}</p>
                      <p className="text-lg font-bold" style={{ color: cfg.color }}>{formatINR(p.price)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="rounded-2xl overflow-hidden" style={cardStyle}>
              <div className="grid text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wider"
                style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span>Property</span><span>Location</span><span>Type</span><span>Price</span><span>Status</span>
              </div>
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-500 text-sm">No properties found</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {filtered.map(p => {
                    const cfg = STATUS_CONFIG[p.status];
                    return (
                      <div key={p.id} className="grid items-center px-5 py-3.5 hover:bg-white/5 transition-all"
                        style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr" }}>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                            <Home className="h-4 w-4" style={{ color: cfg.color }} />
                          </div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                        </div>
                        <p className="text-sm text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</p>
                        <p className="text-sm text-slate-400">{p.type}</p>
                        <p className="text-sm font-bold text-white">{formatINR(p.price)}</p>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize w-fit"
                          style={{ background: cfg.bg, color: cfg.color }}>{p.status}</span>
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

export default Properties;