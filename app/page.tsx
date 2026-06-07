"use client";

import { useState, useEffect } from "react";
import { riskConfig, type SensorReading, type RiskLevel } from "@/lib/dummy-data";
import type { StoredReading } from "@/lib/sensor-store";
import type { WeatherForecast } from "@/app/api/weather/route";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import FloatingAI from "@/components/FloatingAI";
import FloatingAlerts from "@/components/FloatingAlerts";
import PredictionPanel from "@/components/PredictionPanel";

const SensorCharts = dynamic(() => import("@/components/SensorCharts"), { ssr: false });
const ForestMap    = dynamic(() => import("@/components/ForestMap"),    { ssr: false });

// ── Risk helpers ──────────────────────────────────────────────────────────────
function computeRiskLevel(r: StoredReading): RiskLevel {
  const { temperature, smoke, humidity } = r;
  if (temperature > 45 || smoke > 400 || (humidity != null && humidity < 20)) return "rojo";
  if (temperature > 38 || smoke > 200 || (humidity != null && humidity < 30)) return "naranja";
  if (temperature > 32 || smoke > 120 || (humidity != null && humidity < 45)) return "amarillo";
  return "verde";
}

function computeFireProbability(r: StoredReading, rainProbability = 0): number {
  let p = 0;
  p += Math.min(40, Math.max(0, (r.temperature - 20) * 2));
  p += Math.min(30, Math.max(0, (r.smoke - 50) / 10));
  if (r.humidity != null) p += Math.min(30, Math.max(0, (50 - r.humidity) * 0.6));

  // Lluvia pronosticada reduce significativamente el riesgo:
  // 20-40% lluvia → -15%, 40-70% → -30%, >70% → -50%
  if (rainProbability >= 70) p *= 0.50;
  else if (rainProbability >= 40) p *= 0.70;
  else if (rainProbability >= 20) p *= 0.85;

  return Math.min(99, Math.round(p));
}

function toSensorReadings(stored: StoredReading[]): SensorReading[] {
  return [...stored].reverse().map(r => ({
    timestamp: new Date(r.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    temperature: r.temperature,
    humidity: r.humidity ?? 45,
    pressure: r.pressure,
    smoke: r.smoke,
    riskLevel: computeRiskLevel(r),
    location: r.node_id,
  }));
}

function computePrediction(readings: StoredReading[], currentRisk: RiskLevel) {
  if (readings.length < 3) return null;
  const recent = readings.slice(0, Math.min(12, readings.length));
  const newest = recent[0];
  const oldest = recent[recent.length - 1];
  const n = recent.length;
  const tTrend = (newest.temperature - oldest.temperature) / n;
  const hTrend = newest.humidity != null && oldest.humidity != null
    ? (newest.humidity - oldest.humidity) / n : 0;
  const sTrend = (newest.smoke - oldest.smoke) / n;

  return {
    hours: ["+1h", "+2h", "+3h", "+4h"].map((label, i) => {
      const mult = (i + 1) * 12;
      const temperature = Math.round(newest.temperature + tTrend * mult);
      const humidity = Math.round((newest.humidity ?? 45) + hTrend * mult);
      const smoke = Math.max(0, Math.round(newest.smoke + sTrend * mult));
      const riskLevel: RiskLevel =
        temperature > 45 || smoke > 400 || humidity < 20 ? "rojo" :
        temperature > 38 || smoke > 200 || humidity < 30 ? "naranja" :
        temperature > 32 || smoke > 120 || humidity < 45 ? "amarillo" : "verde";
      return { label, temperature, humidity, smoke, riskLevel };
    }),
  };
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function FireIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 23C6.477 23 2 18.523 2 13c0-3.04 1.408-5.93 3.766-7.837C6.452 4.605 7 5.34 7 6.124v.001c0 1.313.752 2.52 1.936 3.073.393.181.864-.067.864-.5V6.25c0-.623.225-1.224.625-1.688C11.262 3.56 13 4.836 13 6.25v4.253a.75.75 0 001.146.637A4.501 4.501 0 0016.5 7c0-.153-.01-.303-.027-.452C18.67 7.9 20 10.33 20 13c0 5.523-4.477 10-8 10z"/>
    </svg>
  );
}
function ThermometerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
    </svg>
  );
}
function DropletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 01-9-9c0-4.97 9-13 9-13s9 8.03 9 13a9 9 0 01-9 9z"/>
    </svg>
  );
}
function WindIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
    </svg>
  );
}
function SmokeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75C7.5 5.821 9 7.5 12 7.5s4.5-1.679 4.5-3.75"/>
    </svg>
  );
}
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
    </svg>
  );
}
function SignalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"/>
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStatus(key: string, v: number): "normal" | "warning" | "critical" {
  if (key === "temperature") return v > 45 ? "critical" : v > 32 ? "warning" : "normal";
  if (key === "humidity")    return v < 20 ? "critical" : v < 35 ? "warning" : "normal";
  if (key === "smoke")       return v > 400 ? "critical" : v > 120 ? "warning" : "normal";
  return "normal";
}
const statusTextColor: Record<string, string> = {
  normal: "text-slate-200", warning: "text-yellow-400", critical: "text-red-400",
};

// ── Sub-components ────────────────────────────────────────────────────────────
function MetricCard({
  title, value, unit, icon, trend, metricKey, subtitle, accentBg, accentBorder,
}: {
  title: string; value: number | null; unit: string; icon: React.ReactNode;
  trend?: number; metricKey: string; subtitle: string;
  accentBg: string; accentBorder: string; accentText: string;
}) {
  const status = value != null ? getStatus(metricKey, value) : "normal";
  return (
    <div className="card p-5 hover:scale-[1.01] transition-transform duration-200 cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", accentBg, accentBorder)}>
          {icon}
        </div>
        {trend !== undefined && value != null && (
          <span className={cn(
            "text-[11px] font-bold px-2 py-0.5 rounded-full",
            trend > 0 ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
          )}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end gap-1">
        {value != null ? (
          <>
            <span className={cn("text-3xl font-black tabular-nums leading-none", statusTextColor[status])}>{value}</span>
            <span className="text-sm text-slate-500 mb-0.5">{unit}</span>
          </>
        ) : (
          <span className="text-xl font-black text-slate-600">—</span>
        )}
      </div>
      <p className="text-[10px] text-slate-600 mt-1.5">{subtitle}</p>
    </div>
  );
}

function RiskBanner({ level, connected }: { level: RiskLevel; connected: boolean }) {
  const cfg = riskConfig[level];
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-6 flex items-center gap-5",
      cfg.bg, cfg.border,
      level === "rojo" && "shadow-[0_0_40px_rgba(239,68,68,0.15)]",
      level === "naranja" && "shadow-[0_0_30px_rgba(249,115,22,0.1)]",
    )}>
      <div className="absolute right-0 top-0 bottom-0 w-48 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at right center, ${cfg.color}15, transparent 70%)` }} />

      <div className="relative flex-shrink-0">
        {(level === "rojo" || level === "naranja") && (
          <>
            <div className={cn("pulse-ring border-2", cfg.border)} style={{ animationDuration: level === "rojo" ? "1.3s" : "1.8s" }} />
            <div className={cn("pulse-ring-slow border", cfg.border)} style={{ opacity: 0.3 }} />
          </>
        )}
        <div className={cn("relative flex h-14 w-14 items-center justify-center rounded-2xl border-2", cfg.bg, cfg.border)}>
          <FireIcon className={cn("h-7 w-7", cfg.text, level === "rojo" && "animate-blink")} />
        </div>
      </div>

      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Estado del Sistema</p>
        <p className={cn("text-2xl font-black", cfg.text)}>{cfg.label}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {connected ? "1 nodo activo · ESP32-N1" : "Sin conexión con sensores"} · La Malinche, Tlaxcala
        </p>
      </div>

      {connected && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-green-500/5 border-green-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-xs font-bold text-green-400">ESP32 conectado</span>
        </div>
      )}
    </div>
  );
}

function WeatherWidget({ weather }: { weather: WeatherForecast | null }) {
  if (!weather) return null;
  const { rainProbability, description, nextRainHours, tempOutdoor } = weather;

  const rainColor =
    rainProbability >= 70 ? "text-blue-400 border-blue-500/30 bg-blue-500/5" :
    rainProbability >= 40 ? "text-sky-400 border-sky-500/30 bg-sky-500/5" :
    rainProbability >= 20 ? "text-slate-300 border-slate-500/20 bg-white/4" :
    "text-slate-500 border-slate-700/30 bg-white/3";

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border px-5 py-3.5", rainColor)}>
      <div className="flex flex-col">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Pronóstico · La Malinche</p>
        <p className="text-sm font-semibold capitalize">{description}</p>
      </div>
      <div className="ml-auto flex items-center gap-4 text-right">
        {tempOutdoor != null && (
          <div>
            <p className="text-[9px] text-slate-600">Temp. exterior</p>
            <p className="text-sm font-black text-orange-400">{tempOutdoor.toFixed(1)} °C</p>
          </div>
        )}
        <div>
          <p className="text-[9px] text-slate-600">Prob. lluvia</p>
          <p className="text-lg font-black">{rainProbability}%</p>
        </div>
        {nextRainHours != null && nextRainHours <= 9 && (
          <div>
            <p className="text-[9px] text-slate-600">Lluvia en</p>
            <p className="text-sm font-black text-blue-400">~{nextRainHours}h</p>
          </div>
        )}
        {rainProbability >= 20 && (
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-2 py-1 text-[10px] text-blue-400 font-semibold whitespace-nowrap">
            ↓ riesgo reducido
          </div>
        )}
      </div>
    </div>
  );
}

function WaitingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-slate-700 animate-pulse" />
        <div className="absolute inset-2 rounded-full border-2 border-slate-600 animate-pulse" style={{ animationDelay: "0.3s" }} />
        <div className="flex h-full items-center justify-center">
          <SignalIcon className="h-6 w-6 text-slate-500" />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-400">Esperando datos del sensor</p>
        <p className="text-xs text-slate-600 mt-1">ESP32-N1 · BMP280 + MQ135 · actualizando cada 5 s</p>
      </div>
    </div>
  );
}

function LiveNodeCard({ reading, riskLevel, fireProbability }: {
  reading: StoredReading;
  riskLevel: RiskLevel;
  fireProbability: number;
}) {
  const cfg = riskConfig[riskLevel];
  const ts = new Date(reading.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
        <MapPinIcon className="h-4 w-4 text-slate-500" />
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Nodo Activo</h3>
        <span className="ml-auto text-[10px] text-slate-600">1 sensor</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="h-3 w-3 rounded-full" style={{ background: cfg.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-300">ESP32-N1 · La Malinche</p>
              <span className={cn("text-[11px] font-black ml-2", cfg.text)}>{fireProbability}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${fireProbability}%`, background: cfg.color, opacity: 0.8 }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="rounded-xl bg-orange-500/5 border border-orange-500/10 px-3 py-2">
            <p className="text-[9px] text-slate-600 mb-0.5">Temperatura</p>
            <p className="text-sm font-black text-orange-400">{reading.temperature} °C</p>
          </div>
          <div className="rounded-xl bg-sky-500/5 border border-sky-500/10 px-3 py-2">
            <p className="text-[9px] text-slate-600 mb-0.5">Humedad</p>
            <p className="text-sm font-black text-sky-400">{reading.humidity != null ? `${reading.humidity} %` : "—"}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-3 py-2">
            <p className="text-[9px] text-slate-600 mb-0.5">Presión</p>
            <p className="text-sm font-black text-emerald-400">{reading.pressure} hPa</p>
          </div>
          <div className="rounded-xl bg-violet-500/5 border border-violet-500/10 px-3 py-2">
            <p className="text-[9px] text-slate-600 mb-0.5">Humo</p>
            <p className="text-sm font-black text-violet-400">{reading.smoke} ppm</p>
          </div>
        </div>

        <p className="text-[9px] text-slate-600 text-center mt-1">Última lectura: {ts}</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [connected, setConnected] = useState(false);
  const [liveReading, setLiveReading] = useState<StoredReading | null>(null);
  const [chartData, setChartData] = useState<SensorReading[]>([]);
  const [history, setHistory] = useState<StoredReading[]>([]);
  const [time, setTime] = useState("");
  const [weather, setWeather] = useState<WeatherForecast | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [latestRes, historyRes] = await Promise.all([
          fetch("/api/sensor-data"),
          fetch("/api/sensor-data?mode=history&n=60"),
        ]);
        const latest = await latestRes.json();
        const hist = await historyRes.json();
        setConnected(latest.connected ?? false);
        setLiveReading(latest.reading ?? null);
        const readings: StoredReading[] = hist.readings ?? [];
        setHistory(readings);
        setChartData(toSensorReadings(readings));
      } catch {
        // network error — keep last known state
      }
    }

    async function fetchWeather() {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) setWeather(await res.json());
      } catch {
        // sin clave o sin red — ignorar
      }
    }

    fetchData();
    fetchWeather();
    const iv = setInterval(fetchData, 5000);
    const ivW = setInterval(fetchWeather, 10 * 60 * 1000); // cada 10 min
    return () => { clearInterval(iv); clearInterval(ivW); };
  }, []);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString("es-MX"));
    const iv = setInterval(() => setTime(new Date().toLocaleTimeString("es-MX")), 1000);
    return () => clearInterval(iv);
  }, []);

  const riskLevel: RiskLevel = liveReading ? computeRiskLevel(liveReading) : "verde";
  const rainProbability = weather?.rainProbability ?? 0;
  const fireProbability = liveReading ? computeFireProbability(liveReading, rainProbability) : 0;
  const prediction = liveReading ? computePrediction(history, riskLevel) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#060c18]">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060c18]/95 backdrop-blur-xl">
        <div className="max-w-[1700px] mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 flex items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20">
              <FireIcon className="h-4 w-4 text-orange-400" />
            </div>
            <div className="leading-none">
              <p className="text-xs font-black tracking-[0.2em] text-white">TLENEXT</p>
              <p className="text-[9px] text-slate-600 mt-0.5">Sistema de Alerta Forestal · IoT + IA</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/6 text-xs text-slate-400">
              <span className="relative flex h-1.5 w-1.5">
                {connected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-600" />
                )}
              </span>
              {connected ? `En vivo · ${time}` : `Sin señal · ${time}`}
            </div>
            <div className="text-[10px] text-slate-700">CECyTE 29 Tocatlán · ExpoCiencias Tlaxcala 2026</div>
          </div>

          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold",
            riskConfig[riskLevel].bg, riskConfig[riskLevel].border, riskConfig[riskLevel].text
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", riskLevel === "rojo" && "animate-blink")}
              style={{ background: riskConfig[riskLevel].color }} />
            {riskConfig[riskLevel].label}
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[1700px] mx-auto w-full px-4 md:px-5 py-5 space-y-5">

        <RiskBanner level={riskLevel} connected={connected} />
        <WeatherWidget weather={weather} />

        {/* Metric cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Temperatura" value={liveReading?.temperature ?? null} unit="°C"
            metricKey="temperature" subtitle="BMP280 · ESP32-N1"
            accentBg="bg-orange-500/10" accentBorder="border-orange-500/20" accentText="text-orange-400"
            icon={<ThermometerIcon className="h-5 w-5 text-orange-400" />} />
          <MetricCard title="Humedad" value={liveReading?.humidity ?? null} unit="%"
            metricKey="humidity" subtitle="BME280 · ESP32-N1"
            accentBg="bg-sky-500/10" accentBorder="border-sky-500/20" accentText="text-sky-400"
            icon={<DropletIcon className="h-5 w-5 text-sky-400" />} />
          <MetricCard title="Presión Atm." value={liveReading?.pressure ?? null} unit="hPa"
            metricKey="pressure" subtitle="BMP280 · ESP32-N1"
            accentBg="bg-emerald-500/10" accentBorder="border-emerald-500/20" accentText="text-emerald-400"
            icon={<WindIcon className="h-5 w-5 text-emerald-400" />} />
          <MetricCard title="Índice de Humo" value={liveReading?.smoke ?? null} unit="ppm"
            metricKey="smoke" subtitle="MQ135 · ESP32-N1"
            accentBg="bg-violet-500/10" accentBorder="border-violet-500/20" accentText="text-violet-400"
            icon={<SmokeIcon className="h-5 w-5 text-violet-400" />} />
        </div>

        {/* Map + sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">

          <div className="flex flex-col gap-5">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-slate-500" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Mapa de Riesgo · Tlaxcala
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <span className="relative flex h-1.5 w-1.5">
                    {connected
                      ? <><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" /></>
                      : <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-600" />
                    }
                  </span>
                  {connected ? "ESP32-N1 activo" : "Esperando sensor..."}
                </div>
              </div>
              <div style={{ height: 580 }}>
                <ForestMap
                  connected={connected}
                  riskLevel={riskLevel}
                  fireProbability={fireProbability}
                  temperature={liveReading?.temperature ?? 0}
                  humidity={liveReading?.humidity ?? null}
                  smoke={liveReading?.smoke ?? 0}
                />
              </div>
            </div>

            {prediction && (
              <PredictionPanel hours={prediction.hours} currentRisk={riskLevel} />
            )}

            <div className="card p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Histórico de Sensores · Últimas lecturas
              </h3>
              {chartData.length > 0
                ? <SensorCharts data={chartData} />
                : <WaitingOverlay />
              }
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {liveReading ? (
              <LiveNodeCard reading={liveReading} riskLevel={riskLevel} fireProbability={fireProbability} />
            ) : (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPinIcon className="h-4 w-4 text-slate-500" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Nodo Activo</h3>
                </div>
                <WaitingOverlay />
              </div>
            )}
          </div>
        </div>

        <FloatingAlerts />
        <FloatingAI
          temperature={liveReading?.temperature ?? null}
          humidity={liveReading?.humidity ?? null}
          pressure={liveReading?.pressure ?? null}
          smoke={liveReading?.smoke ?? null}
          connected={connected}
          rainProbability={weather?.rainProbability}
          weatherDescription={weather?.description}
          nextRainHours={weather?.nextRainHours}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 py-3 border-t border-white/4">
          <p className="text-[10px] text-slate-700">
            TLENEXT · CECyTE 29 Tocatlán · ExpoCiencias Tlaxcala 2026 · Tutor: Geovani Daniel Nolasco
          </p>
          <p className="text-[10px] text-slate-700">ESP32 · BMP280 · MQ135 · WiFi · Solar · IA</p>
        </div>
      </main>
    </div>
  );
}
