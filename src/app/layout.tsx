import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mirador de Nogueche · Cabaña frente al mar en Cobquecura",
  description:
    "Reserva directa y automatizada en Cabaña Mirador de Nogueche, Cobquecura, Región de Ñuble. Disponibilidad en tiempo real, abono 50% online y guía digital de estadía.",
  keywords: [
    "Mirador de Nogueche",
    "Cabaña Cobquecura",
    "Alojamiento frente al mar Ñuble",
    "Reservas Cobquecura",
    "Pet friendly Cobquecura",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-sand text-ocean antialiased selection:bg-sunset/25 selection:text-ocean">
        {children}
      </body>
    </html>
  );
}
