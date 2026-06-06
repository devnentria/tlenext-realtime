"use client";

import { riskConfig, type RiskLevel } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface PredictionHour {
  label: string;
  temperature: number;
  humidity: number;
  smoke: number;
  riskLevel: RiskLevel;
}

interface Props {
  hours: PredictionHour[];
  currentRisk: RiskLevel;
}

const riskOrder = { verde: 0, amarillo: 1, naranja: 2, rojo: 3 };

export default function PredictionPanel({ hours, currentRisk }: Props) {
  const trend = riskOrder[hours[hours.length - 1].riskLevel] - riskOrder[currentRisk];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-indigo-400">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Predicción · Próximas 4 horas</h3>
        </div>

        {/* Tendencia general */}
        <div className={cn(
          "flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border",
          trend > 0  ? "bg-red-500/10 border-red-500/20 text-red-400" :
          trend < 0  ? "bg-green-500/10 border-green-500/20 text-green-400" :
                       "bg-slate-500/10 border-slate-500/20 text-slate-400"
        )}>
          {trend > 0 ? "↑ Riesgo en aumento" : trend < 0 ? "↓ Riesgo disminuye" : "→ Estable"}
        </div>
      </div>

      <div className="grid grid-cols-4 divide-x divide-white/5">
        {hours.map((h, i) => {
          const cfg = riskConfig[h.riskLevel];
          const prev = i === 0 ? currentRisk : hours[i - 1].riskLevel;
          const change = riskOrder[h.riskLevel] - riskOrder[prev];

          return (
            <div key={h.label} className={cn("px-4 py-4 flex flex-col gap-3", i === 0 && cfg.bg)}>
              {/* Label hora */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h.label}</span>
                {change !== 0 && (
                  <span className={cn("text-[10px]", change > 0 ? "text-red-400" : "text-green-400")}>
                    {change > 0 ? "▲" : "▼"}
                  </span>
                )}
              </div>

              {/* Nivel de riesgo */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                  <span className={cn("text-[10px] font-bold", cfg.text)}>{cfg.label}</span>
                </div>
                {/* Barra de riesgo */}
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(riskOrder[h.riskLevel] + 1) * 25}%`, background: cfg.color, opacity: 0.8 }} />
                </div>
              </div>

              {/* Mini métricas */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">Temp</span>
                  <span className={cn("font-semibold",
                    h.temperature > 38 ? "text-red-400" : h.temperature > 32 ? "text-orange-400" : "text-slate-400"
                  )}>{h.temperature}°C</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">Hum</span>
                  <span className={cn("font-semibold",
                    h.humidity < 20 ? "text-red-400" : h.humidity < 35 ? "text-yellow-400" : "text-slate-400"
                  )}>{h.humidity}%</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">Humo</span>
                  <span className={cn("font-semibold",
                    h.smoke > 400 ? "text-red-400" : h.smoke > 250 ? "text-orange-400" : "text-slate-400"
                  )}>{h.smoke}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-2.5 border-t border-white/5 bg-white/2">
        <p className="text-[10px] text-slate-600">
          Predicción basada en tendencia de las últimas 60 min · Modelo TLENEXT v1 · Actualización cada 5 min
        </p>
      </div>
    </div>
  );
}
