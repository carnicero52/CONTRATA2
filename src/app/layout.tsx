import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContrataFácil - Recepción de Currículums",
  description: "Sistema simple para recibir y gestionar currículums",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}
