export type AccommodationId = "cabana-boutique" | "casa-mirador";

export type ReservationStatus =
  | "HOLD"
  | "PAYMENT_PROCESSING"
  | "PENDING_TRANSFER_VALIDATION"
  | "CONFIRMED_DEPOSIT"
  | "CONFIRMED_FULL"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentMethod = "FLOW_DEBIT" | "FLOW_CREDIT" | "BANK_TRANSFER";

export type BreakfastChoice = "none" | "clasico" | "especial";

export interface TransferProof {
  reference: string;
  bankName: string;
  holderName: string;
  amount: number;
  uploadedAt: string;
  fileName: string;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: "SYSTEM" | "GUEST" | "ADMIN" | "FLOW_WEBHOOK";
  title: string;
  detail: string;
}

export interface Reservation {
  id: string;
  code: string;
  magicToken: string;
  accommodationId: AccommodationId;
  accommodationName: string;
  guestName: string;
  guestDocument: string; // RUT o Pasaporte
  guestEmail: string;
  guestPhone: string;
  guestCity: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  adults: number;
  childrenUnder2: number; // Sin costo
  children2To6: number; // $5.000 por niño y por noche (compartiendo cama existente)
  children7Plus: number; // Tarifa regular según cantidad de huéspedes
  childrenAges?: string;
  companionNames?: string;
  vehiclePlate?: string;
  breakfastChoice: BreakfastChoice;
  breakfastDays: number;
  specialRequests?: string;
  acceptedCancellationPolicy: boolean;
  acceptedHouseRules: boolean;
  acceptedPoliciesAt: string; // ISO
  acceptedPoliciesVersion: string;
  lockboxCode?: string;
  nightlySubtotal: number;
  child2To6FeeTotal: number;
  breakfastTotal: number;
  extrasSubtotal: number;
  totalAmount: number;
  depositAmount: number; // 50%
  paidAmount: number;
  balanceDue: number;
  status: ReservationStatus;
  paymentMethod?: PaymentMethod;
  holdExpiresAt: string; // ISO
  reminder5mSent: boolean;
  balanceReminderSent: boolean;
  confirmationSentAt?: string;
  accessUnlocked: boolean;
  depositTransferProof?: TransferProof;
  balanceTransferProof?: TransferProof;
  createdAt: string;
  auditLog: AuditEvent[];
}

export interface SeasonRule {
  id: string;
  accommodationId: AccommodationId | "ALL";
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  minNights: number;
  rateModifierPercent: number; // 0 = tarifario oficial vigente
  isActive: boolean;
}

export interface ManualBlock {
  id: string;
  accommodationId: AccommodationId | "ALL";
  startDate: string;
  endDate: string;
  reason: string;
  source: "MAINTENANCE" | "AIRBNB" | "DIRECT_BLOCK";
}

export interface BankTransferDetails {
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderRut: string;
  email: string;
}

export interface AccommodationRates {
  boutique1To2: number; // $60.000
  casa1To2: number; // $65.000
  casa3To4: number; // $75.000
  casa5: number; // $85.000
  casa6: number; // $95.000
}

export interface PropertySettings {
  highSeasonStart: string; // 2026-12-01
  highSeasonEnd: string; // 2027-02-28
  highSeasonMinNights: number; // 2
  weekendMinNights: number; // 2
  offSeasonWeekdayMinNights: number; // 1
  child2To6NightlyFee: number; // 5000
  holdDurationMinutes: number; // 15
  reminderBeforeExpiryMinutes: number; // 5
  rates: AccommodationRates;
  bankDetails: BankTransferDetails;
}

export type DayAvailabilityState =
  | "AVAILABLE"
  | "OCCUPIED"
  | "HOLD"
  | "BLOCKED"
  | "PAST";

export interface QuoteBreakdown {
  accommodationId: AccommodationId;
  nights: number;
  minNightsRequired: number;
  meetsMinNights: boolean;
  ruleAppliedName: string;
  regularGuests: number; // adults + children7Plus
  totalGuests: number; // regularGuests + children2To6 + childrenUnder2
  maxCapacity: number;
  exceedsCapacity: boolean;
  nightlyRatePerNight: number;
  nightlySubtotal: number;
  child2To6FeeTotal: number;
  breakfastTotal: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
}
