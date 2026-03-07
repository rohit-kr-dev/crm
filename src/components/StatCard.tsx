import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  subtitleColor?: string;
}

const StatCard = ({ title, value, subtitle, icon, subtitleColor = "text-stat-green" }: StatCardProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-card-foreground">{value}</p>
        <p className={`text-sm mt-1 ${subtitleColor}`}>{subtitle}</p>
      </div>
      <div>{icon}</div>
    </div>
  );
};

export default StatCard;
