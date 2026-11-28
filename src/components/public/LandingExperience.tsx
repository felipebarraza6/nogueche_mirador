"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  CreditCard,
  Expand,
  ExternalLink,
  Home,
  Instagram,
  KeyRound,
  MapPin,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Waves,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TopNav } from "@/components/brand/TopNav";
import {
  ScrollReveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import {
  BOUTIQUE_GALLERY,
  CABIN_MEDIA,
  CASA_MIRADOR_GALLERY,
  GALLERY_ITEMS,
  type MediaAsset,
} from "@/lib/media";
import {
  ACCOMMODATION_LIST,
  BREAKFAST_OPTIONS,
  FAQ_ITEMS,
  LOCAL_GUIDE_PLACES,
  OFFICIAL_POLICIES,
  PROPERTY_INFO,
} from "@/lib/guide-data";
import { probeYggdraBookingApi, type YggdraHealthStatus } from "@/lib/api/client";
import { useNoguecheStore } from "@/lib/api/demo-store";
import type { AccommodationId } from "@/lib/api/types";
import { addDaysISO, assetPath, cn, formatCLP, toISODate } from "@/lib/utils";

const EXPLORE_TABS = [
  { id: "lugares", label: "Lugares Icónicos" },
  { id: "donde-comer", label: "Dónde Comer" },
  { id: "excursiones", label: "Excursiones" },
  { id: "experiencias", label: "Experiencias" },
] as const;

const GALLERY_FILTERS = [
  { id: "all", label: "Todas" },
  { id: "boutique", label: "Cabaña Boutique" },
  { id: "casa-mirador", label: "Casa Mirador" },
  { id: "entorno", label: "Entorno & Playa" },
] as const;

const HERO_SCENES = [
  {
    id: "pacifico",
    src: assetPath("/photos/hero-pacifico-real.jpg"),
    alt: "Atardecer real sobre el Océano Pacífico en Cobquecura",
    label: "Pacífico al Atardecer",
  },
  {
    id: "terraza",
    src: assetPath("/photos/boutique/atardecer-terraza.jpg"),
    alt: "Luz dorada del atardecer desde la terraza de Mirador de Nogueche",
    label: "Luz desde la Terraza",
  },
  {
    id: "playa",
    src: assetPath("/photos/casa-mirador/playa-atardecer.jpg"),
    alt: "Playa de Nogueche al atardecer a 5 minutos caminando",
    label: "Playa Nogueche · 5 min",
  },
];

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export function LandingExperience() {
  const router = useRouter();
  const settings = useNoguecheStore((s) => s.settings);
  const runExpirationSweep = useNoguecheStore((s) => s.runExpirationSweep);

  const today = toISODate(new Date());
  const [quickUnit, setQuickUnit] = useState<AccommodationId>("cabana-boutique");
  const [quickCheckIn, setQuickCheckIn] = useState(addDaysISO(today, 7));
  const [quickCheckOut, setQuickCheckOut] = useState(addDaysISO(today, 9));
  const [quickAdults, setQuickAdults] = useState(2);

  const [heroSceneIdx, setHeroSceneIdx] = useState(0);
  const [activeCovers, setActiveCovers] = useState<Record<AccommodationId, number>>({
    "cabana-boutique": 0,
    "casa-mirador": 0,
  });

  const [activeTab, setActiveTab] = useState<(typeof EXPLORE_TABS)[number]["id"]>("lugares");
  const [galleryFilter, setGalleryFilter] =
    useState<(typeof GALLERY_FILTERS)[number]["id"]>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lightboxList, setLightboxList] = useState<MediaAsset[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number>(0);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [videoModal, setVideoModal] = useState<{ src: string; title: string } | null>(null);
  const [apiStatus, setApiStatus] = useState<YggdraHealthStatus | null>(null);

  const lightboxItem = lightboxList[lightboxIdx] || null;
  const openLightbox = (list: MediaAsset[], item: MediaAsset) => {
    const idx = list.findIndex((x) => x.id === item.id);
    setLightboxList(list);
    setLightboxIdx(idx >= 0 ? idx : 0);
  };
  const closeLightbox = () => setLightboxList([]);
  const stepLightbox = (delta: number) => {
    if (lightboxList.length <= 1) return;
    setLightboxIdx((prev) => (prev + delta + lightboxList.length) % lightboxList.length);
  };

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 26,
    restDelta: 0.001,
  });
  const heroBgY = useTransform(scrollY, [0, 800], [0, 160]);
  const heroContentY = useTransform(scrollY, [0, 600], [0, 48]);
  const heroContentOpacity = useTransform(scrollY, [0, 520], [1, 0.25]);

  useEffect(() => {
    runExpirationSweep();
    probeYggdraBookingApi().then(setApiStatus);
  }, [runExpirationSweep]);

  // Smooth cinematic backdrop crossfade every 7 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setHeroSceneIdx((prev) => (prev + 1) % HERO_SCENES.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  // Show floating mobile CTA & desktop WhatsApp comfort button after scrolling past hero
  useEffect(() => {
    const onScroll = () => setShowFloatingBar(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard navigation + body scroll lock for Lightbox & Video modal
  useEffect(() => {
    if (!lightboxItem && !videoModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxList([]);
        setVideoModal(null);
      } else if (lightboxItem && e.key === "ArrowRight") {
        setLightboxIdx((prev) => (prev + 1) % lightboxList.length);
      } else if (lightboxItem && e.key === "ArrowLeft") {
        setLightboxIdx((prev) => (prev - 1 + lightboxList.length) % lightboxList.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxItem, lightboxList.length, videoModal]);

  const handleQuickReserve = (e: React.FormEvent) => {
    e.preventDefault();
    const maxAllowed = quickUnit === "cabana-boutique" ? 2 : 6;
    const safeAdults = Math.min(quickAdults, maxAllowed);
    router.push(
      `/reservar?unit=${encodeURIComponent(quickUnit)}&checkIn=${encodeURIComponent(
        quickCheckIn
      )}&checkOut=${encodeURIComponent(quickCheckOut)}&adults=${safeAdults}`
    );
  };

  const filteredPlaces = LOCAL_GUIDE_PLACES.filter((p) => p.category === activeTab);

  const filteredGallery =
    galleryFilter === "all"
      ? GALLERY_ITEMS
      : galleryFilter === "boutique"
      ? BOUTIQUE_GALLERY
      : galleryFilter === "casa-mirador"
      ? CASA_MIRADOR_GALLERY
      : GALLERY_ITEMS.filter((g) => g.category === "entorno");

  const currentScene = HERO_SCENES[heroSceneIdx];

  return (
    <div className="min-h-screen bg-sand text-ocean relative">
      {/* Live Top Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sunset via-cream to-forest origin-left z-[60] pointer-events-none"
      />

      <TopNav tone="transparent" />

      {/* =========================================================
          1. HERO INMERSIVO VIVO — ATARDECER REAL EN NOGUECHE
         ========================================================= */}
      <section className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden bg-abyss pt-28 pb-10">
        {/* Vibrant Crossfading Photo Backdrop with Ken Burns & Parallax */}
        <motion.div
          style={{ y: heroBgY }}
          className="absolute inset-0 pointer-events-none"
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={currentScene.id}
              src={currentScene.src}
              alt={currentScene.alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.84 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-center saturate-[1.18] contrast-[1.06] animate-ken-burns"
            />
          </AnimatePresence>

          {/* Balanced atmospheric scrim: keeps sunset warm & vivid while preserving crisp text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/28 to-abyss/82" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_42%,rgba(14,22,28,0.48),transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_80%_22%,rgba(212,137,100,0.28),transparent_65%)]" />
        </motion.div>

        {/* Main Hero Content */}
        <motion.div
          style={{ y: heroContentY, opacity: heroContentOpacity }}
          className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center py-6"
        >
          {/* Live Location Pill */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-dark text-cream text-[11px] sm:text-xs font-medium tracking-[0.16em] uppercase mb-5 shadow-lg"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            A 5 min caminando de la playa · Cobquecura, Ñuble
          </motion.div>

          {/* Brand Emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            className="animate-float-slow mb-4"
          >
            <BrandLogo
              variant="cream"
              size="lg"
              className="drop-shadow-[0_14px_36px_rgba(0,0,0,0.65)]"
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.12, ease: EASE_OUT_EXPO }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-medium tracking-tight text-sand max-w-4xl leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
          >
            Naturaleza, tranquilidad y{" "}
            <span className="text-gradient-sunset italic">descanso junto al mar</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: EASE_OUT_EXPO }}
            className="mt-4 text-sand/90 text-sm sm:text-base md:text-lg max-w-2xl font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          >
            Reserva directo en{" "}
            <strong className="font-semibold text-cream">Cabaña Boutique (1–2 pers.)</strong> o{" "}
            <strong className="font-semibold text-cream">Casa Mirador (1–6 pers.)</strong> con
            calendarios independientes y abono online del 50%.
          </motion.p>

          {/* Floating Quick Booking Bar — Well-proportioned, zero text truncation */}
          <motion.form
            onSubmit={handleQuickReserve}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.32, ease: EASE_OUT_EXPO }}
            className="mt-8 w-full max-w-5xl rounded-3xl glass-dark p-3 sm:p-4 shadow-[0_28px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.55fr_1fr_1fr_0.95fr_1.05fr] gap-2.5 items-stretch">
              <label className="flex flex-col justify-center text-left px-4 py-3 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] transition-colors border border-white/15">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/80 flex items-center gap-1.5 font-semibold">
                  <Home className="w-3 h-3 text-sunset-glow shrink-0" /> Alojamiento
                </span>
                <select
                  value={quickUnit}
                  onChange={(e) => {
                    const next = e.target.value as AccommodationId;
                    setQuickUnit(next);
                    if (next === "cabana-boutique" && quickAdults > 2) {
                      setQuickAdults(2);
                    }
                  }}
                  className="bg-transparent text-sand font-semibold text-sm mt-1 focus:outline-none [&>option]:bg-abyss w-full cursor-pointer"
                >
                  <option value="cabana-boutique">Cabaña Boutique · 1–2 pers.</option>
                  <option value="casa-mirador">Casa Mirador · 1–6 pers.</option>
                </select>
              </label>

              <label className="flex flex-col justify-center text-left px-4 py-3 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] transition-colors border border-white/15">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/80 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3 h-3 text-sunset-glow shrink-0" /> Ingreso (15:00)
                </span>
                <input
                  type="date"
                  min={today}
                  value={quickCheckIn}
                  onChange={(e) => {
                    const nextIn = e.target.value;
                    setQuickCheckIn(nextIn);
                    if (quickCheckOut <= nextIn) {
                      setQuickCheckOut(addDaysISO(nextIn, 2));
                    }
                  }}
                  className="bg-transparent text-sand font-semibold text-sm mt-1 focus:outline-none [color-scheme:dark] w-full"
                />
              </label>

              <label className="flex flex-col justify-center text-left px-4 py-3 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] transition-colors border border-white/15">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/80 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3 h-3 text-sunset-glow shrink-0" /> Salida (12:00)
                </span>
                <input
                  type="date"
                  min={addDaysISO(quickCheckIn, 1)}
                  value={quickCheckOut}
                  onChange={(e) => setQuickCheckOut(e.target.value)}
                  className="bg-transparent text-sand font-semibold text-sm mt-1 focus:outline-none [color-scheme:dark] w-full"
                />
              </label>

              <label className="flex flex-col justify-center text-left px-4 py-3 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] transition-colors border border-white/15">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/80 flex items-center gap-1.5 font-semibold">
                  <Users className="w-3 h-3 text-sunset-glow shrink-0" /> Huéspedes
                </span>
                <select
                  value={quickAdults}
                  onChange={(e) => setQuickAdults(Number(e.target.value))}
                  className="bg-transparent text-sand font-semibold text-sm mt-1 focus:outline-none [&>option]:bg-abyss w-full cursor-pointer"
                >
                  <option value={1}>1 persona</option>
                  <option value={2}>2 personas</option>
                  {quickUnit === "casa-mirador" && (
                    <>
                      <option value={3}>3 personas</option>
                      <option value={4}>4 personas</option>
                      <option value={5}>5 personas</option>
                      <option value={6}>6 personas</option>
                    </>
                  )}
                </select>
              </label>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="min-h-[60px] rounded-2xl bg-gradient-to-r from-sunset to-sunset-glow hover:from-sunset-glow hover:to-sunset text-sand font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_14px_34px_rgba(184,107,73,0.5)] cursor-pointer px-5"
              >
                Ver Fechas
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="mt-3 px-2 flex flex-wrap items-center justify-center sm:justify-between gap-2 text-[11px] text-sand/75">
              <span>
                Temporada Alta 2026–2027 · Cabaña Boutique{" "}
                <strong className="text-cream">{formatCLP(settings.rates.boutique1To2)}</strong>{" "}
                · Casa Mirador desde{" "}
                <strong className="text-cream">{formatCLP(settings.rates.casa1To2)}</strong> /
                noche
              </span>
              <span className="text-cream/75">
                Mín. 2 noches · Bloqueo {settings.holdDurationMinutes} min · Abono 50%
              </span>
            </div>
          </motion.form>
        </motion.div>

        {/* Bottom Hero Bar: Scene Selector + Smooth Scroll Cue */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          {/* Scene Switcher Pills */}
          <div className="flex items-center gap-2">
            {HERO_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setHeroSceneIdx(idx)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5",
                  heroSceneIdx === idx
                    ? "bg-cream text-abyss font-semibold shadow-md"
                    : "bg-abyss/50 text-sand/75 hover:text-cream border border-white/15 backdrop-blur-md"
                )}
              >
                <Waves className="w-3 h-3" />
                <span className="hidden sm:inline">{scene.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Animated Scroll Indicator */}
          <a
            href="#alojamientos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-abyss/55 hover:bg-abyss/80 text-cream text-xs font-semibold tracking-wider uppercase border border-cream/20 backdrop-blur-md transition-colors"
          >
            Explorar alojamientos y tarifas
            <ArrowDown className="w-3.5 h-3.5 text-sunset-glow animate-scroll-bounce" />
          </a>
        </div>
      </section>

      {/* =========================================================
          2. NUESTROS ALOJAMIENTOS & TARIFARIO OFICIAL 2026–2027
         ========================================================= */}
      <section id="alojamientos" className="py-24 sm:py-32 bg-atmosphere-mist scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs uppercase tracking-[0.28em] text-sunset font-bold">
                Dos Alojamientos Independientes
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-ocean mt-2 leading-tight">
                Elige tu espacio y revisa el tarifario oficial
              </h2>
            </div>
            <p className="text-ocean/75 max-w-md text-sm sm:text-base leading-relaxed">
              Temporada alta vigente del{" "}
              <strong className="text-ocean">{OFFICIAL_POLICIES.highSeasonLabel}</strong>.
              Valores en pesos chilenos (CLP), por alojamiento y por noche.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {ACCOMMODATION_LIST.map((acc, idx) => {
              const activePhotoIdx = activeCovers[acc.id] || 0;
              const activePhoto = acc.gallery[activePhotoIdx] || acc.cover;
              return (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 38, scale: 0.97, filter: "blur(6px)" }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.78, delay: idx * 0.14, ease: EASE_OUT_EXPO }}
                  whileHover={{ y: -5 }}
                  className="rounded-3xl glass-card overflow-hidden hover:shadow-[0_28px_70px_-16px_rgba(20,29,36,0.14)] transition-shadow duration-500 flex flex-col justify-between"
                >
                  <div>
                    {/* Interactive Cover Preview + Video & Lightbox Triggers */}
                    <div className="relative aspect-[16/11] overflow-hidden group bg-abyss">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activePhoto.id}
                          src={activePhoto.src}
                          alt={activePhoto.alt}
                          initial={{ opacity: 0.35, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0.35 }}
                          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                      </AnimatePresence>
                      <div className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-abyss/15 to-transparent pointer-events-none" />

                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="px-3.5 py-1.5 rounded-full glass-dark text-cream text-xs font-semibold">
                          {acc.badge}
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openLightbox(acc.gallery, activePhoto)}
                          title="Ampliar foto"
                          className="p-2 rounded-full glass-dark text-cream hover:bg-cream hover:text-abyss transition-colors cursor-pointer"
                        >
                          <Expand className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoModal(acc.video)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sunset hover:bg-sunset-glow text-sand text-xs font-semibold shadow-lg transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Video Tour
                        </button>
                      </div>

                      <div className="absolute bottom-4 inset-x-5 flex items-end justify-between text-sand gap-3">
                        <div>
                          <h3 className="font-serif text-3xl sm:text-4xl font-medium">
                            {acc.name}
                          </h3>
                          <p className="text-xs text-mist/90 mt-0.5">{activePhoto.caption}</p>
                        </div>
                        <div className="text-right shrink-0 bg-abyss/55 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-cream/15">
                          <span className="text-[10px] uppercase tracking-wider text-cream/80 block">
                            Desde
                          </span>
                          <span className="font-serif text-2xl sm:text-3xl font-semibold text-cream leading-none">
                            {formatCLP(
                              acc.id === "cabana-boutique"
                                ? settings.rates.boutique1To2
                                : settings.rates.casa1To2
                            )}
                          </span>
                          <span className="text-[10px] text-mist/80 block">/ noche</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Photo Switcher Strip */}
                    <div className="grid grid-cols-5 gap-2 p-3 bg-sand/60 border-b border-ocean/8">
                      {acc.gallery.slice(0, 5).map((photo, pIdx) => {
                        const isSelected = activePhotoIdx === pIdx;
                        return (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() =>
                              setActiveCovers((prev) => ({ ...prev, [acc.id]: pIdx }))
                            }
                            className={cn(
                              "aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all",
                              isSelected
                                ? "ring-2 ring-sunset ring-offset-2 ring-offset-sand opacity-100 scale-[1.02]"
                                : "opacity-70 hover:opacity-100"
                            )}
                          >
                            <img
                              src={photo.src}
                              alt={photo.alt}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Description + Highlights + Official Rate Table */}
                    <div className="p-6 sm:p-7 space-y-5">
                      <p className="text-sm text-ocean/75 leading-relaxed">{acc.summary}</p>

                      <ul className="space-y-2 text-xs text-ocean/75">
                        {acc.highlights.slice(0, 3).map((h) => (
                          <li key={h} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-forest/80 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Official Tiered Table */}
                      <div className="rounded-2xl bg-sand/55 border border-ocean/[0.06] p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-sunset font-bold mb-2.5">
                          Tarifario Oficial Temporada Alta (por noche)
                        </p>
                        <div className="divide-y divide-ocean/10 text-sm">
                          {acc.tiers.map((tier) => {
                            const livePrice =
                              acc.id === "cabana-boutique"
                                ? settings.rates.boutique1To2
                                : tier.maxGuests <= 2
                                ? settings.rates.casa1To2
                                : tier.maxGuests <= 4
                                ? settings.rates.casa3To4
                                : tier.maxGuests === 5
                                ? settings.rates.casa5
                                : settings.rates.casa6;
                            return (
                              <div
                                key={tier.guestsLabel}
                                className="flex items-center justify-between py-2"
                              >
                                <span className="text-ocean/80 font-medium">
                                  {tier.guestsLabel}
                                </span>
                                <span className="font-bold text-ocean">
                                  {formatCLP(livePrice)}{" "}
                                  <span className="text-xs font-normal text-ocean/55">
                                    / noche
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 sm:px-7 pb-6 sm:pb-7">
                    <Link
                      href={`/reservar?unit=${acc.id}`}
                      className="w-full py-3.5 px-6 rounded-2xl bg-forest hover:bg-sunset text-sand font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Ver Disponibilidad de {acc.name}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Children Policy + Schedule + No Pets Bento */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              className="md:col-span-4 rounded-3xl bg-atmosphere-forest text-sand p-7 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-cream text-xs font-semibold uppercase tracking-wider">
                    Horarios Oficiales
                  </span>
                  <Sun className="w-5 h-5 text-cream/80" />
                </div>
                <div className="space-y-3.5">
                  <div className="flex items-baseline justify-between border-b border-white/15 pb-2.5">
                    <span className="text-mist/80 text-sm">Check-in</span>
                    <span className="font-serif text-2xl text-cream">
                      Desde {PROPERTY_INFO.checkInTime}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-white/15 pb-2.5">
                    <span className="text-mist/80 text-sm">Check-out</span>
                    <span className="font-serif text-2xl text-cream">
                      Hasta {PROPERTY_INFO.checkOutTime}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-white/15 pb-2.5">
                    <span className="text-mist/80 text-sm">Silencio</span>
                    <span className="font-serif text-xl text-cream">
                      {PROPERTY_INFO.quietHours}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-mist/80 mt-5 leading-relaxed">
                {PROPERTY_INFO.scheduleNote}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT_EXPO }}
              className="md:col-span-4 rounded-3xl glass-card p-7 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-sunset font-semibold">
                  Política Tarifaria Niños
                </span>
                <h3 className="font-serif text-2xl font-semibold text-ocean mt-1 mb-3">
                  Tarifas transparentes para familias
                </h3>
                <ul className="space-y-2 text-xs text-ocean/80">
                  {OFFICIAL_POLICIES.childrenPolicy.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 pt-4 border-t border-ocean/10">
                <p className="text-xs font-semibold text-ocean flex items-center gap-1.5 mb-2">
                  <Coffee className="w-4 h-4 text-sunset" /> Desayunos opcionales
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {BREAKFAST_OPTIONS.map((b) => (
                    <span
                      key={b.id}
                      className="px-3 py-1 rounded-full bg-sand text-ocean font-medium border border-ocean/10"
                    >
                      {b.name}: <strong>{formatCLP(b.pricePerPerson)}</strong> pp
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.16, ease: EASE_OUT_EXPO }}
              className="md:col-span-4 rounded-3xl bg-ocean text-sand p-7 shadow-lg flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-400/15 text-cream text-xs font-semibold mb-3">
                  <Ban className="w-3.5 h-3.5 text-sunset-glow" /> No se admiten mascotas
                </div>
                <p className="text-xs text-mist/85 leading-relaxed">
                  {OFFICIAL_POLICIES.noPetsPolicy.summary}{" "}
                  <strong className="text-cream">
                    {OFFICIAL_POLICIES.noPetsPolicy.exception}
                  </strong>
                </p>
              </div>
              <div className="pt-4 border-t border-white/15">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cream font-semibold mb-2">
                  Política de Cancelación
                </p>
                <div className="space-y-1.5 text-xs">
                  {OFFICIAL_POLICIES.cancellationTable.map((row) => (
                    <div key={row.window} className="flex justify-between gap-2">
                      <span className="text-mist/80">{row.window}</span>
                      <span className="font-semibold text-cream shrink-0">{row.refund}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. GALERÍA VISUAL REAL CON TRANSICIONES SUAVES
         ========================================================= */}
      <section className="py-24 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.26em] text-forest font-semibold">
                Fotografías Reales 2026
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-ocean mt-1">
                Conoce cada rincón de Mirador de Nogueche
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {GALLERY_FILTERS.map((f) => {
                const isActive = galleryFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setGalleryFilter(f.id)}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                      isActive
                        ? "text-sand"
                        : "bg-white text-ocean/75 border border-ocean/10 hover:bg-mist/40"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="gallery-tab-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-forest shadow-md -z-0"
                      />
                    )}
                    <span className="relative z-10">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={galleryFilter}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {filteredGallery.map((item, idx) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(idx * 0.045, 0.25),
                    ease: EASE_OUT_EXPO,
                  }}
                  whileHover={{ y: -5 }}
                  onClick={() => openLightbox(filteredGallery, item)}
                  className="group relative aspect-[4/3] rounded-3xl overflow-hidden text-left shadow-md hover:shadow-2xl transition-shadow duration-500 cursor-pointer bg-abyss"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-abyss/15 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full glass-dark text-cream text-[10px] font-semibold">
                    {item.tag}
                  </div>
                  <div className="absolute bottom-3.5 inset-x-3.5">
                    <p className="font-serif text-lg text-sand leading-snug">{item.caption}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* =========================================================
          4. PROCESO AUTÓNOMO DE RESERVA (4 PASOS OFICIALES)
         ========================================================= */}
      <section className="py-24 sm:py-28 bg-atmosphere-sunset text-sand relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs uppercase tracking-[0.28em] text-cream font-semibold">
              Reserva Directa 100% Online
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium text-sand mt-2">
              Simple, transparente y con ingreso autónomo
            </h2>
            <p className="text-mist/85 mt-3 text-sm sm:text-base">
              Disponibilidad independiente por alojamiento, bloqueo de{" "}
              {settings.holdDurationMinutes} minutos y entrega del código de caja de seguridad
              al completar el 100% del pago.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: "01",
                icon: Calendar,
                title: "Elige alojamiento y fechas",
                desc: "Selecciona Cabaña Boutique o Casa Mirador, tus fechas (mín. 2 noches en temporada alta y fines de semana) y cantidad de huéspedes.",
              },
              {
                step: "02",
                icon: Clock,
                title: `Bloqueo seguro ${settings.holdDurationMinutes} min`,
                desc: `Al completar el registro y aceptar condiciones, bloqueamos tus fechas por ${settings.holdDurationMinutes} minutos para evitar reservas duplicadas.`,
              },
              {
                step: "03",
                icon: CreditCard,
                title: "Abona el 50%",
                desc: "Confirma mediante tarjeta de débito, crédito o transferencia bancaria adjuntando tu comprobante para validación.",
              },
              {
                step: "04",
                icon: KeyRound,
                title: "Saldo 50% y caja de llaves",
                desc: "Paga el saldo antes del ingreso y recibe el código de acceso a la caja de seguridad de llaves y el enlace directo a Google Maps.",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.09, ease: EASE_OUT_EXPO }}
                whileHover={{ y: -6 }}
                className="rounded-3xl glass-dark p-6 flex flex-col justify-between transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-3xl text-cream/85">{item.step}</span>
                    <div className="w-10 h-10 rounded-2xl bg-sunset/30 text-cream flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl text-sand font-medium mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-mist/85 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/reservar"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cream text-abyss font-semibold text-sm tracking-wide shadow-2xl hover:bg-sand hover:-translate-y-0.5 transition-all"
            >
              Iniciar mi Reserva Ahora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. EXPLORA COBQUECURA — UBICACIÓN & ENTORNO
         ========================================================= */}
      <section className="py-24 bg-atmosphere-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.26em] text-sunset font-semibold">
                Sector Nogueche · Cobquecura, Ñuble
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-ocean mt-2">
                A 5 min caminando de la playa y 15 min del centro
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {EXPLORE_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                      isActive
                        ? "text-sand"
                        : "bg-white/80 text-ocean/75 hover:bg-white border border-ocean/10"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="explore-tab-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-forest shadow-md -z-0"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.07 },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredPlaces.slice(0, 6).map((place) => (
                <motion.div
                  key={place.name}
                  variants={{
                    hidden: { opacity: 0, y: 24, scale: 0.97, filter: "blur(4px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                      transition: { duration: 0.55, ease: EASE_OUT_EXPO },
                    },
                  }}
                  whileHover={{ y: -5 }}
                  className="rounded-3xl glass-card p-6 flex flex-col justify-between hover:shadow-xl transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold text-forest bg-mist/60 px-3 py-1 rounded-full">
                        {place.driveTime}
                      </span>
                      <span className="text-xs text-ocean/50 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {place.area}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-ocean">
                      {place.name}
                    </h3>
                    <p className="text-sm text-ocean/70 mt-2 leading-relaxed">
                      {place.description}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      place.mapsQuery
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-sunset hover:underline"
                  >
                    Abrir en Google Maps <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* =========================================================
          6. PREGUNTAS FRECUENTES
         ========================================================= */}
      <section className="py-24 bg-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.26em] text-forest font-semibold">
              Preguntas Frecuentes
            </span>
            <h2 className="font-serif text-4xl font-semibold text-ocean mt-2">
              Todo claro antes de tu viaje
            </h2>
          </ScrollReveal>

          <StaggerGroup className="space-y-3" stagger={0.06}>
            {FAQ_ITEMS.map((item, idx) => {
              const open = openFaq === idx;
              return (
                <StaggerItem
                  key={item.q}
                  className="rounded-2xl glass-card overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-semibold text-ocean text-sm sm:text-base">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-sunset shrink-0 transition-transform duration-300",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
                      >
                        <div className="px-6 pb-5 text-sm text-ocean/75 leading-relaxed border-t border-ocean/5 pt-3">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* =========================================================
          7. FOOTER EDITORIAL OSCURO
         ========================================================= */}
      <footer className="bg-abyss text-sand pt-16 pb-10 border-t border-cream/10">
        <ScrollReveal y={26} blur={false} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            <div className="md:col-span-5">
              <BrandLogo variant="gold" size="lg" className="mb-4" />
              <p className="text-sm text-mist/75 max-w-sm leading-relaxed">
                {PROPERTY_INFO.tagline} Cabaña Boutique (1–2 pers.) y Casa Mirador (1–6 pers.)
                en sector Nogueche, Cobquecura, Región de Ñuble.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={PROPERTY_INFO.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest text-sand text-xs font-semibold hover:bg-sunset transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp {PROPERTY_INFO.whatsappDisplay}
                </a>
                <a
                  href={PROPERTY_INFO.mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-cream text-xs font-semibold hover:bg-sunset transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={PROPERTY_INFO.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-white/10 text-cream hover:bg-sunset transition-colors"
                  aria-label="Instagram Mirador de Nogueche"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs uppercase tracking-[0.24em] text-cream font-semibold mb-4">
                Accesos Plataforma
              </h4>
              <ul className="space-y-2.5 text-sm text-mist/80">
                <li>
                  <Link href="/reservar" className="hover:text-cream transition-colors">
                    Motor de Reservas Online
                  </Link>
                </li>
                <li>
                  <Link href="/mi-reserva" className="hover:text-cream transition-colors">
                    Portal del Huésped & Guía Digital
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-cream transition-colors">
                    Panel de Administración
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="text-xs uppercase tracking-[0.24em] text-cream font-semibold mb-4">
                Respaldo Técnico
              </h4>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-xs text-mist/75 space-y-2">
                <p className="flex items-center gap-2 text-cream font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Conectado a ecosistema Yggdra
                </p>
                <p>
                  Calendarios independientes por alojamiento, bloqueo de 15 min, conciliación
                  Flow.cl / transferencias y liberación automática de caja de llaves al 100%.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-mist/55">
            <span>© 2026 Mirador de Nogueche · Cobquecura, Región de Ñuble, Chile.</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sunset-glow" />
              Powered by Yggdra
            </span>
          </div>
        </ScrollReveal>
      </footer>

      {/* Image Lightbox Modal (Portaled to document.body so it always centers in viewport) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {lightboxItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeLightbox}
                className="fixed inset-0 z-[100] bg-abyss/92 backdrop-blur-md flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.94, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-4xl w-full max-h-[90vh] flex flex-col rounded-3xl overflow-hidden bg-abyss border border-cream/20 shadow-2xl"
                >
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-abyss/75 text-cream text-xs font-semibold border border-white/15">
                    {lightboxIdx + 1} / {lightboxList.length}
                  </div>
                  <button
                    type="button"
                    onClick={closeLightbox}
                    className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-abyss/75 text-cream hover:bg-sunset transition-colors cursor-pointer"
                    aria-label="Cerrar imagen"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {lightboxList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => stepLightbox(-1)}
                        aria-label="Foto anterior"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-abyss/75 hover:bg-sunset text-cream transition-colors cursor-pointer border border-white/15"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => stepLightbox(1)}
                        aria-label="Foto siguiente"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-abyss/75 hover:bg-sunset text-cream transition-colors cursor-pointer border border-white/15"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.img
                      key={lightboxItem.id}
                      src={lightboxItem.src}
                      alt={lightboxItem.alt}
                      initial={{ opacity: 0.4, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.4 }}
                      transition={{ duration: 0.25 }}
                      className="w-full max-h-[72vh] object-contain bg-abyss"
                    />
                  </AnimatePresence>
                  <div className="p-4 sm:p-5 flex items-center justify-between text-sand border-t border-white/10 shrink-0">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-cream">
                        {lightboxItem.tag}
                      </span>
                      <p className="font-serif text-xl sm:text-2xl">{lightboxItem.caption}</p>
                    </div>
                    <Compass className="w-5 h-5 text-sunset-glow shrink-0" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Video Tour Modal (Portaled to document.body, sized for vertical & horizontal videos without scrolling) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {videoModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setVideoModal(null)}
                className="fixed inset-0 z-[100] bg-abyss/92 backdrop-blur-md flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.94, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-md sm:max-w-lg max-h-[90vh] flex flex-col rounded-3xl overflow-hidden bg-abyss border border-cream/20 shadow-2xl"
                >
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 text-sand shrink-0">
                    <p className="font-serif text-lg sm:text-xl truncate pr-3">
                      {videoModal.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => setVideoModal(null)}
                      className="p-2 rounded-full bg-white/10 text-cream hover:bg-sunset transition-colors cursor-pointer shrink-0"
                      aria-label="Cerrar video"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-black flex items-center justify-center overflow-hidden">
                    <video
                      src={videoModal.src}
                      controls
                      autoPlay
                      playsInline
                      className="w-full max-h-[76vh] object-contain"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Mobile Floating Thumb-Zone Conversion Bar */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="fixed bottom-0 inset-x-0 z-40 md:hidden px-3 pb-3 pt-2 pointer-events-none"
          >
            <div className="pointer-events-auto rounded-2xl glass-dark shadow-[0_-10px_40px_rgba(0,0,0,0.35)] px-3.5 py-2.5 flex items-center justify-between gap-2.5">
              <div className="text-sand leading-tight">
                <span className="text-[10px] uppercase tracking-wider text-cream/80 block">
                  Desde / noche
                </span>
                <span className="font-serif text-xl font-semibold text-cream">
                  {formatCLP(settings.rates.boutique1To2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={PROPERTY_INFO.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="h-11 w-11 rounded-xl bg-forest text-sand flex items-center justify-center shadow-md"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <Link
                  href="/reservar"
                  className="h-11 px-5 rounded-xl bg-sunset text-sand font-semibold text-xs flex items-center gap-1.5 shadow-md"
                >
                  Reservar <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Floating WhatsApp Comfort Pill */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.a
            href={PROPERTY_INFO.whatsappHref}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="hidden md:inline-flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 rounded-full bg-forest hover:bg-sunset text-sand text-xs font-semibold shadow-[0_14px_34px_rgba(18,28,34,0.35)] border border-cream/20 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-cream" />
            <span>¿Dudas? WhatsApp</span>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
