"use client";

import { recentAlerts, riskConfig } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

export default function AlertsPanel() {
  return (
    <div className="rounded-2xl bg-[#0d1526] border border-white/6 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Historial de Alertas</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
          {recentAlerts.filter((a) => !a.resolved).length} activas
        </span>
      </div>

      <div className="divide-y divide-white/4">
        {recentAlerts.map((alert) => {
          const cfg = riskConfig[alert.riskLevel];
          return (
            <div key={alert.id} className={cn("flex items-start gap-4 px-5 py-4 transition-colors", !alert.resolved && cn("", cfg.bg))}>
              <div className="mt-0.5 flex-shrink-0">
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold", cfg.bg, cfg.border, cfg.text)}>
                  {alert.riskLevel === "rojo" ? "🔴" : alert.riskLevel === "naranja" ? "🟠" : "🟡"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", cfg.text)}>{cfg.label}</span>
                  {alert.resolved && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-500">Resuelta</span>
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-snug">{alert.message}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-slate-500">{alert.location}</span>
                  <span className="text-[10px] text-slate-600">·</span>
                  <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
