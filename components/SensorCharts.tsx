"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { SensorReading } from "@/lib/dummy-data";

interface Props {
  data: SensorReading[];
}

const tooltipStyle = {
  backgroundColor: "#0d1526",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#e2e8f0",
  fontSize: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#0d1526] border border-white/6 p-5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

function tickStyle() {
  return { fill: "#475569", fontSize: 10 };
}

// Only show every 10th tick label
function formatTick(value: string, index: number) {
  return index % 10 === 0 ? value : "";
}

export default function SensorCharts({ data }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Temperature */}
      <ChartCard title="Temperatura (°C)">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="timestamp" tick={tickStyle()} tickFormatter={formatTick} />
            <YAxis domain={["auto", "auto"]} tick={tickStyle()} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} °C`, "Temperatura"]} />
            <ReferenceLine y={38} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.4} />
            <ReferenceLine y={32} stroke="#eab308" strokeDasharray="4 2" strokeOpacity={0.3} />
            <Area type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} fill="url(#tempGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Humidity */}
      <ChartCard title="Humedad Relativa (%)">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="timestamp" tick={tickStyle()} tickFormatter={formatTick} />
            <YAxis domain={[0, 100]} tick={tickStyle()} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} %`, "Humedad"]} />
            <ReferenceLine y={35} stroke="#eab308" strokeDasharray="4 2" strokeOpacity={0.3} />
            <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.4} />
            <Area type="monotone" dataKey="humidity" stroke="#38bdf8" strokeWidth={2} fill="url(#humGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Smoke */}
      <ChartCard title="Índice de Humo / Gases (ppm)">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="smokeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="timestamp" tick={tickStyle()} tickFormatter={formatTick} />
            <YAxis domain={["auto", "auto"]} tick={tickStyle()} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} ppm`, "Humo"]} />
            <ReferenceLine y={250} stroke="#f97316" strokeDasharray="4 2" strokeOpacity={0.4} />
            <ReferenceLine y={400} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
            <Area type="monotone" dataKey="smoke" stroke="#a78bfa" strokeWidth={2} fill="url(#smokeGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pressure */}
      <ChartCard title="Presión Atmosférica (hPa)">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="timestamp" tick={tickStyle()} tickFormatter={formatTick} />
            <YAxis domain={["auto", "auto"]} tick={tickStyle()} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} hPa`, "Presión"]} />
            <Area type="monotone" dataKey="pressure" stroke="#34d399" strokeWidth={2} fill="url(#pressGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
