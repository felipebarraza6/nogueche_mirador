import { assetPath } from "./utils";

/**
 * Catálogo centralizado de fotografías y videos reales de Mirador de Nogueche
 * (Cabaña Boutique 1-2 personas y Casa Mirador 1-6 personas).
 */

export interface MediaAsset {
  id: string;
  src: string;
  alt: string;
  caption: string;
  tag: string;
  category: "boutique" | "casa-mirador" | "entorno";
  isPlaceholder: boolean;
}

export const CABIN_MEDIA: Record<string, MediaAsset> = {
  heroSunset: {
    id: "hero-sunset",
    src: assetPath("/photos/hero-pacifico-real.jpg"),
    alt: "Atardecer real sobre el Océano Pacífico desde sector Nogueche, Cobquecura",
    caption: "Atardecer real sobre el Pacífico · Sector Nogueche",
    tag: "Atardecer Real",
    category: "entorno",
    isPlaceholder: false,
  },
  cabinExterior: {
    id: "cabin-exterior",
    src: assetPath("/photos/boutique/exterior-atardecer.jpg"),
    alt: "Cabaña Boutique Mirador de Nogueche iluminada al atardecer",
    caption: "Cabaña Boutique iluminada al atardecer",
    tag: "Cabaña Boutique",
    category: "boutique",
    isPlaceholder: false,
  },
  casaExterior: {
    id: "casa-exterior",
    src: assetPath("/photos/casa-mirador/living-comedor-panoramico.jpg"),
    alt: "Amplio living comedor con ventanales panorámicos en Casa Mirador",
    caption: "Casa Mirador · Living comedor panorámico",
    tag: "Casa Mirador",
    category: "casa-mirador",
    isPlaceholder: false,
  },
  morningCoffee: {
    id: "morning-coffee",
    src: assetPath("/photos/desayuno-real.png"),
    alt: "Bandeja de desayuno casero con café, jugo, frutas, huevos y pan",
    caption: "Despierta mirando el mar con desayuno casero opcional",
    tag: "Desayunos",
    category: "entorno",
    isPlaceholder: false,
  },
  coastalCliffs: {
    id: "coastal-cliffs",
    src: assetPath("/photos/humedal-taucu.png"),
    alt: "Costa de Cobquecura y Humedal Taucu a minutos de Mirador de Nogueche",
    caption: "A minutos de Humedal Taucu, Caleta Rinconada e Iglesia de Piedra",
    tag: "Entorno",
    category: "entorno",
    isPlaceholder: false,
  },
  blueDoorView: {
    id: "blue-door-view",
    src: assetPath("/photos/entorno-puerta-azul.png"),
    alt: "Paisaje costero y praderas de la comuna de Cobquecura",
    caption: "Naturaleza y tranquilidad en Cobquecura, Región de Ñuble",
    tag: "Cobquecura",
    category: "entorno",
    isPlaceholder: false,
  },
  locationMap: {
    id: "location-map",
    src: assetPath("/photos/mapa-nogueche.png"),
    alt: "Mapa de ubicación de Mirador de Nogueche en la costa de Cobquecura",
    caption: "Sector Nogueche · A 5 min caminando de la playa",
    tag: "Ubicación",
    category: "entorno",
    isPlaceholder: false,
  },
  hostErica: {
    id: "host-erica",
    src: assetPath("/photos/anfitriona-erica.png"),
    alt: "Erica Astudillo, anfitriona de Mirador de Nogueche",
    caption: "Erica Astudillo · Anfitriona",
    tag: "Anfitriona",
    category: "entorno",
    isPlaceholder: false,
  },
};

export const BOUTIQUE_GALLERY: MediaAsset[] = [
  {
    id: "bq-exterior",
    src: assetPath("/photos/boutique/exterior-atardecer.jpg"),
    alt: "Exterior Cabaña Boutique iluminada al caer la tarde",
    caption: "Cabaña Boutique · Fachada cálida al atardecer",
    tag: "Cabaña Boutique",
    category: "boutique",
    isPlaceholder: false,
  },
  {
    id: "bq-dormitorio",
    src: assetPath("/photos/boutique/dormitorio-king.jpg"),
    alt: "Dormitorio en madera natural con cama matrimonial y ropa de cama blanca",
    caption: "Dormitorio acogedor en madera natural",
    tag: "Cabaña Boutique",
    category: "boutique",
    isPlaceholder: false,
  },
  {
    id: "bq-comedor",
    src: assetPath("/photos/boutique/comedor-luz.jpg"),
    alt: "Comedor luminoso junto a la ventana en Cabaña Boutique",
    caption: "Comedor para dos bañado en luz costera",
    tag: "Cabaña Boutique",
    category: "boutique",
    isPlaceholder: false,
  },
  {
    id: "bq-terraza",
    src: assetPath("/photos/boutique/terraza-vista.jpg"),
    alt: "Terraza de madera con vista despejada en Cabaña Boutique",
    caption: "Terraza privada de madera para descansar",
    tag: "Cabaña Boutique",
    category: "boutique",
    isPlaceholder: false,
  },
  {
    id: "bq-prensa",
    src: assetPath("/photos/boutique/prensa-francesa.jpg"),
    alt: "Estación de café con prensa francesa y tazas sobre repisa de ola en madera",
    caption: "Estación de café con prensa francesa",
    tag: "Cabaña Boutique",
    category: "boutique",
    isPlaceholder: false,
  },
  {
    id: "bq-cocina",
    src: assetPath("/photos/boutique/cocina-equipada.jpg"),
    alt: "Cocina equipada con encimera a gas y hervidor en Cabaña Boutique",
    caption: "Cocina equipada para tus preparaciones",
    tag: "Cabaña Boutique",
    category: "boutique",
    isPlaceholder: false,
  },
  {
    id: "bq-amenidades",
    src: assetPath("/photos/boutique/amenidades-bano.jpg"),
    alt: "Dispensadores de champú, acondicionador y jabón en ducha de Cabaña Boutique",
    caption: "Amenidades de baño incluidas",
    tag: "Cabaña Boutique",
    category: "boutique",
    isPlaceholder: false,
  },
  {
    id: "bq-atardecer",
    src: assetPath("/photos/boutique/atardecer-terraza.jpg"),
    alt: "Atardecer dorado visto desde la terraza de Cabaña Boutique",
    caption: "Puestas de sol desde tu propia terraza",
    tag: "Cabaña Boutique",
    category: "boutique",
    isPlaceholder: false,
  },
];

export const CASA_MIRADOR_GALLERY: MediaAsset[] = [
  {
    id: "cm-living-panoramico",
    src: assetPath("/photos/casa-mirador/living-comedor-panoramico.jpg"),
    alt: "Amplio living y comedor en Casa Mirador con techo de madera a la vista",
    caption: "Casa Mirador · Espacio común panorámico (hasta 6 personas)",
    tag: "Casa Mirador",
    category: "casa-mirador",
    isPlaceholder: false,
  },
  {
    id: "cm-comedor-vista",
    src: assetPath("/photos/casa-mirador/comedor-vista-mar.jpg"),
    alt: "Comedor familiar con ventanales hacia el paisaje costero",
    caption: "Comedor familiar con vista abierta a la costa",
    tag: "Casa Mirador",
    category: "casa-mirador",
    isPlaceholder: false,
  },
  {
    id: "cm-cocina-isla",
    src: assetPath("/photos/casa-mirador/cocina-isla.jpg"),
    alt: "Cocina amplia con isla central de madera en Casa Mirador",
    caption: "Cocina completa con isla y equipamiento familiar",
    tag: "Casa Mirador",
    category: "casa-mirador",
    isPlaceholder: false,
  },
  {
    id: "cm-dormitorio-principal",
    src: assetPath("/photos/casa-mirador/dormitorio-principal.jpg"),
    alt: "Dormitorio principal en esquina con ventanales en Casa Mirador",
    caption: "Dormitorio principal luminoso con vista despejada",
    tag: "Casa Mirador",
    category: "casa-mirador",
    isPlaceholder: false,
  },
  {
    id: "cm-camarote",
    src: assetPath("/photos/casa-mirador/dormitorio-camarote.jpg"),
    alt: "Dormitorio secundario con camarote en madera natural",
    caption: "Dormitorio con camarote para familia o amigos",
    tag: "Casa Mirador",
    category: "casa-mirador",
    isPlaceholder: false,
  },
  {
    id: "cm-dormitorio-adicional",
    src: assetPath("/photos/casa-mirador/dormitorio-adicional.jpg"),
    alt: "Tercer espacio de descanso revestido en madera",
    caption: "Espacio adicional de descanso en madera",
    tag: "Casa Mirador",
    category: "casa-mirador",
    isPlaceholder: false,
  },
  {
    id: "cm-fogon",
    src: assetPath("/photos/casa-mirador/fogon-exterior.jpg"),
    alt: "Zona de fogón exterior con bancas de madera y horizonte marino",
    caption: "Zona de fogón habilitada frente a la pradera y el mar",
    tag: "Casa Mirador",
    category: "casa-mirador",
    isPlaceholder: false,
  },
  {
    id: "cm-playa",
    src: assetPath("/photos/casa-mirador/playa-atardecer.jpg"),
    alt: "Atardecer en la playa de Nogueche a 5 minutos caminando",
    caption: "Playa de Nogueche a solo 5 minutos caminando",
    tag: "Entorno",
    category: "entorno",
    isPlaceholder: false,
  },
];

export const ACCOMMODATION_VIDEOS = {
  "cabana-boutique": {
    src: assetPath("/videos/tour-cabana-boutique.mp4"),
    poster: assetPath("/photos/boutique/exterior-atardecer.jpg"),
    title: "Recorrido real · Cabaña Boutique (1 a 2 personas)",
  },
  "casa-mirador": {
    src: assetPath("/videos/tour-casa-mirador.mp4"),
    poster: assetPath("/photos/casa-mirador/living-comedor-panoramico.jpg"),
    title: "Recorrido real · Casa Mirador (1 a 6 personas)",
  },
} as const;

export const GALLERY_ITEMS: MediaAsset[] = [
  BOUTIQUE_GALLERY[0],
  BOUTIQUE_GALLERY[1],
  BOUTIQUE_GALLERY[3],
  BOUTIQUE_GALLERY[4],
  CASA_MIRADOR_GALLERY[0],
  CASA_MIRADOR_GALLERY[2],
  CASA_MIRADOR_GALLERY[3],
  CASA_MIRADOR_GALLERY[6],
  CASA_MIRADOR_GALLERY[7],
  CABIN_MEDIA.morningCoffee,
  CABIN_MEDIA.coastalCliffs,
  CABIN_MEDIA.locationMap,
];
