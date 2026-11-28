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
  title: "Mirador de Nogueche · Cabaña Boutique y Casa Mirador en Cobquecura",
  description:
    "Reserva directa en Mirador de Nogueche, Cobquecura, Región de Ñuble. Cabaña Boutique (1–2 pers.) y Casa Mirador (1–6 pers.) a 5 min caminando de la playa.",
  keywords: [
    "Mirador de Nogueche",
    "Cabaña Boutique Cobquecura",
    "Casa Mirador Cobquecura",
    "Alojamiento junto al mar Ñuble",
    "Reservas Cobquecura",
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
