import React from 'react';

export const MORRISHIVE_LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1WWqKhJvf4NaFAjdlnZI04SFcqtUNgslIkHEij3oTpRDkVioH960VNKpU1JC92k_d7sRtPJKE-i48dhMWj37AltyrGxollTaOkGPcws97my3CYkNvBIETtvtKxQLspJPv6hDXJt4VCkdlcl5GFRVEPh5UCLcF2Plo8x6cxx3bgPls2AjiQwRvuHXaelJqYn6bu9TEhI4R4zrmLN0G6-NsOMeoAtFR-qJXrhoXkNxtoV8jx0_FaVccw-yLIELYEWS1VJdG8bfNh5nA';

export const TRUCKWITHEASE_LOGO_URL = MORRISHIVE_LOGO_URL;

interface TruckWithEaseLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showWordmark?: boolean;
  brandVariant?: 'morrishive' | 'both' | 'standard';
  wordmarkClassName?: string;
  onClick?: () => void;
}

export const TruckWithEaseLogo: React.FC<TruckWithEaseLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = false,
  brandVariant = 'both',
  wordmarkClassName = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12',
    '2xl': 'h-16 sm:h-20',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      <img
        src={MORRISHIVE_LOGO_URL}
        alt="TRUCKWITHEASE Official Logo"
        className={`${sizeClasses[size]} w-auto object-contain transition-transform drop-shadow-[0_0_12px_rgba(242,202,80,0.25)] ${
          onClick ? 'group-hover:scale-105' : ''
        }`}
        loading="eager"
      />
      {showWordmark && (
        <div className={`flex flex-col leading-tight ${wordmarkClassName}`}>
          {brandVariant === 'morrishive' && (
            <>
              <span className="font-headline font-black tracking-wider text-[#FFD700] uppercase text-sm sm:text-base">
                TRUCKWITHEASE
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8A8A8A]">
                Fleet Cockpit
              </span>
            </>
          )}

          {brandVariant === 'both' && (
            <>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-headline font-black tracking-wider text-[#FFD700] uppercase text-xs sm:text-sm">
                  TRUCKWITHEASE
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 font-bold uppercase rounded">
                  OFFICIAL
                </span>
              </div>
              <span className="font-mono text-[10px] text-white font-bold tracking-wider whitespace-nowrap">
                ENTERPRISE FLEET OS <span className="text-[#888] font-normal text-[9px]">v4.28</span>
              </span>
            </>
          )}

          {brandVariant === 'standard' && (
            <span
              className={`font-black tracking-wider text-white whitespace-nowrap font-mono ${textSizes[size]}`}
            >
              TRUCKWITHEASE
            </span>
          )}
        </div>
      )}
    </div>
  );
};

