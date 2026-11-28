"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Compass,
  LayoutDashboard,
  Menu,
  X,
  KeyRound,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { cn } from "@/lib/utils";

interface TopNavProps {
  tone?: "transparent" | "light" | "dark";
}

const NAV_LINKS = [
  { href: "/", label: "Alojamientos", icon: Compass },
  { href: "/reservar", label: "Reservar", icon: CalendarCheck },
  { href: "/mi-reserva", label: "Portal Huésped", icon: KeyRound },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
];

export function TopNav({ tone = "transparent" }: TopNavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isDarkSurface = tone === "dark" || (tone === "transparent" && !scrolled);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "py-2.5 glass-light shadow-[0_8px_32px_rgba(20,29,36,0.08)]"
          : tone === "light"
          ? "py-3.5 bg-sand/90 backdrop-blur-md border-b border-ocean/10"
          : tone === "dark"
          ? "py-3.5 bg-abyss/80 backdrop-blur-md border-b border-cream/10"
          : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo
            variant={isDarkSurface ? "cream" : "master"}
            size="sm"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div className="hidden sm:block leading-tight">
            <span
              className={cn(
                "block font-serif text-lg tracking-wider uppercase font-semibold",
                isDarkSurface ? "text-cream" : "text-ocean"
              )}
            >
              Mirador de Nogueche
            </span>
            <span
              className={cn(
                "block text-[10px] tracking-[0.26em] uppercase",
                isDarkSurface ? "text-mist/80" : "text-forest/70"
              )}
            >
              Cobquecura · Ñuble
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_LINKS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname === ""
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 flex items-center gap-2",
                  active
                    ? isDarkSurface
                      ? "text-abyss"
                      : "text-sand"
                    : isDarkSurface
                    ? "text-sand/85 hover:text-cream hover:bg-white/10"
                    : "text-ocean/80 hover:text-ocean hover:bg-ocean/5"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="topnav-active-pill"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    className={cn(
                      "absolute inset-0 rounded-full -z-10 shadow-sm",
                      isDarkSurface ? "bg-cream" : "bg-forest"
                    )}
                  />
                )}
                <item.icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/reservar"
            className={cn(
              "ml-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5",
              isDarkSurface
                ? "bg-sunset text-sand hover:bg-sunset-glow"
                : "bg-sunset text-sand hover:bg-forest"
            )}
          >
            Ver Disponibilidad
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menú"
          className={cn(
            "md:hidden p-2.5 rounded-full transition-colors",
            isDarkSurface
              ? "text-cream bg-white/10 hover:bg-white/20"
              : "text-ocean bg-ocean/5 hover:bg-ocean/10"
          )}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer + Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 top-16 bg-abyss/45 backdrop-blur-xs md:hidden -z-10"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="md:hidden mt-2 mx-4 rounded-2xl glass-light shadow-2xl overflow-hidden border border-ocean/10"
            >
              <div className="p-3 flex flex-col gap-1">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 min-h-[46px] rounded-xl text-ocean font-medium hover:bg-forest/10 transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-sunset" />
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/reservar"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 min-h-[48px] flex items-center justify-center rounded-xl bg-sunset text-sand text-center font-semibold shadow-md"
                >
                  Reservar Ahora
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
