import { NextResponse } from "next/server";

// Coordenadas La Malinche, Tlaxcala
const LAT = 19.2799;
const LON = -98.2803;

export interface WeatherForecast {
  rainProbability: number;       // 0-100 — máximo de las próximas 6h
  description: string;           // ej. "lluvia ligera"
  tempOutdoor: number | null;    // temperatura externa según clima
  icon: string;                  // código icono OpenWeatherMap
  nextRainHours: number | null;  // en cuántas horas llega la lluvia (null = no hay)
}

export async function GET() {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENWEATHERMAP_API_KEY no configurada" },
      { status: 503 }
    );
  }

  const url =
    `https://api.openweathermap.org/data/2.5/forecast` +
    `?lat=${LAT}&lon=${LON}&appid=${apiKey}&cnt=4&units=metric&lang=es`;

  const res = await fetch(url, { next: { revalidate: 600 } }); // cache 10 min
  if (!res.ok) {
    return NextResponse.json({ error: "Error al obtener clima" }, { status: 502 });
  }

  const data = await res.json();
  const items: Array<{ pop: number; weather: Array<{ description: string; icon: string }>; main: { temp: number }; dt_txt: string }> =
    data.list ?? [];

  if (items.length === 0) {
    return NextResponse.json({ error: "Sin datos de pronóstico" }, { status: 502 });
  }

  // pop = probability of precipitation (0-1), tomamos el máximo de las próximas 4 intervalos (12h)
  const maxPop = Math.round(Math.max(...items.map(i => i.pop ?? 0)) * 100);

  // Primer intervalo con lluvia significativa (>30%)
  const firstRainIdx = items.findIndex(i => (i.pop ?? 0) > 0.3);
  const nextRainHours = firstRainIdx >= 0 ? firstRainIdx * 3 : null;

  const first = items[0];

  const forecast: WeatherForecast = {
    rainProbability: maxPop,
    description: first.weather?.[0]?.description ?? "despejado",
    tempOutdoor: first.main?.temp ?? null,
    icon: first.weather?.[0]?.icon ?? "01d",
    nextRainHours,
  };

  return NextResponse.json(forecast);
}
