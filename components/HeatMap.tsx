"use client";

import { useState } from "react";
import { sensorNodes, riskConfig, type SensorNode } from "@/lib/dummy-data";

// Bounding box real de La Malinche / Tlaxcala
const BOUNDS = { minLat: 19.22, maxLat: 19.29, minLng: -98.05, maxLng: -97.98 };
const W = 800, H = 460;

function latLngToXY(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
  const y = H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x, y };
}

const riskHex: Record<string, string> = {
  verde: "#22c55e", amarillo: "#eab308", naranja: "#f97316", rojo: "#ef4444",
};

// Radios del círculo de calor según riesgo
const heatRadius: Record<string, number> = {
  verde: 42, amarillo: 58, naranja: 75, rojo: 95,
};

// Puntos decorativos de topografía (curvas de nivel simplificadas)
const contours = [
  "M 120 380 Q 200 340 310 320 Q 400 305 480 315 Q 560 325 640 300 Q 700 285 760 270",
  "M 80 350 Q 180 300 310 278 Q 410 262 500 270 Q 590 278 670 255 Q 730 238 800 220",
  "M 60 310 Q 170 255 310 228 Q 420 208 510 215 Q 610 222 690 198 Q 750 182 800 165",
  "M 150 420 Q 230 390 340 375 Q 430 362 510 368 Q 590 374 660 355 Q 720 340 780 328",
];

export default function HeatMap() {
  const [selected, setSelected] = useState<SensorNode | null>(null);

  return (
    <div className="relative w-full" style={{ height: 440 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          {/* Heat gradients per node */}
          {sensorNodes.map(node => {
            const color = riskHex[node.riskLevel];
            return (
              <radialGradient key={`g-${node.id}`} id={`heat-${node.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={color} stopOpacity="0.55" />
                <stop offset="40%"  stopColor={color} stopOpacity="0.22" />
                <stop offset="75%"  stopColor={color} stopOpacity="0.07" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            );
          })}

          {/* Composite heat glow */}
          <filter id="blur-heat" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="blur-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="#060c18" />

        {/* Grid subtle */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`gx${i}`} x1={i * (W / 11)} y1={0} x2={i * (W / 11)} y2={H}
            stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`gy${i}`} x1={0} y1={i * (H / 7)} x2={W} y2={i * (H / 7)}
            stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
        ))}

        {/* Topographic contours */}
        {contours.map((d, i) => (
          <path key={i} d={d} fill="none"
            stroke="rgba(99,132,99,0.18)" strokeWidth="1.5"
            strokeDasharray={i % 2 === 0 ? "none" : "6 4"} />
        ))}

        {/* Forest area (La Malinche shape aproximada) */}
        <ellipse cx={390} cy={230} rx={210} ry={130}
          fill="rgba(34,80,34,0.08)" stroke="rgba(34,197,94,0.06)" strokeWidth="1" />

        {/* Heat blobs — blurred layer */}
        <g filter="url(#blur-heat)">
          {sensorNodes.map(node => {
            const { x, y } = latLngToXY(node.lat, node.lng);
            const r = heatRadius[node.riskLevel] * 2.2;
            return (
              <circle key={`blob-${node.id}`} cx={x} cy={y} r={r}
                fill={`url(#heat-${node.id})`} />
            );
          })}
        </g>

        {/* Heat rings — soft layer */}
        <g filter="url(#blur-soft)">
          {sensorNodes.map(node => {
            const { x, y } = latLngToXY(node.lat, node.lng);
            const r = heatRadius[node.riskLevel] * 1.1;
            const color = riskHex[node.riskLevel];
            return (
              <circle key={`ring-${node.id}`} cx={x} cy={y} r={r}
                fill={color} fillOpacity={0.18} />
            );
          })}
        </g>

        {/* Node markers */}
        {sensorNodes.map(node => {
          const { x, y } = latLngToXY(node.lat, node.lng);
          const color = riskHex[node.riskLevel];
          const isSelected = selected?.id === node.id;
          const isCritical = node.riskLevel === "rojo" || node.riskLevel === "naranja";

          return (
            <g key={node.id} onClick={() => setSelected(isSelected ? null : node)}
              style={{ cursor: "pointer" }}>

              {/* Outer pulse ring (CSS animated) */}
              {isCritical && (
                <circle cx={x} cy={y} r={16} fill="none" stroke={color}
                  strokeWidth="1.5" opacity="0.5"
                  style={{ transformOrigin: `${x}px ${y}px`,
                    animation: `pulse-ring ${node.riskLevel === "rojo" ? "1.4s" : "2s"} ease-out infinite` }} />
              )}

              {/* Core dot */}
              <circle cx={x} cy={y} r={9}
                fill={color} stroke="#060c18" strokeWidth="2.5"
                filter="url(#glow)" />

              {/* Inner dot */}
              <circle cx={x} cy={y} r={4} fill="white" opacity="0.9" />

              {/* Probability badge */}
              <g transform={`translate(${x + 13}, ${y - 22})`}>
                <rect x={0} y={0} width={56} height={20} rx={10}
                  fill="rgba(6,12,24,0.92)" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
                <text x={28} y={14} textAnchor="middle"
                  fill={color} fontSize="10" fontWeight="800" fontFamily="system-ui">
                  {node.fireProbability}%
                </text>
              </g>

              {/* Node name label */}
              <g transform={`translate(${x}, ${y + 20})`}>
                <text x={0} y={0} textAnchor="middle"
                  fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="system-ui">
                  {node.name.split(" ").slice(-1)[0]}
                </text>
              </g>
            </g>
          );
        })}

        {/* Legend — bottom left */}
        <g transform="translate(16, 390)">
          <rect x={0} y={-12} width={220} height={42} rx={8}
            fill="rgba(6,12,24,0.85)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          {(["verde","amarillo","naranja","rojo"] as const).map((l, i) => (
            <g key={l} transform={`translate(${i * 54 + 10}, 0)`}>
              <circle cx={5} cy={5} r={5} fill={riskHex[l]} opacity="0.9" />
              <text x={14} y={9} fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="system-ui">
                {l === "verde" ? "Bajo" : l === "amarillo" ? "Mod." : l === "naranja" ? "Alto" : "Crít."}
              </text>
            </g>
          ))}
        </g>

        {/* Compass */}
        <g transform={`translate(${W - 36}, 36)`}>
          <circle cx={0} cy={0} r={18} fill="rgba(6,12,24,0.8)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          <text x={0} y={-6} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontWeight="700" fontFamily="system-ui">N</text>
          <line x1={0} y1={-14} x2={0} y2={-4} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        </g>

        {/* Location label */}
        <text x={W / 2} y={22} textAnchor="middle"
          fill="rgba(255,255,255,0.2)" fontSize="11" fontFamily="system-ui" letterSpacing="3">
          PARQUE NACIONAL LA MALINCHE · TLAXCALA
        </text>
      </svg>

      {/* Popup card (selected node) */}
      {selected && (() => {
        const cfg = riskConfig[selected.riskLevel];
        const color = riskHex[selected.riskLevel];
        return (
          <div className="absolute top-4 left-4 z-10 rounded-2xl border p-4 shadow-2xl"
            style={{ background: "rgba(6,12,24,0.97)", borderColor: color + "44", minWidth: 200 }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
              <p className="text-sm font-bold text-white">{selected.name}</p>
              <button onClick={() => setSelected(null)} className="ml-auto text-slate-600 hover:text-slate-400 text-lg leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <span className="text-slate-500">Prob. incendio</span>
              <span style={{ color }} className="font-black text-base">{selected.fireProbability}%</span>
              <span className="text-slate-500">Temperatura</span>
              <span className="text-orange-400 font-bold">{selected.temperature} °C</span>
              <span className="text-slate-500">Humedad</span>
              <span className="text-sky-400 font-bold">{selected.humidity} %</span>
              <span className="text-slate-500">Humo MQ135</span>
              <span className="text-violet-400 font-bold">{selected.smoke} ppm</span>
              <span className="text-slate-500">Estado</span>
              <span style={{ color }} className="font-bold uppercase text-[10px]">{cfg.label}</span>
            </div>
            <p className="text-[9px] text-slate-700 mt-3 pt-2 border-t border-white/5">
              {selected.lastUpdate} · ESP32 + BME280 + MQ135
            </p>
          </div>
        );
      })()}
    </div>
  );
}
