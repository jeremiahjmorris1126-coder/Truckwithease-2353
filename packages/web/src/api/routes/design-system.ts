/**
 * /api/design-system — the one gold-on-black token set and the fonts, served as
 * data so web and mobile read the SAME source instead of each hard-coding hexes.
 * No database, no credential.
 *
 * WHY THIS ROUTER EXISTS
 *   The capability was declared with endpoints:[] and tables:[], so the function
 *   index reported it "not_built" — the tokens lived only inside components, with
 *   nothing to point at as the canonical set. This publishes them once, with a
 *   version hash, so a drift between web and mobile becomes visible instead of
 *   silent. It also emits CSS custom properties so a consumer cannot mistype a hex.
 *
 * WHAT THIS DOES NOT CLAIM
 *   - It does not enforce anything. A component can still hard-code a colour; this
 *     is the source of truth, not a linter. Whether a screen actually uses it is a
 *     separate, honest question this endpoint does not pretend to answer.
 */
import { Hono } from "hono";
import { createHash } from "node:crypto";

/* -------------------------------------------------------------------------
 * TOKENS — exactly the values in the function index's trust statement.
 * ------------------------------------------------------------------------- */
export const COLORS = {
  gold: "#C9A84C",
  brightGold: "#FFD700",
  black: "#0a0a0a",
  card: "#161616",
  nav: "#111111",
  border: "#222222",
} as const;

export const COLOR_ROLES = {
  gold: "Primary brand accent — headings, key actions, active state.",
  brightGold: "Emphasis / focus highlight, used sparingly over the base gold.",
  black: "App background.",
  card: "Raised surface — cards, panels, sheets.",
  nav: "Navigation and header background, one step off the base black.",
  border: "Hairline borders and dividers.",
} as const;

export const FONTS = [
  { family: "Oswald", role: "Display / condensed headings and labels (uppercase, letter-spaced).", weights: [400, 500, 600, 700] },
  { family: "Inter", role: "Body and UI text.", weights: [400, 500, 600] },
  { family: "Bebas Neue", role: "Oversized numeric and hero display.", weights: [400] },
  { family: "JetBrains Mono", role: "Monospace — IDs, hashes, code and tabular numbers.", weights: [400, 500] },
] as const;

export const RADIUS = { sm: "6px", md: "10px", lg: "16px", pill: "999px" } as const;

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Version hash over the exact tokens served, so web/mobile drift is detectable. */
export function tokenVersion(): string {
  const canonical = JSON.stringify({ COLORS, FONTS, RADIUS, SPACING });
  return createHash("sha256").update(canonical, "utf8").digest("hex").slice(0, 16);
}

/** CSS custom properties, generated from the tokens so a consumer cannot mistype. */
function cssVariables(): string {
  const lines = [
    ...Object.entries(COLORS).map(([k, v]) => `  --twe-${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}: ${v};`),
    ...Object.entries(RADIUS).map(([k, v]) => `  --twe-radius-${k}: ${v};`),
    ...Object.entries(SPACING).map(([k, v]) => `  --twe-space-${k}: ${v}px;`),
  ];
  return `:root {\n${lines.join("\n")}\n}`;
}

export const designSystem = new Hono()

  /** GET /api/design-system — the canonical tokens, fonts, and a version hash. */
  .get("/", (c) => {
    return c.json({
      version: tokenVersion(),
      versionNote: "sha256 (first 16 hex) over the exact tokens below. Change one value and this changes.",
      colors: COLORS,
      colorRoles: COLOR_ROLES,
      fonts: FONTS,
      radius: RADIUS,
      spacing: SPACING,
      shared: ["web", "mobile"],
      note:
        "This is the source of truth, not an enforcer. A component can still hard-code a value; this endpoint makes the canonical set explicit so drift is visible.",
    });
  })

  /** GET /api/design-system/tokens.css — the same tokens as ready-to-use CSS variables. */
  .get("/tokens.css", (c) => {
    c.header("content-type", "text/css; charset=utf-8");
    return c.body(`/* TruckWithEase design tokens — generated, do not hand-edit. version ${tokenVersion()} */\n${cssVariables()}\n`);
  });

export default designSystem;
