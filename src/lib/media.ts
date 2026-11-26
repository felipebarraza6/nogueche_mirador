/**
 * Catálogo centralizado de imágenes temporales (placeholder de alta calidad).
 * Reemplazar cada URL por las fotografías reales de Cabaña Mirador de Nogueche
 * cuando estén listas (pueden apuntar a /photos/*.jpg en public/photos/).
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
    src: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1600&q=85",
    alt: "Cabaña de madera rodeada de vegetación costera",
    caption: "Refugio íntimo entre el bosque y el Pacífico",
    tag: "Arquitectura",
    isPlaceholder: true,
  },
  terraceView: {
    id: "terrace-view",
    src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=85",
    alt: "Dormitorio con cama king y vista luminosa",
    caption: "Cama King diseñada para despertar frente al mar",
    tag: "Descanso",
    isPlaceholder: true,
  },
  morningCoffee: {
    id: "morning-coffee",
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=85",
    alt: "Café de prensa francesa y desayuno artesanal frente a la ventana",
    caption: "Desayunos caseros y ritual de prensa francesa",
    tag: "Desayunos",
    isPlaceholder: true,
  },
  coastalCliffs: {
    id: "coastal-cliffs",
    src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=85",
    alt: "Olas rompiendo sobre acantilados costeros del Pacífico sur",
    caption: "A minutos de Caleta Rinconada, Iglesia de Piedra y La Lobería",
    tag: "Entorno",
    isPlaceholder: true,
  },
  firepitNight: {
    id: "firepit-night",
    src: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=1400&q=85",
    alt: "Zona de fogón al aire libre bajo las estrellas",
    caption: "Zona de fogón y terraza privada bajo el cielo de Ñuble",
    tag: "Fogón",
    isPlaceholder: true,
  },
  petFriendlyBeach: {
    id: "pet-friendly-beach",
    src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1400&q=85",
    alt: "Mascota disfrutando de un paseo costero",
    caption: "Espacio Pet Friendly con normas pensadas para el cuidado mutuo",
    tag: "Pet Friendly",
    isPlaceholder: true,
  },
};

export const GALLERY_ITEMS: MediaAsset[] = [
  CABIN_MEDIA.cabinExterior,
  CABIN_MEDIA.terraceView,
  CABIN_MEDIA.coastalCliffs,
  CABIN_MEDIA.morningCoffee,
  CABIN_MEDIA.firepitNight,
  CABIN_MEDIA.petFriendlyBeach,
];
