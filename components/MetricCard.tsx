"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  trend?: number;
  status?: "normal" | "warning" | "critical";
  subtitle?: string;
  accentColor?: string;
}

const statusColors = {
  normal: "text-green-400",
  warning: "text-yellow-400",
  critical: "text-red-400",
};

export default function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  status = "normal",
  subtitle,
  accentColor = "bg-slate-500/10 border-slate-500/20",
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0d1526] border border-white/6 p-5 hover:border-white/10 transition-all duration-200">
      {/* Subtle top glow line */}
      <div className={cn("absolute top-0 left-0 right-0 h-px opacity-60",
        status === "critical" ? "bg-gradient-to-r from-transparent via-red-500 to-transparent" :
        status === "warning" ? "bg-gradient-to-r from-transparent via-yellow-500 to-transparent" :
        "bg-gradient-to-r from-transparent via-slate-600 to-transparent"
      )} />

      <div className="flex items-start justify-between mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", accentColor)}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend > 0 ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
          )}>
            <span>{trend > 0 ? "↑" : "↓"}</span>
            <span>{Math.abs(trend).toFixed(1)}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-end gap-1.5">
          <span className={cn("text-3xl font-bold tabular-nums", statusColors[status])}>{value}</span>
          <span className="text-sm text-slate-500 mb-1">{unit}</span>
        </div>
        {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
