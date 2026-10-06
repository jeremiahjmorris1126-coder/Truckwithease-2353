import React from 'react';

export const MORRISHIVE_BADGE_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1WWqKhJvf4NaFAjdlnZI04SFcqtUNgslIkHEij3oTpRDkVioH960VNKpU1JC92k_d7sRtPJKE-i48dhMWj37AltyrGxollTaOkGPcws97my3CYkNvBIETtvtKxQLspJPv6hDXJt4VCkdlcl5GFRVEPh5UCLcF2Plo8x6cxx3bgPls2AjiQwRvuHXaelJqYn6bu9TEhI4R4zrmLN0G6-NsOMeoAtFR-qJXrhoXkNxtoV8jx0_FaVccw-yLIELYEWS1VJdG8bfNh5nA';

interface MorrishiveEmblemProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'hexagon' | 'full' | 'compact' | 'badge';
  className?: string;
  showSubtitle?: boolean;
}

export const MorrishiveEmblem: React.FC<MorrishiveEmblemProps> = ({
  size = 'md',
  variant = 'compact',
  className = '',
  showSubtitle = true,
}) => {
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-[10px]', sub: 'text-[7px]' },
    sm: { icon: 'w-8 h-8', text: 'text-xs', sub: 'text-[8px]' },
    md: { icon: 'w-10 h-10', text: 'text-sm', sub: 'text-[9px]' },
    lg: { icon: 'w-14 h-14', text: 'text-base', sub: 'text-[10px]' },
    xl: { icon: 'w-20 h-20', text: 'text-lg', sub: 'text-xs' },
    '2xl': { icon: 'w-28 h-28', text: 'text-2xl', sub: 'text-sm' },
  };

  const { icon, text, sub } = sizeMap[size];

  if (variant === 'hexagon') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${icon} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(242,202,80,0.4)]">
          {/* Hexagon Outer Gold Ring */}
          <polygon
            points="50,4 92,27 92,73 50,96 8,73 8,27"
            fill="#0E0F14"
            stroke="#D4AF37"
            strokeWidth="3.5"
          />
          {/* Inner Hexagon Frame */}
          <polygon
            points="50,11 85,30 85,70 50,89 15,70 15,30"
            fill="none"
            stroke="#F2CA50"
            strokeWidth="1.5"
            strokeDasharray="2,2"
            opacity="0.8"
          />
          {/* Stylized M-Wings */}
          <path
            d="M26 34 L40 34 L40 68 L26 68 Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M60 34 L74 34 L74 68 L60 68 Z"
            fill="url(#goldGrad)"
          />
          {/* Center Kinetic Needle */}
          <polygon
            points="50,22 58,48 50,56 42,48"
            fill="#FFE088"
          />
          <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
          <polygon
            points="50,62 55,76 50,82 45,76"
            fill="#D4AF37"
          />
          {/* Gradient */}
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE088" />
              <stop offset="50%" stopColor="#F2CA50" />
              <stop offset="100%" stopColor="#AA820A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center p-4 bg-[#0E0F14] border border-[#2E303B] rounded-2xl relative overflow-hidden shadow-2xl ${className}`}>
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F2CA50] to-transparent" />
        <div className="relative mb-3">
          <MorrishiveEmblem size={size === 'md' ? 'xl' : size} variant="hexagon" />
        </div>
        <div className="flex flex-col items-center">
          <span className="font-mono font-black tracking-[0.3em] text-[#F2CA50] uppercase text-base sm:text-lg">
            MORRISHIVE
          </span>
          {showSubtitle && (
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] text-[#9AA0B4] uppercase mt-0.5">
              ENTERPRISE LOGISTICS &amp; TELEMETRY
            </span>
          )}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#222430] w-full justify-center">
            <span className="text-[8px] font-mono text-[#7C8092] uppercase tracking-wider">
              SYS.SPEC // 49 CFR § 395
            </span>
            <span className="text-[#444]">•</span>
            <span className="text-[8px] font-mono text-[#F2CA50] uppercase tracking-wider font-bold">
              RADAR VER. 2025.4
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default: Compact
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <MorrishiveEmblem size={size} variant="hexagon" />
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-mono font-black tracking-wider text-[#F2CA50] uppercase ${text}`}>
            MORRISHIVE
          </span>
          <span className="text-[8px] font-mono font-bold px-1 py-0.2 bg-[#F2CA50]/15 text-[#F2CA50] border border-[#F2CA50]/30 rounded">
            HQ
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-mono text-[#8E93A6] uppercase tracking-widest ${sub}`}>
            Logistics &amp; Telemetry
          </span>
        )}
      </div>
    </div>
  );
};
