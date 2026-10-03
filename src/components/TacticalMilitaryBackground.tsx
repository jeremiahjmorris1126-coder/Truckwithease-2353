import React, { memo } from 'react';

/**
 * TacticalMilitaryBackground
 * 
 * Provides an authentic Army / Military Tactical Operations Center (TOC) aesthetic:
 * - Subtle dual-layer tactical coordinate grid (32px precision & 128px sector lines)
 * - Whisper-quiet sweeping radar beam with night-vision phosphor green glow
 * - Military HUD crosshairs and corner brackets
 * - Digital military coordinate stamps and readiness markers (NORAD / DARPA style)
 * - 100% GPU accelerated via pure CSS & SVG, pointer-events-none, zero CPU lag
 */
export const TacticalMilitaryBackground: React.FC = memo(() => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Tactical Deep Black & Subtle Gold Ambient Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,230,0,0.06),rgba(0,0,0,0.99)_75%)]" />

      {/* 2. Micro Coordinate Grid (32px) */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 230, 0, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 230, 0, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* 3. Tactical Sector Grid (128px) with bolder lines */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 230, 0, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 230, 0, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '128px 128px',
        }}
      />

      {/* 4. Concentric Tactical Radar Range Rings (Centered) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-[#FFE600]/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full border border-[#FFE600]/15 pointer-events-none border-dashed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-[#FFE600]/20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-[#FFE600]/25 pointer-events-none" />

      {/* 5. Center Radar Crosshair Axis */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFE600]/20 to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#FFE600]/20 to-transparent pointer-events-none" />

      {/* 6. Rotating Military Radar Sweep Beam */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none opacity-30">
        <div
          className="w-full h-full rounded-full animate-[spin_18s_linear_infinite]"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, rgba(255,230,0,0.18) 0deg, rgba(255,230,0,0.04) 35deg, transparent 65deg, transparent 360deg)',
          }}
        />
      </div>

      {/* 7. Military Tactical HUD Corner Brackets & Markings */}
      <div className="absolute top-3 left-3 text-[10px] font-mono text-[#FFE600]/40 flex items-center gap-2">
        <span className="w-2.5 h-2.5 border-t-2 border-l-2 border-[#FFE600]/60 inline-block" />
        <span className="tracking-widest hidden sm:inline">TRUCKWITHEASE // SECTOR 04</span>
      </div>

      <div className="absolute top-3 right-3 text-[10px] font-mono text-[#FFE600]/40 flex items-center gap-2">
        <span className="tracking-widest hidden sm:inline">DEFCON-1 // ENCRYPTED</span>
        <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-[#FFE600]/60 inline-block" />
      </div>

      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#FFE600]/40 flex items-center gap-2">
        <span className="w-2.5 h-2.5 border-b-2 border-l-2 border-[#FFE600]/60 inline-block" />
        <span className="tracking-widest hidden md:inline">FREQ: 27.185 MHz (CH 19) · LAT 38°53&apos;51&quot;N</span>
      </div>

      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#FFE600]/40 flex items-center gap-2">
        <span className="tracking-widest hidden md:inline">MIL-STD-810H // ACTIVE MESH</span>
        <span className="w-2.5 h-2.5 border-b-2 border-r-2 border-[#FFE600]/60 inline-block" />
      </div>

      {/* 8. Tactical Vignette Edge Fade */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.92)_100%)]" />
    </div>
  );
});

TacticalMilitaryBackground.displayName = 'TacticalMilitaryBackground';
