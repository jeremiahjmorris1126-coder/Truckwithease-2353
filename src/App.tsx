import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DesktopSidebar } from './components/DesktopSidebar';
import { BottomNav } from './components/BottomNav';
import { MasterLaunchOrchestratorView } from './components/MasterLaunchOrchestratorView';
import { AiAgentsView } from './components/AiAgentsView';
import { ParkingIntelligenceView } from './components/ParkingIntelligenceView';
import { HapticsSuiteView } from './components/HapticsSuiteView';
import { TraxesAdvocateView } from './components/TraxesAdvocateView';
import { StorefrontPackagingView } from './components/StorefrontPackagingView';
import { DispatchView } from './components/DispatchView';
import { HosView } from './components/HosView';
import { MaintenanceView } from './components/MaintenanceView';
import { IftaView } from './components/IftaView';
import { ComplianceView } from './components/ComplianceView';
import { HubView } from './components/HubView';
import { TelemetryView } from './components/TelemetryView';
import { ProvidersView } from './components/ProvidersView';
import { SecurityView } from './components/SecurityView';
import { InCabHubView } from './components/InCabHubView';
import { GoogleDriveView } from './components/GoogleDriveView';
import { GmailView } from './components/GmailView';
import { DriverHrOnboardingView } from './components/DriverHrOnboardingView';
import { AssetManagementView } from './components/AssetManagementView';
import { MessagingView } from './components/MessagingView';
import { CinemaLoungeView } from './components/CinemaLoungeView';
import { TutorialsGuideView } from './components/TutorialsGuideView';
import { SecurityVaultView } from './components/SecurityVaultView';
import { GoatLoadBoardView } from './components/GoatLoadBoardView';
import { LoadSheetsView } from './components/LoadSheetsView';
import { QuantumLoadOptimizerView } from './components/QuantumLoadOptimizerView';
import { EcosystemTrustHubView } from './components/EcosystemTrustHubView';
import { MobileCockpitView } from './components/MobileCockpitView';
import { CoreEngineConsoleView } from './components/CoreEngineConsoleView';
import { OverviewAdView } from './components/OverviewAdView';
import { TitanRldEquipmentAgentView } from './components/TitanRldEquipmentAgentView';
import { QuantumComplianceView } from './components/QuantumComplianceView';
import { DvirAutonomousAgentView } from './components/DvirAutonomousAgentView';
import { ExecutiveAdminView } from './components/ExecutiveAdminView';
import { InCabTelecomView } from './components/InCabTelecomView';
import { CBRadioView } from './components/CBRadioView';
import { DriverSafetyMeetingsView } from './components/DriverSafetyMeetingsView';
import { NonCdlOperationsSuiteView } from './components/NonCdlOperationsSuiteView';
import { DriverHeartbeatEngineView } from './components/DriverHeartbeatEngineView';
import { HighwaySamsaraMarketplaceView } from './components/HighwaySamsaraMarketplaceView';
import { ELDAuditView } from './components/ELDAuditView';
import { AzugaEldSalesPageView } from './components/AzugaEldSalesPageView';
import { FuelIdleEfficiencyView } from './components/FuelIdleEfficiencyView';
import { TollsAndBypassView } from './components/TollsAndBypassView';
import { InsurancePartnersView } from './components/InsurancePartnersView';
import { QuantumFleetInnovationsView } from './components/QuantumFleetInnovationsView';
import { NextGenInnovationsMasterDeck } from './components/NextGenInnovationsMasterDeck';
import { ExecutiveManagerReportsView } from './components/ExecutiveManagerReportsView';
import { AiStudioView } from './components/AiStudioView';
import { HealthChiefView } from './components/HealthChiefView';
import { FleetChiefMechanicView } from './components/FleetChiefMechanicView';
import { EaseRewardsView } from './components/EaseRewardsView';
import { RoadTestEvaluationView } from './components/RoadTestEvaluationView';
import { RoadsideInspectionsView } from './components/RoadsideInspectionsView';
import { ApexAvionicsView } from './components/ApexAvionicsView';
import { FeatureGovernanceModal } from './components/FeatureGovernanceModal';
import { WebhookLogsModal } from './components/WebhookLogsModal';
import { HighwayOAuthModal } from './components/HighwayOAuthModal';
import { ConnectIntegrationModal } from './components/ConnectIntegrationModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CarrierProfileModal } from './components/CarrierProfileModal';
import { DailyFunctionAuditModal } from './components/DailyFunctionAuditModal';
import { DnsDeploymentVerificationModal } from './components/DnsDeploymentVerificationModal';
import { AutonomousDiagnosticAgentModal } from './components/AutonomousDiagnosticAgentModal';
import { Prior7DaysInspectionDossierModal } from './components/Prior7DaysInspectionDossierModal';
import { InspectionMovingClipsModal } from './components/InspectionMovingClipsModal';
import { HReaseConsultationModal } from './components/HReaseConsultationModal';
import { VeoVideoGeneratorModal } from './components/VeoVideoGeneratorModal';
import { EcosystemMasterIndexModal } from './components/EcosystemMasterIndexModal';
import { BrandLogosModal } from './components/BrandLogosModal';
import { LiveFleetTickerBanner } from './components/LiveFleetTickerBanner';
import { FleetTickerAdminModal } from './components/FleetTickerAdminModal';
import {
  INITIAL_PIPELINES,
  INITIAL_WEBHOOK_LOGS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import {
  TabType,
  PipelineItem,
  WebhookLog,
  TacticalNotification,
  PinnedTelemetryStream,
  UserRoleType,
  AdminRevocationRecord,
  HaulerType,
} from './types';
import {
  AVAILABLE_TELEMETRY_STREAMS,
  getSavedPinnedStreams,
  savePinnedStreams,
} from './data/telemetryStreams';
import { isFeatureAllowedForUser } from './data/featureCatalog';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview-ad');
  const [pipelines, setPipelines] = useState<PipelineItem[]>(INITIAL_PIPELINES);
  const [pinnedStreams, setPinnedStreams] = useState<PinnedTelemetryStream[]>(() =>
    getSavedPinnedStreams()
  );
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>(INITIAL_WEBHOOK_LOGS);
  const [notifications, setNotifications] = useState<TacticalNotification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [latency, setLatency] = useState<number>(18);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  // Role & Feature Governance State
  const [userRole, setUserRole] = useState<UserRoleType>('admin');
  const [userId] = useState<string>('driver-104');
  const [userPreferences, setUserPreferences] = useState<Record<string, boolean>>({});
  const [adminRevocations, setAdminRevocations] = useState<Record<string, AdminRevocationRecord>>({});
  const [mandatoryFeatures, setMandatoryFeatures] = useState<TabType[]>([
    'hos',
    'dvir-agent',
    'telemetry',
    'messaging',
  ]);

  // Load initial governance data from backend
  const fetchGovernance = async () => {
    try {
      const res = await fetch(`/api/features/governance?userId=${userId}&role=${userRole}`);
      if (res.ok) {
        const data = await res.json();
        setUserPreferences(data.userPreferences || {});
        setAdminRevocations(data.adminRevocations || {});
        if (data.mandatoryLockedFeatures) {
          setMandatoryFeatures(data.mandatoryLockedFeatures);
        }
      }
    } catch (err) {
      console.warn('Failed to load governance configuration from backend:', err);
    }
  };

  useEffect(() => {
    fetchGovernance();
  }, [userRole, userId]);

  // Modals state
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState<boolean>(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState<boolean>(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDailyAuditModalOpen, setIsDailyAuditModalOpen] = useState<boolean>(false);
  const [isGovernanceModalOpen, setIsGovernanceModalOpen] = useState<boolean>(false);
  const [isDnsModalOpen, setIsDnsModalOpen] = useState<boolean>(false);
  const [isDiagnosticAgentModalOpen, setIsDiagnosticAgentModalOpen] = useState<boolean>(false);
  const [isPrior7DaysDossierOpen, setIsPrior7DaysDossierOpen] = useState<boolean>(false);
  const [isMovingClipsModalOpen, setIsMovingClipsModalOpen] = useState<boolean>(false);
  const [isHReaseModalOpen, setIsHReaseModalOpen] = useState<boolean>(false);
  const [isVeoVideoModalOpen, setIsVeoVideoModalOpen] = useState<boolean>(false);
  const [isEcosystemIndexModalOpen, setIsEcosystemIndexModalOpen] = useState<boolean>(false);
  const [ecosystemModalAutoTest, setEcosystemModalAutoTest] = useState<boolean>(false);
  const [isBrandLogosOpen, setIsBrandLogosOpen] = useState<boolean>(false);
  const [isTickerAdminOpen, setIsTickerAdminOpen] = useState<boolean>(false);
  const [isTickerVisible, setIsTickerVisible] = useState<boolean>(true);
  const [selectedHauler, setSelectedHauler] = useState<HaulerType | 'ALL'>('ALL');

  
  const handleOpenEcosystemIndex = (autoTest: boolean = false) => {
    setEcosystemModalAutoTest(autoTest);
    setIsEcosystemIndexModalOpen(true);
  };
  const handleShowToast = (msg: string) => {
    const newNotif: TacticalNotification = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      title: 'Ecosystem Event',
      description: msg,
      severity: 'info',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Pin / Unpin Telemetry Stream Handler
  const handleTogglePinStream = (streamId: string) => {
    setPinnedStreams((prev) => {
      const exists = prev.some((s) => s.id === streamId);
      let next: PinnedTelemetryStream[];
      if (exists) {
        next = prev.filter((s) => s.id !== streamId);
      } else {
        const target = AVAILABLE_TELEMETRY_STREAMS.find((s) => s.id === streamId);
        if (target) {
          next = [target, ...prev];
        } else {
          const pipe = pipelines.find((p) => p.id === streamId);
          if (pipe) {
            const newStream: PinnedTelemetryStream = {
              id: pipe.id,
              title: pipe.name,
              subtitle: pipe.subtitle,
              category: 'TELEMATICS',
              metricValue: `${pipe.latencyMs}ms`,
              metricLabel: pipe.status,
              statusLabel: pipe.status,
              statusCode: pipe.status === '200 OK' ? '200 OK' : 'ACTIVE',
              latencyMs: pipe.latencyMs,
              source: 'Integrated Mesh Pipeline',
              pinnedAt: new Date().toISOString(),
              targetTab: 'hub',
            };
            next = [newStream, ...prev];
          } else {
            next = prev;
          }
        }
      }
      savePinnedStreams(next);
      return next;
    });
  };

  // Tactical Poll All Action
  const handlePollAll = () => {
    setIsPolling(true);
    setTimeout(() => {
      const nextLatency = Math.floor(14 + Math.random() * 12);
      setLatency(nextLatency);
      setIsPolling(false);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
        now.getMilliseconds()
      ).padStart(3, '0')}`;

      const pollLog: WebhookLog = {
        id: `wh-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timeStr,
        source: 'Highway',
        event: 'mesh.heartbeat.poll_all',
        status: 200,
        latencyMs: nextLatency,
        payloadPreview: JSON.stringify({
          action: 'poll_all_nodes',
          status: 'ok',
          nodes_responded: pipelines.length,
          carrier_dot: '3928192',
        }),
        signature:
          'sha256=' +
          Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      };
      setWebhookLogs((prev) => [pollLog, ...prev]);
    }, 450);
  };

  const handleVerifyPipeline = (id: string) => {
    setPipelines((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: '200 OK',
              latencyMs: Math.floor(12 + Math.random() * 15),
              actionRequired: undefined,
              description: 'Hardware ingestion stream verified and bound to edge node.',
            }
          : item
      )
    );

    const newNotif: TacticalNotification = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      title: 'Samsara Cloud Connector Verified',
      description: 'Hardware telemetry stream authenticated. 200 OK node response.',
      severity: 'success',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleRenewPipeline = (id: string) => {
    setPipelines((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: '200 OK',
              latencyMs: Math.floor(14 + Math.random() * 20),
              actionRequired: undefined,
              description: 'Whisper Speech Relay token renewed. CB audio transcription active.',
            }
          : item
      )
    );

    const newNotif: TacticalNotification = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      title: 'Whisper Speech Token Renewed',
      description: 'Ingress channel restored with active bearer authorization.',
      severity: 'success',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAddIntegration = (newItem: PipelineItem) => {
    setPipelines((prev) => [...prev, newItem]);
    const newNotif: TacticalNotification = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      title: `Connected: ${newItem.name}`,
      description: `New integration mounted on edge mesh (Slot ${pipelines.length + 1}/19).`,
      severity: 'success',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleOAuthSuccess = () => {
    const newNotif: TacticalNotification = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      title: 'Highway OAuth 2.0 Re-Authenticated',
      description: 'Titan Carrier Services (USDOT #3928192) confirmed with 99.8% Trust Score.',
      severity: 'success',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-[#000000] text-[#FFE600] min-h-screen flex antialiased selection:bg-[#FFE600] selection:text-[#000000] font-sans">
      {/* Desktop Persistent Sidebar (hidden on mobile) */}
      <div className="hidden lg:block shrink-0">
        <DesktopSidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          userRole={userRole}
          userId={userId}
          userPreferences={userPreferences}
          adminRevocations={adminRevocations}
          mandatoryFeatures={mandatoryFeatures}
          onOpenFeatureGovernance={() => setIsGovernanceModalOpen(true)}
          onOpenEcosystemIndex={() => handleOpenEcosystemIndex(false)}
        />
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000]">
        {/* Sticky Top Header */}
        <Header
          latency={latency}
          unreadNotificationsCount={unreadCount}
          onOpenNotifications={() => setIsNotifModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenContact={() => setIsProfileModalOpen(true)}
          onOpenDailyAudit={() => setIsDailyAuditModalOpen(true)}
          onOpenFeatureGovernance={() => setIsGovernanceModalOpen(true)}
          onOpenDns={() => setIsDnsModalOpen(true)}
          onOpenDiagnosticAgent={() => setIsDiagnosticAgentModalOpen(true)}
          onOpenPrior7DaysDossier={() => setIsPrior7DaysDossierOpen(true)}
          onOpenInspectionMovingClips={() => setIsMovingClipsModalOpen(true)}
          onOpenHRease={() => setIsHReaseModalOpen(true)}
          onOpenVeoVideo={() => setIsVeoVideoModalOpen(true)}
          onOpenEcosystemIndex={(autoTest) => handleOpenEcosystemIndex(Boolean(autoTest))}
          onOpenBrandLogos={() => setIsBrandLogosOpen(true)}
          onOpenTickerAdmin={() => setIsTickerAdminOpen(true)}
          isTickerVisible={isTickerVisible}
          onToggleTicker={() => setIsTickerVisible(!isTickerVisible)}
          selectedHauler={selectedHauler}
          onSelectHauler={setSelectedHauler}
          currentRole={userRole}
          onRoleChange={(r) => setUserRole(r)}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          isPolling={isPolling}
          onPollAll={handlePollAll}
        />

        {/* Real-Time Live Fleet Ticker Banner: Trucking & Regular News, DOT Violations, NASA Alerts */}
        {isTickerVisible && (
          <LiveFleetTickerBanner
            onOpenAdminConfig={() => setIsTickerAdminOpen(true)}
            onNavigateToTab={setActiveTab}
            onCloseBanner={() => setIsTickerVisible(false)}
          />
        )}

        {/* Main Screen Content */}
        <main className="flex-1 w-full p-3 sm:p-5 lg:p-6 pb-[calc(7.5rem+env(safe-area-inset-bottom,1.5rem))] lg:pb-12 flex flex-col min-h-0">
          {/* Dedicated In-Cab Roadside Night HUD with Firebase Firestore Audits */}
          {activeTab === 'nighthud' && (
            <InCabHubView />
          )}

          {/* Tier 5: Enterprise Cockpit & Release */}
          {activeTab === 'orchestrator' && (
            <MasterLaunchOrchestratorView
              onNavigateToTab={setActiveTab}
              pinnedStreams={pinnedStreams}
              onTogglePinStream={handleTogglePinStream}
            />
          )}

          {/* Mobile Telemetry & Low-Bridge Radar Cockpit */}
          {activeTab === 'cockpit' && (
            <MobileCockpitView onNavigateToTab={setActiveTab} />
          )}

          {/* Apex V2X Highway Telematics & Spatial Matrix */}
          {activeTab === 'apex-avionics' && (
            <ApexAvionicsView onNavigateToTab={setActiveTab} />
          )}

          {/* G.O.A.T. Quantum Load Board */}
          {activeTab === 'goat' && (
            <GoatLoadBoardView onNavigateToTab={setActiveTab} />
          )}

          {/* 80,000 LB Load Sheets & Loader Directives */}
          {activeTab === 'load-sheets' && (
            <LoadSheetsView onNavigateToTab={setActiveTab} />
          )}

          {/* Quantum Load Optimizer View */}
          {activeTab === 'quantum-optimizer' && (
            <QuantumLoadOptimizerView onNavigateToTab={setActiveTab} />
          )}

          {/* Cryptographic Security Vault & HSM */}
          {activeTab === 'vault' && (
            <SecurityVaultView onNavigateToTab={setActiveTab} />
          )}

          {/* Integrations & Ecosystem Trust Hub */}
          {activeTab === 'ecosystem' && (
            <EcosystemTrustHubView onNavigateToTab={setActiveTab} />
          )}

          {/* In-Cab Messaging & Roadside Comms */}
          {activeTab === 'messaging' && <MessagingView />}

          {/* In-Cab Sleeper Berth Cinema & YouTube Media Lounge */}
          {activeTab === 'cinema' && <CinemaLoungeView />}

          {/* Interactive Step-by-Step Operator Manual & Tutorials */}
          {activeTab === 'tutorials' && (
            <TutorialsGuideView
              onNavigateTab={setActiveTab}
              onOpenFeatureGovernance={() => setIsGovernanceModalOpen(true)}
            />
          )}

          {/* Central Fleet AI Multi-Agent Swarm Command Center */}
          {activeTab === 'agents' && (
            <AiAgentsView onNavigateToTab={setActiveTab} />
          )}

          {activeTab === 'packaging' && (
            userRole === 'admin' ? (
              <StorefrontPackagingView />
            ) : (
              <ExecutiveAdminView
                userRole={userRole}
                onSwitchRole={setUserRole}
                onNavigateToTab={setActiveTab}
              />
            )
          )}

          {/* Tier 2: Dispatch Zero & Parking Intelligence */}
          {activeTab === 'parking' && <ParkingIntelligenceView />}

          {activeTab === 'dispatch' && <DispatchView />}

          {/* Tier 1: In-Cab HUD & Safety */}
          {activeTab === 'telemetry' && (
            <TelemetryView
              latency={latency}
              notifications={notifications}
              onAddNotification={(n) => setNotifications((prev) => [n, ...prev])}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'hos' && (
            <HosView onNavigateToTab={setActiveTab} />
          )}

          {/* Generic ELD Hardware Transceiver & Telemetry Bus Visualizer */}
          {activeTab === 'azuga-eld-sales' && (
            <AzugaEldSalesPageView
              onNavigateToTab={(tab) => setActiveTab(tab as TabType)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'eld-audit' && (
            <ELDAuditView
              onNavigateToTab={setActiveTab}
              onAddNotification={(n) => setNotifications((prev) => [n, ...prev])}
            />
          )}

          {activeTab === 'haptics' && <HapticsSuiteView />}

          {/* Tier 4: Traxes AI Driver Advocate */}
          {activeTab === 'traxes' && <TraxesAdvocateView onNavigateToTab={setActiveTab} />}

          {/* Tier 3: Fleet Maintenance & Compliance */}
          {activeTab === 'drivers' && (
            <DriverHrOnboardingView
              onNavigateToTab={setActiveTab}
              currentUserRole={userRole}
              onOpenHRease={() => setIsHReaseModalOpen(true)}
              selectedHauler={selectedHauler}
              onSelectHauler={setSelectedHauler}
            />
          )}

          {activeTab === 'assets' && <AssetManagementView />}

          {activeTab === 'maintenance' && <MaintenanceView />}

          {/* Nationwide 50-State Toll Stations & Drivewyze PreClear Bypass Hub */}
          {activeTab === 'tolls-bypass' && (
            <TollsAndBypassView onBackToCommand={() => setActiveTab('orchestrator')} />
          )}

          {/* AI Creative & Voice Studio: gemini-3.5-transcribe & gemini-3.1-flash-image-preview */}
          {activeTab === 'ai-studio' && (
            <AiStudioView
              onNavigateToTab={setActiveTab}
              onSendToDvir={({ text, photoUrl }) => {
                console.log('Sending to DVIR:', { text, photoUrl });
              }}
            />
          )}

          {activeTab === 'ifta' && <IftaView onNavigateToTab={setActiveTab} />}

          {/* Fleet Fuel & Idle Efficiency Heatmap & Geographic Hotspot Radar */}
          {activeTab === 'fuel-idle' && (
            <FuelIdleEfficiencyView
              onAddNotification={(n) => setNotifications((prev) => [n, ...prev])}
              onNavigateToTab={setActiveTab}
            />
          )}

          {/* Dedicated Pre/Post-Trip DVIR Agent & Roadside Rescue Mesh */}
          {activeTab === 'dvir-agent' && <DvirAutonomousAgentView onNavigateToTab={setActiveTab} />}

          {/* Dedicated In-Cab Phone Lines & Twilio Telecom Super-Network ($12.50/mo) */}
          {activeTab === 'telecom' && <InCabTelecomView onNavigateToTab={setActiveTab} />}

          {/* Classic CB Radio Transceiver with live microphone DSP */}
          {activeTab === 'cb-radio' && <CBRadioView onNavigateToTab={setActiveTab} />}

          {/* Dedicated Equipment & Diagnostic Agent (TITAN-RLD-1) */}
          {activeTab === 'equipment-agent' && (
            <TitanRldEquipmentAgentView onNavigateToTab={setActiveTab} />
          )}

          {/* Quantum DOT Compliance & Predictive Scenario Engine */}
          {activeTab === 'quantum-compliance' && (
            <QuantumComplianceView onNavigateToTab={setActiveTab} />
          )}

          {/* Health Chief: FMCSA 49 CFR § 391 Vitals & DOT Medical Card */}
          {activeTab === 'health-chief' && <HealthChiefView />}

          {/* Fleet Chief AI: Master Diagnostic Mechanic for Trucks & Trailers */}
          {activeTab === 'fleet-chief' && <FleetChiefMechanicView />}

          {/* EaseRewards: Driver Loyalty Points & Operational Achievement Badges */}
          {activeTab === 'safety-meetings' && (
            <DriverSafetyMeetingsView
              onNavigateToTab={setActiveTab}
              userRole={userRole}
            />
          )}

          {activeTab === 'rewards' && <EaseRewardsView />}

          {/* Road Test Evaluation & Driver Trainer Suite (49 CFR § 391.31) */}
          {activeTab === 'road-test' && <RoadTestEvaluationView onNavigateToTab={setActiveTab} />}

          {/* Roadside Inspection Upload & 15-Day Statutory Dispatch Portal (49 CFR § 396.9) */}
          {activeTab === 'roadside-inspections' && <RoadsideInspectionsView onNavigateToTab={setActiveTab} />}

          {/* Executive General Manager Daily Traffic & Reporting (GA4 & Cloudflare Edge Connected) */}
          {activeTab === 'executive-reports' && (
            <ExecutiveManagerReportsView
              onShowToast={(msg, type) => {
                setNotifications((prev) => [
                  {
                    id: `notif-${Date.now()}`,
                    title: 'Executive Manager Alert',
                    message: msg,
                    timestamp: 'Just now',
                    type: type === 'error' ? 'urgent' : type === 'warning' ? 'warning' : 'system',
                    read: false,
                  },
                  ...prev,
                ]);
              }}
            />
          )}

          {/* Deep-Tech & Advanced Sensing Suite (Cold-Atom, OPM-MEG, Cat Qubits, Silicon Spin) */}
          {/* Next-Gen 5 Breakthrough Technologies (Wheel Acoustic, Pre-Scale, IFTA Arbitrage, AR Docking, Broker Bot) */}
          {activeTab === 'nextgen-innovations' && (
            <NextGenInnovationsMasterDeck
              onNavigateToTab={(tab) => setActiveTab(tab as TabType)}
            />
          )}

          {activeTab === 'quantum-sensing' && (
            <QuantumFleetInnovationsView
              onShowToast={(msg, type) => {
                setNotifications((prev) => [
                  {
                    id: `notif-${Date.now()}`,
                    title: 'Deep-Tech Sensory Alert',
                    message: msg,
                    timestamp: 'Just now',
                    type: type === 'error' ? 'urgent' : type === 'warning' ? 'warning' : 'system',
                    read: false,
                  },
                  ...prev,
                ]);
              }}
            />
          )}

          {activeTab === 'compliance' && <ComplianceView />}

          {activeTab === 'drive' && <GoogleDriveView />}

          {activeTab === 'gmail' && <GmailView />}

          {/* Integrations & Providers & Security */}
          {activeTab === 'overview-ad' && (
            <OverviewAdView
              onNavigateToTab={setActiveTab}
              onOpenContact={() => setIsProfileModalOpen(true)}
              onOpenEcosystemIndex={handleOpenEcosystemIndex}
            />
          )}
          {activeTab === 'core-console' && (
            <CoreEngineConsoleView onNavigateToTab={setActiveTab} />
          )}

          {activeTab === 'admin-console' && (
            <ExecutiveAdminView
              userRole={userRole}
              onSwitchRole={setUserRole}
              onNavigateToTab={setActiveTab}
              pipelines={pipelines}
              latency={latency}
              isPolling={isPolling}
              onPollAll={handlePollAll}
              onOpenOAuth={() => setIsOAuthModalOpen(true)}
              onOpenLogs={() => setIsLogsModalOpen(true)}
              onOpenConnect={() => setIsConnectModalOpen(true)}
              onVerifyPipeline={handleVerifyPipeline}
              onRenewPipeline={handleRenewPipeline}
              pinnedStreams={pinnedStreams}
              onTogglePinStream={handleTogglePinStream}
              onOpenDns={() => setIsDnsModalOpen(true)}
            />
          )}

          {activeTab === 'hub' && (
            userRole === 'admin' ? (
              <HubView
                pipelines={pipelines}
                latency={latency}
                isPolling={isPolling}
                onPollAll={handlePollAll}
                onOpenOAuth={() => setIsOAuthModalOpen(true)}
                onOpenLogs={() => setIsLogsModalOpen(true)}
                onOpenConnect={() => setIsConnectModalOpen(true)}
                onVerifyPipeline={handleVerifyPipeline}
                onRenewPipeline={handleRenewPipeline}
                pinnedStreams={pinnedStreams}
                onTogglePinStream={handleTogglePinStream}
                onNavigateToTab={setActiveTab}
              />
            ) : (
              <ExecutiveAdminView
                userRole={userRole}
                onSwitchRole={setUserRole}
                onNavigateToTab={setActiveTab}
              />
            )
          )}

          {activeTab === 'highway-samsara' && (
            <HighwaySamsaraMarketplaceView
              onClose={() => setActiveTab('providers')}
              onNavigateToTab={(tab) => setActiveTab(tab as TabType)}
            />
          )}

          {activeTab === 'providers' && (
            <ProvidersView
              onOpenConnect={() => setIsConnectModalOpen(true)}
              onOpenOAuth={() => setIsOAuthModalOpen(true)}
            />
          )}

          
          {activeTab === 'non-cdl' && (
            <NonCdlOperationsSuiteView onNavigateToTab={setActiveTab} userRole={userRole} />
          )}

          {activeTab === 'heartbeat' && (
            <DailyFunctionAuditModal
              isOpen={true}
              onClose={() => setActiveTab('overview-ad')}
            />
          )}

          {activeTab === 'security' && (
            userRole === 'admin' ? (
              <SecurityView />
            ) : (
              <ExecutiveAdminView
                userRole={userRole}
                onSwitchRole={setUserRole}
                onNavigateToTab={setActiveTab}
              />
            )
          )}
        </main>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        userRole={userRole}
        userId={userId}
        userPreferences={userPreferences}
        adminRevocations={adminRevocations}
        mandatoryFeatures={mandatoryFeatures}
      />

      {/* Interactive Modals */}
      <FeatureGovernanceModal
        isOpen={isGovernanceModalOpen}
        onClose={() => setIsGovernanceModalOpen(false)}
        userRole={userRole}
        userId={userId}
        onPreferencesUpdated={(updated) => setUserPreferences(updated)}
        onRevocationsUpdated={(updated) => setAdminRevocations(updated)}
      />

      {/* Interactive Modals */}
      <WebhookLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={webhookLogs}
        onAddMockLog={(log) => setWebhookLogs((prev) => [log, ...prev])}
      />

      <HighwayOAuthModal
        isOpen={isOAuthModalOpen}
        onClose={() => setIsOAuthModalOpen(false)}
        onAuthSuccess={handleOAuthSuccess}
        onViewSamsaraListing={() => setActiveTab('packaging')}
      />

      <ConnectIntegrationModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onAddIntegration={handleAddIntegration}
      />

      <NotificationsModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onDismiss={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />

      <CarrierProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <DailyFunctionAuditModal
        isOpen={isDailyAuditModalOpen}
        onClose={() => setIsDailyAuditModalOpen(false)}
      />

      <DnsDeploymentVerificationModal
        isOpen={isDnsModalOpen}
        onClose={() => setIsDnsModalOpen(false)}
      />

      <AutonomousDiagnosticAgentModal
        isOpen={isDiagnosticAgentModalOpen}
        onClose={() => setIsDiagnosticAgentModalOpen(false)}
      />

      <Prior7DaysInspectionDossierModal
        isOpen={isPrior7DaysDossierOpen}
        onClose={() => setIsPrior7DaysDossierOpen(false)}
        driverName="Marcus Bell"
        unitNumber="UNIT #104-E"
      />

      <InspectionMovingClipsModal
        isOpen={isMovingClipsModalOpen}
        onClose={() => setIsMovingClipsModalOpen(false)}
      />

      <HReaseConsultationModal
        isOpen={isHReaseModalOpen}
        onClose={() => setIsHReaseModalOpen(false)}
        onSelectCandidate={(cand) => {
          setActiveTab('drivers');
          setIsHReaseModalOpen(false);
        }}
      />

      <VeoVideoGeneratorModal
        isOpen={isVeoVideoModalOpen}
        onClose={() => setIsVeoVideoModalOpen(false)}
      />

      <EcosystemMasterIndexModal
        isOpen={isEcosystemIndexModalOpen}
        onClose={() => {
          setIsEcosystemIndexModalOpen(false);
          setEcosystemModalAutoTest(false);
        }}
        onNavigateToTab={setActiveTab}
        onShowToast={handleShowToast}
        autoRunTest={ecosystemModalAutoTest}
      />

      {/* Official Vector Logos Inspection Modal (TRUCKWITHEASE & MORRISHIVE) */}
      <BrandLogosModal
        isOpen={isBrandLogosOpen}
        onClose={() => setIsBrandLogosOpen(false)}
      />

      {/* Fleet Ticker Administration & Live Feeds Modal */}
      <FleetTickerAdminModal
        isOpen={isTickerAdminOpen}
        onClose={() => setIsTickerAdminOpen(false)}
        onShowToast={handleShowToast}
      />
    </div>
  );
}
