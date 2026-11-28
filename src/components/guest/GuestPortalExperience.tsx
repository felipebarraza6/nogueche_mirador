"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Copy,
  CreditCard,
  ExternalLink,
  KeyRound,
  Lock,
  MapPin,
  MessageCircle,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tv,
  Unlock,
  Wifi,
} from "lucide-react";
import { useNoguecheStore } from "@/lib/api/demo-store";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import {
  BREAKFAST_OPTIONS,
  FRENCH_PRESS_STEPS,
  HOUSE_RULES,
  LOCAL_GUIDE_PLACES,
  OFFICIAL_POLICIES,
  OTHER_AMENITIES,
  PROPERTY_INFO,
  TV_BOX_STEPS,
} from "@/lib/guide-data";
import { cn, formatCLP, formatDateLongES } from "@/lib/utils";
import { CABIN_MEDIA } from "@/lib/media";
import type { ReservationStatus } from "@/lib/api/types";

const STATUS_META: Record<ReservationStatus, { label: string; tone: string }> = {
  HOLD: { label: "Bloqueo temporal 15 min", tone: "bg-amber-100 text-amber-900" },
  PAYMENT_PROCESSING: {
    label: "Verificando pago Flow",
    tone: "bg-sky-100 text-sky-900",
  },
  PENDING_TRANSFER_VALIDATION: {
    label: "Transferencia en validación",
    tone: "bg-amber-100 text-amber-900",
  },
  CONFIRMED_DEPOSIT: {
    label: "Confirmada · 50% Abonado",
    tone: "bg-emerald-100 text-emerald-900",
  },
  CONFIRMED_FULL: {
    label: "100% Pagada · Acceso Liberado",
    tone: "bg-forest text-sand",
  },
  CANCELLED: { label: "Cancelada", tone: "bg-red-100 text-red-900" },
  EXPIRED: { label: "Expirada", tone: "bg-stone-200 text-stone-700" },
};

const GUIDE_TABS = [
  { id: "acceso", label: "Acceso & Caja de Llaves" },
  { id: "cabana", label: "Uso del Alojamiento" },
  { id: "reglas", label: "Normas & Políticas" },
  { id: "entorno", label: "Guía Cobquecura" },
] as const;

export function GuestPortalExperience() {
  const params = useSearchParams();
  const initialCode = params.get("code") || "NOG-2026-512";

  const reservations = useNoguecheStore((s) => s.reservations);
  const payBalanceFlow = useNoguecheStore((s) => s.payBalanceFlow);
  const submitBalanceTransfer = useNoguecheStore((s) => s.submitBalanceTransfer);

  const [lookupCode, setLookupCode] = useState(initialCode);
  const [selectedCode, setSelectedCode] = useState(initialCode);
  const [guideTab, setGuideTab] = useState<(typeof GUIDE_TABS)[number]["id"]>("acceso");
  const [placeFilter, setPlaceFilter] = useState<string>("all");
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedLockbox, setCopiedLockbox] = useState(false);

  const [showBalanceTransfer, setShowBalanceTransfer] = useState(false);
  const [balanceRef, setBalanceRef] = useState("");
  const [balanceBank, setBalanceBank] = useState("Banco Estado");

  const reservation = useMemo(
    () =>
      reservations.find(
        (r) => r.code.toUpperCase() === selectedCode.trim().toUpperCase()
      ) || null,
    [reservations, selectedCode]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCode(lookupCode.trim());
  };

  const handleCopyWifi = () => {
    navigator.clipboard?.writeText(PROPERTY_INFO.wifi.password);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 1800);
  };

  const visiblePlaces =
    placeFilter === "all"
      ? LOCAL_GUIDE_PLACES
      : LOCAL_GUIDE_PLACES.filter((p) => p.category === placeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-8">
      {/* Header + Reservation Lookup */}
      <div className="rounded-3xl bg-atmosphere-forest text-sand p-7 sm:p-9 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.26em] text-cream font-semibold">
              Portal del Huésped · Ingreso Autónomo
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium mt-1">
              Gestiona tu estadía en Mirador de Nogueche
            </h1>
            <p className="text-mist/85 text-sm mt-2 max-w-xl">
              Consulta el estado de tu reserva, paga el saldo pendiente del 50% para liberar el
              código de la caja de seguridad de llaves y revisa nuestra guía de Cobquecura.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto"
          >
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-cream/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                placeholder="Ej. NOG-2026-512"
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-sand placeholder:text-mist/50 text-sm focus:outline-none focus:border-cream"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-cream text-abyss font-semibold text-sm hover:bg-sand transition-colors cursor-pointer"
            >
              Consultar
            </button>
          </form>
        </div>

        {/* Quick demo switchers */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-mist/70">Reservas demo para probar:</span>
          {reservations.slice(0, 4).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setLookupCode(r.code);
                setSelectedCode(r.code);
              }}
              className={cn(
                "px-3 py-1 rounded-full transition-colors cursor-pointer",
                reservation?.code === r.code
                  ? "bg-sunset text-sand font-semibold"
                  : "bg-white/10 text-cream/85 hover:bg-white/20"
              )}
            >
              {r.code} · {r.accommodationName} (
              {r.status === "CONFIRMED_FULL"
                ? "100%"
                : r.status === "CONFIRMED_DEPOSIT"
                ? "50%"
                : r.status === "PENDING_TRANSFER_VALIDATION"
                ? "Transf."
                : "Hold"}
              )
            </button>
          ))}
        </div>
      </div>

      {/* Reservation State & Financial Summary */}
      {reservation ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Status + Payment Balance */}
          <ScrollReveal y={24} className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl glass-card p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-sunset font-bold block">
                    {reservation.accommodationName} · {reservation.code}
                  </span>
                  <h2 className="font-serif text-3xl font-semibold text-ocean">
                    {reservation.guestName}
                  </h2>
                  <p className="text-xs text-ocean/60 mt-0.5">
                    {reservation.guestDocument} · {reservation.guestCity}
                  </p>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold shrink-0",
                    STATUS_META[reservation.status].tone
                  )}
                >
                  {STATUS_META[reservation.status].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-sand/70 p-3.5">
                  <span className="text-ocean/55 uppercase tracking-wider text-[10px] block">
                    Check-in · 15:00 hrs
                  </span>
                  <span className="font-semibold text-ocean mt-0.5 block capitalize">
                    {formatDateLongES(reservation.checkIn)}
                  </span>
                </div>
                <div className="rounded-2xl bg-sand/70 p-3.5">
                  <span className="text-ocean/55 uppercase tracking-wider text-[10px] block">
                    Check-out · 12:00 hrs
                  </span>
                  <span className="font-semibold text-ocean mt-0.5 block capitalize">
                    {formatDateLongES(reservation.checkOut)}
                  </span>
                </div>
              </div>

              {/* Financial breakdown */}
              <div className="rounded-2xl bg-sand/60 p-4 space-y-2 text-sm border border-ocean/8">
                <div className="flex justify-between text-ocean/75">
                  <span>
                    {reservation.accommodationName} ({reservation.nights} noches ·{" "}
                    {reservation.adults} ad.
                    {reservation.children7Plus > 0
                      ? ` + ${reservation.children7Plus} (7+)`
                      : ""}
                    {reservation.children2To6 > 0
                      ? ` + ${reservation.children2To6} (2–6)`
                      : ""}
                    {reservation.childrenUnder2 > 0
                      ? ` + ${reservation.childrenUnder2} (<2)`
                      : ""}
                    )
                  </span>
                  <span className="font-semibold">{formatCLP(reservation.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Abonado a la fecha</span>
                  <span className="font-semibold">{formatCLP(reservation.paidAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-ocean/10 font-bold text-base">
                  <span className="text-ocean">Saldo pendiente</span>
                  <span
                    className={
                      reservation.balanceDue > 0 ? "text-sunset" : "text-emerald-700"
                    }
                  >
                    {formatCLP(reservation.balanceDue)}
                  </span>
                </div>
              </div>

              {/* Pay Remaining 50% Balance Box */}
              {reservation.status === "CONFIRMED_DEPOSIT" && reservation.balanceDue > 0 && (
                <div className="rounded-2xl bg-sunset/10 border border-sunset/25 p-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-sunset flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Pago del saldo pendiente (50%)
                    </p>
                    <p className="text-xs text-ocean/80 mt-1">
                      Completa el saldo de{" "}
                      <strong>{formatCLP(reservation.balanceDue)}</strong> antes del ingreso
                      para liberar automáticamente el código de la caja de seguridad de llaves.
                    </p>
                  </div>

                  {!showBalanceTransfer ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => payBalanceFlow(reservation.id, "FLOW_DEBIT")}
                          className="py-3 px-3 rounded-xl bg-sunset hover:bg-forest text-sand font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" /> Flow Débito
                        </button>
                        <button
                          type="button"
                          onClick={() => payBalanceFlow(reservation.id, "FLOW_CREDIT")}
                          className="py-3 px-3 rounded-xl bg-forest hover:bg-ocean text-sand font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" /> Flow Crédito
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBalanceTransfer(true)}
                        className="w-full py-2.5 rounded-xl bg-white border border-ocean/15 text-ocean text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-sand cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" /> Pagar saldo por Transferencia
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!balanceRef.trim()) return;
                        submitBalanceTransfer(reservation.id, {
                          reference: balanceRef.trim(),
                          bankName: balanceBank,
                          holderName: reservation.guestName,
                          amount: reservation.balanceDue,
                          fileName: "comprobante_saldo_50.pdf",
                        });
                        setShowBalanceTransfer(false);
                      }}
                      className="space-y-2.5"
                    >
                      <input
                        type="text"
                        required
                        placeholder="N° Operación transferencia saldo"
                        value={balanceRef}
                        onChange={(e) => setBalanceRef(e.target.value)}
                        className="w-full rounded-xl border border-ocean/15 bg-white px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        value={balanceBank}
                        onChange={(e) => setBalanceBank(e.target.value)}
                        className="w-full rounded-xl border border-ocean/15 bg-white px-3 py-2 text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-xl bg-forest text-sand text-xs font-semibold cursor-pointer"
                        >
                          Enviar Comprobante
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBalanceTransfer(false)}
                          className="px-3 py-2.5 rounded-xl border border-ocean/20 text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Audit Timeline */}
              <div className="pt-3 border-t border-ocean/10">
                <p className="text-xs uppercase tracking-wider font-semibold text-ocean/55 mb-3">
                  Historial automático de tu reserva
                </p>
                <div className="space-y-2.5">
                  {reservation.auditLog.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-2.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-sunset mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-ocean">{ev.title}</p>
                        <p className="text-ocean/65">{ev.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Host Contact */}
            <div className="rounded-3xl bg-ocean text-sand p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={CABIN_MEDIA.hostErica.src}
                    alt={CABIN_MEDIA.hostErica.alt}
                    className="w-12 h-12 rounded-2xl object-cover border border-cream/30 shadow-md"
                  />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cream">
                      Administración · Contacto Oficial
                    </p>
                    <h3 className="font-serif text-2xl">{PROPERTY_INFO.hostName}</h3>
                  </div>
                </div>
                <MessageCircle className="w-6 h-6 text-cream shrink-0" />
              </div>
              <p className="text-xs text-mist/85">
                Para consultas sobre horarios, modificaciones (mín. 7 días antes) o asistencia
                durante tu estadía, escríbenos por WhatsApp.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={PROPERTY_INFO.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-cream text-abyss font-semibold text-xs hover:bg-sand transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp {PROPERTY_INFO.whatsappDisplay}
                </a>
                <a
                  href={PROPERTY_INFO.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 text-cream font-semibold text-xs hover:bg-white/20"
                >
                  <Star className="w-3.5 h-3.5" />
                  {PROPERTY_INFO.socials.instagramHandle}
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Access Gate + Digital Guide */}
          <ScrollReveal y={24} delay={0.08} className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap gap-2">
              {GUIDE_TABS.map((t) => {
                const active = guideTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setGuideTab(t.id)}
                    className={cn(
                      "relative px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                      active
                        ? "text-sand"
                        : "glass-card-subtle text-ocean/75 hover:bg-white/80"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="guest-guide-tab"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-forest shadow-md -z-0"
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {/* TAB 1: ACCESS GATE + LOCKBOX CODE + WI-FI */}
              {guideTab === "acceso" && (
                <motion.div
                  key="tab-acceso"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-5"
                >
                  <div
                    className={cn(
                      "rounded-3xl p-6 sm:p-8",
                      reservation.accessUnlocked
                        ? "glass-card ring-1 ring-emerald-200/70"
                        : "bg-amber-50/75 backdrop-blur-md border border-amber-200/80 shadow-xs"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            reservation.accessUnlocked
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-200/80 text-amber-900"
                          )}
                        >
                          {reservation.accessUnlocked ? (
                            <Unlock className="w-6 h-6" />
                          ) : (
                            <Lock className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <span className="text-[11px] uppercase tracking-widest font-semibold text-sunset">
                            Ingreso Autónomo · Caja de Seguridad de Llaves
                          </span>
                          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-ocean">
                            {reservation.accessUnlocked
                              ? "Acceso desbloqueado · ¡Bienvenido!"
                              : "Bloqueado hasta completar el 100% del pago"}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {reservation.accessUnlocked ? (
                      <div className="space-y-5 mt-5">
                        {/* Lockbox Code Banner */}
                        <div className="rounded-2xl bg-atmosphere-sunset text-sand p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cream font-semibold flex items-center gap-1.5">
                              <KeyRound className="w-4 h-4" /> Código Caja de Seguridad (
                              {reservation.accommodationName})
                            </p>
                            <p className="text-xs text-mist/85 mt-1">
                              Ingresa este código en la caja de seguridad junto al acceso para
                              retirar las llaves desde las 15:00 hrs.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(reservation.lockboxCode || "4829#");
                              setCopiedLockbox(true);
                              setTimeout(() => setCopiedLockbox(false), 1800);
                            }}
                            title="Copiar código de caja de seguridad"
                            className="font-mono text-3xl font-bold tracking-widest px-5 py-2.5 rounded-2xl bg-abyss/60 hover:bg-abyss/80 text-cream border border-cream/25 shrink-0 flex items-center justify-center gap-3 transition-colors cursor-pointer"
                          >
                            <span>{reservation.lockboxCode || "4829#"}</span>
                            {copiedLockbox ? (
                              <Check className="w-5 h-5 text-emerald-300" />
                            ) : (
                              <Copy className="w-4 h-4 opacity-75" />
                            )}
                          </button>
                        </div>

                        <div className="rounded-2xl bg-sand/70 p-5 border border-ocean/8 space-y-2">
                          <p className="text-xs uppercase tracking-wider font-semibold text-forest flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> Ubicación Exacta
                          </p>
                          <p className="text-sm font-semibold text-ocean">
                            {PROPERTY_INFO.address}
                          </p>
                          <p className="text-xs text-ocean/70">
                            A {PROPERTY_INFO.beachDistance} · A {PROPERTY_INFO.townDistance}.
                          </p>
                          <a
                            href={PROPERTY_INFO.mapsHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-sunset text-sand text-xs font-semibold hover:bg-forest transition-colors"
                          >
                            Abrir en Google Maps
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="rounded-2xl bg-forest text-sand p-5 space-y-2">
                            <p className="text-xs uppercase tracking-wider text-cream flex items-center gap-1.5 font-semibold">
                              <Wifi className="w-4 h-4" /> Conexión Wi-Fi
                            </p>
                            <p className="text-sm">
                              Red:{" "}
                              <strong className="text-cream">
                                {PROPERTY_INFO.wifi.network}
                              </strong>
                            </p>
                            <div className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2 text-sm">
                              <span>
                                Clave:{" "}
                                <strong className="font-mono">
                                  {PROPERTY_INFO.wifi.password}
                                </strong>
                              </span>
                              <button
                                type="button"
                                onClick={handleCopyWifi}
                                className="text-cream hover:text-sand cursor-pointer"
                                title="Copiar contraseña"
                              >
                                {copiedWifi ? (
                                  <Check className="w-4 h-4 text-emerald-300" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-sand/70 p-5 border border-ocean/8 space-y-2 text-xs text-ocean/80">
                            <p className="uppercase tracking-wider text-forest font-semibold flex items-center gap-1.5">
                              <Clock className="w-4 h-4" /> Horarios de Estadía
                            </p>
                            <p>
                              <strong>Check-in:</strong> desde las 15:00 horas.
                            </p>
                            <p>
                              <strong>Check-out:</strong> hasta las 12:00 horas.
                            </p>
                            <p>
                              <strong>Silencio:</strong> desde las 23:00 hasta las 08:00 horas.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-white/80 p-5 border border-amber-200 text-sm text-ocean/80 space-y-2">
                        <p className="flex items-center gap-2 font-semibold text-amber-900">
                          <ShieldCheck className="w-4 h-4" />
                          Política de entrega de acceso autónomo
                        </p>
                        <p className="text-xs leading-relaxed">
                          Una vez confirmado el pago del 100% de la estadía (saldo pendiente:{" "}
                          <strong>{formatCLP(reservation.balanceDue)}</strong>), se liberará
                          automáticamente el código de acceso a la caja de seguridad que
                          contiene las llaves, la ubicación exacta en Google Maps y los datos
                          de Wi-Fi.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Breakfasts reminder */}
                  <div className="rounded-3xl glass-card p-6">
                    <h4 className="font-serif text-2xl font-semibold text-ocean flex items-center gap-2 mb-3">
                      <Coffee className="w-5 h-5 text-sunset" /> Desayunos opcionales
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BREAKFAST_OPTIONS.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-2xl bg-sand/70 p-4 border border-ocean/8"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-semibold text-sm text-ocean">{b.name}</span>
                            <span className="text-xs font-bold text-sunset">
                              {formatCLP(b.pricePerPerson)} pp
                            </span>
                          </div>
                          <p className="text-xs text-ocean/70">{b.items.join(" · ")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: USO DEL ALOJAMIENTO */}
              {guideTab === "cabana" && (
                <motion.div
                  key="tab-cabana"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-5"
                >
                  <div className="rounded-3xl bg-white border border-ocean/10 p-6 sm:p-7">
                    <span className="text-xs uppercase tracking-[0.2em] text-sunset font-semibold">
                      Ritual de Mañana
                    </span>
                    <h3 className="font-serif text-3xl font-semibold text-ocean mt-1 mb-4">
                      Uso de Cafetera Prensa Francesa
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FRENCH_PRESS_STEPS.map((s) => (
                        <div
                          key={s.step}
                          className="rounded-2xl bg-sand/70 p-4 border border-ocean/8"
                        >
                          <span className="font-serif text-2xl text-sunset font-semibold">
                            {s.step}
                          </span>
                          <p className="font-semibold text-sm text-ocean mt-1">{s.title}</p>
                          <p className="text-xs text-ocean/75 mt-1">{s.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-3xl bg-white border border-ocean/10 p-6">
                      <h4 className="font-serif text-2xl font-semibold text-ocean flex items-center gap-2 mb-3">
                        <Tv className="w-5 h-5 text-forest" /> Uso TV Box (XUPER)
                      </h4>
                      <ol className="space-y-2 text-xs text-ocean/80 list-decimal pl-4">
                        {TV_BOX_STEPS.map((st) => (
                          <li key={st}>{st}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="rounded-3xl bg-ocean text-sand p-6 space-y-3">
                      <h4 className="font-serif text-2xl text-cream flex items-center gap-2">
                        <Radio className="w-5 h-5 text-sunset-glow" /> Otros Equipamientos
                      </h4>
                      <ul className="space-y-2.5 text-xs text-mist/90">
                        {OTHER_AMENITIES.map((am) => (
                          <li key={am} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sunset-glow shrink-0 mt-0.5" />
                            <span>{am}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: NORMAS DE CONVIVENCIA & POLÍTICAS OFICIALES */}
              {guideTab === "reglas" && (
                <motion.div
                  key="tab-reglas"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-5"
                >
                  <div className="rounded-3xl bg-white border border-ocean/10 p-6 sm:p-7">
                    <h3 className="font-serif text-3xl font-semibold text-ocean mb-4">
                      Normas de Convivencia y Uso de Espacios
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {HOUSE_RULES.map((rule) => (
                        <div
                          key={rule.code}
                          className="rounded-2xl bg-sand/70 p-4 border border-ocean/8"
                        >
                          <span className="text-[11px] font-bold text-sunset tracking-widest">
                            NORMA {rule.code}
                          </span>
                          <p className="font-semibold text-sm text-ocean mt-0.5">
                            {rule.title}
                          </p>
                          <p className="text-xs text-ocean/75 mt-1 leading-relaxed">
                            {rule.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-ocean text-sand p-6 sm:p-7 space-y-4">
                    <h4 className="font-serif text-2xl text-cream flex items-center gap-2">
                      <Ban className="w-5 h-5 text-sunset-glow" />{" "}
                      {OFFICIAL_POLICIES.noPetsPolicy.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-mist/90 leading-relaxed">
                      {OFFICIAL_POLICIES.noPetsPolicy.summary}
                    </p>
                    <p className="text-xs text-cream font-semibold pt-2 border-t border-white/15">
                      {OFFICIAL_POLICIES.noPetsPolicy.exception}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white border border-ocean/10 p-6 sm:p-7 space-y-4">
                    <h4 className="font-serif text-2xl font-semibold text-ocean">
                      Cancelación y Modificación de Reservas
                    </h4>
                    <div className="rounded-2xl bg-sand/70 p-4 space-y-2 text-xs sm:text-sm">
                      {OFFICIAL_POLICIES.cancellationTable.map((row) => (
                        <div key={row.window} className="flex justify-between gap-2">
                          <span className="text-ocean/80">{row.window}</span>
                          <strong className="text-ocean">{row.refund}</strong>
                        </div>
                      ))}
                    </div>
                    <ul className="list-disc pl-5 text-xs text-ocean/75 space-y-1">
                      {OFFICIAL_POLICIES.modificationRules.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: GUÍA LOCAL COBQUECURA */}
              {guideTab === "entorno" && (
                <motion.div
                  key="tab-entorno"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "Todos" },
                      { id: "supermercados", label: "Supermercados & Caleta" },
                      { id: "donde-comer", label: "Dónde Comer" },
                      { id: "lugares", label: "Lugares para Visitar" },
                      { id: "excursiones", label: "Excursiones" },
                      { id: "experiencias", label: "Experiencias" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPlaceFilter(f.id)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors",
                          placeFilter === f.id
                            ? "bg-sunset text-sand"
                            : "bg-white border border-ocean/10 text-ocean/70 hover:bg-sand"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {visiblePlaces.map((p) => (
                      <div
                        key={p.name}
                        className="rounded-2xl bg-white border border-ocean/10 p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="font-semibold text-forest bg-mist/60 px-2.5 py-0.5 rounded-full">
                              {p.driveTime}
                            </span>
                            <span className="text-ocean/50">{p.area}</span>
                          </div>
                          <h4 className="font-serif text-xl font-semibold text-ocean">
                            {p.name}
                          </h4>
                          <p className="text-xs text-ocean/70 mt-1">{p.description}</p>
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            p.mapsQuery
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sunset hover:underline"
                        >
                          Guíame aquí <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollReveal>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-ocean/10 p-10 text-center">
          <Clock className="w-10 h-10 text-sunset mx-auto mb-3" />
          <h2 className="font-serif text-3xl text-ocean font-semibold">
            Código no encontrado
          </h2>
          <p className="text-sm text-ocean/70 mt-2">
            Verifica el código de tu reserva (ej. <strong>NOG-2026-512</strong> o{" "}
            <strong>NOG-2026-841</strong>) o contáctanos por WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}
