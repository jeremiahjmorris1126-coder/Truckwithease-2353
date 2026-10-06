import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Tv,
  Play,
  Moon,
  Sun,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  Search,
  ExternalLink,
  Volume2,
  Radio,
  Sliders,
  Sparkles,
  RefreshCw,
  Clock,
  Youtube,
  AlertTriangle,
  Download,
  Wifi,
  Cast,
  Maximize2,
  DollarSign,
  Award,
  Layers,
  Flame,
  Check,
  Zap,
  MapPin,
  ChevronRight,
  Eye,
  Camera,
  Compass,
} from 'lucide-react';
import {
  cinemaMediaService,
  BroadcastChannel,
  RentableMovie,
  InCabAudioProfile,
  BROADCAST_CHANNELS,
  RENTABLE_MOVIES,
} from '../services/cinemaMediaService';
import { triggerHapticFeedback } from '../services/haptics';

export const CinemaLoungeView: React.FC = () => {
  // Navigation / Filter States
  const [activeMediaTab, setActiveMediaTab] = useState<'LOCAL_BROADCAST' | 'BOX_OFFICE_MOVIES' | 'YOUTUBE_CUSTOM' | 'CABIN_RELAX'>('BOX_OFFICE_MOVIES');
  
  // Media Data
  const [channels, setChannels] = useState<BroadcastChannel[]>(BROADCAST_CHANNELS);
  const [movies, setMovies] = useState<RentableMovie[]>(RENTABLE_MOVIES);
  const [selectedMovie, setSelectedMovie] = useState<RentableMovie>(RENTABLE_MOVIES[0]);
  const [selectedChannel, setSelectedChannel] = useState<BroadcastChannel>(BROADCAST_CHANNELS[0]);
  const [activeYoutubeId, setActiveYoutubeId] = useState<string>(RENTABLE_MOVIES[0].youtubeId);
  const [activeMediaTitle, setActiveMediaTitle] = useState<string>(RENTABLE_MOVIES[0].title);
  const [customInput, setCustomInput] = useState<string>('');

  // Audio & Cinema Controls
  const [audioProfile, setAudioProfile] = useState<InCabAudioProfile>(() => cinemaMediaService.getAudioProfile());
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(true);
  const [vehicleInMotion, setVehicleInMotion] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [rentModalMovie, setRentModalMovie] = useState<RentableMovie | null>(null);
  const [audioBars, setAudioBars] = useState<number[]>([40, 65, 30, 85, 95, 70, 45, 60, 80, 50, 75, 90]);

  // Audio Visualizer Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioBars(prev => prev.map(() => Math.floor(Math.random() * 70) + 25));
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const handleSelectMovie = (movie: RentableMovie) => {
    triggerHapticFeedback();
    setSelectedMovie(movie);
    setActiveYoutubeId(movie.youtubeId);
    setActiveMediaTitle(movie.title);
    setNotification(`Now Screening: ${movie.title} (${movie.resolution} · ${movie.audioFormat})`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectChannel = (channel: BroadcastChannel) => {
    triggerHapticFeedback();
    setSelectedChannel(channel);
    setActiveYoutubeId(channel.youtubeId);
    setActiveMediaTitle(`${channel.name} (${channel.callSign})`);
    setNotification(`Tuned to Local Over-the-Air: ${channel.name} · ${channel.resolution}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRentMovie = (movie: RentableMovie, method: 'CASH_BALANCE' | 'EASE_REWARDS') => {
    triggerHapticFeedback();
    const updated = cinemaMediaService.rentMovie(movie.id, method);
    if (updated) {
      setMovies([...cinemaMediaService.getMovies()]);
      setSelectedMovie({ ...updated });
      setActiveYoutubeId(updated.youtubeId);
      setActiveMediaTitle(updated.title);
      setRentModalMovie(null);
      setNotification(`🎉 Unlocked 4K Rental: ${updated.title} — Active for 48 Hours!`);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleToggleOffline = (movie: RentableMovie, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHapticFeedback();
    const isDownloaded = cinemaMediaService.toggleDownloadOffline(movie.id);
    setMovies([...cinemaMediaService.getMovies()]);
    setNotification(isDownloaded ? `Downloaded "${movie.title}" for offline mountain passes!` : `Removed offline cache.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    let extractedId = customInput.trim();
    const urlMatch = customInput.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (urlMatch && urlMatch[1]) {
      extractedId = urlMatch[1];
    }

    if (extractedId.length === 11) {
      triggerHapticFeedback();
      setActiveYoutubeId(extractedId);
      setActiveMediaTitle(`Custom Feed (${extractedId})`);
      setCustomInput('');
      setNotification(`Loaded Custom Video Stream: ${extractedId}`);
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification(`Invalid YouTube URL or ID`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const isSafetyLocked = vehicleInMotion;

  return (
    <div
      className={`flex flex-col w-full pb-20 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans transition-colors duration-500 ${
        isTheaterMode ? 'bg-[#050505] text-white' : 'text-white'
      }`}
    >
      {/* Top Header */}
      <div className="border-b border-[#FFE600]/30 pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black tracking-widest bg-[#FFE600] text-black uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,230,0,0.3)]">
                <Film className="w-3.5 h-3.5 fill-black" />
                SOVEREIGN SLEEPER LOUNGE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-cyan-950/80 text-cyan-400 border border-cyan-700/60 uppercase flex items-center gap-1">
                <Tv className="w-3 h-3 text-cyan-400" />
                ATSC 3.0 LOCAL BROADCASTING
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 border ${
                  !isSafetyLocked
                    ? 'text-emerald-400 bg-emerald-950/70 border-emerald-700'
                    : 'text-rose-400 bg-rose-950/80 border-rose-600 animate-pulse'
                }`}
              >
                {!isSafetyLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {!isSafetyLocked ? 'INTERLOCK UNLOCKED (PARKED)' : '49 CFR § 392.82 MOTION LOCKOUT'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <Film className="w-7 h-7 text-[#FFE600]" />
              Sleeper Cinema & Local Broadcast Lounge
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl mt-1">
              Untouchable in-cab entertainment designed for mandatory 10-hour sleeper resets. Watch Over-The-Air local digital TV, DOT mountain pass weather cameras, 4K Hollywood & trucking classics, or stream any custom YouTube feed with Dolby Atmos acoustic tuning.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs uppercase flex items-center gap-1.5 border transition-all ${
                isTheaterMode
                  ? 'bg-[#FFE600]/15 border-[#FFE600] text-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.2)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {isTheaterMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{isTheaterMode ? 'Theater Dark' : 'Daylight HUD'}</span>
            </button>

            {/* Test Safety Interlock Motion Lockout */}
            <button
              onClick={() => setVehicleInMotion(!vehicleInMotion)}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 rounded-xl flex items-center gap-1.5 transition-colors"
              title="Test 49 CFR § 392.82 motion lockout"
            >
              <Sliders className="w-3.5 h-3.5 text-[#FFE600]" />
              <span>{vehicleInMotion ? 'Park Truck (0 MPH)' : 'Simulate Drive (> 5 MPH)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 bg-black border-2 border-[#FFE600] text-white text-xs font-mono flex items-center justify-between rounded-xl shadow-[0_0_20px_rgba(255,230,0,0.2)] animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFE600] shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-zinc-400 hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* HERO BILLBOARD CINEMA PLAYER (IMAX-INSPIRED GLASSMORPHIC STAGE) */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[#FFE600]/40 bg-black shadow-[0_0_60px_rgba(255,230,0,0.15)] group">
        {/* Dynamic Ambilight Backdrop Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FFE600]/10 via-amber-500/10 to-[#FFE600]/10 blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

        {isSafetyLocked ? (
          <div className="aspect-video w-full flex flex-col items-center justify-center p-8 bg-zinc-950/95 text-center space-y-4">
            <div className="p-4 bg-rose-500/20 border-2 border-rose-500 rounded-2xl text-rose-400 animate-pulse">
              <Lock className="w-16 h-16" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                FMCSA SAFETY INTERLOCK LOCKOUT // 49 CFR § 392.82
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase">
                Video Screen Locked While In Motion
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
                Federal Motor Carrier Safety Regulations prohibit video entertainment playback while operating on public roadways. Stop and shift tractor into PARK or Off-Duty / Sleeper Berth to unlock cinema.
              </p>
            </div>
            <button
              onClick={() => setVehicleInMotion(false)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl"
            >
              Simulate Truck Parked (Shift to Neutral / Park)
            </button>
          </div>
        ) : (
          <div className="relative aspect-video w-full bg-black">
            <iframe
              className="w-full h-full object-cover"
              src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
              title={activeMediaTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            {/* In-Cab Sound Visualizer & Status HUD Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
              <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-bold truncate max-w-[200px] sm:max-w-xs">{activeMediaTitle}</span>
                <span className="text-zinc-500">|</span>
                <span className="text-[#FFE600] font-bold">DOLBY ATMOS</span>
              </div>

              {/* Acoustic Spectrum Equalizer Simulation */}
              <div className="hidden sm:flex items-center gap-1 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 pointer-events-auto">
                <Volume2 className="w-3.5 h-3.5 text-[#FFE600]" />
                <div className="flex items-end gap-0.5 h-3.5">
                  {audioBars.map((height, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#FFE600] rounded-t transition-all duration-150"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-zinc-400 ml-1">CAB EQ</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEGMENTED NAVIGATION BAR */}
      <div className="flex border-b border-zinc-800 bg-[#0E0E0E] overflow-x-auto scrollbar-none px-2 pt-2 gap-2 rounded-xl">
        <button
          onClick={() => setActiveMediaTab('BOX_OFFICE_MOVIES')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-t-2 shrink-0 ${
            activeMediaTab === 'BOX_OFFICE_MOVIES'
              ? 'bg-black text-[#FFE600] border-[#FFE600]'
              : 'text-zinc-400 hover:text-white border-transparent'
          }`}
        >
          <Film className="w-4 h-4" />
          Sovereign Box Office & Rentable 4K ({movies.length})
        </button>

        <button
          onClick={() => setActiveMediaTab('LOCAL_BROADCAST')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-t-2 shrink-0 ${
            activeMediaTab === 'LOCAL_BROADCAST'
              ? 'bg-black text-[#FFE600] border-[#FFE600]'
              : 'text-zinc-400 hover:text-white border-transparent'
          }`}
        >
          <Tv className="w-4 h-4" />
          Local Digital TV & Live News ({channels.length})
        </button>

        <button
          onClick={() => setActiveMediaTab('CABIN_RELAX')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-t-2 shrink-0 ${
            activeMediaTab === 'CABIN_RELAX'
              ? 'bg-black text-[#FFE600] border-[#FFE600]'
              : 'text-zinc-400 hover:text-white border-transparent'
          }`}
        >
          <Moon className="w-4 h-4" />
          Sleeper Rain & Cabin Lo-Fi
        </button>

        <button
          onClick={() => setActiveMediaTab('YOUTUBE_CUSTOM')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-t-2 shrink-0 ${
            activeMediaTab === 'YOUTUBE_CUSTOM'
              ? 'bg-black text-[#FFE600] border-[#FFE600]'
              : 'text-zinc-400 hover:text-white border-transparent'
          }`}
        >
          <Youtube className="w-4 h-4 text-red-500" />
          Custom YouTube Stream
        </button>
      </div>

      {/* TAB CONTENT 1: BOX OFFICE & RENTABLE 4K MOVIES */}
      {activeMediaTab === 'BOX_OFFICE_MOVIES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-5 h-5 text-[#FFE600]" />
                Trucking Classics & Hollywood Premiere Rentals
              </h3>
              <p className="text-xs text-zinc-400">
                Stream in 4K Dolby Vision. Rent with your carrier account or redeem EaseRewards miles points. Unlocks for 48 hours with offline mountain pass caching.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">Your EaseRewards Balance:</span>
              <span className="px-2.5 py-1 bg-[#FFE600]/15 border border-[#FFE600] text-[#FFE600] font-black font-mono text-xs rounded-lg">
                1,840 PTS ($18.40)
              </span>
            </div>
          </div>

          {/* Movie Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => handleSelectMovie(movie)}
                className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  selectedMovie?.id === movie.id
                    ? 'bg-zinc-950 border-[#FFE600] shadow-[0_0_25px_rgba(255,230,0,0.2)]'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black border border-zinc-700 rounded text-zinc-300 font-mono">
                      {movie.category.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className="text-amber-400 font-bold">{movie.resolution.replace(/_/g, ' ')}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400">{movie.runtimeMinutes} MIN</span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h4 className="text-base font-black text-white group-hover:text-[#FFE600] transition-colors">
                      {movie.title} ({movie.year})
                    </h4>
                    <p className="text-[11px] text-[#FFE600] italic font-serif line-clamp-1 mt-0.5">
                      "{movie.tagline}"
                    </p>
                  </div>

                  {/* Synopsis */}
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {movie.synopsis}
                  </p>
                </div>

                {/* Footer / Rental Status */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                  {movie.isRented ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        RENTED ({movie.rentalExpiresHours || 48}H LEFT)
                      </span>
                      <button
                        onClick={(e) => handleToggleOffline(movie, e)}
                        className={`p-1.5 rounded text-xs transition-colors ${
                          movie.downloadedForOffline
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Download for dead zones"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRentModalMovie(movie);
                        }}
                        className="px-3 py-1 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-wider rounded-lg transition-transform active:scale-95 flex items-center gap-1 shadow-[0_0_10px_rgba(255,230,0,0.2)]"
                      >
                        <DollarSign className="w-3 h-3" />
                        Rent ${movie.rentalPriceUsd.toFixed(2)}
                      </button>
                      <span className="text-[10px] text-zinc-500">or {movie.easeRewardsPoints} pts</span>
                    </div>
                  )}

                  <span className="text-[#FFE600] text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <Play className="w-3 h-3 fill-[#FFE600]" />
                    Watch
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: LOCAL DIGITAL BROADCASTING & DOT PASS CAMS */}
      {activeMediaTab === 'LOCAL_BROADCAST' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Tv className="w-5 h-5 text-cyan-400" />
                Over-The-Air Digital Feeds & Highway Traffic Pass Cameras
              </h3>
              <p className="text-xs text-zinc-400">
                Auto-tunes to local metro stations, 24/7 national Doppler weather corridors, and state DOT mountain pass live road condition cameras.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-black px-3 py-1.5 border border-zinc-800 rounded-lg">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Current GPS Location: <strong className="text-white">I-80 Corridor (Near Omaha / Council Bluffs)</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleSelectChannel(channel)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedChannel?.id === channel.id
                    ? 'bg-zinc-950 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black border border-cyan-500/40 text-cyan-300 rounded font-mono">
                      {channel.category.replace(/_/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1">{channel.name}</h4>
                  <div className="text-[11px] text-zinc-400 font-mono">{channel.region}</div>
                  <p className="text-xs text-zinc-300 font-mono mt-1 line-clamp-2">
                    {channel.currentProgram}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">{channel.resolution}</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Play className="w-3 h-3 fill-cyan-400" />
                    Tune In
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: SLEEPER RAIN & CABIN LO-FI */}
      {activeMediaTab === 'CABIN_RELAX' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#FFE600] text-black rounded font-mono">
                ACOUSTIC SLEEP ENHANCER
              </span>
              <span className="text-xs text-zinc-400 font-mono">10-HOUR HOS RESET RECOVERY</span>
            </div>
            <h3 className="text-xl font-black text-white">Sleeper Bunk Rain & Deep-Sleep Soundscapes</h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Engineered with binaural frequencies that lower cortisol and accelerate REM recovery between long shifts. Zero advertisement interruptions. Plays continuously in background while your device charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => {
                setActiveYoutubeId('q76bMs-NwRk');
                setActiveMediaTitle('Rain on Semi-Truck Metal Roof (10 Hours)');
                setNotification('Playing: 10 Hours Steady Rain on Sleeper Bunk');
              }}
              className="p-5 bg-zinc-950 border border-zinc-800 hover:border-[#FFE600] rounded-xl cursor-pointer transition-all space-y-3"
            >
              <div className="text-[#FFE600] font-bold text-sm">Gentle Rain on Cab Roof</div>
              <p className="text-xs text-zinc-400">Steady mountain precipitation against an insulated aluminum cab. Binaural 432 Hz.</p>
              <div className="text-[10px] text-zinc-500 font-mono">10h 00m · 4K Ultra-HD · Ad-Free</div>
            </div>

            <div
              onClick={() => {
                setActiveYoutubeId('jfKfPfyJRdk');
                setActiveMediaTitle('Lofi Hip Hop Radio — Beats to Relax/Sleep To');
                setNotification('Playing: 24/7 Live Lofi Chill Beats');
              }}
              className="p-5 bg-zinc-950 border border-zinc-800 hover:border-[#FFE600] rounded-xl cursor-pointer transition-all space-y-3"
            >
              <div className="text-purple-400 font-bold text-sm">Late Night Highway Lo-Fi</div>
              <p className="text-xs text-zinc-400">Smooth downtempo beats for cab reading, trip planning, and winding down.</p>
              <div className="text-[10px] text-zinc-500 font-mono">24/7 Live Stream · Zero Latency</div>
            </div>

            <div
              onClick={() => {
                setActiveYoutubeId('5qap5aO4i9A');
                setActiveMediaTitle('Deep Cabin Ambient White Noise');
                setNotification('Playing: Heavy Diesel Idle & Night Wind');
              }}
              className="p-5 bg-zinc-950 border border-zinc-800 hover:border-[#FFE600] rounded-xl cursor-pointer transition-all space-y-3"
            >
              <div className="text-cyan-400 font-bold text-sm">Cab Insulation White Noise</div>
              <p className="text-xs text-zinc-400">Blocks out noisy truck stop reefers and APU engines parked next to your rig.</p>
              <div className="text-[10px] text-zinc-500 font-mono">8h Continuous · Acoustic Noise-Cancelling</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: CUSTOM YOUTUBE STREAM */}
      {activeMediaTab === 'YOUTUBE_CUSTOM' && (
        <div className="p-6 bg-black border border-zinc-800 rounded-2xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Stream Any YouTube Video or Live Broadcast
            </h3>
            <p className="text-xs text-zinc-400">
              Paste any public YouTube link or video ID to stream directly inside the Sovereign In-Cab Cinema player.
            </p>
          </div>

          <form onSubmit={handleLoadCustomUrl} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Paste YouTube Link (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FFE600]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-95"
            >
              Load Stream
            </button>
          </form>
        </div>
      )}

      {/* 1-CLICK RENT MOVIE MODAL */}
      {rentModalMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A0A0A] border-2 border-[#FFE600] rounded-2xl max-w-lg w-full p-6 space-y-5 text-white shadow-[0_0_50px_rgba(255,230,0,0.3)]">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-[#FFE600] text-black rounded font-mono">
                  PREMIERE 4K CINEMA RENTAL
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {rentModalMovie.title} ({rentModalMovie.year})
                </h3>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">
                  {rentModalMovie.resolution.replace(/_/g, ' ')} · {rentModalMovie.audioFormat}
                </div>
              </div>
              <button
                onClick={() => setRentModalMovie(null)}
                className="p-1 text-zinc-400 hover:text-white rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-mono">
              {rentModalMovie.synopsis}
            </p>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Rental Duration:</span>
                <span className="text-white font-bold">48 Hours Full Access</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Offline Download for Mountain Passes:</span>
                <span className="text-emerald-400 font-bold">Included Free</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Sleeper Berth Interlock:</span>
                <span className="text-[#FFE600] font-bold">49 CFR § 392.82 Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleRentMovie(rentModalMovie, 'CASH_BALANCE')}
                className="py-3 px-4 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,230,0,0.3)] flex flex-col items-center justify-center gap-0.5"
              >
                <span>Charge Fleet Account</span>
                <span className="text-[11px] font-bold">${rentModalMovie.rentalPriceUsd.toFixed(2)} USD</span>
              </button>

              <button
                onClick={() => handleRentMovie(rentModalMovie, 'EASE_REWARDS')}
                className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-[#FFE600]/40 text-[#FFE600] font-black text-xs uppercase tracking-wider rounded-xl transition-transform active:scale-95 flex flex-col items-center justify-center gap-0.5"
              >
                <span>Redeem EaseRewards</span>
                <span className="text-[11px] font-bold">{rentModalMovie.easeRewardsPoints} Points</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
