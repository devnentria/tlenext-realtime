import { NextRequest, NextResponse } from "next/server";
import { sensorStore } from "@/lib/sensor-store";

// POST — el ESP32 manda datos aquí
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { temperature, pressure, humidity = null, smoke, node_id } = body;

  if (temperature === undefined || pressure === undefined || smoke === undefined) {
    return NextResponse.json({ error: "Faltan campos: temperature, pressure, smoke" }, { status: 400 });
  }

  // Descartar lecturas imposibles (sensor aún calentando o mal contacto)
  if (temperature > 100 || temperature < -40 || pressure < 300 || pressure > 1100 || (humidity !== null && humidity > 100)) {
    return NextResponse.json({ ok: false, reason: "Lectura fuera de rango, descartada" }, { status: 422 });
  }

  const reading = sensorStore.push({ temperature, pressure, humidity, smoke, node_id });

  return NextResponse.json({ ok: true, reading }, { status: 201 });
}

// GET — el dashboard consulta el último dato y el historial
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "latest";

  if (mode === "history") {
    const n = parseInt(searchParams.get("n") ?? "60");
    return NextResponse.json({ readings: sensorStore.last(n).reverse() });
  }

  const latest = sensorStore.latest();
  if (!latest) {
    return NextResponse.json({ connected: false, reading: null });
  }

  return NextResponse.json({ connected: true, reading: latest });
}
