"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Copy,
  CreditCard,
  FileText,
  FileUp,
  Info,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useNoguecheStore } from "@/lib/api/demo-store";
import type { AccommodationId, BreakfastChoice, PaymentMethod } from "@/lib/api/types";
import {
  ACCOMMODATIONS,
  ACCOMMODATION_LIST,
  BREAKFAST_OPTIONS,
  HOUSE_RULES,
  OFFICIAL_POLICIES,
} from "@/lib/guide-data";
import { cn, formatCLP, formatDateES } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Alojamiento y Fechas" },
  { id: 2, label: "Huéspedes y Registro" },
  { id: 3, label: "Bloqueo 15 min & Abono 50%" },
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

  const initialUnit: AccommodationId =
    searchParams.get("unit") === "casa-mirador" ? "casa-mirador" : "cabana-boutique";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accommodationId, setAccommodationId] = useState<AccommodationId>(initialUnit);
  const [checkIn, setCheckIn] = useState<string | null>(
    searchParams.get("checkIn") || null
  );
  const [checkOut, setCheckOut] = useState<string | null>(
    searchParams.get("checkOut") || null
  );

  // Guest composition (exact policy)
  const initialAdults = Number(searchParams.get("adults")) || 2;
  const [adults, setAdults] = useState<number>(
    Math.min(
      Math.max(1, initialAdults),
      ACCOMMODATIONS[initialUnit].maxRegularGuests
    )
  );
  const [childrenUnder2, setChildrenUnder2] = useState<number>(0);
  const [children2To6, setChildren2To6] = useState<number>(0);
  const [children7Plus, setChildren7Plus] = useState<number>(0);
  const [childrenAges, setChildrenAges] = useState<string>("");

  // Optional breakfast
  const [breakfastChoice, setBreakfastChoice] = useState<BreakfastChoice>("none");
  const [breakfastDays, setBreakfastDays] = useState(0);

  // Official Guest Registration Form
  const [guestName, setGuestName] = useState("");
  const [guestDocument, setGuestDocument] = useState("");
  const [guestPhone, setGuestPhone] = useState("+56 9 ");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestCity, setGuestCity] = useState("");
  const [companionNames, setCompanionNames] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Mandatory unchecked policy checkboxes
  const [acceptedCancellation, setAcceptedCancellation] = useState(false);
  const [acceptedHouseRules, setAcceptedHouseRules] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

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

  // Live countdown (15 min)
  const [secondsLeft, setSecondsLeft] = useState<number>(
    settings.holdDurationMinutes * 60
  );

  const profile = ACCOMMODATIONS[accommodationId];

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

  const handleUnitChange = (nextUnit: AccommodationId) => {
    setAccommodationId(nextUnit);
    setCheckIn(null);
    setCheckOut(null);
    setFormError(null);
    const maxReg = ACCOMMODATIONS[nextUnit].maxRegularGuests;
    if (adults > maxReg) setAdults(maxReg);
    if (nextUnit === "cabana-boutique") {
      setChildren7Plus(0);
      if (children2To6 > 1) setChildren2To6(1);
    }
  };

  const quote = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return getQuote(
      accommodationId,
      checkIn,
      checkOut,
      adults,
      childrenUnder2,
      children2To6,
      children7Plus,
      breakfastChoice,
      breakfastChoice === "none" ? 0 : Math.min(breakfastDays || 1, 30)
    );
  }, [
    accommodationId,
    checkIn,
    checkOut,
    adults,
    childrenUnder2,
    children2To6,
    children7Plus,
    breakfastChoice,
    breakfastDays,
    getQuote,
  ]);

  useEffect(() => {
    if (quote && breakfastChoice !== "none" && breakfastDays === 0) {
      setBreakfastDays(quote.nights);
    }
    if (breakfastChoice === "none") {
      setBreakfastDays(0);
    }
  }, [breakfastChoice, quote, breakfastDays]);

  const hasAnyChildren = childrenUnder2 + children2To6 + children7Plus > 0;

  const handleContinueStep2 = () => {
    setFormError(null);
    if (!checkIn || !checkOut || !quote) {
      setFormError("Selecciona fechas de ingreso y salida en el calendario.");
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
    if (!checkIn || !checkOut || !quote) return;

    if (quote.exceedsCapacity) {
      setFormError(
        `La cantidad de huéspedes supera la capacidad máxima de ${profile.name} (${profile.maxRegularGuests} personas).`
      );
      return;
    }

    if (
      !guestName.trim() ||
      !guestDocument.trim() ||
      !guestEmail.trim() ||
      guestPhone.trim().length < 8 ||
      !guestCity.trim()
    ) {
      setFormError(
        "Completa todos los campos obligatorios del titular (Nombre, RUT/Pasaporte, Teléfono, Correo y Ciudad)."
      );
      return;
    }

    if (hasAnyChildren && !childrenAges.trim()) {
      setFormError("Indica las edades de los niños que te acompañan.");
      return;
    }

    if (!acceptedCancellation || !acceptedHouseRules) {
      setFormError(
        "Debes marcar ambas casillas de aceptación obligatoria de políticas y normas de convivencia."
      );
      return;
    }

    const res = createHoldReservation({
      accommodationId,
      checkIn,
      checkOut,
      adults,
      childrenUnder2,
      children2To6,
      children7Plus,
      childrenAges: childrenAges.trim() || undefined,
      companionNames: companionNames.trim() || undefined,
      vehiclePlate: vehiclePlate.trim().toUpperCase() || undefined,
      breakfastChoice,
      breakfastDays: breakfastChoice === "none" ? 0 : breakfastDays,
      guestName: guestName.trim(),
      guestDocument: guestDocument.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      guestCity: guestCity.trim(),
      specialRequests: specialRequests.trim() || undefined,
      acceptedCancellationPolicy: acceptedCancellation,
      acceptedHouseRules: acceptedHouseRules,
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
  const isWarning5m =
    secondsLeft <= settings.reminderBeforeExpiryMinutes * 60 && secondsLeft > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      {/* Header + Progress Stepper */}
      <ScrollReveal y={20} className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.26em] text-sunset font-semibold">
            Motor de Reservas · Mirador de Nogueche
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ocean mt-1">
            Reserva directa junto al mar
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
                {idx < STEPS.length - 1 && <div className="w-4 sm:w-8 h-[1px] bg-ocean/15" />}
              </div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {/* =============================================
                STEP 1: ALOJAMIENTO + CALENDARIO INDEPENDIENTE
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
                {/* Accommodation Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ACCOMMODATION_LIST.map((acc) => {
                    const selected = accommodationId === acc.id;
                    const priceFrom =
                      acc.id === "cabana-boutique"
                        ? settings.rates.boutique1To2
                        : settings.rates.casa1To2;
                    return (
                      <motion.button
                        key={acc.id}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleUnitChange(acc.id)}
                        className={cn(
                          "rounded-3xl p-4 text-left transition-all flex items-center gap-4 cursor-pointer",
                          selected
                            ? "glass-card ring-2 ring-forest/30"
                            : "glass-card-subtle hover:bg-white/75"
                        )}
                      >
                        <img
                          src={acc.cover.src}
                          alt={acc.cover.alt}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-sunset block">
                            {acc.capacityLabel}
                          </span>
                          <p className="font-serif text-2xl font-semibold text-ocean leading-tight">
                            {acc.name}
                          </p>
                          <p className="text-xs text-ocean/70 mt-0.5">
                            Desde <strong>{formatCLP(priceFrom)}</strong> / noche
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <AvailabilityCalendar
                  accommodationId={accommodationId}
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
                  <div className="text-xs sm:text-sm text-ocean/80 space-y-1">
                    <p className="font-semibold text-forest">
                      Condiciones de estadía mínima y horarios
                    </p>
                    <p>
                      Mínimo <strong>2 noches</strong> durante toda la temporada alta (01 dic
                      2026 – 28 feb 2027) y los fines de semana del resto del año. Check-in
                      desde las <strong>15:00 hrs</strong> · Check-out hasta las{" "}
                      <strong>12:00 hrs</strong>.
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
                    Continuar a Huéspedes y Registro
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* =============================================
                STEP 2: HUÉSPEDES, REGISTRO OFICIAL Y ACEPTACIÓN
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
                {/* Guests & Children Policy */}
                <div className="rounded-3xl glass-card p-6 sm:p-7 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-serif text-2xl font-semibold text-ocean flex items-center gap-2">
                      <Users className="w-5 h-5 text-sunset" /> Huéspedes en {profile.name}
                    </h2>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sand text-ocean">
                      Capacidad máx.: {profile.capacityLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        label: "Adultos",
                        sub: "Tarifa regular por tramo",
                        val: adults,
                        min: 1,
                        max: profile.maxRegularGuests,
                        onChange: (next: number) => {
                          setAdults(next);
                          if (next + children7Plus > profile.maxRegularGuests) {
                            setChildren7Plus(Math.max(0, profile.maxRegularGuests - next));
                          }
                        },
                      },
                      {
                        label: "Niños menores de 2 años",
                        sub: "Sin costo adicional (no hay cunas)",
                        val: childrenUnder2,
                        min: 0,
                        max: accommodationId === "casa-mirador" ? 2 : 1,
                        onChange: setChildrenUnder2,
                      },
                      {
                        label: "Niños de 2 a 6 años",
                        sub: `+${formatCLP(settings.child2To6NightlyFee)}/noche compartiendo cama`,
                        val: children2To6,
                        min: 0,
                        max: accommodationId === "casa-mirador" ? 2 : 1,
                        onChange: setChildren2To6,
                      },
                      {
                        label: "Niños desde 7 años",
                        sub: "Cuenta como tarifa regular",
                        val: children7Plus,
                        min: 0,
                        max: Math.max(0, profile.maxRegularGuests - adults),
                        onChange: setChildren7Plus,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="rounded-2xl bg-sand/70 p-4 border border-ocean/10 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-sm font-semibold text-ocean block">
                            {row.label}
                          </span>
                          <span className="text-[11px] text-ocean/65 block mt-0.5">
                            {row.sub}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            disabled={row.val <= row.min}
                            onClick={() => row.onChange(Math.max(row.min, row.val - 1))}
                            aria-label={`Disminuir ${row.label}`}
                            className="w-10 h-10 rounded-full bg-white border border-ocean/20 text-ocean flex items-center justify-center hover:border-forest hover:text-forest disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          <span className="w-6 text-center font-bold text-base text-ocean tabular-nums">
                            {row.val}
                          </span>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            disabled={row.val >= row.max}
                            onClick={() => row.onChange(Math.min(row.max, row.val + 1))}
                            aria-label={`Aumentar ${row.label}`}
                            className="w-10 h-10 rounded-full bg-forest text-sand flex items-center justify-center hover:bg-sunset disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-mist/35 border border-forest/15 px-4 py-3 text-xs text-ocean/80 flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Menores de 2 años: <strong>gratis</strong> · 2 a 6 años:{" "}
                      <strong>+{formatCLP(settings.child2To6NightlyFee)}/noche</strong>{" "}
                      compartiendo cama existente · 7+ años: tarifa regular.{" "}
                      <strong>No disponemos de cunas.</strong>
                    </span>
                  </div>

                  {quote?.exceedsCapacity && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        La cantidad seleccionada supera la capacidad máxima de {profile.name} (
                        {profile.capacityLabel}). Ajusta el número de huéspedes o selecciona
                        Casa Mirador.
                      </span>
                    </div>
                  )}

                  {/* Breakfasts */}
                  <div className="pt-3 border-t border-ocean/10">
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
                          Cocina equipada disponible
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
                </div>

                {/* Official Guest Registration Form */}
                <div className="rounded-3xl glass-card p-6 sm:p-7 space-y-4">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-ocean">
                      Formulario de Registro de Huéspedes
                    </h2>
                    <p className="text-xs text-ocean/65 mt-0.5">
                      Los datos quedan resguardados en el panel de administración con acceso
                      restringido.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Nombre completo del titular *
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carolina Méndez Ríos"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        RUT o Pasaporte *
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 18.412.903-4"
                        value={guestDocument}
                        onChange={(e) => setGuestDocument(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Teléfono de contacto (WhatsApp) *
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
                        Correo electrónico *
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
                        Ciudad de procedencia *
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Concepción / Santiago"
                        value={guestCity}
                        onChange={(e) => setGuestCity(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Patente del vehículo (si corresponde)
                      </span>
                      <input
                        type="text"
                        placeholder="Ej. KLRT-42"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm uppercase focus:outline-none focus:border-forest"
                      />
                    </label>

                    {hasAnyChildren && (
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                          Edades de los niños *
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Ej. 4 años y 8 años"
                          value={childrenAges}
                          onChange={(e) => setChildrenAges(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                        />
                      </label>
                    )}

                    <label className="block sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Identificación de huéspedes acompañantes (Nombres y RUT/Pasaporte)
                      </span>
                      <textarea
                        rows={2}
                        placeholder="Ej. Matías Fuentes (18.210.441-K) · Solo ingresan personas registradas"
                        value={companionNames}
                        onChange={(e) => setCompanionNames(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ocean/60">
                        Hora estimada de llegada / Comentarios
                      </span>
                      <input
                        type="text"
                        placeholder="Ej. Llegamos cerca de las 16:00 hrs"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-ocean/15 bg-sand/40 px-4 py-3 text-sm focus:outline-none focus:border-forest"
                      />
                    </label>
                  </div>
                </div>

                {/* Mandatory Unchecked Policy Checkboxes */}
                <div className="rounded-3xl glass-card p-6 sm:p-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif text-2xl font-semibold text-ocean flex items-center gap-2">
                      <FileText className="w-5 h-5 text-sunset" /> Aceptación Obligatoria de
                      Condiciones
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowPoliciesModal(true)}
                      className="text-xs font-semibold text-sunset hover:underline cursor-pointer"
                    >
                      Leer políticas completas
                    </button>
                  </div>

                  <div className="rounded-2xl bg-red-50/70 border border-red-200/80 p-3.5 text-xs text-red-950 flex items-start gap-2.5">
                    <Ban className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Importante:</strong> Mirador de Nogueche{" "}
                      <strong>no admite mascotas</strong> en ninguno de sus alojamientos
                      (exceptuando perros de asistencia debidamente identificados).
                    </span>
                  </div>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-sand/60 border border-ocean/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedCancellation}
                      onChange={(e) => setAcceptedCancellation(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-forest shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-ocean">
                      {OFFICIAL_POLICIES.mandatoryCheckboxes.cancellation}
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-sand/60 border border-ocean/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedHouseRules}
                      onChange={(e) => setAcceptedHouseRules(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-forest shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-ocean">
                      {OFFICIAL_POLICIES.mandatoryCheckboxes.houseRules}
                    </span>
                  </label>

                  <p className="text-[11px] text-ocean/55">
                    El sistema registrará fecha, hora y versión de las condiciones aceptadas (
                    <code>{OFFICIAL_POLICIES.version}</code>).
                  </p>
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
                    disabled={quote?.exceedsCapacity}
                    className="px-7 py-3.5 rounded-full bg-sunset text-sand font-semibold text-sm flex items-center gap-2 shadow-lg hover:bg-forest disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Bloquear Fechas por {settings.holdDurationMinutes} Min y Pagar 50%
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* =============================================
                STEP 3: HOLD 15 MIN + PAGO ABONO 50%
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
                        Bloqueo Temporal ({settings.holdDurationMinutes} min) ·{" "}
                        {activeReservation.accommodationName} · {activeReservation.code}
                      </p>
                      <h3 className="font-serif text-2xl font-medium mt-0.5">
                        {isWarning5m
                          ? "¡Recordatorio! Faltan menos de 5 minutos para vencer tu bloqueo"
                          : "Tus fechas están bloqueadas temporalmente mientras pagas"}
                      </h3>
                      <p className="text-xs opacity-80 mt-1">
                        Si el pago no se concreta dentro de {settings.holdDurationMinutes}{" "}
                        minutos, las fechas se liberarán automáticamente.
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
                <div className="rounded-3xl glass-card p-6 sm:p-7 space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-sunset font-semibold">
                      Abono inicial 50% para confirmar
                    </span>
                    <h2 className="font-serif text-3xl font-semibold text-ocean mt-1">
                      Monto a pagar ahora: {formatCLP(activeReservation.depositAmount)}
                    </h2>
                    <p className="text-xs text-ocean/65 mt-1">
                      El saldo pendiente del 50% (
                      {formatCLP(
                        activeReservation.totalAmount - activeReservation.depositAmount
                      )}
                      ) deberá estar pagado antes del ingreso para entregar el código de la
                      caja de seguridad con las llaves.
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
                        sub: "Adjuntar comprobante",
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
                            Pago seguro Flow.cl por{" "}
                            {formatCLP(activeReservation.depositAmount)}
                          </p>
                          <p className="text-xs mt-1">
                            Al verificarse el pago dentro del plazo de{" "}
                            {settings.holdDurationMinutes} minutos, tu reserva se confirma
                            automáticamente.
                          </p>
                        </div>
                      </div>

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
                        <span className="text-xs font-semibold text-forest">
                          Adjuntar archivo
                        </span>
                      </label>

                      <p className="text-xs text-ocean/70 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                        Al adjuntar tu comprobante, la reserva queda pendiente de validación por
                        administración evitando duplicidad de fechas.
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
          <ScrollReveal y={24} delay={0.1}>
          <div className="rounded-3xl glass-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-ocean/10">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-sunset font-semibold">
                  Resumen Previo al Pago
                </p>
                <h3 className="font-serif text-2xl font-semibold text-ocean">
                  {profile.name}
                </h3>
                <p className="text-xs text-ocean/60">{profile.capacityLabel}</p>
              </div>
              <Calendar className="w-5 h-5 text-forest" />
            </div>

            {checkIn && checkOut && quote ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-sand/70 p-3">
                    <span className="text-ocean/55 block uppercase tracking-wider text-[10px]">
                      Ingreso
                    </span>
                    <span className="font-semibold text-ocean text-sm mt-0.5 block">
                      {formatDateES(checkIn)}
                    </span>
                    <span className="text-ocean/55">Desde 15:00 hrs</span>
                  </div>
                  <div className="rounded-2xl bg-sand/70 p-3">
                    <span className="text-ocean/55 block uppercase tracking-wider text-[10px]">
                      Salida
                    </span>
                    <span className="font-semibold text-ocean text-sm mt-0.5 block">
                      {formatDateES(checkOut)}
                    </span>
                    <span className="text-ocean/55">Hasta 12:00 hrs</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-sand/50 px-3.5 py-2.5 text-xs text-ocean/80 flex items-center justify-between">
                  <span>Huéspedes</span>
                  <span className="font-semibold text-ocean">
                    {adults} ad.
                    {children7Plus > 0 ? ` · ${children7Plus} (7+)` : ""}
                    {children2To6 > 0 ? ` · ${children2To6} (2–6)` : ""}
                    {childrenUnder2 > 0 ? ` · ${childrenUnder2} (<2)` : ""}
                  </span>
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
                      {formatCLP(quote.nightlyRatePerNight)} × {quote.nights}{" "}
                      {quote.nights === 1 ? "noche" : "noches"}
                    </span>
                    <span className="font-medium">{formatCLP(quote.nightlySubtotal)}</span>
                  </div>
                  {quote.child2To6FeeTotal > 0 && (
                    <div className="flex justify-between text-ocean/80">
                      <span>
                        Niños 2–6 años ({children2To6} × {formatCLP(settings.child2To6NightlyFee)}{" "}
                        × {quote.nights}n)
                      </span>
                      <span className="font-medium">{formatCLP(quote.child2To6FeeTotal)}</span>
                    </div>
                  )}
                  {quote.breakfastTotal > 0 && (
                    <div className="flex justify-between text-ocean/80">
                      <span>Desayuno ({breakfastChoice})</span>
                      <span className="font-medium">{formatCLP(quote.breakfastTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-ocean/10 text-base font-bold text-ocean">
                    <span>Valor total estadía</span>
                    <span>{formatCLP(quote.totalAmount)}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-forest/8 border border-forest/15 p-4 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-forest text-sm">
                    <span>Abono requerido (50%)</span>
                    <span>{formatCLP(quote.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-ocean/70">
                    <span>Saldo pendiente (50%)</span>
                    <span>{formatCLP(quote.balanceAmount)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-ocean/60">
                Selecciona tu fecha de ingreso y salida en el calendario de{" "}
                <strong>{profile.name}</strong> para calcular tu estadía en tiempo real.
              </div>
            )}

            <div className="text-[11px] text-ocean/55 pt-2 border-t border-ocean/10 space-y-1">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                Plazo de bloqueo temporal: {settings.holdDurationMinutes} minutos.
              </p>
              <p className="flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-sunset" />
                No se admiten mascotas (salvo perros de asistencia).
              </p>
            </div>
          </div>
          </ScrollReveal>
        </aside>
      </div>

      {/* Mobile Sticky Bottom Live Quote Bar (Steps 1 & 2) */}
      {step !== 3 && quote && checkIn && checkOut && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden px-3 pb-3 pt-2 pointer-events-none">
          <div className="pointer-events-auto rounded-2xl glass-dark shadow-[0_-10px_40px_rgba(0,0,0,0.35)] px-4 py-3 flex items-center justify-between gap-3 text-sand">
            <div className="leading-tight">
              <span className="text-[10px] uppercase tracking-wider text-cream/80 block">
                {quote.nights} {quote.nights === 1 ? "noche" : "noches"} · Abono 50%:{" "}
                <strong className="text-cream">{formatCLP(quote.depositAmount)}</strong>
              </span>
              <span className="font-serif text-xl font-semibold text-sand">
                Total {formatCLP(quote.totalAmount)}
              </span>
            </div>
            {step === 1 && (
              <button
                type="button"
                onClick={handleContinueStep2}
                disabled={!quote.meetsMinNights}
                className="h-11 px-5 rounded-xl bg-sunset text-sand font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shrink-0"
              >
                Continuar <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full Policies Modal */}
      <AnimatePresence>
        {showPoliciesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPoliciesModal(false)}
            className="fixed inset-0 z-50 bg-abyss/75 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-sunset font-bold">
                    Versión {OFFICIAL_POLICIES.version}
                  </span>
                  <h3 className="font-serif text-3xl font-semibold text-ocean">
                    Condiciones Generales y Políticas
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPoliciesModal(false)}
                  className="p-2 rounded-full hover:bg-ocean/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-ocean/80">
                <div>
                  <h4 className="font-semibold text-ocean mb-1.5">
                    Política de Cancelación
                  </h4>
                  <div className="rounded-2xl bg-sand/70 p-3.5 space-y-1.5">
                    {OFFICIAL_POLICIES.cancellationTable.map((r) => (
                      <div key={r.window} className="flex justify-between">
                        <span>{r.window}</span>
                        <strong>{r.refund}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-ocean mb-1.5">
                    Modificación de Reservas
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {OFFICIAL_POLICIES.modificationRules.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-ocean mb-1.5">
                    Política de Mascotas
                  </h4>
                  <p>
                    {OFFICIAL_POLICIES.noPetsPolicy.summary}{" "}
                    <strong>{OFFICIAL_POLICIES.noPetsPolicy.exception}</strong>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-ocean mb-1.5">
                    Normas de Convivencia y Uso de Espacios
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {HOUSE_RULES.map((rule) => (
                      <li key={rule.code}>
                        <strong>{rule.title}:</strong> {rule.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPoliciesModal(false)}
                  className="px-6 py-2.5 rounded-full bg-forest text-sand text-sm font-semibold cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
