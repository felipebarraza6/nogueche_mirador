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
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestRut?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  adults: number;
  hasChildOverTwo: boolean;
  bringsPet: boolean;
  breakfastChoice: BreakfastChoice;
  breakfastDays: number;
  specialRequests?: string;
  nightlySubtotal: number;
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
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  minNights: number;
  nightlyRate: number;
  appliesWeekendsOnly?: boolean;
  isActive: boolean;
}

export interface ManualBlock {
  id: string;
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

export interface PropertySettings {
  defaultMinNights: number;
  weekendMinNights: number;
  baseNightlyRate: number;
  weekendNightlyRate: number;
  childOverTwoNightlyFee: number;
  holdDurationMinutes: number;
  reminderBeforeExpiryMinutes: number;
  bankDetails: BankTransferDetails;
}

export type DayAvailabilityState =
  | "AVAILABLE"
  | "OCCUPIED"
  | "HOLD"
  | "BLOCKED"
  | "PAST";

export interface QuoteBreakdown {
  nights: number;
  minNightsRequired: number;
  meetsMinNights: boolean;
  ruleAppliedName: string;
  nightlySubtotal: number;
  childFeeTotal: number;
  breakfastTotal: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
}
