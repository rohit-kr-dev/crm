import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { Property, Agent, Transaction, Lead, Campaign } from "@/contexts/WorkspaceContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trash2, Plus, Building2, Users, DollarSign,
  UserCheck, Megaphone, MapPin, Phone, Mail, Star
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const inp: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e2e8f0",
};

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  available: { color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  sold:      { color: "#f43f5e", bg: "rgba(244,63,94,0.15)"  },
  pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  income:    { color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  expense:   { color: "#f43f5e", bg: "rgba(244,63,94,0.15)"  },
  new:       { color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
  contacted: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  qualified: { color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  lost:      { color: "#f43f5e", bg: "rgba(244,63,94,0.15)"  },
  active:    { color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  paused:    { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  completed: { color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
};

const Badge = ({ status }: { status: string }) => {
  const cfg = STATUS_COLORS[status] || { color: "#94a3b8", bg: "rgba(148,163,184,0.15)" };
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
      style={{ background: cfg.bg, color: cfg.color }}>{status}</span>
  );
};

const SectionHeader = ({ icon: Icon, label, color, bg }: { icon: React.ElementType; label: string; color: string; bg: string }) => (
  <div className="flex items-center gap-2 mb-5">
    <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
      <Icon className="h-4 w-4" style={{ color }} />
    </div>
    <h3 className="text-base font-semibold text-white">{label}</h3>
  </div>
);

const EmptyState = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Icon className="h-10 w-10 text-slate-700 mb-2" />
    <p className="text-slate-500 text-sm">{text}</p>
  </div>
);

const Workspace = () => {
  const {
    data, addProperty, addAgent, addTransaction, addLead, addCampaign,
    deleteProperty, deleteAgent, deleteTransaction, deleteLead, deleteCampaign,
  } = useWorkspace();

  const [propForm, setPropForm] = useState<Omit<Property, "id">>({ name: "", location: "", price: 0, type: "", status: "available" });
  const [agentForm, setAgentForm] = useState<Omit<Agent, "id">>({ name: "", email: "", phone: "", salesCount: 0, revenue: 0, rating: 0 });
  const [txForm, setTxForm] = useState<Omit<Transaction, "id">>({ description: "", amount: 0, type: "income", date: "", category: "" });
  const [leadForm, setLeadForm] = useState<Omit<Lead, "id">>({ name: "", email: "", phone: "", status: "new", source: "" });
  const [campForm, setCampForm] = useState<Omit<Campaign, "id">>({ name: "", platform: "", budget: 0, leads: 0, status: "active" });
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (key: string, fn: () => Promise<void>, reset: () => void, msg: string) => {
    setSaving(key);
    try { await fn(); reset(); toast({ title: msg }); }
    catch (e) { toast({ title: "Failed to save", description: String(e), variant: "destructive" }); }
    finally { setSaving(null); }
  };

  const AGENT_COLORS = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#f43f5e"];

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f, #0d1117)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-8">
          <div className="pt-2 mb-5">
            <h1 className="text-2xl font-bold text-white">Workspace</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage all CRM data. Changes sync to Firestore in real-time.</p>
          </div>

          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="mb-5 p-1 rounded-2xl h-auto gap-1 w-full"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { v: "properties", label: "Properties", icon: Building2, count: data.properties.length },
                { v: "agents",     label: "Agents",     icon: Users,     count: data.agents.length },
                { v: "financial",  label: "Financial",  icon: DollarSign,count: data.transactions.length },
                { v: "leads",      label: "Leads",      icon: UserCheck, count: data.leads.length },
                { v: "marketing",  label: "Marketing",  icon: Megaphone, count: data.campaigns.length },
              ].map(t => (
                <TabsTrigger key={t.v} value={t.v}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all text-slate-500 data-[state=active]:text-white data-[state=active]:bg-white/10">
                  <t.icon className="h-4 w-4" />
                  {t.label}
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "#94a3b8" }}>{t.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ═══ PROPERTIES ═══ */}
            <TabsContent value="properties" className="space-y-4 mt-0">
              <div className="rounded-2xl p-6" style={card}>
                <SectionHeader icon={Building2} label="Add Property" color="#10b981" bg="rgba(16,185,129,0.2)" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Property Name *</label>
                    <Input placeholder="e.g. Sunrise Villa" value={propForm.name}
                      onChange={e => setPropForm({ ...propForm, name: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Location</label>
                    <Input placeholder="e.g. Koramangala, Bengaluru" value={propForm.location}
                      onChange={e => setPropForm({ ...propForm, location: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Price (₹) *</label>
                    <Input placeholder="e.g. 5000000" type="number" value={propForm.price || ""}
                      onChange={e => setPropForm({ ...propForm, price: Number(e.target.value) })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Type</label>
                    <Input placeholder="e.g. Residential" value={propForm.type}
                      onChange={e => setPropForm({ ...propForm, type: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Status</label>
                    <Select value={propForm.status} onValueChange={(v: Property["status"]) => setPropForm({ ...propForm, status: v })}>
                      <SelectTrigger style={inp} className="text-slate-300"><SelectValue /></SelectTrigger>
                      <SelectContent style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {["available","pending","sold"].map(s => <SelectItem key={s} value={s} className="text-slate-300 capitalize focus:bg-white/10">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={() => { if (!propForm.name || !propForm.price) { toast({ title: "Fill required fields", variant: "destructive" }); return; } save("prop", () => addProperty(propForm), () => setPropForm({ name: "", location: "", price: 0, type: "", status: "available" }), "Property added!"); }}
                      disabled={saving === "prop"} className="w-full font-semibold"
                      style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none" }}>
                      {saving === "prop" ? "Saving…" : <><Plus className="h-4 w-4 mr-1" />Add Property</>}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6" style={card}>
                <h3 className="text-sm font-semibold text-white mb-4">Properties ({data.properties.length})</h3>
                {data.properties.length === 0 ? <EmptyState icon={Building2} text="No properties yet. Add your first one above." /> : (
                  <div className="grid grid-cols-2 gap-3">
                    {data.properties.map(p => (
                      <div key={p.id} className="flex items-start justify-between p-4 rounded-xl group hover:bg-white/5 transition-all"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <p className="font-semibold text-white truncate">{p.name}</p>
                            <Badge status={p.status} />
                          </div>
                          {p.location && <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><MapPin className="h-3 w-3 shrink-0" />{p.location}</p>}
                          <p className="text-sm font-bold text-emerald-400">{formatINR(p.price)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{p.type}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteProperty(p.id)}
                          className="opacity-0 group-hover:opacity-100 h-7 w-7 shrink-0 ml-2 transition-opacity">
                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ═══ AGENTS ═══ */}
            <TabsContent value="agents" className="space-y-4 mt-0">
              <div className="rounded-2xl p-6" style={card}>
                <SectionHeader icon={Users} label="Add Agent" color="#22d3ee" bg="rgba(34,211,238,0.2)" />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Agent Name *", key: "name", ph: "e.g. Rahul Sharma", type: "text" },
                    { label: "Email", key: "email", ph: "e.g. rahul@realty.com", type: "email" },
                    { label: "Phone", key: "phone", ph: "e.g. +91 98765 43210", type: "text" },
                    { label: "Sales Count", key: "salesCount", ph: "e.g. 12", type: "number" },
                    { label: "Revenue (₹)", key: "revenue", ph: "e.g. 5000000", type: "number" },
                    { label: "Rating (0–5)", key: "rating", ph: "e.g. 4.5", type: "number" },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-xs text-slate-400">{f.label}</label>
                      <Input placeholder={f.ph} type={f.type}
                        value={(agentForm as Record<string, unknown>)[f.key] as string | number || ""}
                        onChange={e => setAgentForm({ ...agentForm, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                        style={inp} className="placeholder:text-slate-600" />
                    </div>
                  ))}
                </div>
                <Button onClick={() => { if (!agentForm.name) { toast({ title: "Fill agent name", variant: "destructive" }); return; } save("agent", () => addAgent(agentForm), () => setAgentForm({ name: "", email: "", phone: "", salesCount: 0, revenue: 0, rating: 0 }), "Agent added!"); }}
                  disabled={saving === "agent"} className="mt-4 font-semibold"
                  style={{ background: "linear-gradient(135deg,#22d3ee,#0891b2)", color: "#fff", border: "none" }}>
                  {saving === "agent" ? "Saving…" : <><Plus className="h-4 w-4 mr-1" />Add Agent</>}
                </Button>
              </div>

              <div className="rounded-2xl p-6" style={card}>
                <h3 className="text-sm font-semibold text-white mb-4">Agents ({data.agents.length})</h3>
                {data.agents.length === 0 ? <EmptyState icon={Users} text="No agents yet." /> : (
                  <div className="grid grid-cols-2 gap-3">
                    {data.agents.map((a, i) => (
                      <div key={a.id} className="flex items-start gap-3 p-4 rounded-xl group hover:bg-white/5 transition-all"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: AGENT_COLORS[i % AGENT_COLORS.length] }}>
                          {a.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{a.name}</p>
                          {a.email && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" />{a.email}</p>}
                          {a.phone && <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</p>}
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs font-bold text-white">{formatINR(a.revenue)}</span>
                            <span className="text-xs text-slate-500">{a.salesCount} sales</span>
                            <span className="text-xs text-amber-400 flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400" />{a.rating}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteAgent(a.id)}
                          className="opacity-0 group-hover:opacity-100 h-7 w-7 shrink-0 transition-opacity">
                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ═══ FINANCIAL ═══ */}
            <TabsContent value="financial" className="space-y-4 mt-0">
              <div className="rounded-2xl p-6" style={card}>
                <SectionHeader icon={DollarSign} label="Add Transaction" color="#6366f1" bg="rgba(99,102,241,0.2)" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Description *</label>
                    <Input placeholder="e.g. Property Sale" value={txForm.description}
                      onChange={e => setTxForm({ ...txForm, description: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Amount (₹) *</label>
                    <Input placeholder="e.g. 2500000" type="number" value={txForm.amount || ""}
                      onChange={e => setTxForm({ ...txForm, amount: Number(e.target.value) })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Type</label>
                    <Select value={txForm.type} onValueChange={(v: Transaction["type"]) => setTxForm({ ...txForm, type: v })}>
                      <SelectTrigger style={inp} className="text-slate-300"><SelectValue /></SelectTrigger>
                      <SelectContent style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <SelectItem value="income" className="text-emerald-400 focus:bg-white/10">Income</SelectItem>
                        <SelectItem value="expense" className="text-rose-400 focus:bg-white/10">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Date</label>
                    <Input type="date" value={txForm.date}
                      onChange={e => setTxForm({ ...txForm, date: e.target.value })} style={inp} className="text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Category</label>
                    <Input placeholder="e.g. Sales, Commission" value={txForm.category}
                      onChange={e => setTxForm({ ...txForm, category: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={() => { if (!txForm.description || !txForm.amount) { toast({ title: "Fill required fields", variant: "destructive" }); return; } save("tx", () => addTransaction(txForm), () => setTxForm({ description: "", amount: 0, type: "income", date: "", category: "" }), "Transaction added!"); }}
                      disabled={saving === "tx"} className="w-full font-semibold"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none" }}>
                      {saving === "tx" ? "Saving…" : <><Plus className="h-4 w-4 mr-1" />Add Transaction</>}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6" style={card}>
                <h3 className="text-sm font-semibold text-white mb-4">Transactions ({data.transactions.length})</h3>
                {data.transactions.length === 0 ? <EmptyState icon={DollarSign} text="No transactions yet." /> : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {data.transactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3.5 rounded-xl group hover:bg-white/5 transition-all"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === "income" ? "bg-emerald-500/15" : "bg-rose-500/15"}`}>
                            <DollarSign className={`h-4 w-4 ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{t.description}</p>
                            <p className="text-xs text-slate-500">{t.category}{t.date ? ` · ${t.date}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge status={t.type} />
                          <span className={`text-sm font-bold ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                            {t.type === "income" ? "+" : "-"}{formatINR(t.amount)}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)}
                            className="opacity-0 group-hover:opacity-100 h-7 w-7 transition-opacity">
                            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ═══ LEADS ═══ */}
            <TabsContent value="leads" className="space-y-4 mt-0">
              <div className="rounded-2xl p-6" style={card}>
                <SectionHeader icon={UserCheck} label="Add Lead" color="#a78bfa" bg="rgba(167,139,250,0.2)" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Lead Name *</label>
                    <Input placeholder="e.g. Priya Menon" value={leadForm.name}
                      onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Email</label>
                    <Input placeholder="e.g. priya@email.com" type="email" value={leadForm.email}
                      onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Phone</label>
                    <Input placeholder="e.g. +91 98765 43210" value={leadForm.phone}
                      onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Status</label>
                    <Select value={leadForm.status} onValueChange={(v: Lead["status"]) => setLeadForm({ ...leadForm, status: v })}>
                      <SelectTrigger style={inp} className="text-slate-300"><SelectValue /></SelectTrigger>
                      <SelectContent style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {["new","contacted","qualified","lost"].map(s => <SelectItem key={s} value={s} className="text-slate-300 capitalize focus:bg-white/10">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Source</label>
                    <Input placeholder="e.g. Website, Referral" value={leadForm.source}
                      onChange={e => setLeadForm({ ...leadForm, source: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={() => { if (!leadForm.name) { toast({ title: "Fill lead name", variant: "destructive" }); return; } save("lead", () => addLead(leadForm), () => setLeadForm({ name: "", email: "", phone: "", status: "new", source: "" }), "Lead added!"); }}
                      disabled={saving === "lead"} className="w-full font-semibold"
                      style={{ background: "linear-gradient(135deg,#a78bfa,#7c3aed)", color: "#fff", border: "none" }}>
                      {saving === "lead" ? "Saving…" : <><Plus className="h-4 w-4 mr-1" />Add Lead</>}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6" style={card}>
                <h3 className="text-sm font-semibold text-white mb-4">Leads ({data.leads.length})</h3>
                {data.leads.length === 0 ? <EmptyState icon={UserCheck} text="No leads yet." /> : (
                  <div className="grid grid-cols-2 gap-3">
                    {data.leads.map(l => (
                      <div key={l.id} className="flex items-start justify-between p-4 rounded-xl group hover:bg-white/5 transition-all"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <p className="font-semibold text-white">{l.name}</p>
                            <Badge status={l.status} />
                          </div>
                          {l.email && <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</p>}
                          {l.phone && <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="h-3 w-3" />{l.phone}</p>}
                          {l.source && <p className="text-xs text-slate-500 mt-1">via {l.source}</p>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteLead(l.id)}
                          className="opacity-0 group-hover:opacity-100 h-7 w-7 shrink-0 ml-2 transition-opacity">
                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ═══ MARKETING ═══ */}
            <TabsContent value="marketing" className="space-y-4 mt-0">
              <div className="rounded-2xl p-6" style={card}>
                <SectionHeader icon={Megaphone} label="Add Campaign" color="#fb923c" bg="rgba(251,146,60,0.2)" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Campaign Name *</label>
                    <Input placeholder="e.g. Spring Push" value={campForm.name}
                      onChange={e => setCampForm({ ...campForm, name: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Platform</label>
                    <Input placeholder="e.g. Facebook, Google" value={campForm.platform}
                      onChange={e => setCampForm({ ...campForm, platform: e.target.value })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Budget (₹)</label>
                    <Input placeholder="e.g. 50000" type="number" value={campForm.budget || ""}
                      onChange={e => setCampForm({ ...campForm, budget: Number(e.target.value) })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Leads Generated</label>
                    <Input placeholder="e.g. 42" type="number" value={campForm.leads || ""}
                      onChange={e => setCampForm({ ...campForm, leads: Number(e.target.value) })} style={inp} className="placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Status</label>
                    <Select value={campForm.status} onValueChange={(v: Campaign["status"]) => setCampForm({ ...campForm, status: v })}>
                      <SelectTrigger style={inp} className="text-slate-300"><SelectValue /></SelectTrigger>
                      <SelectContent style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {["active","paused","completed"].map(s => <SelectItem key={s} value={s} className="text-slate-300 capitalize focus:bg-white/10">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={() => { if (!campForm.name) { toast({ title: "Fill campaign name", variant: "destructive" }); return; } save("camp", () => addCampaign(campForm), () => setCampForm({ name: "", platform: "", budget: 0, leads: 0, status: "active" }), "Campaign added!"); }}
                      disabled={saving === "camp"} className="w-full font-semibold"
                      style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)", color: "#fff", border: "none" }}>
                      {saving === "camp" ? "Saving…" : <><Plus className="h-4 w-4 mr-1" />Add Campaign</>}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6" style={card}>
                <h3 className="text-sm font-semibold text-white mb-4">Campaigns ({data.campaigns.length})</h3>
                {data.campaigns.length === 0 ? <EmptyState icon={Megaphone} text="No campaigns yet." /> : (
                  <div className="space-y-2">
                    {data.campaigns.map(c => {
                      const cpl = c.leads > 0 ? Math.round(c.budget / c.leads) : 0;
                      return (
                        <div key={c.id} className="flex items-center justify-between p-4 rounded-xl group hover:bg-white/5 transition-all"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(251,146,60,0.15)" }}>
                              <Megaphone className="h-4 w-4 text-orange-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{c.name}</p>
                              <p className="text-xs text-slate-500">{c.platform} · CPL: {formatINR(cpl)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm font-bold text-white">{formatINR(c.budget)}</p>
                              <p className="text-[10px] text-slate-500">Budget</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-white">{c.leads}</p>
                              <p className="text-[10px] text-slate-500">Leads</p>
                            </div>
                            <Badge status={c.status} />
                            <Button variant="ghost" size="icon" onClick={() => deleteCampaign(c.id)}
                              className="opacity-0 group-hover:opacity-100 h-7 w-7 transition-opacity">
                              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Workspace;