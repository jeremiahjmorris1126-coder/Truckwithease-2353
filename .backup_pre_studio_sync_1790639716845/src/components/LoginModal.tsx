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
} from 'lucide-react';
import { auth, loginWithGoogle, logoutUser } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { MORRISHIVE_LOGO_URL, TruckWithEaseLogo } from './TruckWithEaseLogo';
import { MorrishiveEmblem } from './MorrishiveEmblem';
import { UserRoleType } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: UserRoleType;
  onRoleChange?: (role: UserRoleType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentRole = 'admin',
  onRoleChange,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sso' | 'driver-pin'>('sso');
  const [driverPin, setDriverPin] = useState('');
  const [dotNumber, setDotNumber] = useState('3928192');
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      setIsLoading(false);
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
        if (onRoleChange) onRoleChange('driver');
      }, 600);
    } else {
      setErrorMessage('Please enter a valid 4-digit driver PIN.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121318] border border-[#2A2B32] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] rounded-xl">
        {/* Top Gold Kinetic Gradient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37] via-[#F2CA50] to-[#FFE088] shadow-[0_0_15px_rgba(242,202,80,0.5)]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#22232A] flex items-center justify-between bg-[#16171F]">
          <div className="flex items-center gap-3">
            <img
              src={MORRISHIVE_LOGO_URL}
              alt="TRUCKWITHEASE"
              className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(242,202,80,0.3)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wider font-mono">
                  TRUCKWITHEASE
                </h2>
                <span className="px-1.5 py-0.5 bg-[#F2CA50]/15 border border-[#F2CA50]/30 text-[#F2CA50] text-[9px] font-mono font-bold uppercase rounded">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#A0A2B0]">
                Single Sign-On & Fleet Identity Portal // v4.28
              </p>
            </div>
          </div>
          <button
            id="close-login-modal-btn"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#23242E] rounded-lg transition-colors"
            title="Close Login Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Primary Hero Branding Card */}
          <div className="relative p-4 sm:p-5 bg-[#181A22] border border-[#2E303B] rounded-xl overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2CA50]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-center gap-3 mb-3">
              <MorrishiveEmblem size="lg" variant="hexagon" />
              <img
                src={MORRISHIVE_LOGO_URL}
                alt="TRUCKWITHEASE Primary Logo"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(242,202,80,0.35)]"
              />
            </div>

            <span className="font-mono text-xs text-[#F2CA50] uppercase tracking-[0.25em] font-bold">
              ENTERPRISE FLEET OS
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider mt-1 font-mono whitespace-nowrap">
              TRUCKWITHEASE <span className="text-[#F2CA50]">CARRIER COCKPIT</span>
            </h3>
            <p className="text-xs text-[#9AA0B4] max-w-sm mt-1 leading-relaxed">
              Unified authentication for commercial drivers, dispatchers, and fleet managers.
              Autonomous 0-downtime token auto-rotation &amp; 49 CFR § 395 statutory compliance.
            </p>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start gap-2.5 text-xs text-red-200 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Logged-in State */}
          {currentUser ? (
            <div className="p-4 bg-[#14161E] border border-emerald-500/30 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  AUTHENTICATED WITH GOOGLE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 rounded font-bold uppercase">
                  ACTIVE SESSION
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#0D0E14] border border-[#262833] rounded-lg">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-11 h-11 rounded-full border border-[#F2CA50]"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#F2CA50] text-[#121318] flex items-center justify-center font-bold text-base font-mono">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">
                    {currentUser.displayName || 'Carrier Operator'}
                  </div>
                  <div className="text-xs text-[#8A8F9F] font-mono truncate">
                    {currentUser.email}
                  </div>
                  <div className="text-[10px] text-[#F2CA50] font-mono mt-0.5">
                    Role: <span className="uppercase font-bold">{currentRole}</span> · USDOT #3928192
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-[#F2CA50] hover:bg-[#FFE088] text-[#121318] font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(242,202,80,0.25)] flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Continue to Cockpit
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="py-2.5 px-4 bg-[#20222B] hover:bg-[#2B2E3A] border border-[#383B4A] text-[#E0E2EC] font-bold text-xs font-mono uppercase rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Not Logged-in State: Auth Tabs & Actions */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0E0F14] border border-[#262833] rounded-lg">
                <button
                  onClick={() => setActiveTab('sso')}
                  className={`py-2 px-3 text-xs font-mono font-bold uppercase rounded-md transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'sso'
                      ? 'bg-[#F2CA50] text-[#121318] shadow-md'
                      : 'text-[#8A8F9F] hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Google Workspace SSO
                </button>
                <button
                  onClick={() => setActiveTab('driver-pin')}
                  className={`py-2 px-3 text-xs font-mono font-bold uppercase rounded-md transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'driver-pin'
                      ? 'bg-[#F2CA50] text-[#121318] shadow-md'
                      : 'text-[#8A8F9F] hover:text-white'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Driver Quick PIN
                </button>
              </div>

              {/* Tab 1: Google SSO */}
              {activeTab === 'sso' && (
                <div className="space-y-3">
                  <button
                    id="btn-login-google"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-white hover:bg-neutral-100 text-[#121318] font-bold text-sm rounded-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-[#121318] border-t-transparent rounded-full animate-spin" />
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
                    <span>Sign in with Google Account</span>
                  </button>

                  <div className="p-3 bg-[#0F1015] border border-[#262833] rounded-lg space-y-1.5 text-[11px] font-mono text-[#8A8F9F]">
                    <div className="flex items-center justify-between text-white font-semibold">
                      <span>Permissions Granted:</span>
                      <span className="text-[#F2CA50]">OAuth 2.0 PKCE</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#A0A4B6]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Gmail dispatch alerts & rate confirmation parsing</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#A0A4B6]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Google Drive BOL, POD & DVIR paperwork archive</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Driver PIN */}
              {activeTab === 'driver-pin' && (
                <form onSubmit={handlePinSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#8A8F9F] uppercase font-semibold">
                      Carrier USDOT Number
                    </label>
                    <input
                      type="text"
                      value={dotNumber}
                      onChange={(e) => setDotNumber(e.target.value)}
                      placeholder="USDOT #"
                      className="w-full bg-[#181A22] border border-[#2E303B] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F2CA50]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#8A8F9F] uppercase font-semibold">
                      Driver Security PIN (4-Digits)
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={driverPin}
                      onChange={(e) => setDriverPin(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-[#181A22] border border-[#2E303B] rounded-lg px-3 py-2 text-center text-lg tracking-widest font-mono text-[#F2CA50] focus:outline-none focus:border-[#F2CA50]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#F2CA50] hover:bg-[#FFE088] text-[#121318] font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
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

          {/* Carrier Compliance & Security Guarantee Footer */}
          <div className="pt-3 border-t border-[#22232A] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#7C8092]">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#F2CA50]" />
              <span>FMCSA 49 CFR § 395 · Zero Custody</span>
            </div>
            <div className="flex items-center gap-1 text-[#A0A4B6]">
              <span>Need help?</span>
              <a href="tel:6367068338" className="text-[#F2CA50] hover:underline font-bold">
                (636) 706-8338
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
