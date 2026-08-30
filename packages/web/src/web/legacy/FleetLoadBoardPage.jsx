import { useState, useEffect, useRef, useCallback } from 'react';
import { pb } from './lib/pb';
import { checkEntityWarnings, logAction } from './lib/fleetMemory';
import ContextualHelp from './components/ContextualHelp';
import BadgeShowcase from './components/BadgeShowcase';

// Brand palette only — gold on black. The original assigned every load board,
// status and alert its own hue (green, blue, orange,
// purple #a855f7, red #ef4444 plus a dozen vendor brand colors). All replaced
// with brand tokens: gold = good/active, copper = warn/stop, gray = neutral info.
const GOLD   = '#C9A84C';
const GOLDBR = '#FFD700';
const BLACK  = '#0a0a0a';
const DARK   = '#111111';
const CARD   = '#161616';
const CARD2  = '#1e1e1e';
const BORDER = '#222222';
const MUTED  = '#8a8a8a';
const DIM    = '#666666';
const WARN   = '#c96a4c';
// Back-compat aliases so the rest of the file needs no edits.
const GREEN  = GOLD;
const RED    = WARN;
const BLUE   = MUTED;
const ORANGE = WARN;
const PURPLE = MUTED;

const SOURCES = [
  { id: 'dat',        label: 'DAT',              color: BLUE },
  { id: 'truckstop',  label: 'Truckstop',        color: GREEN },
  { id: 'convoy',     label: 'Convoy',            color: MUTED },
  { id: 'uber',       label: 'Uber Freight',      color: DIM },
  { id: 'loadsmart',  label: 'Loadsmart',         color: PURPLE },
  { id: 'coyote',     label: 'Coyote',            color: ORANGE },
  { id: 'chrobinson', label: 'CH Robinson',       color: MUTED },
  { id: 'lb123',      label: '123Loadboard',      color: WARN },
  { id: 'next',       label: 'Next Trucking',     color: MUTED },
  { id: 'amazon',     label: 'Amazon Relay',      color: MUTED },
  { id: 'direct',     label: 'Direct Shippers',   color: GOLD },
  { id: 'sylectus',   label: 'Sylectus',          color: MUTED },
];

const EQUIPMENT = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Tanker', 'Box Truck', 'Lowboy'];
const STATUSES  = ['available', 'claimed', 'in_transit', 'delivered', 'cancelled'];

function statusColor(s) {
  if (s === 'available')   return GREEN;
  if (s === 'claimed')     return GOLD;
  if (s === 'in_transit')  return BLUE;
  if (s === 'delivered')   return GOLD;
  if (s === 'cancelled')   return RED;
  return '#666';
}
function statusLabel(s) {
  if (s === 'available')  return 'Available';
  if (s === 'claimed')    return 'Claimed';
  if (s === 'in_transit') return 'In Transit';
  if (s === 'delivered')  return 'Delivered';
  if (s === 'cancelled')  return 'Cancelled';
  return s;
}

const GOAT_TIPS = [
  "Prioritize loads with rate/mile above $6.50 — those are your money lanes.",
  "Reefer loads in summer average 18% higher rates. Position trailers for produce season.",
  "CH Robinson and Coyote pay within 30 days. Ideal for cash flow management.",
  "Amazon Relay loads have the lowest detention risk — your drivers get in and out fast.",
  "Loadsmart's instant booking locks your rate before the market moves.",
  "Next Trucking port loads: highest $/mile but require chassis and customs knowledge.",
  "Stack loads within 150 miles of each other for max efficiency per fuel stop.",
  "Convoy no-touch freight = lower driver fatigue. Schedule those on long weeks.",
];

const MOCK_LOADS = [
  { id:'FL-001', source:'dat',        shipper:'Midwest Auto Parts',   origin_city:'St. Louis',   origin_state:'MO', dest_city:'Chicago',      dest_state:'IL', miles:298, rate:2450, rate_per_mile:8.22, weight:'41,500 lbs', commodity:'Auto Parts',       equipment:'Dry Van',  pickup_date:'Today 08:00',    status:'available', assigned_driver:'', assigned_truck:'', notes:'' },
  { id:'FL-002', source:'truckstop',  shipper:'Kroger Distribution',  origin_city:'Memphis',     origin_state:'TN', dest_city:'Atlanta',      dest_state:'GA', miles:392, rate:2880, rate_per_mile:7.35, weight:'43,200 lbs', commodity:'Food/Groceries',   equipment:'Reefer',   pickup_date:'Tomorrow 06:00', status:'available', assigned_driver:'', assigned_truck:'', notes:'' },
  { id:'FL-003', source:'convoy',     shipper:'Convoy Premium',       origin_city:'Seattle',     origin_state:'WA', dest_city:'Portland',     dest_state:'OR', miles:185, rate:1620, rate_per_mile:8.76, weight:'38,500 lbs', commodity:'Electronics',      equipment:'Dry Van',  pickup_date:'Today 09:00',    status:'claimed',   assigned_driver:'Jeremiah M.', assigned_truck:'Truck 1', notes:'' },
  { id:'FL-004', source:'chrobinson', shipper:'Target Corp',          origin_city:'Minneapolis', origin_state:'MN', dest_city:'Chicago',      dest_state:'IL', miles:410, rate:3300, rate_per_mile:8.05, weight:'44,000 lbs', commodity:'Retail',           equipment:'Dry Van',  pickup_date:'Tomorrow 09:00', status:'available', assigned_driver:'', assigned_truck:'', notes:'' },
  { id:'FL-005', source:'amazon',     shipper:'Amazon Fulfillment',   origin_city:'Phoenix',     origin_state:'AZ', dest_city:'Los Angeles',  dest_state:'CA', miles:370, rate:1650, rate_per_mile:4.46, weight:'28,000 lbs', commodity:'E-Commerce',       equipment:'Dry Van',  pickup_date:'Today 16:00',    status:'in_transit',assigned_driver:'Kyleigh M.', assigned_truck:'Truck 2', notes:'' },
  { id:'FL-006', source:'lb123',      shipper:'Owner Direct LLC',     origin_city:'Denver',      origin_state:'CO', dest_city:'Salt Lake City',dest_state:'UT', miles:525, rate:2100, rate_per_mile:4.00, weight:'32,000 lbs', commodity:'General Freight',  equipment:'Dry Van',  pickup_date:'Today 12:00',    status:'available', assigned_driver:'', assigned_truck:'', notes:'' },
  { id:'FL-007', source:'coyote',     shipper:'Coyote Logistics',     origin_city:'Dallas',      origin_state:'TX', dest_city:'Houston',      dest_state:'TX', miles:240, rate:1800, rate_per_mile:7.50, weight:'39,000 lbs', commodity:'Industrial',       equipment:'Flatbed', pickup_date:'Today 14:00',    status:'available', assigned_driver:'', assigned_truck:'', notes:'' },
  { id:'FL-008', source:'loadsmart',  shipper:'Loadsmart Shipper',    origin_city:'Charlotte',   origin_state:'NC', dest_city:'Atlanta',      dest_state:'GA', miles:246, rate:1950, rate_per_mile:7.93, weight:'40,000 lbs', commodity:'Building Mat.',    equipment:'Flatbed', pickup_date:'Tomorrow 07:00', status:'available', assigned_driver:'', assigned_truck:'', notes:'' },
];

export default function FleetLoadBoardPage() {
  const [fleets, setFleets]         = useState([]);
  const [activeFleet, setActiveFleet] = useState(null);
  const [loads, setLoads]           = useState([]);
  const [tab, setTab]               = useState('board');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [goatTip, setGoatTip]       = useState(0);
  const [goatScanning, setGoatScanning] = useState(false);
  const [goatInsight, setGoatInsight] = useState('');
  const [showAddFleet, setShowAddFleet] = useState(false);
  const [showAddLoad, setShowAddLoad]   = useState(false);
  const [newFleet, setNewFleet]     = useState({ fleet_name:'', owner:'', truck_count:0, trailer_count:0, dot_number:'', mc_number:'', primary_lanes:'', equipment_types:'', status:'active' });
  const [newLoad, setNewLoad]       = useState({ load_id:'', source:'dat', shipper:'', origin_city:'', origin_state:'', dest_city:'', dest_state:'', miles:0, rate:0, rate_per_mile:0, weight:'', commodity:'', equipment:'Dry Van', pickup_date:'', status:'available', assigned_driver:'', assigned_truck:'', notes:'' });
  const [saving, setSaving]         = useState(false);
  const [indexing, setIndexing]     = useState(false);
  const [indexResult, setIndexResult] = useState(null);
  const [shipperWarning, setShipperWarning] = useState(null);
  const [shipperChecking, setShipperChecking] = useState(false);
  const shipperCheckTimer = useRef(null);
  const tipTimer = useRef(null);
  const [escalateLoad, setEscalateLoad] = useState(null);
  const [escalatedIds, setEscalatedIds] = useState({});
  const [copyDone, setCopyDone] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertsGenerated, setAlertsGenerated] = useState(false);
  const [alertsRunning, setAlertsRunning] = useState(false);
  const [sentAlerts, setSentAlerts] = useState({});
  const [alertCopyId, setAlertCopyId] = useState(null);
  const [schedulerOn, setSchedulerOn] = useState(() => localStorage.getItem('lb_scheduler') === '1');
  const [lastAutoRun, setLastAutoRun] = useState(() => localStorage.getItem('lb_last_auto_run') || null);
  const [nextRunIn, setNextRunIn] = useState('');
  const schedulerTimer = useRef(null);
  const countdownTimer = useRef(null);

  useEffect(() => {
    loadFleets();
    tipTimer.current = setInterval(() => setGoatTip(t => (t+1) % GOAT_TIPS.length), 8000);
    return () => clearInterval(tipTimer.current);
  }, []);

  useEffect(() => {
    if (activeFleet) loadLoads(activeFleet.id);
  }, [activeFleet]);

  // Scheduler: re-run agent every 24h if enabled
  useEffect(() => {
    function startScheduler() {
      clearInterval(schedulerTimer.current);
      clearInterval(countdownTimer.current);
      if (!schedulerOn) { setNextRunIn(''); return; }

      const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
      const lastRun = localStorage.getItem('lb_last_auto_run');
      const now = Date.now();
      const elapsed = lastRun ? now - Number(lastRun) : INTERVAL_MS;
      const remaining = Math.max(INTERVAL_MS - elapsed, 0);

      // countdown display
      countdownTimer.current = setInterval(() => {
        const lastR = localStorage.getItem('lb_last_auto_run');
        const rem = Math.max(INTERVAL_MS - (Date.now() - Number(lastR || 0)), 0);
        const h = Math.floor(rem / 3600000);
        const m = Math.floor((rem % 3600000) / 60000);
        setNextRunIn(`${h}h ${m}m`);
      }, 30000);

      // immediate tick if overdue
      if (remaining === 0) {
        setLastAutoRun(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }));
        localStorage.setItem('lb_last_auto_run', String(Date.now()));
        generateBrokerAlerts();
      }

      schedulerTimer.current = setInterval(() => {
        localStorage.setItem('lb_last_auto_run', String(Date.now()));
        setLastAutoRun(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }));
        generateBrokerAlerts();
      }, INTERVAL_MS);
    }

    startScheduler();
    return () => {
      clearInterval(schedulerTimer.current);
      clearInterval(countdownTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedulerOn, loads]);

  async function loadFleets() {
    try {
      const res = await pb.collection('fleet_profiles').getList(1, 50, { sort: '-created' });
      if (res.items.length > 0) {
        setFleets(res.items);
        setActiveFleet(res.items[0]);
      } else {
        setFleets([]);
        setActiveFleet(null);
        setLoads(MOCK_LOADS);
      }
    } catch { setLoads(MOCK_LOADS); }
  }

  async function loadLoads(fleetId) {
    try {
      const res = await pb.collection('fleet_load_boards').getList(1, 200, {
        filter: `fleet_id = "${fleetId}"`,
        sort: '-created'
      });
      setLoads(res.items.length > 0 ? res.items : MOCK_LOADS);
    } catch { setLoads(MOCK_LOADS); }
  }

  async function saveFleet() {
    if (!newFleet.fleet_name.trim()) return;
    setSaving(true);
    try {
      const created = await pb.collection('fleet_profiles').create({ ...newFleet, status: 'active' });
      setFleets(prev => [created, ...prev]);
      setActiveFleet(created);
      setShowAddFleet(false);
      setNewFleet({ fleet_name:'', owner:'', truck_count:0, trailer_count:0, dot_number:'', mc_number:'', primary_lanes:'', equipment_types:'', status:'active' });
    } catch(e) { console.error(e); }
    setSaving(false);
  }

  async function saveLoad() {
    if (!activeFleet) return;
    setSaving(true);
    try {
      const lid = 'FL-' + Date.now().toString().slice(-5);
      const payload = { ...newLoad, fleet_id: activeFleet.id, fleet_name: activeFleet.fleet_name, load_id: lid, miles: Number(newLoad.miles)||0, rate: Number(newLoad.rate)||0, rate_per_mile: Number(newLoad.rate_per_mile)||0 };
      const created = await pb.collection('fleet_load_boards').create(payload);
      setLoads(prev => [created, ...prev]);
      setShowAddLoad(false);
      setShipperWarning(null);
      setNewLoad({ load_id:'', source:'dat', shipper:'', origin_city:'', origin_state:'', dest_city:'', dest_state:'', miles:0, rate:0, rate_per_mile:0, weight:'', commodity:'', equipment:'Dry Van', pickup_date:'', status:'available', assigned_driver:'', assigned_truck:'', notes:'' });
    } catch(e) { console.error(e); }
    setSaving(false);
  }

  /**
   * Records the driver's decision on a load into /api/algorithm/signal so the learning
   * layer can build customer / load / route patterns from real choices.
   * Guarded: the FL-0xx rows on this board are seeded sample loads, and feeding those into
   * the algorithm would teach it fabricated preferences. Only real records are recorded.
   */
  async function recordLoadSignal(load, newStatus) {
    if (!load?.id || load.id.startsWith('FL-0')) return;
    const kind = newStatus === 'claimed' ? 'load_accepted'
      : newStatus === 'cancelled' ? 'load_declined'
      : null;
    if (!kind) return;
    const driverId = load.assigned_driver_id || activeFleet?.driver_id || null;
    if (!driverId) return;
    const rpm = Number(load.rate_per_mile) || (Number(load.rate) && Number(load.miles) ? Number(load.rate) / Number(load.miles) : null);
    try {
      await fetch('/api/algorithm/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          dimension: 'load',
          kind,
          subject: load.shipper || load.source || null,
          numericValue: rpm,
          unit: rpm ? 'usd_per_mile' : null,
          source: 'fleet-load-board',
          meta: JSON.stringify({
            loadId: load.id,
            equipment: load.equipment || null,
            lane: load.origin_city && load.dest_city ? `${load.origin_city}, ${load.origin_state} → ${load.dest_city}, ${load.dest_state}` : null,
            miles: Number(load.miles) || null,
            rate: Number(load.rate) || null,
          }),
        }),
      });
    } catch { /* a failed signal must never block the status change */ }
  }

  async function updateLoadStatus(load, newStatus) {
    try {
      if (load.id && !load.id.startsWith('FL-0')) {
        await pb.collection('fleet_load_boards').update(load.id, { status: newStatus });
      }
      recordLoadSignal(load, newStatus);
      setLoads(prev => prev.map(l => l.id === load.id ? { ...l, status: newStatus } : l));
      if (selectedLoad?.id === load.id) setSelectedLoad(prev => ({ ...prev, status: newStatus }));
    } catch { setLoads(prev => prev.map(l => l.id === load.id ? { ...l, status: newStatus } : l)); }
  }

  function handleShipperInput(val) {
    setNewLoad(p => ({...p, shipper: val}));
    setShipperWarning(null);
    clearTimeout(shipperCheckTimer.current);
    if (!val || val.length < 3) return;
    shipperCheckTimer.current = setTimeout(async () => {
      setShipperChecking(true);
      const result = await checkEntityWarnings(val);
      setShipperWarning(result);
      setShipperChecking(false);
    }, 700);
  }

  function generateBrokerAlerts() {
    setAlertsRunning(true);
    setTimeout(() => {
      const generated = [];

      // Group loads by shipper/broker
      const brokerMap = {};
      loads.forEach(load => {
        const name = load.shipper || 'Unknown';
        if (!brokerMap[name]) brokerMap[name] = [];
        brokerMap[name].push(load);
      });

      Object.entries(brokerMap).forEach(([broker, brokerLoads]) => {
        const available   = brokerLoads.filter(l => l.status === 'available');
        const claimed     = brokerLoads.filter(l => l.status === 'claimed');
        const inTransit   = brokerLoads.filter(l => l.status === 'in_transit');
        const cancelled   = brokerLoads.filter(l => l.status === 'cancelled');
        const avgRPM      = brokerLoads.reduce((s,l) => s+(Number(l.rate_per_mile)||0),0) / brokerLoads.length;
        const avgRate     = brokerLoads.reduce((s,l) => s+(Number(l.rate)||0),0) / brokerLoads.length;
        const totalValue  = brokerLoads.reduce((s,l) => s+(Number(l.rate)||0),0);
        const lanes       = [...new Set(brokerLoads.map(l => `${l.origin_city}, ${l.origin_state} → ${l.dest_city}, ${l.dest_state}`))];
        const equipment   = [...new Set(brokerLoads.map(l => l.equipment).filter(Boolean))];

        // TREND: multiple available loads = capacity available, broker may not know
        if (available.length >= 2) {
          generated.push({
            id: `${broker}-capacity`,
            broker,
            type: 'CAPACITY AVAILABLE',
            urgency: 'high',
            color: MUTED,
            icon: '🚛',
            trend: `${available.length} loads unclaimed on your board from this broker`,
            message: `Hi ${broker} team,\n\nThis is an automated capacity alert from ${activeFleet?.fleet_name || 'TruckWithEase Fleet'}.\n\nWe currently have ${available.length} of your loads sitting unclaimed on our board:\n${available.slice(0,3).map(l => `  • ${l.origin_city}, ${l.origin_state} → ${l.dest_city}, ${l.dest_state} — $${Number(l.rate).toLocaleString()} ($${Number(l.rate_per_mile).toFixed(2)}/mi)`).join('\n')}\n\nWe have qualified drivers and equipment ready to move these now. To get these loaded faster, we recommend:\n  1. Confirming rate with us directly at 636-706-8338\n  2. Sending carrier packet acceptance to truckeasecare@gmail.com\n  3. Providing pickup contacts so our drivers can stage immediately\n\nOur MC# is ${activeFleet?.mc_number || '[MC]'} · DOT# ${activeFleet?.dot_number || '[DOT]'}\n\nReady to move. Let's connect.\n\n${activeFleet?.fleet_name || 'TruckWithEase'} Dispatch`,
          });
        }

        // TREND: low RPM — broker needs to know we need rate adjustment
        if (avgRPM < 5.5 && available.length > 0) {
          generated.push({
            id: `${broker}-rate`,
            broker,
            type: 'RATE ADJUSTMENT NEEDED',
            urgency: 'critical',
            color: WARN,
            icon: '💰',
            trend: `Average $${avgRPM.toFixed(2)}/mi is below market — loads sitting unclaimed`,
            message: `Hi ${broker},\n\nRate advisory from ${activeFleet?.fleet_name || 'TruckWithEase Fleet'} — automated market analysis.\n\nYour loads in our system are averaging $${avgRPM.toFixed(2)}/mi. Current market rate for ${equipment.join('/')||'dry van'} in these lanes is running $6.00–$8.50/mi.\n\nBelow-market rates = longer pickup delays and risk of load falling through. Our drivers will prioritize higher-paying loads first.\n\nLanes affected:\n${lanes.slice(0,3).map(l => `  • ${l}`).join('\n')}\n\nTo get faster coverage, we'd need rates adjusted to at least $${(avgRPM * 1.2).toFixed(2)}/mi. Happy to negotiate lane-by-lane. Call 636-706-8338 or email truckeasecare@gmail.com.\n\n${activeFleet?.fleet_name || 'TruckWithEase'} Load Intelligence`,
          });
        }

        // TREND: high value lane — broker should know we want more of these
        if (avgRPM >= 7.5 && brokerLoads.length >= 1) {
          generated.push({
            id: `${broker}-preferred`,
            broker,
            type: 'PREFERRED BROKER — MORE LOADS WANTED',
            urgency: 'low',
            color: '#c9a84c',
            icon: '⭐',
            trend: `Strong lane at $${avgRPM.toFixed(2)}/mi avg — we want to deepen this relationship`,
            message: `Hi ${broker},\n\nPartnership update from ${activeFleet?.fleet_name || 'TruckWithEase Fleet'}.\n\nYour loads are performing well in our system — averaging $${avgRPM.toFixed(2)}/mi across ${brokerLoads.length} load${brokerLoads.length!==1?'s':''}. Our drivers prefer these lanes and we have consistent capacity.\n\nWe'd like to expand our volume with you. If you have recurring freight on these routes, we can offer:\n  • Priority pickup within 2 hours of booking\n  • Dedicated driver for your lanes\n  • Real-time updates at every stop\n\nLet's set up a preferred carrier agreement. Contact us at 636-706-8338 or truckeasecare@gmail.com.\n\n${activeFleet?.fleet_name || 'TruckWithEase'} Dispatch`,
          });
        }

        // TREND: cancelled loads = something is wrong
        if (cancelled.length >= 1 && brokerLoads.length > 1) {
          generated.push({
            id: `${broker}-cancelled`,
            broker,
            type: 'CANCELLATION PATTERN',
            urgency: 'high',
            color: WARN,
            icon: '⚠️',
            trend: `${cancelled.length} cancelled load${cancelled.length!==1?'s':''} — possible communication breakdown`,
            message: `Hi ${broker},\n\nThis is a follow-up from ${activeFleet?.fleet_name || 'TruckWithEase Fleet'} regarding recent cancellations.\n\nWe've had ${cancelled.length} load${cancelled.length!==1?'s':''} cancelled on our board from your company. Cancellations hurt both sides — we lose driver time and you lose coverage.\n\nTo prevent future cancellations, we need:\n  1. Confirmed pickup times before loads go live\n  2. Accurate shipper contact info at each facility\n  3. Rate lock confirmation in writing\n\nWe want this relationship to work. Let's get on a quick call: 636-706-8338.\n\n${activeFleet?.fleet_name || 'TruckWithEase'} Operations`,
          });
        }
      });

      // Global trend: if nothing is moving at all
      const totalAvailable = loads.filter(l => l.status === 'available').length;
      const totalActive    = loads.filter(l => ['claimed','in_transit'].includes(l.status)).length;
      if (totalAvailable > 4 && totalActive === 0) {
        generated.unshift({
          id: 'global-stall',
          broker: 'ALL BROKERS',
          type: 'BOARD STALL — MASS FOLLOW-UP',
          urgency: 'critical',
          color: WARN,
          icon: '🚨',
          trend: `${totalAvailable} loads available, 0 active — full board stall detected`,
          message: `URGENT — Fleet capacity alert.\n\nThis is ${activeFleet?.fleet_name || 'TruckWithEase Fleet'}. Our load board shows ${totalAvailable} available loads with zero active pickups. This is a board stall.\n\nIf you have a load assigned to us, please respond immediately:\n  📞 Call: 636-706-8338\n  ✉️ Email: truckeasecare@gmail.com\n\nWe have drivers staged and ready. Every hour of delay costs money on both sides. First broker to confirm gets our available equipment.\n\n${activeFleet?.fleet_name || 'TruckWithEase'} — Active Fleet`,
        });
      }

      setAlerts(generated);
      setAlertsGenerated(true);
      setAlertsRunning(false);
    }, 2000);
  }

  function toggleScheduler() {
    const next = !schedulerOn;
    setSchedulerOn(next);
    localStorage.setItem('lb_scheduler', next ? '1' : '0');
    if (next) {
      localStorage.setItem('lb_last_auto_run', String(Date.now()));
      setLastAutoRun(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }));
    }
  }

  function markAlertSent(alertId) {
    setSentAlerts(prev => ({ ...prev, [alertId]: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }));
    try {
      pb.collection('user_activity_index').create({
        module: 'LoadBoard',
        action_type: 'broker_alert_sent',
        detail: `Broker alert dispatched for alert ID: ${alertId}`,
        session_id: 'alert-' + Date.now()
      }).catch(() => {});
    } catch {}
  }

  function handleEscalate(load, e) {
    e.stopPropagation();
    setEscalateLoad(load);
    setCopyDone(false);
  }

  function confirmEscalate(load) {
    setEscalatedIds(prev => ({ ...prev, [load.id]: true }));
    try {
      pb.collection('user_activity_index').create({
        module: 'LoadBoard',
        action_type: 'escalate_load',
        detail: `Escalated no-response on load ${load.load_id || load.id} — ${load.shipper} — ${load.origin_city} → ${load.dest_city}`,
        value: load.rate || 0,
        session_id: 'lb-' + Date.now()
      }).catch(() => {});
    } catch {}
    setEscalateLoad(null);
  }

  function buildOutreachScript(load) {
    return `Hi, this is [YOUR NAME] with ${activeFleet?.fleet_name || 'our fleet'}.\n\nI'm following up on load #${load.load_id || load.id} — ${load.origin_city}, ${load.origin_state} to ${load.dest_city}, ${load.dest_state}, ${load.miles} miles, $${Number(load.rate).toLocaleString()} rate.\n\nWe have a ${load.equipment || 'dry van'} available and ready to move this load. Our MC# is ${activeFleet?.mc_number || '[MC NUMBER]'} and DOT# is ${activeFleet?.dot_number || '[DOT NUMBER]'}.\n\nPlease confirm if this load is still available. We can have a driver ready within [X hours]. Contact me at 636-706-8338 or truckeasecare@gmail.com.\n\nThank you,\n[YOUR NAME]\n${activeFleet?.fleet_name || 'TruckWithEase Fleet'}`;
  }

  function runGoatIndex() {
    setIndexing(true);
    setGoatInsight('');
    setGoatScanning(true);
    setTimeout(() => {
      const available  = loads.filter(l => l.status === 'available').length;
      const active     = loads.filter(l => l.status === 'in_transit' || l.status === 'claimed').length;
      const totalRate  = loads.reduce((s,l) => s + (Number(l.rate)||0), 0);
      const avgRPM     = loads.length ? (loads.reduce((s,l)=>s+(Number(l.rate_per_mile)||0),0)/loads.length).toFixed(2) : 0;
      const topLoad    = [...loads].sort((a,b)=>b.rate-a.rate)[0];
      const topSource  = SOURCES.find(s => s.id === (loads.sort((a,b)=>b.rate-a.rate)[0]?.source))?.label || 'DAT';
      setGoatInsight(`⚡ INTELLIGENCE INDEX COMPLETE — ${loads.length} loads scanned across ${activeFleet?.fleet_name || 'your fleet'} in 0.3s. ${available} loads available now. ${active} loads active on road. Total board value: $${totalRate.toLocaleString()}. Average rate/mile: $${avgRPM}. Top load pays $${topLoad?.rate?.toLocaleString() || '—'} (${topSource}). THE GOAT recommends: ${GOAT_TIPS[Math.floor(Math.random() * GOAT_TIPS.length)]}`);
      setIndexing(false);
      setGoatScanning(false);
    }, 2200);
  }

  const filtered = loads.filter(l => {
    if (filterSource !== 'all' && l.source !== filterSource) return false;
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    return true;
  });

  const totalValue = loads.reduce((s,l) => s + (Number(l.rate)||0), 0);
  const available  = loads.filter(l => l.status === 'available').length;
  const active     = loads.filter(l => ['claimed','in_transit'].includes(l.status)).length;
  const delivered  = loads.filter(l => l.status === 'delivered').length;

  return (
    <div style={{ minHeight:'100vh', background: BLACK, color:'#fff', fontFamily:'Inter, sans-serif' }}>
      {/* HEADER */}
      <div style={{ background: DARK, borderBottom:`2px solid ${GOLD}`, padding:'0 24px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background: GOLD, boxShadow:`0 0 12px ${GOLD}` }} />
            <span style={{ fontFamily:'Bebas Neue, sans-serif', fontSize:22, letterSpacing:3, color: GOLD }}>FLEET LOAD BOARD</span>
            <span style={{ fontSize:11, color:'#555', letterSpacing:2, textTransform:'uppercase' }}>Powered by THE GOAT</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setShowAddFleet(true)} style={{ background:'transparent', border:`1px solid ${GOLD}`, color: GOLD, padding:'8px 16px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:600 }}>+ Add Fleet</button>
            <button onClick={runGoatIndex} disabled={indexing} style={{ background: indexing ? '#333' : GOLD, color: BLACK, padding:'8px 18px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:6, border:'none' }}>
              {indexing ? <><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⚡</span> Indexing…</> : '⚡ GOAT Index'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'24px 16px' }}>
        {/* GOAT INSIGHT BANNER */}
        {goatInsight && (
          <div style={{ background:`linear-gradient(135deg, #1a1400, #0a0800)`, border:`1px solid ${GOLD}`, borderRadius:10, padding:'14px 18px', marginBottom:20, display:'flex', gap:12, alignItems:'flex-start' }}>
            <span style={{ fontSize:24, flexShrink:0 }}>🐐</span>
            <div>
              <div style={{ color: GOLD, fontWeight:700, fontSize:12, letterSpacing:2, marginBottom:4 }}>THE GOAT INTELLIGENCE ANALYSIS</div>
              <div style={{ color:'#ddd', fontSize:13, lineHeight:1.6 }}>{goatInsight}</div>
            </div>
            <button onClick={() => setGoatInsight('')} style={{ background:'none', border:'none', color:'#555', cursor:'pointer', fontSize:18, marginLeft:'auto' }}>×</button>
          </div>
        )}

        {/* GOAT TIP TICKER */}
        {!goatInsight && (
          <div style={{ background: CARD, border:`1px solid #2a2a2a`, borderRadius:8, padding:'10px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10, overflow:'hidden' }}>
            <span style={{ fontSize:18 }}>🐐</span>
            <span style={{ color:'#888', fontSize:11, letterSpacing:2 }}>THE GOAT SAYS:</span>
            <span style={{ color:'#ccc', fontSize:13, transition:'opacity 0.5s' }}>{GOAT_TIPS[goatTip]}</span>
          </div>
        )}

        {/* FLEET SELECTOR */}
        {fleets.length > 0 && (
          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
            {fleets.map(f => (
              <button key={f.id} onClick={() => setActiveFleet(f)}
                style={{ background: activeFleet?.id===f.id ? GOLD : CARD, color: activeFleet?.id===f.id ? BLACK : '#ccc', border:`1px solid ${activeFleet?.id===f.id ? GOLD : '#333'}`, padding:'8px 16px', borderRadius:20, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                {f.fleet_name}
              </button>
            ))}
          </div>
        )}

        {/* STATS ROW */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:24 }}>
          {[
            { label:'Board Value', value:`$${totalValue.toLocaleString()}`, color: GOLD, icon:'💰' },
            { label:'Available',   value: available,  color: GREEN,  icon:'✅' },
            { label:'Active',      value: active,     color: BLUE,   icon:'🚛' },
            { label:'Delivered',   value: delivered,  color: PURPLE, icon:'📦' },
            { label:'Total Loads', value: loads.length, color:'#888', icon:'📋' },
          ].map(stat => (
            <div key={stat.label} style={{ background: CARD, border:`1px solid #222`, borderRadius:10, padding:'14px 16px' }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{stat.icon}</div>
              <div style={{ color: stat.color, fontSize:22, fontWeight:700, fontFamily:'Bebas Neue, sans-serif', letterSpacing:1 }}>{stat.value}</div>
              <div style={{ color:'#555', fontSize:11, letterSpacing:1, textTransform:'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CONTEXTUAL HELP */}
        <div style={{ marginBottom: 20 }}>
          <ContextualHelp module="Load Board" userType="fleet_manager" />
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:`1px solid #222`, paddingBottom:0 }}>
          {[{id:'board', label:'📋 Load Board'}, {id:'active', label:'🚛 Active Loads'}, {id:'analytics', label:'📊 Analytics'}, {id:'alerts', label:'🔔 Broker Alerts'}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background:'none', border:'none', color: tab===t.id ? GOLD : '#555', padding:'10px 18px', cursor:'pointer', fontSize:13, fontWeight:600, borderBottom: tab===t.id ? `2px solid ${GOLD}` : '2px solid transparent', marginBottom:-1 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* FILTERS */}
        {tab === 'board' && (
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
              style={{ background: CARD2, border:`1px solid #333`, color:'#ccc', padding:'8px 12px', borderRadius:6, fontSize:13, cursor:'pointer' }}>
              <option value="all">All Sources</option>
              {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ background: CARD2, border:`1px solid #333`, color:'#ccc', padding:'8px 12px', borderRadius:6, fontSize:13, cursor:'pointer' }}>
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
            <button onClick={() => setShowAddLoad(true)}
              style={{ marginLeft:'auto', background: GREEN, color:'#000', border:'none', padding:'8px 16px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700 }}>
              + Add Load
            </button>
          </div>
        )}

        {/* LOAD BOARD TAB */}
        {tab === 'board' && (
          <div style={{ display:'grid', gap:10 }}>
            {filtered.map(load => {
              const src = SOURCES.find(s => s.id === load.source);
              return (
                <div key={load.id} onClick={() => setSelectedLoad(selectedLoad?.id===load.id ? null : load)}
                  style={{ background: CARD, border:`1px solid ${selectedLoad?.id===load.id ? GOLD : '#222'}`, borderRadius:10, padding:'14px 16px', cursor:'pointer', transition:'border-color 0.2s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    {/* Source badge */}
                    <div style={{ background: src?.color+'22', border:`1px solid ${src?.color}44`, color: src?.color, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, flexShrink:0 }}>{src?.label || load.source}</div>
                    {/* Route */}
                    <div style={{ flex:1, minWidth:200 }}>
                      <span style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{load.origin_city}, {load.origin_state}</span>
                      <span style={{ color:'#555', margin:'0 8px' }}>→</span>
                      <span style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{load.dest_city}, {load.dest_state}</span>
                    </div>
                    {/* Miles */}
                    <div style={{ color:'#888', fontSize:13 }}>{Number(load.miles).toLocaleString()} mi</div>
                    {/* Rate */}
                    <div style={{ color: GOLD, fontFamily:'Bebas Neue, sans-serif', fontSize:22, letterSpacing:1 }}>${Number(load.rate).toLocaleString()}</div>
                    {/* RPM */}
                    <div style={{ color: GREEN, fontSize:13, fontWeight:700 }}>${Number(load.rate_per_mile).toFixed(2)}/mi</div>
                    {/* Status */}
                    <div style={{ background: statusColor(load.status)+'22', border:`1px solid ${statusColor(load.status)}44`, color: statusColor(load.status), padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{statusLabel(load.status)}</div>
                  </div>

                  {/* Expanded Detail */}
                  {selectedLoad?.id === load.id && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid #2a2a2a`, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12 }}>
                      <div><div style={{ color:'#555', fontSize:11, marginBottom:2 }}>SHIPPER</div><div style={{ color:'#ccc', fontSize:13 }}>{load.shipper || '—'}</div></div>
                      <div><div style={{ color:'#555', fontSize:11, marginBottom:2 }}>COMMODITY</div><div style={{ color:'#ccc', fontSize:13 }}>{load.commodity || '—'}</div></div>
                      <div><div style={{ color:'#555', fontSize:11, marginBottom:2 }}>EQUIPMENT</div><div style={{ color:'#ccc', fontSize:13 }}>{load.equipment || '—'}</div></div>
                      <div><div style={{ color:'#555', fontSize:11, marginBottom:2 }}>WEIGHT</div><div style={{ color:'#ccc', fontSize:13 }}>{load.weight || '—'}</div></div>
                      <div><div style={{ color:'#555', fontSize:11, marginBottom:2 }}>PICKUP</div><div style={{ color:'#ccc', fontSize:13 }}>{load.pickup_date || '—'}</div></div>
                      <div><div style={{ color:'#555', fontSize:11, marginBottom:2 }}>DRIVER</div><div style={{ color:'#ccc', fontSize:13 }}>{load.assigned_driver || 'Unassigned'}</div></div>
                      <div><div style={{ color:'#555', fontSize:11, marginBottom:2 }}>TRUCK</div><div style={{ color:'#ccc', fontSize:13 }}>{load.assigned_truck || 'Unassigned'}</div></div>
                      <div><div style={{ color:'#555', fontSize:11, marginBottom:2 }}>NOTES</div><div style={{ color:'#ccc', fontSize:13 }}>{load.notes || '—'}</div></div>
                      {/* Actions */}
                      <div style={{ gridColumn:'1/-1', display:'flex', gap:8, flexWrap:'wrap', paddingTop:8 }}>
                        {load.status === 'available' && <button onClick={e=>{e.stopPropagation();updateLoadStatus(load,'claimed')}} style={{ background: GOLD, color: BLACK, border:'none', padding:'7px 14px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>Claim Load</button>}
                        {load.status === 'claimed'   && <button onClick={e=>{e.stopPropagation();updateLoadStatus(load,'in_transit')}} style={{ background: BLUE, color:'#fff', border:'none', padding:'7px 14px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>Mark In Transit</button>}
                        {load.status === 'in_transit'&& <button onClick={e=>{e.stopPropagation();updateLoadStatus(load,'delivered')}} style={{ background: GREEN, color:'#000', border:'none', padding:'7px 14px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>Mark Delivered</button>}
                        {load.status !== 'cancelled' && load.status !== 'delivered' && <button onClick={e=>{e.stopPropagation();updateLoadStatus(load,'cancelled')}} style={{ background:'transparent', color: RED, border:`1px solid ${RED}`, padding:'7px 14px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>Cancel</button>}
                        {load.status === 'available' && (
                          escalatedIds[load.id]
                            ? <div style={{ fontSize:11, color:GOLD, padding:'7px 12px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:6 }}>✅ Follow-up sent — escalated</div>
                            : <button onClick={e => handleEscalate(load, e)} style={{ background:'transparent', color:WARN, border:`1px solid ${WARN}`, padding:'7px 14px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>📣 No Response — Follow Up</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ textAlign:'center', color:'#444', padding:'60px 0', fontSize:14 }}>No loads match your filters.</div>}
          </div>
        )}

        {/* ACTIVE LOADS TAB */}
        {tab === 'active' && (
          <div style={{ display:'grid', gap:10 }}>
            {loads.filter(l => ['claimed','in_transit'].includes(l.status)).map(load => {
              const src = SOURCES.find(s => s.id === load.source);
              return (
                <div key={load.id} style={{ background: CARD, border:`2px solid ${statusColor(load.status)}44`, borderRadius:10, padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background: statusColor(load.status), boxShadow:`0 0 8px ${statusColor(load.status)}`, animation: load.status==='in_transit'?'pulse 2s infinite':undefined }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{load.origin_city}, {load.origin_state} → {load.dest_city}, {load.dest_state}</div>
                      <div style={{ color:'#666', fontSize:12, marginTop:2 }}>Driver: {load.assigned_driver||'Unassigned'} · Truck: {load.assigned_truck||'Unassigned'} · {src?.label}</div>
                    </div>
                    <div style={{ color: GOLD, fontFamily:'Bebas Neue, sans-serif', fontSize:22 }}>${Number(load.rate).toLocaleString()}</div>
                    <div style={{ background: statusColor(load.status)+'22', border:`1px solid ${statusColor(load.status)}44`, color: statusColor(load.status), padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700 }}>{statusLabel(load.status)}</div>
                  </div>
                </div>
              );
            })}
            {loads.filter(l => ['claimed','in_transit'].includes(l.status)).length === 0 &&
              <div style={{ textAlign:'center', color:'#444', padding:'60px 0', fontSize:14 }}>No active loads right now. Claim a load from the board to get started.</div>}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16 }}>
            {/* Revenue by Source */}
            <div style={{ background: CARD, border:`1px solid #222`, borderRadius:10, padding:20 }}>
              <div style={{ color: GOLD, fontWeight:700, fontSize:13, letterSpacing:2, marginBottom:16 }}>REVENUE BY SOURCE</div>
              {SOURCES.map(src => {
                const srcLoads = loads.filter(l => l.source === src.id);
                const total = srcLoads.reduce((s,l) => s + (Number(l.rate)||0), 0);
                const pct   = totalValue > 0 ? (total / totalValue * 100) : 0;
                if (!total) return null;
                return (
                  <div key={src.id} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:'#aaa' }}>{src.label}</span>
                      <span style={{ fontSize:12, color: GOLD, fontWeight:700 }}>${total.toLocaleString()}</span>
                    </div>
                    <div style={{ background:'#222', borderRadius:4, height:6 }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: src.color, borderRadius:4 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Status Breakdown */}
            <div style={{ background: CARD, border:`1px solid #222`, borderRadius:10, padding:20 }}>
              <div style={{ color: GOLD, fontWeight:700, fontSize:13, letterSpacing:2, marginBottom:16 }}>STATUS BREAKDOWN</div>
              {STATUSES.map(s => {
                const count = loads.filter(l => l.status === s).length;
                const pct   = loads.length > 0 ? (count / loads.length * 100) : 0;
                return (
                  <div key={s} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:'#aaa' }}>{statusLabel(s)}</span>
                      <span style={{ fontSize:12, color: statusColor(s), fontWeight:700 }}>{count}</span>
                    </div>
                    <div style={{ background:'#222', borderRadius:4, height:6 }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: statusColor(s), borderRadius:4 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* GOAT Recommendations */}
            <div style={{ background:`linear-gradient(135deg, #1a1400, #0a0800)`, border:`1px solid ${GOLD}44`, borderRadius:10, padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <span style={{ fontSize:20 }}>🐐</span>
                <div style={{ color: GOLD, fontWeight:700, fontSize:13, letterSpacing:2 }}>GOAT INTELLIGENCE</div>
              </div>
              {GOAT_TIPS.slice(0,4).map((tip, i) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:12 }}>
                  <div style={{ width:6, height:6, background: GOLD, borderRadius:'50%', flexShrink:0, marginTop:5 }} />
                  <div style={{ color:'#aaa', fontSize:12, lineHeight:1.6 }}>{tip}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* BROKER ALERTS TAB */}
        {tab === 'alerts' && (
          <div>
            {/* Header + Run Button */}
            <div style={{ background:`linear-gradient(135deg, #111111, #161616)`, border:`1px solid ${BORDER}`, borderRadius:12, padding:20, marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ color:MUTED, fontFamily:'Bebas Neue, sans-serif', fontSize:22, letterSpacing:3, marginBottom:6 }}>🔔 BROKER ALERT AGENT</div>
                  <div style={{ color:'#888', fontSize:13, lineHeight:1.6, maxWidth:480 }}>
                    The agent scans every load on your board, identifies trends — stalled loads, low rates, cancellation patterns, preferred lanes — and generates smart messages to each broker so they respond faster and pay better.
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                  <button onClick={generateBrokerAlerts} disabled={alertsRunning}
                    style={{ background: alertsRunning ? BORDER : 'linear-gradient(135deg, #2a2a2a, #1a1a1a)', color:'#fff', border:'none', padding:'12px 22px', borderRadius:8, cursor: alertsRunning ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:700, minWidth:160, display:'flex', alignItems:'center', gap:8 }}>
                    {alertsRunning ? (
                      <><span style={{ display:'inline-block', animation:'spin 1s linear infinite', fontSize:16 }}>⚙️</span> Analyzing…</>
                    ) : (
                      <><span>⚡</span> {alertsGenerated ? 'Re-Analyze' : 'Run Agent'}</>
                    )}
                  </button>
                  {/* Daily Auto-Run Toggle */}
                  <button onClick={toggleScheduler}
                    style={{ background: schedulerOn ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${schedulerOn ? 'rgba(201,168,76,0.4)' : '#333'}`, color: schedulerOn ? GOLD : '#555', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
                    <span style={{ fontSize:14 }}>{schedulerOn ? '🟢' : '⚫'}</span>
                    {schedulerOn ? `AUTO-RUN ON · next in ${nextRunIn || '24h 0m'}` : 'AUTO-RUN OFF'}
                  </button>
                  {schedulerOn && lastAutoRun && (
                    <div style={{ color:'#444', fontSize:10 }}>Last auto-run: {lastAutoRun}</div>
                  )}
                </div>
              </div>
              {!alertsGenerated && !alertsRunning && (
                <div style={{ marginTop:16, display:'flex', gap:16, flexWrap:'wrap' }}>
                  {[
                    { icon:'📊', label:'Trend Detection', desc:'Spots stalled, low-rate, and ghosted loads' },
                    { icon:'✍️', label:'Auto-Written Scripts', desc:'Ready-to-send messages for each broker' },
                    { icon:'📋', label:'One-Tap Copy', desc:'Copy the message and send it yourself' },
                    { icon:'✅', label:'Sent Tracking', desc:'Marks alerts as sent so nothing slips' },
                  ].map((f,i) => (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', flex:'1 1 180px' }}>
                      <span style={{ fontSize:18 }}>{f.icon}</span>
                      <div>
                        <div style={{ color:MUTED, fontSize:12, fontWeight:700 }}>{f.label}</div>
                        <div style={{ color:'#555', fontSize:11, marginTop:2 }}>{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alert Cards */}
            {alertsGenerated && alerts.length === 0 && (
              <div style={{ textAlign:'center', color:GOLD, padding:'40px 0', fontSize:14 }}>
                ✅ No alerts needed — your board looks healthy and brokers are responsive.
              </div>
            )}

            {alerts.map(alert => (
              <div key={alert.id} style={{ background: CARD, border:`1px solid ${alert.color}44`, borderRadius:12, padding:20, marginBottom:14 }}>
                {/* Alert header */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:18 }}>{alert.icon}</span>
                      <div style={{ background:`${alert.color}22`, border:`1px solid ${alert.color}44`, color: alert.color, padding:'2px 10px', borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:1 }}>{alert.urgency?.toUpperCase()}</div>
                      <div style={{ color:'#555', fontSize:11, fontWeight:700, letterSpacing:1 }}>{alert.type}</div>
                    </div>
                    <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{alert.broker}</div>
                    <div style={{ color:'#666', fontSize:12, marginTop:3 }}>📈 Trend: {alert.trend}</div>
                  </div>
                  {sentAlerts[alert.id]
                    ? <div style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', color:GOLD, padding:'6px 14px', borderRadius:8, fontSize:11, fontWeight:700, flexShrink:0 }}>✅ Sent at {sentAlerts[alert.id]}</div>
                    : <div style={{ background:`${alert.color}15`, border:`1px solid ${alert.color}33`, color: alert.color, padding:'6px 12px', borderRadius:8, fontSize:11, fontWeight:700, flexShrink:0 }}>⏳ Pending</div>
                  }
                </div>

                {/* Message preview */}
                <div style={{ background:CARD, border:'1px solid #1e1e1e', borderRadius:8, padding:14, marginBottom:12 }}>
                  <div style={{ color:'#555', fontSize:10, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Agent-Written Message</div>
                  <pre style={{ color:'rgba(255,255,255,0.65)', fontSize:11.5, lineHeight:1.75, whiteSpace:'pre-wrap', margin:0, fontFamily:'monospace' }}>{alert.message}</pre>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button onClick={() => {
                    navigator.clipboard.writeText(alert.message).then(() => {
                      setAlertCopyId(alert.id);
                      setTimeout(() => setAlertCopyId(null), 2500);
                    }).catch(() => {});
                  }} style={{ background: alertCopyId===alert.id ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.05)', border:`1px solid ${alertCopyId===alert.id ? GOLD : '#333'}`, color: alertCopyId===alert.id ? GOLD : '#aaa', padding:'8px 16px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                    {alertCopyId===alert.id ? '✅ Copied!' : '📋 Copy Message'}
                  </button>
                  <a href={`mailto:?subject=Load Alert — ${alert.broker}&body=${encodeURIComponent(alert.message)}`}
                    style={{ textDecoration:'none' }}>
                    <button style={{ background:'rgba(138,138,138,0.1)', border:'1px solid rgba(138,138,138,0.3)', color:MUTED, padding:'8px 16px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>✉️ Open in Email</button>
                  </a>
                  <a href="tel:6367068338" style={{ textDecoration:'none' }}>
                    <button style={{ background:'rgba(201,168,76,0.08)', border:`1px solid ${GOLD}44`, color: GOLD, padding:'8px 16px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>📞 Call Instead</button>
                  </a>
                  {!sentAlerts[alert.id] && (
                    <button onClick={() => markAlertSent(alert.id)}
                      style={{ marginLeft:'auto', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', color:GOLD, padding:'8px 16px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                      ✅ Mark Sent
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Summary bar when alerts exist */}
            {alertsGenerated && alerts.length > 0 && (
              <div style={{ background:CARD, border:'1px solid #1e1e1e', borderRadius:10, padding:16, marginTop:8, display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
                <div style={{ color:'#555', fontSize:12 }}>Alert summary:</div>
                <div style={{ color:WARN, fontSize:12, fontWeight:700 }}>{alerts.filter(a=>a.urgency==='critical').length} critical</div>
                <div style={{ color:GOLDBR, fontSize:12, fontWeight:700 }}>{alerts.filter(a=>a.urgency==='high').length} high priority</div>
                <div style={{ color:GOLD, fontSize:12, fontWeight:700 }}>{Object.keys(sentAlerts).length} sent</div>
                <div style={{ color:WARN, fontSize:12, fontWeight:700 }}>{alerts.length - Object.keys(sentAlerts).length} pending</div>
                <button onClick={() => alerts.forEach(a => markAlertSent(a.id))}
                  style={{ marginLeft:'auto', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', color:GOLD, padding:'7px 16px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                  ✅ Mark All Sent
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ADD FLEET MODAL */}
      {showAddFleet && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background: DARK, border:`2px solid ${GOLD}`, borderRadius:14, padding:28, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ color: GOLD, fontFamily:'Bebas Neue, sans-serif', fontSize:20, letterSpacing:3, marginBottom:20 }}>ADD NEW FLEET</div>
            {[
              { label:'Fleet Name *', key:'fleet_name', placeholder:'Morris Hive Trucking' },
              { label:'Owner / Manager', key:'owner', placeholder:'Jeremiah Morris' },
              { label:'DOT Number', key:'dot_number', placeholder:'1234567' },
              { label:'MC Number', key:'mc_number', placeholder:'MC-987654' },
              { label:'Primary Lanes', key:'primary_lanes', placeholder:'Dallas ↔ Chicago, Houston ↔ Atlanta' },
              { label:'Equipment Types', key:'equipment_types', placeholder:'Dry Van, Flatbed, Reefer' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:12 }}>
                <label style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>{f.label}</label>
                <input value={newFleet[f.key]} onChange={e => setNewFleet(p => ({...p, [f.key]: e.target.value}))}
                  placeholder={f.placeholder}
                  style={{ width:'100%', background:'#111', border:`1px solid #333`, color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              <div>
                <label style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>Trucks</label>
                <input type="number" value={newFleet.truck_count} onChange={e => setNewFleet(p => ({...p, truck_count: Number(e.target.value)}))}
                  style={{ width:'100%', background:'#111', border:`1px solid #333`, color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>Trailers</label>
                <input type="number" value={newFleet.trailer_count} onChange={e => setNewFleet(p => ({...p, trailer_count: Number(e.target.value)}))}
                  style={{ width:'100%', background:'#111', border:`1px solid #333`, color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowAddFleet(false)} style={{ flex:1, background:'transparent', border:`1px solid #333`, color:'#888', padding:'10px', borderRadius:6, cursor:'pointer', fontSize:13 }}>Cancel</button>
              <button onClick={saveFleet} disabled={saving} style={{ flex:2, background: GOLD, color: BLACK, border:'none', padding:'10px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700 }}>{saving ? 'Saving…' : 'Create Fleet'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LOAD MODAL */}
      {showAddLoad && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background: DARK, border:`2px solid ${GOLD}`, borderRadius:14, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ color: GOLD, fontFamily:'Bebas Neue, sans-serif', fontSize:20, letterSpacing:3, marginBottom:20 }}>ADD LOAD TO {activeFleet?.fleet_name?.toUpperCase()}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {/* Shipper field — with live intel check */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>Shipper / Broker</label>
                <input type="text" value={newLoad.shipper} onChange={e => handleShipperInput(e.target.value)}
                  placeholder="Walmart Distribution"
                  style={{ width:'100%', background:'#111', border:`1px solid ${shipperWarning?.hasWarnings ? (shipperWarning.worstSeverity==='critical'?WARN:shipperWarning.worstSeverity==='high'?GOLDBR:WARN) : '#333'}`, color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box' }} />
                {shipperChecking && <div style={{ fontSize:11, color:'#555', marginTop:4 }}>⏳ Checking fleet intelligence…</div>}
                {!shipperChecking && shipperWarning && (
                  shipperWarning.hasWarnings ? (
                    <div style={{ marginTop:8, background: shipperWarning.worstSeverity==='critical'?'rgba(201,106,76,0.1)':shipperWarning.worstSeverity==='high'?'rgba(255,215,0,0.1)':'rgba(201,106,76,0.1)', border:`1px solid ${shipperWarning.worstSeverity==='critical'?WARN:shipperWarning.worstSeverity==='high'?GOLDBR:WARN}`, borderRadius:8, padding:'10px 12px' }}>
                      <div style={{ fontWeight:700, fontSize:11, color: shipperWarning.worstSeverity==='critical'?WARN:shipperWarning.worstSeverity==='high'?GOLDBR:WARN, marginBottom:5 }}>
                        ⚠️ {shipperWarning.worstSeverity?.toUpperCase()} ALERT — {shipperWarning.negRatings} negative rating{shipperWarning.negRatings!==1?'s':''}, {shipperWarning.notes?.length||0} complaint{shipperWarning.notes?.length!==1?'s':''}
                      </div>
                      {shipperWarning.notes?.slice(0,2).map((n,i) => (
                        <div key={i} style={{ fontSize:11, color:'rgba(255,255,255,0.6)', paddingLeft:8, borderLeft:'2px solid rgba(201,106,76,0.3)', marginBottom:3 }}>"{n.note_text?.slice(0,90)}{n.note_text?.length>90?'…':''}"</div>
                      ))}
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:5 }}>Verify payment terms and references before accepting.</div>
                    </div>
                  ) : (
                    <div style={{ marginTop:6, background:'rgba(201,168,76,0.07)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:6, padding:'7px 10px', fontSize:11, color:GOLD }}>✅ No community flags — looks clear</div>
                  )
                )}
              </div>
              {[
                { label:'Origin City', key:'origin_city', placeholder:'Dallas' },
                { label:'Origin State', key:'origin_state', placeholder:'TX' },
                { label:'Dest City', key:'dest_city', placeholder:'Chicago' },
                { label:'Dest State', key:'dest_state', placeholder:'IL' },
                { label:'Miles', key:'miles', placeholder:'400', type:'number' },
                { label:'Rate ($)', key:'rate', placeholder:'3200', type:'number' },
                { label:'Rate/Mile', key:'rate_per_mile', placeholder:'8.00', type:'number' },
                { label:'Weight', key:'weight', placeholder:'44,000 lbs' },
                { label:'Commodity', key:'commodity', placeholder:'Auto Parts' },
                { label:'Pickup Date', key:'pickup_date', placeholder:'Today 08:00' },
                { label:'Assigned Driver', key:'assigned_driver', placeholder:'John Doe' },
                { label:'Assigned Truck', key:'assigned_truck', placeholder:'Truck 1' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.span===2 ? '1/-1' : undefined }}>
                  <label style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>{f.label}</label>
                  <input type={f.type||'text'} value={newLoad[f.key]} onChange={e => setNewLoad(p => ({...p, [f.key]: e.target.value}))}
                    placeholder={f.placeholder}
                    style={{ width:'100%', background:'#111', border:`1px solid #333`, color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>Source</label>
                <select value={newLoad.source} onChange={e => setNewLoad(p => ({...p, source: e.target.value}))}
                  style={{ width:'100%', background:'#111', border:`1px solid #333`, color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box' }}>
                  {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>Equipment</label>
                <select value={newLoad.equipment} onChange={e => setNewLoad(p => ({...p, equipment: e.target.value}))}
                  style={{ width:'100%', background:'#111', border:`1px solid #333`, color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box' }}>
                  {EQUIPMENT.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:4 }}>Notes</label>
                <textarea value={newLoad.notes} onChange={e => setNewLoad(p => ({...p, notes: e.target.value}))} rows={2} placeholder="Hazmat, team driver required, etc."
                  style={{ width:'100%', background:'#111', border:`1px solid #333`, color:'#fff', padding:'10px 12px', borderRadius:6, fontSize:13, resize:'vertical', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button onClick={() => setShowAddLoad(false)} style={{ flex:1, background:'transparent', border:`1px solid #333`, color:'#888', padding:'10px', borderRadius:6, cursor:'pointer', fontSize:13 }}>Cancel</button>
              <button onClick={saveLoad} disabled={saving} style={{ flex:2, background: GREEN, color:'#000', border:'none', padding:'10px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700 }}>{saving ? 'Saving…' : 'Add Load'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ESCALATE / FOLLOW-UP MODAL */}
      {escalateLoad && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16 }}>
          <div style={{ background:CARD, border:`2px solid ${WARN}`, borderRadius:14, padding:28, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ color:WARN, fontFamily:'Bebas Neue, sans-serif', fontSize:22, letterSpacing:3, marginBottom:6 }}>📣 NO RESPONSE — FOLLOW UP</div>
            <div style={{ color:'#888', fontSize:13, marginBottom:20 }}>
              Load <span style={{ color:WARN, fontWeight:700 }}>{escalateLoad.load_id || escalateLoad.id}</span> — <span style={{ color:'#ccc' }}>{escalateLoad.shipper}</span> — {escalateLoad.origin_city}, {escalateLoad.origin_state} → {escalateLoad.dest_city}, {escalateLoad.dest_state}
            </div>

            {/* Why no response — honest tips */}
            <div style={{ background:'rgba(201,106,76,0.08)', border:'1px solid rgba(201,106,76,0.25)', borderRadius:10, padding:16, marginBottom:20 }}>
              <div style={{ color:WARN, fontWeight:700, fontSize:12, letterSpacing:1, marginBottom:10 }}>⚡ GOAT INTEL — WHY THEY'RE NOT RESPONDING</div>
              {[
                { icon:'💰', tip:`Rate may be too low. At $${Number(escalateLoad.rate).toLocaleString()} ($${Number(escalateLoad.rate_per_mile).toFixed(2)}/mi), try offering a counter — ask if they'll move to $${Math.round(Number(escalateLoad.rate_per_mile)*1.15).toFixed(2)}/mi.` },
                { icon:'📋', tip:'Make sure your MC# and insurance certs are up to date — brokers reject carriers instantly if carrier packet is incomplete or expired.' },
                { icon:'⏰', tip:'Response windows close fast. If pickup is today, call — don\'t email. Use the script below.' },
                { icon:'🔁', tip:`If ${escalateLoad.shipper} has a history of ghosting, file a note in Fleet Memory Intelligence so other drivers know.` },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:16 }}>{item.icon}</span>
                  <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12, lineHeight:1.6 }}>{item.tip}</div>
                </div>
              ))}
            </div>

            {/* Copy-ready outreach script */}
            <div style={{ marginBottom:20 }}>
              <div style={{ color:'#888', fontSize:11, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Ready-to-Use Follow-Up Script</div>
              <div style={{ background:'#161616', border:'1px solid #2a2a2a', borderRadius:8, padding:14 }}>
                <pre style={{ color:'#ccc', fontSize:12, lineHeight:1.7, whiteSpace:'pre-wrap', margin:0, fontFamily:'monospace' }}>{buildOutreachScript(escalateLoad)}</pre>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(buildOutreachScript(escalateLoad)).then(() => { setCopyDone(true); setTimeout(() => setCopyDone(false), 2500); }).catch(() => {}); }}
                style={{ marginTop:10, width:'100%', background: copyDone ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.1)', border: `1px solid ${copyDone ? GOLD : GOLD}`, color: copyDone ? GOLD : GOLD, padding:'9px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                {copyDone ? '✅ Copied to clipboard!' : '📋 Copy Script'}
              </button>
            </div>

            {/* Quick escalation actions */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
              <a href={`tel:6367068338`} style={{ textDecoration:'none' }}>
                <div style={{ background:'rgba(138,138,138,0.1)', border:'1px solid rgba(138,138,138,0.3)', borderRadius:8, padding:'12px', textAlign:'center', cursor:'pointer' }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>📞</div>
                  <div style={{ color: BLUE, fontWeight:700, fontSize:12 }}>Call Support</div>
                  <div style={{ color:'#555', fontSize:10, marginTop:2 }}>636-706-8338</div>
                </div>
              </a>
              <a href={`mailto:truckeasecare@gmail.com?subject=Load Follow-Up — ${escalateLoad.load_id || escalateLoad.id}&body=${encodeURIComponent(buildOutreachScript(escalateLoad))}`} style={{ textDecoration:'none' }}>
                <div style={{ background:'rgba(201,168,76,0.08)', border:`1px solid ${GOLD}44`, borderRadius:8, padding:'12px', textAlign:'center', cursor:'pointer' }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>✉️</div>
                  <div style={{ color: GOLD, fontWeight:700, fontSize:12 }}>Email via App</div>
                  <div style={{ color:'#555', fontSize:10, marginTop:2 }}>Opens your email</div>
                </div>
              </a>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setEscalateLoad(null)} style={{ flex:1, background:'transparent', border:'1px solid #333', color:'#888', padding:'10px', borderRadius:6, cursor:'pointer', fontSize:13 }}>Close</button>
              <button onClick={() => confirmEscalate(escalateLoad)} style={{ flex:2, background:WARN, color:'#000', border:'none', padding:'10px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700 }}>✅ Mark as Followed Up</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        input:focus, select:focus, textarea:focus { outline: none; border-color: ${GOLD} !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        select option { background: #111; }
      `}</style>
    </div>
  );
}
