import type { AccommodationId } from "./api/types";
import {
  ACCOMMODATION_VIDEOS,
  BOUTIQUE_GALLERY,
  CASA_MIRADOR_GALLERY,
  type MediaAsset,
} from "./media";

/**
 * Contenido oficial definitivo de Mirador de Nogueche (Noviembre 2026):
 * - Tarifario temporada alta 2026–2027 (01 dic 2026 al 28 feb 2027 inclusive)
 * - Condiciones generales, políticas de cancelación, niños y convivencia
 * - Guía digital de entorno en Cobquecura, Región de Ñuble
 */

export const POLICIES_VERSION = "nov-2026-v1";

export const PROPERTY_INFO = {
  name: "Mirador de Nogueche",
  shortName: "Mirador de Nogueche",
  subtitle: "Alojamientos junto al mar · Cobquecura",
  tagline: "Naturaleza, tranquilidad y descanso junto al mar.",
  hostName: "Erica Astudillo",
  whatsappDisplay: "+56 9 2647 0070",
  whatsappHref:
    "https://wa.me/56926470070?text=Hola%20Erica%2C%20te%20escribo%20desde%20Mirador%20de%20Nogueche",
  address:
    "Sector Nogueche, comuna de Cobquecura, Región de Ñuble, Chile",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=-36.2216951,-72.8122664",
  regionSummary:
    "Sector Nogueche, comuna de Cobquecura, Región de Ñuble. A 5 minutos caminando de la playa y a 15 minutos en vehículo del centro de Cobquecura.",
  beachDistance: "5 minutos caminando de la playa",
  townDistance: "15 minutos en vehículo del centro de Cobquecura",
  checkInTime: "15:00 hrs",
  checkOutTime: "12:00 hrs",
  quietHours: "23:00 a 08:00 hrs",
  scheduleNote:
    "Cualquier modificación de estos horarios deberá ser consultada previamente con la administración y estará sujeta a disponibilidad.",
  wifi: {
    network: "Jupiter1",
    password: "ANTENA",
  },
  bluetoothRadio: "VT500",
  socials: {
    instagram:
      "https://www.instagram.com/miradordenogueche?utm_source=qr&igsh=MWhkM3hkb25mZmY5aQ==",
    instagramHandle: "@miradordenogueche",
    facebook: "https://www.facebook.com/profile.php?id=61587071120684",
  },
};

export interface AccommodationTier {
  guestsLabel: string;
  minGuests: number;
  maxGuests: number;
  nightlyRate: number;
}

export interface AccommodationProfile {
  id: AccommodationId;
  name: string;
  badge: string;
  capacityLabel: string;
  maxRegularGuests: number;
  maxTotalWithSharedChild: number;
  startingRate: number;
  summary: string;
  idealFor: string;
  highlights: string[];
  tiers: AccommodationTier[];
  cover: MediaAsset;
  gallery: MediaAsset[];
  video: {
    src: string;
    poster: string;
    title: string;
  };
}

export const ACCOMMODATIONS: Record<AccommodationId, AccommodationProfile> = {
  "cabana-boutique": {
    id: "cabana-boutique",
    name: "Cabaña Boutique",
    badge: "Refugio para 1 a 2 personas",
    capacityLabel: "1 a 2 personas",
    maxRegularGuests: 2,
    maxTotalWithSharedChild: 3, // hasta 2 adultos + 1 niño (2-6 o <2) compartiendo cama existente
    startingRate: 60000,
    summary:
      "Refugio íntimo en madera natural con terraza privada, cocina equipada, estación de café con prensa francesa y vistas al atardecer costero.",
    idealFor: "Escapadas en pareja o descanso individual frente al mar.",
    highlights: [
      "1 a 2 personas · Cama matrimonial en madera",
      "Terraza privada con vista despejada",
      "Cocina equipada + prensa francesa",
      "A 5 minutos caminando de la playa",
      "Ingreso autónomo con caja de seguridad",
    ],
    tiers: [
      {
        guestsLabel: "1 a 2 personas",
        minGuests: 1,
        maxGuests: 2,
        nightlyRate: 60000,
      },
    ],
    cover: BOUTIQUE_GALLERY[0],
    gallery: BOUTIQUE_GALLERY,
    video: ACCOMMODATION_VIDEOS["cabana-boutique"],
  },
  "casa-mirador": {
    id: "casa-mirador",
    name: "Casa Mirador",
    badge: "Alojamiento familiar 1 a 6 personas",
    capacityLabel: "1 a 6 personas",
    maxRegularGuests: 6,
    maxTotalWithSharedChild: 6,
    startingRate: 65000,
    summary:
      "Amplia casa costera con ventanales panorámicos, cocina con isla central, múltiples dormitorios, zona de fogón exterior y vista abierta al paisaje de Nogueche.",
    idealFor: "Familias, parejas que buscan amplitud o grupos tranquilos de hasta 6 personas.",
    highlights: [
      "1 a 6 personas · Tarifa escalonada por capacidad",
      "Living comedor panorámico con vigas a la vista",
      "Cocina completa con isla central",
      "Dormitorio principal + dormitorio con camarote + espacio adicional",
      "Zona de fogón exterior habilitada y vista al mar",
    ],
    tiers: [
      { guestsLabel: "1 a 2 personas", minGuests: 1, maxGuests: 2, nightlyRate: 65000 },
      { guestsLabel: "3 a 4 personas", minGuests: 3, maxGuests: 4, nightlyRate: 75000 },
      { guestsLabel: "5 personas", minGuests: 5, maxGuests: 5, nightlyRate: 85000 },
      { guestsLabel: "6 personas", minGuests: 6, maxGuests: 6, nightlyRate: 95000 },
    ],
    cover: CASA_MIRADOR_GALLERY[0],
    gallery: CASA_MIRADOR_GALLERY,
    video: ACCOMMODATION_VIDEOS["casa-mirador"],
  },
};

export const ACCOMMODATION_LIST: AccommodationProfile[] = [
  ACCOMMODATIONS["cabana-boutique"],
  ACCOMMODATIONS["casa-mirador"],
];

export const OFFICIAL_POLICIES = {
  version: POLICIES_VERSION,
  highSeasonLabel: "01 de diciembre de 2026 al 28 de febrero de 2027 (inclusive)",
  minStaySummary: [
    "Estadía mínima de 2 noches durante toda la temporada alta (01 dic 2026 – 28 feb 2027).",
    "Estadía mínima de 2 noches los fines de semana durante el resto del año.",
    "Valores expresados en pesos chilenos (CLP), por alojamiento y por noche (no por persona).",
  ],
  childrenPolicy: [
    "Menores de 2 años: sin costo adicional.",
    "Desde los 2 hasta los 6 años inclusive: $5.000 adicionales por niño y por noche, cuando compartan una cama existente.",
    "Desde los 7 años: tarifa regular según cantidad de huéspedes.",
    "No disponemos de cunas.",
  ],
  cancellationTable: [
    {
      window: "15 días o más antes del ingreso",
      refund: "100% del abono",
    },
    {
      window: "Entre 7 y 14 días antes del ingreso",
      refund: "50% del abono",
    },
    {
      window: "Menos de 7 días antes del ingreso",
      refund: "Sin devolución",
    },
    {
      window: "No presentación del huésped",
      refund: "Sin devolución",
    },
  ],
  cancellationNotes: [
    "Las solicitudes de cancelación deberán realizarse por escrito a través de los canales oficiales de contacto.",
    "En caso de retiro anticipado por decisión del huésped, no se realizará devolución por las noches no utilizadas.",
    "Si la cancelación es responsabilidad de Mirador de Nogueche, se devolverá la totalidad de los montos pagados.",
  ],
  modificationRules: [
    "Se permitirá una modificación de fechas por reserva.",
    "La solicitud deberá realizarse con al menos 7 días de anticipación a la fecha de ingreso.",
    "La modificación estará sujeta a disponibilidad.",
    "En caso de existir diferencias tarifarias, estas deberán ser regularizadas antes del ingreso.",
  ],
  noPetsPolicy: {
    title: "Política de no admisión de mascotas",
    summary:
      "Con el propósito de resguardar la higiene, el cuidado de nuestras instalaciones y garantizar una experiencia de descanso y tranquilidad para todos nuestros huéspedes, Mirador de Nogueche no admite mascotas en ninguno de sus alojamientos.",
    exception:
      "Se exceptúan los perros de asistencia debidamente identificados, conforme a la normativa vigente.",
  },
  mandatoryCheckboxes: {
    cancellation:
      "He leído y acepto las políticas de cancelación y modificación de reservas.",
    houseRules:
      "He leído y acepto las condiciones generales y normas de convivencia de Mirador de Nogueche, incluida la política de no admisión de mascotas.",
  },
};

export interface BreakfastOption {
  id: "clasico" | "especial";
  name: string;
  pricePerPerson: number;
  description: string;
  items: string[];
}

export const BREAKFAST_OPTIONS: BreakfastOption[] = [
  {
    id: "clasico",
    name: "Desayuno Clásico",
    pricePerPerson: 5000,
    description: "Despierta mirando el mar con un desayuno casero recién preparado.",
    items: [
      "Café o té",
      "Jugo natural",
      "Tostadas con mantequilla y mermelada",
      "Huevo",
      "Palta y fruta fresca",
    ],
  },
  {
    id: "especial",
    name: "Desayuno Especial",
    pricePerPerson: 8000,
    description: "Experiencia completa para mañanas lentas en la terraza.",
    items: [
      "Café y jugo",
      "Tostadas + pan especial",
      "Huevos con jamón o queso",
      "Palta, fruta fresca y dulce",
    ],
  },
];

export const HOUSE_RULES = [
  {
    code: "01",
    title: "Horario de silencio (23:00 a 08:00 hrs)",
    detail:
      "Respetar el descanso de todos los huéspedes. No se permiten fiestas, celebraciones, eventos ni música a volumen alto.",
  },
  {
    code: "02",
    title: "Solo huéspedes registrados · Sin visitas externas",
    detail:
      "No se permite recibir visitas externas ni superar la capacidad máxima del alojamiento. Solo permanecen las personas registradas en la reserva.",
  },
  {
    code: "03",
    title: "No se admiten mascotas",
    detail:
      "No se admiten mascotas en Cabaña Boutique ni en Casa Mirador, exceptuando perros de asistencia debidamente identificados.",
  },
  {
    code: "04",
    title: "Prohibido fumar en interiores",
    detail:
      "Está estrictamente prohibido fumar dentro de los alojamientos. Solo en espacios exteriores, disponiendo adecuadamente las colillas.",
  },
  {
    code: "05",
    title: "Uso de cocina (sin frituras en interior)",
    detail:
      "No se permite realizar frituras dentro de los alojamientos para evitar olores persistentes. Para frituras utiliza implementos adecuados en el exterior.",
  },
  {
    code: "06",
    title: "Parrillas, fogones y cuidado de instalaciones",
    detail:
      "Usar parrillas y fogones solo en espacios habilitados, sin dejar fuego sin supervisión. El titular responde por daños, pérdidas o limpieza extraordinaria.",
  },
];

export const FRENCH_PRESS_STEPS = [
  {
    step: "01",
    title: "Café",
    detail: "Agrega 2 cucharadas de café molido por cada taza (200 ml).",
  },
  {
    step: "02",
    title: "Agua",
    detail: "Vierte agua caliente (no recién hervida): espera 30 segundos tras hervir.",
  },
  {
    step: "03",
    title: "Infusión",
    detail: "Coloca la tapa sin presionar y deja reposar entre 3 y 5 minutos.",
  },
  {
    step: "04",
    title: "Prensado suave",
    detail:
      "Presiona suavemente el émbolo hacia abajo sin llegar al fondo para evitar amargor. Sirve y disfruta la vista.",
  },
];

export const TV_BOX_STEPS = [
  "Verifica que la luz del TV Box esté en verde; si no, presiona ON en la parte trasera.",
  "Usa el control grande para encender el televisor.",
  "Usa el control pequeño (flechas negras en círculo blanco) para navegar en pantalla.",
  "Para canales nacionales, películas, fútbol y series abre la aplicación XUPER.",
  "Presiona OK apuntando directamente al TV Box.",
];

export const OTHER_AMENITIES = [
  "Radio Bluetooth disponible: conéctate seleccionando el dispositivo VT500.",
  "Enchufe y pastillas para zancudos disponibles bajo el lavaplatos.",
  "Secador de pelo en el mueble de baño, champú, acondicionador, jabón, toallas de cuerpo y manos.",
  "Recolección selectiva habilitada: residuos comunes, cartón, papel, latas y vidrios.",
];

export const FAQ_ITEMS = [
  {
    q: "¿Qué alojamientos tienen y cuáles son las tarifas 2026–2027?",
    a: "Contamos con dos alojamientos con calendarios independientes: Cabaña Boutique (1 a 2 personas, $60.000/noche) y Casa Mirador (1 a 2 personas $65.000, 3 a 4 personas $75.000, 5 personas $85.000 y 6 personas $95.000 por noche). Los valores son en CLP por alojamiento y por noche.",
  },
  {
    q: "¿Cuáles son los horarios de check-in, check-out y silencio?",
    a: "Check-in desde las 15:00 horas y check-out hasta las 12:00 horas. El horario de silencio rige entre las 23:00 y las 08:00 horas. Cualquier ajuste de horario debe consultarse previamente y está sujeto a disponibilidad.",
  },
  {
    q: "¿Cómo funciona la reserva, el bloqueo de 15 minutos y el ingreso autónomo?",
    a: "Al seleccionar fechas y completar el registro de huéspedes, bloqueamos temporalmente tus fechas durante 15 minutos mientras realizas el abono del 50% (débito, crédito o transferencia bancaria con comprobante). El 50% restante se paga antes del ingreso y, al confirmarse el 100%, se libera automáticamente el código de la caja de seguridad que contiene las llaves.",
  },
  {
    q: "¿Cuál es la política tarifaria para niños?",
    a: "Menores de 2 años ingresan sin costo adicional. Niños de 2 a 6 años inclusive pagan $5.000 adicionales por niño y por noche cuando compartan una cama existente. Desde los 7 años aplica tarifa regular según cantidad de huéspedes. No disponemos de cunas.",
  },
  {
    q: "¿Admiten mascotas?",
    a: "No. Con el fin de resguardar la higiene, el cuidado de las instalaciones y el descanso de todos los huéspedes, Mirador de Nogueche no admite mascotas en ninguno de sus alojamientos. Se exceptúan únicamente perros de asistencia debidamente identificados conforme a la normativa vigente.",
  },
  {
    q: "¿Cuál es la política de cancelación y modificación de fechas?",
    a: "Con 15 días o más de anticipación se devuelve el 100% del abono; entre 7 y 14 días, el 50%; con menos de 7 días o no presentación no hay devolución. Además, se permite 1 modificación de fechas por reserva solicitándola con al menos 7 días de anticipación (sujeta a disponibilidad y diferencia tarifaria).",
  },
  {
    q: "¿Dónde están ubicados exactamente?",
    a: "Estamos en el sector Nogueche, comuna de Cobquecura, Región de Ñuble, a 5 minutos caminando de la playa y a 15 minutos en vehículo del centro de Cobquecura. El enlace exacto de Google Maps y el código de ingreso autónomo se entregan al completar el 100% del pago.",
  },
];

export interface LocalPlace {
  name: string;
  area: string;
  driveTime: string;
  description: string;
  category:
    | "supermercados"
    | "donde-comer"
    | "lugares"
    | "excursiones"
    | "experiencias";
  mapsQuery: string;
}

export const LOCAL_GUIDE_PLACES: LocalPlace[] = [
  // Supermercados y compras
  {
    name: "Supermercado La Colérica",
    area: "Centro Cobquecura",
    driveTime: "15 min en auto",
    description: "Abastecimiento general en el centro del pueblo.",
    category: "supermercados",
    mapsQuery: "Supermercado La Colerica Cobquecura",
  },
  {
    name: "Minimarket Miramar Colmuyao",
    area: "Hacia el sur",
    driveTime: "7 min en auto",
    description: "Opción cercana hacia el sur por la Ruta del Mar.",
    category: "supermercados",
    mapsQuery: "Minimarket Miramar Colmuyao Cobquecura",
  },
  {
    name: "Violetita",
    area: "Taucu",
    driveTime: "8 min en auto",
    description: "Provisiones y abarrotes en el sector de Taucu.",
    category: "supermercados",
    mapsQuery: "Taucu Cobquecura",
  },
  {
    name: "Minimarket El Futuro",
    area: "Centro Cobquecura",
    driveTime: "15 min en auto",
    description: "Minimarket céntrico para compras rápidas.",
    category: "supermercados",
    mapsQuery: "Minimarket El Futuro Cobquecura",
  },
  {
    name: "Caleta Rita · Local N° 2",
    area: "Caleta Rinconada",
    driveTime: "7 min en auto",
    description: "Pescados, mariscos y ceviches frescos recién salidos del mar.",
    category: "supermercados",
    mapsQuery: "Caleta Rinconada Cobquecura",
  },
  {
    name: "Kiosko Donde la Mary",
    area: "Pilicura",
    driveTime: "15 min en auto",
    description: "Empanadas, pan amasado y dulces típicos de Cobquecura.",
    category: "supermercados",
    mapsQuery: "Pilicura Cobquecura",
  },

  // Dónde comer
  {
    name: "Ruka Antu",
    area: "Rinconada de Taucu",
    driveTime: "8 min en auto",
    description: "Cocina costera tradicional cerca del alojamiento.",
    category: "donde-comer",
    mapsQuery: "Ruka Antu Rinconada de Taucu Cobquecura",
  },
  {
    name: "Kokoa Sushi",
    area: "Cobquecura",
    driveTime: "15 min en auto",
    description: "Sushi fresco para llevar y disfrutar en la terraza.",
    category: "donde-comer",
    mapsQuery: "Kokoa Sushi Cobquecura",
  },
  {
    name: "HAND Rocker",
    area: "Cobquecura",
    driveTime: "15 min en auto",
    description: "Sushi para llevar o comer en el local.",
    category: "donde-comer",
    mapsQuery: "HAND Rocker Cobquecura",
  },
  {
    name: "Sabores Cobquecura",
    area: "Centro Cobquecura",
    driveTime: "15 min en auto",
    description: "Gastronomía local en el corazón de Cobquecura.",
    category: "donde-comer",
    mapsQuery: "Sabores Cobquecura",
  },
  {
    name: "Café Mirador Cobquecura",
    area: "Pilicura",
    driveTime: "10 min en auto",
    description: "Cafetería con vista privilegiada al litoral.",
    category: "donde-comer",
    mapsQuery: "Cafe Mirador Cobquecura",
  },
  {
    name: "Restobar Arena Negra",
    area: "Cobquecura",
    driveTime: "15 min en auto",
    description: "Restobar costero ideal para cena y tragos al atardecer.",
    category: "donde-comer",
    mapsQuery: "Restobar Arena Negra Cobquecura",
  },
  {
    name: "Restaurant La Lobería",
    area: "Cobquecura",
    driveTime: "15 min en auto",
    description: "Clásico de pescados y mariscos frente a la costa.",
    category: "donde-comer",
    mapsQuery: "Restaurant La Loberia Cobquecura",
  },
  {
    name: "Vibras Point / Don Gualo / Entre Lobos",
    area: "Buchupureo",
    driveTime: "20 min en auto",
    description: "Polo gastronómico surfista de Buchupureo con cocina de mar y empanadas.",
    category: "donde-comer",
    mapsQuery: "Buchupureo restaurantes Cobquecura",
  },

  // Lugares para visitar
  {
    name: "Playa Nogueche",
    area: "Sector Nogueche",
    driveTime: "5 min caminando",
    description: "Playa tranquila y extensa a pocos pasos del alojamiento, ideal para caminar al atardecer.",
    category: "lugares",
    mapsQuery: "-36.2216951,-72.8122664",
  },
  {
    name: "Feria Libre Santa Rita",
    area: "Sector Santa Rita",
    driveTime: "3 min en auto",
    description: "Productos locales, frutas, verduras y artesanía de la zona.",
    category: "lugares",
    mapsQuery: "Santa Rita Cobquecura",
  },
  {
    name: "Caleta Rinconada",
    area: "Rinconada",
    driveTime: "8 min en auto",
    description: "Caleta de pescadores artesanales y paisaje costero único.",
    category: "lugares",
    mapsQuery: "Caleta Rinconada Cobquecura",
  },
  {
    name: "Arco de los Enamorados & Agujero del Puelche",
    area: "Rinconada",
    driveTime: "8 min en auto",
    description: "Formaciones rocosas icónicas esculpidas por el Pacífico.",
    category: "lugares",
    mapsQuery: "Arco de los Enamorados Cobquecura",
  },
  {
    name: "Iglesia de Piedra",
    area: "Norte de Cobquecura",
    driveTime: "15 min en auto",
    description: "Monumento natural emblemático de acantilados y cavernas marinas.",
    category: "lugares",
    mapsQuery: "Iglesia de Piedra Cobquecura",
  },

  // Excursiones
  {
    name: "Humedal Colmuyao & Humedal Taucu",
    area: "Sur / Norte",
    driveTime: "7 min en auto",
    description: "Avistamiento de aves y senderos costeros tranquilos.",
    category: "excursiones",
    mapsQuery: "Humedal Taucu Cobquecura",
  },
  {
    name: "Cerro El Calvario",
    area: "Centro Cobquecura",
    driveTime: "15 min en auto",
    description: "Mirador panorámico sobre el pueblo y el océano.",
    category: "excursiones",
    mapsQuery: "Cerro El Calvario Cobquecura",
  },
  {
    name: "Santuario de la Naturaleza La Lobería",
    area: "Cobquecura",
    driveTime: "15 min en auto",
    description: "Islotes habitados por lobos marinos frente a la playa principal.",
    category: "excursiones",
    mapsQuery: "Santuario de la Naturaleza La Loberia Cobquecura",
  },
  {
    name: "Playa Mure & Buchupureo",
    area: "Norte",
    driveTime: "20 min en auto",
    description: "Olas reconocidas para surf, cafeterías y atardeceres inolvidables.",
    category: "excursiones",
    mapsQuery: "Playa Buchupureo Cobquecura",
  },

  // Experiencias
  {
    name: "Ñuble SUP",
    area: "Costa de Cobquecura",
    driveTime: "Coordinar en IG",
    description: "Travesías guiadas de Stand Up Paddle en humedales y mar calmo.",
    category: "experiencias",
    mapsQuery: "Nuble SUP Cobquecura",
  },
  {
    name: "ANCESTRAL Ecoturismo",
    area: "Cobquecura",
    driveTime: "Coordinar en IG",
    description: "Rutas de ecoturismo interpretativo por la costa de Ñuble.",
    category: "experiencias",
    mapsQuery: "Ancestral Ecoturismo Cobquecura",
  },
  {
    name: "Kofke TOUR",
    area: "Cobquecura",
    driveTime: "Coordinar en IG",
    description: "Recorridos locales y experiencias guiadas por la zona.",
    category: "experiencias",
    mapsQuery: "Kofke Tour Cobquecura",
  },
];
