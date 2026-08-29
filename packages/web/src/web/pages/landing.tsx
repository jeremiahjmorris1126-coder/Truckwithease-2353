import { useMemo, useState } from "react";
import { Link } from "wouter";

/**
 * Public marketing homepage at "/".
 * Layout follows the launch landing page Jeremiah sent; palette is the
 * confirmed TruckWithEase brand: gold on black. No neon.
 *
 * Every number on this page is either real (counted from the codebase) or
 * labelled as an estimate. Nothing here is invented traction.
 */

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const BORDER = "#222222";

const TAGS = [
  "ALL",
  "PROPRIETARY",
  "EXCLUSIVE",
  "REAL TIME",
  "UNIQUE",
  "LIFE SAFETY",
  "QUANTUM",
] as const;

type Tag = Exclude<(typeof TAGS)[number], "ALL">;

type Feature = {
  tag: Tag;
  title: string;
  blurb: string;
  note?: string;
};

const FEATURES: Feature[] = [
  {
    tag: "PROPRIETARY",
    title: "Ghost Nerve Intelligence",
    blurb: "Baselines every unit against itself and flags drift before it becomes a breakdown.",
  },
  {
    tag: "QUANTUM",
    title: "Quantum Dispatch Mission Control",
    blurb: "Live map, multi-layer load scoring, dispatch without leaving the screen.",
  },
  {
    tag: "EXCLUSIVE",
    title: "Sovereign ELD — FMCSA registration in progress",
    blurb: "An HOS log no outside platform can read, alter, or mirror.",
    note: "Registration is filed and pending. Not yet on the FMCSA registered list.",
  },
  {
    tag: "EXCLUSIVE",
    title: "HREase — full hiring to paycheck",
    blurb: "Post a job, hire the driver, pay them — never leave the app.",
  },
  {
    tag: "EXCLUSIVE",
    title: "ELD-to-payroll — zero manual entry",
    blurb: "Miles verified by the ELD. Paycheck generated from the same record.",
  },
  {
    tag: "REAL TIME",
    title: "Lane profit intelligence",
    blurb: "Lanes ranked by net profit after fuel, tolls and time — not by posted rate.",
  },
  {
    tag: "UNIQUE",
    title: "Three vehicle worlds — one platform",
    blurb: "Class A trucks, courier cars, bikes and scooters. One account, one paycheck view.",
  },
  {
    tag: "LIFE SAFETY",
    title: "Safety SOS — 911 and state patrol",
    blurb: "One button. Your GPS position, the right dispatch desk, no menu tree.",
  },
  {
    tag: "EXCLUSIVE",
    title: "Game Up — gamified driver training",
    blurb: "FMCSA-aligned modules. Real scores. Rig Bucks on every pass.",
  },
  {
    tag: "PROPRIETARY",
    title: "Fleet Voice — hands-free through cab speakers",
    blurb: "Real numbers, real calls, through the speakers you already have. No second app.",
  },
  {
    tag: "UNIQUE",
    title: "Rig Bucks — loyalty that actually retains",
    blurb: "Points on every clean day, every safe mile, every passed inspection.",
  },
  {
    tag: "QUANTUM",
    title: "Quantum Scan & Bill — one invoice, four recipients",
    blurb: "Snap the BOL. Bill the broker, factor, shipper and AP desk off one scan.",
  },
];

const STATS = [
  { value: "12", label: "AI agents in the roster" },
  { value: "49 CFR 395", label: "Federal HOS rules coded" },
  { value: "7,869", label: "Low bridges mapped (FHWA NBI 2025)" },
  { value: "$29.99", label: "Starting per driver" },
  { value: "14", label: "Day free trial" },
];

const PRICING = [
  { name: "Solo", price: "$29.99", unit: "/driver/mo", muted: false },
  { name: "Pro", price: "$39.99", unit: "/driver/mo", muted: true },
  { name: "Fleet (hardware leased)", price: "$49.99", unit: "/truck/mo", muted: true },
  { name: "Fleet (hardware owned)", price: "$59.99", unit: "/driver/mo", muted: true },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "Oswald, sans-serif",
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: GOLD_BRIGHT,
        border: `1px solid ${GOLD}55`,
        background: "#C9A84C14",
        padding: "4px 9px",
        borderRadius: 4,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export default function LandingPage() {
  const [tag, setTag] = useState<(typeof TAGS)[number]>("ALL");
  const shown = useMemo(
    () => (tag === "ALL" ? FEATURES : FEATURES.filter((f) => f.tag === tag)),
    [tag],
  );

  return (
    <div style={{ background: BLACK, color: "#F5F5F5", minHeight: "100vh" }}>
      {/* ticker */}
      <div
        style={{
          borderBottom: `1px solid ${BORDER}`,
          background: "#111111",
          padding: "7px 20px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: "#9A9A9A",
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ color: GOLD_BRIGHT, letterSpacing: "0.15em" }}>● LIVE</span>
        <span>Safety SOS — direct to 911 and state patrol</span>
        <span style={{ color: "#3A3A3A" }}>|</span>
        <span>Federal HOS rules coded from 49 CFR 395</span>
        <span style={{ color: "#3A3A3A" }}>|</span>
        <span>7,869 low bridges from FHWA NBI 2025</span>
      </div>

      {/* nav */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: `1px solid ${BORDER}`,
          background: "#0d0d0d",
        }}
      >
        <img src="/static/twe-logo-horizontal-trim.png" alt="TruckWithEase" style={{ height: 34 }} />
        <nav style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <Link
            to="/app/pricing"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 13,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#C9C9C9",
            }}
          >
            Pricing
          </Link>
          <Link
            to="/app"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 13,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: BLACK,
              background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 40%,${GOLD} 70%,#8A6E2F 100%)`,
              padding: "9px 18px",
              borderRadius: 5,
              fontWeight: 600,
            }}
          >
            Open the app
          </Link>
        </nav>
      </header>

      {/* hero */}
      <section
        style={{
          padding: "84px 24px 72px",
          textAlign: "center",
          background:
            "radial-gradient(circle at 50% 0%, #1a1508 0%, #0a0a0a 62%)",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: 11,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: GOLD,
            marginBottom: 22,
          }}
        >
          The platform nothing else can build
        </div>
        <h1
          style={{
            fontFamily: "Bebas Neue, Oswald, sans-serif",
            fontSize: "clamp(46px, 8.5vw, 108px)",
            lineHeight: 0.94,
            letterSpacing: "0.01em",
            margin: 0,
          }}
        >
          TRUCK
          <span
            style={{
              background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 40%,${GOLD} 70%,#8A6E2F 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            WITH
          </span>
          EASE
        </h1>
        <p
          style={{
            maxWidth: 620,
            margin: "22px auto 0",
            color: "#A8A8A8",
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          Twelve proprietary features no competitor has shipped. Three vehicle worlds — trucks,
          cars, bikes — on one platform that hires, dispatches, pays, trains and protects without a
          single manual step.
        </p>

        <div
          style={{
            display: "flex",
            gap: "clamp(20px, 5vw, 56px)",
            justifyContent: "center",
            flexWrap: "wrap",
            margin: "40px 0 36px",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Bebas Neue, Oswald, sans-serif",
                  fontSize: 42,
                  lineHeight: 1,
                  background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 50%,#8A6E2F 100%)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#7A7A7A",
                  marginTop: 6,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/app/billing"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 14,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: BLACK,
              background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 40%,${GOLD} 70%,#8A6E2F 100%)`,
              padding: "14px 30px",
              borderRadius: 6,
            }}
          >
            Start free trial
          </Link>
          <Link
            to="/app"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 14,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: GOLD_BRIGHT,
              border: `1px solid ${GOLD}66`,
              padding: "14px 30px",
              borderRadius: 6,
            }}
          >
            Live demo
          </Link>
        </div>
      </section>

      {/* price proof */}
      <section style={{ padding: "70px 24px", borderBottom: `1px solid ${BORDER}` }}>
        <div
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: GOLD,
            textAlign: "center",
          }}
        >
          The price proof
        </div>
        <h2
          style={{
            fontFamily: "Bebas Neue, Oswald, sans-serif",
            fontSize: "clamp(30px, 5vw, 54px)",
            textAlign: "center",
            margin: "16px auto 8px",
            maxWidth: 780,
            lineHeight: 1.04,
          }}
        >
          WHY FLEET OWNERS SWITCH{" "}
          <span
            style={{
              background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 50%,#8A6E2F 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            IN THE FIRST CONVERSATION
          </span>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 16,
            maxWidth: 900,
            margin: "36px auto 0",
          }}
        >
          {PRICING.map((p) => (
            <div
              key={p.name}
              style={{
                position: "relative",
                background: p.muted ? "#121212" : CARD,
                border: `1px solid ${p.muted ? BORDER : GOLD}`,
                borderRadius: 10,
                padding: "26px 20px",
                boxShadow: p.muted ? "none" : "0 0 0 3px #C9A84C1a",
              }}
            >
              {!p.muted && (
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: 18,
                    fontFamily: "Oswald, sans-serif",
                    fontSize: 9,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: BLACK,
                    background: GOLD_BRIGHT,
                    padding: "3px 9px",
                    borderRadius: 3,
                    fontWeight: 600,
                  }}
                >
                  Best value
                </div>
              )}
              <div
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: p.muted ? "#8A8A8A" : GOLD_BRIGHT,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontFamily: "Bebas Neue, Oswald, sans-serif",
                  fontSize: 40,
                  marginTop: 10,
                  color: p.muted ? "#6E6E6E" : "#FFFFFF",
                }}
              >
                {p.price}
                <span style={{ fontSize: 14, color: "#7A7A7A", marginLeft: 4 }}>{p.unit}</span>
              </div>
              {!p.muted && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#A8A8A8", lineHeight: 1.6 }}>
                  Everything above. 14-day trial. No contract, cancel any time.
                </div>
              )}
            </div>
          ))}
        </div>
        <p
          style={{
            maxWidth: 900,
            margin: "18px auto 0",
            fontSize: 11,
            color: "#6E6E6E",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          TruckWithEase pricing of record: Solo $29.99/driver/mo, Pro $39.99/driver/mo, Fleet
          $49.99/truck/mo with hardware lease included, or $59.99/driver/mo hardware-owned
          ($600/truck one-time). 14-day trial, no contracts, Net 30. There is no enterprise tier.
        </p>
      </section>

      {/* 12 reasons */}
      <section style={{ padding: "70px 24px", borderBottom: `1px solid ${BORDER}` }}>
        <div
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: GOLD,
            textAlign: "center",
          }}
        >
          Every feature a competitor can't copy
        </div>
        <h2
          style={{
            fontFamily: "Bebas Neue, Oswald, sans-serif",
            fontSize: "clamp(30px, 5vw, 54px)",
            textAlign: "center",
            margin: "16px 0 30px",
            lineHeight: 1.04,
          }}
        >
          12 REASONS{" "}
          <span
            style={{
              background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 50%,#8A6E2F 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            NOTHING COMPETES
          </span>
        </h2>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 30,
          }}
        >
          {TAGS.map((t) => {
            const active = t === tag;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "8px 15px",
                  borderRadius: 5,
                  cursor: "pointer",
                  color: active ? BLACK : "#9A9A9A",
                  background: active
                    ? `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 60%,#8A6E2F 100%)`
                    : "transparent",
                  border: `1px solid ${active ? GOLD : BORDER}`,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 18,
            maxWidth: 1180,
            margin: "0 auto",
          }}
        >
          {shown.map((f) => (
            <article
              key={f.title}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Badge>{f.tag}</Badge>
              </div>
              <h3
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: 19,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  margin: 0,
                  color: "#FFFFFF",
                  lineHeight: 1.25,
                }}
              >
                {f.title}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: GOLD, lineHeight: 1.6 }}>{f.blurb}</p>
              {f.note && (
                <div style={{ fontSize: 11, color: "#7A7A7A", lineHeight: 1.55 }}>{f.note}</div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* closing */}
      <section
        style={{
          padding: "80px 24px",
          textAlign: "center",
          background: "radial-gradient(circle at 50% 100%, #1a1508 0%, #0a0a0a 65%)",
        }}
      >
        <div
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          Nothing comes close
        </div>
        <h2
          style={{
            fontFamily: "Bebas Neue, Oswald, sans-serif",
            fontSize: "clamp(32px, 6vw, 64px)",
            lineHeight: 1.02,
            margin: "18px 0 0",
          }}
        >
          YOUR FLEET.
          <br />
          <span
            style={{
              background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 50%,#8A6E2F 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            YOUR ADVANTAGE.
          </span>
          <br />
          OUR PLATFORM.
        </h2>
        <p style={{ color: "#A8A8A8", fontSize: 14, margin: "20px auto 30px", maxWidth: 460, lineHeight: 1.7 }}>
          No contracts. No hardware lock-in. Fourteen days free — every feature, every driver, from
          the moment you sign up.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/app/billing"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 14,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: BLACK,
              background: `linear-gradient(135deg,${GOLD} 0%,${GOLD_BRIGHT} 40%,${GOLD} 70%,#8A6E2F 100%)`,
              padding: "14px 30px",
              borderRadius: 6,
            }}
          >
            Start now — free trial
          </Link>
          <Link
            to="/app/pricing"
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: 14,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: GOLD_BRIGHT,
              border: `1px solid ${GOLD}66`,
              padding: "14px 30px",
              borderRadius: 6,
            }}
          >
            See all pricing
          </Link>
        </div>
      </section>

      <footer
        style={{
          borderTop: `1px solid ${BORDER}`,
          background: "#0d0d0d",
          padding: "26px 24px",
          textAlign: "center",
          fontSize: 12,
          color: "#6E6E6E",
          lineHeight: 1.8,
        }}
      >
        <img
          src="/static/twe-logo-horizontal-trim.png"
          alt="TruckWithEase"
          style={{ height: 26, opacity: 0.75, marginBottom: 10 }}
        />
        <div>Drive smart. Stay compliant.</div>
        <div>
          My Dads Trucking LLC · Springfield, MO · 636-706-8338 · jeremiahjmorris1126@gmail.com
        </div>
      </footer>
    </div>
  );
}
