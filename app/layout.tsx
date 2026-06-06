import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TLENEXT — Sistema de Monitoreo de Incendios Forestales",
  description: "Plataforma de predicción y alerta temprana de incendios forestales mediante IoT e IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#080e1a] text-slate-200">
        {children}
      </body>
    </html>
  );
}
