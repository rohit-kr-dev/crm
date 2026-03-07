import { useWorkspace } from "@/contexts/WorkspaceContext";
import { DollarSign, UserPlus, Home, Megaphone } from "lucide-react";

const RecentActivities = () => {
  const { data } = useWorkspace();

  type ActivityItem = {
    id: string;
    label: string;
    sub: string;
    time: string;
    icon: React.ReactNode;
    color: string;
  };

  const activities: ActivityItem[] = [
    ...data.transactions.slice(-3).reverse().map((t) => ({
      id: "tx-" + t.id,
      label: t.description,
      sub: `${t.type === "income" ? "+" : "-"}$${t.amount.toLocaleString()} · ${t.category}`,
      time: t.date || "Recently",
      icon: <DollarSign className="h-4 w-4" />,
      color: t.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600",
    })),
    ...data.leads.slice(-2).reverse().map((l) => ({
      id: "lead-" + l.id,
      label: `New lead: ${l.name}`,
      sub: `${l.source} · ${l.status}`,
      time: "Recently",
      icon: <UserPlus className="h-4 w-4" />,
      color: "bg-blue-500/10 text-blue-600",
    })),
    ...data.properties.slice(-2).reverse().map((p) => ({
      id: "prop-" + p.id,
      label: p.name,
      sub: `${p.location} · ${p.status}`,
      time: "Recently",
      icon: <Home className="h-4 w-4" />,
      color: "bg-violet-500/10 text-violet-600",
    })),
    ...data.campaigns.filter((c) => c.status === "active").slice(0, 1).map((c) => ({
      id: "camp-" + c.id,
      label: `Campaign: ${c.name}`,
      sub: `${c.platform} · ${c.leads} leads`,
      time: "Active",
      icon: <Megaphone className="h-4 w-4" />,
      color: "bg-orange-500/10 text-orange-600",
    })),
  ].slice(0, 6);

  return (
    <div className="bg-card rounded-xl border border-border p-6 flex-1">
      <h3 className="text-lg font-semibold text-card-foreground mb-5">Recent Activities</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity. Add data in the Workspace.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.sub}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;