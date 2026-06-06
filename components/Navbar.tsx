"use client";

import { riskConfig, type RiskLevel } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface NavbarProps {
  riskLevel: RiskLevel;
  lastUpdate: string;
}

export default function Navbar({ riskLevel, lastUpdate }: NavbarProps) {
  const risk = riskConfig[riskLevel];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080e1a]/90 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-orange-400" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold tracking-widest text-white">TLENEXT</p>
            <p className="text-[10px] text-slate-500 leading-none">Monitor Forestal · La Malinche</p>
          </div>
        </div>

        {/* Center — live indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
          </span>
          <span className="text-xs text-slate-400">Transmisión en vivo</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-500">Actualizado {lastUpdate}</span>
        </div>

        {/* Risk badge */}
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border", risk.bg, risk.border)}>
          <span className={cn("relative flex h-2 w-2", riskLevel === "rojo" && "blink")}>
            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 pulse-ring", risk.text === "text-red-400" ? "bg-red-400" : risk.text === "text-orange-400" ? "bg-orange-400" : risk.text === "text-yellow-400" ? "bg-yellow-400" : "bg-green-400")}></span>
            <span className={cn("relative inline-flex rounded-full h-2 w-2", riskLevel === "rojo" ? "bg-red-400" : riskLevel === "naranja" ? "bg-orange-400" : riskLevel === "amarillo" ? "bg-yellow-400" : "bg-green-400")}></span>
          </span>
          <span className={cn("text-xs font-semibold", risk.text)}>{risk.label}</span>
        </div>
      </div>
    </header>
  );
}
