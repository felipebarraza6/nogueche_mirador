"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BREAKFAST_OPTIONS } from "@/lib/guide-data";
import { addDaysISO, diffNights, eachNightISO, toISODate } from "@/lib/utils";
import type {
  AuditEvent,
  BreakfastChoice,
  DayAvailabilityState,
  ManualBlock,
  PaymentMethod,
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

function makeInitialData() {
  const today = toISODate(new Date());
  const d1In = addDaysISO(today, 3);
  const d1Out = addDaysISO(today, 6);
  const d2In = addDaysISO(today, 10);
  const d2Out = addDaysISO(today, 13);
  const d3In = addDaysISO(today, 17);
  const d3Out = addDaysISO(today, 19);
  const d4In = addDaysISO(today, 23);
  const d4Out = addDaysISO(today, 26);

  const settings: PropertySettings = {
    defaultMinNights: 2,
    weekendMinNights: 2,
    baseNightlyRate: 95000,
    weekendNightlyRate: 115000,
    childOverTwoNightlyFee: 15000,
    holdDurationMinutes: 30,
    reminderBeforeExpiryMinutes: 5,
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
      id: "season-verano",
      name: "Temporada Alta Verano",
      startDate: "2026-12-15",
      endDate: "2027-03-15",
      minNights: 2,
      nightlyRate: 125000,
      isActive: true,
    },
    {
      id: "season-baja-otono",
      name: "Temporada Baja (1 noche permitida)",
      startDate: "2026-05-01",
      endDate: "2026-08-31",
      minNights: 1,
      nightlyRate: 85000,
      isActive: true,
    },
    {
      id: "season-feriados",
      name: "Fines de Semana Largos y Feriados",
      startDate: addDaysISO(today, 14),
      endDate: addDaysISO(today, 21),
      minNights: 2,
      nightlyRate: 120000,
      isActive: true,
    },
  ];

  const manualBlocks: ManualBlock[] = [
    {
      id: "blk-maint-1",
      startDate: addDaysISO(today, 28),
      endDate: addDaysISO(today, 30),
      reason: "Mantención terraza y sellado de madera",
      source: "MAINTENANCE",
    },
  ];

  const reservations: Reservation[] = [
    {
      id: "res-demo-full",
      code: "NOG-2026-841",
      magicToken: "tok-demo-841",
      guestName: "Camila Morales",
      guestEmail: "camila.morales@ejemplo.cl",
      guestPhone: "+56 9 8412 3340",
      checkIn: d1In,
      checkOut: d1Out,
      nights: 3,
      adults: 2,
      hasChildOverTwo: false,
      bringsPet: true,
      breakfastChoice: "especial",
      breakfastDays: 2,
      specialRequests: "Llegamos cerca de las 15:30 hrs con nuestra perrita Luna.",
      nightlySubtotal: 305000,
      extrasSubtotal: 32000,
      totalAmount: 337000,
      depositAmount: 168500,
      paidAmount: 337000,
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
          title: "Reserva iniciada · Hold 30 min",
          detail: "Bloqueo atómico creado en servidor por 3 noches.",
        },
        {
          id: "ev-2",
          at: new Date(Date.now() - 172000000).toISOString(),
          actor: "FLOW_WEBHOOK",
          title: "Abono 50% confirmado (Flow Crédito)",
          detail: "Pago aprobado por $168.500. Confirmación automática enviada.",
        },
        {
          id: "ev-3",
          at: new Date(Date.now() - 43200000).toISOString(),
          actor: "FLOW_WEBHOOK",
          title: "Saldo 50% pagado · Acceso desbloqueado",
          detail: "100% pagado. Indicaciones de llegada, llaves y Wi-Fi liberados.",
        },
      ],
    },
    {
      id: "res-demo-deposit",
      code: "NOG-2026-512",
      magicToken: "tok-demo-512",
      guestName: "Martín Sepúlveda",
      guestEmail: "martin.sepulveda@ejemplo.cl",
      guestPhone: "+56 9 7731 9021",
      checkIn: d2In,
      checkOut: d2Out,
      nights: 3,
      adults: 2,
      hasChildOverTwo: true,
      bringsPet: false,
      breakfastChoice: "clasico",
      breakfastDays: 3,
      nightlySubtotal: 305000,
      extrasSubtotal: 75000,
      totalAmount: 380000,
      depositAmount: 190000,
      paidAmount: 190000,
      balanceDue: 190000,
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
          title: "Reserva iniciada · Hold 30 min",
          detail: "2 adultos + 1 niño > 2 años + desayuno clásico.",
        },
        {
          id: "ev-5",
          at: new Date(Date.now() - 36000000).toISOString(),
          actor: "FLOW_WEBHOOK",
          title: "Abono 50% confirmado (Flow Débito)",
          detail: "Abono $190.000 recibido. Saldo pendiente $190.000 antes de llaves.",
        },
      ],
    },
    {
      id: "res-demo-transfer",
      code: "NOG-2026-609",
      magicToken: "tok-demo-609",
      guestName: "Valentina Rojas",
      guestEmail: "valentina.rojas@ejemplo.cl",
      guestPhone: "+56 9 6220 4418",
      checkIn: d3In,
      checkOut: d3Out,
      nights: 2,
      adults: 2,
      hasChildOverTwo: false,
      bringsPet: false,
      breakfastChoice: "none",
      breakfastDays: 0,
      nightlySubtotal: 240000,
      extrasSubtotal: 0,
      totalAmount: 240000,
      depositAmount: 120000,
      paidAmount: 0,
      balanceDue: 240000,
      status: "PENDING_TRANSFER_VALIDATION",
      paymentMethod: "BANK_TRANSFER",
      holdExpiresAt: new Date(Date.now() + 18 * 60000).toISOString(),
      reminder5mSent: false,
      balanceReminderSent: false,
      accessUnlocked: false,
      depositTransferProof: {
        reference: "TRF-9984120",
        bankName: "Banco de Chile",
        holderName: "Valentina Rojas Fuentes",
        amount: 120000,
        uploadedAt: new Date(Date.now() - 9 * 60000).toISOString(),
        fileName: "comprobante_abono_nogueche.pdf",
        notes: "Transferencia realizada desde app Banco de Chile.",
      },
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      auditLog: [
        {
          id: "ev-6",
          at: new Date(Date.now() - 12 * 60000).toISOString(),
          actor: "GUEST",
          title: "Reserva iniciada · Hold 30 min",
          detail: "Fechas bloqueadas temporalmente en servidor.",
        },
        {
          id: "ev-7",
          at: new Date(Date.now() - 9 * 60000).toISOString(),
          actor: "GUEST",
          title: "Comprobante de transferencia subido",
          detail:
            "Ref TRF-9984120 por $120.000. Auto-cancelación pausada hasta validación.",
        },
      ],
    },
    {
      id: "res-demo-hold",
      code: "NOG-2026-733",
      magicToken: "tok-demo-733",
      guestName: "Diego Contreras",
      guestEmail: "diego.contreras@ejemplo.cl",
      guestPhone: "+56 9 9104 8812",
      checkIn: d4In,
      checkOut: d4Out,
      nights: 3,
      adults: 2,
      hasChildOverTwo: false,
      bringsPet: false,
      breakfastChoice: "clasico",
      breakfastDays: 2,
      nightlySubtotal: 305000,
      extrasSubtotal: 20000,
      totalAmount: 325000,
      depositAmount: 162500,
      paidAmount: 0,
      balanceDue: 325000,
      status: "HOLD",
      holdExpiresAt: new Date(Date.now() + 24 * 60000).toISOString(),
      reminder5mSent: false,
      balanceReminderSent: false,
      accessUnlocked: false,
      createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
      auditLog: [
        {
          id: "ev-8",
          at: new Date(Date.now() - 6 * 60000).toISOString(),
          actor: "GUEST",
          title: "Hold temporal activo (30 min)",
          detail: "Esperando pago de abono 50% ($162.500).",
        },
      ],
    },
  ];

  return { settings, seasonRules, manualBlocks, reservations };
}

export interface CreateHoldInput {
  checkIn: string;
  checkOut: string;
  adults: number;
  hasChildOverTwo: boolean;
  bringsPet: boolean;
  breakfastChoice: BreakfastChoice;
  breakfastDays: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestRut?: string;
  specialRequests?: string;
}

interface NoguecheStoreState {
  settings: PropertySettings;
  seasonRules: SeasonRule[];
  manualBlocks: ManualBlock[];
  reservations: Reservation[];
  activeHoldId: string | null;

  // Queries
  getDayState: (isoDate: string) => DayAvailabilityState;
  getQuote: (
    checkIn: string,
    checkOut: string,
    adults: number,
    hasChildOverTwo: boolean,
    breakfastChoice: BreakfastChoice,
    breakfastDays: number
  ) => QuoteBreakdown;
  isRangeAvailable: (checkIn: string, checkOut: string) => {
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

  // Server-like Celery reconciliation
  runExpirationSweep: () => void;

  // Admin Mutations
  approveTransfer: (reservationId: string, stage: "deposit" | "balance") => void;
  rejectTransfer: (reservationId: string, reason: string) => void;
  markBalancePaidManual: (reservationId: string) => void;
  cancelReservationAdmin: (reservationId: string, reason: string) => void;
  addManualBlock: (block: Omit<ManualBlock, "id">) => void;
  removeManualBlock: (blockId: string) => void;
  updateSettings: (partial: Partial<PropertySettings>) => void;
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

      getDayState: (isoDate: string): DayAvailabilityState => {
        const today = toISODate(new Date());
        if (isoDate < today) return "PAST";

        const { manualBlocks, reservations } = get();
        const isBlocked = manualBlocks.some(
          (b) => isoDate >= b.startDate && isoDate < b.endDate
        );
        if (isBlocked) return "BLOCKED";

        const activeConfirmed = reservations.some(
          (r) =>
            (r.status === "CONFIRMED_DEPOSIT" || r.status === "CONFIRMED_FULL") &&
            isoDate >= r.checkIn &&
            isoDate < r.checkOut
        );
        if (activeConfirmed) return "OCCUPIED";

        const activeHold = reservations.some(
          (r) =>
            (r.status === "HOLD" ||
              r.status === "PAYMENT_PROCESSING" ||
              r.status === "PENDING_TRANSFER_VALIDATION") &&
            isoDate >= r.checkIn &&
            isoDate < r.checkOut
        );
        if (activeHold) return "HOLD";

        return "AVAILABLE";
      },

      isRangeAvailable: (checkIn: string, checkOut: string) => {
        const nights = eachNightISO(checkIn, checkOut);
        if (nights.length === 0) return { ok: false };
        for (const night of nights) {
          const state = get().getDayState(night);
          if (state !== "AVAILABLE") {
            return { ok: false, conflictDate: night };
          }
        }
        return { ok: true };
      },

      getQuote: (
        checkIn,
        checkOut,
        adults,
        hasChildOverTwo,
        breakfastChoice,
        breakfastDays
      ): QuoteBreakdown => {
        const { settings, seasonRules } = get();
        const nightDates = eachNightISO(checkIn, checkOut);
        const nights = nightDates.length;

        let minNightsRequired = settings.defaultMinNights;
        let ruleAppliedName = `Tarifa general (mín. ${settings.defaultMinNights} noches)`;
        let nightlySubtotal = 0;

        for (const night of nightDates) {
          const d = new Date(`${night}T00:00:00`);
          const day = d.getDay(); // 0 Sun, 5 Fri, 6 Sat
          const isWeekend = day === 5 || day === 6;

          const matchedRule = seasonRules.find(
            (r) => r.isActive && night >= r.startDate && night <= r.endDate
          );

          if (matchedRule) {
            nightlySubtotal += matchedRule.nightlyRate;
            // Si hay regla de temporada baja (1 noche) y no es fin de semana, permitir 1 noche
            if (matchedRule.minNights < minNightsRequired && !isWeekend) {
              minNightsRequired = matchedRule.minNights;
              ruleAppliedName = matchedRule.name;
            } else if (matchedRule.minNights >= minNightsRequired) {
              minNightsRequired = Math.max(minNightsRequired, matchedRule.minNights);
              ruleAppliedName = matchedRule.name;
            }
          } else {
            nightlySubtotal += isWeekend
              ? settings.weekendNightlyRate
              : settings.baseNightlyRate;
            if (isWeekend) {
              minNightsRequired = Math.max(
                minNightsRequired,
                settings.weekendMinNights
              );
              ruleAppliedName = `Fin de semana (mín. ${settings.weekendMinNights} noches)`;
            }
          }
        }

        // Si el usuario seleccionó solo 1 fecha aún o 1 noche, evaluar el checkIn
        if (nights === 1 && nightDates[0]) {
          const singleNight = nightDates[0];
          const d = new Date(`${singleNight}T00:00:00`);
          const isWeekend = d.getDay() === 5 || d.getDay() === 6;
          const matchedRule = seasonRules.find(
            (r) =>
              r.isActive && singleNight >= r.startDate && singleNight <= r.endDate
          );
          if (matchedRule && !isWeekend) {
            minNightsRequired = matchedRule.minNights;
            ruleAppliedName = matchedRule.name;
          }
        }

        const childFeeTotal = hasChildOverTwo
          ? nights * settings.childOverTwoNightlyFee
          : 0;

        const breakfastMeta = BREAKFAST_OPTIONS.find(
          (b) => b.id === breakfastChoice
        );
        const guestsForBreakfast = adults + (hasChildOverTwo ? 1 : 0);
        const breakfastTotal =
          breakfastMeta && breakfastDays > 0
            ? breakfastMeta.pricePerPerson * guestsForBreakfast * breakfastDays
            : 0;

        const totalAmount = nightlySubtotal + childFeeTotal + breakfastTotal;
        const depositAmount = Math.round(totalAmount * 0.5);
        const balanceAmount = totalAmount - depositAmount;

        return {
          nights,
          minNightsRequired,
          meetsMinNights: nights >= minNightsRequired,
          ruleAppliedName,
          nightlySubtotal,
          childFeeTotal,
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
        const avail = get().isRangeAvailable(input.checkIn, input.checkOut);
        if (!avail.ok) {
          return {
            ok: false,
            error: `La fecha ${avail.conflictDate || ""} acaba de ser bloqueada por otra reserva. Selecciona otro rango.`,
          };
        }

        const quote = get().getQuote(
          input.checkIn,
          input.checkOut,
          input.adults,
          input.hasChildOverTwo,
          input.breakfastChoice,
          input.breakfastDays
        );

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

        const reservation: Reservation = {
          id,
          code,
          magicToken,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          guestRut: input.guestRut,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          nights: quote.nights,
          adults: input.adults,
          hasChildOverTwo: input.hasChildOverTwo,
          bringsPet: input.bringsPet,
          breakfastChoice: input.breakfastChoice,
          breakfastDays: input.breakfastDays,
          specialRequests: input.specialRequests,
          nightlySubtotal: quote.nightlySubtotal,
          extrasSubtotal: quote.childFeeTotal + quote.breakfastTotal,
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
              title: `Hold atómico de ${get().settings.holdDurationMinutes} min creado`,
              detail: `Fechas ${input.checkIn} → ${input.checkOut} bloqueadas en servidor para evitar sobreventa.`,
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

          // Simula llegada tardía de webhook Flow (3.5s) y confirmación idempotente
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
                          title: "Webhook tardío recibido · Abono 50% confirmado",
                          detail: `Pago verificado con Flow getStatus. Reserva confirmada y mensaje enviado a ${r.guestEmail}.`,
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
                      detail: `Confirmación automática enviada a ${r.guestEmail}. Saldo pendiente del 50% antes de entrega de llaves.`,
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
                      title: "Comprobante de transferencia enviado",
                      detail: `Ref ${proof.reference} (${proof.bankName}). Fechas protegidas contra expiración mientras la anfitriona valida el abono.`,
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
                        "100% de la estadía saldada. Indicaciones de acceso, ubicación exacta y llaves desbloqueadas.",
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
                      detail: `Ref ${proof.reference} pendiente de validación por la anfitriona para liberar acceso y llaves.`,
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
              // Nunca cancelar automáticamente PAYMENT_PROCESSING ni PENDING_TRANSFER_VALIDATION
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
                    title: "Hold expirado · Fechas liberadas automáticamente",
                    detail:
                      "Se verificó que no existían pagos en Flow ni transferencias pendientes antes de liberar.",
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
                      "Reserva confirmada definitivamente. Mensaje de confirmación enviado al huésped.",
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
                    "Estadía 100% pagada. Indicaciones de acceso y llaves desbloqueadas en Portal del Huésped.",
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
                      title: "Saldo 50% registrado por anfitriona",
                      detail: "Acceso, ubicación exacta y llaves habilitados para el huésped.",
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
            seasonRules: [
              ...state.seasonRules,
              { ...rule, id: uid("season") },
            ],
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
      name: "mirador-nogueche-store-v1",
    }
  )
);
