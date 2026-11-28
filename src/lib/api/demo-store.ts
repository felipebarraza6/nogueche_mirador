"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACCOMMODATIONS, BREAKFAST_OPTIONS, POLICIES_VERSION } from "@/lib/guide-data";
import { addDaysISO, eachNightISO, toISODate } from "@/lib/utils";
import type {
  AccommodationId,
  AccommodationRates,
  BreakfastChoice,
  DayAvailabilityState,
  ManualBlock,
  PropertySettings,
  QuoteBreakdown,
  Reservation,
  SeasonRule,
  TransferProof,
} from "./types";

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

export function resolveBaseNightlyRate(
  accommodationId: AccommodationId,
  regularGuests: number,
  rates: AccommodationRates
): number {
  if (accommodationId === "cabana-boutique") {
    return rates.boutique1To2;
  }
  if (regularGuests <= 2) return rates.casa1To2;
  if (regularGuests <= 4) return rates.casa3To4;
  if (regularGuests === 5) return rates.casa5;
  return rates.casa6;
}

function makeInitialData() {
  const today = toISODate(new Date());
  const d1In = addDaysISO(today, 3);
  const d1Out = addDaysISO(today, 6);
  const d2In = addDaysISO(today, 9);
  const d2Out = addDaysISO(today, 12);
  const d3In = addDaysISO(today, 15);
  const d3Out = addDaysISO(today, 17);
  const d4In = addDaysISO(today, 20);
  const d4Out = addDaysISO(today, 23);

  const settings: PropertySettings = {
    highSeasonStart: "2026-12-01",
    highSeasonEnd: "2027-02-28",
    highSeasonMinNights: 2,
    weekendMinNights: 2,
    offSeasonWeekdayMinNights: 1,
    child2To6NightlyFee: 5000,
    holdDurationMinutes: 15,
    reminderBeforeExpiryMinutes: 5,
    rates: {
      boutique1To2: 60000,
      casa1To2: 65000,
      casa3To4: 75000,
      casa5: 85000,
      casa6: 95000,
    },
    bankDetails: {
      bankName: "Banco Estado / Cuenta Corriente",
      accountType: "Cuenta Corriente",
      accountNumber: "000-123456-78",
      holderName: "Erica Astudillo · Mirador de Nogueche",
      holderRut: "14.582.910-K",
      email: "reservas@miradordenogueche.cl",
    },
  };

  const seasonRules: SeasonRule[] = [
    {
      id: "season-alta-2026-2027",
      accommodationId: "ALL",
      name: "Temporada Alta 2026–2027 (01 dic – 28 feb)",
      startDate: "2026-12-01",
      endDate: "2027-02-28",
      minNights: 2,
      rateModifierPercent: 0,
      isActive: true,
    },
    {
      id: "season-baja-semana",
      accommodationId: "ALL",
      name: "Resto del año · Lunes a Jueves (1 noche)",
      startDate: "2027-03-01",
      endDate: "2027-11-30",
      minNights: 1,
      rateModifierPercent: 0,
      isActive: true,
    },
  ];

  const manualBlocks: ManualBlock[] = [
    {
      id: "blk-maint-1",
      accommodationId: "cabana-boutique",
      startDate: addDaysISO(today, 26),
      endDate: addDaysISO(today, 28),
      reason: "Mantención terraza y sellado de madera",
      source: "MAINTENANCE",
    },
  ];

  const reservations: Reservation[] = [
    {
      id: "res-demo-full",
      code: "NOG-2026-841",
      magicToken: "tok-demo-841",
      accommodationId: "cabana-boutique",
      accommodationName: "Cabaña Boutique",
      guestName: "Camila Morales",
      guestDocument: "18.412.903-4",
      guestEmail: "camila.morales@ejemplo.cl",
      guestPhone: "+56 9 8412 3340",
      guestCity: "Concepción",
      checkIn: d1In,
      checkOut: d1Out,
      nights: 3,
      adults: 2,
      childrenUnder2: 0,
      children2To6: 0,
      children7Plus: 0,
      companionNames: "Matías Fuentes (18.210.441-K)",
      vehiclePlate: "KLRT-42",
      breakfastChoice: "especial",
      breakfastDays: 2,
      specialRequests: "Llegamos cerca de las 15:30 hrs.",
      acceptedCancellationPolicy: true,
      acceptedHouseRules: true,
      acceptedPoliciesAt: new Date(Date.now() - 172800000).toISOString(),
      acceptedPoliciesVersion: POLICIES_VERSION,
      lockboxCode: "4829#",
      nightlySubtotal: 180000, // 3 x $60.000
      child2To6FeeTotal: 0,
      breakfastTotal: 32000, // 2p x 2d x $8.000
      extrasSubtotal: 32000,
      totalAmount: 212000,
      depositAmount: 106000,
      paidAmount: 212000,
      balanceDue: 0,
      status: "CONFIRMED_FULL",
      paymentMethod: "FLOW_CREDIT",
      holdExpiresAt: new Date(Date.now() - 86400000).toISOString(),
      reminder5mSent: false,
      balanceReminderSent: true,
      confirmationSentAt: new Date(Date.now() - 172800000).toISOString(),
      accessUnlocked: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      auditLog: [
        {
          id: "ev-1",
          at: new Date(Date.now() - 172800000).toISOString(),
          actor: "GUEST",
          title: "Reserva iniciada · Hold 15 min (Cabaña Boutique)",
          detail: "Bloqueo temporal creado por 3 noches ($60.000/noche). Políticas nov-2026-v1 aceptadas.",
        },
        {
          id: "ev-2",
          at: new Date(Date.now() - 172000000).toISOString(),
          actor: "FLOW_WEBHOOK",
          title: "Abono 50% confirmado (Flow Crédito)",
          detail: "Pago aprobado por $106.000. Confirmación automática enviada.",
        },
        {
          id: "ev-3",
          at: new Date(Date.now() - 43200000).toISOString(),
          actor: "FLOW_WEBHOOK",
          title: "Saldo 50% pagado · Código de caja de seguridad liberado",
          detail: "100% pagado. Código de llaves, ubicación exacta y Wi-Fi desbloqueados.",
        },
      ],
    },
    {
      id: "res-demo-deposit",
      code: "NOG-2026-512",
      magicToken: "tok-demo-512",
      accommodationId: "casa-mirador",
      accommodationName: "Casa Mirador",
      guestName: "Martín Sepúlveda",
      guestDocument: "16.902.115-2",
      guestEmail: "martin.sepulveda@ejemplo.cl",
      guestPhone: "+56 9 7731 9021",
      guestCity: "Chillán",
      checkIn: d2In,
      checkOut: d2Out,
      nights: 3,
      adults: 3,
      childrenUnder2: 0,
      children2To6: 1,
      children7Plus: 1,
      childrenAges: "4 años y 9 años",
      companionNames: "Sofía Rojas, Tomás Sepúlveda (9), Emilia Sepúlveda (4)",
      vehiclePlate: "PBDX-88",
      breakfastChoice: "none",
      breakfastDays: 0,
      acceptedCancellationPolicy: true,
      acceptedHouseRules: true,
      acceptedPoliciesAt: new Date(Date.now() - 36500000).toISOString(),
      acceptedPoliciesVersion: POLICIES_VERSION,
      lockboxCode: "7315#",
      nightlySubtotal: 225000, // 4 regulares (3 adultos + 1 niño >=7) -> $75.000 x 3
      child2To6FeeTotal: 15000, // 1 niño 2-6 compartiendo cama -> $5.000 x 3
      breakfastTotal: 0,
      extrasSubtotal: 15000,
      totalAmount: 240000,
      depositAmount: 120000,
      paidAmount: 120000,
      balanceDue: 120000,
      status: "CONFIRMED_DEPOSIT",
      paymentMethod: "FLOW_DEBIT",
      holdExpiresAt: new Date(Date.now() - 36000000).toISOString(),
      reminder5mSent: false,
      balanceReminderSent: true,
      confirmationSentAt: new Date(Date.now() - 36000000).toISOString(),
      accessUnlocked: false,
      createdAt: new Date(Date.now() - 36500000).toISOString(),
      auditLog: [
        {
          id: "ev-4",
          at: new Date(Date.now() - 36500000).toISOString(),
          actor: "GUEST",
          title: "Reserva iniciada · Hold 15 min (Casa Mirador)",
          detail: "3 adultos + 1 niño 7+ (tarifa 3-4 pers. $75.000/n) + 1 niño 4 años ($5.000/n).",
        },
        {
          id: "ev-5",
          at: new Date(Date.now() - 36000000).toISOString(),
          actor: "FLOW_WEBHOOK",
          title: "Abono 50% confirmado (Flow Débito)",
          detail: "Abono $120.000 recibido. Saldo pendiente $120.000 antes del ingreso.",
        },
      ],
    },
    {
      id: "res-demo-transfer",
      code: "NOG-2026-609",
      magicToken: "tok-demo-609",
      accommodationId: "casa-mirador",
      accommodationName: "Casa Mirador",
      guestName: "Valentina Rojas",
      guestDocument: "19.334.812-7",
      guestEmail: "valentina.rojas@ejemplo.cl",
      guestPhone: "+56 9 6220 4418",
      guestCity: "Santiago",
      checkIn: d3In,
      checkOut: d3Out,
      nights: 2,
      adults: 5,
      childrenUnder2: 1,
      children2To6: 0,
      children7Plus: 0,
      childrenAges: "1 año (sin costo)",
      companionNames: "4 adultos acompañantes + bebé 1 año",
      vehiclePlate: "RTHJ-19",
      breakfastChoice: "none",
      breakfastDays: 0,
      acceptedCancellationPolicy: true,
      acceptedHouseRules: true,
      acceptedPoliciesAt: new Date(Date.now() - 10 * 60000).toISOString(),
      acceptedPoliciesVersion: POLICIES_VERSION,
      lockboxCode: "6194#",
      nightlySubtotal: 170000, // 5 personas -> $85.000 x 2
      child2To6FeeTotal: 0,
      breakfastTotal: 0,
      extrasSubtotal: 0,
      totalAmount: 170000,
      depositAmount: 85000,
      paidAmount: 0,
      balanceDue: 170000,
      status: "PENDING_TRANSFER_VALIDATION",
      paymentMethod: "BANK_TRANSFER",
      holdExpiresAt: new Date(Date.now() + 10 * 60000).toISOString(),
      reminder5mSent: false,
      balanceReminderSent: false,
      accessUnlocked: false,
      depositTransferProof: {
        reference: "TRF-9984120",
        bankName: "Banco de Chile",
        holderName: "Valentina Rojas Fuentes",
        amount: 85000,
        uploadedAt: new Date(Date.now() - 7 * 60000).toISOString(),
        fileName: "comprobante_abono_nogueche.pdf",
        notes: "Transferencia realizada desde app Banco de Chile.",
      },
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      auditLog: [
        {
          id: "ev-6",
          at: new Date(Date.now() - 10 * 60000).toISOString(),
          actor: "GUEST",
          title: "Reserva iniciada · Hold 15 min (Casa Mirador)",
          detail: "5 adultos + 1 menor de 2 años sin costo. $85.000/noche x 2 noches.",
        },
        {
          id: "ev-7",
          at: new Date(Date.now() - 7 * 60000).toISOString(),
          actor: "GUEST",
          title: "Comprobante de transferencia subido",
          detail:
            "Ref TRF-9984120 por $85.000. Fechas protegidas hasta validación de administración.",
        },
      ],
    },
    {
      id: "res-demo-hold",
      code: "NOG-2026-733",
      magicToken: "tok-demo-733",
      accommodationId: "cabana-boutique",
      accommodationName: "Cabaña Boutique",
      guestName: "Diego Contreras",
      guestDocument: "17.881.209-K",
      guestEmail: "diego.contreras@ejemplo.cl",
      guestPhone: "+56 9 9104 8812",
      guestCity: "Talca",
      checkIn: d4In,
      checkOut: d4Out,
      nights: 3,
      adults: 2,
      childrenUnder2: 0,
      children2To6: 0,
      children7Plus: 0,
      companionNames: "Fernanda Silva",
      vehiclePlate: "GHYT-55",
      breakfastChoice: "clasico",
      breakfastDays: 2,
      acceptedCancellationPolicy: true,
      acceptedHouseRules: true,
      acceptedPoliciesAt: new Date(Date.now() - 3 * 60000).toISOString(),
      acceptedPoliciesVersion: POLICIES_VERSION,
      lockboxCode: "3902#",
      nightlySubtotal: 180000, // 3 x $60.000
      child2To6FeeTotal: 0,
      breakfastTotal: 20000, // 2p x 2d x $5.000
      extrasSubtotal: 20000,
      totalAmount: 200000,
      depositAmount: 100000,
      paidAmount: 0,
      balanceDue: 200000,
      status: "HOLD",
      holdExpiresAt: new Date(Date.now() + 12 * 60000).toISOString(),
      reminder5mSent: false,
      balanceReminderSent: false,
      accessUnlocked: false,
      createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      auditLog: [
        {
          id: "ev-8",
          at: new Date(Date.now() - 3 * 60000).toISOString(),
          actor: "GUEST",
          title: "Hold temporal activo (15 min · Cabaña Boutique)",
          detail: "Esperando pago de abono 50% ($100.000).",
        },
      ],
    },
  ];

  return { settings, seasonRules, manualBlocks, reservations };
}

export interface CreateHoldInput {
  accommodationId: AccommodationId;
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenUnder2: number;
  children2To6: number;
  children7Plus: number;
  childrenAges?: string;
  companionNames?: string;
  vehiclePlate?: string;
  breakfastChoice: BreakfastChoice;
  breakfastDays: number;
  guestName: string;
  guestDocument: string;
  guestEmail: string;
  guestPhone: string;
  guestCity: string;
  specialRequests?: string;
  acceptedCancellationPolicy: boolean;
  acceptedHouseRules: boolean;
}

interface NoguecheStoreState {
  settings: PropertySettings;
  seasonRules: SeasonRule[];
  manualBlocks: ManualBlock[];
  reservations: Reservation[];
  activeHoldId: string | null;

  // Queries
  getDayState: (accommodationId: AccommodationId, isoDate: string) => DayAvailabilityState;
  getQuote: (
    accommodationId: AccommodationId,
    checkIn: string,
    checkOut: string,
    adults: number,
    childrenUnder2: number,
    children2To6: number,
    children7Plus: number,
    breakfastChoice: BreakfastChoice,
    breakfastDays: number
  ) => QuoteBreakdown;
  isRangeAvailable: (
    accommodationId: AccommodationId,
    checkIn: string,
    checkOut: string
  ) => {
    ok: boolean;
    conflictDate?: string;
  };
  findReservation: (code: string, email?: string) => Reservation | undefined;

  // Guest Mutations
  createHoldReservation: (
    input: CreateHoldInput
  ) => { ok: true; reservation: Reservation } | { ok: false; error: string };
  payDepositFlow: (
    reservationId: string,
    method: "FLOW_DEBIT" | "FLOW_CREDIT",
    simulateDelayedWebhook?: boolean
  ) => void;
  submitDepositTransfer: (reservationId: string, proof: Omit<TransferProof, "uploadedAt">) => void;
  payBalanceFlow: (
    reservationId: string,
    method: "FLOW_DEBIT" | "FLOW_CREDIT"
  ) => void;
  submitBalanceTransfer: (
    reservationId: string,
    proof: Omit<TransferProof, "uploadedAt">
  ) => void;

  // Server-like reconciliation
  runExpirationSweep: () => void;

  // Admin Mutations
  approveTransfer: (reservationId: string, stage: "deposit" | "balance") => void;
  rejectTransfer: (reservationId: string, reason: string) => void;
  markBalancePaidManual: (reservationId: string) => void;
  cancelReservationAdmin: (reservationId: string, reason: string) => void;
  addManualBlock: (block: Omit<ManualBlock, "id">) => void;
  removeManualBlock: (blockId: string) => void;
  updateSettings: (partial: Partial<PropertySettings>) => void;
  updateRates: (partial: Partial<AccommodationRates>) => void;
  upsertSeasonRule: (rule: Omit<SeasonRule, "id"> & { id?: string }) => void;
  toggleSeasonRule: (ruleId: string) => void;
  deleteSeasonRule: (ruleId: string) => void;
  resetDemoData: () => void;
}

const initial = makeInitialData();

export const useNoguecheStore = create<NoguecheStoreState>()(
  persist(
    (set, get) => ({
      settings: initial.settings,
      seasonRules: initial.seasonRules,
      manualBlocks: initial.manualBlocks,
      reservations: initial.reservations,
      activeHoldId: null,

      getDayState: (accommodationId: AccommodationId, isoDate: string): DayAvailabilityState => {
        const today = toISODate(new Date());
        if (isoDate < today) return "PAST";

        const { manualBlocks, reservations } = get();
        const isBlocked = manualBlocks.some(
          (b) =>
            (b.accommodationId === "ALL" || b.accommodationId === accommodationId) &&
            isoDate >= b.startDate &&
            isoDate < b.endDate
        );
        if (isBlocked) return "BLOCKED";

        const activeConfirmed = reservations.some(
          (r) =>
            r.accommodationId === accommodationId &&
            (r.status === "CONFIRMED_DEPOSIT" || r.status === "CONFIRMED_FULL") &&
            isoDate >= r.checkIn &&
            isoDate < r.checkOut
        );
        if (activeConfirmed) return "OCCUPIED";

        const activeHold = reservations.some(
          (r) =>
            r.accommodationId === accommodationId &&
            (r.status === "HOLD" ||
              r.status === "PAYMENT_PROCESSING" ||
              r.status === "PENDING_TRANSFER_VALIDATION") &&
            isoDate >= r.checkIn &&
            isoDate < r.checkOut
        );
        if (activeHold) return "HOLD";

        return "AVAILABLE";
      },

      isRangeAvailable: (accommodationId: AccommodationId, checkIn: string, checkOut: string) => {
        const nights = eachNightISO(checkIn, checkOut);
        if (nights.length === 0) return { ok: false };
        for (const night of nights) {
          const state = get().getDayState(accommodationId, night);
          if (state !== "AVAILABLE") {
            return { ok: false, conflictDate: night };
          }
        }
        return { ok: true };
      },

      getQuote: (
        accommodationId,
        checkIn,
        checkOut,
        adults,
        childrenUnder2,
        children2To6,
        children7Plus,
        breakfastChoice,
        breakfastDays
      ): QuoteBreakdown => {
        const { settings, seasonRules } = get();
        const profile = ACCOMMODATIONS[accommodationId];
        const nightDates = eachNightISO(checkIn, checkOut);
        const nights = nightDates.length;

        // Niños >= 7 años cuentan en tarifa regular; niños 2-6 pagan $5.000/noche sin duplicar tarifa regular
        const regularGuests = Math.max(1, adults + children7Plus);
        const totalGuests = adults + children7Plus + children2To6 + childrenUnder2;
        const exceedsCapacity =
          regularGuests > profile.maxRegularGuests ||
          adults + children7Plus + children2To6 > profile.maxTotalWithSharedChild;

        const baseNightly = resolveBaseNightlyRate(
          accommodationId,
          Math.min(regularGuests, profile.maxRegularGuests),
          settings.rates
        );

        let minNightsRequired = settings.offSeasonWeekdayMinNights;
        let ruleAppliedName = "Tarifa vigente (resto del año, entre semana)";
        let nightlySubtotal = 0;

        for (const night of nightDates) {
          const d = new Date(`${night}T00:00:00`);
          const day = d.getDay(); // 5 = Vie, 6 = Sáb
          const isWeekend = day === 5 || day === 6;
          const isHighSeason =
            night >= settings.highSeasonStart && night <= settings.highSeasonEnd;

          const matchedRule = seasonRules.find(
            (r) =>
              r.isActive &&
              (r.accommodationId === "ALL" || r.accommodationId === accommodationId) &&
              night >= r.startDate &&
              night <= r.endDate
          );

          const modifier = matchedRule ? 1 + matchedRule.rateModifierPercent / 100 : 1;
          nightlySubtotal += Math.round(baseNightly * modifier);

          if (isHighSeason) {
            minNightsRequired = Math.max(minNightsRequired, settings.highSeasonMinNights);
            ruleAppliedName = "Temporada Alta (01 dic 2026 – 28 feb 2027 · mín. 2 noches)";
          } else if (isWeekend) {
            minNightsRequired = Math.max(minNightsRequired, settings.weekendMinNights);
            ruleAppliedName = `Fin de semana (mín. ${settings.weekendMinNights} noches)`;
          } else if (matchedRule) {
            minNightsRequired = Math.max(minNightsRequired, matchedRule.minNights);
            ruleAppliedName = matchedRule.name;
          }
        }

        const child2To6FeeTotal = children2To6 * settings.child2To6NightlyFee * nights;

        const breakfastMeta = BREAKFAST_OPTIONS.find((b) => b.id === breakfastChoice);
        const guestsForBreakfast = adults + children7Plus + children2To6;
        const breakfastTotal =
          breakfastMeta && breakfastDays > 0
            ? breakfastMeta.pricePerPerson * guestsForBreakfast * breakfastDays
            : 0;

        const totalAmount = nightlySubtotal + child2To6FeeTotal + breakfastTotal;
        const depositAmount = Math.round(totalAmount * 0.5);
        const balanceAmount = totalAmount - depositAmount;

        return {
          accommodationId,
          nights,
          minNightsRequired,
          meetsMinNights: nights >= minNightsRequired,
          ruleAppliedName,
          regularGuests,
          totalGuests,
          maxCapacity: profile.maxRegularGuests,
          exceedsCapacity,
          nightlyRatePerNight: nights > 0 ? Math.round(nightlySubtotal / nights) : baseNightly,
          nightlySubtotal,
          child2To6FeeTotal,
          breakfastTotal,
          totalAmount,
          depositAmount,
          balanceAmount,
        };
      },

      findReservation: (code: string, email?: string) => {
        const cleanCode = code.trim().toUpperCase();
        const cleanEmail = email?.trim().toLowerCase();
        return get().reservations.find((r) => {
          const matchCode = r.code.toUpperCase() === cleanCode;
          if (!matchCode) return false;
          if (!cleanEmail) return true;
          return r.guestEmail.toLowerCase() === cleanEmail;
        });
      },

      createHoldReservation: (input) => {
        get().runExpirationSweep();

        if (!input.acceptedCancellationPolicy || !input.acceptedHouseRules) {
          return {
            ok: false,
            error:
              "Debes aceptar obligatoriamente las políticas de cancelación y las condiciones generales antes de continuar.",
          };
        }

        const avail = get().isRangeAvailable(
          input.accommodationId,
          input.checkIn,
          input.checkOut
        );
        if (!avail.ok) {
          return {
            ok: false,
            error: `La fecha ${avail.conflictDate || ""} no está disponible para ${ACCOMMODATIONS[input.accommodationId].name}. Selecciona otro rango.`,
          };
        }

        const quote = get().getQuote(
          input.accommodationId,
          input.checkIn,
          input.checkOut,
          input.adults,
          input.childrenUnder2,
          input.children2To6,
          input.children7Plus,
          input.breakfastChoice,
          input.breakfastDays
        );

        if (quote.exceedsCapacity) {
          return {
            ok: false,
            error: `La cantidad de huéspedes supera la capacidad máxima de ${ACCOMMODATIONS[input.accommodationId].name} (${quote.maxCapacity} personas).`,
          };
        }

        if (!quote.meetsMinNights) {
          return {
            ok: false,
            error: `La estadía mínima para estas fechas es de ${quote.minNightsRequired} noches (${quote.ruleAppliedName}).`,
          };
        }

        const holdMs = get().settings.holdDurationMinutes * 60 * 1000;
        const id = uid("res");
        const code = `NOG-2026-${Math.floor(100 + Math.random() * 900)}`;
        const magicToken = uid("tok").toLowerCase();
        const createdAt = nowISO();
        const lockboxCode = `${Math.floor(1000 + Math.random() * 9000)}#`;

        const reservation: Reservation = {
          id,
          code,
          magicToken,
          accommodationId: input.accommodationId,
          accommodationName: ACCOMMODATIONS[input.accommodationId].name,
          guestName: input.guestName,
          guestDocument: input.guestDocument,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          guestCity: input.guestCity,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          nights: quote.nights,
          adults: input.adults,
          childrenUnder2: input.childrenUnder2,
          children2To6: input.children2To6,
          children7Plus: input.children7Plus,
          childrenAges: input.childrenAges,
          companionNames: input.companionNames,
          vehiclePlate: input.vehiclePlate,
          breakfastChoice: input.breakfastChoice,
          breakfastDays: input.breakfastDays,
          specialRequests: input.specialRequests,
          acceptedCancellationPolicy: input.acceptedCancellationPolicy,
          acceptedHouseRules: input.acceptedHouseRules,
          acceptedPoliciesAt: createdAt,
          acceptedPoliciesVersion: POLICIES_VERSION,
          lockboxCode,
          nightlySubtotal: quote.nightlySubtotal,
          child2To6FeeTotal: quote.child2To6FeeTotal,
          breakfastTotal: quote.breakfastTotal,
          extrasSubtotal: quote.child2To6FeeTotal + quote.breakfastTotal,
          totalAmount: quote.totalAmount,
          depositAmount: quote.depositAmount,
          paidAmount: 0,
          balanceDue: quote.totalAmount,
          status: "HOLD",
          holdExpiresAt: new Date(Date.now() + holdMs).toISOString(),
          reminder5mSent: false,
          balanceReminderSent: false,
          accessUnlocked: false,
          createdAt,
          auditLog: [
            {
              id: uid("ev"),
              at: createdAt,
              actor: "SYSTEM",
              title: `Hold temporal de ${get().settings.holdDurationMinutes} min creado (${ACCOMMODATIONS[input.accommodationId].name})`,
              detail: `Fechas ${input.checkIn} → ${input.checkOut} bloqueadas. Condiciones versión ${POLICIES_VERSION} aceptadas por ${input.guestName}.`,
            },
          ],
        };

        set((state) => ({
          reservations: [reservation, ...state.reservations],
          activeHoldId: reservation.id,
        }));

        return { ok: true, reservation };
      },

      payDepositFlow: (reservationId, method, simulateDelayedWebhook = false) => {
        const label =
          method === "FLOW_DEBIT" ? "Tarjeta de Débito (Flow)" : "Tarjeta de Crédito (Flow)";

        if (simulateDelayedWebhook) {
          set((state) => ({
            reservations: state.reservations.map((r) =>
              r.id === reservationId
                ? {
                    ...r,
                    status: "PAYMENT_PROCESSING",
                    paymentMethod: method,
                    auditLog: [
                      ...r.auditLog,
                      {
                        id: uid("ev"),
                        at: nowISO(),
                        actor: "SYSTEM",
                        title: `Pago iniciado vía ${label}`,
                        detail:
                          "Confirmación bancaria en tránsito. Expiración automática suspendida para evitar liberar fechas.",
                      },
                    ],
                  }
                : r
            ),
          }));

          setTimeout(() => {
            set((state) => ({
              reservations: state.reservations.map((r) =>
                r.id === reservationId && r.status === "PAYMENT_PROCESSING"
                  ? {
                      ...r,
                      status: "CONFIRMED_DEPOSIT",
                      paidAmount: r.depositAmount,
                      balanceDue: r.totalAmount - r.depositAmount,
                      confirmationSentAt: nowISO(),
                      auditLog: [
                        ...r.auditLog,
                        {
                          id: uid("ev"),
                          at: nowISO(),
                          actor: "FLOW_WEBHOOK",
                          title: "Webhook recibido · Abono 50% confirmado",
                          detail: `Pago verificado. Reserva confirmada y notificación enviada a ${r.guestEmail}.`,
                        },
                      ],
                    }
                  : r
              ),
            }));
          }, 3500);
          return;
        }

        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: "CONFIRMED_DEPOSIT",
                  paymentMethod: method,
                  paidAmount: r.depositAmount,
                  balanceDue: r.totalAmount - r.depositAmount,
                  confirmationSentAt: nowISO(),
                  auditLog: [
                    ...r.auditLog,
                    {
                      id: uid("ev"),
                      at: nowISO(),
                      actor: "FLOW_WEBHOOK",
                      title: `Abono 50% confirmado vía ${label}`,
                      detail: `Confirmación automática enviada a ${r.guestEmail}. Saldo pendiente del 50% antes del ingreso para entregar el código de caja de seguridad.`,
                    },
                  ],
                }
              : r
          ),
        }));
      },

      submitDepositTransfer: (reservationId, proof) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: "PENDING_TRANSFER_VALIDATION",
                  paymentMethod: "BANK_TRANSFER",
                  depositTransferProof: { ...proof, uploadedAt: nowISO() },
                  auditLog: [
                    ...r.auditLog,
                    {
                      id: uid("ev"),
                      at: nowISO(),
                      actor: "GUEST",
                      title: "Comprobante de transferencia adjuntado",
                      detail: `Ref ${proof.reference} (${proof.bankName}). Reserva pendiente de validación por administración evitando duplicidad.`,
                    },
                  ],
                }
              : r
          ),
        }));
      },

      payBalanceFlow: (reservationId, method) => {
        const label =
          method === "FLOW_DEBIT" ? "Tarjeta de Débito (Flow)" : "Tarjeta de Crédito (Flow)";
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: "CONFIRMED_FULL",
                  paidAmount: r.totalAmount,
                  balanceDue: 0,
                  accessUnlocked: true,
                  auditLog: [
                    ...r.auditLog,
                    {
                      id: uid("ev"),
                      at: nowISO(),
                      actor: "FLOW_WEBHOOK",
                      title: `Saldo 50% pagado vía ${label}`,
                      detail:
                        "100% de la estadía saldada. Código de caja de seguridad de llaves, enlace Google Maps y Wi-Fi liberados.",
                    },
                  ],
                }
              : r
          ),
        }));
      },

      submitBalanceTransfer: (reservationId, proof) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  balanceTransferProof: { ...proof, uploadedAt: nowISO() },
                  auditLog: [
                    ...r.auditLog,
                    {
                      id: uid("ev"),
                      at: nowISO(),
                      actor: "GUEST",
                      title: "Comprobante de saldo 50% enviado",
                      detail: `Ref ${proof.reference} pendiente de validación por la administración para liberar código de caja de seguridad.`,
                    },
                  ],
                }
              : r
          ),
        }));
      },

      runExpirationSweep: () => {
        const now = Date.now();
        const warnMs = get().settings.reminderBeforeExpiryMinutes * 60 * 1000;

        set((state) => ({
          reservations: state.reservations.map((r) => {
            if (r.status !== "HOLD") {
              return r;
            }
            const exp = new Date(r.holdExpiresAt).getTime();
            const remaining = exp - now;

            if (remaining <= 0) {
              return {
                ...r,
                status: "EXPIRED",
                auditLog: [
                  ...r.auditLog,
                  {
                    id: uid("ev"),
                    at: nowISO(),
                    actor: "SYSTEM",
                    title: "Plazo de 15 min expirado · Fechas liberadas",
                    detail:
                      "No se concretó el pago dentro del plazo de 15 minutos. Fechas liberadas automáticamente.",
                  },
                ],
              };
            }

            if (remaining <= warnMs && !r.reminder5mSent) {
              return {
                ...r,
                reminder5mSent: true,
                auditLog: [
                  ...r.auditLog,
                  {
                    id: uid("ev"),
                    at: nowISO(),
                    actor: "SYSTEM",
                    title: "Recordatorio automático enviado (quedan 5 min)",
                    detail: `Aviso enviado a ${r.guestEmail} antes del vencimiento del bloqueo.`,
                  },
                ],
              };
            }

            return r;
          }),
        }));
      },

      approveTransfer: (reservationId, stage) => {
        set((state) => ({
          reservations: state.reservations.map((r) => {
            if (r.id !== reservationId) return r;
            if (stage === "deposit") {
              return {
                ...r,
                status: "CONFIRMED_DEPOSIT",
                paidAmount: r.depositAmount,
                balanceDue: r.totalAmount - r.depositAmount,
                confirmationSentAt: nowISO(),
                auditLog: [
                  ...r.auditLog,
                  {
                    id: uid("ev"),
                    at: nowISO(),
                    actor: "ADMIN",
                    title: "Transferencia de abono 50% validada",
                    detail:
                      "Reserva confirmada definitivamente. Notificación enviada al huésped.",
                  },
                ],
              };
            }
            return {
              ...r,
              status: "CONFIRMED_FULL",
              paidAmount: r.totalAmount,
              balanceDue: 0,
              accessUnlocked: true,
              auditLog: [
                ...r.auditLog,
                {
                  id: uid("ev"),
                  at: nowISO(),
                  actor: "ADMIN",
                  title: "Transferencia de saldo 50% validada",
                  detail:
                    "Estadía 100% pagada. Código de caja de seguridad de llaves desbloqueado en Portal del Huésped.",
                },
              ],
            };
          }),
        }));
      },

      rejectTransfer: (reservationId, reason) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: "CANCELLED",
                  auditLog: [
                    ...r.auditLog,
                    {
                      id: uid("ev"),
                      at: nowISO(),
                      actor: "ADMIN",
                      title: "Transferencia rechazada · Fechas liberadas",
                      detail: reason || "No se pudo verificar el abono en cuenta bancaria.",
                    },
                  ],
                }
              : r
          ),
        }));
      },

      markBalancePaidManual: (reservationId) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: "CONFIRMED_FULL",
                  paidAmount: r.totalAmount,
                  balanceDue: 0,
                  accessUnlocked: true,
                  auditLog: [
                    ...r.auditLog,
                    {
                      id: uid("ev"),
                      at: nowISO(),
                      actor: "ADMIN",
                      title: "Saldo 50% registrado por administración",
                      detail: "Código de caja de seguridad y acceso autónomo habilitados.",
                    },
                  ],
                }
              : r
          ),
        }));
      },

      cancelReservationAdmin: (reservationId, reason) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: "CANCELLED",
                  auditLog: [
                    ...r.auditLog,
                    {
                      id: uid("ev"),
                      at: nowISO(),
                      actor: "ADMIN",
                      title: "Reserva cancelada manualmente",
                      detail: reason || "Cancelada desde panel de administración.",
                    },
                  ],
                }
              : r
          ),
        }));
      },

      addManualBlock: (block) => {
        set((state) => ({
          manualBlocks: [...state.manualBlocks, { ...block, id: uid("blk") }],
        }));
      },

      removeManualBlock: (blockId) => {
        set((state) => ({
          manualBlocks: state.manualBlocks.filter((b) => b.id !== blockId),
        }));
      },

      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      updateRates: (partial) => {
        set((state) => ({
          settings: {
            ...state.settings,
            rates: { ...state.settings.rates, ...partial },
          },
        }));
      },

      upsertSeasonRule: (rule) => {
        set((state) => {
          if (rule.id) {
            return {
              seasonRules: state.seasonRules.map((s) =>
                s.id === rule.id ? { ...s, ...rule, id: s.id } : s
              ),
            };
          }
          return {
            seasonRules: [...state.seasonRules, { ...rule, id: uid("season") }],
          };
        });
      },

      toggleSeasonRule: (ruleId) => {
        set((state) => ({
          seasonRules: state.seasonRules.map((s) =>
            s.id === ruleId ? { ...s, isActive: !s.isActive } : s
          ),
        }));
      },

      deleteSeasonRule: (ruleId) => {
        set((state) => ({
          seasonRules: state.seasonRules.filter((s) => s.id !== ruleId),
        }));
      },

      resetDemoData: () => {
        const fresh = makeInitialData();
        set({
          settings: fresh.settings,
          seasonRules: fresh.seasonRules,
          manualBlocks: fresh.manualBlocks,
          reservations: fresh.reservations,
          activeHoldId: null,
        });
      },
    }),
    {
      name: "mirador-nogueche-store-v2",
    }
  )
);
