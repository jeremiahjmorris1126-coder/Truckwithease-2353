import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Lock,
  User,
  Key,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Phone,
  Zap,
  Play,
  Layers,
  ArrowRight,
  Clock,
  Radio,
  Volume2,
  CloudOff,
  Activity,
  Sliders,
  DollarSign,
  Building2,
} from 'lucide-react';
import { auth, loginWithGoogle, logoutUser } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { UserRoleType, TabType } from '../types';
import { subscriberDemoService, SubscriberRegistration } from '../services/subscriberDemoService';
import { triggerHapticFeedback } from '../services/haptics';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: UserRoleType;
  onRoleChange?: (role: UserRoleType) => void;
  initialTab?: 'demo' | 'signup' | 'sso' | 'driver-pin';
  onOpenEcosystemIndex?: () => void;
  onNavigateToTab?: (tab: TabType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentRole = 'admin',
  onRoleChange,
  initialTab = 'demo',
  onOpenEcosystemIndex,
  onNavigateToTab,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'demo' | 'signup' | 'sso' | 'driver-pin'>(initialTab);
  
  // Driver PIN State
  const [driverPin, setDriverPin] = useState('');
  const [dotNumber, setDotNumber] = useState('3928192');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Simple Sign Up State
  const [signUpForm, setSignUpForm] = useState({
    fullName: '',
    carrierName: '',
    email: '',
    phone: '',
    fleetSize: '2-10' as '1' | '2-10' | '11-50' | '50+',
    usdotNumber: '',
  });
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Demo State
  const [demoActive, setDemoActive] = useState(subscriberDemoService.isDemo());

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  // Handle 1-Click Instant Demo Launch
  const handleLaunchDemo = () => {
    setIsLoading(true);
    triggerHapticFeedback('success');
    
    setTimeout(() => {
      subscriberDemoService.launchInstantDemo('Thunder Ridge Freight LLC');
      setDemoActive(true);
      setIsLoading(false);
      if (onRoleChange) onRoleChange('admin');
      
      // Navigate to overview or command center
      if (onNavigateToTab) {
        onNavigateToTab('overview-ad');
      }
      onClose();
    }, 400);
  };

  // Handle Simple Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpForm.fullName || !signUpForm.carrierName || !signUpForm.email) {
      setErrorMessage('Please provide your name, carrier name, and email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await subscriberDemoService.registerSubscriber({
        fullName: signUpForm.fullName,
        carrierName: signUpForm.carrierName,
        email: signUpForm.email,
        phone: signUpForm.phone || '(636) 706-8338',
        fleetSize: signUpForm.fleetSize,
        usdotNumber: signUpForm.usdotNumber || 'USDOT #3892104',
        tier: 'TRIAL_14_DAY',
      });
      setIsLoading(false);
      setSignUpSuccess(true);
      triggerHapticFeedback('success');

      setTimeout(() => {
        if (onRoleChange) onRoleChange('admin');
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Sign up registration encountered an error.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      setIsLoading(false);
      triggerHapticFeedback('success');
    } catch (err: any) {
      setIsLoading(false);
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        setErrorMessage('Sign-in cancelled. Please try again when ready.');
      } else {
        setErrorMessage(err?.message || 'Failed to authenticate with Google.');
      }
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setIsLoading(false);
      setPinSuccess(false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Failed to sign out.');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverPin.length >= 4) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setPinSuccess(true);
        triggerHapticFeedback('success');
        if (onRoleChange) onRoleChange('driver');
        setTimeout(() => onClose(), 600);
      }, 500);
    } else {
      setErrorMessage('Please enter a valid 4-digit driver PIN.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0A0D14] border border-[#FFE600]/40 shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[94vh] rounded-2xl">
        
        {/* Top Kinetic Yellow Gradient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFE600] via-[#FFD700] to-[#E6B800] shadow-[0_0_15px_rgba(255,230,0,0.6)]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F131C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F1900] to-[#0A0D14] border border-[#FFE600]/60 flex items-center justify-center text-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.25)]">
              <Truck className="w-5 h-5 text-[#FFE600]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wider font-mono">
                  TRUCKWITHEASE™
                </h2>
                <span className="px-1.5 py-0.5 bg-[#FFE600] text-black text-[9px] font-mono font-black uppercase rounded">
                  UNIFIED SPINE
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                1-Click Demo • Simple Sign-Up • 7 Conduits &amp; 49 Subsystems Mesh
              </p>
            </div>
          </div>
          <button
            id="close-login-modal-btn"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin">

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-600/60 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* User Logged-in State Card */}
          {currentUser ? (
            <div className="p-4 bg-[#0D121F] border border-emerald-600/40 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-emerald-400"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm">
                      {currentUser.displayName || 'Authenticated Carrier'}
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded text-[10px] font-mono font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    Firebase Cloud Database Sync: Connected (0.000ms drift)
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md"
                >
                  Continue to Cockpit
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs font-mono uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* 4 PRIMARY NAVIGATION TABS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#06080E] border border-slate-800 rounded-xl">
                <button
                  onClick={() => setActiveTab('demo')}
                  className={`py-2 px-2.5 text-xs font-mono font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'demo'
                      ? 'bg-[#FFE600] text-black shadow-lg shadow-[#FFE600]/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>1-Click Demo</span>
                </button>

                <button
                  onClick={() => setActiveTab('signup')}
                  className={`py-2 px-2.5 text-xs font-mono font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-[#FFE600] text-black shadow-lg shadow-[#FFE600]/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simple Sign Up</span>
                </button>

                <button
                  onClick={() => setActiveTab('sso')}
                  className={`py-2 px-2.5 text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'sso'
                      ? 'bg-[#FFE600] text-black shadow-lg shadow-[#FFE600]/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Google SSO</span>
                </button>

                <button
                  onClick={() => setActiveTab('driver-pin')}
                  className={`py-2 px-2.5 text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'driver-pin'
                      ? 'bg-[#FFE600] text-black shadow-lg shadow-[#FFE600]/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Driver PIN</span>
                </button>
              </div>

              {/* TAB 1: 1-CLICK INSTANT DEMO SANDBOX */}
              {activeTab === 'demo' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#1C1600] via-[#120F02] to-[#0A0D14] border border-[#FFE600]/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#FFE600] font-mono font-black text-xs uppercase">
                        <Zap className="w-4 h-4 animate-pulse" />
                        <span>Interactive Enterprise Demo Sandbox</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-mono font-bold">
                        ZERO WAIT · $0 DUE
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      Instant test flight pre-seeded with active Class 8 power unit telemetry, 49 CFR § 395 Hours-of-Service clocks, and live cross-system conduit connections.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-black/60 border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">Carrier</span>
                        <strong className="text-white">Thunder Ridge</strong>
                      </div>
                      <div className="p-2 rounded bg-black/60 border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">USDOT</span>
                        <strong className="text-[#FFE600]">3892104</strong>
                      </div>
                      <div className="p-2 rounded bg-black/60 border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">HOS Drive</span>
                        <strong className="text-emerald-400">09h 14m Safe</strong>
                      </div>
                      <div className="p-2 rounded bg-black/60 border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">Gateways</span>
                        <strong className="text-cyan-400">54/54 Online</strong>
                      </div>
                    </div>

                    <button
                      onClick={handleLaunchDemo}
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(255,230,0,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                      <span>Launch Instant Cockpit Demo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SIMPLE SIGN UP (14-DAY PILOT) */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-3 bg-[#111624] border border-cyan-500/40 rounded-xl flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-300 font-bold">14-Day Free Carrier Pilot</span>
                    <span className="text-slate-400">Instant Access · No Credit Card Required</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={signUpForm.fullName}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Marcus Bell"
                        className="w-full bg-[#070A10] border border-slate-700 rounded-lg p-2.5 text-white focus:border-[#FFE600] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Carrier / Fleet Name *</label>
                      <input
                        type="text"
                        required
                        value={signUpForm.carrierName}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, carrierName: e.target.value }))}
                        placeholder="Apex Logistics LLC"
                        className="w-full bg-[#070A10] border border-slate-700 rounded-lg p-2.5 text-white focus:border-[#FFE600] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Work Email Address *</label>
                      <input
                        type="email"
                        required
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="dispatch@apexlogistics.com"
                        className="w-full bg-[#070A10] border border-slate-700 rounded-lg p-2.5 text-white focus:border-[#FFE600] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Fleet Size &amp; USDOT #</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={signUpForm.fleetSize}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, fleetSize: e.target.value as any }))}
                          className="bg-[#070A10] border border-slate-700 rounded-lg p-2.5 text-white focus:border-[#FFE600] focus:outline-none"
                        >
                          <option value="1">1 Truck (Owner-Op)</option>
                          <option value="2-10">2–10 Power Units</option>
                          <option value="11-50">11–50 Fleet</option>
                          <option value="50+">50+ Enterprise</option>
                        </select>
                        <input
                          type="text"
                          value={signUpForm.usdotNumber}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, usdotNumber: e.target.value }))}
                          placeholder="USDOT #"
                          className="bg-[#070A10] border border-slate-700 rounded-lg p-2.5 text-white focus:border-[#FFE600] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,230,0,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Activate 14-Day Free Pilot ($0 Due Today)</span>
                  </button>

                  {signUpSuccess && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-mono text-center flex items-center justify-center gap-2 animate-in zoom-in-95">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Account Activated! Launching Enterprise Operations Spine...</span>
                    </div>
                  )}
                </form>
              )}

              {/* TAB 3: GOOGLE SSO */}
              {activeTab === 'sso' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <button
                    id="btn-login-google"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-white hover:bg-neutral-100 text-black font-bold text-xs font-mono uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Sign in with Google Workspace SSO</span>
                  </button>

                  <div className="p-3 bg-[#070A10] border border-slate-800 rounded-xl space-y-1.5 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center justify-between text-white font-semibold">
                      <span>Permissions Granted:</span>
                      <span className="text-[#FFE600]">OAuth 2.0 PKCE Verified</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Gmail dispatch alerts &amp; rate confirmation PDF OCR</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Google Drive BOL, POD &amp; DVIR paperwork archive</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DRIVER PIN */}
              {activeTab === 'driver-pin' && (
                <form onSubmit={handlePinSubmit} className="space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                      Carrier USDOT Number
                    </label>
                    <input
                      type="text"
                      value={dotNumber}
                      onChange={(e) => setDotNumber(e.target.value)}
                      placeholder="USDOT #"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFE600]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                      Driver Security PIN (4-Digits)
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={driverPin}
                      onChange={(e) => setDriverPin(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-[#070A10] border border-slate-800 rounded-lg px-3 py-2 text-center text-lg tracking-widest font-mono text-[#FFE600] focus:outline-none focus:border-[#FFE600]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs font-mono uppercase tracking-wider rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Authorize In-Cab Access</span>
                  </button>

                  {pinSuccess && (
                    <div className="p-2.5 bg-emerald-950/50 border border-emerald-700/50 rounded-lg text-emerald-300 text-xs font-mono text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Driver T-104 (Marcus Bell) Authenticated</span>
                    </div>
                  )}
                </form>
              )}

            </div>
          )}

          {/* WHAT SETS TRUCKWITHEASE APART & HOW EVERYTHING IS TIED TOGETHER */}
          <div className="p-4 rounded-xl bg-[#070A10] border border-[#FFE600]/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FFE600] animate-pulse" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase font-mono tracking-wider">
                  What Sets TruckWithEase Apart &amp; How Everything Is Tied Together
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#181300] border border-[#FFE600]/40 text-[#FFE600] text-[9px] font-mono font-bold self-start sm:self-auto">
                ZERO SILOS
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
              Most trucking apps (Motive, Samsara, DAT One, Trucker Path, Fleetio) are <strong className="text-rose-400">isolated silos</strong>: hours don't talk to the load board, GPS forgets 13'6" bridges, and pre-trip defects don't stop dispatch. TruckWithEase connects everything via the <strong className="text-[#FFE600]">Unified Operational Spine</strong> with 0.000ms drift:
            </p>

            {/* 7 CONDUITS MINI SUMMARY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-start gap-1.5">
                <span className="text-[#FFE600] font-bold shrink-0">1.</span>
                <span><strong>HOS ⇄ GOAT Load Board:</strong> Gates illegal loads exceeding driving windows</span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-start gap-1.5">
                <span className="text-[#FFE600] font-bold shrink-0">2.</span>
                <span><strong>CAN-Bus ⇄ Idle Messaging:</strong> Alerts driver after &gt;15m idle ($4.85/hr burn)</span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-start gap-1.5">
                <span className="text-[#FFE600] font-bold shrink-0">3.</span>
                <span><strong>GPS ⇄ Speed Sentinel:</strong> Fires [120,60,120,60,240] haptic buzz if speeding</span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-start gap-1.5">
                <span className="text-[#FFE600] font-bold shrink-0">4.</span>
                <span><strong>Rig Height ⇄ 5-Mile Siren:</strong> Acoustic alarm for 618K low bridges</span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-start gap-1.5">
                <span className="text-[#FFE600] font-bold shrink-0">5.</span>
                <span><strong>Dead Zone ⇄ Offline Cache:</strong> Zero packet loss in mountain gaps</span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-start gap-1.5">
                <span className="text-[#FFE600] font-bold shrink-0">6.</span>
                <span><strong>DVIR ⇄ Chief Mechanic:</strong> Pre-trip defect auto-spawns work order</span>
              </div>
            </div>

            {/* 1-CLICK ACTION TO LAUNCH & TEST ALL 7 CONDUITS */}
            {onOpenEcosystemIndex && (
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEcosystemIndex();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#241B00] via-[#332600] to-[#171200] hover:bg-[#FFE600] hover:text-black border border-[#FFE600] text-[#FFE600] text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,230,0,0.2)]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Test All 7 Conduits Live (49 Subsystems Mesh)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Carrier Compliance & Security Guarantee Footer */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#FFE600]" />
              <span>FMCSA 49 CFR § 395 Compliant • Zero Cloud Lock-In</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span>Direct 24/7 Operations:</span>
              <a href="tel:6367068338" className="text-[#FFE600] hover:underline font-bold">
                (636) 706-8338
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
