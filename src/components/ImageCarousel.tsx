import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Shield, Radio, Activity } from 'lucide-react';

import imgFleetCommand from '../assets/images/fleet_command_telematics_1788642308333.jpg';
import imgHighwayTruck from '../assets/images/semi_truck_highway_1788642321138.jpg';
import imgCabinTelematics from '../assets/images/in_cab_telematics_rig_1788642338920.jpg';

interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  metrics: { label: string; value: string }[];
}

const SLIDES: Slide[] = [
  {
    id: 'fleet-command',
    image: imgFleetCommand,
    title: 'Tactical Fleet Command & GIS Mesh',
    subtitle: 'Real-time multi-node GPS tracking across 48 contiguous states with dynamic geofence triggers.',
    category: 'TACTICAL RADAR',
    badge: 'NODE ACTIVE',
    metrics: [
      { label: 'Ingress Stream', value: '41ms Latency' },
      { label: 'Active Trucks', value: '42 Rigs Deployed' },
      { label: 'Encryption', value: 'SHA-256 HMAC' },
    ],
  },
  {
    id: 'highway-interstate',
    image: imgHighwayTruck,
    title: 'Autonomous Interstate Haul Logistics',
    subtitle: 'Automated state-line toll vectors and IFTA fuel tax calculations without manual driver intervention.',
    category: 'EQUIPMENT TELEMETRY',
    badge: 'HAULING',
    metrics: [
      { label: 'Route Corridor', value: 'I-80 Continental' },
      { label: 'Fuel Flow', value: '7.8 MPG Opt' },
      { label: 'Bridge Safety', value: 'Zero Hazard Flag' },
    ],
  },
  {
    id: 'cab-telematics',
    image: imgCabinTelematics,
    title: 'Next-Gen In-Cab ELD & Audio Ingress',
    subtitle: 'Direct hardware ELD integration with real-time HOS rolling 14-hour window and CB audio synthesis.',
    category: 'HARDWARE SENSORS',
    badge: 'HARDENED',
    metrics: [
      { label: 'ELD Protocol', value: 'Samsara / Geotab' },
      { label: 'HOS Status', value: '9h 12m Remaining' },
      { label: 'Zero-Spoof', value: '100% Bound' },
    ],
  },
];

export const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <div
      id="tactical-image-carousel"
      className="relative w-full bg-[#141414] border border-[#222] shadow-xl overflow-hidden group"
    >
      {/* Top status bar of carousel */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#111] border-b border-[#222] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#C9A84C] animate-pulse" />
          <span className="text-[#C9A84C] font-black uppercase tracking-widest text-[11px]">
            // TACTICAL FLEET IMAGERY
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-[#1C1C1C] border border-[#333] text-[#888] text-[10px] uppercase font-bold tracking-wider">
            {currentSlide.category}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Slide counter */}
          <span className="text-[#888] font-bold tracking-widest text-[11px]">
            <span className="text-white">0{currentIndex + 1}</span> / 0{SLIDES.length}
          </span>

          {/* Autoplay toggle */}
          <button
            id="carousel-autoplay-toggle-btn"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            aria-label={isAutoPlay ? 'Pause Carousel' : 'Play Carousel'}
            className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#888] hover:text-[#C9A84C] transition-colors"
          >
            {isAutoPlay ? (
              <>
                <Pause className="w-3 h-3 text-[#C9A84C]" />
                <span className="hidden md:inline">AUTO</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#888]" />
                <span className="hidden md:inline">PAUSED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] w-full overflow-hidden bg-black">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
            />
            {/* High-contrast gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/80 via-transparent to-transparent hidden sm:block" />

            {/* Tactical Grid Scanlines Effect */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(204,255,0,0.15) 2px, rgba(204,255,0,0.15) 4px)',
              }}
            />
          </div>
        ))}

        {/* Tactical Overlay Content */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-[#C9A84C] text-black font-mono font-black text-[10px] uppercase tracking-widest">
              {currentSlide.badge}
            </span>
            <span className="text-[11px] font-mono text-[#C9A84C] font-bold uppercase tracking-widest hidden sm:inline-block">
              // TELEMATICS FEED
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl lg:text-3xl font-headline font-black uppercase text-white tracking-tight leading-tight max-w-2xl">
            {currentSlide.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#bbb] font-body mt-1 max-w-xl line-clamp-2 sm:line-clamp-none">
            {currentSlide.subtitle}
          </p>

          {/* Key Slide Metrics Bar */}
          <div className="mt-3 pt-3 border-t border-[#333]/80 flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-mono">
            {currentSlide.metrics.map((metric, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[#888] text-[10px] uppercase tracking-wider">{metric.label}:</span>
                <span className="text-[#C9A84C] font-bold text-xs">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <button
          id="carousel-prev-btn"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-black/75 hover:bg-[#C9A84C] text-white hover:text-black border border-[#444] hover:border-[#C9A84C] flex items-center justify-center transition-all backdrop-blur-sm active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          id="carousel-next-btn"
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-black/75 hover:bg-[#C9A84C] text-white hover:text-black border border-[#444] hover:border-[#C9A84C] flex items-center justify-center transition-all backdrop-blur-sm active:scale-95"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Indicator Dots Bar */}
      <div className="p-2.5 bg-[#111] border-t border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              id={`carousel-dot-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 transition-all ${
                idx === currentIndex ? 'w-8 bg-[#C9A84C]' : 'w-2 bg-[#333] hover:bg-[#666]'
              }`}
            />
          ))}
        </div>

        <div className="text-[10px] font-mono text-[#666] tracking-wider uppercase">
          Continuous Feed · Auto-Synchronized
        </div>
      </div>
    </div>
  );
};
