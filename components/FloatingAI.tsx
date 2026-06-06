"use client";

import { useState } from "react";
import { currentReadings } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface AIResponse {
  analysis: string;
  risk_level: string;
  recommendations: string[];
  prediction: string;
}

const riskColors: Record<string, string> = {
  verde: "text-green-400", amarillo: "text-yellow-400",
  naranja: "text-orange-400", rojo: "text-red-400",
};

export default function FloatingAI() {
  const [open, setOpen]     = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: currentReadings.temperature,
          humidity:    currentReadings.humidity,
          pressure:    currentReadings.pressure,
          smoke:       currentReadings.smoke,
          location:    currentReadings.location,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al conectar con la IA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div className={cn(
        "fixed bottom-0 right-0 z-50 flex flex-col transition-all duration-300 ease-out",
        "w-full sm:w-[420px] rounded-t-2xl sm:rounded-tl-2xl sm:rounded-tr-none sm:bottom-6 sm:right-6 sm:rounded-2xl",
        "bg-[#0d1829] border border-white/8 shadow-2xl",
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )} style={{ maxHeight: "80vh" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-violet-400">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Asistente Predictivo</p>
            <p className="text-[10px] text-slate-500">Análisis de condiciones en tiempo real</p>
          </div>
          <button onClick={() => setOpen(false)}
            className="text-slate-600 hover:text-slate-300 transition-colors text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Current readings snapshot */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Temperatura", value: `${currentReadings.temperature} °C`, color: "text-orange-400" },
              { label: "Humedad",     value: `${currentReadings.humidity} %`,     color: "text-sky-400"    },
              { label: "Presión",     value: `${currentReadings.pressure} hPa`,   color: "text-emerald-400"},
              { label: "Humo",        value: `${currentReadings.smoke} ppm`,      color: "text-violet-400" },
            ].map(m => (
              <div key={m.label} className="rounded-xl bg-white/4 px-3 py-2">
                <p className="text-[10px] text-slate-500">{m.label}</p>
                <p className={cn("text-sm font-bold", m.color)}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Analyze button */}
          {!result && (
            <button onClick={analyze} disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                loading
                  ? "bg-violet-500/10 text-violet-400 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
              )}>
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analizando condiciones...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                  Analizar ahora
                </>
              )}
            </button>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-up">
              <div className="rounded-xl bg-white/4 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Evaluación</p>
                <p className={cn("text-2xl font-black capitalize", riskColors[result.risk_level] ?? "text-slate-300")}>
                  Nivel {result.risk_level}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Análisis</p>
                <p className="text-sm text-slate-300 leading-relaxed">{result.analysis}</p>
              </div>
              <div className="rounded-xl bg-violet-500/8 border border-violet-500/15 p-4">
                <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider mb-1">Predicción</p>
                <p className="text-sm text-slate-300 leading-relaxed">{result.prediction}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Recomendaciones</p>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setResult(null)}
                className="w-full py-2 rounded-xl border border-white/8 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Nuevo análisis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition-all duration-200",
          "bg-violet-600 hover:bg-violet-500 hover:scale-110",
          "shadow-violet-500/30",
          open && "rotate-90 scale-95"
        )}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
        </svg>
      </button>
    </>
  );
}
