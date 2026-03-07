import { useNavigate } from "react-router-dom";
import { Plus, UserPlus, DollarSign, Megaphone } from "lucide-react";

const actions = [
  { label: "Add Property", icon: Plus, color: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20", path: "/workspace" },
  { label: "Add Lead", icon: UserPlus, color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20", path: "/workspace" },
  { label: "Log Transaction", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20", path: "/workspace" },
  { label: "New Campaign", icon: Megaphone, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20", path: "/workspace" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-4">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors ${a.color}`}
          >
            <a.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;