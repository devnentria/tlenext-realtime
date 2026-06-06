"use client";

import { riskConfig, type RiskLevel } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface Props {
  riskLevel: RiskLevel;
  temperature: number;
  humidity: number;
  smoke: number;
}

const levels: RiskLevel[] = ["verde", "amarillo", "naranja", "rojo"];

export default function RiskGauge({ riskLevel, temperature, humidity, smoke }: Props) {
  const cfg = riskConfig[riskLevel];
  const levelIndex = levels.indexOf(riskLevel);
  const percentage = ((levelIndex + 1) / 4) * 100;

  return (
    <div className="rounded-2xl bg-[#0d1526] border border-white/6 p-5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Nivel de Riesgo General</h3>

      {/* Central indicator */}
      <div className="flex flex-col items-center mb-6">
        <div className={cn(
          "relative flex h-28 w-28 items-center justify-center rounded-full border-4",
          cfg.border,
          riskLevel === "rojo" ? "shadow-[0_0_30px_rgba(239,68,68,0.3)]" :
          riskLevel === "naranja" ? "shadow-[0_0_30px_rgba(249,115,22,0.25)]" :
          riskLevel === "amarillo" ? "shadow-[0_0_20px_rgba(234,179,8,0.2)]" :
          "shadow-[0_0_20px_rgba(34,197,94,0.15)]"
        )}>
          <div className="text-center">
            <p className={cn("text-3xl font-black", cfg.text)}>{levelIndex + 1}</p>
            <p className={cn("text-[9px] font-bold uppercase tracking-widest", cfg.text)}>de 4</p>
          </div>
          {riskLevel === "rojo" && (
            <div className={cn("absolute inset-0 rounded-full border-4 pulse-ring", cfg.border)} />
          )}
        </div>
        <p className={cn("mt-3 text-base font-bold", cfg.text)}>{cfg.label}</p>
        <p className="text-xs text-slate-500 mt-0.5">Condición ambiental actual</p>
      </div>

      {/* Level bar */}
      <div className="flex gap-1 mb-5">
        {levels.map((l, i) => {
          const c = riskConfig[l];
          return (
            <div
              key={l}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-500",
                i <= levelIndex ? c.bg.replace("/15", "/80") : "bg-white/5"
              )}
              style={i <= levelIndex ? { backgroundColor: c.color + "99" } : {}}
            />
          );
        })}
      </div>

      {/* Mini metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/4 p-3 text-center">
          <p className="text-[10px] text-slate-500 mb-1">Temp</p>
          <p className={cn("text-lg font-bold", temperature > 38 ? "text-red-400" : temperature > 32 ? "text-orange-400" : "text-slate-300")}>
            {temperature}°
          </p>
        </div>
        <div className="rounded-xl bg-white/4 p-3 text-center">
          <p className="text-[10px] text-slate-500 mb-1">Hum</p>
          <p className={cn("text-lg font-bold", humidity < 20 ? "text-red-400" : humidity < 35 ? "text-yellow-400" : "text-slate-300")}>
            {humidity}%
          </p>
        </div>
        <div className="rounded-xl bg-white/4 p-3 text-center">
          <p className="text-[10px] text-slate-500 mb-1">Humo</p>
          <p className={cn("text-lg font-bold", smoke > 400 ? "text-red-400" : smoke > 250 ? "text-orange-400" : smoke > 120 ? "text-yellow-400" : "text-slate-300")}>
            {smoke}
          </p>
        </div>
      </div>
    </div>
  );
}
