"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coffee,
  Compass,
  CreditCard,
  Flame,
  Instagram,
  KeyRound,
  MapPin,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Waves,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TopNav } from "@/components/brand/TopNav";
import { CABIN_MEDIA, GALLERY_ITEMS, type MediaAsset } from "@/lib/media";
import {
  BREAKFAST_OPTIONS,
  FAQ_ITEMS,
  LOCAL_GUIDE_PLACES,
  PET_FRIENDLY_RULES,
  PROPERTY_INFO,
} from "@/lib/guide-data";
import { probeYggdraBookingApi, type YggdraHealthStatus } from "@/lib/api/client";
import { useNoguecheStore } from "@/lib/api/demo-store";
import { addDaysISO, cn, formatCLP, toISODate } from "@/lib/utils";

const EXPLORE_TABS = [
  { id: "lugares", label: "Lugares Icónicos" },
  { id: "donde-comer", label: "Dónde Comer" },
  { id: "excursiones", label: "Excursiones" },
  { id: "experiencias", label: "Experiencias" },
] as const;

export function LandingExperience() {
  const router = useRouter();
  const settings = useNoguecheStore((s) => s.settings);
  const runExpirationSweep = useNoguecheStore((s) => s.runExpirationSweep);

  const today = toISODate(new Date());
  const [quickCheckIn, setQuickCheckIn] = useState(addDaysISO(today, 7));
  const [quickCheckOut, setQuickCheckOut] = useState(addDaysISO(today, 9));
  const [quickAdults, setQuickAdults] = useState(2);

  const [activeTab, setActiveTab] = useState<(typeof EXPLORE_TABS)[number]["id"]>("lugares");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lightboxItem, setLightboxItem] = useState<MediaAsset | null>(null);
  const [apiStatus, setApiStatus] = useState<YggdraHealthStatus | null>(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 140]);
  const heroOpacity = useTransform(scrollY, [0, 550], [1, 0.25]);

  useEffect(() => {
    runExpirationSweep();
    probeYggdraBookingApi().then(setApiStatus);
  }, [runExpirationSweep]);

  const handleQuickReserve = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/reservar?checkIn=${encodeURIComponent(quickCheckIn)}&checkOut=${encodeURIComponent(
        quickCheckOut
      )}&adults=${quickAdults}`
    );
  };

  const filteredPlaces = LOCAL_GUIDE_PLACES.filter((p) => p.category === activeTab);

  return (
    <div className="min-h-screen bg-sand text-ocean">
      <TopNav tone="transparent" />

      {/* =========================================================
          1. HERO INMERSIVO — ATARDECER & PACÍFICO EN COBQUECURA
         ========================================================= */}
      <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden bg-atmosphere-hero pt-24 pb-16">
        {/* Background Photo with Parallax */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <img
            src={CABIN_MEDIA.heroSunset.src}
            alt={CABIN_MEDIA.heroSunset.alt}
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss/80 via-abyss/45 to-abyss/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_25%,rgba(184,107,73,0.38),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(47,72,56,0.48),transparent_60%)]" />
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
          {/* Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark text-cream/90 text-xs tracking-wider uppercase mb-7"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Reserva directa 100% online · Cobquecura, Región de Ñuble
          </motion.div>

          {/* Official Brand Mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="animate-float-slow mb-6"
          >
            <BrandLogo variant="cream" size="xl" className="drop-shadow-[0_12px_40px_rgba(0,0,0,0.5)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-sand max-w-3xl leading-[1.12]"
          >
            Despierta frente al Pacífico en un{" "}
            <span className="text-gradient-sunset italic">refugio íntimo</span> sobre la
            Ruta del Mar
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-5 text-mist/90 text-base sm:text-lg max-w-2xl font-light"
          >
            Consulta fechas disponibles en tiempo real, bloquea tu estadía por 30 minutos
            y confirma con el 50% de abono mediante débito, crédito o transferencia.
          </motion.p>

          {/* Floating Quick Booking Bar */}
          <motion.form
            onSubmit={handleQuickReserve}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-10 w-full max-w-4xl rounded-3xl glass-dark p-3 sm:p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
              <label className="flex flex-col text-left px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/75 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-sunset-glow" /> Llegada (14:00)
                </span>
                <input
                  type="date"
                  min={today}
                  value={quickCheckIn}
                  onChange={(e) => {
                    const nextIn = e.target.value;
                    setQuickCheckIn(nextIn);
                    if (quickCheckOut <= nextIn) {
                      setQuickCheckOut(addDaysISO(nextIn, settings.defaultMinNights));
                    }
                  }}
                  className="bg-transparent text-sand font-medium text-sm mt-1 focus:outline-none [color-scheme:dark]"
                />
              </label>

              <label className="flex flex-col text-left px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/75 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-sunset-glow" /> Salida (13:00)
                </span>
                <input
                  type="date"
                  min={addDaysISO(quickCheckIn, 1)}
                  value={quickCheckOut}
                  onChange={(e) => setQuickCheckOut(e.target.value)}
                  className="bg-transparent text-sand font-medium text-sm mt-1 focus:outline-none [color-scheme:dark]"
                />
              </label>

              <label className="flex flex-col text-left px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cream/75 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-sunset-glow" /> Huéspedes
                </span>
                <select
                  value={quickAdults}
                  onChange={(e) => setQuickAdults(Number(e.target.value))}
                  className="bg-transparent text-sand font-medium text-sm mt-1 focus:outline-none [&>option]:bg-abyss"
                >
                  <option value={1}>1 persona</option>
                  <option value={2}>2 personas (Pareja)</option>
                </select>
              </label>

              <button
                type="submit"
                className="h-full min-h-[58px] rounded-2xl bg-sunset hover:bg-sunset-glow text-sand font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_12px_30px_rgba(184,107,73,0.45)] hover:-translate-y-0.5 cursor-pointer"
              >
                Ver Fechas y Tarifas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 px-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-mist/75">
              <span>
                Estadía mínima: <strong className="text-cream">{settings.defaultMinNights} noches</strong>{" "}
                · Desde <strong className="text-cream">{formatCLP(settings.baseNightlyRate)}</strong> / noche
              </span>
              {apiStatus && (
                <span className="inline-flex items-center gap-1.5 text-cream/70">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      apiStatus.mode === "yggdra" ? "bg-emerald-400" : "bg-amber-300"
                    )}
                  />
                  {apiStatus.reason}
                </span>
              )}
            </div>
          </motion.form>
        </div>

        {/* Bottom Wave Fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-sand to-transparent pointer-events-none" />
      </section>

      {/* =========================================================
          2. BENTO DE EXPERIENCIA — MATICES DE MAR, BOSQUE Y ARENA
         ========================================================= */}
      <section className="py-20 sm:py-28 bg-atmosphere-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.26em] text-sunset font-semibold">
                El Espacio
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-ocean mt-2 leading-tight">
                Pensado para el descanso, la calma y la vista al océano
              </h2>
            </div>
            <p className="text-ocean/70 max-w-md text-sm sm:text-base leading-relaxed">
              {PROPERTY_INFO.regionSummary} Ideal para desconectarse en pareja o en solitario,
              con todo listo para tu llegada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Card 1: Large Feature */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-7 relative rounded-3xl overflow-hidden min-h-[380px] group shadow-xl"
            >
              <img
                src={CABIN_MEDIA.cabinExterior.src}
                alt={CABIN_MEDIA.cabinExterior.alt}
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-abyss/30 to-transparent" />
              <div className="relative z-10 h-full p-7 sm:p-9 flex flex-col justify-end text-sand">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-cream mb-2">
                  <Waves className="w-3.5 h-3.5" /> Capacidad & Confort
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-medium">
                  Cama King frente al horizonte
                </h3>
                <p className="text-mist/90 text-sm sm:text-base mt-2 max-w-lg">
                  {PROPERTY_INFO.capacitySummary}
                </p>
              </div>
            </motion.div>

            {/* Card 2: Forest Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-5 rounded-3xl bg-atmosphere-forest text-sand p-7 sm:p-9 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/10 text-cream text-xs font-medium tracking-wider uppercase">
                  Check-in & Salida
                </span>
                <Sun className="w-6 h-6 text-cream/80" />
              </div>
              <div className="my-8 space-y-4">
                <div className="flex items-baseline justify-between border-b border-white/15 pb-3">
                  <span className="text-mist/80 text-sm">Check-in</span>
                  <span className="font-serif text-3xl text-cream">Desde {PROPERTY_INFO.checkInTime}</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/15 pb-3">
                  <span className="text-mist/80 text-sm">Check-out</span>
                  <span className="font-serif text-3xl text-cream">Hasta {PROPERTY_INFO.checkOutTime}</span>
                </div>
                <p className="text-xs text-mist/80 leading-relaxed">
                  {PROPERTY_INFO.lateCheckOutNote}
                </p>
              </div>
              <Link
                href="/reservar"
                className="inline-flex items-center gap-2 text-cream font-semibold text-sm hover:gap-3 transition-all"
              >
                Consultar fechas disponibles <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Card 3: Desayunos */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="md:col-span-6 rounded-3xl bg-white border border-ocean/10 p-7 sm:p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-sunset/12 text-sunset flex items-center justify-center">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-sunset font-semibold">
                    Servicio Opcional
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-ocean">
                    Despierta mirando el mar con desayuno listo
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                {BREAKFAST_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    className="rounded-2xl bg-sand/70 p-4 border border-ocean/8"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-ocean text-sm">{opt.name}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-forest text-sand">
                        {formatCLP(opt.pricePerPerson)} pp
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-ocean/75">
                      {opt.items.map((it) => (
                        <li key={it} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-sunset" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card 4: Pet Friendly + Fogón */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-6 rounded-3xl bg-ocean text-sand p-7 sm:p-8 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream/15 text-cream text-xs font-semibold">
                    <PawPrint className="w-3.5 h-3.5" /> Pet Friendly
                  </div>
                  <Flame className="w-5 h-5 text-sunset-glow" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-cream">
                  Ven con tu mascota y disfruta la terraza y el fogón
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-mist/90">
                  {PET_FRIENDLY_RULES.conditions.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sunset-glow shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-5 pt-4 border-t border-white/10 text-[11px] text-mist/70">
                Por seguridad y convivencia no se admiten razas de manejo especial:{" "}
                {PET_FRIENDLY_RULES.restrictedBreeds.join(", ")}.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. GALERÍA VISUAL INTERACTIVA (FOTOS DE PRUEBA REEMPLAZABLES)
         ========================================================= */}
      <section className="py-20 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.26em] text-forest font-semibold">
                Galería
              </span>
              <h2 className="font-serif text-4xl font-semibold text-ocean mt-1">
                Atmósferas de Mirador de Nogueche
              </h2>
            </div>
            <span className="text-xs text-forest bg-forest/10 px-3 py-1.5 rounded-full self-start sm:self-auto font-medium">
              Fotografías reales extraídas de la Guía Digital 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY_ITEMS.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                onClick={() => setLightboxItem(item)}
                className="group relative aspect-[4/3] rounded-3xl overflow-hidden text-left shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss/80 via-abyss/15 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full glass-dark text-cream text-[11px] font-medium">
                  {item.tag}
                </div>
                <div className="absolute bottom-4 inset-x-4">
                  <p className="font-serif text-xl text-sand leading-snug">{item.caption}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          4. PROCESO AUTÓNOMO DE RESERVA (4 PASOS TRANSPARENTES)
         ========================================================= */}
      <section className="py-24 bg-atmosphere-sunset text-sand relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.28em] text-cream font-semibold">
              Reserva Autónoma en Tiempo Real
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium text-sand mt-2">
              Simple, inmediata y sin esperas
            </h2>
            <p className="text-mist/85 mt-3 text-sm sm:text-base">
              Todo el proceso ocurre desde este enlace: disponibilidad real, bloqueo seguro
              en servidor, pago del 50% y acceso a tu guía digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: "01",
                icon: Calendar,
                title: "Elige tus fechas",
                desc: `Calendario en vivo con estadía mínima de ${settings.defaultMinNights} noches y cálculo inmediato de tarifa y extras.`,
              },
              {
                step: "02",
                icon: Clock,
                title: "Bloqueo seguro 30 min",
                desc: "Tus fechas quedan reservadas en el servidor durante 30 minutos para evitar duplicados, con aviso al faltar 5 minutos.",
              },
              {
                step: "03",
                icon: CreditCard,
                title: "Abona el 50%",
                desc: "Paga con Tarjeta de Débito, Crédito o Transferencia bancaria validada. Confirmación automática al aprobarse.",
              },
              {
                step: "04",
                icon: KeyRound,
                title: "Saldo 50% y llaves",
                desc: "Antes de llegar abonas el 50% restante y se desbloquean automáticamente la dirección exacta, llaves y Wi-Fi.",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="rounded-3xl glass-dark p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-3xl text-cream/80">{item.step}</span>
                    <div className="w-10 h-10 rounded-2xl bg-sunset/25 text-cream flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl text-sand font-medium mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-mist/80 leading-relaxed">{item.desc}</p>
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
          5. EXPLORA COBQUECURA — CONTENIDO REAL DE LA GUÍA 2026
         ========================================================= */}
      <section className="py-24 bg-atmosphere-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.26em] text-sunset font-semibold">
                Entorno · Costa de Ñuble
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-ocean mt-2">
                A minutos de los mejores rincones de Cobquecura
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {EXPLORE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                    activeTab === tab.id
                      ? "bg-forest text-sand shadow-md"
                      : "bg-white/80 text-ocean/75 hover:bg-white border border-ocean/10"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredPlaces.slice(0, 6).map((place) => (
                <div
                  key={place.name}
                  className="rounded-3xl bg-white/90 border border-ocean/8 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow"
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
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* =========================================================
          6. PREGUNTAS FRECUENTES
         ========================================================= */}
      <section className="py-20 bg-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.26em] text-forest font-semibold">
              Preguntas Frecuentes
            </span>
            <h2 className="font-serif text-4xl font-semibold text-ocean mt-2">
              Todo claro antes de tu viaje
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const open = openFaq === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl bg-white border border-ocean/10 overflow-hidden"
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
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-5 text-sm text-ocean/75 leading-relaxed border-t border-ocean/5 pt-3">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          7. FOOTER EDITORIAL OSCURO CON LOGO DORADO
         ========================================================= */}
      <footer className="bg-abyss text-sand pt-16 pb-10 border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            <div className="md:col-span-5">
              <BrandLogo variant="gold" size="lg" className="mb-4" />
              <p className="text-sm text-mist/75 max-w-sm leading-relaxed">
                Cabaña frente al mar en sector Nogueche, Cobquecura. Anfitriona:{" "}
                <strong className="text-cream">{PROPERTY_INFO.hostName}</strong>.
              </p>
              <div className="mt-5 flex items-center gap-3">
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
                    Panel de Administración (Anfitriona)
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
                  Bloqueo de fechas del lado del servidor, conciliación segura de pagos
                  Flow.cl / transferencias y confirmaciones automatizadas.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-mist/55">
            <span>© 2026 Cabaña Mirador de Nogueche · Cobquecura, Chile.</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sunset-glow" />
              Powered by Yggdra
            </span>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
            className="fixed inset-0 z-50 bg-abyss/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full rounded-3xl overflow-hidden bg-abyss border border-cream/20 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-abyss/70 text-cream hover:bg-sunset transition-colors cursor-pointer"
                aria-label="Cerrar imagen"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={lightboxItem.src}
                alt={lightboxItem.alt}
                className="w-full max-h-[75vh] object-cover"
              />
              <div className="p-5 flex items-center justify-between text-sand">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-cream">
                    {lightboxItem.tag}
                  </span>
                  <p className="font-serif text-2xl">{lightboxItem.caption}</p>
                </div>
                <Compass className="w-5 h-5 text-sunset-glow" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
