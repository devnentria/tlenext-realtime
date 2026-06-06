import { subMinutes, format } from "date-fns";

export type RiskLevel = "verde" | "amarillo" | "naranja" | "rojo";

export interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  smoke: number;
  riskLevel: RiskLevel;
  location: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  riskLevel: RiskLevel;
  message: string;
  location: string;
  resolved: boolean;
}

export interface SensorNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  lastUpdate: string;
  temperature: number;
  humidity: number;
  smoke: number;
  fireProbability: number; // 0-100%
}

export function getRiskLevel(temp: number, humidity: number, smoke: number): RiskLevel {
  if (smoke > 400 || temp > 45) return "rojo";
  if (smoke > 250 || temp > 38 || humidity < 20) return "naranja";
  if (smoke > 120 || temp > 32 || humidity < 35) return "amarillo";
  return "verde";
}

export function generateHistoricalData(): SensorReading[] {
  const now = new Date();
  const readings: SensorReading[] = [];

  // Hora actual en decimal (ej. 14.5 = 2:30 pm)
  const currentHour = now.getHours() + now.getMinutes() / 60;

  for (let i = 59; i >= 0; i--) {
    const ts = subMinutes(now, i * 5);
    const hour = ts.getHours() + ts.getMinutes() / 60;

    // Curva de temperatura realista: mínimo ~6am, máximo ~14-15h
    const tempBase = 22 + 14 * Math.sin(((hour - 6) / 24) * Math.PI * 1.3);

    // Eventos: pico de humo entre hace 45-30 min (simula un conato detectado)
    const esEvento = i >= 6 && i <= 9;
    const smokeEvento = esEvento ? 180 + Math.random() * 120 : 0;

    const temp     = parseFloat((tempBase + (Math.random() - 0.5) * 1.2).toFixed(1));
    // Humedad inversamente proporcional a temp + ruido
    const humidity = parseFloat(Math.max(15, Math.min(85,
      78 - (temp - 18) * 1.6 + (Math.random() - 0.5) * 4
    )).toFixed(1));
    const pressure = parseFloat((1008 + (Math.random() - 0.5) * 3).toFixed(1));
    const smoke    = Math.round(Math.max(30,
      60 + (temp - 22) * 3.5 + smokeEvento + (Math.random() - 0.4) * 18
    ));

    readings.push({
      timestamp: format(ts, "HH:mm"),
      temperature: temp,
      humidity,
      pressure,
      smoke,
      riskLevel: getRiskLevel(temp, humidity, smoke),
      location: "Nodo 1 - La Malinche Norte",
    });
  }
  return readings;
}

// Genera predicción simple para las próximas N horas basada en tendencia
export function generatePrediction(history: SensorReading[]): {
  hours: { label: string; temperature: number; humidity: number; smoke: number; riskLevel: RiskLevel }[]
} {
  const last = history.slice(-12); // últimos 60 min
  const first = last[0];
  const latest = last[last.length - 1];

  // Tendencia por minuto
  const dTemp  = (latest.temperature - first.temperature) / last.length;
  const dHum   = (latest.humidity    - first.humidity)    / last.length;
  const dSmoke = (latest.smoke       - first.smoke)       / last.length;

  const hours = [1, 2, 3, 4].map(h => {
    const steps = h * 12; // cada 5 min
    const temp  = parseFloat(Math.min(50, Math.max(15, latest.temperature + dTemp * steps)).toFixed(1));
    const hum   = parseFloat(Math.min(95, Math.max(10, latest.humidity    + dHum   * steps)).toFixed(1));
    const smoke = Math.round(Math.min(500, Math.max(20, latest.smoke      + dSmoke * steps)));
    return {
      label: `+${h}h`,
      temperature: temp,
      humidity: hum,
      smoke,
      riskLevel: getRiskLevel(temp, hum, smoke),
    };
  });

  return { hours };
}

export const currentReadings: SensorReading = {
  timestamp: "—",
  temperature: 34.2,
  humidity: 28.5,
  pressure: 1008.3,
  smoke: 187,
  riskLevel: "naranja",
  location: "Nodo 1 - La Malinche Norte",
};

export const sensorNodes: SensorNode[] = [
  // ── La Malinche ─────────────────────────────────────
  { id: "N1",  name: "La Malinche Norte",      lat: 19.265, lng: -98.014, riskLevel: "naranja", lastUpdate: "hace 1 min",  temperature: 34.2, humidity: 28.5, smoke: 187, fireProbability: 62 },
  { id: "N2",  name: "La Malinche Sur",         lat: 19.235, lng: -98.018, riskLevel: "amarillo",lastUpdate: "hace 2 min",  temperature: 31.8, humidity: 33.1, smoke: 134, fireProbability: 38 },
  { id: "N3",  name: "La Malinche Este",        lat: 19.252, lng: -97.998, riskLevel: "verde",   lastUpdate: "hace 1 min",  temperature: 26.4, humidity: 58.2, smoke: 62,  fireProbability: 12 },
  { id: "N4",  name: "La Malinche Oeste",       lat: 19.248, lng: -98.034, riskLevel: "rojo",    lastUpdate: "hace 3 min",  temperature: 42.1, humidity: 18.7, smoke: 380, fireProbability: 88 },
  { id: "N5",  name: "Cumbres La Malinche",     lat: 19.258, lng: -98.016, riskLevel: "amarillo",lastUpdate: "hace 2 min",  temperature: 30.5, humidity: 36.8, smoke: 145, fireProbability: 41 },
  // ── Tlaxcala ciudad y centro ─────────────────────────
  { id: "N6",  name: "Tlaxcala Centro",         lat: 19.318, lng: -98.238, riskLevel: "verde",   lastUpdate: "hace 2 min",  temperature: 24.1, humidity: 61.3, smoke: 45,  fireProbability: 9  },
  { id: "N7",  name: "Tetlanohcan",             lat: 19.290, lng: -98.190, riskLevel: "amarillo",lastUpdate: "hace 4 min",  temperature: 29.8, humidity: 34.2, smoke: 128, fireProbability: 35 },
  { id: "N8",  name: "Chiautempan",             lat: 19.312, lng: -98.187, riskLevel: "verde",   lastUpdate: "hace 3 min",  temperature: 23.5, humidity: 65.0, smoke: 38,  fireProbability: 7  },
  // ── Apizaco / Muñoz ──────────────────────────────────
  { id: "N9",  name: "Apizaco Norte",           lat: 19.427, lng: -98.136, riskLevel: "amarillo",lastUpdate: "hace 1 min",  temperature: 28.7, humidity: 38.4, smoke: 119, fireProbability: 32 },
  { id: "N10", name: "Muñoz de D. Arenas",      lat: 19.388, lng: -98.106, riskLevel: "verde",   lastUpdate: "hace 5 min",  temperature: 22.9, humidity: 70.1, smoke: 31,  fireProbability: 6  },
  // ── Huamantla y oriente ───────────────────────────────
  { id: "N11", name: "Huamantla",               lat: 19.312, lng: -97.921, riskLevel: "naranja", lastUpdate: "hace 2 min",  temperature: 33.6, humidity: 25.4, smoke: 201, fireProbability: 58 },
  { id: "N12", name: "Cuapiaxtla",              lat: 19.296, lng: -97.782, riskLevel: "rojo",    lastUpdate: "hace 1 min",  temperature: 41.3, humidity: 16.2, smoke: 420, fireProbability: 91 },
  { id: "N13", name: "Zitlaltepec",             lat: 19.274, lng: -97.870, riskLevel: "naranja", lastUpdate: "hace 3 min",  temperature: 36.1, humidity: 22.8, smoke: 263, fireProbability: 67 },
  // ── Sur de Tlaxcala ───────────────────────────────────
  { id: "N14", name: "Nativitas",               lat: 19.175, lng: -98.191, riskLevel: "verde",   lastUpdate: "hace 2 min",  temperature: 23.8, humidity: 66.7, smoke: 42,  fireProbability: 10 },
  { id: "N15", name: "Zacatelco",               lat: 19.215, lng: -98.225, riskLevel: "verde",   lastUpdate: "hace 4 min",  temperature: 22.4, humidity: 71.5, smoke: 35,  fireProbability: 5  },
  { id: "N16", name: "San Pablo del Monte",     lat: 19.178, lng: -98.181, riskLevel: "amarillo",lastUpdate: "hace 3 min",  temperature: 30.1, humidity: 37.6, smoke: 138, fireProbability: 36 },
  // ── Norte / Tlaxco ────────────────────────────────────
  { id: "N17", name: "Tlaxco",                  lat: 19.621, lng: -98.119, riskLevel: "amarillo",lastUpdate: "hace 6 min",  temperature: 27.3, humidity: 42.1, smoke: 110, fireProbability: 28 },
  { id: "N18", name: "Calpulalpan",             lat: 19.591, lng: -98.568, riskLevel: "verde",   lastUpdate: "hace 5 min",  temperature: 21.7, humidity: 72.3, smoke: 28,  fireProbability: 5  },
  { id: "N19", name: "Lázaro Cárdenas",         lat: 19.541, lng: -98.239, riskLevel: "verde",   lastUpdate: "hace 7 min",  temperature: 20.9, humidity: 75.8, smoke: 22,  fireProbability: 4  },
  { id: "N20", name: "Emilio Portes Gil",       lat: 19.487, lng: -98.043, riskLevel: "amarillo",lastUpdate: "hace 4 min",  temperature: 29.4, humidity: 39.7, smoke: 132, fireProbability: 33 },
];

export const recentAlerts: Alert[] = [
  {
    id: "A001", timestamp: "hace 8 min",
    riskLevel: "rojo", location: "La Malinche Oeste", resolved: false,
    message: "Humo crítico detectado. Temperatura elevada confirmada.",
  },
  {
    id: "A002", timestamp: "hace 23 min",
    riskLevel: "naranja", location: "La Malinche Norte", resolved: false,
    message: "Humedad bajo umbral crítico (18%). Condiciones de alto riesgo.",
  },
  {
    id: "A003", timestamp: "hace 47 min",
    riskLevel: "amarillo", location: "La Malinche Sur", resolved: true,
    message: "Temperatura en aumento sostenido. Monitoreo intensificado.",
  },
  {
    id: "A004", timestamp: "hace 1 h 35 min",
    riskLevel: "amarillo", location: "Cumbres Centro", resolved: true,
    message: "Presencia de humo moderada detectada.",
  },
];

export const riskConfig = {
  verde:   { label: "Riesgo Bajo",      color: "#22c55e", bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-400",  hex: "#22c55e" },
  amarillo:{ label: "Riesgo Moderado",  color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", hex: "#eab308" },
  naranja: { label: "Riesgo Alto",      color: "#f97316", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", hex: "#f97316" },
  rojo:    { label: "Posible Incendio", color: "#ef4444", bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-400",    hex: "#ef4444" },
};
