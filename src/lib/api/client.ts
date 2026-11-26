/**
 * Cliente HTTP hacia Yggdra (https://api.yggdra.cl/api o staging).
 * Incluye detección de conectividad y fallback limpio al modo demo interactivo
 * mientras se implementan las issues [Nogueche] en felipebarraza6/yggdra_infra.
 */

export const YGGDRA_CONFIG = {
  apiBase:
    process.env.NEXT_PUBLIC_YGGDRA_API_BASE ||
    "https://api-staging.yggdra.cl/api",
  branchSlug:
    process.env.NEXT_PUBLIC_NOGUECHE_BRANCH_SLUG || "mirador-de-nogueche",
  calendarId: process.env.NEXT_PUBLIC_NOGUECHE_CALENDAR_ID || "1",
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE || "auto",
};

export interface YggdraHealthStatus {
  mode: "yggdra" | "demo";
  apiBase: string;
  reason: string;
}

export async function probeYggdraBookingApi(): Promise<YggdraHealthStatus> {
  if (YGGDRA_CONFIG.demoMode === "force") {
    return {
      mode: "demo",
      apiBase: YGGDRA_CONFIG.apiBase,
      reason: "Modo demo interactivo activo para staging",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `${YGGDRA_CONFIG.apiBase}/scheduling/public/calendar/${YGGDRA_CONFIG.calendarId}/availability/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Branch-Slug": YGGDRA_CONFIG.branchSlug,
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      return {
        mode: "yggdra",
        apiBase: YGGDRA_CONFIG.apiBase,
        reason: "Conectado a Yggdra API en tiempo real",
      };
    }
    return {
      mode: "demo",
      apiBase: YGGDRA_CONFIG.apiBase,
      reason: `Endpoint público pendiente en Yggdra (HTTP ${res.status}) · usando simulador sincronizado`,
    };
  } catch {
    return {
      mode: "demo",
      apiBase: YGGDRA_CONFIG.apiBase,
      reason: "Staging interactivo activo (fallback automático a Yggdra API)",
    };
  }
}

export async function loginYggdraAdmin(email: string, password: string) {
  const res = await fetch(`${YGGDRA_CONFIG.apiBase}/accounts/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Credenciales inválidas o API no disponible");
  }
  return res.json();
}
