import { assetPath } from "./utils";

/**
 * Catálogo centralizado de fotografías de Cabaña Mirador de Nogueche.
 * Incluye fotografías reales extraídas de la Guía Digital 2026 (public/photos/)
 * y tomas panorámicas complementarias de alta resolución.
 */

export interface MediaAsset {
  id: string;
  src: string;
  alt: string;
  caption: string;
  tag: string;
  isPlaceholder: boolean;
}

export const CABIN_MEDIA: Record<string, MediaAsset> = {
  heroSunset: {
    id: "hero-sunset",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85",
    alt: "Atardecer dorado sobre el Océano Pacífico desde la costa de Cobquecura",
    caption: "Horizonte infinito sobre la Ruta del Mar",
    tag: "Atardecer",
    isPlaceholder: true,
  },
  cabinExterior: {
    id: "cabin-exterior",
    src: assetPath("/photos/cabana-atardecer.png"),
    alt: "Cabaña Mirador de Nogueche iluminada por el atardecer sobre terraza elevada",
    caption: "Cabaña Mirador de Nogueche al atardecer",
    tag: "Cabaña Oficial",
    isPlaceholder: false,
  },
  cabinMist: {
    id: "cabin-mist",
    src: assetPath("/photos/cabana-bruma.png"),
    alt: "Acceso con rampa de madera e iluminación cálida en bruma costera",
    caption: "Atmósfera costera y acceso elevado en madera",
    tag: "Cabaña Oficial",
    isPlaceholder: false,
  },
  morningCoffee: {
    id: "morning-coffee",
    src: assetPath("/photos/desayuno-real.png"),
    alt: "Bandeja de desayuno casero con café, jugo, frutas, huevos y pan",
    caption: "Despierta mirando el mar con desayuno listo para ti",
    tag: "Desayunos",
    isPlaceholder: false,
  },
  coastalCliffs: {
    id: "coastal-cliffs",
    src: assetPath("/photos/humedal-taucu.png"),
    alt: "Costa de Cobquecura y Humedal Taucu a minutos de la cabaña",
    caption: "A minutos de Humedal Taucu, Caleta Rinconada e Iglesia de Piedra",
    tag: "Entorno Real",
    isPlaceholder: false,
  },
  blueDoorView: {
    id: "blue-door-view",
    src: assetPath("/photos/entorno-puerta-azul.png"),
    alt: "Paisaje costero y praderas de la comuna de Cobquecura",
    caption: "Naturaleza y paisajes únicos de Cobquecura, Región de Ñuble",
    tag: "Cobquecura",
    isPlaceholder: false,
  },
  locationMap: {
    id: "location-map",
    src: assetPath("/photos/mapa-nogueche.png"),
    alt: "Mapa de ubicación de Mirador de Nogueche en la costa de Cobquecura",
    caption: "Sector Nogueche sobre la Ruta del Mar (N-194)",
    tag: "Ubicación",
    isPlaceholder: false,
  },
  hostErica: {
    id: "host-erica",
    src: assetPath("/photos/anfitriona-erica.png"),
    alt: "Erica Astudillo, anfitriona de Cabaña Mirador de Nogueche",
    caption: "Erica Astudillo · Anfitriona",
    tag: "Anfitriona",
    isPlaceholder: false,
  },
};

export const GALLERY_ITEMS: MediaAsset[] = [
  CABIN_MEDIA.cabinExterior,
  CABIN_MEDIA.cabinMist,
  CABIN_MEDIA.morningCoffee,
  CABIN_MEDIA.coastalCliffs,
  CABIN_MEDIA.blueDoorView,
  CABIN_MEDIA.locationMap,
];
