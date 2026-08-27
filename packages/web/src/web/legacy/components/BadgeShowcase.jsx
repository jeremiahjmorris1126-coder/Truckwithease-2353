/*
 * BadgeShowcase — achievement grid for legacy pages (DispatchPage, FleetLoadBoardPage).
 *
 * Jeremiah's original is preserved verbatim at docs/launch/BadgeShowcase.ORIGINAL.jsx.txt.
 * Same 8 badge keys, same `achievements: string[]` prop, same default export — consumers unchanged.
 *
 * Changed: the original assigned each badge its own accent from the abandoned palette
 * (green #4ade80, blue #3b82f6, orange #ff6b00, red #f87171, card #0f1419). All replaced
 * with brand tokens. Locked badges now render dimmed instead of being hidden, so the grid
 * shows real progress instead of an empty box.
 *
 * Earned status comes from GET /api/rewards/:driverId/badges (real rows only — `ten-stops-rated`
 * and `broker-warned` have no table yet and are never awarded). Nothing here fabricates a badge.
 */
import React from 'react';
import { Award, Zap, Target, TrendingUp, Flame, Shield, Truck, DollarSign, Lock } from 'lucide-react';

const C = {
  gold: '#C9A84C',
  goldBright: '#FFD700',
  card: '#161616',
  border: '#222222',
  text: '#f5f3ef',
  muted: '#8a8a8a',
  dim: '#666666',
};

// Tier pip only — never the whole card. Matches components/badge-showcase.tsx.
const TIER_PIP = { bronze: '#8A6E2F', silver: '#C9C4B5', gold: C.goldBright };

const badgeDefinitions = {
  'first-load-assigned': { icon: Truck, label: 'First Load', desc: 'Assigned your first load', tier: 'bronze' },
  'first-route-saved': { icon: Target, label: 'Route Master', desc: 'Saved your first route', tier: 'bronze' },
  'five-routes-saved': { icon: TrendingUp, label: 'Navigator', desc: 'Saved 5+ routes', tier: 'silver' },
  'ten-stops-rated': { icon: Award, label: 'Scout', desc: 'Rated 10+ charge stops', tier: 'silver' },
  'danger-report-filed': { icon: Flame, label: 'Alert Keeper', desc: 'Filed a danger report', tier: 'silver' },
  'broker-warned': { icon: Shield, label: 'Fleet Protector', desc: 'Warned fleet about a bad broker', tier: 'gold' },
  'one-week-user': { icon: Zap, label: 'Week One', desc: 'Active for 1 week', tier: 'bronze' },
  'fifty-actions': { icon: DollarSign, label: 'Platform Power User', desc: 'Completed 50+ actions', tier: 'gold' },
};

export const ALL_BADGE_KEYS = Object.keys(badgeDefinitions);

function Badge({ badgeKey, earned }) {
  const badge = badgeDefinitions[badgeKey];
  if (!badge) return null;
  const Icon = earned ? badge.icon : Lock;
  return (
    <div
      style={{
        position: 'relative',
        padding: '16px',
        background: C.card,
        border: earned ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
        borderRadius: 8,
        textAlign: 'center',
        opacity: earned ? 1 : 0.55,
        boxShadow: earned ? '0 0 24px -10px rgba(201,168,76,0.5)' : 'none',
      }}
    >
      {earned && (
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: TIER_PIP[badge.tier],
          }}
        />
      )}
      <Icon size={32} style={{ color: earned ? C.goldBright : C.dim, margin: '0 auto 8px', display: 'block' }} />
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: earned ? C.text : C.muted,
        }}
      >
        {badge.label}
      </div>
      <div style={{ fontSize: 11, color: earned ? C.muted : C.dim, marginTop: 4 }}>{badge.desc}</div>
      {!earned && (
        <div style={{ fontSize: 10, color: C.dim, marginTop: 6, letterSpacing: '0.08em' }}>LOCKED</div>
      )}
    </div>
  );
}

export default function BadgeShowcase({ achievements = [] }) {
  const earnedSet = new Set(Array.isArray(achievements) ? achievements : []);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, letterSpacing: '0.06em' }}>
          ACHIEVEMENTS
        </div>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>
          {earnedSet.size} / {ALL_BADGE_KEYS.length} EARNED
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
        }}
      >
        {ALL_BADGE_KEYS.map((key) => (
          <Badge key={key} badgeKey={key} earned={earnedSet.has(key)} />
        ))}
      </div>

      {earnedSet.size === 0 && (
        <div style={{ fontSize: 11, color: C.dim, marginTop: 12 }}>
          No badges earned yet. Save routes, file reports, help your fleet — each one unlocks a badge.
        </div>
      )}
    </div>
  );
}
