import React from 'react';
import { Download, Share2, Star, Shield, ShieldCheck, Apple, Smartphone, Settings2 } from 'lucide-react';

export function StorefrontPackagingView() {
  return (
    <div className="flex flex-col w-full text-on-surface bg-surface min-h-screen pb-space-3xl font-body-md">
      {/* Top telemetry bar */}
      <div className="flex items-center justify-between border-b border-surface-container-high px-space-xl py-space-sm bg-surface-container-lowest">
        <div className="flex items-center gap-space-sm font-telemetry-label text-telemetry-label">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-primary tracking-widest uppercase">STORE_CHANNEL // BUILD 2025.4.1 (STAGED) | DOT / FMCSA VERIFIED</span>
        </div>
        <div className="flex items-center gap-space-xs font-telemetry-label text-telemetry-label text-on-surface-variant uppercase tracking-widest hidden md:flex">
          <span>TELEMETRIC HEALTH:</span>
          <span className="text-primary">54/54 ENDPOINTS 100% ONLINE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-space-xl pt-space-xl flex flex-col gap-space-xl">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-space-xl">
          {/* App Icon Container */}
          <div className="shrink-0 flex flex-col">
            <div className="relative w-48 h-48 bg-surface-container-lowest border border-surface-container-high flex items-center justify-center shadow-lg group">
              <div className="absolute -left-1 -top-1 w-2 h-2 bg-primary"></div>
              <div className="absolute -right-1 -bottom-1 w-2 h-2 bg-primary"></div>
              <img 
                src="https://lh3.googleusercontent.com/aida/AEtjO1WWqKhJvf4NaFAjdlnZI04SFcqtUNgslIkHEij3oTpRDkVioH960VNKpU1JC92k_d7sRtPJKE-i48dhMWj37AltyrGxollTaOkGPcws97my3CYkNvBIETtvtKxQLspJPv6hDXJt4VCkdlcl5GFRVEPh5UCLcF2Plo8x6cxx3bgPls2AjiQwRvuHXaelJqYn6bu9TEhI4R4zrmLN0G6-NsOMeoAtFR-qJXrhoXkNxtoV8jx0_FaVccw-yLIELYEWS1VJdG8bfNh5nA" 
                alt="Logo"
                className="w-24 h-24 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute bottom-2 right-2 font-telemetry-label text-telemetry-label text-primary">v4.12</div>
            </div>
            <div className="flex w-full mt-2">
              <div className="flex-1 text-center py-1 bg-primary text-on-primary font-telemetry-label text-[10px] tracking-widest font-bold">APPLE TOUCH</div>
              <div className="flex-1 text-center py-1 bg-surface-container-high text-on-surface font-telemetry-label text-[10px] tracking-widest">ANDROID VECTOR</div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col flex-1">
            <div className="flex flex-wrap items-center gap-space-sm mb-space-sm">
              <span className="font-telemetry-label text-[10px] tracking-widest uppercase text-on-surface-variant bg-surface-container px-2 py-1">DEV: MORRISHIVE LLC</span>
              <span className="font-telemetry-label text-[10px] tracking-widest uppercase text-on-surface-variant bg-surface-container px-2 py-1">CLASS A CDL UTILITY</span>
              <span className="font-telemetry-label text-[10px] tracking-widest uppercase text-primary bg-primary/20 px-2 py-1 font-bold">#1 TACTICAL COCKPIT</span>
            </div>
            
            <h1 className="font-headline-xl text-3xl sm:text-5xl font-bold text-on-surface tracking-tight mb-2">
              Truckwithease: Tactical Cockpit
            </h1>
            <h2 className="font-headline-sm text-lg sm:text-xl text-on-surface-variant mb-space-md">
              HOS Math Engine & FHWA Item 54B Low-Bridge Radar
            </h2>

            <div className="flex flex-wrap items-center gap-space-sm mb-space-lg">
              <div className="flex items-center gap-1 bg-surface-container-low border border-surface-container-high px-3 py-1.5">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="font-bold text-on-surface font-telemetry-metric">4.9</span>
                <span className="font-telemetry-label text-[10px] tracking-widest uppercase text-on-surface-variant">(1,248 RATINGS)</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low border border-surface-container-high px-3 py-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-telemetry-label text-[10px] tracking-widest uppercase text-on-surface">SPE-2025 DEAF/HOH CERTIFIED</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low border border-surface-container-high px-3 py-1.5">
                <span className="material-symbols-outlined text-primary text-[14px]">verified_user</span>
                <span className="font-telemetry-label text-[10px] tracking-widest uppercase text-on-surface">AGE 18+ CLASS A ONLY</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border-l-4 border-primary p-space-md mb-space-lg flex flex-col sm:flex-row sm:items-center gap-4">
              <img 
                src="https://lh3.googleusercontent.com/aida/AEtjO1WWqKhJvf4NaFAjdlnZI04SFcqtUNgslIkHEij3oTpRDkVioH960VNKpU1JC92k_d7sRtPJKE-i48dhMWj37AltyrGxollTaOkGPcws97my3CYkNvBIETtvtKxQLspJPv6hDXJt4VCkdlcl5GFRVEPh5UCLcF2Plo8x6cxx3bgPls2AjiQwRvuHXaelJqYn6bu9TEhI4R4zrmLN0G6-NsOMeoAtFR-qJXrhoXkNxtoV8jx0_FaVccw-yLIELYEWS1VJdG8bfNh5nA" 
                alt="TRUCKWITHEASE"
                className="h-14 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm font-bold text-primary uppercase tracking-wide">
                    TRUCKWITHEASE
                  </span>
                  <span className="font-telemetry-label text-[10px] tracking-widest uppercase text-on-surface bg-primary/20 px-2 py-0.5 font-bold">
                    OFFICIAL
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm mt-1">
                  Federal 49 CFR § 395 autonomous compliance engine integrated alongside 7,869 sub-174" FHWA Item 54B clearance radar nodes. Zero hardware lock-in.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm">
              <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-fixed transition-colors text-on-primary px-space-lg py-space-sm font-label-caps tracking-widest font-bold">
                <Download className="w-4 h-4" />
                GET // STAGED BUILD #408
              </button>
              <button className="flex items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container transition-colors border border-surface-container-high text-primary px-space-md py-space-sm font-label-caps tracking-widest">
                <Apple className="w-4 h-4" />
                TESTFLIGHT (IOS)
              </button>
              <button className="flex items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container transition-colors border border-surface-container-high text-primary px-space-md py-space-sm font-label-caps tracking-widest">
                <Smartphone className="w-4 h-4" />
                PLAY STORE AAB
              </button>
              <button className="flex items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container transition-colors border border-surface-container-high text-primary px-space-md py-space-sm font-label-caps tracking-widest hidden xl:flex">
                <Settings2 className="w-4 h-4" />
                DIRECT MDM APK
              </button>
              <button className="flex items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors border border-surface-container-high text-on-surface-variant p-space-sm">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Storefront Surface */}
        <div className="flex flex-col gap-space-md pt-space-xl border-t border-surface-container">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-1">
              <span className="font-telemetry-label text-xs text-primary uppercase tracking-widest">// COCKPIT EMULATION LAB</span>
              <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Live Storefront Surface & In-Cab Assets</h2>
              <p className="text-on-surface-variant text-sm">Cross-platform telemetry views optimized for dark-adapted in-cab glare reduction.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 font-telemetry-label text-[10px] tracking-widest uppercase font-bold">
                <Apple className="w-3 h-3" />
                APPLE STORE (IOS 17+)
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low border border-surface-container-high text-on-surface px-3 py-1.5 font-telemetry-label text-[10px] tracking-widest uppercase">
                <Smartphone className="w-3 h-3" />
                GOOGLE PLAY (API 34+)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md mt-space-sm">
            {/* Main Preview */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-surface-container-high p-space-md md:p-space-xl flex flex-col relative h-[500px]">
              <div className="flex items-center justify-between font-telemetry-label text-[10px] uppercase tracking-widest text-on-surface mb-6">
                <span className="text-primary font-bold">RADAR SWEEP // ACTIVATED</span>
                <span className="bg-surface-container border border-surface-container-high px-2 py-1 text-on-surface-variant">FHWA O-PING</span>
              </div>
              <h3 className="font-headline-md text-3xl uppercase tracking-widest text-on-surface mb-auto">IN-CAB NIGHT HUD</h3>
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-8">
                <div className="relative w-56 h-56 rounded-full border border-primary/40 flex items-center justify-center bg-primary/5">
                  <div className="absolute inset-0 rounded-full border border-primary/20 scale-125 border-dashed"></div>
                  <div className="absolute inset-0 rounded-full border border-primary/10 scale-150"></div>
                  <div className="text-center flex flex-col items-center">
                    <span className="material-symbols-outlined text-primary mb-1 opacity-50 text-[20px]">radar</span>
                    <div className="font-telemetry-metric text-5xl text-primary font-bold">80<span className="text-2xl font-normal text-primary/70 ml-1">MPH</span></div>
                    <div className="font-telemetry-label text-[10px] text-primary uppercase tracking-widest mt-1">VELOCITY LOCK</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-auto font-telemetry-label text-[10px] uppercase tracking-widest gap-2">
                <span className="text-on-surface-variant">49 CFR § 395 CLOCK: 11H DRIVE</span>
                <span className="text-primary font-bold">CLEARANCE: 14' 2" NO HAZARD</span>
              </div>
              
              <div className="flex gap-1 mt-4">
                <div className="h-1 w-12 bg-primary"></div>
                <div className="h-1 w-12 bg-surface-container-high"></div>
                <div className="h-1 w-12 bg-surface-container-high"></div>
              </div>
            </div>

            {/* Side Preview */}
            <div className="bg-surface-container-lowest border border-surface-container-high p-space-md flex flex-col h-[500px]">
              <div className="flex justify-between font-telemetry-label text-[10px] uppercase tracking-widest text-primary mb-6">
                <span className="font-bold">// COCKPIT HARDWARE</span>
                <span className="text-on-surface-variant">EMULATOR</span>
              </div>
              <div className="flex w-full mb-6">
                <div className="flex-1 text-center py-2 bg-primary text-on-primary font-telemetry-label text-[10px] tracking-widest font-bold">IPHONE 16 PRO MAX</div>
                <div className="flex-1 text-center py-2 bg-surface-container border border-surface-container-high border-l-0 text-on-surface-variant font-telemetry-label text-[10px] tracking-widest">RUGGED 10" TABLET</div>
              </div>

              <div className="flex-1 bg-surface-container/30 border border-surface-container flex flex-col p-5 gap-6 justify-center">
                <div className="flex justify-between items-center font-telemetry-label text-[10px] tracking-widest uppercase">
                  <span className="text-primary font-bold">TRUCKWITHEASE_CAB_OS // RUNNING</span>
                  <span className="text-on-surface font-telemetry-metric">00:42:19 HOS</span>
                </div>
                
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex justify-between items-center text-xs border-b border-surface-container-high pb-3">
                    <span className="text-on-surface-variant font-telemetry-label text-[10px] uppercase tracking-wider">11-HOUR DRIVE CLOCK</span>
                    <span className="font-telemetry-metric text-primary font-bold">09h 14m</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-surface-container-high pb-3">
                    <span className="text-on-surface-variant font-telemetry-label text-[10px] uppercase tracking-wider">14-HOUR ON-DUTY WINDOW</span>
                    <span className="font-telemetry-metric text-primary font-bold">11h 48m</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-surface-container-high pb-3">
                    <span className="text-on-surface-variant font-telemetry-label text-[10px] uppercase tracking-wider">70-HOUR CYCLE (8 DAYS)</span>
                    <span className="font-telemetry-metric text-on-surface font-bold">48h 12m</span>
                  </div>
                </div>

                <div className="mt-auto bg-surface-container border border-surface-container-high p-3">
                  <div className="flex items-center gap-2 text-primary font-telemetry-label text-[10px] tracking-widest uppercase mb-1 font-bold">
                    <span className="material-symbols-outlined text-[14px]">near_me</span>
                    NEXT RADAR WAYPOINT
                  </div>
                  <p className="font-telemetry-label text-[9px] text-on-surface-variant leading-relaxed uppercase tracking-widest">
                    I-80 MILEMARKER 144 // NO SUB-174" CLEARANCES DETECTED FOR 84 MILES.
                  </p>
                </div>
              </div>
              <button className="w-full bg-primary hover:bg-primary-fixed text-on-primary py-3 mt-4 font-label-caps font-bold tracking-widest transition-colors">
                EXECUTE STATUTORY BYPASS
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm font-telemetry-label text-[10px] tracking-widest uppercase mt-2">
            <div className="bg-surface-container-lowest p-3 border-l-2 border-primary">
              <span className="text-primary font-bold block mb-1">01 // TACTICAL HUD</span>
              <span className="text-on-surface">In-Cab Night Sweep</span>
            </div>
            <div className="bg-surface-container-lowest p-3 border-l-2 border-surface-container-high text-on-surface-variant">
              <span className="block mb-1">02 // ECOSYSTEM</span>
              <span>Cross-Platform Matrix</span>
            </div>
            <div className="bg-surface-container-lowest p-3 border-l-2 border-surface-container-high text-on-surface-variant">
              <span className="block mb-1">03 // ITEM 54B</span>
              <span>Radar Diverters</span>
            </div>
          </div>
        </div>

        {/* Changelog & Features */}
        <div className="flex flex-col gap-space-md pt-space-xl border-t border-surface-container">
          <div className="flex flex-col gap-1">
            <span className="font-telemetry-label text-xs text-primary uppercase tracking-widest">// DEPLOYMENT CHANGELOG</span>
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface">What's New in Version 2025.4.1</h2>
            <p className="text-on-surface-variant text-sm">Production update published to App Store review and Google Play Internal Track.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-sm">
            <div className="bg-surface-container-lowest border border-surface-container-high p-space-lg flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">radar</span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">FHWA Item 54B Radar</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">Engine preloaded with 7,869 sub-174" clearance structures. Features zero-lag sub-second proximity caching for blind hill crests.</p>
              <div className="mt-auto pt-4 font-telemetry-label text-[10px] text-primary font-bold uppercase tracking-widest">LATENCY OPTIMIZED // &lt;15MS</div>
            </div>
            
            <div className="bg-surface-container-lowest border border-surface-container-high p-space-lg flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">49 CFR § 395 Clocks</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">Multi-tier statutory telemetry tracking 11h driving, 14h window, mandatory 30m break, and 70h/8d commercial reset curves.</p>
              <div className="mt-auto pt-4 font-telemetry-label text-[10px] text-primary font-bold uppercase tracking-widest">STRICT STATUTORY LOGIC</div>
            </div>
            
            <div className="bg-surface-container-lowest border border-surface-container-high p-space-lg flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">SPE-2025 Haptic Mesh</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">15 distinct physical vibration patterns built specifically for Deaf and Hard-of-Hearing operators navigating high-noise cabs.</p>
              <div className="mt-auto pt-4 font-telemetry-label text-[10px] text-primary font-bold uppercase tracking-widest">ACCESSIBILITY AUDITED</div>
            </div>
            
            <div className="bg-surface-container-lowest border border-surface-container-high p-space-lg flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">currency_exchange</span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">Dispatch Zero Engine</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">Automated load sorting based on legal net revenue per statutory driving hour ($/hr), cross-referenced with your remaining clock.</p>
              <div className="mt-auto pt-4 font-telemetry-label text-[10px] text-primary font-bold uppercase tracking-widest">MAX-REVENUE OPTIMIZER</div>
            </div>
          </div>
        </div>

        {/* Tech Specs & Privacy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl pt-space-xl border-t border-surface-container">
          <div className="flex flex-col gap-space-md">
            <span className="font-telemetry-label text-[10px] text-primary font-bold uppercase tracking-widest">// SPECIFICATIONS</span>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface">App Information & Technical Parameters</h2>
            
            <div className="flex flex-col text-sm mt-2 font-telemetry-label text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-surface-container-high gap-2">
                <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">DEVELOPER / ENTITY</span>
                <span className="text-on-surface font-bold text-right">Morrishive LLC</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-surface-container-high gap-2">
                <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">BUNDLE IDENTIFIER</span>
                <span className="text-primary font-bold text-right">com.truckwithease.cab</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-surface-container-high gap-2">
                <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">ANDROID PACKAGE ID</span>
                <span className="text-primary font-bold text-right">com.truckwithease.app</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-surface-container-high gap-2">
                <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">DOWNLOAD FOOTPRINT</span>
                <span className="text-on-surface text-right">84.6 MB (iOS) / 62.4 MB (Android)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-surface-container-high gap-2">
                <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">COMPATIBILITY</span>
                <span className="text-on-surface text-right">iOS 17.0+, iPadOS, watchOS 10+, Android 14+</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-surface-container-high gap-2">
                <span className="text-on-surface-variant uppercase tracking-wider text-[10px]">CONTENT RATING</span>
                <span className="text-on-surface text-right">Rated 4+ (Strict Logistics Utility Only)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-space-md">
            <span className="font-telemetry-label text-[10px] text-primary font-bold uppercase tracking-widest">// PRIVACY NUTRITION</span>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface">Data Handling Declaration</h2>
            
            <div className="flex flex-col gap-3 mt-2">
              <div className="bg-surface-container-lowest p-space-md border border-surface-container flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
                <div>
                  <h4 className="font-bold text-on-surface text-sm mb-1">Precise Location (Background)</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Continuous proximity pings to flag FHWA sub-174" clearance bridges ahead in real time.</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-md border border-surface-container flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary text-[24px]">bluetooth</span>
                <div>
                  <h4 className="font-bold text-on-surface text-sm mb-1">Bluetooth Peripheral Access</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Used solely for driving Deaf/HOH haptic mesh actuators and paired tactile smartwatches.</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-md border border-surface-container flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary text-[24px]">money_off</span>
                <div>
                  <h4 className="font-bold text-on-surface text-sm mb-1">Zero Financial Data Captured</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">100% money custody disclaimed. Zero banking credentials or transaction telemetry tracked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Support Footer */}
        <div className="bg-surface-container-lowest border border-surface-container flex flex-col md:flex-row items-center justify-between p-space-md mt-space-lg gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[24px]">support_agent</span>
            </div>
            <div>
              <div className="font-bold text-on-surface text-sm tracking-wide">24/7 PRIORITY OPS DESK</div>
              <div className="text-[10px] text-on-surface-variant font-telemetry-label uppercase tracking-widest mt-1">Mon-Fri 6am-10pm CT | Sat 7am-9pm CT | Sun 8am-8pm CT</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="bg-primary text-on-primary px-4 py-2.5 font-bold font-telemetry-label text-[10px] uppercase tracking-widest flex items-center justify-center">CALL: 636-706-8338</div>
            <div className="bg-surface-container border border-surface-container-high text-on-surface-variant px-4 py-2.5 font-telemetry-label text-[10px] uppercase tracking-widest flex items-center justify-center">SUPPORT@TRUCKWITHEASE.COM</div>
          </div>
        </div>

        {/* Final Disclaimer */}
        <div className="border border-surface-container p-space-md bg-surface-container-lowest mb-space-2xl">
          <div className="flex items-center gap-2 mb-2 text-primary font-telemetry-label text-[10px] uppercase tracking-widest font-bold">
            <span className="material-symbols-outlined text-[16px]">info</span>
            STATUTORY REGULATORY CLARIFICATION
          </div>
          <p className="text-on-surface-variant text-xs leading-relaxed">
            Truckwithease is NOT an electronic logging device (ELD) and does not replace the registered FMCSA hardware installed in your vehicle. The system executes specialized statutory mathematical computations and safety routing assistance concurrently with your primary cab systems.
          </p>
        </div>
      </div>
    </div>
  );
}
