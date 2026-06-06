import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { temperature, humidity, pressure, smoke, location } = body;

  const prompt = `Eres un sistema experto en predicción de incendios forestales. Analiza las siguientes lecturas de sensores del sistema TLENEXT ubicado en ${location}, Parque Nacional La Malinche, Tlaxcala, México:

- Temperatura: ${temperature} °C
- Humedad relativa: ${humidity} %
- Presión atmosférica: ${pressure} hPa
- Índice de humo/gases (MQ135): ${smoke} ppm

Umbrales de riesgo:
- Verde (bajo): temp < 32°C, humedad > 35%, humo < 120 ppm
- Amarillo (moderado): temp 32-38°C, humedad 20-35%, humo 120-250 ppm
- Naranja (alto): temp 38-45°C, humedad < 20%, humo 250-400 ppm
- Rojo (crítico/posible incendio): temp > 45°C o humo > 400 ppm

Responde ÚNICAMENTE con un JSON con este formato exacto (sin markdown):
{
  "analysis": "análisis detallado de las condiciones actuales en 2-3 oraciones",
  "risk_level": "verde|amarillo|naranja|rojo",
  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "prediction": "predicción sobre lo que podría ocurrir en las próximas horas si las condiciones continúan"
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 600,
  });

  const content = response.choices[0].message.content ?? "{}";

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Respuesta inválida de la IA", raw: content }, { status: 500 });
  }
}
