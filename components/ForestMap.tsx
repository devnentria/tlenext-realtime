"use client";

import { useEffect, useRef, useState } from "react";

const riskHex: Record<string, string> = {
  verde: "#22c55e", amarillo: "#eab308", naranja: "#f97316", rojo: "#ef4444",
};
const heatRadius: Record<string, number> = {
  verde: 3000, amarillo: 4500, naranja: 6500, rojo: 9000,
};
const dotRadius: Record<string, number> = {
  verde: 8, amarillo: 10, naranja: 12, rojo: 14,
};

// Coordenadas ESP32-N1: La Malinche, Tlaxcala
const NODE_LAT = 19.2799;
const NODE_LNG = -98.2803;
const NODE_NAME = "ESP32-N1 · La Malinche";

interface Props {
  connected: boolean;
  riskLevel: string;
  fireProbability: number;
  temperature: number;
  humidity: number | null;
  smoke: number;
}

export default function ForestMap({ connected, riskLevel, fireProbability, temperature, humidity, smoke }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lRef = useRef<typeof import("leaflet") | null>(null);
  const layerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Init map once
  useEffect(() => {
    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const tlaxcalaBounds = L.latLngBounds(
        L.latLng(19.05, -98.78),
        L.latLng(19.75, -97.62),
      );

      map = L.map(containerRef.current, {
        center: [19.38, -98.18],
        zoom: 11,
        minZoom: 10,
        maxZoom: 15,
        maxBounds: tlaxcalaBounds,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { attribution: '&copy; <a href="https://carto.com/">CARTO</a>', subdomains: "abcd", maxZoom: 19 }
      ).addTo(map);

      lRef.current = L;
      layerGroupRef.current = L.layerGroup().addTo(map);
      if (!cancelled) setMapReady(true);
    })();

    return () => {
      cancelled = true;
      lRef.current = null;
      layerGroupRef.current = null;
      if (map) { map.remove(); map = null; }
    };
  }, []);

  // Update node marker whenever data changes
  useEffect(() => {
    const L = lRef.current;
    const lg = layerGroupRef.current;
    if (!L || !lg || !mapReady) return;

    lg.clearLayers();

    if (!connected) return;

    const color = riskHex[riskLevel] ?? "#94a3b8";
    const radius = heatRadius[riskLevel] ?? 4500;
    const dRadius = dotRadius[riskLevel] ?? 10;

    // Outer heat aura
    L.circle([NODE_LAT, NODE_LNG], {
      radius: radius * 1.8,
      color: "transparent", fillColor: color, fillOpacity: 0.04, interactive: false,
    }).addTo(lg);

    // Inner glow
    L.circle([NODE_LAT, NODE_LNG], {
      radius,
      color, fillColor: color, fillOpacity: 0.14, weight: 1, opacity: 0.25, interactive: false,
    }).addTo(lg);

    // Pulse rings for high-risk
    const needsPulse = riskLevel === "rojo" || riskLevel === "naranja";
    const pSize = needsPulse ? (riskLevel === "rojo" ? 56 : 44) : 32;
    L.marker([NODE_LAT, NODE_LNG], {
      icon: L.divIcon({
        className: "",
        html: needsPulse
          ? `<div style="position:relative;width:${pSize}px;height:${pSize}px;">
               <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${color};
                 animation:pulse-ring ${riskLevel === "rojo" ? "1.4s" : "2s"} ease-out infinite;"></div>
               <div style="position:absolute;inset:6px;border-radius:50%;border:1px solid ${color};opacity:0.4;
                 animation:pulse-ring ${riskLevel === "rojo" ? "1.4s" : "2s"} ease-out infinite 0.5s;"></div>
             </div>`
          : `<div style="width:${pSize}px;height:${pSize}px;"></div>`,
        iconSize: [pSize, pSize], iconAnchor: [pSize / 2, pSize / 2],
      }),
      interactive: false,
    }).addTo(lg);

    // Core dot
    const dot = L.circleMarker([NODE_LAT, NODE_LNG], {
      radius: dRadius,
      color: "#060c18", fillColor: color, fillOpacity: 1, weight: 2.5,
    }).addTo(lg);

    // Probability badge
    L.marker([NODE_LAT, NODE_LNG], {
      icon: L.divIcon({
        className: "",
        html: `<div style="
          background:rgba(6,12,24,0.92);border:1px solid ${color}55;border-radius:20px;
          padding:2px 8px;font-family:system-ui,sans-serif;font-size:10px;font-weight:800;
          color:${color};white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,0.5);
        ">${fireProbability}%</div>`,
        iconSize: [52, 22], iconAnchor: [-10, 28],
      }),
      interactive: false,
    }).addTo(lg);

    // Popup
    const humStr = humidity != null ? `${humidity} %` : "—";
    dot.bindPopup(
      `<div style="padding:14px 16px;min-width:200px;font-family:system-ui,sans-serif;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <div style="width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 10px ${color};flex-shrink:0;"></div>
          <p style="margin:0;font-size:13px;font-weight:800;color:#f1f5f9;">${NODE_NAME}</p>
        </div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:5px 14px;font-size:11px;">
          <span style="color:#475569;">Prob. incendio</span>
          <span style="color:${color};font-weight:900;font-size:15px;">${fireProbability}%</span>
          <span style="color:#475569;">Temperatura</span>
          <span style="color:#f97316;font-weight:700;">${temperature} °C</span>
          <span style="color:#475569;">Humedad</span>
          <span style="color:#38bdf8;font-weight:700;">${humStr}</span>
          <span style="color:#475569;">Humo MQ135</span>
          <span style="color:#a78bfa;font-weight:700;">${smoke} ppm</span>
        </div>
        <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);font-size:9px;color:#334155;">
          En vivo · ESP32 + BMP280 + MQ135
        </div>
      </div>`,
      { className: "node-popup", maxWidth: 260 }
    );
  }, [mapReady, connected, riskLevel, fireProbability, temperature, humidity, smoke]);

  return <div ref={containerRef} style={{ width: "100%", height: "580px" }} />;
}
