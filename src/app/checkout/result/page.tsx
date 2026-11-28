"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { TopNav } from "@/components/brand/TopNav";
import { useNoguecheStore } from "@/lib/api/demo-store";
import { formatCLP, formatDateES } from "@/lib/utils";

function CheckoutResultContent() {
  const params = useSearchParams();
  const code = params.get("code") || "";
  const reservation = useNoguecheStore((s) =>
    s.reservations.find((r) => r.code.toUpperCase() === code.toUpperCase())
  );

  if (!reservation) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-36 pb-20 text-center">
        <div className="rounded-3xl bg-white border border-ocean/10 p-8 shadow-lg">
          <h1 className="font-serif text-3xl text-ocean font-semibold">
            No encontramos esa reserva
          </h1>
          <p className="text-sm text-ocean/70 mt-2">
            Puedes buscarla con tu código en el Portal del Huésped o iniciar una nueva
            reserva.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/mi-reserva"
              className="px-5 py-2.5 rounded-full bg-forest text-sand text-sm font-semibold"
            >
              Ir al Portal del Huésped
            </Link>
            <Link
              href="/reservar"
              className="px-5 py-2.5 rounded-full border border-ocean/20 text-ocean text-sm font-semibold"
            >
              Volver al Calendario
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = reservation.status === "PAYMENT_PROCESSING";
  const isTransferPending = reservation.status === "PENDING_TRANSFER_VALIDATION";
  const isConfirmed =
    reservation.status === "CONFIRMED_DEPOSIT" ||
    reservation.status === "CONFIRMED_FULL";

  return (
    <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white border border-ocean/10 p-7 sm:p-10 shadow-xl space-y-6"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${
              isConfirmed
                ? "bg-emerald-100 text-emerald-700"
                : isProcessing
                ? "bg-sky-100 text-sky-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isConfirmed ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Clock className="w-8 h-8" />
            )}
          </div>

          <span className="text-xs uppercase tracking-[0.22em] font-semibold text-sunset">
            Código de Reserva · {reservation.code}
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ocean mt-1">
            {isConfirmed
              ? "¡Tu reserva está confirmada!"
              : isProcessing
              ? "Verificando pago con Flow.cl..."
              : "Comprobante recibido · En validación"}
          </h1>

          <p className="text-sm text-ocean/75 mt-2 max-w-md">
            {isConfirmed
              ? `Enviamos el resumen automático a ${reservation.guestEmail}. Tus fechas ya quedaron bloqueadas definitivamente.`
              : isProcessing
              ? "Recibimos tu pago en proceso. Mantenemos tus fechas protegidas para evitar cancelaciones mientras llega la confirmación bancaria (webhook tardío)."
              : "Tu comprobante de transferencia fue registrado. Las fechas permanecen bloqueadas sin expirar hasta que Erica valide el abono en el Panel Admin."}
          </p>
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-sand/70 p-5 space-y-2.5 text-sm border border-ocean/8">
          <div className="flex justify-between">
            <span className="text-ocean/65">Alojamiento</span>
            <span className="font-semibold text-ocean">
              {reservation.accommodationName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ocean/65">Fechas</span>
            <span className="font-semibold text-ocean">
              {formatDateES(reservation.checkIn)} → {formatDateES(reservation.checkOut)} (
              {reservation.nights} noches)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ocean/65">Valor total</span>
            <span className="font-semibold text-ocean">
              {formatCLP(reservation.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ocean/65">Abono 50%</span>
            <span className="font-semibold text-forest">
              {formatCLP(reservation.paidAmount)} / {formatCLP(reservation.depositAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-ocean/10">
            <span className="text-ocean/65">Saldo pendiente antes de llaves</span>
            <span className="font-bold text-sunset">
              {formatCLP(reservation.balanceDue)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-forest/8 border border-forest/15 p-4 text-xs text-ocean/80 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <span>
            Desde tu <strong>Portal del Huésped</strong> podrás pagar el 50% restante,
            desbloquear las indicaciones exactas de llegada/llaves y consultar la Guía
            Digital 2026 de Cobquecura.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/mi-reserva?code=${encodeURIComponent(reservation.code)}`}
            className="flex-1 py-3.5 px-6 rounded-full bg-forest hover:bg-sunset text-sand font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <KeyRound className="w-4 h-4" />
            Abrir mi Portal de Huésped
            <ArrowRight className="w-4 h-4" />
          </Link>
          {isTransferPending && (
            <Link
              href="/admin"
              className="py-3.5 px-5 rounded-full border border-ocean/20 text-ocean font-semibold text-sm flex items-center justify-center hover:bg-ocean/5"
            >
              Validar en Admin (demo)
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <div className="min-h-screen bg-atmosphere-mist text-ocean">
      <TopNav tone="light" />
      <Suspense
        fallback={
          <div className="max-w-xl mx-auto px-4 pt-36 text-center text-ocean/60">
            Consultando resultado del pago...
          </div>
        }
      >
        <CheckoutResultContent />
      </Suspense>
    </div>
  );
}
