import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  Zap,
  Star,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Video,
  Radio,
  Award,
  Cable,
  Tablet,
  Thermometer,
  Package,
  Download,
  RefreshCw,
  FileText,
  Check,
  ExternalLink,
  Lock,
  Wrench,
  Sparkles,
  ChevronRight,
  Info,
  Phone,
  ArrowRight,
  Clock,
  Sliders,
  X,
  Activity,
  Cpu,
  Eye,
  Layers,
  MapPin,
} from 'lucide-react';
import {
  azugaEldHardwareService,
  AZUGA_HARDWARE_CATALOG,
  AzugaHardwareItem,
  HardwareCartItem,
  FleetRoiEstimate,
  AzugaOrderConfirmation,
  LiveAzugaTelemetryPoint,
} from '../services/azugaEldHardwareService';
import { triggerHapticFeedback } from '../services/haptics';

interface AzugaEldSalesPageViewProps {
  onNavigateToTab?: (tab: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AzugaEldSalesPageView: React.FC<AzugaEldSalesPageViewProps> = ({
  onNavigateToTab,
  onShowToast,
}) => {
  // Navigation & Category Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [catalog, setCatalog] = useState<AzugaHardwareItem[]>(AZUGA_HARDWARE_CATALOG);

  // Cart & Orders State
  const [cart, setCart] = useState<HardwareCartItem[]>(() => azugaEldHardwareService.getCart());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [latestOrder, setLatestOrder] = useState<AzugaOrderConfirmation | null>(null);

  // Fleet ROI Simulator State
  const [fleetSize, setFleetSize] = useState<number>(5);
  const [roiBundleType, setRoiBundleType] = useState<'BASIC_ELD' | 'AI_SAFETYCAM' | 'FULL_SUITE'>('AI_SAFETYCAM');
  const [roiData, setRoiData] = useState<FleetRoiEstimate>(() =>
    azugaEldHardwareService.calculateFleetRoi(5, 'AI_SAFETYCAM')
  );

  // Interactive Installation Truck Selector
  const [selectedTruckModel, setSelectedTruckModel] = useState<string>('FREIGHTLINER_CASCADIA');

  // Live Azuga Telemetry Stream Simulation
  const [liveTelemetry, setLiveTelemetry] = useState<LiveAzugaTelemetryPoint>(() =>
    azugaEldHardwareService.getLiveTelemetry()
  );

  // Checkout Form State
  const [companyName, setCompanyName] = useState<string>('MORRIS FREIGHT LOGISTICS');
  const [contactName, setContactName] = useState<string>('Jeremiah Morris');
  const [contactEmail, setContactEmail] = useState<string>('dispatch@morrishive.com');
  const [contactPhone, setContactPhone] = useState<string>('(800) 555-EASE');
  const [usdotNumber, setUsdotNumber] = useState<string>('4109822');
  const [shippingStreet, setShippingStreet] = useState<string>('1200 Logistics Blvd, Suite 400');
  const [shippingCity, setShippingCity] = useState<string>('Dallas');
  const [shippingState, setShippingState] = useState<string>('TX');
  const [shippingZip, setShippingZip] = useState<string>('75201');
  const [shippingMethod, setShippingMethod] = useState<'STANDARD_GROUND' | 'TWO_DAY_AIR' | 'PRIORITY_OVERNIGHT'>('STANDARD_GROUND');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Recalculate ROI when slider changes
  useEffect(() => {
    setRoiData(azugaEldHardwareService.calculateFleetRoi(fleetSize, roiBundleType));
  }, [fleetSize, roiBundleType]);

  // Live telemetry pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTelemetry(azugaEldHardwareService.getLiveTelemetry());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Update Cart handler
  const handleAddToCart = (item: AzugaHardwareItem, harness?: string) => {
    triggerHapticFeedback();
    azugaEldHardwareService.addToCart(item, 1, harness);
    setCart(azugaEldHardwareService.getCart());
    if (onShowToast) {
      onShowToast(`Added ${item.name} to cart!`, 'success');
    }
  };

  const handleUpdateQuantity = (itemId: string, qty: number) => {
    triggerHapticFeedback();
    azugaEldHardwareService.updateCartQuantity(itemId, qty);
    setCart(azugaEldHardwareService.getCart());
  };

  const handleClearCart = () => {
    triggerHapticFeedback();
    azugaEldHardwareService.clearCart();
    setCart([]);
  };

  // Submit Order
  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    triggerHapticFeedback();

    try {
      const order = await azugaEldHardwareService.submitOrder({
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        usdotNumber,
        fleetSize,
        shippingAddress: {
          street: shippingStreet,
          city: shippingCity,
          state: shippingState,
          zip: shippingZip,
        },
        shippingMethod,
        items: cart.map(c => ({ itemId: c.item.id, quantity: c.quantity, harness: c.selectedHarness })),
      });

      setLatestOrder(order);
      setCart([]);
      setIsCheckoutOpen(false);
      if (onShowToast) {
        onShowToast(`Order #${order.orderNumber} successfully processed!`, 'success');
      }
    } catch {
      if (onShowToast) {
        onShowToast('Error processing order. Please retry.', 'error');
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const cartTotals = azugaEldHardwareService.getCartTotals();

  // Filter Catalog
  const filteredCatalog = selectedCategory === 'ALL'
    ? catalog
    : catalog.filter(item => item.category === selectedCategory);

  const truckInstallationInfo: Record<string, { port: string; location: string; recommendedCable: string; notes: string }> = {
    FREIGHTLINER_CASCADIA: {
      port: '9-Pin Green Type 2 (or RP1226 under driver kick panel)',
      location: 'Driver-side left footwell under steering column or behind fuse cover.',
      recommendedCable: 'Azuga J1939 Type 2 Green Y-Cable (or RP1226 Harness)',
      notes: 'Plug-and-play in 3 minutes. Y-cable keeps lower OEM diagnostic port open for FMCSA inspections.',
    },
    KENWORTH_T680: {
      port: 'RP1226 14-Pin OEM Diagnostic Connector & 9-Pin J1939',
      location: 'Directly behind dash center tray or lower left diagnostic bracket.',
      recommendedCable: 'Azuga RP1226 Pass-Through Harness',
      notes: 'Eliminates exposed cab wires. Factory clean OEM concealed installation.',
    },
    PETERBILT_579: {
      port: 'RP1226 (2020+) or 9-Pin Type 2 Green J1939',
      location: 'Above clutch/dead pedal or center access compartment.',
      recommendedCable: 'Azuga RP1226 or Heavy-Duty Green 9-Pin Y-Cable',
      notes: 'Zero dashboard modification. Auto-detects PACCAR MX-13 / Cummins X15 engine parameters.',
    },
    VOLVO_VNL: {
      port: 'Volvo OBD-II style 16-Pin or 9-Pin Green',
      location: 'Under steering wheel dash panel cover to the left of column.',
      recommendedCable: 'Azuga Volvo/Mack 16-Pin Pass-Through Cable',
      notes: 'Fully decodes proprietary Volvo D13 CAN-bus fuel & safety telemetry.',
    },
    MACK_ANTHEM: {
      port: 'Mack 16-Pin Diagnostic Connector / 9-Pin J1939',
      location: 'Lower left dashboard panel adjacent to fuse box.',
      recommendedCable: 'Azuga Mack Heavy-Duty Diagnostic Y-Harness',
      notes: 'Instant mDRIVE transmission and MP8 engine parameter calibration.',
    },
    INTERNATIONAL_LT: {
      port: '9-Pin Type 2 Green J1939',
      location: 'Directly under dash to left of steering column on metal mounting bracket.',
      recommendedCable: 'Azuga 9-Pin Green Type 2 Y-Cable',
      notes: 'Standard 9-Pin twist-lock connection. 100% mechanical securement against road vibration.',
    },
  };

  return (
    <div className="w-full bg-black text-white p-3 sm:p-6 lg:p-8 pb-8 space-y-8 font-sans selection:bg-[#FFE600] selection:text-black">
      
      {/* ========================================================================= */}
      {/* TOP HEADER & AZUGA CO-BRANDED HERO                                        */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-[#FFE600] p-6 sm:p-10 shadow-[0_0_50px_rgba(255,230,0,0.15)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFE600]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-[#FFE600] text-black font-black text-xs uppercase tracking-widest rounded-md font-mono shadow-[0_0_15px_rgba(255,230,0,0.3)]">
                OFFICIAL TELEMATICS PARTNER
              </span>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 font-mono text-xs rounded-md border border-zinc-700">
                FMCSA 49 CFR § 395 REGISTERED
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-mono text-xs rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% ZERO-DOWNTIME GUARANTEE
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              TRUCKWITHEASE <span className="text-[#FFE600]">× AZUGA</span>
              <br />
              <span className="text-zinc-400 text-2xl sm:text-3xl font-bold">
                COMMERCIAL ELD &amp; HARDWARE SALES
              </span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Industrial-grade plug-and-play telematics, AI dashcams, and solar asset trackers engineered for high-mileage fleets.
              Fair, transparent pricing with <strong className="text-[#FFE600]">35% - 40% value markup</strong> that keeps hardware affordable
              while delivering unmatched reliability, automated FMCSA eRODS audit defense, and up to 18% insurance premium discounts.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('hardware-catalog-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-sm uppercase tracking-wider rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_25px_rgba(255,230,0,0.35)] cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" /> Shop Hardware Catalog
              </button>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-6 py-3.5 bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl border border-zinc-600 flex items-center gap-2 transition cursor-pointer"
              >
                <FileText className="w-5 h-5 text-[#FFE600]" /> Request 14-Day Fleet Demo
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-mono text-sm rounded-xl border border-zinc-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-[#FFE600]" />
                <span>Cart ({cartTotals.totalItems})</span>
                {cartTotals.totalItems > 0 && (
                  <span className="px-2 py-0.5 bg-[#FFE600] text-black text-xs font-black rounded-full">
                    ${cartTotals.subtotalRetail.toLocaleString()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Live Telemetry Diagnostic Snapshot */}
          <div className="bg-black/80 border border-zinc-800 p-5 rounded-2xl w-full lg:w-80 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  LIVE AZUGA CAN-STREAM
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">J1939 500k</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">VEHICLE SPEED</span>
                <span className="text-lg font-black text-white">{liveTelemetry.speedMph} <span className="text-xs font-normal text-zinc-400">MPH</span></span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">ENGINE RPM</span>
                <span className="text-lg font-black text-[#FFE600]">{liveTelemetry.engineRpm}</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">ODOMETER</span>
                <span className="text-sm font-bold text-white">{liveTelemetry.odometerMiles.toLocaleString()} MI</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">COOLANT TEMP</span>
                <span className="text-sm font-bold text-white">{liveTelemetry.coolantTempF}°F</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-400 font-bold">DUTY STATUS:</span>
              <span className="text-white px-2 py-0.5 bg-emerald-500/20 rounded font-bold">
                {liveTelemetry.hosAutoDutyStatus}
              </span>
            </div>
            
            <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
              <span>ZERO-LOSS BUFFER: ACTIVE</span>
              <span className="text-emerald-400">0 DROPPED PACKETS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VALUE HIGHLIGHTS / 100% NO-DOWNTIME GUARANTEE PILLARS                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-[#FFE600]/50 transition space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#FFE600]/10 border border-[#FFE600]/30 flex items-center justify-center text-[#FFE600]">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">35% - 40% Transparent Markup</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Zero enterprise price gouging. Direct partner wholesale pass-through + modest markup ensures low fleet entry costs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-[#FFE600]/50 transition space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">100% No Downtime Telematics</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Dual LTE-M + assisted GPS + onboard 10,000-packet non-volatile flash buffer preserves logs during dead zones.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-[#FFE600]/50 transition space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">FMCSA 49 CFR § 395 Certified</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Pre-registered on official FMCSA registry. Instant roadside inspection transfer via Web Services &amp; Encrypted Email.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-[#FFE600]/50 transition space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">5-Minute Plug &amp; Play Setup</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Pre-configured to your USDOT before leaving the warehouse. Pass-through Y-cables keep mechanics and DOT happy.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE FLEET ROI & MARGIN SIMULATOR                                  */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-zinc-950 border-2 border-zinc-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#FFE600]" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                FLEET VALUE &amp; ROI SIMULATOR
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Adjust your power unit count to see exact upfront wholesale vs retail pricing, dealer markup margin, and expected annual return.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setRoiBundleType('BASIC_ELD')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                roiBundleType === 'BASIC_ELD' ? 'bg-[#FFE600] text-black font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Basic ELD One
            </button>
            <button
              onClick={() => setRoiBundleType('AI_SAFETYCAM')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                roiBundleType === 'AI_SAFETYCAM' ? 'bg-[#FFE600] text-black font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Safety Sentinel (ELD + AI Cam)
            </button>
            <button
              onClick={() => setRoiBundleType('FULL_SUITE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                roiBundleType === 'FULL_SUITE' ? 'bg-[#FFE600] text-black font-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Full Cold-Chain Suite
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FFE600]" /> Fleet Size (Commercial Power Units):
            </label>
            <span className="text-2xl font-black font-mono text-[#FFE600] bg-zinc-900 px-4 py-1 rounded-lg border border-zinc-700">
              {fleetSize} {fleetSize === 1 ? 'TRUCK' : 'TRUCKS'}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="100"
            value={fleetSize}
            onChange={(e) => setFleetSize(parseInt(e.target.value))}
            className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FFE600]"
          />
          <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
            <span>1 Truck (Owner-Operator)</span>
            <span>25 Trucks (Regional Fleet)</span>
            <span>50 Trucks (Mid-Sized Carrier)</span>
            <span>100+ Trucks (Enterprise)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-1">
            <span className="text-[11px] text-zinc-400 font-mono uppercase">Wholesale Partner Cost</span>
            <div className="text-xl font-bold font-mono text-zinc-300">
              ${roiData.hardwareUpfrontCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-500">Azuga direct partner baseline</span>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-1">
            <span className="text-[11px] text-zinc-400 font-mono uppercase">Retail Total (35-40% Markup)</span>
            <div className="text-xl font-bold font-mono text-white">
              ${roiData.hardwareRetailTotal.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              +${roiData.totalMarkupProfit.toLocaleString()} Gross Margin
            </span>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-1">
            <span className="text-[11px] text-zinc-400 font-mono uppercase">Annual Fleet Savings</span>
            <div className="text-xl font-black font-mono text-emerald-400">
              ${roiData.totalAnnualFleetSavings.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-400">Violations + Idle + Insurance</span>
          </div>

          <div className="bg-gradient-to-br from-[#FFE600]/20 to-black border border-[#FFE600] p-4 rounded-xl space-y-1 shadow-[0_0_20px_rgba(255,230,0,0.15)]">
            <span className="text-[11px] text-[#FFE600] font-mono font-bold uppercase">Net 1st-Year ROI</span>
            <div className="text-2xl font-black font-mono text-[#FFE600]">
              {roiData.netFirstYearRoiPercent}%
            </div>
            <span className="text-[10px] text-zinc-300">Net Return on Hardware Investment</span>
          </div>
        </div>

        <div className="text-xs text-zinc-400 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#FFE600] flex-shrink-0 mt-0.5" />
          <span>
            Savings benchmarked against FMCSA 2025/2026 data: Average HOS violation fine of $3,200 avoided, 1 hour daily fuel idle reduction saving ~$1,400/truck, and up to 18% insurance premium reduction with Azuga SafetyCam AI video telematics.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HARDWARE CATALOG FILTER TABS & PRODUCT GRID                               */}
      {/* ========================================================================= */}
      <div id="hardware-catalog-grid" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Package className="w-6 h-6 text-[#FFE600]" />
              AZUGA HARDWARE INVENTORY
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Select individual components or complete turnkey commercial bundles. All items in stock and ready to ship.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Hardware' },
              { id: 'TURNKEY_BUNDLE', label: 'Turnkey Bundles' },
              { id: 'ELD_GATEWAY', label: 'ELD Units' },
              { id: 'AI_DASHCAM', label: 'AI DashCams' },
              { id: 'ASSET_TRACKER', label: 'Trailer & Asset GPS' },
              { id: 'CABLES_MOUNTS', label: 'Cables & Docks' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#FFE600] text-black font-black shadow-[0_0_15px_rgba(255,230,0,0.3)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.map(item => {
            const isCarted = cart.some(c => c.item.id === item.id);
            return (
              <div
                key={item.id}
                className="relative bg-zinc-950 border-2 border-zinc-800 hover:border-[#FFE600] rounded-2xl p-6 transition flex flex-col justify-between group shadow-lg"
              >
                {/* Popular or Category Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 bg-zinc-900 text-zinc-300 font-mono text-[10px] rounded-md border border-zinc-700 uppercase">
                    {item.category.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-1 bg-[#FFE600]/20 text-[#FFE600] font-mono font-bold text-[10px] rounded-md border border-[#FFE600]/40 uppercase">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white group-hover:text-[#FFE600] transition">
                    {item.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {item.subtitle}
                  </p>

                  {/* Pricing Box (Wholesale vs Retail + Markup %) */}
                  <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono block">RETAIL PRICE</span>
                        <span className="text-2xl font-black font-mono text-white">
                          ${item.retailPriceUsd.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 font-mono block">WHOLESALE COST</span>
                        <span className="text-xs font-mono line-through text-zinc-500">
                          ${item.wholesalePriceUsd.toFixed(2)}
                        </span>
                        <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded">
                          +{item.markupPercent.toFixed(1)}% Markup
                        </span>
                      </div>
                    </div>

                    {item.monthlyServiceFeeUsd > 0 && (
                      <div className="text-[11px] text-zinc-400 font-mono border-t border-zinc-800 pt-2 flex items-center justify-between">
                        <span>Cloud Telematics Service:</span>
                        <span className="text-white font-bold">${item.monthlyServiceFeeUsd.toFixed(2)} / mo</span>
                      </div>
                    )}
                  </div>

                  {/* Key Features List */}
                  <ul className="space-y-1.5 text-xs text-zinc-300 py-2">
                    {item.keyFeatures.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#FFE600] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Technical Spec Pills */}
                  <div className="bg-black/50 p-3 rounded-lg border border-zinc-800 space-y-1 text-[11px] font-mono text-zinc-400">
                    <div className="flex justify-between">
                      <span>Installation:</span>
                      <span className="text-white">{item.specs.installationTimeMin} Minutes (DIY)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Warranty:</span>
                      <span className="text-white">{item.specs.warrantyYears} Years Replacement</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connectivity:</span>
                      <span className="text-emerald-400 truncate max-w-[150px]">{item.specs.connectivity}</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Actions */}
                <div className="pt-5 mt-4 border-t border-zinc-800 flex items-center gap-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 py-3 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-[0_0_15px_rgba(255,230,0,0.25)] cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {isCarted ? 'Add Another' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={() => {
                      handleAddToCart(item);
                      setIsCheckoutOpen(true);
                    }}
                    className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs uppercase rounded-xl border border-zinc-700 transition cursor-pointer"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5-MINUTE SELF-INSTALLATION GUIDE (INTERACTIVE TRUCK SELECTOR)             */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-zinc-950 border-2 border-zinc-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Wrench className="w-6 h-6 text-[#FFE600]" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                5-MINUTE PLUG &amp; PLAY INSTALLATION GUIDE
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Select your tractor manufacturer to view exact diagnostic port location, cable compatibility, and zero-wire splicing steps.
            </p>
          </div>

          <select
            value={selectedTruckModel}
            onChange={(e) => setSelectedTruckModel(e.target.value)}
            className="bg-zinc-900 border-2 border-[#FFE600] text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <option value="FREIGHTLINER_CASCADIA">Freightliner Cascadia</option>
            <option value="KENWORTH_T680">Kenworth T680 / T880</option>
            <option value="PETERBILT_579">Peterbilt 579 / 389</option>
            <option value="VOLVO_VNL">Volvo VNL / VNR Series</option>
            <option value="MACK_ANTHEM">Mack Anthem / Pinnacle</option>
            <option value="INTERNATIONAL_LT">International LT / ProStar</option>
          </select>
        </div>

        {/* 4 Interactive Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#FFE600] text-black font-black text-xs font-mono flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-white text-sm">Locate Diagnostic Port</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {truckInstallationInfo[selectedTruckModel].location}
            </p>
            <div className="text-[10px] font-mono text-[#FFE600] bg-black/40 p-2 rounded border border-zinc-800">
              Port: {truckInstallationInfo[selectedTruckModel].port}
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#FFE600] text-black font-black text-xs font-mono flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-white text-sm">Connect Y-Pass Cable</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Plug the female end of our pass-through Y-cable into the tractor's port and remount the male end into the dash bracket.
            </p>
            <div className="text-[10px] font-mono text-zinc-300 bg-black/40 p-2 rounded border border-zinc-800">
              Recommended: {truckInstallationInfo[selectedTruckModel].recommendedCable}
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#FFE600] text-black font-black text-xs font-mono flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-white text-sm">Attach Azuga ELD One</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Plug the Azuga ELD One gateway into the secondary branch of the Y-cable and secure it with the included heavy-duty zip tie.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 bg-black/40 p-2 rounded border border-zinc-800">
              Status LEDs: Solid Green = GPS &amp; CAN Active
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#FFE600] text-black font-black text-xs font-mono flex items-center justify-center">
              4
            </span>
            <h4 className="font-bold text-white text-sm">Launch TRUCKWITHEASE</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Open the TRUCKWITHEASE Driver Co-Pilot app. Bluetooth will automatically pair with your pre-configured gateway within 30 seconds.
            </p>
            <div className="text-[10px] font-mono text-sky-400 bg-black/40 p-2 rounded border border-zinc-800">
              {truckInstallationInfo[selectedTruckModel].notes}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 100% NO-DOWNTIME ARCHITECTURE & FAILOVER BREAKDOWN                        */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border-2 border-emerald-500/40 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-400">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              100% ZERO-DOWNTIME TELEMATICS FAILOVER GUARANTEE
            </h3>
            <p className="text-xs text-zinc-400">
              How TRUCKWITHEASE &amp; Azuga eliminate dropped HOS duty cycles, missing miles, and roadside inspection transfer errors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="bg-black/60 border border-zinc-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
              <span>PRIMARY CONDUIT</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <h4 className="font-bold text-white text-sm">Dual LTE-M Carrier Auto-Switching</h4>
            <p className="text-zinc-400 leading-relaxed">
              Azuga ELD hardware integrates multi-carrier eSIM roaming across AT&amp;T, Verizon, and T-Mobile towers. It dynamically switches carriers in under 400 milliseconds if signal degrades.
            </p>
          </div>

          <div className="bg-black/60 border border-zinc-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
              <span>DEAD-ZONE FALLBACK</span>
              <span className="text-sky-400 font-bold">READY</span>
            </div>
            <h4 className="font-bold text-white text-sm">In-Cab Encrypted Flash Ring Buffer</h4>
            <p className="text-zinc-400 leading-relaxed">
              When traveling through remote western mountains or dead zones, the gateway stores up to 10,000 continuous second-by-second records locally in encrypted flash storage.
            </p>
          </div>

          <div className="bg-black/60 border border-zinc-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
              <span>ROADSIDE AUDIT RECOVERY</span>
              <span className="text-[#FFE600] font-bold">INSTANT</span>
            </div>
            <h4 className="font-bold text-white text-sm">Direct BLE eRODS Air-Drop</h4>
            <p className="text-zinc-400 leading-relaxed">
              If an FMCSA or state trooper conducts a Level 1 inspection while cellular is down, the driver can transmit official eRODS CSV records directly via Bluetooth local transfer to the officer's terminal.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CART DRAWER MODAL                                                         */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl w-full max-w-xl h-full max-h-[90vh] flex flex-col justify-between shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#FFE600]" />
                <h3 className="text-lg font-black text-white">YOUR HARDWARE CART</h3>
                <span className="text-xs font-mono text-zinc-400">({cartTotals.totalItems} items)</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-12 h-12 text-zinc-600 mx-auto" />
                  <p className="text-zinc-400 text-sm">Your cart is currently empty.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-4 py-2 bg-[#FFE600] text-black font-bold text-xs uppercase rounded-lg cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                cart.map(c => (
                  <div
                    key={c.item.id}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-white">{c.item.name}</h4>
                      <div className="text-xs font-mono text-[#FFE600]">
                        ${c.item.retailPriceUsd.toFixed(2)} each
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Cost: ${c.item.wholesalePriceUsd.toFixed(2)} (+{c.item.markupPercent.toFixed(1)}% margin)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-black p-1 rounded-lg border border-zinc-800">
                        <button
                          onClick={() => handleUpdateQuantity(c.item.id, c.quantity - 1)}
                          className="w-7 h-7 text-xs font-bold text-zinc-400 hover:text-white flex items-center justify-center rounded cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold px-2">{c.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(c.item.id, c.quantity + 1)}
                          className="w-7 h-7 text-xs font-bold text-zinc-400 hover:text-white flex items-center justify-center rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleUpdateQuantity(c.item.id, 0)}
                        className="text-xs text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-zinc-800 pt-4 space-y-4">
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Retail Subtotal:</span>
                    <span className="text-white">${cartTotals.subtotalRetail.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Dealer Wholesale Margin:</span>
                    <span>${cartTotals.totalMarkupMargin.toLocaleString()} (avg {cartTotals.markupPercentAverage}%)</span>
                  </div>
                  {cartTotals.monthlyRecurringTotal > 0 && (
                    <div className="flex justify-between text-sky-400">
                      <span>Monthly Telematics Fee:</span>
                      <span>${cartTotals.monthlyRecurringTotal.toLocaleString()} / mo</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-800 pt-2">
                    <span>Total Upfront:</span>
                    <span className="text-base text-[#FFE600] font-black">${cartTotals.subtotalRetail.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleClearCart}
                    className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs uppercase rounded-xl border border-zinc-700 cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="flex-1 py-3 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,230,0,0.3)]"
                  >
                    Proceed to Fleet Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKOUT MODAL                                                            */}
      {/* ========================================================================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-950 border-2 border-[#FFE600] rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(255,230,0,0.2)] my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#FFE600]" />
                  FLEET HARDWARE CHECKOUT &amp; PRE-CONFIGURATION
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Devices will be pre-registered with your USDOT number before shipping.
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">Company / Carrier Legal Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-[#FFE600] outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">USDOT Number</label>
                  <input
                    type="text"
                    required
                    value={usdotNumber}
                    onChange={(e) => setUsdotNumber(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-[#FFE600] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-[#FFE600] outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">Email (For Invoices &amp; eRODS)</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-[#FFE600] outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">Direct Phone</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-[#FFE600] outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <label className="text-zinc-400 font-mono block mb-1">Shipping Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingStreet}
                  onChange={(e) => setShippingStreet(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-[#FFE600] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-[#FFE600] outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-[#FFE600] outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">Zip Code</label>
                  <input
                    type="text"
                    required
                    value={shippingZip}
                    onChange={(e) => setShippingZip(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-[#FFE600] outline-none"
                  />
                </div>
              </div>

              {/* Shipping Speed Selection */}
              <div>
                <label className="text-zinc-400 font-mono block mb-1.5">Shipping Speed</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('STANDARD_GROUND')}
                    className={`p-3 rounded-xl border text-left font-mono transition cursor-pointer ${
                      shippingMethod === 'STANDARD_GROUND'
                        ? 'border-[#FFE600] bg-[#FFE600]/10 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Standard Ground</div>
                    <div className="text-[11px] text-emerald-400">FREE Promotion</div>
                    <div className="text-[10px] text-zinc-500">3-5 Business Days</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('TWO_DAY_AIR')}
                    className={`p-3 rounded-xl border text-left font-mono transition cursor-pointer ${
                      shippingMethod === 'TWO_DAY_AIR'
                        ? 'border-[#FFE600] bg-[#FFE600]/10 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">2-Day Air Priority</div>
                    <div className="text-[11px] text-[#FFE600]">$24.95</div>
                    <div className="text-[10px] text-zinc-500">2 Business Days</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('PRIORITY_OVERNIGHT')}
                    className={`p-3 rounded-xl border text-left font-mono transition cursor-pointer ${
                      shippingMethod === 'PRIORITY_OVERNIGHT'
                        ? 'border-[#FFE600] bg-[#FFE600]/10 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Priority Overnight</div>
                    <div className="text-[11px] text-[#FFE600]">$49.95</div>
                    <div className="text-[10px] text-zinc-500">Next Morning 10:30 AM</div>
                  </button>
                </div>
              </div>

              {/* Order Summary Confirmation */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-2 font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Retail Equipment Subtotal:</span>
                  <span className="text-white">${cartTotals.subtotalRetail.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Estimated Freight Shipping:</span>
                  <span className="text-emerald-400">
                    {shippingMethod === 'STANDARD_GROUND' ? 'FREE' : shippingMethod === 'TWO_DAY_AIR' ? '$24.95' : '$49.95'}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Estimated State Tax (6.5%):</span>
                  <span className="text-white">${(cartTotals.subtotalRetail * 0.065).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white border-t border-zinc-800 pt-2">
                  <span>Total Due Today:</span>
                  <span className="text-[#FFE600] font-black text-lg">
                    ${(
                      cartTotals.subtotalRetail +
                      (shippingMethod === 'TWO_DAY_AIR' ? 24.95 : shippingMethod === 'PRIORITY_OVERNIGHT' ? 49.95 : 0) +
                      cartTotals.subtotalRetail * 0.065
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="py-3.5 px-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase rounded-xl border border-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 py-3.5 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,230,0,0.35)]"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Authorizing Fleet Order...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" /> Place Order &amp; Pre-Register Devices
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER CONFIRMATION INVOICE MODAL                                          */}
      {/* ========================================================================= */}
      {latestOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-950 border-2 border-emerald-500 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] my-8">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">
                HARDWARE ORDER AUTHORIZED
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                Order #{latestOrder.orderNumber} · Azuga Gateway Tracking ID: {latestOrder.carrierTrackingNumber}
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Carrier USDOT:</span>
                <span className="text-white font-bold">{latestOrder.usdotNumber}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Total Items:</span>
                <span className="text-white">{latestOrder.totalItemsCount} Hardware Units</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Estimated Delivery:</span>
                <span className="text-[#FFE600] font-bold">{latestOrder.estimatedDeliveryDate}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Dealer Markup Margin:</span>
                <span className="text-emerald-400 font-bold">+${latestOrder.totalMarkupMarginUsd.toFixed(2)} ({latestOrder.markupPercentAverage}%)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1">
                <span>Total Invoiced:</span>
                <span className="text-[#FFE600] text-base">${latestOrder.totalAmountUsd.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl text-xs space-y-1.5 text-zinc-300">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> FMCSA Certified &amp; Pre-Paired
              </div>
              <p className="text-[11px] leading-relaxed">
                Your devices are currently being programmed in our hardware facility with your USDOT ({latestOrder.usdotNumber}). When the box arrives, simply plug in the pass-through Y-cable. Zero manual setup required.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase rounded-xl border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Print Invoice
              </button>
              <button
                onClick={() => setLatestOrder(null)}
                className="flex-1 py-3 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Done / Back to Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14-DAY FLEET PILOT DEMO MODAL                                             */}
      {/* ========================================================================= */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFE600]" />
                <h3 className="text-lg font-black text-white">14-DAY FLEET PILOT KIT</h3>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Test drive the Azuga ELD One and AI Dual DashCam on your highest-mileage rig for 14 days with zero risk and no upfront card required.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-mono block mb-1">Company / Fleet Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Express Lines"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-mono block mb-1">USDOT Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1234567"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-mono block mb-1">Fleet Contact Phone</label>
                <input
                  type="text"
                  placeholder="(555) 000-0000"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                triggerHapticFeedback();
                setIsDemoModalOpen(false);
                if (onShowToast) {
                  onShowToast('14-Day Pilot Demo Request dispatched to Azuga Fleet Specialist!', 'success');
                }
              }}
              className="w-full py-3.5 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,230,0,0.3)] cursor-pointer"
            >
              Ship My 14-Day Pilot Kit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
