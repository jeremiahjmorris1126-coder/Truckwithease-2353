import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Star,
  Trash2,
  Archive,
  RefreshCw,
  Search,
  Plus,
  Paperclip,
  Reply,
  Forward,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Truck,
  Wrench,
  Clock,
  Printer,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Tag,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  auth,
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from '../firebase';
import {
  GmailMessage,
  GmailLabel,
  GmailUserProfile,
  SAMPLE_FLEET_EMAILS,
  SYSTEM_LABELS,
  fetchGmailUserProfile,
  fetchGmailLabelsList,
  fetchGmailMessagesList,
  sendGmailMessage,
  createGmailDraft,
  modifyGmailLabels,
  trashGmailMessage,
  deleteGmailMessagePermanently,
  ComposeEmailPayload,
} from '../services/gmailService';

export function GmailView() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<GmailUserProfile | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mail state
  const [selectedFolder, setSelectedFolder] = useState<string>('INBOX');
  const [messages, setMessages] = useState<GmailMessage[]>(SAMPLE_FLEET_EMAILS);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(SAMPLE_FLEET_EMAILS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Modals & Compose
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composePayload, setComposePayload] = useState<ComposeEmailPayload>({
    to: '',
    cc: '',
    subject: '',
    bodyText: '',
  });
  const [isSending, setIsSending] = useState(false);

  // Destructive Action Confirmation Modal State (MANDATORY per Workspace Skill)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
  });

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        loadGmailData(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setUserProfile(null);
      }
    );

    // Initial check
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser);
      getAccessToken().then((token) => {
        if (token) {
          setAccessToken(token);
          loadGmailData(token);
        }
      });
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadGmailData = async (token?: string) => {
    setIsLoading(true);
    try {
      const profile = await fetchGmailUserProfile(token);
      if (profile) setUserProfile(profile);

      const res = await fetchGmailMessagesList(token, {
        labelIds: selectedFolder === 'INBOX' ? ['INBOX'] : [selectedFolder],
        q: searchQuery,
      });
      setMessages(res.messages);
      if (res.messages.length > 0 && !selectedMessage) {
        setSelectedMessage(res.messages[0]);
      }
    } catch (err) {
      console.error('Error loading Gmail data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setStatusNotice('Successfully connected to Gmail!');
        loadGmailData(result.accessToken);
        setTimeout(() => setStatusNotice(null), 4000);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setStatusNotice('Sign in was not completed. You can still use the fleet simulation view.');
      setTimeout(() => setStatusNotice(null), 4000);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
    setUserProfile(null);
    setMessages(SAMPLE_FLEET_EMAILS);
    setSelectedMessage(SAMPLE_FLEET_EMAILS[0]);
    setStatusNotice('Signed out from Google Workspace.');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    let list = messages;

    if (selectedFolder === 'STARRED') {
      list = list.filter((m) => m.isStarred);
    } else if (selectedFolder === 'IMPORTANT') {
      list = list.filter((m) => m.isImportant);
    } else if (selectedFolder === 'UNREAD') {
      list = list.filter((m) => m.isUnread);
    } else if (selectedFolder === 'CATEGORY_COMPLIANCE') {
      list = list.filter((m) => m.fleetCategory === 'COMPLIANCE');
    } else if (selectedFolder === 'CATEGORY_DISPATCH') {
      list = list.filter((m) => m.fleetCategory === 'RATE_CON' || m.fleetCategory === 'DISPATCH');
    } else if (selectedFolder === 'CATEGORY_MAINTENANCE') {
      list = list.filter((m) => m.fleetCategory === 'DVIR_MAINTENANCE');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.snippet.toLowerCase().includes(q) ||
          m.from.name.toLowerCase().includes(q) ||
          m.from.email.toLowerCase().includes(q) ||
          (m.bodyText && m.bodyText.toLowerCase().includes(q))
      );
    }

    return list;
  }, [messages, selectedFolder, searchQuery]);

  // Toggle Star
  const handleToggleStar = async (msg: GmailMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStarred = !msg.isStarred;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isStarred: newStarred } : m))
    );
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage((prev) => (prev ? { ...prev, isStarred: newStarred } : null));
    }

    if (accessToken) {
      if (newStarred) {
        await modifyGmailLabels(msg.id, ['STARRED'], []);
      } else {
        await modifyGmailLabels(msg.id, [], ['STARRED']);
      }
    }
  };

  // Toggle Read/Unread
  const handleToggleRead = async (msg: GmailMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newUnread = !msg.isUnread;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isUnread: newUnread } : m))
    );
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage((prev) => (prev ? { ...prev, isUnread: newUnread } : null));
    }

    if (accessToken) {
      if (newUnread) {
        await modifyGmailLabels(msg.id, ['UNREAD'], []);
      } else {
        await modifyGmailLabels(msg.id, [], ['UNREAD']);
      }
    }
  };

  // Destructive Delete with Mandatory User Confirmation Dialog
  const promptDeleteMessage = (msg: GmailMessage) => {
    setConfirmModal({
      isOpen: true,
      title: 'Move Email to Trash?',
      description: `Are you sure you want to delete "${msg.subject}" from ${msg.from.name}? This will move the message to your Gmail Trash folder.`,
      confirmText: 'Delete Email',
      isDangerous: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        if (selectedMessage?.id === msg.id) {
          const remaining = messages.filter((m) => m.id !== msg.id);
          setSelectedMessage(remaining.length > 0 ? remaining[0] : null);
        }
        if (accessToken) {
          await trashGmailMessage(msg.id, accessToken);
        }
        setStatusNotice('Email moved to Trash.');
        setTimeout(() => setStatusNotice(null), 3000);
      },
    });
  };

  // Quick Reply setup
  const handleQuickReply = (msg: GmailMessage) => {
    setComposePayload({
      to: msg.from.email,
      subject: msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
      threadId: msg.threadId,
      inReplyTo: msg.id,
      bodyText: `\n\n--- On ${new Date(msg.date).toLocaleString()}, ${msg.from.name} wrote:\n> ${msg.bodyText.slice(0, 300)}...`,
    });
    setIsComposeOpen(true);
  };

  // Quick Forward setup
  const handleQuickForward = (msg: GmailMessage) => {
    setComposePayload({
      to: '',
      subject: msg.subject.startsWith('Fwd:') ? msg.subject : `Fwd: ${msg.subject}`,
      bodyText: `\n\n---------- Forwarded message ---------\nFrom: ${msg.from.name} <${msg.from.email}>\nDate: ${new Date(msg.date).toLocaleString()}\nSubject: ${msg.subject}\nTo: ${msg.to.map((t) => t.email).join(', ')}\n\n${msg.bodyText}`,
    });
    setIsComposeOpen(true);
  };

  // Fleet Templates
  const handleApplyTemplate = (type: 'DVIR' | 'RATE_CON' | 'FMCSA_AUDIT' | 'MAINTENANCE_WO') => {
    if (type === 'DVIR') {
      setComposePayload({
        to: 'maintenance@titancarriers.com',
        cc: 'safety@titancarriers.com',
        subject: `[DAILY DVIR EXPORT] Unit #104 Pre-Trip Verification - ${new Date().toLocaleDateString()}`,
        bodyText: `FMCSA Daily Vehicle Inspection Report (49 CFR § 396.11)
Date: ${new Date().toLocaleDateString()}
Carrier: TITAN CARRIER SERVICES LLC (USDOT #3928192)
Vehicle: 2024 Freightliner Cascadia (Unit #104) | Trailer: #TR-8821
Odometer: 142,390 mi
Driver Inspector: Jeremiah Morris (ID #104)

INSPECTION SUMMARY:
- Service Brakes & Lines: SATISFACTORY / VERIFIED
- Air Pressure & Warning Device: 120 PSI REGULATED
- Steering Mechanism: NOMINAL
- Tires, Wheels & Rims: TREAD DEPTH > 4/32"
- Lighting Devices & Reflectors: ALL OPERATIONAL
- Coupling Devices & Kingpin: LOCKED & SECURE
- Emergency Equipment: FIRE EXTINGUISHER CHARGED, 3 REFLECTIVE TRIANGLES PRESENT

Driver Signature: Jeremiah Morris (Cryptographically Signed)`,
      });
    } else if (type === 'RATE_CON') {
      setComposePayload({
        to: 'dispatch@apexfreightlogistics.com',
        subject: 'ACCEPTANCE: Rate Confirmation #RC-89210 - Unit 104 Locked',
        bodyText: `Dear Apex Logistics Dispatch,

We hereby ACCEPT Rate Confirmation #RC-89210 for Chicago, IL to Dallas, TX ($3,850.00 Gross).
Assigned Unit: Tractor #104 / Reefer Trailer #TR-8821
Driver: Jeremiah Morris (Phone: 555-019-2819)
ETA to Cold Storage Pickup: 07:30 CT.

Thank you,
Titan Carrier Services Dispatch`,
      });
    } else if (type === 'FMCSA_AUDIT') {
      setComposePayload({
        to: 'safety@titancarriers.com',
        subject: '[COMPLIANCE SUBMISSION] FMCSA Clearinghouse & HOS 24-Hour Cryptographic Audit',
        bodyText: `Compliance Division,

Attached is the 24-hour cryptographic audit block summary for USDOT #3928192.
- Active Commercial Drivers: 14
- Zero HOS 11-hr / 14-hr Duty Cycle Violations
- 100% ELD CAN-Bus Telematics Verification

Submitted under 49 CFR § 395.22.`,
      });
    } else if (type === 'MAINTENANCE_WO') {
      setComposePayload({
        to: 'shop@fleetrepairs.com',
        cc: 'maintenance@titancarriers.com',
        subject: 'WORK ORDER REQUEST #WO-4091: Unit #104 Steer Axle Brake Pad Replacement',
        bodyText: `Fleet Maintenance Dispatch,

Please authorize Work Order #WO-4091 for scheduled preventative maintenance:
- Unit: #104 (2024 Freightliner Cascadia)
- Component: Steer Axle Brake Lining & Slack Adjuster Service
- FMCSA Regulation: 49 CFR § 393.47
- Target Service Date: Tomorrow 08:00 AM

Please confirm shop bay availability.`,
      });
    }
  };

  // Send Email with mandatory confirmation if desired
  const handleSendEmail = async () => {
    if (!composePayload.to.trim() || !composePayload.subject.trim()) {
      alert('Please provide a recipient email and subject.');
      return;
    }

    setIsSending(true);
    try {
      const res = await sendGmailMessage(composePayload, accessToken || undefined);
      if (res.success) {
        setIsComposeOpen(false);
        setComposePayload({ to: '', cc: '', subject: '', bodyText: '' });
        setStatusNotice(`Email successfully sent to ${composePayload.to}!`);
        setTimeout(() => setStatusNotice(null), 4000);

        // Add to local sent list
        const sentMsg: GmailMessage = {
          id: res.id || `sent-${Date.now()}`,
          threadId: res.threadId || `thread-${Date.now()}`,
          labelIds: ['SENT'],
          subject: composePayload.subject,
          snippet: composePayload.bodyText.slice(0, 100),
          internalDate: String(Date.now()),
          from: {
            name: currentUser?.displayName || 'Titan Carrier Operations',
            email: currentUser?.email || 'dispatch@titancarriers.com',
          },
          to: [{ name: composePayload.to, email: composePayload.to }],
          date: new Date().toISOString(),
          bodyText: composePayload.bodyText,
          isUnread: false,
          fleetCategory: 'GENERAL',
        };
        setMessages((prev) => [sentMsg, ...prev]);
        setSelectedMessage(sentMsg);
      } else {
        alert(`Failed to send email: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Send error: ${err?.message || String(err)}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Header */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EA4335]/20 via-[#4285F4]/20 to-[#FBBC05]/20 border border-[#EA4335]/40 flex items-center justify-center shrink-0 shadow-lg">
            <Mail className="w-6 h-6 text-[#EA4335]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">
                Gmail Fleet Communications & Dispatch Messaging
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EA4335]/20 text-[#EA4335] border border-[#EA4335]/40">
                Workspace API
              </span>
            </div>
            <p className="text-xs text-[#A3A3A3] mt-0.5">
              Read, compose, send, and automate fleet DVIR reports, rate confirmations, and FMCSA safety notices with your connected Google Workspace account.
            </p>
          </div>
        </div>

        {/* OAuth Connect Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-[#1C1C1C] border border-[#333] rounded-lg px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-xs font-bold text-[#C9A84C]">
                {currentUser.displayName ? currentUser.displayName[0] : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium text-[#F5F5F5] truncate max-w-[160px]">
                  {currentUser.displayName || currentUser.email}
                </div>
                <div className="text-[10px] text-[#22C55E] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                  Connected to Gmail
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 text-xs text-[#A3A3A3] hover:text-[#EF4444] px-2 py-1 rounded bg-[#262626] hover:bg-[#333] transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button bg-white text-[#1f1f1f] hover:bg-gray-100 font-medium text-xs px-3.5 py-2 rounded-lg border border-gray-300 flex items-center gap-2.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}

          <button
            onClick={() => setIsComposeOpen(true)}
            className="bg-[#C9A84C] hover:bg-[#d9b85c] text-[#0A0A0A] font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Compose</span>
          </button>
        </div>
      </div>

      {/* Status Notice Toast */}
      {statusNotice && (
        <div className="bg-[#1C2C1C] border border-[#22C55E]/40 text-[#22C55E] text-xs px-4 py-2.5 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusNotice}</span>
          </div>
          <button onClick={() => setStatusNotice(null)} className="text-[#A3A3A3] hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Mail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Folders & Fleet Categories (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search emails, loads, DVIRs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-[#262626] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#C9A84C] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#F5F5F5]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mail Folders List */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 space-y-1">
            <div className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider px-2 py-1">
              Mailboxes
            </div>
            <button
              onClick={() => setSelectedFolder('INBOX')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                selectedFolder === 'INBOX'
                  ? 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30'
                  : 'text-[#D4D4D4] hover:bg-[#1C1C1C]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Inbox</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#262626] text-[#A3A3A3]">
                {messages.filter((m) => m.isUnread).length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFolder('STARRED')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                selectedFolder === 'STARRED'
                  ? 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30'
                  : 'text-[#D4D4D4] hover:bg-[#1C1C1C]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-[#FBBC05]" />
                <span>Starred</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#262626] text-[#A3A3A3]">
                {messages.filter((m) => m.isStarred).length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFolder('IMPORTANT')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                selectedFolder === 'IMPORTANT'
                  ? 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30'
                  : 'text-[#D4D4D4] hover:bg-[#1C1C1C]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <span>Important</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#262626] text-[#A3A3A3]">
                {messages.filter((m) => m.isImportant).length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFolder('SENT')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                selectedFolder === 'SENT'
                  ? 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30'
                  : 'text-[#D4D4D4] hover:bg-[#1C1C1C]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4" />
                <span>Sent Mail</span>
              </div>
            </button>

            <div className="pt-2 pb-1">
              <div className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider px-2 py-1">
                Fleet Smart Categories
              </div>
            </div>

            <button
              onClick={() => setSelectedFolder('CATEGORY_COMPLIANCE')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                selectedFolder === 'CATEGORY_COMPLIANCE'
                  ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                  : 'text-[#D4D4D4] hover:bg-[#1C1C1C]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#EF4444]" />
                <span>DOT & Compliance</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444]">
                FMCSA
              </span>
            </button>

            <button
              onClick={() => setSelectedFolder('CATEGORY_DISPATCH')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                selectedFolder === 'CATEGORY_DISPATCH'
                  ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30'
                  : 'text-[#D4D4D4] hover:bg-[#1C1C1C]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#3B82F6]" />
                <span>Rate Cons & Dispatch</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3B82F6]/20 text-[#3B82F6]">
                Apex
              </span>
            </button>

            <button
              onClick={() => setSelectedFolder('CATEGORY_MAINTENANCE')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                selectedFolder === 'CATEGORY_MAINTENANCE'
                  ? 'bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30'
                  : 'text-[#D4D4D4] hover:bg-[#1C1C1C]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-[#EAB308]" />
                <span>DVIR & Repair Work Orders</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAB308]/20 text-[#EAB308]">
                Unit 104
              </span>
            </button>
          </div>

          {/* Quick Fleet Actions */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-3 space-y-2">
            <div className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider px-2">
              1-Click Fleet Email Templates
            </div>
            <button
              onClick={() => {
                handleApplyTemplate('DVIR');
                setIsComposeOpen(true);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#D4D4D4] hover:bg-[#1C1C1C] hover:text-[#C9A84C] flex items-center gap-2 transition"
            >
              <FileText className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span className="truncate">Send Daily DVIR to Shop</span>
            </button>
            <button
              onClick={() => {
                handleApplyTemplate('RATE_CON');
                setIsComposeOpen(true);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#D4D4D4] hover:bg-[#1C1C1C] hover:text-[#3B82F6] flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="truncate">Accept Broker Rate Con</span>
            </button>
            <button
              onClick={() => {
                handleApplyTemplate('MAINTENANCE_WO');
                setIsComposeOpen(true);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#D4D4D4] hover:bg-[#1C1C1C] hover:text-[#EAB308] flex items-center gap-2 transition"
            >
              <Wrench className="w-3.5 h-3.5 text-[#EAB308]" />
              <span className="truncate">Dispatch Work Order #WO-4091</span>
            </button>
          </div>
        </div>

        {/* Center Column: Message List (4 Cols) */}
        <div className="lg:col-span-4 bg-[#141414] border border-[#262626] rounded-xl flex flex-col overflow-hidden h-[620px]">
          <div className="p-3 border-b border-[#262626] flex items-center justify-between bg-[#181818]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F5F5F5]">
                {selectedFolder.replace('CATEGORY_', '')}
              </span>
              <span className="text-[11px] text-[#737373]">
                ({filteredMessages.length} messages)
              </span>
            </div>
            <button
              onClick={() => loadGmailData(accessToken || undefined)}
              className="text-[#737373] hover:text-[#F5F5F5] p-1 rounded hover:bg-[#262626] transition"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1F1F1F]">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-[#737373] space-y-2">
                <Mail className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No emails found in this folder</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (msg.isUnread) handleToggleRead(msg);
                    }}
                    className={`p-3 cursor-pointer transition relative ${
                      isSelected
                        ? 'bg-[#222222] border-l-2 border-[#C9A84C]'
                        : 'hover:bg-[#1A1A1A]'
                    } ${msg.isUnread ? 'bg-[#181818]' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {msg.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0"></span>
                        )}
                        <span
                          className={`text-xs truncate ${
                            msg.isUnread
                              ? 'font-bold text-[#F5F5F5]'
                              : 'font-medium text-[#D4D4D4]'
                          }`}
                        >
                          {msg.from.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#737373] shrink-0">
                        {new Date(msg.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#F5F5F5] truncate mt-1">
                      {msg.subject}
                    </div>

                    <div className="text-[11px] text-[#A3A3A3] line-clamp-1 mt-0.5">
                      {msg.snippet}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        {msg.fleetCategory === 'COMPLIANCE' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EF4444]/20 text-[#EF4444]">
                            FMCSA
                          </span>
                        )}
                        {msg.fleetCategory === 'RATE_CON' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#3B82F6]/20 text-[#3B82F6]">
                            Rate Con
                          </span>
                        )}
                        {msg.fleetCategory === 'DVIR_MAINTENANCE' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EAB308]/20 text-[#EAB308]">
                            DVIR
                          </span>
                        )}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-[#A3A3A3]">
                            <Paperclip className="w-3 h-3" />
                            {msg.attachments.length}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleStar(msg, e)}
                          className={`p-1 rounded hover:bg-[#333] transition ${
                            msg.isStarred ? 'text-[#FBBC05]' : 'text-[#525252]'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => promptDeleteMessage(msg)}
                          className="p-1 rounded hover:bg-[#333] text-[#525252] hover:text-[#EF4444] transition"
                          title="Trash email"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Reading Pane (5 Cols) */}
        <div className="lg:col-span-5 bg-[#141414] border border-[#262626] rounded-xl flex flex-col overflow-hidden h-[620px]">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Message Header */}
              <div className="p-4 border-b border-[#262626] bg-[#181818] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm sm:text-base font-bold text-[#F5F5F5] leading-snug">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleStar(selectedMessage)}
                      className={`p-1.5 rounded-lg border border-[#333] bg-[#222] hover:bg-[#2A2A2A] transition ${
                        selectedMessage.isStarred ? 'text-[#FBBC05]' : 'text-[#A3A3A3]'
                      }`}
                      title="Star email"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg border border-[#333] bg-[#222] hover:bg-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5] transition"
                      title="Print message"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => promptDeleteMessage(selectedMessage)}
                      className="p-1.5 rounded-lg border border-[#333] bg-[#222] hover:bg-[#2A2A2A] text-[#A3A3A3] hover:text-[#EF4444] transition"
                      title="Delete email"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center font-bold text-[#C9A84C] text-xs">
                      {selectedMessage.from.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-[#F5F5F5]">
                        {selectedMessage.from.name}
                      </div>
                      <div className="text-[11px] text-[#737373]">
                        {selectedMessage.from.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#737373] text-right">
                    <div>{new Date(selectedMessage.date).toLocaleDateString()}</div>
                    <div>{new Date(selectedMessage.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <div className="text-[11px] text-[#A3A3A3] flex items-center gap-1">
                  <span>To:</span>
                  <span className="text-[#D4D4D4]">
                    {selectedMessage.to.map((t) => t.email).join(', ')}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 p-4 overflow-y-auto bg-[#101010] text-xs sm:text-sm text-[#D4D4D4] leading-relaxed">
                {selectedMessage.bodyHtml ? (
                  <div
                    className="prose prose-invert max-w-none text-xs sm:text-sm"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                  />
                ) : (
                  <pre className="font-sans whitespace-pre-wrap">{selectedMessage.bodyText}</pre>
                )}

                {/* Attachments Section */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#262626]">
                    <div className="text-xs font-semibold text-[#A3A3A3] mb-2 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{selectedMessage.attachments.length} Attachment(s)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedMessage.attachments.map((att, i) => (
                        <div
                          key={i}
                          className="bg-[#1C1C1C] border border-[#333] rounded-lg p-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-[#C9A84C] shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-[#F5F5F5] truncate">
                                {att.filename}
                              </div>
                              <div className="text-[10px] text-[#737373]">
                                {Math.round(att.size / 1024)} KB • PDF Document
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              alert(`Opening attachment "${att.filename}" in secure PDF viewer.`)
                            }
                            className="p-1 rounded hover:bg-[#262626] text-[#A3A3A3] hover:text-[#C9A84C]"
                            title="View / Download"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick Reply Toolbar */}
              <div className="p-3 border-t border-[#262626] bg-[#181818] flex items-center gap-2">
                <button
                  onClick={() => handleQuickReply(selectedMessage)}
                  className="flex-1 bg-[#262626] hover:bg-[#333] text-[#F5F5F5] text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <Reply className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => handleQuickForward(selectedMessage)}
                  className="flex-1 bg-[#262626] hover:bg-[#333] text-[#F5F5F5] text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <Forward className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Forward</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#737373] space-y-2">
              <Mail className="w-12 h-12 opacity-30" />
              <p className="text-sm font-medium text-[#A3A3A3]">No message selected</p>
              <p className="text-xs">Choose an email from the list to preview its contents and attachments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#1C1C1C] border-b border-[#262626] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#C9A84C]" />
                <h3 className="text-sm font-bold text-[#F5F5F5]">New Fleet Communication</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-[#737373] hover:text-[#F5F5F5] p-1 rounded hover:bg-[#262626]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Template Selector */}
            <div className="px-4 py-2 bg-[#181818] border-b border-[#262626] flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-[#737373] shrink-0">Templates:</span>
              <button
                onClick={() => handleApplyTemplate('DVIR')}
                className="px-2 py-1 rounded bg-[#262626] hover:bg-[#333] text-[#D4D4D4] whitespace-nowrap"
              >
                Daily DVIR Inspection
              </button>
              <button
                onClick={() => handleApplyTemplate('RATE_CON')}
                className="px-2 py-1 rounded bg-[#262626] hover:bg-[#333] text-[#D4D4D4] whitespace-nowrap"
              >
                Rate Con Acceptance
              </button>
              <button
                onClick={() => handleApplyTemplate('FMCSA_AUDIT')}
                className="px-2 py-1 rounded bg-[#262626] hover:bg-[#333] text-[#D4D4D4] whitespace-nowrap"
              >
                FMCSA Safety Audit
              </button>
              <button
                onClick={() => handleApplyTemplate('MAINTENANCE_WO')}
                className="px-2 py-1 rounded bg-[#262626] hover:bg-[#333] text-[#D4D4D4] whitespace-nowrap"
              >
                Maintenance Work Order
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-semibold text-[#A3A3A3] mb-1">To</label>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={composePayload.to}
                  onChange={(e) => setComposePayload({ ...composePayload, to: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#A3A3A3] mb-1">Cc</label>
                <input
                  type="email"
                  placeholder="safety@titancarriers.com, dispatch@titancarriers.com"
                  value={composePayload.cc || ''}
                  onChange={(e) => setComposePayload({ ...composePayload, cc: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#A3A3A3] mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Email subject..."
                  value={composePayload.subject}
                  onChange={(e) => setComposePayload({ ...composePayload, subject: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#A3A3A3] mb-1">Message Body</label>
                <textarea
                  rows={8}
                  placeholder="Type your message..."
                  value={composePayload.bodyText}
                  onChange={(e) => setComposePayload({ ...composePayload, bodyText: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#C9A84C] font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#1C1C1C] border-t border-[#262626] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="px-3.5 py-2 rounded-lg text-xs text-[#A3A3A3] hover:text-white hover:bg-[#262626] transition"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="bg-[#C9A84C] hover:bg-[#d9b85c] text-[#0A0A0A] font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending via Gmail...' : 'Send Message'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Workspace Destructive User Confirmation Dialog */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#333] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F5F5F5]">{confirmModal.title}</h3>
                <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#262626]">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#262626] transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#EF4444] hover:bg-[#DC2626] text-white transition shadow-sm"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
