"use client";

import { assetPath, cn } from "@/lib/utils";

type LogoVariant = "master" | "cream" | "gold" | "white";

interface BrandLogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const VARIANT_SRC: Record<LogoVariant, string> = {
  master: "/brand/logo-master-2x.png",
  cream: "/brand/logo-cream-2x.png",
  gold: "/brand/logo-gold-2x.png",
  white: "/brand/logo-white-2x.png",
};

const SIZE_CLASSES: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  sm: "h-10 w-auto",
  md: "h-14 w-auto",
  lg: "h-24 w-auto",
  xl: "h-36 md:h-44 w-auto",
};

export function BrandLogo({
  variant = "cream",
  className,
  size = "md",
}: BrandLogoProps) {
  return (
    <img
      src={assetPath(VARIANT_SRC[variant])}
      alt="Mirador de Nogueche · Cabaña Cobquecura"
      className={cn("object-contain select-none", SIZE_CLASSES[size], className)}
    />
  );
}
