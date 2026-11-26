/**
 * Contenido real extraído de "Guía digital Cabaña Mirador de Nogueche 2026".
 * Utilizado tanto en la landing pública (resumen) como en el Portal del Huésped (guía completa).
 */

export const PROPERTY_INFO = {
  name: "Cabaña Mirador de Nogueche",
  shortName: "Mirador de Nogueche",
  subtitle: "Cabaña / Cobquecura",
  hostName: "Erica Astudillo",
  whatsappDisplay: "+56 9 2647 0070",
  whatsappHref: "https://wa.me/56926470070?text=Hola%20Erica%2C%20te%20escribo%20desde%20Mirador%20de%20Nogueche",
  address: "Pasaje El Roble Lote 16, sector Nogueche, Comuna Cobquecura, Región de Ñuble, Chile",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Pasaje+El+Roble+Lote+16+Nogueche+Cobquecura+Chile",
  regionSummary:
    "Al sur del centro de Cobquecura, sector Nogueche, sobre la Ruta del Mar, a pocos minutos de Caleta Rinconada.",
  checkInTime: "14:00 hrs",
  checkOutTime: "13:00 hrs",
  lateCheckOutNote:
    "Es posible extender tu salida hasta las 14:00 hrs sin costo, según disponibilidad de agenda.",
  capacitySummary:
    "Ideal para 1 persona o una pareja. Se puede agregar 1 niño pequeño durmiendo en la misma cama king (valor extra por noche sobre los 2 años).",
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
    code: "00",
    title: "No fumar dentro de la cabaña",
    detail:
      "Si fumas, hazlo en la terraza (hay cenicero disponible) o en la zona del fogón.",
  },
  {
    code: "01",
    title: "Recolección selectiva",
    detail:
      "Zona de basura y reciclables a un costado de la bodega frente a la cabaña: residuos comunes, cartón, papel, latas y vidrios.",
  },
  {
    code: "02",
    title: "Cuidado con las llaves",
    detail:
      "Antes de salir verifica que no quede ninguna llave puesta en la cerradura interior. Al check-out déjalas puestas en la cerradura.",
  },
  {
    code: "03",
    title: "Uso consciente de luces",
    detail:
      "Apaga luces interiores, del jardín y de la terraza durante el día y al retirarte.",
  },
  {
    code: "04",
    title: "Puertas y ventanas",
    detail:
      "Asegúrate siempre de cerrar puertas, ventanas y calefacción antes de salir.",
  },
  {
    code: "05",
    title: "Limpieza del espacio",
    detail:
      "Mantén la cabaña y la cocina limpias durante tu estadía. Se podrán cobrar limpiezas adicionales si corresponde.",
  },
  {
    code: "06",
    title: "Timbre negro en la cocina",
    detail:
      "Al retirarte de tu estadía toca 1 vez el timbre negro en la cocina e iremos a despedirte. También úsalo si no respondemos por WhatsApp.",
  },
];

export const PET_FRIENDLY_RULES = {
  conditions: [
    "No pueden subir a camas ni sillones.",
    "Deben circular siempre con correa dentro del entorno de la cabaña.",
    "No pueden quedar solas en la cabaña si los huéspedes salen.",
    "Los dueños deben recoger y disponer adecuadamente sus desechos.",
  ],
  restrictedBreeds: [
    "Bullmastiff",
    "Doberman",
    "Dogo Argentino",
    "Fila Brasileiro",
    "Pitbull",
    "Presa Canario",
    "Presa Mallorquín",
    "Rottweiler",
    "Tosa Inu",
  ],
};

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
];

export const FAQ_ITEMS = [
  {
    q: "¿A qué hora es el check-in y el check-out?",
    a: "Check-in desde las 14:00 hrs y check-out hasta las 13:00 hrs. Se puede extender la salida hasta las 14:00 hrs sin costo según disponibilidad. Infórmanos tu hora de llegada con anticipación.",
  },
  {
    q: "¿Para cuántas personas es la cabaña?",
    a: "Es ideal para 1 persona o una pareja. Puede sumarse un niño pequeño durmiendo en la misma cama king (valor extra por noche sobre los 2 años).",
  },
  {
    q: "¿Cómo funciona la reserva y el pago?",
    a: "Seleccionas tus fechas (estadía mínima de 2 noches en tarifa general) y bloqueamos tu estadía por 30 minutos mientras realizas el abono del 50% vía tarjeta de débito, crédito o transferencia bancaria. El 50% restante se paga antes de la llegada para liberar las indicaciones de acceso y llaves.",
  },
  {
    q: "¿Aceptan mascotas?",
    a: "Sí, somos Pet Friendly bajo normas de convivencia (correa en el entorno, sin subir a camas/sillones y sin quedar solas en la cabaña). Existen restricciones para ciertas razas de manejo especial.",
  },
  {
    q: "¿Tienen secador de pelo, toallas y artículos de baño?",
    a: "Sí. Encontrarás secador de pelo en el mueble de baño, champú, acondicionador, jabón, además de toallas de cuerpo y de manos.",
  },
  {
    q: "¿Dónde están ubicados exactamente?",
    a: "Al sur del centro de Cobquecura, sector Nogueche, sobre la Ruta del Mar, a minutos de Caleta Rinconada. La dirección exacta y el enlace directo a Google Maps se desbloquean automáticamente al completar el 100% del pago.",
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
    driveTime: "8 min en auto",
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
    driveTime: "8 min en auto",
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
    description: "Cocina costera tradicional cerca de la cabaña.",
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
    description: "Sushi para llevar a la cabaña o comer en el local.",
    category: "donde-comer",
    mapsQuery: "HAND Rocker Cobquecura",
  },
  {
    name: "Sabores Cobquecura",
    area: "Centro Cobquecura",
    driveTime: "8 min en auto",
    description: "Gastronomía local en el corazón de Cobquecura.",
    category: "donde-comer",
    mapsQuery: "Sabores Cobquecura",
  },
  {
    name: "Café Mirador Cobquecura",
    area: "Pilicura",
    driveTime: "8 min en auto",
    description: "Cafetería con vista privilegiada al litoral.",
    category: "donde-comer",
    mapsQuery: "Cafe Mirador Cobquecura",
  },
  {
    name: "Restobar Arena Negra",
    area: "Cobquecura",
    driveTime: "10 min en auto",
    description: "Restobar costero ideal para cena y tragos al atardecer.",
    category: "donde-comer",
    mapsQuery: "Restobar Arena Negra Cobquecura",
  },
  {
    name: "Restaurant La Lobería",
    area: "Cobquecura",
    driveTime: "10 min en auto",
    description: "Clásico de pescados y mariscos frente a la costa.",
    category: "donde-comer",
    mapsQuery: "Restaurant La Loberia Cobquecura",
  },
  {
    name: "Vibras Point / Don Gualo / Entre Lobos",
    area: "Buchupureo",
    driveTime: "8–15 min en auto",
    description: "Polo gastronómico surfista de Buchupureo con cocina de mar y empanadas.",
    category: "donde-comer",
    mapsQuery: "Buchupureo restaurantes Cobquecura",
  },
  {
    name: "Salón Verde / Due Capi / Costa Pucará / El Corralero",
    area: "Buchupureo - Pullay",
    driveTime: "15–20 min en auto",
    description: "Ruta gastronómica entre Buchupureo y Pullay.",
    category: "donde-comer",
    mapsQuery: "Due Capi Buchupureo",
  },

  // Lugares para visitar
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
    name: "Playas Nogueche, Mela y Montezorro",
    area: "Costa Sur",
    driveTime: "10 min al sur",
    description: "Playas tranquilas y extensas ideales para caminar al atardecer.",
    category: "lugares",
    mapsQuery: "Playa Nogueche Cobquecura",
  },
  {
    name: "Iglesia de Piedra",
    area: "Norte de Cobquecura",
    driveTime: "6 min al norte",
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
    driveTime: "12 min en auto",
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
    driveTime: "15–20 min en auto",
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
