"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Lock } from "lucide-react";
import { useNoguecheStore } from "@/lib/api/demo-store";
import type { AccommodationId } from "@/lib/api/types";
import { ACCOMMODATIONS } from "@/lib/guide-data";
import { cn, toISODate } from "@/lib/utils";

interface AvailabilityCalendarProps {
  accommodationId: AccommodationId;
  checkIn: string | null;
  checkOut: string | null;
  onSelectRange: (checkIn: string | null, checkOut: string | null) => void;
  readOnly?: boolean;
  monthsToShow?: 1 | 2;
}

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function getMonthDays(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(toISODate(new Date(year, month, d)));
  }
  return cells;
}

export function AvailabilityCalendar({
  accommodationId,
  checkIn,
  checkOut,
  onSelectRange,
  readOnly = false,
  monthsToShow = 2,
}: AvailabilityCalendarProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const getDayState = useNoguecheStore((s) => s.getDayState);
  const isRangeAvailable = useNoguecheStore((s) => s.isRangeAvailable);
  const holdMinutes = useNoguecheStore((s) => s.settings.holdDurationMinutes);
  // Subscribe to reservations & blocks so calendar re-renders immediately
  useNoguecheStore((s) => s.reservations);
  useNoguecheStore((s) => s.manualBlocks);

  const accommodationName = ACCOMMODATIONS[accommodationId].name;

  const months = useMemo(() => {
    const list: { year: number; month: number; label: string; cells: (string | null)[] }[] = [];
    for (let i = 0; i < monthsToShow; i++) {
      const d = new Date(viewYear, viewMonth + i, 1);
      const label = new Intl.DateTimeFormat("es-CL", {
        month: "long",
        year: "numeric",
      }).format(d);
      list.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label,
        cells: getMonthDays(d.getFullYear(), d.getMonth()),
      });
    }
    return list;
  }, [viewYear, viewMonth, monthsToShow]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const handleDayClick = (iso: string) => {
    if (readOnly) return;
    const state = getDayState(accommodationId, iso);
    if (state === "PAST") return;

    if (!checkIn || (checkIn && checkOut)) {
      if (state !== "AVAILABLE") return;
      onSelectRange(iso, null);
      return;
    }

    if (iso <= checkIn) {
      if (state === "AVAILABLE") {
        onSelectRange(iso, null);
      }
      return;
    }

    const check = isRangeAvailable(accommodationId, checkIn, iso);
    if (!check.ok) {
      if (state === "AVAILABLE") {
        onSelectRange(iso, null);
      }
      return;
    }

    onSelectRange(checkIn, iso);
  };

  return (
    <div className="rounded-3xl glass-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-sunset font-semibold">
            Calendario independiente · {accommodationName}
          </p>
          <p className="text-sm text-ocean/70 mt-0.5">
            {readOnly
              ? `Estado sincronizado de reservas, holds (${holdMinutes} min) y bloqueos para ${accommodationName}.`
              : checkIn && !checkOut
              ? "Ahora selecciona tu fecha de salida (check-out · hasta 12:00 hrs)."
              : "Selecciona tu fecha de ingreso (15:00 hrs) y salida (12:00 hrs)."}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Mes anterior"
            className="p-2 rounded-full border border-ocean/15 text-ocean hover:bg-ocean hover:text-sand transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Mes siguiente"
            className="p-2 rounded-full border border-ocean/15 text-ocean hover:bg-ocean hover:text-sand transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Months Grid */}
      <div
        className={cn(
          "grid gap-8",
          monthsToShow === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        )}
      >
        {months.map((m) => (
          <div key={`${m.year}-${m.month}`}>
            <h4 className="font-serif text-xl font-semibold capitalize text-ocean mb-3 text-center">
              {m.label}
            </h4>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="text-center text-[11px] font-semibold uppercase tracking-wider text-ocean/45 py-1"
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {m.cells.map((iso, idx) => {
                if (!iso) return <div key={`empty-${idx}`} className="h-10" />;

                const dayNum = Number(iso.split("-")[2]);
                const state = getDayState(accommodationId, iso);
                const isStart = checkIn === iso;
                const isEnd = checkOut === iso;
                const previewEnd =
                  !checkOut && checkIn && hoverDate && hoverDate > checkIn
                    ? hoverDate
                    : checkOut;
                const isInRange = Boolean(
                  checkIn && previewEnd && iso > checkIn && iso < previewEnd
                );

                const canBeCheckout =
                  !readOnly &&
                  Boolean(checkIn && !checkOut && iso > checkIn) &&
                  isRangeAvailable(accommodationId, checkIn!, iso).ok;

                const disabled =
                  readOnly ||
                  state === "PAST" ||
                  (state !== "AVAILABLE" && !canBeCheckout);

                return (
                  <motion.button
                    key={iso}
                    type="button"
                    whileHover={!disabled ? { scale: 1.06 } : undefined}
                    whileTap={!disabled ? { scale: 0.95 } : undefined}
                    disabled={disabled}
                    onMouseEnter={() => setHoverDate(iso)}
                    onMouseLeave={() => setHoverDate(null)}
                    onClick={() => handleDayClick(iso)}
                    title={
                      state === "OCCUPIED"
                        ? "Reservado / Ocupado"
                        : state === "HOLD"
                        ? `Bloqueo temporal (${holdMinutes} min en curso)`
                        : state === "BLOCKED"
                        ? "Bloqueado por administración"
                        : state === "PAST"
                        ? "Fecha pasada"
                        : "Disponible"
                    }
                    className={cn(
                      "relative h-11 sm:h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center touch-manipulation",
                      isStart || isEnd
                        ? "bg-forest text-sand font-semibold shadow-md ring-2 ring-forest/30"
                        : isInRange
                        ? "bg-mist/70 text-ocean font-semibold"
                        : state === "AVAILABLE"
                        ? "bg-sand/70 text-ocean hover:bg-sunset/15 hover:text-sunset border border-transparent hover:border-sunset/30 cursor-pointer"
                        : state === "OCCUPIED"
                        ? canBeCheckout
                          ? "bg-sunset/15 text-ocean border border-dashed border-sunset/50 cursor-pointer"
                          : "bg-ocean/10 text-ocean/40 line-through cursor-not-allowed"
                        : state === "HOLD"
                        ? "bg-amber-100/90 text-amber-900 border border-amber-300/70 cursor-not-allowed"
                        : state === "BLOCKED"
                        ? "bg-stone-200/80 text-stone-500 cursor-not-allowed"
                        : "text-ocean/25 cursor-not-allowed"
                    )}
                  >
                    <span>{dayNum}</span>
                    {state === "HOLD" && !isStart && !isEnd && (
                      <Clock className="w-2.5 h-2.5 absolute top-1 right-1 text-amber-700" />
                    )}
                    {state === "BLOCKED" && (
                      <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-stone-500" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-ocean/10 flex flex-wrap items-center justify-between gap-3 text-xs text-ocean/70">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-sand border border-ocean/20" />
            Disponible
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-forest" />
            Tu selección
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-200 border border-amber-400" />
            Bloqueo {holdMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-ocean/15" />
            Ocupado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-stone-300" />
            Bloqueo admin
          </span>
        </div>
        {checkIn && !readOnly && (
          <button
            type="button"
            onClick={() => onSelectRange(null, null)}
            className="text-sunset font-semibold hover:underline cursor-pointer"
          >
            Limpiar fechas
          </button>
        )}
      </div>
    </div>
  );
}
