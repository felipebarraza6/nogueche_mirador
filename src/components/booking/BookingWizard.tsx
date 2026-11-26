"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Copy,
  CreditCard,
  FileUp,
  Info,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { useNoguecheStore } from "@/lib/api/demo-store";
import type { BreakfastChoice, PaymentMethod } from "@/lib/api/types";
import { BREAKFAST_OPTIONS, PET_FRIENDLY_RULES } from "@/lib/guide-data";
import { cn, formatCLP, formatDateES } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Fechas" },
  { id: 2, label: "Estadía y Datos" },
  { id: 3, label: "Bloqueo 30 min & Abono 50%" },
];

export function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const settings = useNoguecheStore((s) => s.settings);
  const reservations = useNoguecheStore((s) => s.reservations);
  const getQuote = useNoguecheStore((s) => s.getQuote);
  const createHoldReservation = useNoguecheStore((s) => s.createHoldReservation);
  const payDepositFlow = useNoguecheStore((s) => s.payDepositFlow);
  const submitDepositTransfer = useNoguecheStore((s) => s.submitDepositTransfer);
  const runExpirationSweep = useNoguecheStore((s) => s.runExpirationSweep);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkIn, setCheckIn] = useState<string | null>(
    searchParams.get("checkIn") || null
  );
  const [checkOut, setCheckOut] = useState<string | null>(
    searchParams.get("checkOut") || null
  );
  const [adults, setAdults] = useState<number>(
    Number(searchParams.get("adults")) === 1 ? 1 : 2
  );
  const [hasChildOverTwo, setHasChildOverTwo] = useState(false);
  const [bringsPet, setBringsPet] = useState(false);
  const [petAccepted, setPetAccepted] = useState(false);
  const [breakfastChoice, setBreakfastChoice] = useState<BreakfastChoice>("none");
  const [breakfastDays, setBreakfastDays] = useState(0);

  // Guest info
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("+56 9 ");
  const [specialRequests, setSpecialRequests] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Active hold in step 3
  const [holdId, setHoldId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("FLOW_DEBIT");
  const [simulateDelayedWebhook, setSimulateDelayedWebhook] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Transfer proof form
  const [transferBank, setTransferBank] = useState("Banco Estado");
  const [transferRef, setTransferRef] = useState("");
  const [transferHolder, setTransferHolder] = useState("");
  const [transferFileName, setTransferFileName] = useState("comprobante_abono_50.pdf");

  // Live countdown
  const [secondsLeft, setSecondsLeft] = useState<number>(30 * 60);

  const activeReservation = useMemo(
    () => reservations.find((r) => r.id === holdId) || null,
    [reservations, holdId]
  );

  useEffect(() => {
    runExpirationSweep();
  }, [runExpirationSweep]);

  useEffect(() => {
    if (!activeReservation || activeReservation.status !== "HOLD") return;
    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(activeReservation.holdExpiresAt).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(diff);
      if (diff <= 0) {
        runExpirationSweep();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeReservation, runExpirationSweep]);

  const quote = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return getQuote(
      checkIn,
      checkOut,
      adults,
      hasChildOverTwo,
      breakfastChoice,
      breakfastChoice === "none" ? 0 : Math.min(breakfastDays || 1, 30)
    );
  }, [checkIn, checkOut, adults, hasChildOverTwo, breakfastChoice, breakfastDays, getQuote]);

  useEffect(() => {
    if (quote && breakfastChoice !== "none" && breakfastDays === 0) {
      setBreakfastDays(quote.nights);
    }
    if (breakfastChoice === "none") {
      setBreakfastDays(0);
    }
  }, [breakfastChoice, quote, breakfastDays]);

  const handleContinueStep2 = () => {
    setFormError(null);
    if (!checkIn || !checkOut || !quote) {
      setFormError("Selecciona fechas de llegada y salida en el calendario.");
      return;
    }
    if (!quote.meetsMinNights) {
      setFormError(
        `La estadía mínima para estas fechas es de ${quote.minNightsRequired} noches (${quote.ruleAppliedName}).`
      );
      return;
    }
    setStep(2);
  };

  const handleCreateHold = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!checkIn || !checkOut) return;
    if (!guestName.trim() || !guestEmail.trim() || guestPhone.trim().length < 8) {
      setFormError("Completa tu nombre, correo electrónico y teléfono WhatsApp.");
      return;
    }
    if (bringsPet && !petAccepted) {
      setFormError("Debes aceptar las normas Pet Friendly para continuar.");
      return;
    }

    const res = createHoldReservation({
      checkIn,
      checkOut,
      adults,
      hasChildOverTwo,
      bringsPet,
      breakfastChoice,
      breakfastDays: breakfastChoice === "none" ? 0 : breakfastDays,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      specialRequests: specialRequests.trim() || undefined,
    });

    if (!res.ok) {
      setFormError(res.error);
      return;
    }

    setHoldId(res.reservation.id);
    setTransferHolder(guestName.trim());
    setStep(3);
  };

  const handlePayFlow = () => {
    if (!activeReservation) return;
    const method = paymentMethod === "FLOW_CREDIT" ? "FLOW_CREDIT" : "FLOW_DEBIT";
    payDepositFlow(activeReservation.id, method, simulateDelayedWebhook);
    router.push(`/checkout/result?code=${encodeURIComponent(activeReservation.code)}`);
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReservation) return;
    if (!transferRef.trim()) {
      setFormError("Ingresa el número de operación o referencia de la transferencia.");
      return;
    }
    submitDepositTransfer(activeReservation.id, {
      reference: transferRef.trim(),
      bankName: transferBank,
      holderName: transferHolder.trim() || activeReservation.guestName,
      amount: activeReservation.depositAmount,
      fileName: transferFileName,
      notes: "Enviado desde motor de reservas web.",
    });
    router.push(`/checkout/result?code=${encodeURIComponent(activeReservation.code)}`);
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const isWarning5m = secondsLeft <= settings.reminderBeforeExpiryMinutes * 60 && secondsLeft > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Header + Progress Stepper */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.26em] text-sunset font-semibold">
            Motor de Reservas · Mirador de Nogueche
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ocean mt-1">
            Reserva tu estadía frente al mar
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {STEPS.map((s, idx) => {
            const done = step > s.id;
            const current = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all",
                    current
                      ? "bg-forest text-sand shadow-md"
                      : done
                      ? "bg-mist text-forest"
                      : "bg-white/70 text-ocean/50 border border-ocean/10"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[11px]",
                      current
                        ? "bg-cream text-abyss"
                        : done
                        ? "bg-forest text-sand"
                        : "bg-ocean/10 text-ocean/50"
                    )}
                  >
                    {done ? <Check className="w-3 h-3" /> : s.id}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="w-4 sm:w-8 h-[1px] bg-ocean/15" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Main Content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {/* =============================================
                STEP 1: CALENDARIO EN TIEMPO REAL
               ============================================= */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <AvailabilityCalendar
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onSelectRange={(ci, co) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                    setFormError(null);
                  }}
                />

                {/* Min nights info banner */}
                <div className="rounded-2xl bg-forest/8 border border-forest/15 p-4 flex items-start gap-3 text-sm text-ocean">
                  <Info className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-forest">
                      Política de estadía mínima automática
                    </p>
                    <p className="text-xs sm:text-sm text-ocean/75 mt-0.5">
                      Por defecto se requieren{" "}
                      <strong>{settings.defaultMinNights} noches mínimas</strong> (temporada
                      alta, fines de semana y feriados). En rangos de temporada baja
                      configurados por la anfitriona el sistema habilita estadías de 1 noche
                      automáticamente.
                    </p>
                  </div>
                </div>

                {formError && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleContinueStep2}
                    disabled={!checkIn || !checkOut || !quote?.meetsMinNights}
                    className="px-7 py-3.5 rounded-full bg-sunset text-sand font-semibold text-sm flex items-center gap-2 shadow-lg hover:bg-forest disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Continuar a Huéspedes y Datos
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* =============================================
                STEP 2: HUÉSPEDES, EXTRAS Y DATOS
               ============================================= */}
            {step === 2 && (
              <motion.form
                key="step-2"
                onSubmit={handleCreateHold}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Guests & Extras */}
                <div className="rounded-3xl bg-white border border-ocean/10 p-6 sm:p-7 shadow-sm space-y-6">
                  <h2 className="font-serif text-2xl font-semibold text-ocean flex items-center gap-2">
                    <Users className="w-5 h-5 text-sunset" /> Configuración de tu estadía
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="rounded-2xl bg-sand/70 p-4 border border-ocean/10">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Adultos (Cama King)
                      </span>
                      <select
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="mt-2 w-full bg-white rounded-xl px-3 py-2.5 text-sm font-medium border border-ocean/15"
                      >
                        <option value={1}>1 adulto</option>
                        <option value={2}>2 adultos (Pareja)</option>
                      </select>
                    </label>

                    <label className="rounded-2xl bg-sand/70 p-4 border border-ocean/10 flex items-center justify-between gap-3 cursor-pointer">
                      <div>
                        <span className="text-sm font-semibold text-ocean block">
                          Niño adicional (&gt; 2 años)
                        </span>
                        <span className="text-xs text-ocean/65">
                          Misma cama king · +{formatCLP(settings.childOverTwoNightlyFee)} / noche
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasChildOverTwo}
                        onChange={(e) => setHasChildOverTwo(e.target.checked)}
                        className="w-5 h-5 accent-forest"
                      />
                    </label>
                  </div>

                  {/* Breakfasts */}
                  <div className="pt-2 border-t border-ocean/10">
                    <p className="text-sm font-semibold text-ocean flex items-center gap-2 mb-3">
                      <Coffee className="w-4 h-4 text-sunset" /> Servicio de Desayuno (opcional)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setBreakfastChoice("none")}
                        className={cn(
                          "rounded-2xl p-4 text-left border transition-all cursor-pointer",
                          breakfastChoice === "none"
                            ? "border-forest bg-forest/8 ring-1 ring-forest"
                            : "border-ocean/10 hover:border-ocean/30"
                        )}
                      >
                        <p className="font-semibold text-sm text-ocean">Sin desayuno</p>
                        <p className="text-xs text-ocean/60 mt-1">
                          Cocina equipada + prensa francesa incluida
                        </p>
                      </button>
                      {BREAKFAST_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBreakfastChoice(opt.id)}
                          className={cn(
                            "rounded-2xl p-4 text-left border transition-all cursor-pointer",
                            breakfastChoice === opt.id
                              ? "border-forest bg-forest/8 ring-1 ring-forest"
                              : "border-ocean/10 hover:border-ocean/30"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-ocean">{opt.name}</p>
                            <span className="text-xs font-bold text-sunset">
                              {formatCLP(opt.pricePerPerson)} pp
                            </span>
                          </div>
                          <p className="text-[11px] text-ocean/65 mt-1 line-clamp-2">
                            {opt.items.join(", ")}
                          </p>
                        </button>
                      ))}
                    </div>

                    {breakfastChoice !== "none" && quote && (
                      <div className="mt-3 flex items-center gap-3 text-sm bg-sand/70 px-4 py-3 rounded-xl">
                        <span className="text-ocean/80">¿Para cuántas mañanas?</span>
                        <input
                          type="number"
                          min={1}
                          max={quote.nights}
                          value={breakfastDays}
                          onChange={(e) =>
                            setBreakfastDays(
                              Math.max(1, Math.min(quote.nights, Number(e.target.value)))
                            )
                          }
                          className="w-20 px-3 py-1 rounded-lg border border-ocean/20 bg-white font-semibold text-center"
                        />
                        <span className="text-xs text-ocean/60">
                          (máx. {quote.nights} mañanas)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pet Friendly */}
                  <div className="pt-2 border-t border-ocean/10">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <PawPrint className="w-4 h-4 text-forest" />
                        <span className="text-sm font-semibold text-ocean">
                          Viajo con mascota (Pet Friendly)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={bringsPet}
                        onChange={(e) => setBringsPet(e.target.checked)}
                        className="w-5 h-5 accent-forest"
                      />
                    </label>
                    {bringsPet && (
                      <div className="mt-3 rounded-2xl bg-mist/40 border border-forest/15 p-4 space-y-2 text-xs text-ocean/80">
                        <ul className="list-disc pl-4 space-y-1">
                          {PET_FRIENDLY_RULES.conditions.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-ocean/65">
                          Razas no admitidas: {PET_FRIENDLY_RULES.restrictedBreeds.join(", ")}.
                        </p>
                        <label className="flex items-center gap-2 pt-2 font-semibold text-forest cursor-pointer">
                          <input
                            type="checkbox"
                            checked={petAccepted}
                            onChange={(e) => setPetAccepted(e.target.checked)}
                            className="w-4 h-4 accent-forest"
                          />
                          Confirmo que mi mascota cumple estas condiciones.
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Guest Details */}
                <div className="rounded-3xl bg-white border border-ocean/10 p-6 sm:p-7 shadow-sm space-y-4">
                  <h2 className="font-serif text-2xl font-semibold text-ocean">
                    Datos del Huésped Titular
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Nombre y Apellido *
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carolina Méndez"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Correo Electrónico *
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="nombre@correo.cl"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Teléfono / WhatsApp *
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="+56 9 1234 5678"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Hora estimada de llegada / Notas
                      </span>
                      <input
                        type="text"
                        placeholder="Ej. Llegamos a las 16:00 hrs"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                      />
                    </label>
                  </div>
                </div>

                {formError && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-full border border-ocean/20 text-ocean font-semibold text-sm flex items-center gap-2 hover:bg-ocean/5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver a Fechas
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-3.5 rounded-full bg-sunset text-sand font-semibold text-sm flex items-center gap-2 shadow-lg hover:bg-forest transition-all cursor-pointer"
                  >
                    Bloquear Fechas por 30 Min y Pagar 50%
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* =============================================
                STEP 3: HOLD 30 MIN + PAGO ABONO 50%
               ============================================= */}
            {step === 3 && activeReservation && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Server Hold Countdown Banner */}
                <div
                  className={cn(
                    "rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border shadow-md",
                    isWarning5m
                      ? "bg-amber-50 border-amber-300 text-amber-950"
                      : "bg-atmosphere-forest text-sand border-forest"
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                        isWarning5m ? "bg-amber-200 text-amber-900" : "bg-white/15 text-cream"
                      )}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] font-semibold opacity-80">
                        Bloqueo Temporal en Servidor · Código {activeReservation.code}
                      </p>
                      <h3 className="font-serif text-2xl font-medium mt-0.5">
                        {isWarning5m
                          ? "¡Recordatorio! Faltan menos de 5 minutos para vencer tu bloqueo"
                          : "Tus fechas están reservadas temporalmente para ti"}
                      </h3>
                      <p className="text-xs opacity-80 mt-1">
                        Nadie más puede tomar estas noches mientras completas el abono del 50%.
                        El vencimiento se controla desde el servidor de Yggdra.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <div
                      className={cn(
                        "font-mono text-3xl font-bold px-4 py-2 rounded-2xl",
                        isWarning5m ? "bg-amber-200 text-amber-950" : "bg-abyss/50 text-cream"
                      )}
                    >
                      {mins}:{secs}
                    </div>
                    {!isWarning5m && (
                      <button
                        type="button"
                        onClick={() => setSecondsLeft(4 * 60 + 55)}
                        className="mt-1.5 text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer"
                      >
                        Probar aviso 5 min (demo)
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="rounded-3xl bg-white border border-ocean/10 p-6 sm:p-7 shadow-sm space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-sunset font-semibold">
                      Abono inicial 50%
                    </span>
                    <h2 className="font-serif text-3xl font-semibold text-ocean mt-1">
                      Monto a pagar ahora: {formatCLP(activeReservation.depositAmount)}
                    </h2>
                    <p className="text-xs text-ocean/65 mt-1">
                      El 50% restante ({formatCLP(activeReservation.totalAmount - activeReservation.depositAmount)}) se paga antes de recibir las indicaciones de acceso y llaves.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "FLOW_DEBIT" as PaymentMethod,
                        title: "Tarjeta de Débito",
                        sub: "Flow.cl / Redcompra",
                        icon: CreditCard,
                      },
                      {
                        id: "FLOW_CREDIT" as PaymentMethod,
                        title: "Tarjeta de Crédito",
                        sub: "Flow.cl / Cuotas",
                        icon: Sparkles,
                      },
                      {
                        id: "BANK_TRANSFER" as PaymentMethod,
                        title: "Transferencia Bancaria",
                        sub: "Validación por anfitriona",
                        icon: Building2,
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={cn(
                          "rounded-2xl p-4 text-left border transition-all cursor-pointer",
                          paymentMethod === m.id
                            ? "border-forest bg-forest/8 ring-2 ring-forest/20"
                            : "border-ocean/12 hover:border-ocean/30"
                        )}
                      >
                        <m.icon className="w-5 h-5 text-sunset mb-2" />
                        <p className="font-semibold text-sm text-ocean">{m.title}</p>
                        <p className="text-xs text-ocean/60">{m.sub}</p>
                      </button>
                    ))}
                  </div>

                  {/* Flow Debit/Credit Panel */}
                  {(paymentMethod === "FLOW_DEBIT" || paymentMethod === "FLOW_CREDIT") && (
                    <div className="rounded-2xl bg-sand/70 border border-ocean/10 p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                        <div className="text-sm text-ocean/80">
                          <p className="font-semibold text-ocean">
                            Enlace de pago seguro Flow.cl por{" "}
                            {formatCLP(activeReservation.depositAmount)}
                          </p>
                          <p className="text-xs mt-1">
                            Al concretarse el pago dentro del plazo, la reserva se confirma
                            automáticamente y recibirás el resumen completo por mensaje.
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-2.5 text-xs text-ocean/75 bg-white/80 p-3 rounded-xl border border-ocean/10 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simulateDelayedWebhook}
                          onChange={(e) => setSimulateDelayedWebhook(e.target.checked)}
                          className="accent-forest"
                        />
                        <span>
                          <strong>Demo técnica:</strong> simular confirmación demorada / webhook
                          tardío (protege el bloqueo mientras Flow responde).
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={handlePayFlow}
                        className="w-full py-4 rounded-2xl bg-sunset hover:bg-forest text-sand font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        Ir a Pagar {formatCLP(activeReservation.depositAmount)} con{" "}
                        {paymentMethod === "FLOW_DEBIT" ? "Débito" : "Crédito"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Bank Transfer Panel */}
                  {paymentMethod === "BANK_TRANSFER" && (
                    <form
                      onSubmit={handleSubmitTransfer}
                      className="rounded-2xl bg-sand/70 border border-ocean/10 p-5 space-y-5"
                    >
                      <div className="rounded-2xl bg-white p-4 border border-ocean/10 space-y-2 text-sm">
                        <p className="text-xs uppercase tracking-wider font-semibold text-forest mb-2">
                          Datos para Transferencia Bancaria
                        </p>
                        {[
                          { k: "bank", l: "Banco", v: settings.bankDetails.bankName },
                          { k: "acc", l: "N° Cuenta", v: settings.bankDetails.accountNumber },
                          { k: "holder", l: "Titular", v: settings.bankDetails.holderName },
                          { k: "rut", l: "RUT", v: settings.bankDetails.holderRut },
                          { k: "email", l: "Email", v: settings.bankDetails.email },
                          {
                            k: "amount",
                            l: "Monto exacto (50%)",
                            v: formatCLP(activeReservation.depositAmount),
                          },
                        ].map((row) => (
                          <div
                            key={row.k}
                            className="flex items-center justify-between gap-2 py-1 border-b border-ocean/5 last:border-0"
                          >
                            <span className="text-ocean/60 text-xs">{row.l}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-ocean text-xs sm:text-sm">
                                {row.v}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyText(row.k, row.v)}
                                className="p-1 rounded-md hover:bg-ocean/10 text-ocean/60 cursor-pointer"
                                title="Copiar"
                              >
                                {copiedField === row.k ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-xs font-semibold text-ocean/70">
                            Banco de origen
                          </span>
                          <input
                            type="text"
                            value={transferBank}
                            onChange={(e) => setTransferBank(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-ocean/15 bg-white px-3 py-2.5 text-sm"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-ocean/70">
                            N° Comprobante / Operación *
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="Ej. TRF-884210"
                            value={transferRef}
                            onChange={(e) => setTransferRef(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-ocean/15 bg-white px-3 py-2.5 text-sm"
                          />
                        </label>
                      </div>

                      <label className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-forest/40 bg-white/80 p-3.5 cursor-pointer hover:bg-white">
                        <div className="flex items-center gap-2.5 text-xs text-ocean/80">
                          <FileUp className="w-4 h-4 text-sunset" />
                          <span>
                            Comprobante adjunto: <strong>{transferFileName}</strong>
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setTransferFileName(f.name);
                          }}
                        />
                        <span className="text-xs font-semibold text-forest">Cambiar archivo</span>
                      </label>

                      <p className="text-xs text-ocean/70 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                        Al enviar tu comprobante, las fechas quedan protegidas contra expiración
                        hasta que la anfitriona valide el abono en el Panel Admin.
                      </p>

                      {formError && (
                        <p className="text-xs text-red-700 font-medium">{formError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-4 rounded-2xl bg-forest hover:bg-sunset text-sand font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        Enviar Comprobante para Validación
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sticky Summary Card */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-3xl bg-white border border-ocean/10 p-6 shadow-[0_20px_50px_rgba(20,29,36,0.08)] space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-ocean/10">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-sunset font-semibold">
                  Resumen de Estadía
                </p>
                <h3 className="font-serif text-2xl font-semibold text-ocean">
                  Mirador de Nogueche
                </h3>
              </div>
              <Calendar className="w-5 h-5 text-forest" />
            </div>

            {checkIn && checkOut && quote ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-sand/70 p-3">
                    <span className="text-ocean/55 block uppercase tracking-wider text-[10px]">
                      Check-in
                    </span>
                    <span className="font-semibold text-ocean text-sm mt-0.5 block">
                      {formatDateES(checkIn)}
                    </span>
                    <span className="text-ocean/55">Desde 14:00</span>
                  </div>
                  <div className="rounded-2xl bg-sand/70 p-3">
                    <span className="text-ocean/55 block uppercase tracking-wider text-[10px]">
                      Check-out
                    </span>
                    <span className="font-semibold text-ocean text-sm mt-0.5 block">
                      {formatDateES(checkOut)}
                    </span>
                    <span className="text-ocean/55">Hasta 13:00</span>
                  </div>
                </div>

                {!quote.meetsMinNights && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900">
                    <strong>Mínimo {quote.minNightsRequired} noches requeridas</strong> para{" "}
                    {quote.ruleAppliedName}. Seleccionaste {quote.nights} noche.
                  </div>
                )}

                <div className="space-y-2.5 text-sm pt-2 border-t border-ocean/10">
                  <div className="flex justify-between text-ocean/80">
                    <span>
                      Alojamiento ({quote.nights}{" "}
                      {quote.nights === 1 ? "noche" : "noches"})
                    </span>
                    <span className="font-medium">{formatCLP(quote.nightlySubtotal)}</span>
                  </div>
                  {quote.childFeeTotal > 0 && (
                    <div className="flex justify-between text-ocean/80">
                      <span>Niño adicional (&gt; 2 años)</span>
                      <span className="font-medium">{formatCLP(quote.childFeeTotal)}</span>
                    </div>
                  )}
                  {quote.breakfastTotal > 0 && (
                    <div className="flex justify-between text-ocean/80">
                      <span>Desayuno ({breakfastChoice})</span>
                      <span className="font-medium">{formatCLP(quote.breakfastTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-ocean/10 text-base font-bold text-ocean">
                    <span>Total estadía</span>
                    <span>{formatCLP(quote.totalAmount)}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-forest/8 border border-forest/15 p-4 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-forest text-sm">
                    <span>Abono hoy (50%)</span>
                    <span>{formatCLP(quote.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-ocean/70">
                    <span>Saldo antes de llegada (50%)</span>
                    <span>{formatCLP(quote.balanceAmount)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-ocean/60">
                Selecciona tu fecha de llegada y salida en el calendario para ver el
                desglose en tiempo real.
              </div>
            )}

            <div className="text-[11px] text-ocean/55 pt-2 border-t border-ocean/10 space-y-1">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                Bloqueo atómico de 30 min controlado en servidor.
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                Regla activa: mín. {settings.defaultMinNights} noches (configurable por
                temporada).
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
