// Store en memoria — guarda las últimas 200 lecturas
// Se pierde al reiniciar el servidor (en la versión real usaremos SQLite)

export interface SensorPayload {
  temperature: number;
  pressure: number;
  humidity: number | null; // null hasta que llegue el BME280
  smoke: number;
  node_id?: string;
  timestamp?: string;
}

export interface StoredReading extends SensorPayload {
  timestamp: string;
  node_id: string;
}

const MAX_READINGS = 200;

// Singleton global (sobrevive hot-reload en dev)
const g = globalThis as typeof globalThis & { sensorStore?: StoredReading[] };
if (!g.sensorStore) g.sensorStore = [];

export const sensorStore = {
  push(payload: SensorPayload): StoredReading {
    const reading: StoredReading = {
      ...payload,
      node_id: payload.node_id ?? "ESP32-N1",
      timestamp: new Date().toISOString(),
    };
    g.sensorStore!.unshift(reading); // más reciente primero
    if (g.sensorStore!.length > MAX_READINGS) g.sensorStore!.pop();
    return reading;
  },

  latest(): StoredReading | null {
    return g.sensorStore![0] ?? null;
  },

  all(): StoredReading[] {
    return g.sensorStore!;
  },

  last(n: number): StoredReading[] {
    return g.sensorStore!.slice(0, n);
  },
};
