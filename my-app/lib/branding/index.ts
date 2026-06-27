import type { CSSProperties } from "react";

/**
 * Brand Kit — per-restaurant theming.
 *
 * V1 only fills in three colors, but the type and storage are shaped so future
 * features (typography, presets, seasonal, AI themes) are *additive* — they
 * just become new optional fields that feed the same CSS token contract.
 *
 * See `Extra Files/Branding.md` for the full design doc.
 */
export type Branding = {
  version: 1;
  colors: {
    // Base surfaces — the biggest "different menu" lever. Text on each is
    // auto-derived for contrast, so any color stays readable.
    background: string;
    surface: string;
    // Accents.
    primary: string;
    secondary: string;
    accent: string;
  };

  // Reserved — present in the type, NOT populated in V1. Optional with defaults
  // so existing restaurants are never broken when these start being used.
  fontPairId?: string;
  presetKey?: string;
};

/**
 * The default theme. A restaurant with no `branding` row (or an invalid one)
 * resolves to exactly this, so the menu looks identical to the pre-theme design.
 */
export const DEFAULT_BRANDING: Branding = {
  version: 1,
  colors: {
    background: "#fafafa", // zinc-50 — the original page background
    surface: "#ffffff", // white — the original card background
    primary: "#0f172a", // slate-900 — matches the original price pills
    secondary: "#475569", // slate-600
    accent: "#8b5cf6", // violet-500 — matches the original "New" badge
  },
};

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const isHex = (value: unknown): value is string =>
  typeof value === "string" && HEX.test(value.trim());

/**
 * Normalise an untrusted `branding` blob (from the DB / `unknown`) into a valid
 * Branding. Invalid or missing fields fall back to the default per-field, so a
 * partially-corrupt row still renders a sane theme instead of throwing.
 *
 * This is the "DB constraint" substitute — validation lives at the fetch
 * boundary, not in Postgres.
 */
export function parseBranding(raw: unknown): Branding {
  if (!raw || typeof raw !== "object") return DEFAULT_BRANDING;

  const colors = (raw as { colors?: unknown }).colors;
  const c = colors && typeof colors === "object" ? (colors as Record<string, unknown>) : {};

  const d = DEFAULT_BRANDING.colors;
  return {
    version: 1,
    colors: {
      background: isHex(c.background) ? c.background.trim() : d.background,
      surface: isHex(c.surface) ? c.surface.trim() : d.surface,
      primary: isHex(c.primary) ? c.primary.trim() : d.primary,
      secondary: isHex(c.secondary) ? c.secondary.trim() : d.secondary,
      accent: isHex(c.accent) ? c.accent.trim() : d.accent,
    },
  };
}

const DARK = "#171717";
const LIGHT = "#ffffff";

/**
 * Pick a readable text color (dark or light) to sit on top of `bg`, using YIQ
 * perceived brightness. This is what keeps owner-picked colors legible — gold
 * gets black text, deep violet gets white — without the owner choosing it.
 */
function onColor(bg: string): string {
  let hex = bg.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? DARK : LIGHT;
}

/**
 * Turn a Brand Kit into the inline CSS-variable map injected on the page root.
 * This is the *only* resolution step in V1 — no preset/seasonal/AI cascade yet.
 * When those arrive, they merge into the Branding *before* this function; the
 * token contract below never changes.
 */
export function resolveTheme(branding: Branding): CSSProperties {
  const { background, surface, primary, secondary, accent } = branding.colors;
  return {
    "--brand-background": background,
    "--brand-on-background": onColor(background),
    "--brand-surface": surface,
    "--brand-on-surface": onColor(surface),
    "--brand-primary": primary,
    "--brand-on-primary": onColor(primary),
    "--brand-secondary": secondary,
    "--brand-on-secondary": onColor(secondary),
    "--brand-accent": accent,
    "--brand-on-accent": onColor(accent),
  } as CSSProperties;
}
