"use client";

import { useState } from "react";
import { recentAlerts, riskConfig } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

export default function FloatingAlerts() {
  const [open, setOpen] = useState(false);
  const active = recentAlerts.filter(a => !a.resolved).length;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel flotante */}
      <div className={cn(
        "fixed bottom-24 right-6 z-50 w-[360px] rounded-2xl shadow-2xl border border-white/8",
        "bg-[#0d1829] transition-all duration-200 ease-out origin-bottom-right",
        open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
            </svg>
            <p className="text-sm font-bold text-white">Alertas del Sistema</p>
          </div>
          <button onClick={() => setOpen(false)}
            className="text-slate-600 hover:text-slate-300 transition-colors text-xl leading-none">×</button>
        </div>

        {/* Lista */}
        <div className="divide-y divide-white/4 max-h-[420px] overflow-y-auto">
          {recentAlerts.map(alert => {
            const cfg = riskConfig[alert.riskLevel];
            return (
              <div key={alert.id} className={cn("px-5 py-4 transition-colors", !alert.resolved && cfg.bg)}>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      alert.resolved ? "opacity-25" : ""
                    )} style={{ background: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", cfg.text)}>
                        {cfg.label}
                      </span>
                      {alert.resolved && (
                        <span className="text-[9px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">resuelta</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 leading-snug">{alert.message}</p>
                    <div className="flex gap-2 mt-1 text-[10px] text-slate-600">
                      <span>{alert.location}</span>
                      <span>·</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-24 z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition-all duration-200",
          "bg-[#0d1829] border border-white/10 hover:border-white/20 hover:scale-110",
          open && "border-white/20 scale-95"
        )}
      >
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 text-slate-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
          </svg>
          {active > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
              {active}
            </span>
          )}
        </div>
      </button>
    </>
  );
}
