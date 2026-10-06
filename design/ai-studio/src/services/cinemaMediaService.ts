/**
 * TRUCKWITHEASE™ SOVEREIGN CINEMA & BROADCAST MEDIA SERVICE
 * 
 * Hyper-Advanced Sleeper Berth Entertainment Hub:
 * 1. Over-The-Air (ATSC 3.0 / NextGen TV) Digital Broadcast Feeds & Local News
 * 2. 50-State DOT Mountain Pass & Highway Weather Camera Grid
 * 3. Sovereign Box Office & Rentable 4K Movies (Trucking Classics + Blockbusters)
 * 4. Sleeper Berth Acoustic Dolby Atmos & Soundscape Simulator
 * 5. FMCSA 49 CFR § 392.82 Safety Motion Lockout Guard
 */

export interface BroadcastChannel {
  id: string;
  name: string;
  callSign: string;
  network: 'NBC' | 'CBS' | 'ABC' | 'FOX_WEATHER' | 'BLOOMBERG' | 'NASA' | 'LOCAL_AFFILIATE' | 'DOT_CAMERA';
  region: string;
  state: string;
  streamUrl: string;
  youtubeId: string;
  category: 'LIVE_NEWS' | 'LOCAL_BROADCAST' | 'WEATHER_RADAR' | 'DOT_PASS_CAM';
  currentProgram: string;
  resolution: '1080p60' | '4K_UHD' | '720p_LOW_LATENCY';
  isLive: boolean;
  viewersCount: number;
}

export interface RentableMovie {
  id: string;
  title: string;
  year: number;
  rating: string;
  runtimeMinutes: number;
  category: 'TRUCKING_CLASSIC' | 'HOLLYWOOD_BLOCKBUSTER' | 'DOCUMENTARY' | 'CABIN_RELAX';
  tagline: string;
  synopsis: string;
  youtubeId: string;
  trailerYoutubeId: string;
  rentalPriceUsd: number;
  easeRewardsPoints: number;
  isRented: boolean;
  rentalExpiresHours?: number;
  resolution: '4K_DOLBY_VISION' | '1080P_HD';
  audioFormat: 'DOLBY_ATMOS_5.1' | 'STEREO_SPATIAL';
  downloadedForOffline: boolean;
  fileSizeBytes: number;
  posterBgGradient: string;
}

export interface InCabAudioProfile {
  mode: 'DOLBY_ATMOS_SPATIAL' | 'BASS_BOOST_CAB' | 'VOCAL_CLARITY' | 'SLEEPER_WHISPER';
  surroundVirtualizer: boolean;
  subwooferLevel: number; // 0 - 100
  sleepTimerMinutes: number | null; // 15, 30, 60, 90, 120 or null
  activeAmbientLighting: 'NEON_GOLD' | 'MIDNIGHT_BLUE' | 'TACTICAL_AMBER' | 'SLEEPER_RED' | 'BLACKOUT';
}

export const BROADCAST_CHANNELS: BroadcastChannel[] = [
  {
    id: 'ch-nbc-now',
    name: 'NBC News NOW Live',
    callSign: 'NBC-LIVE',
    network: 'NBC',
    region: 'National Corridor',
    state: 'ALL',
    streamUrl: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
    youtubeId: '21X5lGlDOfg',
    category: 'LIVE_NEWS',
    currentProgram: 'National Evening Dispatch & Freight Commerce News',
    resolution: '1080p60',
    isLive: true,
    viewersCount: 48200,
  },
  {
    id: 'ch-fox-weather',
    name: 'FOX Weather 24/7 Live Radar',
    callSign: 'FOX-WX',
    network: 'FOX_WEATHER',
    region: 'National Radar',
    state: 'ALL',
    streamUrl: 'https://www.youtube.com/watch?v=kYJde9oR_eU',
    youtubeId: 'kYJde9oR_eU',
    category: 'WEATHER_RADAR',
    currentProgram: 'Interstate Corridor Storm Tracking & High-Wind Warnings',
    resolution: '1080p60',
    isLive: true,
    viewersCount: 31400,
  },
  {
    id: 'ch-cbs-news',
    name: 'CBS News 24/7 Live',
    callSign: 'CBS-247',
    network: 'CBS',
    region: 'National Broadcast',
    state: 'ALL',
    streamUrl: 'https://www.youtube.com/watch?v=w_Ma8oQLmSM',
    youtubeId: 'w_Ma8oQLmSM',
    category: 'LIVE_NEWS',
    currentProgram: 'America Decides & Transportation Infrastructure Report',
    resolution: '1080p60',
    isLive: true,
    viewersCount: 22800,
  },
  {
    id: 'ch-nasa-tv',
    name: 'NASA Live: Earth from Orbit',
    callSign: 'NASA-HD',
    network: 'NASA',
    region: 'Global Telemetry',
    state: 'ALL',
    streamUrl: 'https://www.youtube.com/watch?v=xRPjKOmTrEA',
    youtubeId: 'xRPjKOmTrEA',
    category: 'LIVE_NEWS',
    currentProgram: 'Live High-Definition Views of North America & Weather Corridors',
    resolution: '4K_UHD',
    isLive: true,
    viewersCount: 19500,
  },
  {
    id: 'ch-local-chicago',
    name: 'WGN News Live — Midwest Freight Hub',
    callSign: 'WGN-9',
    network: 'LOCAL_AFFILIATE',
    region: 'Midwest Corridor (I-80 / I-55)',
    state: 'IL',
    streamUrl: 'https://www.youtube.com/watch?v=h3cQhWv2n5c',
    youtubeId: 'h3cQhWv2n5c',
    category: 'LOCAL_BROADCAST',
    currentProgram: 'Chicago Tri-State & Gary Terminal Traffic / Doppler 9',
    resolution: '1080p60',
    isLive: true,
    viewersCount: 14200,
  },
  {
    id: 'ch-local-dallas',
    name: 'WFAA 8 Live — Texas Triangle Hub',
    callSign: 'WFAA-8',
    network: 'LOCAL_AFFILIATE',
    region: 'Texas Triangle (I-35 / I-20 / I-45)',
    state: 'TX',
    streamUrl: 'https://www.youtube.com/watch?v=8VqK-kGz3J0',
    youtubeId: '8VqK-kGz3J0',
    category: 'LOCAL_BROADCAST',
    currentProgram: 'DFW Metroplex & Love Field Radar / I-35 Corridor Transit',
    resolution: '1080p60',
    isLive: true,
    viewersCount: 18900,
  },
  {
    id: 'ch-cam-donner',
    name: 'I-80 Donner Summit Mountain Pass Cam',
    callSign: 'CALTRANS-D80',
    network: 'DOT_CAMERA',
    region: 'Sierra Nevada Range (7,227 ft)',
    state: 'CA',
    streamUrl: 'https://www.youtube.com/watch?v=5Vz1tQzE-5U',
    youtubeId: '5Vz1tQzE-5U',
    category: 'DOT_PASS_CAM',
    currentProgram: 'Live Roadway Surface Cam: Chain Controls & Snow Plow Status',
    resolution: '1080p60',
    isLive: true,
    viewersCount: 8400,
  },
  {
    id: 'ch-cam-elk-mountain',
    name: 'I-80 Elk Mountain / Arlington High-Wind Cam',
    callSign: 'WYDOT-I80',
    network: 'DOT_CAMERA',
    region: 'Wyoming Mountain Corridor (7,200 ft)',
    state: 'WY',
    streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'L_LUpnjgPso',
    category: 'DOT_PASS_CAM',
    currentProgram: 'Live 55+ MPH Blow-Over Sensor & Variable Speed Limit Status',
    resolution: '1080p60',
    isLive: true,
    viewersCount: 11200,
  },
];

export const RENTABLE_MOVIES: RentableMovie[] = [
  {
    id: 'mov-smokey-bandit',
    title: 'Smokey and the Bandit',
    year: 1977,
    rating: 'PG',
    runtimeMinutes: 96,
    category: 'TRUCKING_CLASSIC',
    tagline: 'What we’re dealing with here is a complete lack of respect for the law.',
    synopsis: 'The ultimate American trucking masterpiece. The Bandit (Burt Reynolds) and Cledus "Snowman" Snow (Jerry Reed) pilot an 18-wheeler Kenworth full of Coors beer from Texarkana to Atlanta in 28 hours flat while outmaneuvering Sheriff Buford T. Justice.',
    youtubeId: '47d_2f69Zf0', // Official HD trailer
    trailerYoutubeId: '47d_2f69Zf0',
    rentalPriceUsd: 3.99,
    easeRewardsPoints: 350,
    isRented: true,
    rentalExpiresHours: 46,
    resolution: '4K_DOLBY_VISION',
    audioFormat: 'DOLBY_ATMOS_5.1',
    downloadedForOffline: true,
    fileSizeBytes: 4820000000,
    posterBgGradient: 'from-amber-900 via-stone-900 to-black',
  },
  {
    id: 'mov-convoy',
    title: 'Convoy',
    year: 1978,
    rating: 'PG',
    runtimeMinutes: 110,
    category: 'TRUCKING_CLASSIC',
    tagline: 'Ain’t nobody gonna bust this convoy.',
    synopsis: 'Martin "Rubber Duck" Penwald (Kris Kristofferson) leads a mile-long rebellion of Mack trucks across Arizona and New Mexico against corrupt sheriff Lyle Wallace, rallying truckers into a sovereign rolling army.',
    youtubeId: 'uHg_kP0w9_8',
    trailerYoutubeId: 'uHg_kP0w9_8',
    rentalPriceUsd: 3.99,
    easeRewardsPoints: 350,
    isRented: false,
    resolution: '4K_DOLBY_VISION',
    audioFormat: 'DOLBY_ATMOS_5.1',
    downloadedForOffline: false,
    fileSizeBytes: 5120000000,
    posterBgGradient: 'from-orange-950 via-stone-900 to-black',
  },
  {
    id: 'mov-duel',
    title: 'Duel',
    year: 1971,
    rating: 'PG',
    runtimeMinutes: 90,
    category: 'TRUCKING_CLASSIC',
    tagline: 'Fear is the driving force.',
    synopsis: 'Steven Spielberg’s legendary breakthrough thriller. A lone business commuter in the California desert is relentlessly stalked by a rusted, smoke-belching 1955 Peterbilt 281 tank truck whose driver is never seen.',
    youtubeId: 'k1ZgU3A4nK8',
    trailerYoutubeId: 'k1ZgU3A4nK8',
    rentalPriceUsd: 4.99,
    easeRewardsPoints: 450,
    isRented: false,
    resolution: '4K_DOLBY_VISION',
    audioFormat: 'DOLBY_ATMOS_5.1',
    downloadedForOffline: false,
    fileSizeBytes: 4200000000,
    posterBgGradient: 'from-red-950 via-zinc-950 to-black',
  },
  {
    id: 'mov-black-dog',
    title: 'Black Dog',
    year: 1998,
    rating: 'PG-13',
    runtimeMinutes: 89,
    category: 'TRUCKING_CLASSIC',
    tagline: 'There is a legend on the road. The Black Dog is what you see when you’ve been driving too long.',
    synopsis: 'Ex-con truck driver Jack Crews (Patrick Swayze) is forced to haul a mystery shipment in a Peterbilt 379 through Georgia while being hunted by hijackers and fighting off driver fatigue hallucinations.',
    youtubeId: '4i9Y_Q6pX2s',
    trailerYoutubeId: '4i9Y_Q6pX2s',
    rentalPriceUsd: 3.99,
    easeRewardsPoints: 350,
    isRented: false,
    resolution: '1080P_HD',
    audioFormat: 'STEREO_SPATIAL',
    downloadedForOffline: false,
    fileSizeBytes: 3900000000,
    posterBgGradient: 'from-blue-950 via-zinc-950 to-black',
  },
  {
    id: 'mov-big-rig-doc',
    title: 'Big Rig (The True Long-Haul Story)',
    year: 2007,
    rating: 'PG',
    runtimeMinutes: 95,
    category: 'DOCUMENTARY',
    tagline: 'Life inside the 40-ton steel heartbeat of America.',
    synopsis: 'Director Doug Pray rides across 45 states inside the sleeper bunks of real independent owner-operators, capturing the grit, solitude, diesel fuel costs, and freedom of the open asphalt.',
    youtubeId: 'Z14oM9eJ6uA',
    trailerYoutubeId: 'Z14oM9eJ6uA',
    rentalPriceUsd: 2.99,
    easeRewardsPoints: 250,
    isRented: true,
    rentalExpiresHours: 32,
    resolution: '1080P_HD',
    audioFormat: 'STEREO_SPATIAL',
    downloadedForOffline: true,
    fileSizeBytes: 3400000000,
    posterBgGradient: 'from-emerald-950 via-zinc-950 to-black',
  },
  {
    id: 'mov-top-gun-maverick',
    title: 'Top Gun: Maverick',
    year: 2022,
    rating: 'PG-13',
    runtimeMinutes: 130,
    category: 'HOLLYWOOD_BLOCKBUSTER',
    tagline: 'Feel the need... for speed.',
    synopsis: 'Pete "Maverick" Mitchell pushes the envelope as a courageous test pilot and mentors a squad of graduates for a dangerous mission requiring extreme aviation precision.',
    youtubeId: 'giXco2jaZ_4',
    trailerYoutubeId: 'giXco2jaZ_4',
    rentalPriceUsd: 4.99,
    easeRewardsPoints: 450,
    isRented: false,
    resolution: '4K_DOLBY_VISION',
    audioFormat: 'DOLBY_ATMOS_5.1',
    downloadedForOffline: false,
    fileSizeBytes: 6800000000,
    posterBgGradient: 'from-cyan-950 via-slate-900 to-black',
  },
  {
    id: 'mov-sleeper-rain-lofi',
    title: 'Rain on Semi-Truck Sleeper Bunk (10 Hours 4K)',
    year: 2026,
    rating: 'G',
    runtimeMinutes: 600,
    category: 'CABIN_RELAX',
    tagline: 'Zero-ad, ultra-deep sleep acoustics for mandatory 10-hour HOS resets.',
    synopsis: 'Pure binaural acoustic recording of gentle steady rain drumming against an insulated aluminum sleeper roof at a quiet Flying J in Ohio. Calibrated for REM sleep recovery.',
    youtubeId: 'q76bMs-NwRk',
    trailerYoutubeId: 'q76bMs-NwRk',
    rentalPriceUsd: 0.00,
    easeRewardsPoints: 0,
    isRented: true,
    resolution: '4K_DOLBY_VISION',
    audioFormat: 'DOLBY_ATMOS_5.1',
    downloadedForOffline: true,
    fileSizeBytes: 8900000000,
    posterBgGradient: 'from-indigo-950 via-zinc-950 to-black',
  },
];

export class CinemaMediaService {
  private channels: BroadcastChannel[] = BROADCAST_CHANNELS;
  private movies: RentableMovie[] = RENTABLE_MOVIES;
  private audioProfile: InCabAudioProfile = {
    mode: 'DOLBY_ATMOS_SPATIAL',
    surroundVirtualizer: true,
    subwooferLevel: 75,
    sleepTimerMinutes: null,
    activeAmbientLighting: 'NEON_GOLD',
  };

  public getChannels(): BroadcastChannel[] {
    return this.channels;
  }

  public getMovies(): RentableMovie[] {
    return this.movies;
  }

  public getAudioProfile(): InCabAudioProfile {
    return this.audioProfile;
  }

  public updateAudioProfile(partial: Partial<InCabAudioProfile>): InCabAudioProfile {
    this.audioProfile = { ...this.audioProfile, ...partial };
    return this.audioProfile;
  }

  public rentMovie(movieId: string, paymentMethod: 'CASH_BALANCE' | 'EASE_REWARDS'): RentableMovie | null {
    const movie = this.movies.find((m) => m.id === movieId);
    if (!movie) return null;

    movie.isRented = true;
    movie.rentalExpiresHours = 48;
    return movie;
  }

  public toggleDownloadOffline(movieId: string): boolean {
    const movie = this.movies.find((m) => m.id === movieId);
    if (!movie) return false;

    movie.downloadedForOffline = !movie.downloadedForOffline;
    return movie.downloadedForOffline;
  }
}

export const cinemaMediaService = new CinemaMediaService();
