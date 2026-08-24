import { useState, useEffect, useRef } from 'react';
import { pb } from './lib/pb';
import BrokerReputationPanel from './BrokerReputationPanel';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const DARK   = '#060A10';
const CARD   = '#0D1520';
const CARD2  = '#0A1118';
const BORDER = '#1a2535';
const GOLD   = '#c9a84c';
const ORANGE = '#FF6B00';
const AMBER  = '#FFB400';
const GREEN  = '#10B981';
const BLUE   = '#3B82F6';
const RED    = '#EF4444';
const PURPLE = '#8B5CF6';
const WHITE  = '#F0EDE8';
const DIM    = 'rgba(240,237,232,0.45)';
const DIM2   = 'rgba(240,237,232,0.15)';
const FD     = "'Bebas Neue','Oswald',sans-serif";
const FB     = "'Inter',system-ui,sans-serif";
const FM     = "'DM Mono','Courier New',monospace";

function navTo(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// ─── API INTEGRATION LAYER ────────────────────────────────────────────────────
//
// DAT Load Board API  ─  https://developer.dat.com
//   Auth:  POST https://identity.dat.com/access/v1/token  (client_credentials)
//   Loads: GET  https://freight.api.dat.com/freight/v1/loads?originCity=...
//   Rates: GET  https://freight.api.dat.com/rates/v1/rateCast
//   Keys:  dat_api_key = "clientId:clientSecret" stored in platform_settings
//
// Uber Freight Carrier API  ─  https://developer.uberfreight.com
//   Auth:  Bearer token (OAuth2 client_credentials)
//   Loads: GET  https://api.uberfreight.com/v2/loads?pickup_state=...
//   Book:  POST https://api.uberfreight.com/v2/loads/{id}/book
//   Keys:  uber_freight_key = "clientId|clientSecret" stored in platform_settings
//
// CH Robinson Navisphere API  ─  https://developer.chrobinson.com
//   Auth:  OAuth2 Bearer — POST https://api.chrobinson.com/identity/connect/token
//   Loads: GET  https://api.chrobinson.com/freight/v1/loadboards/loads
//   Quote: POST https://api.chrobinson.com/freight/v1/quotes
//   Keys:  chrobinson_api_key = "clientId|clientSecret" stored in platform_settings
//
// All keys stored in platform_settings collection (PocketBase).
// Never expose secret keys client-side in production — route through a proxy.
// For development/demo: keys are read from platform_settings and used via CORS-enabled endpoints.

async function loadPlatformKeys() {
  try {
    const r = await pb.collection('platform_settings').getList(1, 1);
    return r.items[0] || {};
  } catch { return {}; }
}

// DAT: Get OAuth token then search loads
async function fetchDATLoads({ clientId, clientSecret, originCity, originState, destCity, destState, equipment }) {
  // Step 1: Get DAT access token
  const tokenRes = await fetch('https://identity.dat.com/access/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!tokenRes.ok) throw new Error(`DAT auth failed: ${tokenRes.status}`);
  const { access_token } = await tokenRes.json();

  // Step 2: Search loads
  const params = new URLSearchParams({
    originCity: originCity || '',
    originState: originState || '',
    destinationCity: destCity || '',
    destinationState: destState || '',
    equipmentType: equipment || 'V',  // V=Van, F=Flatbed, R=Reefer
    limit: '25',
  });
  const loadsRes = await fetch(`https://freight.api.dat.com/freight/v1/loads?${params}`, {
    headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' },
  });
  if (!loadsRes.ok) throw new Error(`DAT loads failed: ${loadsRes.status}`);
  const data = await loadsRes.json();

  // Normalize DAT response to TruckWithEase load format
  return (data.loads || data.items || []).map(l => ({
    id: `DAT-${l.id || Math.random().toString(36).slice(2)}`,
    source: 'dat',
    shipper: l.shipper?.name || l.companyName || 'DAT Shipper',
    pickupCity: l.origin?.city || l.originCity || '',
    pickupState: l.origin?.state || l.originState || '',
    deliveryCity: l.destination?.city || l.destinationCity || '',
    deliveryState: l.destination?.state || l.destinationState || '',
    miles: l.tripLength || l.miles || 0,
    rate: l.rate?.rate || l.totalRate || 0,
    ratePerMile: l.rate?.ratePerMile || 0,
    weight: `${(l.weight || 0).toLocaleString()} lbs`,
    commodity: l.commodity || 'General Freight',
    pickupDate: l.pickupDate || 'Contact Broker',
    equipment: l.equipmentType || 'Dry Van',
    age: 'Live',
    reliability: 9.0,
    detentionHistory: 'Unknown',
    booked: false,
    liveSource: true,
  }));
}

// Uber Freight: OAuth2 then load search
async function fetchUberFreightLoads({ clientId, clientSecret, pickupState, deliveryState, equipment }) {
  // Step 1: Uber Freight OAuth token
  const tokenRes = await fetch('https://login.uber.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'freight.loads:read freight.loads:book',
    }),
  });
  if (!tokenRes.ok) throw new Error(`Uber Freight auth failed: ${tokenRes.status}`);
  const { access_token } = await tokenRes.json();

  // Step 2: Get available loads
  const params = new URLSearchParams({
    pickup_state: pickupState || '',
    delivery_state: deliveryState || '',
    equipment_type: equipment || 'DRY_VAN',
    limit: '25',
  });
  const res = await fetch(`https://api.uberfreight.com/v2/loads?${params}`, {
    headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Uber Freight loads failed: ${res.status}`);
  const data = await res.json();

  // Normalize to TruckWithEase format
  return (data.loads || data.data || []).map(l => ({
    id: `UF-${l.id || Math.random().toString(36).slice(2)}`,
    source: 'uber',
    shipper: l.shipper_name || 'Uber Freight',
    pickupCity: l.pickup?.city || l.origin_city || '',
    pickupState: l.pickup?.state || l.origin_state || pickupState || '',
    deliveryCity: l.delivery?.city || l.destination_city || '',
    deliveryState: l.delivery?.state || l.destination_state || deliveryState || '',
    miles: l.distance_miles || l.miles || 0,
    rate: l.all_in_rate || l.rate || 0,
    ratePerMile: l.rate_per_mile || 0,
    weight: `${(l.weight_lbs || 0).toLocaleString()} lbs`,
    commodity: l.commodity_description || l.freight_type || 'General Freight',
    pickupDate: l.pickup_date || l.pickup?.scheduled_at || 'Contact Uber Freight',
    equipment: l.equipment_type || 'Dry Van',
    age: 'Live',
    reliability: 9.8,
    detentionHistory: 'Low',
    booked: false,
    liveSource: true,
    uberId: l.id,
  }));
}

// CH Robinson Navisphere: OAuth2 then load search
async function fetchCHRobinsonLoads({ clientId, clientSecret, originState, destState, equipment }) {
  // Step 1: CH Robinson Navisphere token
  const tokenRes = await fetch('https://api.chrobinson.com/identity/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'freight',
    }),
  });
  if (!tokenRes.ok) throw new Error(`CH Robinson auth failed: ${tokenRes.status}`);
  const { access_token } = await tokenRes.json();

  // Step 2: Load board search
  const params = new URLSearchParams({
    originState: originState || '',
    destinationState: destState || '',
    equipmentType: equipment || 'V',
    pageSize: '25',
  });
  const res = await fetch(`https://api.chrobinson.com/freight/v1/loadboards/loads?${params}`, {
    headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`CH Robinson loads failed: ${res.status}`);
  const data = await res.json();

  // Normalize to TruckWithEase format
  return (data.loads || data.items || data.value || []).map(l => ({
    id: `CHR-${l.loadId || l.id || Math.random().toString(36).slice(2)}`,
    source: 'chrobinson',
    shipper: l.customerName || 'CH Robinson',
    pickupCity: l.origin?.city || l.originCity || '',
    pickupState: l.origin?.state || l.originState || originState || '',
    deliveryCity: l.destination?.city || l.destinationCity || '',
    deliveryState: l.destination?.state || l.destinationState || destState || '',
    miles: l.distance || l.totalMiles || 0,
    rate: l.totalRate || l.rate || 0,
    ratePerMile: l.ratePerMile || 0,
    weight: `${(l.weight || 0).toLocaleString()} lbs`,
    commodity: l.commodity || l.description || 'General Freight',
    pickupDate: l.pickupDate || l.origin?.earliestArrival || 'Contact CHR',
    equipment: l.equipmentType || 'Dry Van',
    age: 'Live',
    reliability: 9.7,
    detentionHistory: 'Low',
    booked: false,
    liveSource: true,
    chrLoadId: l.loadId,
  }));
}

// Truckstop.com API
async function fetchTruckstopLoads({ apiKey, originState, destState, equipment }) {
  try {
    const res = await fetch(`https://api.truckstop.com/v2/loads?originState=${originState}&destinationState=${destState}&equipmentType=${equipment || 'V'}`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Truckstop API ${res.status}`);
    const data = await res.json();
    return (data.loads || data.items || []).map((l, i) => ({
      id: `TS-${l.loadId || i}`, source: 'truckstop',
      shipper: l.postedBy || 'Truckstop Shipper',
      pickupCity: l.origin?.city || originState, pickupState: l.origin?.state || originState,
      deliveryCity: l.destination?.city || destState, deliveryState: l.destination?.state || destState,
      miles: l.miles || l.distance || 0, rate: l.rate || l.allInRate || 0,
      ratePerMile: l.rate && l.miles ? (l.rate / l.miles).toFixed(2) : 0,
      weight: l.weight ? `${l.weight.toLocaleString()} lbs` : 'N/A',
      commodity: l.commodity || 'General Freight',
      pickupDate: l.pickupDate || 'TBD',
      estFuelCost: Math.round((l.miles || 0) * 0.95),
      estProfit: Math.round((l.rate || 0) - (l.miles || 0) * 0.95),
      profitPerMile: l.rate && l.miles ? ((l.rate - l.miles * 0.95) / l.miles).toFixed(2) : 0,
      reliability: 9.2, detentionHistory: 'Low',
      equipment: l.equipmentType || 'Dry Van', age: 'Live', booked: false,
    }));
  } catch (e) { console.warn('Truckstop:', e.message); return []; }
}

// 123Loadboard API
async function fetch123LoadboardLoads({ apiKey, originState, destState, equipment }) {
  try {
    const res = await fetch(`https://api.123loadboard.com/v1/loads/search?origin_state=${originState}&destination_state=${destState}&equipment=${equipment || 'V'}`, {
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`123Loadboard API ${res.status}`);
    const data = await res.json();
    return (data.loads || data.results || []).map((l, i) => ({
      id: `123-${l.id || i}`, source: '123loadboard',
      shipper: l.company || '123Loadboard Shipper',
      pickupCity: l.originCity || originState, pickupState: l.originState || originState,
      deliveryCity: l.destCity || destState, deliveryState: l.destState || destState,
      miles: l.miles || 0, rate: l.rate || 0,
      ratePerMile: l.rate && l.miles ? (l.rate / l.miles).toFixed(2) : 0,
      weight: l.weight ? `${l.weight.toLocaleString()} lbs` : 'N/A',
      commodity: l.commodity || 'General Freight',
      pickupDate: l.pickupDate || 'TBD',
      estFuelCost: Math.round((l.miles || 0) * 0.95),
      estProfit: Math.round((l.rate || 0) - (l.miles || 0) * 0.95),
      profitPerMile: l.rate && l.miles ? ((l.rate - l.miles * 0.95) / l.miles).toFixed(2) : 0,
      reliability: 9.0, detentionHistory: 'Low',
      equipment: l.equipmentType || 'Dry Van', age: 'Live', booked: false,
    }));
  } catch (e) { console.warn('123Loadboard:', e.message); return []; }
}

// ─── Sources configuration ────────────────────────────────────────────────────
const SOURCES = [
  { id: 'all',        label: 'All Sources',      icon: '⚡', color: ORANGE, apiField: null },
  { id: 'dat',        label: 'DAT',              icon: '📡', color: BLUE,      apiField: 'dat_api_key',        apiLabel: 'DAT Client ID:Secret',  apiLink: 'https://developer.dat.com',                   desc: 'Largest load board in North America — 1.3M+ loads/day' },
  { id: 'uber',       label: 'Uber Freight',     icon: '🔵', color: '#555',    apiField: 'uber_freight_key',   apiLabel: 'Uber Freight Client ID|Secret', apiLink: 'https://developer.uberfreight.com',        desc: 'Instant rate quotes — van, flatbed, regional' },
  { id: 'chrobinson', label: 'CH Robinson',      icon: '🌐', color: '#003087', apiField: 'chrobinson_api_key', apiLabel: 'CHR Navisphere Client ID|Secret', apiLink: 'https://developer.chrobinson.com',     desc: "World's largest 3PL — enterprise freight network" },
  { id: 'truckstop',  label: 'Truckstop.com',   icon: '🚛', color: GREEN,     apiField: null, desc: 'Real-time capacity matching — 400K+ carriers' },
  { id: 'sylectus',   label: 'Sylectus',         icon: '🔗', color: PURPLE,    apiField: null, desc: 'Premium fleet-to-fleet freight network' },
  { id: 'direct',     label: 'Direct Shippers',  icon: '🏭', color: AMBER,     apiField: null, desc: 'Exclusive loads posted directly by shippers' },
  { id: 'amazon',     label: 'Amazon Relay',     icon: '📦', color: '#00A8E1', apiField: null, desc: 'Amazon freight — van, box truck, and semi' },
  { id: 'lb123',      label: '123Loadboard',     icon: '🔢', color: '#e65c00', apiField: null, desc: 'Most popular for owner-operators — free tier available' },
  { id: 'convoy',     label: 'Convoy',           icon: '🚚', color: '#00a651', apiField: null, desc: 'Instant booking, no negotiation — guaranteed rates' },
  { id: 'loadsmart',  label: 'Loadsmart',        icon: '🧠', color: '#7c3aed', apiField: null, desc: 'AI-powered instant booking — consistent lane volume' },
  { id: 'coyote',     label: 'Coyote Logistics', icon: '🐺', color: '#ff6900', apiField: null, desc: 'UPS-owned — consistent freight, major corridors' },
  { id: 'next',       label: 'Next Trucking',    icon: '🚢', color: '#0891b2', apiField: null, desc: 'Port & drayage specialist — highest-paying port loads' },
];

// ─── Mock loads (fallback when API not connected) ─────────────────────────────
const MOCK_LOADS = [
  { id:'LD-9001', source:'dat', shipper:'Midwest Auto Parts', pickupCity:'St. Louis', pickupState:'MO', deliveryCity:'Chicago', deliveryState:'IL', miles:298, rate:2450, ratePerMile:8.22, weight:'41,500 lbs', commodity:'Auto Parts', pickupDate:'Today 08:00', estFuelCost:287, estProfit:187, profitPerMile:0.63, pickupPhone:'314-555-0147', pickupContact:'Mike Johnson', deliveryPhone:'312-555-0189', deliveryContact:'Sarah Williams', tempRequired:false, hazmat:false, reliability:9.2, detentionHistory:'Low', equipment:'Dry Van', age:'4 min ago', booked:false },
  { id:'LD-9002', source:'dat', shipper:'Walmart Distribution', pickupCity:'Kansas City', pickupState:'MO', deliveryCity:'Dallas', deliveryState:'TX', miles:501, rate:3120, ratePerMile:6.23, weight:'45,000 lbs', commodity:'General Merchandise', pickupDate:'Today 10:00', estFuelCost:478, estProfit:412, profitPerMile:0.82, pickupPhone:'816-555-0123', pickupContact:'James Lee', deliveryPhone:'214-555-0167', deliveryContact:'Amanda Rodriguez', tempRequired:false, hazmat:false, reliability:9.5, detentionHistory:'Medium', equipment:'Dry Van', age:'12 min ago', booked:false },
  { id:'LD-9003', source:'truckstop', shipper:'Kroger Distribution', pickupCity:'Memphis', pickupState:'TN', deliveryCity:'Atlanta', deliveryState:'GA', miles:392, rate:2880, ratePerMile:7.35, weight:'43,200 lbs', commodity:'Food/Groceries', pickupDate:'Tomorrow 06:00', estFuelCost:351, estProfit:298, profitPerMile:0.76, pickupPhone:'901-555-0145', pickupContact:'David Chen', deliveryPhone:'404-555-0178', deliveryContact:'Jessica Martinez', tempRequired:true, hazmat:false, reliability:8.7, detentionHistory:'High', equipment:'Reefer', age:'1 hr ago', booked:false },
  { id:'LD-9004', source:'truckstop', shipper:'Ford Logistics', pickupCity:'Detroit', pickupState:'MI', deliveryCity:'Cleveland', deliveryState:'OH', miles:175, rate:1450, ratePerMile:8.29, weight:'38,000 lbs', commodity:'Auto Parts', pickupDate:'Today 14:00', estFuelCost:168, estProfit:145, profitPerMile:0.83, pickupPhone:'313-555-0156', pickupContact:'Tom Wilson', deliveryPhone:'216-555-0192', deliveryContact:'Rachel Green', tempRequired:false, hazmat:false, reliability:9.8, detentionHistory:'Low', equipment:'Flatbed', age:'23 min ago', booked:false },
  { id:'LD-9005', source:'sylectus', shipper:'Chemical Corp USA', pickupCity:'Houston', pickupState:'TX', deliveryCity:'New Orleans', deliveryState:'LA', miles:348, rate:4200, ratePerMile:12.07, weight:'36,000 lbs', commodity:'Industrial Chemicals', pickupDate:'Tomorrow 07:00', estFuelCost:320, estProfit:890, profitPerMile:2.56, pickupPhone:'713-555-0199', pickupContact:'Robert Kim', deliveryPhone:'504-555-0211', deliveryContact:'Lisa Tran', tempRequired:false, hazmat:true, reliability:9.1, detentionHistory:'Low', equipment:'Tanker', age:'8 min ago', booked:false },
  { id:'LD-9006', source:'direct', shipper:'Home Depot Direct', pickupCity:'Atlanta', pickupState:'GA', deliveryCity:'Charlotte', deliveryState:'NC', miles:245, rate:1980, ratePerMile:8.08, weight:'40,000 lbs', commodity:'Building Materials', pickupDate:'Today 11:00', estFuelCost:230, estProfit:312, profitPerMile:1.27, pickupPhone:'678-555-0134', pickupContact:'Mark Davis', deliveryPhone:'704-555-0145', deliveryContact:'Amy Johnson', tempRequired:false, hazmat:false, reliability:9.9, detentionHistory:'Low', equipment:'Flatbed', age:'2 hr ago', booked:false },
  { id:'LD-9007', source:'amazon', shipper:'Amazon Fulfillment', pickupCity:'Phoenix', pickupState:'AZ', deliveryCity:'Los Angeles', deliveryState:'CA', miles:370, rate:1650, ratePerMile:4.46, weight:'28,000 lbs', commodity:'E-Commerce Parcels', pickupDate:'Today 16:00', estFuelCost:355, estProfit:198, profitPerMile:0.54, reliability:10.0, detentionHistory:'Low', equipment:'Dry Van', age:'5 min ago', booked:false },
  { id:'LD-9008', source:'dat', shipper:'Target Corp', pickupCity:'Minneapolis', pickupState:'MN', deliveryCity:'Chicago', deliveryState:'IL', miles:410, rate:3300, ratePerMile:8.05, weight:'44,000 lbs', commodity:'Retail Merchandise', pickupDate:'Tomorrow 09:00', estFuelCost:390, estProfit:480, profitPerMile:1.17, reliability:9.4, detentionHistory:'Low', equipment:'Dry Van', age:'31 min ago', booked:false },
  { id:'LD-9009', source:'lb123', shipper:'Owner Direct LLC', pickupCity:'Denver', pickupState:'CO', deliveryCity:'Salt Lake City', deliveryState:'UT', miles:525, rate:2100, ratePerMile:4.00, weight:'32,000 lbs', commodity:'General Freight', pickupDate:'Today 12:00', estFuelCost:498, estProfit:322, profitPerMile:0.61, reliability:8.5, detentionHistory:'Low', equipment:'Dry Van', age:'17 min ago', booked:false },
  { id:'LD-9010', source:'convoy', shipper:'Convoy Premium Shipper', pickupCity:'Seattle', pickupState:'WA', deliveryCity:'Portland', deliveryState:'OR', miles:185, rate:1620, ratePerMile:8.76, weight:'38,500 lbs', commodity:'Electronics', pickupDate:'Today 09:00', estFuelCost:172, estProfit:298, profitPerMile:1.61, reliability:9.9, detentionHistory:'Low', equipment:'Dry Van', age:'3 min ago', booked:false },
  { id:'LD-9011', source:'uber', shipper:'Uber Freight Partner', pickupCity:'Indianapolis', pickupState:'IN', deliveryCity:'Columbus', deliveryState:'OH', miles:178, rate:1380, ratePerMile:7.75, weight:'35,000 lbs', commodity:'Auto Parts', pickupDate:'Today 13:00', estFuelCost:165, estProfit:195, profitPerMile:1.10, reliability:9.8, detentionHistory:'Low', equipment:'Dry Van', age:'8 min ago', booked:false },
  { id:'LD-9012', source:'loadsmart', shipper:'Loadsmart Verified', pickupCity:'Nashville', pickupState:'TN', deliveryCity:'Birmingham', deliveryState:'AL', miles:192, rate:1710, ratePerMile:8.91, weight:'40,000 lbs', commodity:'Consumer Goods', pickupDate:'Tomorrow 07:00', estFuelCost:178, estProfit:312, profitPerMile:1.63, reliability:9.6, detentionHistory:'Low', equipment:'Dry Van', age:'22 min ago', booked:false },
  { id:'LD-9013', source:'coyote', shipper:'UPS Coyote Network', pickupCity:'Cincinnati', pickupState:'OH', deliveryCity:'Louisville', deliveryState:'KY', miles:104, rate:980, ratePerMile:9.42, weight:'28,000 lbs', commodity:'Retail Goods', pickupDate:'Today 15:00', estFuelCost:98, estProfit:187, profitPerMile:1.80, reliability:9.3, detentionHistory:'Low', equipment:'Dry Van', age:'45 min ago', booked:false },
  { id:'LD-9014', source:'chrobinson', shipper:'CH Robinson Enterprise', pickupCity:'Chicago', pickupState:'IL', deliveryCity:'Detroit', deliveryState:'MI', miles:282, rate:2640, ratePerMile:9.36, weight:'44,500 lbs', commodity:'Industrial Equipment', pickupDate:'Tomorrow 06:00', estFuelCost:265, estProfit:498, profitPerMile:1.77, reliability:9.7, detentionHistory:'Low', equipment:'Flatbed', age:'1 hr ago', booked:false },
  { id:'LD-9015', source:'next', shipper:'Port of LA Drayage', pickupCity:'Los Angeles', pickupState:'CA', deliveryCity:'Ontario', deliveryState:'CA', miles:60, rate:1800, ratePerMile:30.00, weight:'44,000 lbs', commodity:'Import Containers', pickupDate:'Today 08:00', estFuelCost:58, estProfit:1142, profitPerMile:19.03, reliability:9.0, detentionHistory:'Medium', equipment:'Dry Van', age:'11 min ago', booked:false },
];

// ─── API Key Management Panel ─────────────────────────────────────────────────
function ApiKeyPanel({ keys, onSave, saving }) {
  const [localKeys, setLocalKeys] = useState({
    dat_api_key: keys.dat_api_key || '',
    uber_freight_key: keys.uber_freight_key || '',
    chrobinson_api_key: keys.chrobinson_api_key || '',
    truckstop_api_key: keys.truckstop_api_key || '',
    loadboard123_api_key: keys.loadboard123_api_key || '',
  });

  const API_CONFIGS = [
    {
      id: 'dat',
      label: 'DAT Load Board',
      field: 'dat_api_key',
      placeholder: 'clientId:clientSecret',
      color: BLUE,
      link: 'https://developer.dat.com',
      docs: 'Log in to DAT One → My Account → API Access → Create App → copy Client ID and Secret. Paste both here separated by a colon: clientId:clientSecret',
      endpoints: ['POST https://identity.dat.com/access/v1/token  (auth)', 'GET  https://freight.api.dat.com/freight/v1/loads  (loads)', 'GET  https://freight.api.dat.com/rates/v1/rateCast  (rates)'],
    },
    {
      id: 'uber',
      label: 'Uber Freight Carrier API',
      field: 'uber_freight_key',
      placeholder: 'clientId|clientSecret',
      color: '#555',
      link: 'https://developer.uberfreight.com',
      docs: 'Apply for carrier API access at developer.uberfreight.com → Create App → OAuth2 credentials. Paste clientId|clientSecret (pipe-separated).',
      endpoints: ['POST https://login.uber.com/oauth/v2/token  (auth)', 'GET  https://api.uberfreight.com/v2/loads  (load search)', 'POST https://api.uberfreight.com/v2/loads/{id}/book  (booking)'],
    },
    {
      id: 'chrobinson',
      label: 'CH Robinson Navisphere API',
      field: 'chrobinson_api_key',
      placeholder: 'clientId|clientSecret',
      color: '#003087',
      link: 'https://developer.chrobinson.com',
      docs: 'Register at developer.chrobinson.com → Navisphere Carrier → Create App → copy OAuth2 credentials. Paste clientId|clientSecret (pipe-separated).',
      endpoints: ['POST https://api.chrobinson.com/identity/connect/token  (auth)', 'GET  https://api.chrobinson.com/freight/v1/loadboards/loads  (loads)', 'POST https://api.chrobinson.com/freight/v1/quotes  (rate quote)'],
    },
    {
      id: 'truckstop',
      label: 'Truckstop.com',
      field: 'truckstop_api_key',
      placeholder: 'Bearer token from Truckstop',
      color: '#E85D04',
      link: 'https://developer.truckstop.com',
      docs: 'Log into your Truckstop account → My Account → API Access → Generate Token. Paste the Bearer token here.',
      endpoints: ['GET https://api.truckstop.com/v2/loads (load search)', 'GET https://api.truckstop.com/v2/rates (rate check)'],
    },
    {
      id: '123loadboard',
      label: '123Loadboard',
      field: 'loadboard123_api_key',
      placeholder: 'X-API-Key from 123Loadboard',
      color: '#7C3AED',
      link: 'https://www.123loadboard.com/api',
      docs: 'Log into 123Loadboard → Account Settings → API → Generate Key. Paste your X-API-Key here.',
      endpoints: ['GET https://api.123loadboard.com/v1/loads/search (search)', 'GET https://api.123loadboard.com/v1/rates (rates)'],
    },
  ];

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ fontFamily: FD, fontSize: 22, letterSpacing: '0.1em', color: GOLD, marginBottom: 6 }}>
        LOAD BOARD API CONNECTIONS
      </div>
      <div style={{ fontSize: 13, color: DIM, marginBottom: 24, lineHeight: 1.6 }}>
        Connect your DAT, Uber Freight, and CH Robinson accounts — TruckWithEase fetches live loads directly from each source and displays them alongside your full board. Keys are stored privately in your account.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {API_CONFIGS.map(cfg => {
          const isConnected = !!keys[cfg.field];
          return (
            <div key={cfg.id} style={{ background: CARD, border: `1px solid ${isConnected ? cfg.color + '55' : BORDER}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontFamily: FD, fontSize: 16, letterSpacing: '0.08em', color: WHITE }}>{cfg.label}</div>
                  <a href={cfg.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: cfg.color, textDecoration: 'none' }}>{cfg.link}</a>
                </div>
                <div style={{
                  background: isConnected ? 'rgba(16,185,129,0.12)' : 'rgba(240,237,232,0.06)',
                  border: `1px solid ${isConnected ? GREEN + '44' : BORDER}`,
                  borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 700,
                  color: isConnected ? GREEN : DIM, letterSpacing: '0.06em',
                }}>
                  {isConnected ? '✅ CONNECTED' : 'NOT CONNECTED'}
                </div>
              </div>

              <div style={{ fontSize: 12, color: DIM, lineHeight: 1.7, marginBottom: 14, background: 'rgba(240,237,232,0.03)', borderRadius: 7, padding: '10px 14px' }}>
                📋 {cfg.docs}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: DIM, fontWeight: 700, letterSpacing: '0.07em', marginBottom: 6 }}>API ENDPOINTS USED:</div>
                {cfg.endpoints.map((e, i) => (
                  <div key={i} style={{ fontFamily: FM, fontSize: 10, color: cfg.color, marginBottom: 3 }}>{e}</div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="password"
                  placeholder={cfg.placeholder}
                  value={localKeys[cfg.field]}
                  onChange={e => setLocalKeys(p => ({ ...p, [cfg.field]: e.target.value }))}
                  style={{ flex: 1, minWidth: 200, background: '#040810', border: `1px solid ${BORDER}`, borderRadius: 7, padding: '9px 14px', color: WHITE, fontFamily: FM, fontSize: 13, outline: 'none' }}
                />
                <button
                  onClick={() => onSave({ ...keys, [cfg.field]: localKeys[cfg.field] })}
                  disabled={saving}
                  style={{ background: cfg.color, border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
                  {saving ? '...' : 'Save'}
                </button>
                {isConnected && (
                  <button onClick={() => onSave({ ...keys, [cfg.field]: '' })}
                    style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 14px', fontSize: 12, color: DIM, cursor: 'pointer' }}>
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* API key summary for records */}
      <div style={{ marginTop: 24, background: 'rgba(201,168,76,0.07)', border: `1px solid ${GOLD}33`, borderRadius: 10, padding: 18 }}>
        <div style={{ fontFamily: FD, fontSize: 14, letterSpacing: '0.08em', color: GOLD, marginBottom: 10 }}>ALL REGISTERED API KEYS — TRUCKWITHEASE LOAD BOARD</div>
        <div style={{ fontSize: 11, color: DIM, lineHeight: 1.9, fontFamily: FM }}>
          {[
            ['DAT Load Board',          'dat_api_key',          'https://developer.dat.com',               'clientId:clientSecret',   keys.dat_api_key],
            ['Uber Freight',            'uber_freight_key',     'https://developer.uberfreight.com',        'clientId|clientSecret',   keys.uber_freight_key],
            ['CH Robinson Navisphere',  'chrobinson_api_key',   'https://developer.chrobinson.com',         'clientId|clientSecret',   keys.chrobinson_api_key],
            ['Samsara Fleet API',       'samsara_app_id',       'https://cloud.samsara.com/settings/api-tokens', 'Bearer token',      keys.samsara_app_id],
            ['OpenAI',                  'openai_api_key',       'https://platform.openai.com/api-keys',    'sk-...',                  keys.openai_api_key],
            ['Google Gemini',           'gemini_api_key',       'https://aistudio.google.com/app/apikey',  'AIzaSy...',               keys.gemini_api_key],
            ['FMCSA Safety API',        'fmcsa_api_key',        'https://ai.fmcsa.dot.gov/api',            'API key',                 keys.fmcsa_api_key],
          ].map(([name, field, link, format, val]) => (
            <div key={field} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid rgba(201,168,76,0.1)`, paddingBottom: 4, marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
              <span style={{ color: WHITE, fontWeight: 600, minWidth: 200 }}>{name}</span>
              <span style={{ color: DIM }}>{field}</span>
              <span style={{ color: val ? GREEN : RED, fontWeight: 700 }}>{val ? '✅ SET' : '⬜ MISSING'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LoadBoardMapAgentPage() {
  const [activeSource, setActiveSource] = useState('all');
  const [activeTab, setActiveTab]       = useState('board');
  const [sortBy, setSortBy]             = useState('profit');
  const [equipFilter, setEquipFilter]   = useState('All');
  const [loads, setLoads]               = useState(MOCK_LOADS);
  const [liveLoads, setLiveLoads]       = useState([]);
  const [liveLoading, setLiveLoading]   = useState({});
  const [liveErrors, setLiveErrors]     = useState({});
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [bookedLoads, setBookedLoads]   = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [apiKeys, setApiKeys]           = useState({});
  const [keysSaving, setKeysSaving]     = useState(false);
  const [originState, setOriginState]   = useState('');
  const [destState, setDestState]       = useState('');

  // Load API keys on mount
  useEffect(() => {
    loadPlatformKeys().then(setApiKeys);
  }, []);

  // Fetch live loads from a connected source
  async function fetchLiveSource(sourceId) {
    setLiveLoading(p => ({ ...p, [sourceId]: true }));
    setLiveErrors(p => ({ ...p, [sourceId]: null }));
    try {
      let newLoads = [];

      if (sourceId === 'dat' && apiKeys.dat_api_key) {
        const [clientId, clientSecret] = apiKeys.dat_api_key.split(':');
        newLoads = await fetchDATLoads({ clientId, clientSecret, originState, destState, equipment: equipFilter === 'All' ? 'V' : equipFilter[0] });
      }
      if (sourceId === 'uber' && apiKeys.uber_freight_key) {
        const [clientId, clientSecret] = apiKeys.uber_freight_key.split('|');
        newLoads = await fetchUberFreightLoads({ clientId, clientSecret, pickupState: originState, deliveryState: destState });
      }
      if (sourceId === 'chrobinson' && apiKeys.chrobinson_api_key) {
        const [clientId, clientSecret] = apiKeys.chrobinson_api_key.split('|');
        newLoads = await fetchCHRobinsonLoads({ clientId, clientSecret, originState, destState });
      }
      if (sourceId === 'truckstop' && apiKeys.truckstop_api_key) {
        try {
          const tsLoads = await fetchTruckstopLoads({ apiKey: apiKeys.truckstop_api_key, originState, destState, equipment: equipFilter });
          newLoads = [...newLoads, ...tsLoads];
        } catch(e) { console.warn('Truckstop search failed', e); }
      }
      if (sourceId === '123loadboard' && apiKeys.loadboard123_api_key) {
        try {
          const lb123Loads = await fetch123LoadboardLoads({ apiKey: apiKeys.loadboard123_api_key, originState, destState, equipment: equipFilter });
          newLoads = [...newLoads, ...lb123Loads];
        } catch(e) { console.warn('123Loadboard search failed', e); }
      }

      // Merge live loads with existing, deduplicate by id
      setLiveLoads(prev => {
        const filtered = prev.filter(l => l.source !== sourceId);
        return [...filtered, ...newLoads];
      });
    } catch (e) {
      setLiveErrors(p => ({ ...p, [sourceId]: e.message }));
    }
    setLiveLoading(p => ({ ...p, [sourceId]: false }));
  }

  // Fetch all connected live sources on mount and when keys change
  useEffect(() => {
    ['dat', 'uber', 'chrobinson'].forEach(src => {
      const fieldMap = { dat: 'dat_api_key', uber: 'uber_freight_key', chrobinson: 'chrobinson_api_key' };
      if (apiKeys[fieldMap[src]]) fetchLiveSource(src);
    });
  }, [apiKeys]);

  async function saveKeys(newKeys) {
    setKeysSaving(true);
    try {
      const existing = await pb.collection('platform_settings').getList(1, 1);
      if (existing.items[0]) {
        await pb.collection('platform_settings').update(existing.items[0].id, newKeys);
      } else {
        await pb.collection('platform_settings').create(newKeys);
      }
      setApiKeys(newKeys);
    } catch (e) { console.error(e); }
    setKeysSaving(false);
  }

  // Merge mock + live loads
  const allLoads = [
    ...liveLoads,
    ...MOCK_LOADS.filter(m => !liveLoads.some(l => l.source === m.source)),
  ];

  const connectedSources = ['dat', 'uber', 'chrobinson'].filter(s => {
    const fieldMap = { dat: 'dat_api_key', uber: 'uber_freight_key', chrobinson: 'chrobinson_api_key' };
    return !!apiKeys[fieldMap[s]];
  });

  const filtered = allLoads.filter(l => {
    const srcMatch = activeSource === 'all' || l.source === activeSource;
    const eqMatch  = equipFilter === 'All' || (l.equipment || '').toLowerCase().includes(equipFilter.toLowerCase());
    const srchMatch = !searchTerm || [l.shipper, l.pickupCity, l.deliveryCity, l.commodity].join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    return srcMatch && eqMatch && srchMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'profit')  return (b.profitPerMile || b.ratePerMile || 0) - (a.profitPerMile || a.ratePerMile || 0);
    if (sortBy === 'rate')    return (b.rate || 0) - (a.rate || 0);
    if (sortBy === 'miles')   return (b.miles || 0) - (a.miles || 0);
    if (sortBy === 'rpm')     return (b.ratePerMile || 0) - (a.ratePerMile || 0);
    return 0;
  });

  function bookLoad(load) {
    setLoads(prev => prev.map(l => l.id === load.id ? { ...l, booked: true } : l));
    setLiveLoads(prev => prev.map(l => l.id === load.id ? { ...l, booked: true } : l));
    setBookedLoads(prev => [{ ...load, booked: true, bookedAt: new Date().toLocaleTimeString() }, ...prev]);
    setSelectedLoad(null);
  }

  const TABS = [
    { id: 'board',   label: '📦 Load Board' },
    { id: 'booked',  label: `✅ Booked (${bookedLoads.length})` },
    { id: 'apikeys', label: '🔑 API Connections' },
  ];

  const sourceInfo = src => SOURCES.find(s => s.id === src);

  return (
    <div style={{ fontFamily: FB, background: DARK, minHeight: '100vh', color: WHITE }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:none;} }
        @keyframes pulse  { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes spin   { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .lb-card { background:${CARD}; border:1px solid ${BORDER}; border-radius:10px; padding:16px; cursor:pointer; transition:border-color 0.15s,transform 0.15s; }
        .lb-card:hover { border-color:${GOLD}44; transform:translateY(-1px); }
        .lb-btn { cursor:pointer; transition:all 0.18s; border:none; font-family:'Inter',sans-serif; }
        .lb-btn:hover { opacity:0.88; }
        .lb-input { background:#040810; border:1px solid ${BORDER}; border-radius:7px; padding:9px 14px; color:${WHITE}; font-family:'Inter',sans-serif; font-size:13px; outline:none; }
        .lb-input:focus { border-color:${GOLD}55; }
        select.lb-input { appearance:none; }
        @media(max-width:640px){ .src-grid{grid-template-columns:repeat(2,1fr)!important;} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(180deg,#0a1018,#060A10)', borderBottom: `1px solid ${BORDER}`, padding: '0 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 0', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="lb-btn" onClick={() => navTo('/command')}
                style={{ background: 'none', color: DIM, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Back</button>
              <div style={{ width: 1, height: 16, background: BORDER }} />
              <div>
                <div style={{ fontFamily: FD, fontSize: 26, letterSpacing: '0.12em', color: GOLD, lineHeight: 1 }}>LOAD BOARD</div>
                <div style={{ fontSize: 11, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                  DAT · Uber Freight · CH Robinson · 10 Sources Live
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {connectedSources.length > 0 && (
                <div style={{ background: 'rgba(16,185,129,0.12)', border: `1px solid ${GREEN}44`, borderRadius: 6, padding: '5px 12px', fontSize: 11, color: GREEN, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  {connectedSources.length} LIVE SOURCE{connectedSources.length > 1 ? 'S' : ''}
                </div>
              )}
              <button className="lb-btn" onClick={() => setActiveTab('apikeys')}
                style={{ background: 'rgba(201,168,76,0.1)', border: `1px solid ${GOLD}44`, borderRadius: 6, padding: '5px 12px', fontSize: 11, color: GOLD, fontWeight: 700, cursor: 'pointer' }}>
                🔑 API Keys
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: 14, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.id} className="lb-btn"
                onClick={() => setActiveTab(t.id)}
                style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'none',
                  color: activeTab === t.id ? GOLD : DIM,
                  borderBottom: activeTab === t.id ? `2px solid ${GOLD}` : '2px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 60px' }}>

        {/* ══ API KEYS TAB ══ */}
        {activeTab === 'apikeys' && (
          <ApiKeyPanel keys={apiKeys} onSave={saveKeys} saving={keysSaving} />
        )}

        {/* ══ BOOKED TAB ══ */}
        {activeTab === 'booked' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            {bookedLoads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: DIM }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                <div style={{ fontFamily: FD, fontSize: 20, letterSpacing: '0.1em' }}>NO LOADS BOOKED YET</div>
                <div style={{ fontSize: 13, marginTop: 8 }}>Book a load from the Load Board tab</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bookedLoads.map(l => (
                  <div key={l.id} className="lb-card" style={{ border: `1px solid ${GREEN}44` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: WHITE }}>{l.pickupCity}, {l.pickupState} → {l.deliveryCity}, {l.deliveryState}</div>
                        <div style={{ fontSize: 12, color: DIM, marginTop: 3 }}>{l.shipper} · {l.miles} mi · {l.equipment}</div>
                        <div style={{ fontSize: 11, color: DIM, marginTop: 2 }}>Booked at {l.bookedAt}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: FM, fontSize: 20, color: GREEN, fontWeight: 700 }}>${(l.rate||0).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: DIM }}>${(l.ratePerMile||0).toFixed(2)}/mi</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ LOAD BOARD TAB ══ */}
        {activeTab === 'board' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>

            {/* Source filters */}
            <div className="src-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 8, marginBottom: 16 }}>
              {SOURCES.map(s => {
                const isLive = connectedSources.includes(s.id);
                const isLoading = liveLoading[s.id];
                const hasErr = liveErrors[s.id];
                return (
                  <button key={s.id} className="lb-btn"
                    onClick={() => { setActiveSource(s.id); if (isLive && s.id !== 'all') fetchLiveSource(s.id); }}
                    style={{ background: activeSource === s.id ? `${s.color}22` : CARD2,
                      border: `1px solid ${activeSource === s.id ? s.color : BORDER}`,
                      borderRadius: 8, padding: '9px 8px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                    <div style={{ fontSize: 16, marginBottom: 2 }}>
                      {isLoading ? <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span> : s.icon}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: activeSource === s.id ? s.color : DIM, letterSpacing: '0.04em' }}>{s.label}</div>
                    {isLive && <div style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: '50%', background: hasErr ? AMBER : GREEN, animation: 'pulse 2s infinite' }} />}
                  </button>
                );
              })}
            </div>

            {/* Live source fetch buttons */}
            {['dat', 'uber', 'chrobinson'].some(s => apiKeys[{ dat:'dat_api_key', uber:'uber_freight_key', chrobinson:'chrobinson_api_key' }[s]]) && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: DIM }}>Search live loads:</span>
                <input className="lb-input" placeholder="Origin state (e.g. TX)" value={originState} onChange={e => setOriginState(e.target.value)} style={{ width: 140 }} />
                <input className="lb-input" placeholder="Dest state (e.g. CA)" value={destState} onChange={e => setDestState(e.target.value)} style={{ width: 140 }} />
                {['dat', 'uber', 'chrobinson'].map(src => {
                  const fieldMap = { dat: 'dat_api_key', uber: 'uber_freight_key', chrobinson: 'chrobinson_api_key' };
                  if (!apiKeys[fieldMap[src]]) return null;
                  const srcInfo = SOURCES.find(s => s.id === src);
                  return (
                    <button key={src} className="lb-btn"
                      onClick={() => fetchLiveSource(src)}
                      disabled={!!liveLoading[src]}
                      style={{ background: srcInfo.color, border: 'none', borderRadius: 7, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                      {liveLoading[src] ? '⟳ Loading...' : `🔄 ${srcInfo.label}`}
                    </button>
                  );
                })}
                {Object.entries(liveErrors).filter(([,v]) => v).map(([src, err]) => (
                  <div key={src} style={{ fontSize: 11, color: AMBER }}>⚠️ {SOURCES.find(s=>s.id===src)?.label}: {err.slice(0,60)}</div>
                ))}
              </div>
            )}

            {/* Search + filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <input className="lb-input" placeholder="🔍 Search loads, city, commodity..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
              <select className="lb-input" value={equipFilter} onChange={e => setEquipFilter(e.target.value)} style={{ width: 130 }}>
                {['All','Dry Van','Flatbed','Reefer','Tanker','Step Deck'].map(e => <option key={e}>{e}</option>)}
              </select>
              <select className="lb-input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 150 }}>
                <option value="profit">Sort: Best $/mi</option>
                <option value="rate">Sort: Highest Rate</option>
                <option value="miles">Sort: Most Miles</option>
                <option value="rpm">Sort: Rate/Mile</option>
              </select>
            </div>

            <div style={{ fontSize: 12, color: DIM, marginBottom: 12 }}>
              {sorted.length} loads · {liveLoads.length > 0 && <span style={{ color: GREEN }}>{liveLoads.length} live</span>}
            </div>

            {/* Load cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sorted.map(l => {
                const src = sourceInfo(l.source);
                const rpm = l.ratePerMile || l.profitPerMile || 0;
                const isSelected = selectedLoad?.id === l.id;
                return (
                  <div key={l.id} className="lb-card"
                    onClick={() => setSelectedLoad(isSelected ? null : l)}
                    style={{ border: `1px solid ${isSelected ? GOLD + '88' : l.liveSource ? GREEN + '33' : BORDER}`, background: isSelected ? 'rgba(201,168,76,0.05)' : CARD }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ background: `${src?.color || ORANGE}22`, border: `1px solid ${src?.color || ORANGE}44`, borderRadius: 4, padding: '2px 7px', fontSize: 10, color: src?.color || ORANGE, fontWeight: 700 }}>
                            {src?.icon} {src?.label || l.source.toUpperCase()}
                          </span>
                          {l.liveSource && <span style={{ background: 'rgba(16,185,129,0.1)', border: `1px solid ${GREEN}33`, borderRadius: 4, padding: '2px 6px', fontSize: 9, color: GREEN, fontWeight: 700 }}>LIVE</span>}
                          {l.hazmat && <span style={{ background: 'rgba(239,68,68,0.1)', border: `1px solid ${RED}33`, borderRadius: 4, padding: '2px 6px', fontSize: 9, color: RED, fontWeight: 700 }}>HAZMAT</span>}
                          {l.tempRequired && <span style={{ background: 'rgba(59,130,246,0.1)', border: `1px solid ${BLUE}33`, borderRadius: 4, padding: '2px 6px', fontSize: 9, color: BLUE, fontWeight: 700 }}>TEMP</span>}
                          <span style={{ fontSize: 10, color: DIM }}>{l.age}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: WHITE, marginBottom: 4 }}>
                          {l.pickupCity}, {l.pickupState} → {l.deliveryCity}, {l.deliveryState}
                        </div>
                        <div style={{ fontSize: 12, color: DIM }}>
                          {l.shipper} · {l.miles} mi · {l.weight} · {l.equipment} · {l.commodity}
                        </div>
                        <div style={{ fontSize: 11, color: DIM, marginTop: 3 }}>📅 {l.pickupDate}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: FM, fontSize: 22, fontWeight: 700, color: rpm >= 6 ? GREEN : rpm >= 4 ? AMBER : RED }}>
                          ${(l.rate || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: DIM }}>${rpm.toFixed(2)}/mi</div>
                        {l.reliability && <div style={{ fontSize: 11, color: GOLD, marginTop: 4 }}>⭐ {l.reliability} broker score</div>}
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}`, animation: 'fadeUp 0.2s ease both' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 14 }}>
                          {[
                            ['Pickup Contact', l.pickupContact || 'See broker'],
                            ['Pickup Phone', l.pickupPhone || 'Via broker'],
                            ['Delivery Contact', l.deliveryContact || 'See broker'],
                            ['Est. Fuel Cost', l.estFuelCost ? `$${l.estFuelCost}` : 'Calculate'],
                            ['Est. Profit', l.estProfit ? `$${l.estProfit}` : 'See rate'],
                            ['Detention', l.detentionHistory || 'Unknown'],
                          ].map(([label, val]) => (
                            <div key={label} style={{ background: DARK, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '9px 12px' }}>
                              <div style={{ fontSize: 9, color: DIM, fontWeight: 700, letterSpacing: '0.07em', marginBottom: 3 }}>{label}</div>
                              <div style={{ fontSize: 12, color: WHITE, fontWeight: 600 }}>{val}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <button className="lb-btn"
                            onClick={e => { e.stopPropagation(); bookLoad(l); }}
                            style={{ background: GREEN, borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                            ✅ Book This Load
                          </button>
                          {l.pickupPhone && (
                            <a href={`tel:${l.pickupPhone}`} style={{ background: BLUE, borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
                              📞 Call Broker
                            </a>
                          )}
                          <button className="lb-btn" onClick={e => { e.stopPropagation(); setSelectedLoad(null); }}
                            style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: DIM, cursor: 'pointer' }}>
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
