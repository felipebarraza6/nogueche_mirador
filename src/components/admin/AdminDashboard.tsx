"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sliders,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { useNoguecheStore } from "@/lib/api/demo-store";
import { loginYggdraAdmin } from "@/lib/api/client";
import type { AccommodationId, Reservation, ReservationStatus } from "@/lib/api/types";
import { ACCOMMODATIONS } from "@/lib/guide-data";
import { addDaysISO, cn, formatCLP, formatDateES, toISODate } from "@/lib/utils";

type AdminTab = "overview" | "reservations" | "calendar" | "rules";

const MONTHLY_CHART_DATA = [
  { mes: "Jul", abonos: 420000, saldos: 380000, noches: 12 },
  { mes: "Ago", abonos: 510000, saldos: 490000, noches: 15 },
  { mes: "Sep", abonos: 790000, saldos: 760000, noches: 22 },
  { mes: "Oct", abonos: 860000, saldos: 820000, noches: 24 },
  { mes: "Nov", abonos: 940000, saldos: 890000, noches: 28 },
  { mes: "Dic", abonos: 1480000, saldos: 1320000, noches: 39 },
];

const STATUS_BADGE: Record<ReservationStatus, { label: string; cls: string }> = {
  HOLD: { label: "Hold 15m", cls: "bg-amber-100 text-amber-900" },
  PAYMENT_PROCESSING: { label: "En Flow", cls: "bg-sky-100 text-sky-900" },
  PENDING_TRANSFER_VALIDATION: {
    label: "Validar Transf.",
    cls: "bg-orange-100 text-orange-900 ring-1 ring-orange-300",
  },
  CONFIRMED_DEPOSIT: {
    label: "50% Abonado",
    cls: "bg-emerald-100 text-emerald-900",
  },
  CONFIRMED_FULL: {
    label: "100% Pagada",
    cls: "bg-forest text-sand",
  },
  CANCELLED: { label: "Cancelada", cls: "bg-red-100 text-red-800" },
  EXPIRED: { label: "Expirada", cls: "bg-stone-200 text-stone-700" },
};

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<"demo" | "yggdra">("demo");
  const [email, setEmail] = useState("erica@miradordenogueche.cl");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<AdminTab>("overview");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [unitFilter, setUnitFilter] = useState<AccommodationId | "ALL">("ALL");
  const [calendarUnit, setCalendarUnit] = useState<AccommodationId>("cabana-boutique");
  const [inspectRes, setInspectRes] = useState<Reservation | null>(null);

  const settings = useNoguecheStore((s) => s.settings);
  const seasonRules = useNoguecheStore((s) => s.seasonRules);
  const manualBlocks = useNoguecheStore((s) => s.manualBlocks);
  const reservations = useNoguecheStore((s) => s.reservations);
  const approveTransfer = useNoguecheStore((s) => s.approveTransfer);
  const rejectTransfer = useNoguecheStore((s) => s.rejectTransfer);
  const markBalancePaidManual = useNoguecheStore((s) => s.markBalancePaidManual);
  const cancelReservationAdmin = useNoguecheStore((s) => s.cancelReservationAdmin);
  const addManualBlock = useNoguecheStore((s) => s.addManualBlock);
  const removeManualBlock = useNoguecheStore((s) => s.removeManualBlock);
  const updateSettings = useNoguecheStore((s) => s.updateSettings);
  const updateRates = useNoguecheStore((s) => s.updateRates);
  const upsertSeasonRule = useNoguecheStore((s) => s.upsertSeasonRule);
  const toggleSeasonRule = useNoguecheStore((s) => s.toggleSeasonRule);
  const deleteSeasonRule = useNoguecheStore((s) => s.deleteSeasonRule);
  const runExpirationSweep = useNoguecheStore((s) => s.runExpirationSweep);
  const resetDemoData = useNoguecheStore((s) => s.resetDemoData);

  const today = toISODate(new Date());
  const [blockUnit, setBlockUnit] = useState<AccommodationId | "ALL">("cabana-boutique");
  const [blockStart, setBlockStart] = useState(addDaysISO(today, 32));
  const [blockEnd, setBlockEnd] = useState(addDaysISO(today, 34));
  const [blockReason, setBlockReason] = useState("Reserva externa / Mantención");
  const [blockSource, setBlockSource] = useState<"MAINTENANCE" | "AIRBNB" | "DIRECT_BLOCK">(
    "AIRBNB"
  );

  const [ruleUnit, setRuleUnit] = useState<AccommodationId | "ALL">("ALL");
  const [ruleName, setRuleName] = useState("");
  const [ruleStart, setRuleStart] = useState(addDaysISO(today, 40));
  const [ruleEnd, setRuleEnd] = useState(addDaysISO(today, 70));
  const [ruleMinNights, setRuleMinNights] = useState(2);
  const [ruleModifier, setRuleModifier] = useState(0);

  const metrics = useMemo(() => {
    const active = reservations.filter(
      (r) => r.status === "CONFIRMED_DEPOSIT" || r.status === "CONFIRMED_FULL"
    );
    const pendingTransfers = reservations.filter(
      (r) =>
        r.status === "PENDING_TRANSFER_VALIDATION" ||
        (r.status === "CONFIRMED_DEPOSIT" && Boolean(r.balanceTransferProof))
    );
    const activeHolds = reservations.filter((r) => r.status === "HOLD");
    const collected = active.reduce((acc, r) => acc + r.paidAmount, 0);
    const pendingBalance = active.reduce((acc, r) => acc + r.balanceDue, 0);
    const totalNights = active.reduce((acc, r) => acc + r.nights, 0);

    return {
      activeCount: active.length,
      pendingTransfersCount: pendingTransfers.length,
      pendingTransfers,
      activeHoldsCount: activeHolds.length,
      collected,
      pendingBalance,
      totalNights,
    };
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const okStatus = statusFilter === "ALL" || r.status === statusFilter;
      const okUnit = unitFilter === "ALL" || r.accommodationId === unitFilter;
      return okStatus && okUnit;
    });
  }, [reservations, statusFilter, unitFilter]);

  const handleYggdraLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await loginYggdraAdmin(email, password);
      setAuthMode("yggdra");
      setAuthenticated(true);
    } catch {
      setLoginError(
        "No se pudo autenticar contra api-staging.yggdra.cl. Puedes ingresar con el acceso Demo Staging."
      );
    } finally {
      setLoggingIn(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-atmosphere-hero flex items-center justify-center px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full rounded-3xl glass-dark p-8 text-sand shadow-2xl space-y-6"
        >
          <div className="text-center">
            <BrandLogo variant="gold" size="lg" className="mx-auto mb-3" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-cream/80 font-semibold">
              Panel de Administración · Acceso Restringido
            </span>
            <h1 className="font-serif text-3xl text-sand mt-1">
              Control de Mirador de Nogueche
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setAuthMode("demo");
              setAuthenticated(true);
            }}
            className="w-full py-3.5 px-5 rounded-2xl bg-sunset hover:bg-sunset-glow text-sand font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Entrar en Modo Demo (Erica Astudillo)
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-white/15" />
            <span className="px-3 text-[11px] uppercase tracking-wider text-mist/60">
              o sesión Yggdra
            </span>
            <div className="flex-grow border-t border-white/15" />
          </div>

          <form onSubmit={handleYggdraLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo Yggdra"
              className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-sm text-sand placeholder:text-mist/50 focus:outline-none focus:border-cream"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-sm text-sand placeholder:text-mist/50 focus:outline-none focus:border-cream"
            />
            {loginError && (
              <p className="text-xs text-amber-200 bg-amber-900/40 border border-amber-400/30 rounded-xl p-2.5">
                {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl bg-white/15 hover:bg-white/25 text-cream font-semibold text-sm transition-colors cursor-pointer"
            >
              {loggingIn ? "Conectando a Yggdra..." : "Iniciar Sesión con Yggdra"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-7">
      {/* Admin Top Header */}
      <div className="rounded-3xl bg-abyss text-sand p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <BrandLogo variant="cream" size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-cream font-semibold">
                Panel Administración · Mirador de Nogueche
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-mist">
                {authMode === "yggdra" ? "Yggdra Live" : "Demo Interactivo"}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium">
              Cabaña Boutique & Casa Mirador
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => runExpirationSweep()}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-cream text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Conciliar Holds
          </button>
          <button
            type="button"
            onClick={() => resetDemoData()}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-mist text-xs font-semibold cursor-pointer"
          >
            Restaurar datos demo
          </button>
          <button
            type="button"
            onClick={() => setAuthenticated(false)}
            className="px-4 py-2 rounded-full bg-sunset/80 hover:bg-sunset text-sand text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "overview" as AdminTab, label: "Dashboard & Gráficos", icon: LayoutDashboard },
          {
            id: "reservations" as AdminTab,
            label: `Reservas & Registro (${metrics.pendingTransfersCount})`,
            icon: Wallet,
          },
          { id: "calendar" as AdminTab, label: "Calendarios & Bloqueos", icon: Calendar },
          { id: "rules" as AdminTab, label: "Tarifario 2026–2027 & Reglas", icon: Sliders },
        ].map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer",
                active
                  ? "text-sand"
                  : "glass-card-subtle text-ocean/75 hover:bg-white/80"
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-tab"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-forest shadow-md -z-0"
                />
              )}
              <t.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: OVERVIEW */}
        {tab === "overview" && (
          <motion.div
            key="admin-overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-3xl bg-white border border-ocean/10 p-5 shadow-sm">
                <span className="text-xs uppercase tracking-wider text-ocean/55 font-semibold flex items-center justify-between">
                  Recaudado confirmado <TrendingUp className="w-4 h-4 text-emerald-600" />
                </span>
                <p className="font-serif text-3xl font-bold text-ocean mt-2">
                  {formatCLP(metrics.collected)}
                </p>
                <p className="text-xs text-ocean/60 mt-1">
                  {metrics.activeCount} reservas confirmadas ({metrics.totalNights} noches)
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-ocean/10 p-5 shadow-sm">
                <span className="text-xs uppercase tracking-wider text-ocean/55 font-semibold flex items-center justify-between">
                  Saldos 50% por cobrar <Wallet className="w-4 h-4 text-sunset" />
                </span>
                <p className="font-serif text-3xl font-bold text-sunset mt-2">
                  {formatCLP(metrics.pendingBalance)}
                </p>
                <p className="text-xs text-ocean/60 mt-1">
                  Requeridos antes de liberar código de caja de llaves
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-orange-200 p-5 shadow-sm">
                <span className="text-xs uppercase tracking-wider text-orange-800 font-semibold flex items-center justify-between">
                  Transferencias por validar <AlertCircle className="w-4 h-4 text-orange-600" />
                </span>
                <p className="font-serif text-3xl font-bold text-orange-900 mt-2">
                  {metrics.pendingTransfersCount}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("PENDING_TRANSFER_VALIDATION");
                    setTab("reservations");
                  }}
                  className="text-xs text-sunset font-semibold mt-1 hover:underline cursor-pointer"
                >
                  Revisar comprobantes ahora →
                </button>
              </div>

              <div className="rounded-3xl bg-atmosphere-forest text-sand p-5 shadow-sm">
                <span className="text-xs uppercase tracking-wider text-cream/80 font-semibold flex items-center justify-between">
                  Holds activos ({settings.holdDurationMinutes} min){" "}
                  <Clock className="w-4 h-4 text-cream" />
                </span>
                <p className="font-serif text-3xl font-bold text-cream mt-2">
                  {metrics.activeHoldsCount}
                </p>
                <p className="text-xs text-mist/80 mt-1">
                  Temp. alta mín.: {settings.highSeasonMinNights} noches
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 rounded-3xl bg-white border border-ocean/10 p-6 shadow-sm">
                <div className="mb-4">
                  <span className="text-[11px] uppercase tracking-widest text-sunset font-semibold">
                    Flujo Financiero Combinado
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-ocean">
                    Abonos 50% vs Saldos Completados (CLP)
                  </h3>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MONTHLY_CHART_DATA}>
                      <defs>
                        <linearGradient id="gradForest" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2F4838" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#2F4838" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradSunset" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#B86B49" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#B86B49" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" />
                      <XAxis dataKey="mes" stroke="#5b6b73" fontSize={12} />
                      <YAxis
                        stroke="#5b6b73"
                        fontSize={11}
                        tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                      />
                      <Tooltip
                        formatter={(val) => formatCLP(Number(val))}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid rgba(36,54,66,0.12)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="abonos"
                        name="Abonos 50%"
                        stroke="#B86B49"
                        strokeWidth={2.5}
                        fill="url(#gradSunset)"
                      />
                      <Area
                        type="monotone"
                        dataKey="saldos"
                        name="Saldos 50%"
                        stroke="#2F4838"
                        strokeWidth={2.5}
                        fill="url(#gradForest)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-3xl bg-white border border-ocean/10 p-6 shadow-sm">
                <div className="mb-4">
                  <span className="text-[11px] uppercase tracking-widest text-forest font-semibold">
                    Ocupación Mensual
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-ocean">
                    Noches Reservadas (2 Alojamientos)
                  </h3>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MONTHLY_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" />
                      <XAxis dataKey="mes" stroke="#5b6b73" fontSize={12} />
                      <YAxis stroke="#5b6b73" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid rgba(36,54,66,0.12)",
                        }}
                      />
                      <Bar
                        dataKey="noches"
                        name="Noches"
                        fill="#243642"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: RESERVATIONS */}
        {tab === "reservations" && (
          <motion.div
            key="admin-reservations"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "ALL", label: "Todas" },
                  { id: "PENDING_TRANSFER_VALIDATION", label: "Validar Transferencia" },
                  { id: "HOLD", label: "Hold 15 min" },
                  { id: "CONFIRMED_DEPOSIT", label: "50% Abonado" },
                  { id: "CONFIRMED_FULL", label: "100% Pagadas" },
                  { id: "CANCELLED", label: "Canceladas" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer",
                      statusFilter === f.id
                        ? "bg-sunset text-sand"
                        : "bg-white border border-ocean/10 text-ocean/70 hover:bg-sand"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5">
                {(
                  [
                    { id: "ALL", label: "Ambos" },
                    { id: "cabana-boutique", label: "Cabaña Boutique" },
                    { id: "casa-mirador", label: "Casa Mirador" },
                  ] as const
                ).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUnitFilter(u.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer",
                      unitFilter === u.id
                        ? "bg-forest text-sand"
                        : "bg-white border border-ocean/10 text-ocean/70"
                    )}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredReservations.map((r) => (
                <div
                  key={r.id}
                  className="rounded-3xl bg-white border border-ocean/10 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-forest bg-mist/60 px-2.5 py-0.5 rounded-full">
                        {r.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sand text-ocean border border-ocean/10">
                        {r.accommodationName}
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                          STATUS_BADGE[r.status].cls
                        )}
                      >
                        {STATUS_BADGE[r.status].label}
                      </span>
                      {r.accessUnlocked && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <KeyRound className="w-3 h-3" /> Caja: {r.lockboxCode}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-ocean">
                      {r.guestName}{" "}
                      <span className="text-xs font-sans font-normal text-ocean/60">
                        ({r.guestDocument} · {r.guestCity})
                      </span>
                    </h3>
                    <p className="text-xs text-ocean/70">
                      {formatDateES(r.checkIn)} → {formatDateES(r.checkOut)} ({r.nights}{" "}
                      noches) · {r.adults} ad.
                      {r.children7Plus > 0 ? ` + ${r.children7Plus} (7+)` : ""}
                      {r.children2To6 > 0 ? ` + ${r.children2To6} (2–6)` : ""}
                      {r.childrenUnder2 > 0 ? ` + ${r.childrenUnder2} (<2)` : ""} ·{" "}
                      {r.guestPhone}
                    </p>
                    <p className="text-xs text-ocean/80">
                      Total: <strong>{formatCLP(r.totalAmount)}</strong> · Pagado:{" "}
                      <strong className="text-emerald-700">{formatCLP(r.paidAmount)}</strong> ·
                      Saldo:{" "}
                      <strong className="text-sunset">{formatCLP(r.balanceDue)}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {r.status === "PENDING_TRANSFER_VALIDATION" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setInspectRes(r)}
                          className="px-4 py-2 rounded-full bg-orange-100 text-orange-950 font-semibold text-xs flex items-center gap-1.5 hover:bg-orange-200 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> Ver Comprobante
                        </button>
                        <button
                          type="button"
                          onClick={() => approveTransfer(r.id, "deposit")}
                          className="px-4 py-2 rounded-full bg-forest text-sand font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-800 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Validar Abono 50%
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            rejectTransfer(r.id, "Comprobante no conciliado en cuenta bancaria.")
                          }
                          className="px-3.5 py-2 rounded-full border border-red-200 text-red-700 font-semibold text-xs hover:bg-red-50 cursor-pointer"
                        >
                          Rechazar
                        </button>
                      </>
                    )}

                    {r.status === "CONFIRMED_DEPOSIT" && (
                      <button
                        type="button"
                        onClick={() =>
                          r.balanceTransferProof
                            ? approveTransfer(r.id, "balance")
                            : markBalancePaidManual(r.id)
                        }
                        className="px-4 py-2 rounded-full bg-sunset text-sand font-semibold text-xs flex items-center gap-1.5 hover:bg-forest cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {r.balanceTransferProof
                          ? "Validar Saldo 50% y Liberar Caja"
                          : "Marcar Saldo 50% Pagado"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setInspectRes(r)}
                      className="px-3.5 py-2 rounded-full border border-ocean/15 text-ocean text-xs font-semibold hover:bg-sand cursor-pointer"
                    >
                      Ficha Huésped / Log
                    </button>

                    <Link
                      href={`/mi-reserva?code=${encodeURIComponent(r.code)}`}
                      className="px-3.5 py-2 rounded-full border border-ocean/15 text-ocean text-xs font-semibold hover:bg-sand"
                    >
                      Ver como Huésped
                    </Link>

                    {(r.status === "HOLD" || r.status === "CONFIRMED_DEPOSIT") && (
                      <button
                        type="button"
                        onClick={() =>
                          cancelReservationAdmin(r.id, "Cancelación manual por administración.")
                        }
                        className="p-2 rounded-full text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Cancelar reserva"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: INDEPENDENT CALENDARS & MANUAL BLOCKS */}
        {tab === "calendar" && (
          <motion.div
            key="admin-calendar"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-8 space-y-4">
              <div className="flex gap-2">
                {(["cabana-boutique", "casa-mirador"] as AccommodationId[]).map((uid) => (
                  <button
                    key={uid}
                    type="button"
                    onClick={() => setCalendarUnit(uid)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-semibold cursor-pointer",
                      calendarUnit === uid
                        ? "bg-forest text-sand shadow-sm"
                        : "bg-white border border-ocean/15 text-ocean/75"
                    )}
                  >
                    {ACCOMMODATIONS[uid].name}
                  </button>
                ))}
              </div>
              <AvailabilityCalendar
                accommodationId={calendarUnit}
                checkIn={null}
                checkOut={null}
                onSelectRange={() => {}}
                readOnly
              />
            </div>

            <div className="lg:col-span-4 space-y-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (blockEnd <= blockStart) return;
                  addManualBlock({
                    accommodationId: blockUnit,
                    startDate: blockStart,
                    endDate: blockEnd,
                    reason: blockReason,
                    source: blockSource,
                  });
                }}
                className="rounded-3xl bg-white border border-ocean/10 p-6 space-y-4 shadow-sm"
              >
                <h3 className="font-serif text-2xl font-semibold text-ocean flex items-center gap-2">
                  <Lock className="w-5 h-5 text-sunset" /> Bloquear Fechas Manualmente
                </h3>
                <select
                  value={blockUnit}
                  onChange={(e) => setBlockUnit(e.target.value as AccommodationId | "ALL")}
                  className="w-full rounded-xl border border-ocean/15 px-3 py-2 text-xs font-semibold"
                >
                  <option value="cabana-boutique">Cabaña Boutique</option>
                  <option value="casa-mirador">Casa Mirador</option>
                  <option value="ALL">Ambos alojamientos</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs">
                    <span className="text-ocean/60 block mb-1">Desde</span>
                    <input
                      type="date"
                      value={blockStart}
                      onChange={(e) => setBlockStart(e.target.value)}
                      className="w-full rounded-xl border border-ocean/15 px-3 py-2 text-xs"
                    />
                  </label>
                  <label className="text-xs">
                    <span className="text-ocean/60 block mb-1">Hasta</span>
                    <input
                      type="date"
                      value={blockEnd}
                      onChange={(e) => setBlockEnd(e.target.value)}
                      className="w-full rounded-xl border border-ocean/15 px-3 py-2 text-xs"
                    />
                  </label>
                </div>
                <select
                  value={blockSource}
                  onChange={(e) =>
                    setBlockSource(
                      e.target.value as "MAINTENANCE" | "AIRBNB" | "DIRECT_BLOCK"
                    )
                  }
                  className="w-full rounded-xl border border-ocean/15 px-3 py-2 text-xs"
                >
                  <option value="AIRBNB">Bloqueo Airbnb / Canal externo</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="DIRECT_BLOCK">Uso personal / Bloqueo directo</option>
                </select>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Motivo del bloqueo"
                  className="w-full rounded-xl border border-ocean/15 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-forest text-sand text-xs font-semibold hover:bg-sunset transition-colors cursor-pointer"
                >
                  Agregar Bloqueo al Calendario
                </button>
              </form>

              <div className="rounded-3xl bg-white border border-ocean/10 p-6 space-y-3 shadow-sm">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-ocean/60">
                  Bloqueos Activos ({manualBlocks.length})
                </h4>
                {manualBlocks.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl bg-sand/70 p-3.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-ocean">
                        {b.accommodationId === "ALL"
                          ? "Ambos"
                          : ACCOMMODATIONS[b.accommodationId].name}{" "}
                        · {b.reason}
                      </p>
                      <p className="text-ocean/60">
                        {formatDateES(b.startDate)} → {formatDateES(b.endDate)} ({b.source})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeManualBlock(b.id)}
                      className="p-1.5 rounded-full text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: OFFICIAL RATES & RULES */}
        {tab === "rules" && (
          <motion.div
            key="admin-rules"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Official Rates & Settings */}
            <div className="lg:col-span-5 rounded-3xl bg-white border border-ocean/10 p-6 shadow-sm space-y-5">
              <h3 className="font-serif text-2xl font-semibold text-ocean flex items-center gap-2">
                <Settings className="w-5 h-5 text-sunset" /> Tarifario Oficial 2026–2027 (CLP)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="block col-span-2">
                  <span className="text-ocean/65 block mb-1">
                    Cabaña Boutique (1 a 2 personas) / noche
                  </span>
                  <input
                    type="number"
                    step={1000}
                    value={settings.rates.boutique1To2}
                    onChange={(e) =>
                      updateRates({ boutique1To2: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-ocean/15 px-3 py-2 font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="text-ocean/65 block mb-1">Casa Mirador (1–2 pers.)</span>
                  <input
                    type="number"
                    step={1000}
                    value={settings.rates.casa1To2}
                    onChange={(e) => updateRates({ casa1To2: Number(e.target.value) })}
                    className="w-full rounded-xl border border-ocean/15 px-3 py-2 font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="text-ocean/65 block mb-1">Casa Mirador (3–4 pers.)</span>
                  <input
                    type="number"
                    step={1000}
                    value={settings.rates.casa3To4}
                    onChange={(e) => updateRates({ casa3To4: Number(e.target.value) })}
                    className="w-full rounded-xl border border-ocean/15 px-3 py-2 font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="text-ocean/65 block mb-1">Casa Mirador (5 pers.)</span>
                  <input
                    type="number"
                    step={1000}
                    value={settings.rates.casa5}
                    onChange={(e) => updateRates({ casa5: Number(e.target.value) })}
                    className="w-full rounded-xl border border-ocean/15 px-3 py-2 font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="text-ocean/65 block mb-1">Casa Mirador (6 pers.)</span>
                  <input
                    type="number"
                    step={1000}
                    value={settings.rates.casa6}
                    onChange={(e) => updateRates({ casa6: Number(e.target.value) })}
                    className="w-full rounded-xl border border-ocean/15 px-3 py-2 font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="text-ocean/65 block mb-1">
                    Niños 2–6 años / noche (compartiendo cama)
                  </span>
                  <input
                    type="number"
                    step={500}
                    value={settings.child2To6NightlyFee}
                    onChange={(e) =>
                      updateSettings({ child2To6NightlyFee: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-ocean/15 px-3 py-2 font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="text-ocean/65 block mb-1">Plazo Hold (minutos)</span>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={settings.holdDurationMinutes}
                    onChange={(e) =>
                      updateSettings({ holdDurationMinutes: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-ocean/15 px-3 py-2 font-semibold"
                  />
                </label>
              </div>
              <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                Los cambios se reflejan inmediatamente en el tarifario público y en el cálculo
                automático de <code>/reservar</code>.
              </p>
            </div>

            {/* Season Rules */}
            <div className="lg:col-span-7 space-y-5">
              <div className="rounded-3xl bg-white border border-ocean/10 p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-2xl font-semibold text-ocean">
                  Reglas de Temporada y Estadía Mínima
                </h3>
                <div className="space-y-3">
                  {seasonRules.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl bg-sand/70 p-4 border border-ocean/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-ocean">{s.name}</span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-forest text-sand">
                            Mín. {s.minNights} {s.minNights === 1 ? "noche" : "noches"}
                          </span>
                        </div>
                        <p className="text-xs text-ocean/65 mt-0.5">
                          {formatDateES(s.startDate)} → {formatDateES(s.endDate)} · Ajuste:{" "}
                          <strong>
                            {s.rateModifierPercent === 0
                              ? "Tarifario oficial"
                              : `${s.rateModifierPercent > 0 ? "+" : ""}${s.rateModifierPercent}%`}
                          </strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSeasonRule(s.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer",
                            s.isActive
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-stone-200 text-stone-600"
                          )}
                        >
                          {s.isActive ? "Activa" : "Inactiva"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSeasonRule(s.id)}
                          className="p-1.5 rounded-full text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!ruleName.trim() || ruleEnd <= ruleStart) return;
                  upsertSeasonRule({
                    accommodationId: ruleUnit,
                    name: ruleName.trim(),
                    startDate: ruleStart,
                    endDate: ruleEnd,
                    minNights: ruleMinNights,
                    rateModifierPercent: ruleModifier,
                    isActive: true,
                  });
                  setRuleName("");
                }}
                className="rounded-3xl bg-white border border-ocean/10 p-6 shadow-sm space-y-4"
              >
                <h4 className="font-serif text-xl font-semibold text-ocean flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sunset" /> Nueva Regla de Temporada
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Ej. Fiestas Patrias / Semana Santa"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    className="sm:col-span-2 rounded-xl border border-ocean/15 px-3 py-2.5"
                  />
                  <select
                    value={ruleUnit}
                    onChange={(e) => setRuleUnit(e.target.value as AccommodationId | "ALL")}
                    className="sm:col-span-2 rounded-xl border border-ocean/15 px-3 py-2.5"
                  >
                    <option value="ALL">Aplica a ambos alojamientos</option>
                    <option value="cabana-boutique">Solo Cabaña Boutique</option>
                    <option value="casa-mirador">Solo Casa Mirador</option>
                  </select>
                  <input
                    type="date"
                    value={ruleStart}
                    onChange={(e) => setRuleStart(e.target.value)}
                    className="rounded-xl border border-ocean/15 px-3 py-2.5"
                  />
                  <input
                    type="date"
                    value={ruleEnd}
                    onChange={(e) => setRuleEnd(e.target.value)}
                    className="rounded-xl border border-ocean/15 px-3 py-2.5"
                  />
                  <select
                    value={ruleMinNights}
                    onChange={(e) => setRuleMinNights(Number(e.target.value))}
                    className="rounded-xl border border-ocean/15 px-3 py-2.5"
                  >
                    <option value={1}>Mínimo 1 noche</option>
                    <option value={2}>Mínimo 2 noches</option>
                    <option value={3}>Mínimo 3 noches</option>
                  </select>
                  <input
                    type="number"
                    value={ruleModifier}
                    onChange={(e) => setRuleModifier(Number(e.target.value))}
                    placeholder="% ajuste tarifa (0 = base)"
                    className="rounded-xl border border-ocean/15 px-3 py-2.5"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-sunset text-sand text-xs font-semibold hover:bg-forest transition-colors cursor-pointer"
                >
                  Guardar Regla
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail / Guest Registration / Transfer Proof Modal */}
      <AnimatePresence>
        {inspectRes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectRes(null)}
            className="fixed inset-0 z-50 bg-abyss/75 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-sunset">
                    {inspectRes.code} · {inspectRes.accommodationName}
                  </span>
                  <h3 className="font-serif text-3xl font-semibold text-ocean">
                    {inspectRes.guestName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectRes(null)}
                  className="p-2 rounded-full hover:bg-ocean/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Guest Registration Card */}
              <div className="rounded-2xl bg-sand/70 border border-ocean/10 p-4 space-y-1.5 text-xs">
                <p className="font-bold text-forest uppercase tracking-wider mb-1">
                  Ficha de Registro de Huéspedes
                </p>
                <p>
                  RUT / Pasaporte: <strong>{inspectRes.guestDocument}</strong>
                </p>
                <p>
                  Ciudad de procedencia: <strong>{inspectRes.guestCity}</strong>
                </p>
                <p>
                  Contacto: <strong>{inspectRes.guestPhone}</strong> · {inspectRes.guestEmail}
                </p>
                <p>
                  Composición: <strong>{inspectRes.adults} adultos</strong>
                  {inspectRes.children7Plus > 0
                    ? `, ${inspectRes.children7Plus} niño(s) 7+`
                    : ""}
                  {inspectRes.children2To6 > 0
                    ? `, ${inspectRes.children2To6} niño(s) 2–6`
                    : ""}
                  {inspectRes.childrenUnder2 > 0
                    ? `, ${inspectRes.childrenUnder2} menor(es) <2`
                    : ""}
                </p>
                {inspectRes.childrenAges && (
                  <p>
                    Edades niños: <strong>{inspectRes.childrenAges}</strong>
                  </p>
                )}
                {inspectRes.companionNames && (
                  <p>
                    Acompañantes: <strong>{inspectRes.companionNames}</strong>
                  </p>
                )}
                {inspectRes.vehiclePlate && (
                  <p>
                    Patente vehículo: <strong className="font-mono">{inspectRes.vehiclePlate}</strong>
                  </p>
                )}
                <p className="pt-1.5 border-t border-ocean/10 text-[11px] text-emerald-800">
                  Políticas aceptadas ({inspectRes.acceptedPoliciesVersion}):{" "}
                  {new Date(inspectRes.acceptedPoliciesAt).toLocaleString("es-CL")}
                </p>
              </div>

              {inspectRes.depositTransferProof && (
                <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 space-y-1.5 text-xs">
                  <p className="font-bold text-orange-900 uppercase tracking-wider">
                    Comprobante de Transferencia (Abono 50%)
                  </p>
                  <p>
                    Banco: <strong>{inspectRes.depositTransferProof.bankName}</strong>
                  </p>
                  <p>
                    N° Operación: <strong>{inspectRes.depositTransferProof.reference}</strong>
                  </p>
                  <p>
                    Titular: <strong>{inspectRes.depositTransferProof.holderName}</strong>
                  </p>
                  <p>
                    Monto: <strong>{formatCLP(inspectRes.depositTransferProof.amount)}</strong>
                  </p>
                  <p>
                    Archivo: <code>{inspectRes.depositTransferProof.fileName}</code>
                  </p>
                  {inspectRes.status === "PENDING_TRANSFER_VALIDATION" && (
                    <div className="flex gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          approveTransfer(inspectRes.id, "deposit");
                          setInspectRes(null);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-forest text-sand font-semibold cursor-pointer"
                      >
                        Validar y Confirmar Reserva
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          rejectTransfer(
                            inspectRes.id,
                            "Transferencia rechazada por administración."
                          );
                          setInspectRes(null);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 font-semibold cursor-pointer"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-ocean/55 mb-2">
                  Auditoría del Sistema
                </p>
                <div className="space-y-2.5">
                  {inspectRes.auditLog.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-xl bg-sand/70 p-3 text-xs border border-ocean/8"
                    >
                      <div className="flex justify-between text-[10px] text-ocean/55 mb-0.5">
                        <span className="font-bold text-forest">{ev.actor}</span>
                        <span>{new Date(ev.at).toLocaleString("es-CL")}</span>
                      </div>
                      <p className="font-semibold text-ocean">{ev.title}</p>
                      <p className="text-ocean/75">{ev.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
