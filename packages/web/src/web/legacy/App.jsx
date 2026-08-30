import { useState, useEffect, useRef, lazy } from "react";
import PocketBase from "pocketbase";
const BrandingCenter = lazy(() => import("./pages/BrandingCenter"));
const BrandIdentity = lazy(() => import("./pages/BrandIdentity"));
const FMCSAELDIntegration = lazy(() => import("./pages/FMCSAELDIntegration"));
const HOSAnalyticsDashboard = lazy(() => import("./pages/HOSAnalyticsDashboard"));
const TruckWithEaseELDPage = lazy(() => import("./pages/TruckWithEaseELDPage"));
const FMCSARegistrationPage = lazy(() => import("./pages/FMCSARegistrationPage"));
const SignupPage = lazy(() => import("./SignupPage"));
const AccessibleSignupPage = lazy(() => import("./AccessibleSignupPage"));
const OnboardingPage = lazy(() => import("./OnboardingPage"));
const DemoPage = lazy(() => import("./DemoPage"));
const PricingPage = lazy(() => import("./PricingPage"));
const SupportAgentTechnical = lazy(() => import("./SupportAgentTechnical"));
const SupportAgentBilling = lazy(() => import("./SupportAgentBilling"));
const FinancialModelDashboard = lazy(() => import("./FinancialModelDashboard"));
const TutorialsPage = lazy(() => import("./TutorialsPage"));
const SubscriberAgentPage = lazy(() => import("./SubscriberAgentPage"));
const SystemMaintenanceAgentPage = lazy(() => import("./SystemMaintenanceAgentPage"));
const StartupDataAgent = lazy(() => import("./StartupDataAgent"));
const SecurityAgentPage = lazy(() => import("./SecurityAgentPage"));
const HOSComplianceAgentPage = lazy(() => import("./HOSComplianceAgentPage"));
const QualityAssuranceAgentPage = lazy(() => import("./QualityAssuranceAgentPage"));
const EntertainmentAgentPage = lazy(() => import("./EntertainmentAgentPage"));
const BillingScanAgentPage = lazy(() => import("./BillingScanAgentPage"));
const FleetMarketingPage = lazy(() => import("./FleetMarketingPage"));
const APIIntegrationDashboard = lazy(() => import("./APIIntegrationDashboard"));
const CompetitiveAdvantagesPage = lazy(() => import("./CompetitiveAdvantagesPage"));
const CompetitorAnalysisPage = lazy(() => import("./CompetitorAnalysisPage"));
const GrowthCommandPage = lazy(() => import("./GrowthCommandPage"));
const LocationMemoryPage = lazy(() => import("./LocationMemoryPage"));
const WeekInReviewPage = lazy(() => import("./WeekInReviewPage"));
const TruckingNewsPage = lazy(() => import("./TruckingNewsPage"));
const DriverChatPage = lazy(() => import("./DriverChatPage"));
const TraxesPage = lazy(() => import("./TraxesPage"));
const RigBucksPage = lazy(() => import("./BigRigPointsPage"));
const SubscriptionSeatsPage = lazy(() => import("./pages/SubscriptionSeatsPage"));
const LoadBoardLicenseManagementPage = lazy(() => import("./pages/LoadBoardLicenseManagementPage"));
const AgentDashboardPage = lazy(() => import("./pages/AgentDashboardPage"));
const LoadBoardOptionsPage = lazy(() => import("./pages/LoadBoardOptionsPage"));
const FeatureCompletionAudit = lazy(() => import("./FeatureCompletionAudit"));
const MigrationROICalculator = lazy(() => import("./MigrationROICalculator"));
const SalesCollateral = lazy(() => import("./SalesCollateral"));
const ComplianceAudit = lazy(() => import("./ComplianceAudit"));
const ProofOfConceptSandbox = lazy(() => import("./ProofOfConceptSandbox"));
const IntegrationVerification = lazy(() => import("./IntegrationVerification"));
const CustomerMemorySystem = lazy(() => import("./CustomerMemorySystem"));
const DocumentScanningSystem = lazy(() => import("./DocumentScanningSystem"));
const OperationsHealthDashboard = lazy(() => import("./OperationsHealthDashboard"));
const LeaderboardPage = lazy(() => import("./LeaderboardPage"));
const RoadAgentPage = lazy(() => import("./RoadAgentPage"));
const RoadContextPage = lazy(() => import("./pages/RoadContextPage"));
const OnboardingWizardPage = lazy(() => import("./pages/OnboardingWizardPage"));
const LaunchChecklistPage = lazy(() => import("./LaunchChecklistPage"));
const ReferralPage = lazy(() => import("./ReferralPage"));
const FontPreviewPage = lazy(() => import("./FontPreviewPage"));
const MorrishiveLandingPage = lazy(() => import("./pages/MorrishiveLandingPage"));
const TimezoneIntelligencePage = lazy(() => import("./pages/TimezoneIntelligencePage"));
const AdminBoundariesPage = lazy(() => import("./pages/AdminBoundariesPage"));
const IPGeolocationPage = lazy(() => import("./pages/IPGeolocationPage"));
const IPWhoisPage = lazy(() => import("./pages/IPWhoisPage"));

const CommandCenterPage = lazy(() => import("./CommandCenterPage"));
const DriverProfilePage = lazy(() => import("./DriverProfilePage"));
const TripPlannerPage = lazy(() => import("./TripPlannerPage"));
const HOSLoggerPage = lazy(() => import("./HOSLoggerPage"));
const DVIRPage = lazy(() => import("./DVIRPage"));
const AICharactersPage = lazy(() => import("./AICharactersPage"));
const APIAgentPage = lazy(() => import("./pages/APIAgentPage"));
const APIDiagnosticPage = lazy(() => import("./pages/APIDiagnosticPage"));
const ScanBillPage = lazy(() => import("./ScanBillPage"));
const HReaseAgentPage = lazy(() => import("./HReaseAgentPage"));
const HRPlatformPage = lazy(() => import("./HRPlatformPage"));
const VehicleMaintenanceAgentPage = lazy(() => import("./VehicleMaintenanceAgentPage"));
const LoadProfitPage = lazy(() => import("./LoadProfitPage"));
const FuelFinderPage = lazy(() => import("./FuelFinderPage"));
const LoadBoardMapAgentPage = lazy(() => import("./LoadBoardMapAgentPage"));
const FleetLoadBoardPage = lazy(() => import("./FleetLoadBoardPage"));
const ExpensesPage = lazy(() => import("./ExpensesPage"));
const ReportsPage = lazy(() => import("./ReportsPage"));
const TollsPage = lazy(() => import("./TollsPage"));
const DispatchRoutingAgentPage = lazy(() => import("./DispatchRoutingAgentPage"));
const WeatherPage = lazy(() => import("./WeatherPage"));
const BreakdownPage = lazy(() => import("./BreakdownPage"));
const ScorecardPage = lazy(() => import("./ScorecardPage"));
const PermitBookPage = lazy(() => import("./PermitBookPage"));
const FactoringPage = lazy(() => import("./FactoringPage"));
const HardwareSoftwareBundle = lazy(() => import("./pages/HardwareSoftwareBundle"));
const PricingStrategy = lazy(() => import("./pages/PricingStrategy"));

const QATestingAgent = lazy(() => import("./pages/QATestingAgent"));
const DailyMaintenanceAgent = lazy(() => import("./pages/DailyMaintenanceAgent"));
const FuelCardPage = lazy(() => import("./FuelCardPage"));
const ParkingPage = lazy(() => import("./ParkingPage"));
const CheckoutPage = lazy(() => import("./CheckoutPage"));
const FinanceAlertAgentPage = lazy(() => import("./FinanceAlertAgentPage"));
const FleetProfilePage = lazy(() => import("./FleetProfilePage"));
const MemoryManagementAgentPage = lazy(() => import("./MemoryManagementAgentPage"));
const HealthPage = lazy(() => import("./HealthPage"));
const StatePatrolPage = lazy(() => import("./StatePatrolPage"));
const BypassPage = lazy(() => import("./BypassPage"));
const DetentionPage = lazy(() => import("./DetentionPage"));
const VoicePage = lazy(() => import("./VoicePage"));
const HardwareInventoryAgentPage = lazy(() => import("./HardwareInventoryAgentPage"));
const PayrollPage = lazy(() => import("./pages/PayrollPage"));
const CompetitiveIntelligencePage = lazy(() => import("./pages/CompetitiveIntelligencePage"));
const FleetVoicePage = lazy(() => import("./pages/FleetVoicePage"));
const TwilioSetupPage = lazy(() => import("./pages/TwilioSetupPage"));
const PageGuardianAgent = lazy(() => import("./pages/PageGuardianAgent"));
const NeuralSafetyCore = lazy(() => import("./pages/NeuralSafetyCore"));
const DispatchCorePage = lazy(() => import("./pages/DispatchCorePage"));
const DispatchNexusPage = lazy(() => import("./DispatchNexusPage"));
const ClockLedgerPage = lazy(() => import("./pages/ClockLedgerPage"));
const SealedLinePage = lazy(() => import("./pages/SealedLinePage"));
const FleetCommsPage = lazy(() => import("./pages/FleetCommsPage"));
const UserGuideHub = lazy(() => import("./pages/UserGuideHub"));
const AgentOrchestrator = lazy(() => import("./pages/AgentOrchestrator"));
const ProfitableLanesPage = lazy(() => import("./pages/ProfitableLanesPage"));
const HardwareSupplierIntegration = lazy(() => import("./HardwareSupplierIntegration"));
const OnboardingGlossary = lazy(() => import("./OnboardingGlossary"));
const DOTComplianceVault = lazy(() => import("./DOTComplianceVault"));
const CommandOptimizer = lazy(() => import("./CommandOptimizer"));
const FleetDashboardCustomizer = lazy(() => import("./FleetDashboardCustomizer"));
const FleetQuickActions = lazy(() => import("./FleetQuickActions"));
const LocationDataAgent = lazy(() => import("./LocationDataAgent"));
const VehicleVINAgent = lazy(() => import("./VehicleVINAgent"));
const CommandRepository = lazy(() => import("./CommandRepository"));
const FeatureHealthMonitor = lazy(() => import("./FeatureHealthMonitor"));
const ContactMessagesInbox = lazy(() => import("./ContactMessagesInbox"));
const ShareAndOnboardPage = lazy(() => import("./ShareAndOnboardPage"));
const IntegrationHubPage = lazy(() => import("./IntegrationHubPage"));
const MicrosoftIntegration = lazy(() => import("./MicrosoftIntegration"));
const SatelliteMapsIntegration = lazy(() => import("./SatelliteMapsIntegration"));
const DriverGalaFaceTime = lazy(() => import("./DriverGalaFaceTime"));
const DriverGalaAndroid = lazy(() => import("./DriverGalaAndroid"));
const WalkieTalkieTraces = lazy(() => import("./WalkieTalkieTraces"));
const DreamTeamAdmin = lazy(() => import("./DreamTeamAdmin"));
const SupplierAdminPanel = lazy(() => import("./SupplierAdminPanel"));
const SubscriptionsAdminPage = lazy(() => import("./SubscriptionsAdminPage"));
const AccidentReportPage = lazy(() => import("./AccidentReportPage"));
const DOTConnectPage = lazy(() => import("./DOTConnectPage"));
const SafetySOSPage = lazy(() => import("./SafetySOSPage"));
const CustomerBookPage = lazy(() => import("./CustomerBookPage"));

const AppMaintenanceAgentPage = lazy(() => import("./AppMaintenanceAgentPage"));
const DriverNervePage = lazy(() => import("./DriverNervePage"));
const FleetMindPage = lazy(() => import("./FleetMindPage"));
const GameUpPage = lazy(() => import("./pages/GameUpPage"));
const CoverPage = lazy(() => import("./CoverPage"));
const PlatformShowcasePage = lazy(() => import("./pages/PlatformShowcasePage"));
const VehicleSelectorPage = lazy(() => import("./pages/VehicleSelectorPage"));
const DriveWithEasePage = lazy(() => import("./pages/DriveWithEasePage"));
const RideWithEasePage = lazy(() => import("./pages/RideWithEasePage"));
const RoutingEnginePage = lazy(() => import("./pages/RoutingEnginePage"));
const DriverAlgorithmPage = lazy(() => import("./pages/DriverAlgorithmPage"));
const AdStrategyPage = lazy(() => import("./pages/AdStrategyPage"));
const SocialCalendarPage = lazy(() => import("./pages/SocialCalendarPage"));
const FleetSafetyIntelligencePage = lazy(() => import("./pages/FleetSafetyIntelligencePage"));
const GeminiIntegrationPage = lazy(() => import("./pages/GeminiIntegrationPage"));
const CodeVaultPage = lazy(() => import("./pages/CodeVaultPage"));
const SafetyMeetingsPage = lazy(() => import("./pages/SafetyMeetingsPage"));
const DriverScorecardPage = lazy(() => import("./pages/DriverScorecardPage"));
const PredictiveMaintenancePage = lazy(() => import("./pages/PredictiveMaintenancePage"));
const LiveComplianceMonitorPage = lazy(() => import("./pages/LiveComplianceMonitorPage"));
const FleetCommunicationHubPage = lazy(() => import("./pages/FleetCommunicationHubPage"));
const OutreachAgentPage = lazy(() => import("./pages/OutreachAgentPage"));
const SafetyHRFusionPage = lazy(() => import("./pages/SafetyHRFusionPage"));
const FleetioMaintenancePage = lazy(() => import("./pages/FleetioMaintenancePage"));
const PhoneAssistantPage = lazy(() => import("./pages/PhoneAssistantPage"));
const PersonalIndexPage = lazy(() => import("./pages/PersonalIndexPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const PrivacyDetailPage = lazy(() => import("./pages/PrivacyDetailPage"));
const VoiceClonePage = lazy(() => import("./pages/VoiceClonePage"));
const ComplianceAuthPage = lazy(() => import("./pages/ComplianceAuthPage"));
const UserDocumentAccessPage = lazy(() => import("./pages/UserDocumentAccessPage"));
const CloudUsageMonitorPage = lazy(() => import("./pages/CloudUsageMonitorPage"));
const StorageGrowthScalabilityPage = lazy(() => import("./pages/StorageGrowthScalabilityPage"));
const HapticLanguagePage = lazy(() => import("./pages/HapticLanguagePage"));
const LiveCaptionsPage = lazy(() => import("./pages/LiveCaptionsPage"));
const MultiDeviceHapticsPage = lazy(() => import("./pages/MultiDeviceHapticsPage"));
const JJKellerCompliancePage = lazy(() => import("./pages/JJKellerCompliancePage"));
const AgentTechnicianPage = lazy(() => import("./pages/AgentTechnicianPage"));
const ResponsibleUseOnboardingPage = lazy(() => import("./pages/ResponsibleUseOnboardingPage"));
const DriverHealthRecoveryPage = lazy(() => import("./pages/DriverHealthRecoveryPage"));
const MedicalExaminerLocatorPage = lazy(() => import("./pages/MedicalExaminerLocatorPage"));
const CustomerSupportPage = lazy(() => import("./pages/CustomerSupportPage"));
const AndroidNativeSetupPage = lazy(() => import("./pages/AndroidNativeSetupPage"));
const AccessibilityDeafPage = lazy(() => import("./pages/AccessibilityDeafPage"));
const DeafCommunityBridgePage = lazy(() => import("./pages/DeafCommunityBridgePage"));
const AccessibilityBlindPage = lazy(() => import("./pages/AccessibilityBlindPage"));
const HumanSupportNetworkPage = lazy(() => import("./pages/HumanSupportNetworkPage"));
const MaintenanceSchedulerPage = lazy(() => import("./pages/MaintenanceSchedulerPage"));
const UniversalAccessibilityPage = lazy(() => import("./pages/UniversalAccessibilityPage"));
const AccessibilityAgentsPage = lazy(() => import("./pages/AccessibilityAgentsPage"));
const ExclusiveAgentVerificationPage = lazy(() => import("./pages/ExclusiveAgentVerificationPage"));
const ApiKeySecurityPage = lazy(() => import("./pages/ApiKeySecurityPage"));
const GooglePlaySubmitPage = lazy(() => import("./pages/GooglePlaySubmitPage"));
const LiveGPSPage = lazy(() => import("./pages/LiveGPSPage"));
const AssetEasePage = lazy(() => import("./pages/AssetEasePage"));
const FreightNexusPage = lazy(() => import("./pages/FreightNexusPage"));
const ClientBuilderPage = lazy(() => import("./pages/ClientBuilderPage"));
const LoadReworkPage = lazy(() => import("./pages/LoadReworkPage"));
const A2PRegistrationPage = lazy(() => import("./pages/A2PRegistrationPage"));
const IndexMechanicPage = lazy(() => import("./pages/IndexMechanicPage"));
const AgentCommandTestPage = lazy(() => import("./pages/AgentCommandTestPage"));
const RevenueForecastPage = lazy(() => import("./pages/RevenueForecastPage"));
const CatScalesPage = lazy(() => import("./pages/CatScalesPage"));
const StaffAppointedPage = lazy(() => import("./pages/StaffAppointedPage"));
const EntitledIndexPage = lazy(() => import("./pages/EntitledIndexPage"));
const FunctionIndexPage = lazy(() => import("./pages/FunctionIndexPage"));
const LowBridgePage = lazy(() => import("./pages/LowBridgePage"));
const DispatchZeroPage = lazy(() => import("./pages/DispatchZeroPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const PreLaunchAssurancePage = lazy(() => import("./pages/PreLaunchAssurancePage"));
const LaunchScenarioCenterPage = lazy(() => import("./pages/LaunchScenarioCenterPage"));
const FleetPaymentsPage = lazy(() => import("./pages/FleetPaymentsPage"));
const FactoringLogPage = lazy(() => import("./pages/FactoringLogPage"));
const FleetioImportPage = lazy(() => import("./pages/FleetioImportPage"));
const GoogleAPIsPage = lazy(() => import("./pages/GoogleAPIsPage"));
const FleetIntelligencePage = lazy(() => import("./pages/FleetIntelligencePage"));
const AccessibilityLegacyPage = lazy(() => import("./pages/AccessibilityLegacyPage"));
const RevolutionPage = lazy(() => import("./pages/RevolutionPage"));
const DriverAssistancePage = lazy(() => import("./pages/DriverAssistancePage"));
const LaunchLandingPage = lazy(() => import("./pages/LaunchLandingPage"));
const SimplifiedDashboardPage = lazy(() => import("./pages/SimplifiedDashboardPage"));
const TruckWithEaseHomePage = lazy(() => import("./pages/TruckWithEaseHomePage"));
const CoreBreakthroughsPage = lazy(() => import("./pages/CoreBreakthroughsPage"));
const JourneyPage = lazy(() => import("./pages/JourneyPage"));
const FleetMemoryPage = lazy(() => import("./pages/FleetMemoryPage"));
const BrokerArrivalNotificationPage = lazy(() => import("./pages/BrokerArrivalNotificationPage"));
const FleetTemplatePage = lazy(() => import("./pages/FleetTemplatePage"));
const DOTPortalPage = lazy(() => import("./pages/DOTPortalPage"));
const MedicalCDLPage = lazy(() => import("./pages/MedicalCDLPage"));
const ChargingStationsPage = lazy(() => import("./pages/ChargingStationsPage"));
const OperationModelPage = lazy(() => import("./pages/OperationModelPage"));
const WorkflowStreamlinerPage = lazy(() => import("./pages/WorkflowStreamlinerPage"));
const AstronomyNavigationPage = lazy(() => import("./pages/AstronomyNavigationPage"));
const APIFreaksHubPage = lazy(() => import("./pages/APIFreaksHubPage"));
const AccessibilityLandingPage = lazy(() => import("./pages/AccessibilityLandingPage"));
const TaxRatesIntelligencePage = lazy(() => import("./pages/TaxRatesIntelligencePage"));
const pb = new PocketBase();
// Brand palette: gold on black. The constant NAMES are deliberately unchanged so
// the ~200 call sites below did not need editing; only the values moved to brand.
const NAVY   = "#0a0a0a";
const NAVY2  = "#000000";
const RED    = "#c96a4c";
const DARK   = "#0a0a0a";
const ORANGE = "#C9A84C";
const AMBER  = "#FFD700";
const GOLD   = "#FFD700";
const GREEN  = "#C9A84C";


// ─── Helpers ────────────────────────────────────────────────────────────────
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}

function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: seen ? 1 : 0,
      transform: seen ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────
function useRoute() {
  const [path, setPath] = useState(() => {
    try { return window.location.pathname; } catch { return "/"; }
  });
  useEffect(() => {
    const onPop = () => {
      try { setPath(window.location.pathname); } catch {}
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return path;
}

// ─── Main App ────────────────────────────────────────────────────────────────

function LiveViolationCounter() {
  const [count, setCount] = useState(103847);
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < 0.4) setCount(v => v + 1);
    }, 3500);
    return () => clearInterval(id);
  }, []);
  const stats = [
    { value: '50', label: 'States Covered' },
    { value: count.toLocaleString() + '+', label: 'Violations Prevented', live: true },
    { value: '14', label: 'Day Free Trial' },
    { value: '0', label: 'Contracts Required' },
  ];
  return (
    <>
      {stats.map(s => (
        <div key={s.label} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 900, color: 'white', fontFamily: s.live ? "'DM Mono',monospace" : 'inherit' }}>
            {s.value}
            {s.live && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9A84C', display: 'inline-block', marginLeft: 8, animation: 'pulse 2s infinite', verticalAlign: 'middle' }} />}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500, marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </>
  );
}

export default function App() {
  const path = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem('user_role') || null);

  // Silent visitor tracker — logs every page visit to site_visits
  useEffect(() => {
    const sessionKey = "twe_session_id";
    let sid = sessionStorage.getItem(sessionKey);
    if (!sid) { sid = Math.random().toString(36).slice(2); sessionStorage.setItem(sessionKey, sid); }
    const ua = navigator.userAgent;
    const device = /Mobi|Android/i.test(ua) ? "Mobile" : /Tablet|iPad/i.test(ua) ? "Tablet" : "Desktop";
    const browser = /Chrome/i.test(ua) ? "Chrome" : /Firefox/i.test(ua) ? "Firefox" : /Safari/i.test(ua) ? "Safari" : /Edge/i.test(ua) ? "Edge" : "Other";
    pb.collection("site_visits").create({
      page: window.location.pathname,
      referrer: document.referrer || "",
      device,
      browser,
      session_id: sid,
    }).catch(() => {});
  }, [path]);

  // Onboarding redirect: skip if completed
  useEffect(() => {
    const onboardingDone = sessionStorage.getItem('onboarding_completed');
    const isOnOnboarding = path?.includes('onboarding') || path?.includes('setup') || path?.includes('get-started');
    if (onboardingDone && isOnOnboarding) {
      window.location.pathname = '/';
    }
  }, [path]);



  // truckwithease.com front door. The /morrishive alias was removed: wrong brand.
  if (path === "/" || path === "/home" || path === "/drivewithease" || path === "/landing" || path === "/launch") return <TruckWithEaseHomePage />;
  if (path === "/core-breakthroughs" || path === "/live-proof" || path === "/entitled-systems") return <CoreBreakthroughsPage />;
  if (path === "/dashboard" || path === "/my-dashboard" || path === "/start") return <SimplifiedDashboardPage />;
  if (path === "/home-old" || path === "/cover") return <CoverPage />;
  if (path === "/vehicle-select" || path === "/select") return <VehicleSelectorPage />;
  if (path === "/platform" || path === "/showcase" || path === "/why-us") return <PlatformShowcasePage />;
  if (path === "/drive-dashboard" || path === "/drive-with-ease") return <DriveWithEasePage />;
  if (path === "/ride-dashboard" || path === "/ride-with-ease") return <RideWithEasePage />;
  if (path === "/routing-engine") return <RoutingEnginePage />;
  if (path === "/driver-algorithm" || path === "/my-algorithm") return <DriverAlgorithmPage />;
  if (path === "/ad-strategy" || path === "/advertise" || path === "/marketing") return <AdStrategyPage />;
  if (path === "/social-calendar" || path === "/content-calendar" || path === "/posts") return <SocialCalendarPage />;
  if (path === "/fleet-safety" || path === "/safety-intel" || path === "/insurance-intel") return <FleetSafetyIntelligencePage />;
  if (path === "/dual-ai" || path === "/gemini" || path === "/ai-intelligence") return <GeminiIntegrationPage />;
  if (path === "/code-vault" || path === "/owner-vault" || path === "/source-vault") return <CodeVaultPage />;

  if (path === "/signup") return <AccessibleSignupPage />;
  if (path === "/signup-original") return <SignupPage />;
  if (path === "/onboarding") return <OnboardingPage />;
  if (path === "/demo") return <DemoPage />;
  if (path === "/subscriber-agent") return <SubscriberAgentPage />;
  if (path === "/system-maintenance") return <SystemMaintenanceAgentPage />;
  if (path === "/startup-data-agent" || path === "/data-agent") return <StartupDataAgent />;
  if (path === "/security-agent") return <SecurityAgentPage />;
  if (path === "/hos-compliance") return <HOSComplianceAgentPage />;
  if (path === "/qa-agent") return <QualityAssuranceAgentPage />;
  if (path === "/fleet-marketing") return <FleetMarketingPage />;
  if (path === "/integration-status" || path === "/wired-integrations") return <APIIntegrationDashboard />;
  if (path === "/advantages") return <CompetitiveAdvantagesPage />;
  if (path === "/competitors") return <CompetitorAnalysisPage />;
  if (path === "/traxes") return <TraxesPage />;
  if (path === "/rig-bucks") return <RigBucksPage />;
  if (path === "/subscription-seats") return <SubscriptionSeatsPage />;
  if (path === "/load-board-licenses" || path === "/license-management" || path === "/dat-uber-licenses") return <LoadBoardLicenseManagementPage />;
  if (path === "/agent-dashboard" || path === "/agents" || path === "/ai-agents") return <AgentDashboardPage />;
  if (path === "/load-board-options" || path === "/add-networks" || path === "/load-board-networks") return <LoadBoardOptionsPage />;
  if (path === "/leaderboard") return <LeaderboardPage />;
  if (path === "/road-agent") return <RoadAgentPage />;
  if (path === "/onboarding" || path === "/setup" || path === "/get-started") return <OnboardingWizardPage />;
  if (path === "/road-context") return <RoadContextPage />;
  if (path === "/driver-intel") return <RoadContextPage />;
  if (path === "/road-intelligence") return <RoadContextPage />;
  if (path === "/timezone" || path === "/timezones" || path === "/timezone-intel" || path === "/time-zones") return <TimezoneIntelligencePage />;
  if (path === "/admin-boundaries" || path === "/compliance-zones" || path === "/regional-rules") return <AdminBoundariesPage />;
  if (path === "/ip-geolocation" || path === "/geo-ip" || path === "/location-lookup") return <IPGeolocationPage />;
  if (path === "/ip-whois" || path === "/whois-lookup" || path === "/registry-lookup") return <IPWhoisPage />;
  if (path === "/launch") return <LaunchChecklistPage />;
  if (path === "/refer") return <ReferralPage />;
  if (path === "/design") return <FontPreviewPage />;
  if (path === "/cinema") return <EntertainmentAgentPage />;

  if (path === "/command") return <CommandCenterPage />;
  if (path === "/driver") return <DriverProfilePage />;
  if (path === "/trip-planner") return <TripPlannerPage />;
  if (path === "/hos") return <HOSLoggerPage />;
  if (path === "/dvir") return <DVIRPage />;
  if (path === "/ai-team") return <AICharactersPage />;
  if (path === "/twilio-setup" || path === "/twillo-setup" || path === "/twilio") return <TwilioSetupPage />;
  if (path === "/key-agent" || path === "/keys" || path === "/activate-voice") return <APIAgentPage />;
  if (path === "/integration-diagnostic" || path === "/integration-audit") return <APIDiagnosticPage />;
  if (path === "/safety-meetings" || path === "/safety-compliance" || path === "/meetings") return <SafetyMeetingsPage />;
  if (path === "/driver-scorecard" || path === "/scorecard" || path === "/driver-scores") return <DriverScorecardPage />;
  if (path === "/predictive-maintenance" || path === "/maintenance-ai" || path === "/truck-health") return <PredictiveMaintenancePage />;
  if (path === "/live-compliance" || path === "/compliance-monitor" || path === "/phantom-compliance") return <LiveComplianceMonitorPage />;
  if (path === "/fleet-comms" || path === "/communication-hub" || path === "/fleet-chat") return <FleetCommunicationHubPage />;
  if (path === "/outreach-agent" || path === "/outreach") return <OutreachAgentPage />;
  if (path === "/safety-hr-fusion" || path === "/fusion") return <SafetyHRFusionPage />;
  if (path === "/phone-assistant" || path === "/auto-phone") return <PhoneAssistantPage />;
  if (path === "/my-index" || path === "/personal-index" || path === "/my-features") return <PersonalIndexPage />;
  if (path === "/scan-bill") return <BillingScanAgentPage />;
  if (path === "/scan-bill-classic") return <ScanBillPage />;
  if (path === "/humanai") return <HRPlatformPage />;
  if (path === "/humanai-classic") return <HReaseAgentPage />;
  if (path === "/hr") return <HRPlatformPage />;
  if (path === "/hiring") return <HRPlatformPage />;
  if (path === "/fleetio" || path === "/maintenance-live" || path === "/fleet-maintenance") return <FleetioMaintenancePage />;
  if (path === "/maintenance") return <VehicleMaintenanceAgentPage />;
  if (path === "/load-profit") return <LoadProfitPage />;
  if (path === "/fuel-finder" || path === "/fuel") return <FuelFinderPage />;
  if (path === "/loads") return <LoadBoardMapAgentPage />;
  if (path === "/clock-ledger" || path === "/clock" || path === "/ledger") return <ClockLedgerPage />;
  if (path === "/sealed-line" || path === "/sealed" || path === "/the-sealed-line") return <SealedLinePage />;
  if (path === "/comms" || path === "/fleet-phones" || path === "/messaging" || path === "/telecom") return <FleetCommsPage />;
  if (path === "/nexus" || path === "/dispatch-nexus") return <DispatchNexusPage />;
  if (path === "/freight-nexus" || path === "/freight" || path === "/broker-nexus" || path === "/shipper-connect") return <FreightNexusPage />;
  if (path === "/client-builder" || path === "/clients" || path === "/shipper-network" || path === "/client-book") return <ClientBuilderPage />;
  if (path === "/load-rework" || path === "/overweight" || path === "/lumper" || path === "/rework") return <LoadReworkPage />;
  if (path === "/a2p" || path === "/a2p-registration" || path === "/text-registration" || path === "/sms-registration") return <A2PRegistrationPage />;
  if (path === "/mechanic" || path === "/index-mechanic" || path === "/the-mechanic" || path === "/truck-mechanic") return <IndexMechanicPage />;
  if (path === "/agent-test" || path === "/agent-command" || path === "/agents-test") return <AgentCommandTestPage />;
  if (path === "/forecast" || path === "/revenue-forecast" || path === "/index-forecast") return <RevenueForecastPage />;
  if (path === "/catscales" || path === "/cat-scales" || path === "/index-catscales" || path === "/scales" || path === "/weigh-station") return <CatScalesPage />;
  if (path === "/fleet-load-board" || path === "/fleet-loads" || path === "/load-index") return <FleetLoadBoardPage />;
  if (path === "/expenses") return <ExpensesPage />;
  if (path === "/reports") return <ReportsPage />;
  if (path === "/tolls") return <TollsPage />;
  if (path === "/walkie-talk") return <DriverChatPage />;
  if (path === "/growth") return <GrowthCommandPage />;
  if (path === "/locations") return <LocationMemoryPage />;
  if (path === "/week-review") return <WeekInReviewPage />;
  if (path === "/news") return <TruckingNewsPage />;
  if (path === "/dispatch") return <DispatchRoutingAgentPage />;
  if (path === "/weather") return <WeatherPage />;
  if (path === "/breakdown") return <BreakdownPage />;
  if (path === "/dot-scorecard") return <ScorecardPage />;
  if (path === "/permit-book") return <PermitBookPage />;
  if (path === "/factoring") return <FactoringPage />;
  if (path === "/fuel-card") return <FuelCardPage />;
  if (path === "/parking" || path === "/parking-finder") return <ParkingPage />;
  if (path === "/pricing") return <PricingPage />;
  if (path === "/checkout") return <CheckoutPage />;
  if (path === "/finance-alert-agent") return <FinanceAlertAgentPage />;
  if (path === "/fleet-profile") return <FleetProfilePage />;
  if (path === "/memory-management-agent") return <MemoryManagementAgentPage />;
  if (path === "/health") return <HealthPage />;
  if (path === "/state-patrol") return <StatePatrolPage />;
  if (path === "/bypass") return <BypassPage />;
  if (path === "/detention") return <DetentionPage />;
  if (path === "/voice") return <VoicePage />;
  if (path === "/voice-clone" || path === "/voice-ai" || path === "/agent-voice") return <VoiceClonePage />;
  if (path === "/hardware-inventory-agent") return <HardwareInventoryAgentPage />;
  if (path === "/payroll") return <PayrollPage />;
  if (path === "/branding") return <BrandingCenter />;
  if (path === "/brand") return <BrandIdentity />;
  if (path === "/fmcsa-eld") return <FMCSAELDIntegration />;
  if (path === "/hos-analytics" || path === "/fatigue-analysis") return <HOSAnalyticsDashboard />;
  // One honest ELD page. The two marketing pages that used to own six of these
  // paths were deleted in the same change; every URL still lands here so no
  // bookmark dies. Originals preserved at docs/launch/*.ORIGINAL.jsx.txt.
  if (
    path === "/twe-eld" || path === "/eld" || path === "/eld-system" || path === "/hardware" ||
    path === "/eld-hardware" || path === "/eld-marketing" || path === "/hardware-bundle" ||
    path === "/morrishive-eld" || path === "/eld-revolution"
  ) return <TruckWithEaseELDPage />;
  if (path === "/fmcsa-registration") return <FMCSARegistrationPage />;
  if (path === "/hardware-bundle") return <HardwareSoftwareBundle />;
  if (path === "/pricing-strategy") return <PricingStrategy />;

  if (path === "/qa-testing") return <QATestingAgent />;
  if (path === "/feature-completion") return <FeatureCompletionAudit />;
  if (path === "/roi-calculator") return <MigrationROICalculator />;
  if (path === "/sales-collateral") return <SalesCollateral />;
  if (path === "/compliance") return <ComplianceAudit />;
  if (path === "/poc") return <ProofOfConceptSandbox />;
  if (path === "/integrations") return <IntegrationVerification />;
  if (path === "/customer-memory") return <CustomerMemorySystem />;
  if (path === "/documents") return <DocumentScanningSystem />;
  if (path === "/operations-health") return <OperationsHealthDashboard />;
  if (path === "/support-technical") return <SupportAgentTechnical />;
  if (path === "/support-billing") return <SupportAgentBilling />;
  if (path === "/financial-model") return <FinancialModelDashboard />;
  if (path === "/tutorials") return <TutorialsPage />;
  if (path === "/daily-maintenance") return <DailyMaintenanceAgent />;
  if (path === "/staff" || path === "/staff-appointed" || path === "/appointed") return <StaffAppointedPage />;
  // /entitled is the FUNCTION index (every function + its evidence). /entitled-index stays
  // the DATA index (tables, rows, filings). Both are reachable; neither shadows the other.
  if (path === "/entitled" || path === "/function-index" || path === "/functions") return <FunctionIndexPage />;
  if (path === "/entitled-index" || path === "/index" || path === "/master-hub") return <EntitledIndexPage />;
  if (path === "/low-bridges" || path === "/bridges" || path === "/clearance" || path === "/bridge-alerts") return <LowBridgePage />;
  if (path === "/dispatch-zero" || path === "/dispatch-ledger" || path === "/decision-ledger") return <DispatchZeroPage />;
  if (path === "/pre-launch" || path === "/assurance" || path === "/launch-assurance" || path === "/error-scenarios") return <PreLaunchAssurancePage />;
  if (path === "/scenarios" || path === "/launch-scenarios" || path === "/scenario-center" || path === "/coverage") return <LaunchScenarioCenterPage />;
  if (path === "/fleet-payments" || path === "/payments" || path === "/fuel-finance" || path === "/factoring-hub") return <FleetPaymentsPage />;
  if (path === "/factoring-log" || path === "/invoice-log" || path === "/load-log") return <FactoringLogPage />;
  if (path === "/fleetio" || path === "/fleetio-import" || path === "/fleet-import" || path === "/fleetio-connect") return <FleetioImportPage />;
  if (path === "/google-apis" || path === "/google-status" || path === "/google-integration") return <GoogleAPIsPage />;
  if (path === "/journey" || path === "/our-story" || path === "/platform-story") return <JourneyPage />;
  if (path === "/fleet-memory" || path === "/fleet-intelligence" || path === "/memory") return <FleetMemoryPage />;
  if (path === "/broker-arrival" || path === "/driver-notification" || path === "/arrival-alert") return <BrokerArrivalNotificationPage />;
  if (path === "/fleet-templates" || path === "/templates" || path === "/doc-builder" || path === "/document-builder") return <FleetTemplatePage />;
  if (path === "/dot-portal" || path === "/dot" || path === "/dot-mail" || path === "/random-pool") return <DOTPortalPage />;
  if (path === "/medical-cdl" || path === "/medical" || path === "/cdl-testing" || path === "/driver-compliance") return <MedicalCDLPage />;
  if (path === "/charging" || path === "/charging-stations" || path === "/ev-charging" || path === "/bike-charging") return <ChargingStationsPage />;
  if (path === "/operation-model" || path === "/ops-model") return <OperationModelPage />;
  if (path === "/workflow-streamliner" || path === "/workflow-builder" || path === "/operations" || path === "/streamliner") return <WorkflowStreamlinerPage />;
  if (path === "/astronomy" || path === "/star-navigation" || path === "/celestial-navigation" || path === "/night-driving") return <AstronomyNavigationPage />;
  if (path === "/integrations" || path === "/data-hub" || path === "/external-data") return <APIFreaksHubPage />;
  if (path === "/accessibility" || path === "/accessible" || path === "/inclusion" || path === "/inclusive-trucking") return <AccessibilityLandingPage />;
  if (path === "/tax-rates" || path === "/tax-intelligence" || path === "/fuel-tax" || path === "/tax-compliance") return <TaxRatesIntelligencePage />;
  if (path === "/rewards") return <RigBucksPage />;
  if (path === "/compliance-dvir") return <DVIRPage />;
  if (path === "/dashboard") return <CommandCenterPage />;
  if (path === "/fleet") return <CommandCenterPage />;
  if (path === "/fleet-chief") return <AICharactersPage />;
  if (path === "/fleet-tracking") return <CommandCenterPage />;
  if (path === "/command-docs") return <CommandRepository />;
  if (path === "/integration-hub") return <IntegrationHubPage />;
  if (path === "/microsoft-integration" || path === "/azure") return <MicrosoftIntegration />;
  if (path === "/satellite-maps" || path === "/maps") return <SatelliteMapsIntegration />;
  if (path === "/sign-in" || path === "/login") return <SignInPage />;
  if (path === "/commands") return <CommandOptimizer />;
  if (path === "/health-monitor") return <FeatureHealthMonitor />;
  if (path === "/fleet-dashboard-customizer") return <FleetDashboardCustomizer />;
  if (path === "/fleet-quick-actions") return <FleetQuickActions />;
  if (path === "/location-data-agent") return <LocationDataAgent />;
  if (path === "/vehicle-vin-agent") return <VehicleVINAgent />;
  if (path === "/hardware-suppliers") return <HardwareSupplierIntegration />;
  if (path === "/onboarding-glossary") return <OnboardingGlossary />;
  if (path === "/dot-compliance-vault") return <DOTComplianceVault />;
  if (path === "/contact-inbox") return <ContactMessagesInbox />;
  if (path === "/share-and-onboard") return <ShareAndOnboardPage />;
  if (path === "/driver-gala") return <DriverGalaAndroid />;
  if (path === "/walkie-talkie" || path === "/traces") return <WalkieTalkieTraces />;
  if (path === "/admin/dream-team") return <DreamTeamAdmin />;
  if (path === "/admin/suppliers") return <SupplierAdminPanel />;
  if (path === "/admin/subscriptions" || path === "/subscriber-inbox") return <SubscriptionsAdminPage />;
  if (path === "/accident-report") return <AccidentReportPage />;
  if (path === "/dot-connect") return <DOTConnectPage />;
  if (path === "/safety-sos") return <SafetySOSPage />;
  if (path === "/customer-book") return <CustomerBookPage />;
  if (path === "/competitive-intelligence" || path === "/vs-samsara" || path === "/compete") return <CompetitiveIntelligencePage />;
  if (path === "/fleet-voice" || path === "/voice-calls" || path === "/hands-free") return <FleetVoicePage />;
  if (path === "/page-guardian" || path === "/guardian" || path === "/page-monitor") return <PageGuardianAgent />;
  if (path === "/neural-safety" || path === "/safety-core" || path === "/trucking-guru") return <NeuralSafetyCore />;
  if (path === "/dispatch-core") return <DispatchCorePage />;
  if (path === "/user-guide" || path === "/guides" || path === "/help" || path === "/cheat-sheet") return <UserGuideHub />;
  if (path === "/orchestrator" || path === "/agent-council" || path === "/nofail") return <AgentOrchestrator />;
  if (path === "/profitable-lanes" || path === "/lane-intelligence" || path === "/telematics") return <ProfitableLanesPage />;
  if (path === "/app-maintenance" || path === "/maintenance-agent" || path === "/system-health") return <AppMaintenanceAgentPage />;
  if (path === "/nerve") return <DriverNervePage />;
  if (path === "/mind" || path === "/unified") return <FleetMindPage />;
  if (path === "/game-up" || path === "/gameup" || path === "/training") return <GameUpPage />;
  if (path === "/privacy" || path === "/privacy-policy" || path === "/privacy-notice" || path === "/terms" || path === "/terms-of-service" || path === "/legal") return <PrivacyPolicyPage />;
  if (path === "/documents" || path === "/docs" || path === "/document-center") return <DocumentsPage />;
  if (path === "/privacy-detailed" || path === "/privacy-full" || path === "/data-privacy") return <PrivacyDetailPage />;
  if (path === "/compliance-auth" || path === "/audit-access" || path === "/token-management") return <ComplianceAuthPage />;
  if (path === "/my-documents" || path === "/user-docs" || path === "/document-access") return <UserDocumentAccessPage />;
  if (path === "/cloud-usage" || path === "/health-monitor" || path === "/system-status") return <CloudUsageMonitorPage />;
  if (path === "/storage-growth" || path === "/scalability" || path === "/growth-intelligence") return <StorageGrowthScalabilityPage />;
  if (path === "/haptic-language" || path === "/vibration-communication" || path === "/touch-language") return <HapticLanguagePage />;
  if (path === "/captions" || path === "/live-captions" || path === "/translate") return <LiveCaptionsPage />;
  if (path === "/multi-device-haptics" || path === "/device-sync" || path === "/haptic-broadcast") return <MultiDeviceHapticsPage />;
  if (path === "/jj-keller" || path === "/compliance-training" || path === "/vehicle-compliance") return <JJKellerCompliancePage />;
  if (path === "/agent-technician" || path === "/system-monitor" || path === "/test-dashboard") return <AgentTechnicianPage />;
  if (path === "/responsible-use" || path === "/onboarding" || path === "/community-pledge") return <ResponsibleUseOnboardingPage />;
  if (path === "/health-recovery" || path === "/physical-failure" || path === "/driver-health") return <DriverHealthRecoveryPage />;
  if (path === "/medical-examiners" || path === "/examiner-locator" || path === "/dot-physicals") return <MedicalExaminerLocatorPage />;
  if (path === "/support" || path === "/help" || path === "/customer-service") return <CustomerSupportPage />;
  if (path === "/android" || path === "/android-native" || path === "/android-setup") return <AndroidNativeSetupPage />;
  if (path === "/accessibility-deaf" || path === "/deaf-access" || path === "/asl") return <AccessibilityDeafPage />;
  if (path === "/deaf-bridge" || path === "/deaf-community" || path === "/communication-bridge") return <DeafCommunityBridgePage />;
  if (path === "/accessibility-blind" || path === "/blind-access" || path === "/audio-nav") return <AccessibilityBlindPage />;
  if (path === "/human-support" || path === "/support-network" || path === "/community") return <HumanSupportNetworkPage />;
  if (path === "/maintenance" || path === "/maintenance-scheduler" || path === "/system-maintenance") return <MaintenanceSchedulerPage />;
  if (path === "/universal-access" || path === "/all-drivers" || path === "/accessibility") return <UniversalAccessibilityPage />;
  if (path === "/accessibility-agents" || path === "/agent-teams" || path === "/team-focus") return <AccessibilityAgentsPage />;
  if (path === "/accessibility-legacy" || path === "/how-we-changed-lives" || path === "/impact-story") return <AccessibilityLegacyPage />;
  if (path === "/revolution" || path === "/the-moment") return <RevolutionPage />;
  if (path === "/driver-assistance" || path === "/universal-driver" || path === "/multilingual-support") return <DriverAssistancePage />;
  if (path === "/agent-verification" || path === "/exclusive-lock" || path === "/agent-security") return <ExclusiveAgentVerificationPage />;
  if (path === "/key-security" || path === "/key-vault" || path === "/secure-keys") return <ApiKeySecurityPage />;
  if (path === "/google-play" || path === "/play-submit" || path === "/android-submit") return <GooglePlaySubmitPage />;
  if (path === "/asset-ease" || path === "/assets" || path === "/fleet-assets" || path === "/vehicle-assets" || path === "/trailer-assets") return <AssetEasePage />;
  if (path === "/live-gps" || path === "/gps" || path === "/fleet-map" || path === "/track") return <LiveGPSPage />;
  if (path === "/fleet-intelligence" || path === "/industry-ai") return <FleetIntelligencePage />;

  // ── Catch-all: unknown path → redirect home ────────────────────────────
  if (path !== "/" && path !== "/home" && !path.startsWith("/static")) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 24 }}>
        <img src="/static/twe-logo.png" alt="TruckWithEase" style={{ maxWidth: 280, marginBottom: 32, animation: "tweLogoFade 1s ease forwards" }} />
        <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 900, marginBottom: 12, textAlign: "center" }}>Taking you home…</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 32, textAlign: "center" }}>That page doesn't exist — let's get you back to TruckWithEase.</div>
        <a href="/" style={{ background: "linear-gradient(135deg,#c9a84c,#f5d78e)", color: "#0a0a0a", padding: "14px 36px", borderRadius: 8, fontWeight: 900, fontSize: 16, textDecoration: "none" }}>← Back to TruckWithEase</a>
        <div style={{ marginTop: 24, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Need something specific? <a href="/command" style={{ color: "#c9a84c" }}>Open Command Center →</a></div>
        <script dangerouslySetInnerHTML={{ __html: `setTimeout(()=>{ window.location.href='/'; }, 4000);` }} />
      </div>
    );
  }

  // Unreachable in practice: "/" and "/home" are handled by TruckWithEaseHomePage
  // above, and wouter serves pages/landing.tsx at "/". Kept as an explicit return so
  // the component always renders something.
  return <TruckWithEaseHomePage />;
}

