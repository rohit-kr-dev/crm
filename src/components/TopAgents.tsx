import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Star } from "lucide-react";

const COLORS = ["bg-violet-500", "bg-emerald-500", "bg-orange-500", "bg-blue-500", "bg-rose-500"];

const TopAgents = () => {
  const { data } = useWorkspace();

  const sorted = [...data.agents]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-6 flex-1">
      <h3 className="text-lg font-semibold text-card-foreground mb-5">Top Performing Agents</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No agents yet. Add some in the Workspace.</p>
      ) : (
        <div className="space-y-4">
          {sorted.map((agent, i) => (
            <div key={agent.id} className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.salesCount} sales · ${(agent.revenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="flex items-center gap-0.5 text-yellow-500 shrink-0">
                <Star className="h-3.5 w-3.5 fill-yellow-500" />
                <span className="text-xs font-semibold text-foreground">{agent.rating}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopAgents;