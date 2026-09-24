import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Wrench,
  AlertTriangle,
  Camera,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Upload,
  Trash2,
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  Truck,
  Layers,
  Sliders,
  Thermometer,
  Flame,
  Radio,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  CheckSquare,
  AlertOctagon,
  Copy,
  Check,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  DvirInspection,
  DvirDefectItem,
  DvirPhotoAttachment,
  RoadsideAssistanceProvider,
  BreakdownIncidentTicket,
  DailyDvirExportPackage,
} from '../types';
import {
  FMCSA_INSPECTION_ZONES,
  INDEXED_ROADSIDE_PROVIDERS,
  INITIAL_PRIOR_DAY_DVIR_MEMORY,
  getStoredDvirRecords,
  saveDvirRecord,
  getDvirDispatchMessages,
  saveDvirDispatchMessage,
  DvirDispatchMessage,
  saveBreakdownTicket,
  getStoredBreakdownTickets,
} from '../services/dvirMemoryAndRoadsideService';
import {
  compileAndExportDailyDvir,
  getStoredPastRepairs,
} from '../services/maintenanceComplianceService';
import { DvirDailyExportModal } from './DvirDailyExportModal';
import { triggerHapticFeedback } from '../services/haptics';

export const DvirAutonomousAgentView: React.FC = () => {
  // Navigation / Mode within DVIR Agent
  const [activeView, setActiveView] = useState<
    'INSPECTION' | 'PRIOR_MEMORY' | 'DISPATCH_WIRE' | 'ROADSIDE_RESCUE' | 'HISTORY_LOGS'
  >('INSPECTION');

  // Inspection Setup State
  const [inspectionType, setInspectionType] = useState<'PRE_TRIP' | 'POST_TRIP'>('PRE_TRIP');
  const [unitNumber, setUnitNumber] = useState('UNIT #104-E');
  const [trailerNumber, setTrailerNumber] = useState('TRL-5390');
  const [driverName, setDriverName] = useState('Marcus Bell');
  const [odometer, setOdometer] = useState(143210);
  const [activeZoneIndex, setActiveZoneIndex] = useState(0);

  // Prior Day Acknowledgment
  const [priorDayAcknowledged, setPriorDayAcknowledged] = useState(true);
  const [showPriorDayDetails, setShowPriorDayDetails] = useState(false);

  // Dynamic Item Check State: map checkItemId -> { passed: boolean, note: string, severity?: string }
  const [itemCheckState, setItemCheckState] = useState<
    Record<string, { passed: boolean; note: string; severity?: 'OUT_OF_SERVICE' | 'SAFETY_DEFECT' | 'MINOR_COSMETIC' }>
  >(() => {
    const initial: Record<string, { passed: boolean; note: string }> = {};
    FMCSA_INSPECTION_ZONES.forEach((zone) => {
      zone.checkItems.forEach((chk) => {
        initial[chk.id] = { passed: true, note: '' };
      });
    });
    return initial;
  });

  // Attached Defect Photos
  const [photos, setPhotos] = useState<DvirPhotoAttachment[]>([
    {
      id: 'photo-sample-1',
      url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
      caption: 'Right trailer brake air line verified replaced by shop mechanic',
      zone: 'Zone 5: Trailer Tandems',
      timestamp: 'Sep 11, 2026 · 06:15 EDT',
      fileName: 'brake_hose_replaced_proof.jpg',
    },
  ]);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [selectedZoneForPhoto, setSelectedZoneForPhoto] = useState('Zone 1: Engine Compartment');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Driver Notes
  const [driverNotes, setDriverNotes] = useState('');
  const [signatureName, setSignatureName] = useState('Marcus Bell (CDL-A #IL-8849201)');
  const [isSigned, setIsSigned] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);

  // Daily Export Modal State
  const [isDailyExportModalOpen, setIsDailyExportModalOpen] = useState(false);
  const [activeDailyExportPackage, setActiveDailyExportPackage] = useState<DailyDvirExportPackage | null>(null);
  const [storedPastRepairsList, setStoredPastRepairsList] = useState(getStoredPastRepairs);

  // Dispatch Messages
  const [messages, setMessages] = useState<DvirDispatchMessage[]>(getDvirDispatchMessages);
  const [chatInput, setChatInput] = useState('');

  // Roadside Assistance State
  const [roadsideSearch, setRoadsideSearch] = useState('');
  const [selectedRoadsideCategory, setSelectedRoadsideCategory] = useState<string>('ALL');
  const [breakdownType, setBreakdownType] = useState<BreakdownIncidentTicket['breakdownCategory']>('TIRE_BLOWOUT');
  const [breakdownLocation, setBreakdownLocation] = useState('I-80 Westbound MM 142.4 (near Des Moines, IA)');
  const [breakdownUrgency, setBreakdownUrgency] = useState<'CRITICAL_HAZARD_OOS' | 'HIGH_URGENT' | 'STANDARD_ROADSIDE'>('HIGH_URGENT');
  const [breakdownDescription, setBreakdownDescription] = useState('Right drive tire tread delaminated on interstate shoulder. Unit safely parked on wide shoulder with 4-way hazard flashers active.');
  const [assignedProviderId, setAssignedProviderId] = useState('prov-fleetnet');
  const [activeTickets, setActiveTickets] = useState<BreakdownIncidentTicket[]>(getStoredBreakdownTickets);

  // Gemini 3.5 Microphone Audio Defect Dictation
  const [dictatingItemId, setDictatingItemId] = useState<string | null>(null);
  const [isDictatingDefect, setIsDictatingDefect] = useState<boolean>(false);
  const defectMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const defectAudioChunksRef = useRef<Blob[]>([]);

  const handleStartDefectDictation = async (itemId: string) => {
    try {
      if (isDictatingDefect && dictatingItemId === itemId) {
        if (defectMediaRecorderRef.current && defectMediaRecorderRef.current.state === 'recording') {
          defectMediaRecorderRef.current.stop();
        }
        return;
      }

      setDictatingItemId(itemId);
      setIsDictatingDefect(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      defectAudioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      defectMediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) defectAudioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(defectAudioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            const res = await fetch('/api/gemini/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64,
                mimeType: mr.mimeType || 'audio/webm',
                prompt: 'Transcribe this commercial truck inspection defect note concisely. Return only the defect note without conversational filler.',
              }),
            });
            const data = await res.json();
            if (data.success && data.transcription) {
              handleItemNoteChange(itemId, data.transcription);
            }
          } catch (err) {
            console.error('Defect audio transcription error:', err);
          } finally {
            setIsDictatingDefect(false);
            setDictatingItemId(null);
          }
        };
      };

      mr.start();
    } catch (err) {
      console.error('Mic access error for DVIR dictation:', err);
      setIsDictatingDefect(false);
      setDictatingItemId(null);
    }
  };
  const [breakdownSuccessMsg, setBreakdownSuccessMsg] = useState<string | null>(null);

  // Copied contact phone feedback
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // ==========================================
  // HANDS-FREE WEB SPEECH API ENGINE FOR DVIR & ROADSIDE
  // ==========================================
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceInterimTranscript, setVoiceInterimTranscript] = useState('');
  const [voiceStatusMsg, setVoiceStatusMsg] = useState<string | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Spoken feedback synthesizer
  const speakFeedback = (text: string) => {
    if (!isTtsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Voice Command Processing Logic
  const handleProcessVoiceCommand = (spokenRaw: string) => {
    const raw = spokenRaw.toLowerCase().trim();
    setVoiceTranscript(spokenRaw);

    // 1. Pre-Trip Inspection Trigger
    if (raw.includes('pre trip') || raw.includes('pretrip') || raw.includes('start pre') || raw.includes('begin pre')) {
      setInspectionType('PRE_TRIP');
      setActiveView('INSPECTION');
      setActiveZoneIndex(0);
      setVoiceStatusMsg('Voice trigger: PRE-TRIP INSPECTION started.');
      speakFeedback('Pre-trip inspection initiated. Zone 1: Engine Compartment active.');
      triggerHapticFeedback('success');
      return;
    }

    // 2. Post-Trip Inspection Trigger
    if (raw.includes('post trip') || raw.includes('posttrip') || raw.includes('start post') || raw.includes('begin post') || raw.includes('end of day')) {
      setInspectionType('POST_TRIP');
      setActiveView('INSPECTION');
      setActiveZoneIndex(0);
      setVoiceStatusMsg('Voice trigger: POST-TRIP INSPECTION started.');
      speakFeedback('Post-trip inspection initiated. Inspecting all 7 walk-around zones.');
      triggerHapticFeedback('success');
      return;
    }

    // 3. Roadside Breakdown / Issue Trigger
    if (raw.includes('roadside') || raw.includes('breakdown') || raw.includes('issue') || raw.includes('blowout') || raw.includes('emergency') || raw.includes('tow')) {
      setActiveView('ROADSIDE_RESCUE');
      let identifiedCategory: BreakdownIncidentTicket['breakdownCategory'] = 'OTHER';
      if (raw.includes('blowout') || raw.includes('tire') || raw.includes('flat')) {
        identifiedCategory = 'TIRE_BLOWOUT';
        setBreakdownType('TIRE_BLOWOUT');
        setBreakdownDescription('Tire blowout reported by voice command. Driver safely on shoulder.');
      } else if (raw.includes('overheat') || raw.includes('engine') || raw.includes('coolant') || raw.includes('derate')) {
        identifiedCategory = 'ENGINE_DERATE_DEF';
        setBreakdownType('ENGINE_DERATE_DEF');
        setBreakdownDescription('Engine overheating / high temperature alert reported by voice command.');
      } else if (raw.includes('brake') || raw.includes('air leak') || raw.includes('chamber')) {
        identifiedCategory = 'AIR_LEAK_BRAKES';
        setBreakdownType('AIR_LEAK_BRAKES');
        setBreakdownDescription('Severe brake system air pressure drop reported by voice command.');
      } else if (raw.includes('tow') || raw.includes('heavy tow') || raw.includes('winch')) {
        identifiedCategory = 'TOWING_WRECKER';
        setBreakdownType('TOWING_WRECKER');
        setBreakdownDescription('Heavy tractor-trailer recovery requested by voice command.');
      }
      setVoiceStatusMsg(`Voice trigger: ROADSIDE ISSUE REPORTED (${identifiedCategory}).`);
      speakFeedback(`Emergency roadside assistance view open for ${identifiedCategory.replace(/_/g, ' ')}. Paging heavy rescue network.`);
      triggerHapticFeedback('alert');
      return;
    }

    // 4. Pass Current Zone
    if (raw.includes('pass zone') || raw.includes('zone pass') || raw.includes('pass all') || raw.includes('clear zone') || raw.includes('all good')) {
      const zone = FMCSA_INSPECTION_ZONES[activeZoneIndex];
      if (zone) {
        handlePassAllInZone(zone);
        setVoiceStatusMsg(`Voice trigger: ${zone.title} passed clean.`);
        speakFeedback(`${zone.title} passed without defects.`);
        if (activeZoneIndex < FMCSA_INSPECTION_ZONES.length - 1) {
          setActiveZoneIndex((prev) => prev + 1);
        }
      }
      return;
    }

    // 5. Next Zone Navigation
    if (raw.includes('next zone') || raw.includes('next') || raw.includes('advance')) {
      if (activeZoneIndex < FMCSA_INSPECTION_ZONES.length - 1) {
        setActiveZoneIndex((prev) => prev + 1);
        const nextZ = FMCSA_INSPECTION_ZONES[activeZoneIndex + 1];
        setVoiceStatusMsg(`Advanced to ${nextZ.title}`);
        speakFeedback(`Zone ${activeZoneIndex + 2}: ${nextZ.title}`);
        triggerHapticFeedback('tick');
      } else {
        speakFeedback('You have reached the final inspection zone.');
      }
      return;
    }

    // 6. Previous Zone Navigation
    if (raw.includes('previous zone') || raw.includes('back zone') || raw.includes('previous') || raw.includes('go back')) {
      if (activeZoneIndex > 0) {
        setActiveZoneIndex((prev) => prev - 1);
        const prevZ = FMCSA_INSPECTION_ZONES[activeZoneIndex - 1];
        setVoiceStatusMsg(`Returned to ${prevZ.title}`);
        speakFeedback(`Zone ${activeZoneIndex}: ${prevZ.title}`);
        triggerHapticFeedback('tick');
      }
      return;
    }

    // 7. Flag Defect
    if (raw.includes('defect') || raw.includes('flag') || raw.includes('fail') || raw.includes('problem')) {
      const zone = FMCSA_INSPECTION_ZONES[activeZoneIndex];
      if (zone && zone.checkItems.length > 0) {
        const firstItem = zone.checkItems[0];
        handleToggleItem(firstItem.id, false, 'SAFETY_DEFECT');
        handleItemNoteChange(firstItem.id, `Voice recorded defect note: "${spokenRaw}"`);
        setVoiceStatusMsg(`Defect flagged on ${firstItem.name}`);
        speakFeedback(`Defect recorded for ${firstItem.name} in ${zone.title}. Dispatch alerted.`);
      }
      return;
    }

    // 8. View Navigation
    if (raw.includes('prior day') || raw.includes('prior memory') || raw.includes('check memory')) {
      setActiveView('PRIOR_MEMORY');
      setVoiceStatusMsg('Voice trigger: Switched to PRIOR DAY MEMORY');
      speakFeedback('Displaying prior day DVIR inspection and mechanic certification.');
      triggerHapticFeedback('subtle');
      return;
    }

    if (raw.includes('dispatch') || raw.includes('message') || raw.includes('chat')) {
      setActiveView('DISPATCH_WIRE');
      setVoiceStatusMsg('Voice trigger: Switched to DISPATCH WIRE');
      speakFeedback('Direct fleet manager dispatch messaging wire active.');
      triggerHapticFeedback('subtle');
      return;
    }

    // 9. Sign & Submit
    if (raw.includes('sign') || raw.includes('submit') || raw.includes('certify')) {
      setIsSigned(true);
      setVoiceStatusMsg('Voice trigger: Signature verified and ready for submit.');
      speakFeedback('Electronic signature applied. Ready to certify DVIR.');
      triggerHapticFeedback('success');
      return;
    }

    setVoiceStatusMsg(`Heard: "${spokenRaw}". Try "Start Pre-Trip", "Report Breakdown", or "Pass Zone".`);
  };

  // Toggle Web Speech recognition listener
  const toggleVoiceListener = () => {
    if (isVoiceListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping recognition:', e);
        }
      }
      setIsVoiceListening(false);
      setVoiceInterimTranscript('');
      triggerHapticFeedback('tick');
    } else {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
        alert('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsVoiceListening(true);
          setVoiceStatusMsg('Listening for in-cab commands: "Start Pre-Trip", "Report Breakdown", "Pass Zone"...');
          speakFeedback('Voice command listener active.');
          triggerHapticFeedback('success');
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          if (interim) {
            setVoiceInterimTranscript(interim);
          }

          if (final.trim()) {
            setVoiceInterimTranscript('');
            handleProcessVoiceCommand(final);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setVoiceStatusMsg('Microphone access denied. Please allow microphone permissions in browser.');
          } else {
            setVoiceStatusMsg(`Voice engine alert: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsVoiceListening(false);
          setVoiceInterimTranscript('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setVoiceStatusMsg('Failed to initialize microphone listener.');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Filtered Roadside Providers
  const filteredRoadsideProviders = useMemo(() => {
    return INDEXED_ROADSIDE_PROVIDERS.filter((p) => {
      const matchesCategory =
        selectedRoadsideCategory === 'ALL' || p.category === selectedRoadsideCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(roadsideSearch.toLowerCase()) ||
        p.coverage.toLowerCase().includes(roadsideSearch.toLowerCase()) ||
        p.servicesOffered.some((s) => s.toLowerCase().includes(roadsideSearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [roadsideSearch, selectedRoadsideCategory]);

  // Total Defects Count
  const currentDefectsList = useMemo(() => {
    const list: DvirDefectItem[] = [];
    FMCSA_INSPECTION_ZONES.forEach((zone) => {
      zone.checkItems.forEach((item) => {
        const state = itemCheckState[item.id];
        if (state && !state.passed) {
          list.push({
            id: `def-${item.id}`,
            component: `${zone.title}: ${item.name}`,
            description: state.note || 'Defect noted during driver walk-around inspection.',
            severity: state.severity || 'SAFETY_DEFECT',
            resolved: false,
          });
        }
      });
    });
    return list;
  }, [itemCheckState]);

  // Overall Status
  const computedStatus = useMemo(() => {
    const hasOos = currentDefectsList.some((d) => d.severity === 'OUT_OF_SERVICE');
    if (hasOos) return 'UNSAFE';
    if (currentDefectsList.length > 0) return 'DEFECTS_CORRECTED';
    return 'SATISFACTORY';
  }, [currentDefectsList]);

  // Toggle item passed/failed
  const handleToggleItem = (itemId: string, passed: boolean, severity?: 'OUT_OF_SERVICE' | 'SAFETY_DEFECT' | 'MINOR_COSMETIC') => {
    setItemCheckState((prev) => ({
      ...prev,
      [itemId]: {
        passed,
        note: passed ? '' : prev[itemId]?.note || '',
        severity: passed ? undefined : severity || 'SAFETY_DEFECT',
      },
    }));
    triggerHapticFeedback(passed ? 'tick' : 'alert');
  };

  // Set note for an item
  const handleItemNoteChange = (itemId: string, note: string) => {
    setItemCheckState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        note,
      },
    }));
  };

  // Pass all items in the current zone
  const handlePassAllInZone = (zone: (typeof FMCSA_INSPECTION_ZONES)[0]) => {
    setItemCheckState((prev) => {
      const next = { ...prev };
      zone.checkItems.forEach((chk) => {
        next[chk.id] = { passed: true, note: '' };
      });
      return next;
    });
    triggerHapticFeedback('success');
  };

  // Handle local file photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: DvirPhotoAttachment = {
            id: `photo-${Date.now()}`,
            url: event.target.result as string,
            caption: newPhotoCaption || file.name,
            zone: selectedZoneForPhoto,
            timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            fileName: file.name,
          };
          setPhotos((prev) => [newPhoto, ...prev]);
          setNewPhotoCaption('');
          triggerHapticFeedback('success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    triggerHapticFeedback('tick');
  };

  // Send message to Dispatch & Fleet Manager
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: DvirDispatchMessage = {
      id: `msg-${Date.now()}`,
      sender: 'DRIVER',
      senderName: `${driverName} (${unitNumber})`,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = saveDvirDispatchMessage(newMsg);
    setMessages(updated);
    setChatInput('');
    triggerHapticFeedback('subtle');

    // Simulated fleet manager live reply
    setTimeout(() => {
      const replyMsg: DvirDispatchMessage = {
        id: `msg-rep-${Date.now()}`,
        sender: 'FLEET_MANAGER',
        senderName: 'Dave Miller (Safety Director)',
        text: `Copy that Marcus. Safety desk acknowledged your update for ${unitNumber}. Proceed with safety protocols.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(saveDvirDispatchMessage(replyMsg));
    }, 1500);
  };

  // Submit and certify the full DVIR
  const handleSubmitDvir = () => {
    if (!isSigned) {
      triggerHapticFeedback('alert');
      alert('Please check the driver electronic signature certification box before submitting.');
      return;
    }

    const itemsSummary = FMCSA_INSPECTION_ZONES.flatMap((zone) =>
      zone.checkItems.map((chk) => ({
        name: chk.name,
        passed: itemCheckState[chk.id]?.passed ?? true,
        note: itemCheckState[chk.id]?.note,
        zone: zone.title,
      }))
    );

    const record: DvirInspection = {
      id: `dvir-${Date.now()}`,
      inspectionType,
      timestamp: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      unitNumber,
      trailerNumber,
      driverName,
      odometer,
      defectsFound: currentDefectsList.length > 0,
      status: computedStatus,
      itemsChecked: itemsSummary,
      defectsList: currentDefectsList,
      photos,
      driverNotes,
      mechanicNotes: 'Pre-trip certified clean under FMCSA 49 CFR § 396.11 / § 396.13.',
      priorDayRefId: INITIAL_PRIOR_DAY_DVIR_MEMORY.priorDvirId,
      priorDayDefectsAcknowledged: priorDayAcknowledged,
      signatureVerified: true,
      certifiedSafeToOperate: computedStatus !== 'UNSAFE',
    };

    const updatedRecords = saveDvirRecord(record);
    triggerHapticFeedback('success');

    // Trigger same-day mandatory export per FMCSA 49 CFR § 396.11
    const exportResult = compileAndExportDailyDvir(record, updatedRecords);
    setActiveDailyExportPackage(exportResult.exportPackage);
    setIsDailyExportModalOpen(true);

    setSubmitSuccessMessage(
      `DVIR ${record.inspectionType} #${record.id.slice(-6)} recorded into FMCSA compliance ledger! Mandatory same-day export package #${exportResult.exportPackage.exportId} compiled with cryptographic SHA-256 seal.`
    );
  };

  // Submit Emergency Breakdown Ticket
  const handleSubmitBreakdown = () => {
    const selectedProvider = INDEXED_ROADSIDE_PROVIDERS.find((p) => p.id === assignedProviderId);
    const newTicket: BreakdownIncidentTicket = {
      id: `BD-${Date.now().toString(36).toUpperCase()}`,
      driverName,
      unitNumber,
      trailerNumber,
      highwayLocation: breakdownLocation,
      gpsCoords: { lat: 41.5868, lng: -93.625 },
      breakdownCategory: breakdownType,
      urgency: breakdownUrgency,
      description: breakdownDescription,
      assignedProviderId,
      assignedProviderName: selectedProvider ? `${selectedProvider.name} (${selectedProvider.tollFreePhone})` : 'FleetNet America',
      dispatchConfirmed: true,
      fleetManagerAlerted: true,
      status: 'DISPATCHED',
      createdAt: new Date().toISOString(),
    };

    const updated = saveBreakdownTicket(newTicket);
    setActiveTickets(updated);
    triggerHapticFeedback('alert');
    setBreakdownSuccessMsg(
      `🚨 EMERGENCY BREAKDOWN TICKET #${newTicket.id} TRANSMITTED. Paged ${newTicket.assignedProviderName} and alerted Fleet Manager Dave Miller.`
    );
  };

  // Copy phone number helper
  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    triggerHapticFeedback('tick');
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const currentZone = FMCSA_INSPECTION_ZONES[activeZoneIndex];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24 print:p-0 print:m-0 print:max-w-none text-slate-100 font-mono">
      {/* Top Banner Header */}
      <div className="bg-[#121318] border border-[#262838] rounded-2xl p-5 shadow-2xl print:hidden relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] shadow-inner shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#C9A84C] uppercase">
                  // AUTONOMOUS ROADSIDE &amp; FLEET SAFETY
                </span>
                <span className="px-2 py-0.5 rounded bg-[#C9A84C]/15 text-[#C9A84C] text-[10px] font-mono font-bold border border-[#C9A84C]/30">
                  FMCSA 49 CFR § 396.11 / § 396.13
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  PRIOR DAY MEMORY ACTIVE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-0.5">
                PRE/POST-TRIP AUTONOMOUS DVIR AGENT
              </h1>
              <p className="text-xs text-[#8E92A4] mt-0.5 max-w-3xl">
                Interactive walk-around inspection agent, automated previous-day defect cross-referencing, dispatch photo wire, and 24/7 nationwide roadside breakdown rescue.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap bg-[#0B0C10] p-1.5 rounded-xl border border-[#262838] text-xs font-bold">
            <button
              onClick={() => {
                setActiveView('INSPECTION');
                triggerHapticFeedback('subtle');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeView === 'INSPECTION'
                  ? 'bg-[#C9A84C] text-black font-black shadow-lg shadow-[#C9A84C]/20'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Inspection Zones</span>
            </button>

            <button
              onClick={() => {
                setActiveView('PRIOR_MEMORY');
                triggerHapticFeedback('subtle');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeView === 'PRIOR_MEMORY'
                  ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-black shadow'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Prior Day Memory</span>
            </button>

            <button
              onClick={() => {
                setActiveView('DISPATCH_WIRE');
                triggerHapticFeedback('subtle');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeView === 'DISPATCH_WIRE'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Dispatch Wire ({messages.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveView('ROADSIDE_RESCUE');
                triggerHapticFeedback('subtle');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeView === 'ROADSIDE_RESCUE'
                  ? 'bg-rose-600 text-white font-black shadow animate-pulse'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>24/7 Breakdown</span>
            </button>

            <button
              onClick={() => {
                setActiveView('HISTORY_LOGS');
                triggerHapticFeedback('subtle');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeView === 'HISTORY_LOGS'
                  ? 'bg-purple-600 text-white font-black shadow'
                  : 'text-[#8E92A4] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit History</span>
            </button>

            <button
              onClick={() => {
                const dvirList = getStoredDvirRecords();
                if (dvirList.length > 0) {
                  const exportResult = compileAndExportDailyDvir(dvirList[0], dvirList);
                  setActiveDailyExportPackage(exportResult.exportPackage);
                  setIsDailyExportModalOpen(true);
                  triggerHapticFeedback('success');
                }
              }}
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all bg-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black border border-[#C9A84C]/40 font-bold"
              title="View today's mandatory DVIR export manifest"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Today&apos;s DVIR</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HANDS-FREE WEB SPEECH API VOICE COMMAND CONTROLLER (PRE-TRIP & ROADSIDE)  */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#121318] via-[#161824] to-[#121318] border border-[#C9A84C]/40 rounded-2xl p-4 shadow-xl print:hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Microphone Status & Live Transcript */}
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <button
              onClick={toggleVoiceListener}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg shrink-0 ${
                isVoiceListening
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/30 shadow-red-500/50'
                  : 'bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 border border-[#C9A84C]/40 hover:scale-105'
              }`}
              title={isVoiceListening ? 'Stop Voice Command Listener' : 'Activate Web Speech Voice Commands'}
            >
              {isVoiceListening ? <MicOff className="w-6 h-6 animate-bounce" /> : <Mic className="w-6 h-6" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs uppercase tracking-wider text-[#C9A84C] flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isVoiceListening ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                  {isVoiceListening ? 'VOICE LISTENER ACTIVE (WEB SPEECH API)' : 'HANDS-FREE IN-CAB VOICE SENTINEL'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#0B0C10] text-[#A0A4B8] text-[10px] font-mono border border-[#262838]">
                  49 CFR § 392.82 HANDS-FREE
                </span>
                {voiceTranscript && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[11px] font-mono border border-emerald-800/60 truncate max-w-xs">
                    "{voiceTranscript}"
                  </span>
                )}
              </div>

              <div className="text-xs text-[#A0A4B8] mt-1 truncate">
                {voiceInterimTranscript ? (
                  <span className="text-[#C9A84C] italic font-mono animate-pulse">Hearing: "{voiceInterimTranscript}"...</span>
                ) : voiceStatusMsg ? (
                  <span className="text-slate-200">{voiceStatusMsg}</span>
                ) : (
                  <span className="text-[#7E8B9B]">
                    Say <strong className="text-white">"Start Pre-Trip"</strong>, <strong className="text-white">"Report Breakdown"</strong>, <strong className="text-white">"Pass Zone"</strong>, or <strong className="text-white">"Tire Blowout"</strong> to command by voice.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: TTS Audio Toggle & Quick Voice Simulator Chips */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
            <button
              onClick={() => {
                setIsTtsEnabled(!isTtsEnabled);
                triggerHapticFeedback('tick');
              }}
              className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                isTtsEnabled
                  ? 'bg-[#181A24] text-emerald-300 border-emerald-500/40 hover:bg-[#222534]'
                  : 'bg-[#0B0C10] text-[#7E8B9B] border-[#262838] hover:text-white'
              }`}
              title={isTtsEnabled ? 'Mute Speech Synthesis Audio Feedback' : 'Enable Speech Synthesis Audio Feedback'}
            >
              {isTtsEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[11px] font-bold">{isTtsEnabled ? 'AUDIO TTS ON' : 'TTS MUTED'}</span>
            </button>

            {/* Quick Test Voice Triggers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleProcessVoiceCommand('Start Pre-Trip Inspection')}
                className="px-2.5 py-1 rounded-lg bg-[#181A24] hover:bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-all hover:scale-105 active:scale-95"
              >
                🎙️ "Start Pre-Trip"
              </button>
              <button
                onClick={() => handleProcessVoiceCommand('Report Roadside Issue Tire Blowout')}
                className="px-2.5 py-1 rounded-lg bg-[#181A24] hover:bg-rose-950 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-all hover:scale-105 active:scale-95"
              >
                🚨 "Tire Blowout"
              </button>
              <button
                onClick={() => handleProcessVoiceCommand('Pass Zone')}
                className="px-2.5 py-1 rounded-lg bg-[#181A24] hover:bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30 text-[11px] font-medium transition-all hover:scale-105 active:scale-95"
              >
                ✅ "Pass Zone"
              </button>
              <button
                onClick={() => handleProcessVoiceCommand('Check Prior Day')}
                className="px-2.5 py-1 rounded-lg bg-[#181A24] hover:bg-amber-950 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-all hover:scale-105 active:scale-95"
              >
                📋 "Prior Day"
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prior Day Memory Notification Strip (Persistent across views) */}
      <div className="bg-gradient-to-r from-[#161824] via-[#121318] to-[#121318] border border-[#C9A84C]/30 rounded-2xl p-4 shadow-lg text-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#C9A84C] uppercase tracking-wider text-[11px]">
                  Prior Day DVIR Memory Cross-Reference (49 CFR § 396.13)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#0B0C10] text-[#C9A84C] border border-[#262838] text-[10px] font-mono">
                  {INITIAL_PRIOR_DAY_DVIR_MEMORY.priorDate}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                  {INITIAL_PRIOR_DAY_DVIR_MEMORY.defectsNoted.length} Defects Serviced by Shop
                </span>
              </div>
              <p className="text-[#A0A4B8] mt-1">
                <strong>Yesterday's Post-Trip ({INITIAL_PRIOR_DAY_DVIR_MEMORY.unitNumber})</strong> recorded 3 items:{' '}
                <em>Right trailer brake line scuffing, left steer tire pressure (96 PSI), and driver wiper blade.</em>{' '}
                <span className="text-emerald-400 font-semibold">
                  Mechanic Jake Reynolds certified all repairs completed under Work Order #WO-88421.
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setShowPriorDayDetails(!showPriorDayDetails);
                triggerHapticFeedback('tick');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#181A24] hover:bg-[#202330] border border-[#3A3D52] text-[#C9A84C] font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showPriorDayDetails ? 'Hide Shop Certification' : 'View Shop Certification'}</span>
            </button>
            <button
              onClick={() => {
                setActiveView('PRIOR_MEMORY');
                triggerHapticFeedback('subtle');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-black text-xs flex items-center gap-1.5 shadow"
            >
              <span>Verify &amp; Acknowledge</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Prior Day Work Order Details */}
        {showPriorDayDetails && (
          <div className="mt-3 pt-3 border-t border-[#262838] bg-[#0B0C10] rounded-xl p-3 space-y-2 text-[#A0A4B8]">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#7E8B9B] border-b border-[#202230] pb-1">
              <span>WORK ORDER: {INITIAL_PRIOR_DAY_DVIR_MEMORY.mechanicCertification.workOrderNumber}</span>
              <span>CERTIFIED: {INITIAL_PRIOR_DAY_DVIR_MEMORY.mechanicCertification.repairDate}</span>
              <span className="text-emerald-400">STATUS: CERTIFIED SAFE FOR DISPATCH</span>
            </div>
            <p className="text-xs text-slate-200">
              {INITIAL_PRIOR_DAY_DVIR_MEMORY.mechanicCertification.certificationNote}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
              {INITIAL_PRIOR_DAY_DVIR_MEMORY.defectsNoted.map((def) => (
                <div key={def.id} className="bg-[#121318] border border-[#262838] rounded-lg p-2">
                  <div className="font-bold text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{def.component}</span>
                  </div>
                  <div className="text-[10px] text-[#7E8B9B] mt-1">{def.resolutionNote}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VIEW: 1. ACTIVE INSPECTION ZONES */}
      {activeView === 'INSPECTION' && (
        <div className="space-y-6">
          {/* Inspection Metadata Bar */}
          <div className="bg-[#121318] border border-[#262838] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                Inspection Type
              </label>
              <div className="grid grid-cols-2 gap-1 bg-[#0B0C10] p-1 rounded-xl border border-[#262838]">
                <button
                  type="button"
                  onClick={() => {
                    setInspectionType('PRE_TRIP');
                    triggerHapticFeedback('tick');
                  }}
                  className={`py-1 rounded-lg text-center font-bold text-xs transition-all ${
                    inspectionType === 'PRE_TRIP'
                      ? 'bg-[#C9A84C] text-black font-black shadow'
                      : 'text-[#8E92A4] hover:text-white'
                  }`}
                >
                  PRE-TRIP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInspectionType('POST_TRIP');
                    triggerHapticFeedback('tick');
                  }}
                  className={`py-1 rounded-lg text-center font-bold text-xs transition-all ${
                    inspectionType === 'POST_TRIP'
                      ? 'bg-amber-500 text-black font-black shadow'
                      : 'text-[#8E92A4] hover:text-white'
                  }`}
                >
                  POST-TRIP
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                Tractor Unit #
              </label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                Trailer Unit #
              </label>
              <input
                type="text"
                value={trailerNumber}
                onChange={(e) => setTrailerNumber(e.target.value)}
                className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                Odometer (Miles)
              </label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                Driver Name (CDL)
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {/* Interactive Walk-Around Zone Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {FMCSA_INSPECTION_ZONES.map((zone, idx) => {
              const zoneItems = zone.checkItems;
              const hasDefects = zoneItems.some((chk) => !itemCheckState[chk.id]?.passed);
              const isActive = activeZoneIndex === idx;

              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setActiveZoneIndex(idx);
                    triggerHapticFeedback('subtle');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                    isActive
                      ? 'bg-[#1C1E2A] border-[#C9A84C] text-white shadow-lg ring-1 ring-[#C9A84C]'
                      : 'bg-[#121318] border-[#262838] text-[#8E92A4] hover:border-[#3A3D52]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#C9A84C]">
                      ZONE {zone.zoneNumber}
                    </span>
                    {hasDefects ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="font-bold text-xs line-clamp-1 text-white">{zone.title}</div>
                  <div className="text-[10px] text-[#7E8B9B] mt-1 font-mono">
                    {zoneItems.length} inspection points
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Inspection Zone Card */}
          <div className="bg-[#121318] border border-[#262838] rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#202230] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-mono font-bold rounded border border-[#C9A84C]/30">
                    ZONE {currentZone.zoneNumber} OF 7
                  </span>
                  <h2 className="text-lg font-bold text-white">{currentZone.title}</h2>
                </div>
                <p className="text-xs text-[#8E92A4] mt-0.5">{currentZone.subtitle}</p>
                <div className="text-[11px] text-[#C9A84C]/90 font-mono mt-1">
                  Statute: {currentZone.fmcsaStatute}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePassAllInZone(currentZone)}
                  className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pass All In Zone {currentZone.zoneNumber}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedZoneForPhoto(currentZone.title);
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-2 rounded-xl bg-[#181A24] hover:bg-[#202330] border border-[#262838] text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-4 h-4 text-[#C9A84C]" />
                  <span>Attach Zone Photo</span>
                </button>
              </div>
            </div>

            {/* Check Items in Active Zone */}
            <div className="space-y-3">
              {currentZone.checkItems.map((item) => {
                const itemState = itemCheckState[item.id] || { passed: true, note: '' };
                const isPassed = itemState.passed;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isPassed
                        ? 'bg-[#0B0C10] border-[#262838] hover:border-[#3A3D52]'
                        : 'bg-rose-950/20 border-rose-500/40 shadow-md'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1 max-w-3xl">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isPassed ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'
                            }`}
                          />
                          <span className="font-bold text-sm text-white">{item.name}</span>
                        </div>
                        <p className="text-xs text-[#8E92A4] leading-relaxed">{item.description}</p>
                        <div className="text-[10px] text-amber-400/80 font-mono">
                          CVSA Out-of-Service Rule: {item.criticalOosRule}
                        </div>
                      </div>

                      {/* Action Pass / Defect Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id, true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                            isPassed
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow'
                              : 'bg-[#121318] text-[#7E8B9B] border-[#262838] hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASSED</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id, false, 'SAFETY_DEFECT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                            !isPassed && itemState.severity !== 'OUT_OF_SERVICE'
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow'
                              : 'bg-[#121318] text-[#7E8B9B] border-[#262838] hover:text-amber-400'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>DEFECT</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id, false, 'OUT_OF_SERVICE')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                            !isPassed && itemState.severity === 'OUT_OF_SERVICE'
                              ? 'bg-rose-600 text-white border-rose-400 font-black shadow animate-pulse'
                              : 'bg-[#121318] text-[#7E8B9B] border-[#262838] hover:text-rose-400'
                          }`}
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>OOS CRITICAL</span>
                        </button>
                      </div>
                    </div>

                    {/* Defect Note Input if Failed */}
                    {!isPassed && (
                      <div className="mt-3 pt-3 border-t border-rose-500/20 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Specify Defect Description for Maintenance &amp; Fleet Dispatch:
                          </span>
                          <span className="text-[10px] font-mono text-[#8E92A4]">
                            Severity: {itemState.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Scuffed airline, low tire pressure (92 PSI), loose mirror bracket..."
                            value={itemState.note}
                            onChange={(e) => handleItemNoteChange(item.id, e.target.value)}
                            className="flex-1 bg-[#0B0C10] border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleStartDefectDictation(item.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                              isDictatingDefect && dictatingItemId === item.id
                                ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
                                : 'bg-[#181A24] hover:bg-[#202330] text-[#FFE600] border border-[#FFE600]/40'
                            }`}
                            title="Dictate with gemini-3.5-transcribe"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>
                              {isDictatingDefect && dictatingItemId === item.id
                                ? 'Recording... (Tap to Send)'
                                : 'Mic Dictate (3.5)'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Navigation for Zones */}
            <div className="flex items-center justify-between pt-4 border-t border-[#202230]">
              <button
                disabled={activeZoneIndex === 0}
                onClick={() => {
                  setActiveZoneIndex((prev) => Math.max(0, prev - 1));
                  triggerHapticFeedback('subtle');
                }}
                className="px-4 py-2 rounded-xl bg-[#181A24] hover:bg-[#202330] disabled:opacity-30 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 text-white"
              >
                <span>← Previous Zone</span>
              </button>

              <span className="text-xs font-mono text-[#8E92A4]">
                Zone {activeZoneIndex + 1} of {FMCSA_INSPECTION_ZONES.length}
              </span>

              <button
                disabled={activeZoneIndex === FMCSA_INSPECTION_ZONES.length - 1}
                onClick={() => {
                  setActiveZoneIndex((prev) => Math.min(FMCSA_INSPECTION_ZONES.length - 1, prev + 1));
                  triggerHapticFeedback('subtle');
                }}
                className="px-4 py-2 rounded-xl bg-[#C9A84C] hover:bg-[#D4AF37] disabled:opacity-30 disabled:pointer-events-none text-xs font-black text-black flex items-center gap-1.5 shadow"
              >
                <span>Next Zone →</span>
              </button>
            </div>
          </div>

          {/* Defect Photo Upload Gallery */}
          <div className="bg-[#121318] border border-[#262838] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#C9A84C]" />
                <h3 className="font-bold text-sm text-white">
                  Inspection Defect Photo Proof Gallery ({photos.length})
                </h3>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-black text-xs flex items-center gap-1.5 shadow"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Defect Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {photos.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-[#262838] rounded-2xl text-center text-[#7E8B9B] text-xs">
                No defect photos attached. Click &quot;Upload Defect Photo&quot; to attach camera evidence for Fleet Maintenance &amp; Dispatch.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-[#0B0C10] border border-[#262838] rounded-xl overflow-hidden group relative flex flex-col justify-between"
                  >
                    <div className="h-36 w-full bg-[#121318] overflow-hidden relative">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-[#C9A84C]">
                        {photo.zone}
                      </div>
                    </div>
                    <div className="p-2.5 text-xs space-y-1">
                      <p className="font-bold text-white line-clamp-1">{photo.caption}</p>
                      <div className="text-[10px] text-[#7E8B9B] font-mono">{photo.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Driver Certification & Sign-off Card */}
          <div className="bg-[#121318] border border-[#262838] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#202230] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#C9A84C]" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Driver Electronic DVIR Certification (49 CFR § 396.11 / § 396.13)
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  computedStatus === 'SATISFACTORY'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : computedStatus === 'DEFECTS_CORRECTED'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                VEHICLE CONDITION: {computedStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                    Driver Remarks / Operational Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter any additional driver remarks, route observations, or mechanic repair notes..."
                    value={driverNotes}
                    onChange={(e) => setDriverNotes(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#161824] border border-[#C9A84C]/30 text-[#A0A4B8] text-xs flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="chk-prior-ack"
                    checked={priorDayAcknowledged}
                    onChange={(e) => {
                      setPriorDayAcknowledged(e.target.checked);
                      triggerHapticFeedback('tick');
                    }}
                    className="mt-0.5 rounded text-[#C9A84C] focus:ring-0 accent-[#C9A84C]"
                  />
                  <label htmlFor="chk-prior-ack" className="cursor-pointer leading-relaxed">
                    <strong className="text-white">Prior Day DVIR Review:</strong> I certify that I have reviewed the prior day&apos;s inspection report for Unit #{unitNumber} and acknowledge that all noted safety defects were certified corrected or deemed non-critical by fleet maintenance prior to departure (49 CFR § 396.13(c)).
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                    Electronic Signature Pad
                  </label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#14221A] border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="chk-sign"
                    checked={isSigned}
                    onChange={(e) => {
                      setIsSigned(e.target.checked);
                      triggerHapticFeedback('tick');
                    }}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-0 accent-emerald-500"
                  />
                  <label htmlFor="chk-sign" className="cursor-pointer leading-relaxed">
                    <strong className="text-white">Driver Attestation:</strong> Under penalty of perjury, I certify that I have completed this {inspectionType} vehicle inspection in accordance with FMCSA 49 CFR Part 396, and the vehicle is in safe operating condition.
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleSubmitDvir}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E5C158] hover:opacity-95 text-black font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Submit &amp; Certify {inspectionType} DVIR</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerHapticFeedback('success');
                      window.print();
                    }}
                    className="px-4 py-3 rounded-xl bg-[#181A24] hover:bg-[#202330] text-[#A0A4B8] font-bold text-xs flex items-center gap-1.5 border border-[#262838]"
                    title="Print DVIR report"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submission Confirmation Alert */}
            {submitSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-xl animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{submitSuccessMessage}</span>
                </div>
                <button
                  onClick={() => setSubmitSuccessMessage(null)}
                  className="px-2 py-1 bg-emerald-900 rounded text-[10px] font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: 2. PRIOR DAY MEMORY BASE */}
      {activeView === 'PRIOR_MEMORY' && (
        <div className="bg-[#121318] border border-[#262838] rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202230] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#C9A84C]/15 text-[#C9A84C] font-mono font-bold text-xs border border-[#C9A84C]/30">
                  MEMORY BASE ACTIVE
                </span>
                <h2 className="text-xl font-bold text-white">
                  Previous Day DVIR History &amp; Repair Verification
                </h2>
              </div>
              <p className="text-xs text-[#8E92A4] mt-1">
                Automated recall of previous driver entries, defect history, shop work orders, and mechanic repair certifications per 49 CFR § 396.11(a)(3).
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              ✓ MECHANIC SIGN-OFF VERIFIED
            </div>
          </div>

          {/* Historical Record Card */}
          <div className="bg-[#0B0C10] border border-[#C9A84C]/30 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202230] pb-3 text-xs font-mono">
              <span className="text-[#C9A84C] font-bold">
                RECORD ID: {INITIAL_PRIOR_DAY_DVIR_MEMORY.priorDvirId}
              </span>
              <span className="text-[#8E92A4]">
                DATE: {INITIAL_PRIOR_DAY_DVIR_MEMORY.priorDate} ({INITIAL_PRIOR_DAY_DVIR_MEMORY.priorType})
              </span>
              <span className="text-[#A0A4B8]">
                ODOMETER: {INITIAL_PRIOR_DAY_DVIR_MEMORY.priorOdometer.toLocaleString()} MI
              </span>
              <span className="text-emerald-400 font-bold">
                DRIVER: {INITIAL_PRIOR_DAY_DVIR_MEMORY.driverName}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#8E92A4] uppercase tracking-wider mb-2">
                Driver Notes Logged on Prior Day:
              </h4>
              <p className="text-xs text-white bg-[#121318] p-3 rounded-xl border border-[#262838] italic">
                &quot;{INITIAL_PRIOR_DAY_DVIR_MEMORY.driverNotes}&quot;
              </p>
            </div>

            {/* Defects Table */}
            <div>
              <h4 className="text-xs font-bold text-[#8E92A4] uppercase tracking-wider mb-2">
                Defects Logged &amp; Shop Resolution Matrix:
              </h4>
              <div className="space-y-2">
                {INITIAL_PRIOR_DAY_DVIR_MEMORY.defectsNoted.map((defect) => (
                  <div
                    key={defect.id}
                    className="p-3.5 rounded-xl bg-[#121318] border border-[#262838] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{defect.component}</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono">
                          {defect.severity}
                        </span>
                      </div>
                      <p className="text-[#8E92A4] text-[11px]">{defect.description}</p>
                      <div className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolution: {defect.resolutionNote}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-[#7E8B9B] font-mono">Serviced By:</div>
                      <div className="font-bold text-[#A0A4B8] text-xs">{defect.resolvedBy}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-mono">
                        VERIFIED FIXED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mechanic Official Certification Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#14221A] to-[#121318] border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
                <span className="font-bold">FMCSA § 396.11(a)(3) MECHANIC CERTIFICATION OF REPAIR</span>
                <span>WO #{INITIAL_PRIOR_DAY_DVIR_MEMORY.mechanicCertification.workOrderNumber}</span>
              </div>
              <p className="text-xs text-slate-200">
                {INITIAL_PRIOR_DAY_DVIR_MEMORY.mechanicCertification.certificationNote}
              </p>
              <div className="text-[11px] text-[#8E92A4] font-mono pt-1">
                Certified Technician: <strong className="text-white">{INITIAL_PRIOR_DAY_DVIR_MEMORY.mechanicCertification.repairedBy}</strong> · Timestamp: {INITIAL_PRIOR_DAY_DVIR_MEMORY.mechanicCertification.repairDate}
              </div>
            </div>

            {/* Permanent Repair History Memory for this Unit */}
            <div className="pt-4 border-t border-[#202230] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Permanent Repair History Memory for {unitNumber} ({storedPastRepairsList.filter(r => r.unitNumber === unitNumber).length} Work Orders)</span>
                </h4>
                <span className="text-[10px] text-[#8E92A4] font-mono">Retained per 49 CFR § 396.11</span>
              </div>

              <div className="space-y-2">
                {storedPastRepairsList
                  .filter((r) => r.unitNumber === unitNumber)
                  .map((wo) => (
                    <div
                      key={wo.id}
                      className="p-3 bg-[#121318] border border-[#262838] rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{wo.id} · {wo.componentItem}</span>
                        <span className="text-emerald-400 font-bold font-mono">${wo.totalCost.toFixed(2)}</span>
                      </div>
                      <p className="text-[#A0A4B8] text-[11px]">{wo.workPerformed}</p>
                      <div className="text-[10px] text-[#8E92A4] font-mono flex items-center justify-between pt-1">
                        <span>Tech: {wo.technicianName} ({wo.shopOrVendor})</span>
                        <span className="text-[#7E8B9B]">Seal: {wo.integritySha256Hash.slice(0, 16)}...</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: 3. DISPATCH & FLEET MANAGER DIRECT WIRE */}
      {activeView === 'DISPATCH_WIRE' && (
        <div className="bg-[#121318] border border-[#262838] rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202230] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Direct Fleet Manager &amp; Dispatch Wire
                </h2>
                <p className="text-xs text-[#8E92A4]">
                  Instant two-way messaging channel for DVIR defect reports, photo uploads, and shop maintenance authorisations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono text-emerald-400 font-bold">
                FLEET SAFETY DESK ONLINE
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="bg-[#0B0C10] border border-[#262838] rounded-2xl p-4 h-96 overflow-y-auto space-y-3">
            {messages.map((msg) => {
              const isDriver = msg.sender === 'DRIVER';
              const isSystem = msg.sender === 'SYSTEM_BOT';

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="p-2.5 rounded-xl bg-[#121318] border border-[#262838] text-center text-xs font-mono text-[#8E92A4]"
                  >
                    <span className="text-[#C9A84C] font-bold">[{msg.senderName}]</span> {msg.text} · <span className="text-[10px] text-[#7E8B9B]">{msg.timestamp}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isDriver ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8E92A4] font-mono">
                    <span className="font-bold text-[#A0A4B8]">{msg.senderName}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-lg text-xs leading-relaxed ${
                      isDriver
                        ? 'bg-[#C9A84C] text-black font-semibold rounded-br-none shadow'
                        : 'bg-[#181A24] text-white rounded-bl-none border border-[#262838]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Message Suggestions */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#7E8B9B] text-[10px] uppercase font-bold">Quick Templates:</span>
            {[
              'Pre-trip completed with zero defects. Rolling now.',
              'Defect photo uploaded for shop review.',
              'Confirming 5th wheel lock check and brake pressure test.',
              'Requesting mobile tech callback for trailer lighting.',
            ].map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => setChatInput(tmpl)}
                className="px-2.5 py-1 rounded-lg bg-[#181A24] hover:bg-[#202330] border border-[#262838] text-[#C9A84C] text-[11px]"
              >
                {tmpl}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message or defect update to Safety Director & Dispatch..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              className="flex-1 bg-[#0B0C10] border border-[#262838] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A84C]"
            />
            <button
              onClick={handleSendChatMessage}
              className="px-5 py-3 rounded-xl bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-black text-xs flex items-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW: 4. 24/7 BREAKDOWN RESCUE & ROADSIDE DIRECTORY */}
      {activeView === 'ROADSIDE_RESCUE' && (
        <div className="space-y-6">
          {/* Emergency Breakdown Request Card */}
          <div className="bg-gradient-to-br from-rose-950/80 via-[#121318] to-[#121318] border-2 border-rose-500/60 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-rose-500/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 animate-pulse">
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">
                      Active Highway Breakdown &amp; Rescue Dispatcher
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-mono font-bold">
                      24/7 EMERGENCY
                    </span>
                  </div>
                  <p className="text-xs text-[#A0A4B8] mt-0.5">
                    Transmit immediate roadside incident tickets with live GPS coordinates, defect category, and direct provider paging.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-rose-300">
                HOTLINE: <a href="tel:18004388961" className="underline font-bold text-white">1-800-438-8961</a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                  Breakdown Category
                </label>
                <select
                  value={breakdownType}
                  onChange={(e) => setBreakdownType(e.target.value as any)}
                  className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-rose-400"
                >
                  <option value="TIRE_BLOWOUT">⚠️ Flat / Blown Tire (Steer / Drive / Trailer)</option>
                  <option value="AIR_LEAK_BRAKES">⚠️ Air System Leak / Frozen Brake Chamber</option>
                  <option value="ENGINE_DERATE_DEF">⚠️ Engine Derate / DEF Fault / Check Engine</option>
                  <option value="REEFER_ALARM">⚠️ Reefer Cooling Alarm / Temp Deviation</option>
                  <option value="ELECTRICAL_BATTERY">⚠️ Dead Batteries / Alternator / No Start</option>
                  <option value="TOWING_WRECKER">⚠️ Heavy Rotator Towing &amp; Wrecker Needed</option>
                  <option value="FUEL_ISSUE">⚠️ Fuel Gel / Contamination / Prime Needed</option>
                  <option value="OTHER">⚠️ Other Critical Mechanical Failure</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                  Urgency / Hazard Level
                </label>
                <select
                  value={breakdownUrgency}
                  onChange={(e) => setBreakdownUrgency(e.target.value as any)}
                  className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-rose-400"
                >
                  <option value="CRITICAL_HAZARD_OOS">🛑 Critical Roadway Hazard (Lane Blocked)</option>
                  <option value="HIGH_URGENT">⚠️ High Urgent (Shoulder Stopped / Temp Sensitive)</option>
                  <option value="STANDARD_ROADSIDE">ℹ️ Standard Roadside (Safe Travel Plaza / Ramp)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                  Highway Location / Mile Marker
                </label>
                <input
                  type="text"
                  value={breakdownLocation}
                  onChange={(e) => setBreakdownLocation(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                  Dispatch Roadside Network
                </label>
                <select
                  value={assignedProviderId}
                  onChange={(e) => setAssignedProviderId(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-rose-400"
                >
                  {INDEXED_ROADSIDE_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.tollFreePhone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E92A4] uppercase tracking-wider block mb-1">
                Detailed Incident Notes &amp; Symptoms
              </label>
              <textarea
                rows={2}
                value={breakdownDescription}
                onChange={(e) => setBreakdownDescription(e.target.value)}
                className="w-full bg-[#0B0C10] border border-[#262838] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-[#A0A4B8]">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>GPS Telemetry Attached: Lat 41.5868, Lng -93.625 (Des Moines, IA)</span>
              </div>

              <button
                onClick={handleSubmitBreakdown}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Flame className="w-4 h-4" />
                <span>Transmit Emergency Breakdown Ticket</span>
              </button>
            </div>

            {breakdownSuccessMsg && (
              <div className="p-4 rounded-xl bg-rose-950 border border-rose-500 text-rose-200 text-xs flex items-center justify-between gap-3">
                <span>{breakdownSuccessMsg}</span>
                <button
                  onClick={() => setBreakdownSuccessMsg(null)}
                  className="px-2 py-1 bg-rose-900 rounded text-[10px] font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Indexed Nationwide Roadside Directory Search Bar */}
          <div className="bg-[#121318] border border-[#262838] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#C9A84C]" />
                  <span>Nationwide 24/7 Roadside Assistance Network Index ({filteredRoadsideProviders.length})</span>
                </h3>
                <p className="text-xs text-[#8E92A4]">
                  Verified commercial truck rescue dispatchers, direct contact hotlines, service specializations, and typical arrival ETAs.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7E8B9B]" />
                  <input
                    type="text"
                    placeholder="Search by vendor, tire brand, service..."
                    value={roadsideSearch}
                    onChange={(e) => setRoadsideSearch(e.target.value)}
                    className="bg-[#0B0C10] border border-[#262838] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C9A84C] w-64"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedRoadsideCategory}
                  onChange={(e) => setSelectedRoadsideCategory(e.target.value)}
                  className="bg-[#0B0C10] border border-[#262838] rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#C9A84C]"
                >
                  <option value="ALL">All Categories</option>
                  <option value="NATIONWIDE_HEAVY_REPAIR">Heavy Repair &amp; Service</option>
                  <option value="TIRE_NETWORK">Tire Emergency Networks</option>
                  <option value="OEM_ENGINE">OEM Engine (Detroit / Cummins)</option>
                  <option value="REEFER_COOLING">Reefer (Thermo King / Carrier)</option>
                  <option value="TOWING_RECOVERY">Heavy Towing &amp; Rotator</option>
                </select>
              </div>
            </div>

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoadsideProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-[#0B0C10] border border-[#262838] rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-[#3A3D52] transition-all shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181A24] text-[#C9A84C] font-bold border border-[#262838]">
                          {provider.category.replace(/_/g, ' ')}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-1.5">{provider.name}</h4>
                      </div>
                      {provider.isPreferredFleetVendor && (
                        <span className="px-2 py-0.5 rounded bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 text-[9px] font-mono font-bold shrink-0">
                          PREFERRED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#8E92A4] leading-relaxed">{provider.notes}</p>

                    <div className="text-[11px] text-[#A0A4B8] space-y-1 pt-1 border-t border-[#1C1E2A]">
                      <div>
                        <strong className="text-[#8E92A4]">Coverage:</strong> {provider.coverage}
                      </div>
                      <div>
                        <strong className="text-[#8E92A4]">Avg Arrival ETA:</strong>{' '}
                        <span className="text-emerald-400 font-mono font-bold">{provider.averageEtaMinutes} min</span>
                      </div>
                    </div>

                    {/* Services list */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {provider.servicesOffered.slice(0, 3).map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-[#121318] border border-[#262838] text-[#8E92A4] text-[10px] rounded"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#202230] flex items-center justify-between gap-2">
                    <a
                      href={provider.directDial}
                      className="flex-1 py-2 rounded-xl bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{provider.tollFreePhone}</span>
                    </a>

                    <button
                      onClick={() => handleCopyPhone(provider.tollFreePhone, provider.id)}
                      className="p-2 rounded-xl bg-[#181A24] hover:bg-[#202330] text-[#A0A4B8] border border-[#262838]"
                      title="Copy phone number"
                    >
                      {copiedPhoneId === provider.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={provider.webPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#181A24] hover:bg-[#202330] text-[#A0A4B8] border border-[#262838]"
                      title="Open Web Portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: 5. HISTORY AUDIT LOGS */}
      {activeView === 'HISTORY_LOGS' && (
        <div className="bg-[#121318] border border-[#262838] rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#202230] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Historical DVIR Inspection Archive</h2>
              <p className="text-xs text-[#8E92A4] mt-0.5">
                Cryptographically-stamped FMCSA electronic inspection records preserved for DOT safety audits.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-[#181A24] hover:bg-[#202330] text-[#A0A4B8] text-xs font-bold flex items-center gap-1.5 border border-[#262838]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export All Logs</span>
            </button>
          </div>

          <div className="space-y-3">
            {getStoredDvirRecords().map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-[#0B0C10] border border-[#262838] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{rec.unitNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-[#181A24] font-mono text-[10px] text-[#A0A4B8] border border-[#262838]">
                      {rec.inspectionType}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        rec.status === 'SATISFACTORY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                  <div className="text-[#8E92A4] text-xs">
                    Driver: <strong className="text-white">{rec.driverName}</strong> · Odometer: <span className="font-mono">{rec.odometer.toLocaleString()} mi</span> · Timestamp: {rec.timestamp}
                  </div>
                  {rec.driverNotes && (
                    <p className="text-white text-[11px] italic bg-[#121318] p-2 rounded-lg border border-[#262838]">
                      &quot;{rec.driverNotes}&quot;
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0 font-mono text-[11px] text-[#8E92A4]">
                  <div>Signature Verified: <span className="text-emerald-400 font-bold">YES</span></div>
                  <div>Record ID: {rec.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Daily DVIR Export Modal */}
      <DvirDailyExportModal
        isOpen={isDailyExportModalOpen}
        onClose={() => setIsDailyExportModalOpen(false)}
        exportPackage={activeDailyExportPackage}
      />
    </div>
  );
};
