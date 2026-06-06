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

export default function AIAnalysis() {
  const [result, setResult] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: currentReadings.temperature,
          humidity: currentReadings.humidity,
          pressure: currentReadings.pressure,
          smoke: currentReadings.smoke,
          location: currentReadings.location,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al conectar con la IA");
    } finally {
      setLoading(false);
    }
  }

  const riskColors: Record<string, string> = {
    verde: "text-green-400",
    amarillo: "text-yellow-400",
    naranja: "text-orange-400",
    rojo: "text-red-400",
  };

  return (
    <div className="rounded-2xl bg-[#0d1526] border border-white/6 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-violet-400">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zM9 7a1 1 0 112 0v4a1 1 0 01-1 1H8a1 1 0 010-2h1V7zm1 7a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Análisis Predictivo con IA</h3>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            loading
              ? "bg-violet-500/10 text-violet-400 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
          )}
        >
          {loading ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analizando...
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Analizar ahora
            </>
          )}
        </button>
      </div>

      <div className="p-5">
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7 text-violet-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400 font-medium">Listo para analizar</p>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              La IA evaluará las condiciones actuales del sensor y generará predicciones de riesgo de incendio
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-fade-in">
            {/* Risk level */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Evaluación IA</p>
                <p className={cn("text-xl font-black capitalize", riskColors[result.risk_level] ?? "text-slate-300")}>
                  Nivel {result.risk_level}
                </p>
              </div>
            </div>

            {/* Analysis */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Análisis</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.analysis}</p>
            </div>

            {/* Prediction */}
            <div className="rounded-xl bg-violet-500/8 border border-violet-500/15 p-4">
              <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider mb-1">Predicción</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.prediction}</p>
            </div>

            {/* Recommendations */}
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
          </div>
        )}
      </div>
    </div>
  );
}
