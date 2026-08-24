import React, { useState, useEffect } from "react";

const DARK_BG = "#0a0a0a";
const NAVY = "#0F172A";
const GOLD = "#C9A84C";
const AMBER = "#FFB400";
const ORANGE = "#FF6B00";
const BRIGHT_CYAN = "#00D9FF";
const GREEN = "#10B981";

export default function MorrishiveLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState("truck");

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: DARK_BG, color: "#fff", fontFamily: "'Oswald',sans-serif", overflowX: "hidden" }}>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${NAVY} 0%, #1a1a3e 100%)`,
        padding: "60px 5% 100px",
      }}>
        {/* Animated background elements */}
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "float 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute",
          bottom: "5%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,217,255,0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "float 10s ease-in-out infinite reverse",
        }} />

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes slide-in {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div style={{
          maxWidth: "1200px",
          width: "100%",
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          animation: "slide-in 0.8s ease-out",
        }}>
          {/* Tagline badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: `rgba(255,107,0,0.15)`,
            border: `1px solid rgba(255,107,0,0.4)`,
            borderRadius: "50px",
            padding: "8px 20px",
            marginBottom: "24px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: ORANGE,
          }}>
            <span style={{ display: "inline-block", animation: "pulse 2s infinite" }}>●</span>
            Welcome to Morrishive
          </div>

          {/* Main headline */}
          <h1 style={{
            fontSize: "clamp(2.2rem, 6vw, 4rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: "24px",
            letterSpacing: "-0.02em",
          }}>
            Every Driver.
            <br />
            <span style={{ color: ORANGE, textShadow: `0 0 30px rgba(255,107,0,0.3)` }}>
              Every Ability.
            </span>
            <br />
            One Platform.
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "700px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
            fontFamily: "'Inter',sans-serif",
            fontWeight: 400,
          }}>
            Trucks, vans, cars, bikes — whatever you drive, whoever you are. 
            <span style={{ color: GOLD, fontWeight: 600 }}> DriveWithEase</span> is built for <strong>you</strong>. 
            Real-time navigation, accessibility-first, haptic language, sign translation, spatial audio. 
            <span style={{ color: BRIGHT_CYAN }}> Career or community.</span> Both matter.
          </p>

          {/* CTA Button */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
            <a href="/drive-with-ease" style={{
              display: "inline-block",
              background: ORANGE,
              color: "#0F172A",
              padding: "16px 40px",
              borderRadius: "8px",
              fontWeight: 900,
              fontSize: "16px",
              textDecoration: "none",
              boxShadow: `0 12px 40px rgba(255,107,0,0.3)`,
              transition: "all 0.3s",
              border: "none",
              cursor: "pointer",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 16px 50px rgba(255,107,0,0.4)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 12px 40px rgba(255,107,0,0.3)`;
              }}>
              Start Free Trial →
            </a>
            <a href="/accessibility" style={{
              display: "inline-block",
              background: "transparent",
              color: BRIGHT_CYAN,
              padding: "16px 40px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "16px",
              textDecoration: "none",
              border: `2px solid ${BRIGHT_CYAN}`,
              transition: "all 0.3s",
              cursor: "pointer",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `rgba(0,217,255,0.1)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
              }}>
              Explore Accessibility
            </a>
          </div>

          {/* Trust metrics */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "32px",
            marginTop: "60px",
            paddingTop: "60px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}>
            {[
              { number: "55+", label: "Modules Built", icon: "⚙️" },
              { number: "7", label: "Sign Languages", icon: "🤟" },
              { number: "128D", label: "Spatial Audio", icon: "🎧" },
              { number: "14", label: "Day Free Trial", icon: "🚀" },
            ].map((stat, i) => (
              <div key={i} style={{ animation: `slide-in 0.8s ease-out ${i * 0.1}s backwards` }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{stat.icon}</div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: GOLD }}>{stat.number}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IS DRIVEWITHEASE ───────────────────────────────────────────── */}
      <section style={{
        padding: "80px 5%",
        background: NAVY,
        position: "relative",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: `rgba(0,217,255,0.15)`,
              border: `1px solid rgba(0,217,255,0.4)`,
              borderRadius: "50px",
              padding: "8px 20px",
              marginBottom: "20px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: BRIGHT_CYAN,
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GREEN }}></span>
              What We Built
            </div>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 900,
              color: "white",
              marginBottom: "20px",
              lineHeight: 1.1,
            }}>
              <span style={{ color: BRIGHT_CYAN }}>DriveWithEase</span>: One App, Every Vehicle, Every Ability
            </h2>
            <p style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.7)",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.7,
              fontFamily: "'Inter',sans-serif",
            }}>
              Solo trucker. Family member who's deaf. Blind courier. Owner-op managing a fleet. Motorcycle commuter. 
              <strong> One platform serves them all.</strong> Built accessibility-first, not as an afterthought.
            </p>
          </div>

          {/* Vehicle selector */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "16px",
            marginBottom: "60px",
            maxWidth: "700px",
            margin: "0 auto 60px",
          }}>
            {[
              { id: "truck", icon: "🚛", label: "Truck", desc: "Class A, Owner-op" },
              { id: "van", icon: "🚐", label: "Van", desc: "Commercial" },
              { id: "car", icon: "🚗", label: "Car", desc: "Rideshare, Courier" },
              { id: "bike", icon: "🏍️", label: "Bike", desc: "Courier, Commuter" },
            ].map(v => (
              <button key={v.id}
                onClick={() => setSelectedVehicle(v.id)}
                style={{
                  background: selectedVehicle === v.id ? `rgba(255,107,0,0.25)` : "rgba(255,255,255,0.05)",
                  border: `2px solid ${selectedVehicle === v.id ? ORANGE : "rgba(255,255,255,0.1)"}`,
                  color: selectedVehicle === v.id ? ORANGE : "rgba(255,255,255,0.7)",
                  padding: "20px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  fontSize: "14px",
                  fontFamily: "'Oswald',sans-serif",
                }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{v.icon}</div>
                <div>{v.label}</div>
                <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "4px" }}>{v.desc}</div>
              </button>
            ))}
          </div>

          {/* Feature grid based on selection */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}>
            {selectedVehicle === "truck" && [
              { title: "HOS Compliance & ELD", desc: "Automatic logging, DOT alerts, violation prevention", icon: "📋" },
              { title: "Real-Time Routing", desc: "Charge stops, fuel prices, toll optimization", icon: "🗺️" },
              { title: "Load Board Intelligence", desc: "Broker ratings, pay predictions, factoring", icon: "📊" },
              { title: "Traxes Financial AI", desc: "Automatic expense tracking, tax deductions, reporting", icon: "💰" },
              { title: "Rig Bucks Rewards", desc: "Owner-op cash back on fuel, maintenance, insurance", icon: "💳" },
              { title: "DVIR & Maintenance", desc: "AI-powered defect detection, MaintEase integration", icon: "🔧" },
            ].map((f, i) => featureCard(f, i))}
            {selectedVehicle === "van" && [
              { title: "Commercial Dispatch", desc: "Real-time job assignments, route optimization", icon: "📱" },
              { title: "Cargo Documentation", desc: "Proof of delivery, weight tickets, manifest OCR", icon: "📦" },
              { title: "Driver Scoring", desc: "Safety metrics, efficiency analytics, insurance discounts", icon: "⭐" },
              { title: "Fleet Communication", desc: "Dispatch messages, photo evidence, real-time tracking", icon: "💬" },
              { title: "Tax Intelligence", desc: "State-by-state deductions, mileage tracking", icon: "💼" },
              { title: "Accessibility Built-In", desc: "Captions, spatial audio, haptic alerts", icon: "♿" },
            ].map((f, i) => featureCard(f, i))}
            {selectedVehicle === "car" && [
              { title: "Rideshare Earnings", desc: "Per-trip profitability, tax reporting, income protection", icon: "💵" },
              { title: "Route Safety", desc: "Danger reports, real-time crime alerts, emergency SOS", icon: "🚨" },
              { title: "Multi-Platform Tracking", desc: "Uber, Lyft, local dispatch — one dashboard", icon: "📍" },
              { title: "Community Connection", desc: "Driver networks, peer support, crisis assistance", icon: "🤝" },
              { title: "Accessibility First", desc: "Deaf/blind/elderly drivers supported equally", icon: "♿" },
              { title: "Family Notifications", desc: "Share location with family, emergency alerts", icon: "👨‍👩‍👧" },
            ].map((f, i) => featureCard(f, i))}
            {selectedVehicle === "bike" && [
              { title: "Courier Dispatch", desc: "Food delivery, package pickup, job assignments", icon: "🚴" },
              { title: "Earnings Dashboard", desc: "Per-delivery payout, fuel equivalent savings", icon: "💸" },
              { title: "Route Intelligence", desc: "Traffic avoidance, bike lane mapping, weather alerts", icon: "🗺️" },
              { title: "Safety Network", desc: "Live location sharing, crash detection, SOS", icon: "🆘" },
              { title: "Accessibility Tools", desc: "Voice navigation, vibration alerts, screen readers", icon: "♿" },
              { title: "Community Belonging", desc: "Courier networks, advocacy, peer mentoring", icon: "🌍" },
            ].map((f, i) => featureCard(f, i))}
          </div>
        </div>
      </section>

      {/* ── ACCESSIBILITY CORE ──────────────────────────────────────────────── */}
      <section style={{
        padding: "80px 5%",
        background: `linear-gradient(135deg, ${DARK_BG} 0%, #1a1a3e 100%)`,
        position: "relative",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: `rgba(16,185,129,0.15)`,
              border: `1px solid rgba(16,185,129,0.4)`,
              borderRadius: "50px",
              padding: "8px 20px",
              marginBottom: "20px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: GREEN,
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GREEN }}></span>
              Our Foundation
            </div>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 900,
              color: "white",
              marginBottom: "20px",
              lineHeight: 1.2,
            }}>
              Accessibility Isn't a <span style={{ color: GREEN }}>Feature</span>.<br />
              It's the <span style={{ color: GREEN }}>Architecture</span>.
            </h2>
          </div>

          {/* Core accessibility pillars */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "60px",
          }}>
            {[
              {
                title: "Real-Time Captions",
                desc: "99.8% accuracy on all speech. Deaf drivers see every dispatch, broker call, voice command.",
                icon: "📝",
                color: BRIGHT_CYAN,
              },
              {
                title: "Sign Language Translation",
                desc: "7 languages (ASL, BSL, LSF, DGS, ISL, AUSLAN, NZSL). Text-to-sign video + sign-to-text.",
                icon: "🤟",
                color: GOLD,
              },
              {
                title: "Spatial Audio (128D)",
                desc: "Blind drivers 'hear' the road in 3D. Vehicle position, hazards, lane guidance — all stereo.",
                icon: "🎧",
                color: ORANGE,
              },
              {
                title: "Haptic Language",
                desc: "Feel messages through vibration patterns. Steering wheel, phone, smartwatch — all synced.",
                icon: "📳",
                color: BRIGHT_CYAN,
              },
              {
                title: "24/7 Human Support",
                desc: "2,847 mentors. Crisis response in 2–5 minutes. Financial assistance up to $10K.",
                icon: "🤝",
                color: GREEN,
              },
              {
                title: "Voice-First Control",
                desc: "24+ voice commands across all functions. Hands-free, eyes-free. Works on all devices.",
                icon: "🎤",
                color: ORANGE,
              },
            ].map((p, i) => (
              <div key={i} style={{
                background: `rgba(255,255,255,0.05)`,
                border: `1.5px solid rgba(255,255,255,0.1)`,
                borderRadius: "16px",
                padding: "32px",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `rgba(255,255,255,0.08)`;
                  e.currentTarget.style.borderColor = p.color;
                  e.currentTarget.style.boxShadow = `0 0 30px ${p.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `rgba(255,255,255,0.05)`;
                  e.currentTarget.style.borderColor = `rgba(255,255,255,0.1)`;
                  e.currentTarget.style.boxShadow = "none";
                }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>{p.icon}</div>
                <h3 style={{ fontSize: "18px", fontWeight: 900, marginBottom: "8px", color: p.color }}>
                  {p.title}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.6,
                  fontFamily: "'Inter',sans-serif",
                }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Call to action */}
          <div style={{ textAlign: "center" }}>
            <a href="/accessibility" style={{
              display: "inline-block",
              background: GREEN,
              color: "#0F172A",
              padding: "16px 40px",
              borderRadius: "8px",
              fontWeight: 900,
              fontSize: "16px",
              textDecoration: "none",
              boxShadow: `0 12px 40px ${GREEN}30`,
              transition: "all 0.3s",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
              }}>
              Explore Full Accessibility Suite →
            </a>
          </div>
        </div>
      </section>

      {/* ── WHO IT SERVES ───────────────────────────────────────────────────── */}
      <section style={{
        padding: "80px 5%",
        background: NAVY,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: `rgba(201,168,76,0.15)`,
              border: `1px solid rgba(201,168,76,0.4)`,
              borderRadius: "50px",
              padding: "8px 20px",
              marginBottom: "20px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: GOLD,
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD }}></span>
              For Everyone
            </div>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 900,
              color: "white",
              marginBottom: "20px",
            }}>
              Career Drivers.
              <br />
              <span style={{ color: GOLD }}>Accessibility Advocates.</span>
              <br />
              Families. Communities.
            </h2>
          </div>

          {/* User personas */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}>
            {[
              {
                title: "Owner-Operators",
                icon: "🚛",
                users: ["Solo Class A drivers", "Independent 1099s", "Rig Bucks members"],
                features: ["Load board", "Traxes tax AI", "Rewards program", "Broker intelligence"],
              },
              {
                title: "Fleet Managers",
                icon: "🏢",
                users: ["Company operations", "Safety teams", "Compliance officers"],
                features: ["Driver dispatch", "Real-time tracking", "DVIR automation", "HOS logging"],
              },
              {
                title: "HUH - Hearing Impaired",
                icon: "🤟",
                users: ["Truck drivers", "Couriers", "Commuters"],
                features: ["Real-time captions", "Sign translation", "Visual alerts", "Haptic feedback"],
              },
              {
                title: "Blind & Low Vision",
                icon: "🎧",
                users: ["Audio-first navigation", "Spatial awareness", "Voice commands"],
                features: ["128D spatial audio", "Screen reader support", "Voice control", "Haptic lane guidance"],
              },
              {
                title: "Elderly Drivers",
                icon: "👴",
                users: ["Rideshare", "Delivery", "Commute assistance"],
                features: ["Large text (18pt+)", "Simplified navigation", "Health monitoring", "Family alerts"],
              },
              {
                title: "Families",
                icon: "👨‍👩‍👧",
                users: ["Support loved ones", "Monitor safety", "Crisis response", "Community mentoring"],
                features: ["Live location sharing", "Emergency SOS", "Peer mentoring", "Financial help"],
              },
            ].map((persona, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,107,0,0.04) 100%)`,
                border: `1.5px solid rgba(255,255,255,0.1)`,
                borderRadius: "16px",
                padding: "28px",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = ORANGE;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = `rgba(255,255,255,0.1)`;
                }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>{persona.icon}</div>
                <h3 style={{ fontSize: "18px", fontWeight: 900, marginBottom: "12px", color: ORANGE }}>
                  {persona.title}
                </h3>
                <div style={{ marginBottom: "16px" }}>
                  {persona.users.map(u => (
                    <div key={u} style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: "4px",
                    }}>
                      • {u}
                    </div>
                  ))}
                </div>
                <div style={{
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  marginTop: "16px",
                }}>
                  {persona.features.map(f => (
                    <div key={f} style={{
                      fontSize: "12px",
                      color: GOLD,
                      fontWeight: 700,
                      marginBottom: "4px",
                    }}>
                      ✓ {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ──────────────────────────────────────────────────────── */}
      <section style={{
        padding: "80px 5%",
        background: `linear-gradient(135deg, ${DARK_BG} 0%, #1a1a3e 100%)`,
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            marginBottom: "24px",
            lineHeight: 1.1,
          }}>
            <span style={{ color: ORANGE }}>No contracts.</span>
            <br />
            <span style={{ color: BRIGHT_CYAN }}>14-day free trial.</span>
            <br />
            Every feature included.
          </h2>
          <p style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "40px",
            lineHeight: 1.7,
            fontFamily: "'Inter',sans-serif",
          }}>
            Whether you're driving for income, supporting a family member who's deaf or blind, or joining a community 
            that puts accessibility first — start now, cancel anytime. No setup required.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/drive-with-ease" style={{
              display: "inline-block",
              background: ORANGE,
              color: "#0F172A",
              padding: "18px 44px",
              borderRadius: "8px",
              fontWeight: 900,
              fontSize: "16px",
              textDecoration: "none",
              boxShadow: `0 12px 40px ${ORANGE}30`,
              transition: "all 0.3s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              Get Started Now →
            </a>
            <a href="tel:636-706-8338" style={{
              display: "inline-block",
              background: "transparent",
              color: GOLD,
              padding: "18px 44px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "16px",
              textDecoration: "none",
              border: `2px solid ${GOLD}`,
              transition: "all 0.3s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = `${GOLD}15`}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              Call 636-706-8338
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function featureCard(f, i) {
  return (
    <div key={i} style={{
      background: `rgba(255,255,255,0.05)`,
      border: `1.5px solid rgba(255,255,255,0.1)`,
      borderRadius: "12px",
      padding: "24px",
      transition: "all 0.3s",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `rgba(255,255,255,0.08)`;
        e.currentTarget.style.borderColor = ORANGE;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `rgba(255,255,255,0.05)`;
        e.currentTarget.style.borderColor = `rgba(255,255,255,0.1)`;
      }}>
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>{f.icon}</div>
      <h3 style={{ fontSize: "16px", fontWeight: 900, marginBottom: "8px", color: "white" }}>
        {f.title}
      </h3>
      <p style={{
        fontSize: "13px",
        color: "rgba(255,255,255,0.6)",
        lineHeight: 1.5,
        fontFamily: "'Inter',sans-serif",
      }}>
        {f.desc}
      </p>
    </div>
  );
}
