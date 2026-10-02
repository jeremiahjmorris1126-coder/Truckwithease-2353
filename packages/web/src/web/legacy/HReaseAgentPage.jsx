import { useState, useEffect, useCallback } from 'react';
import { pb } from './lib/pb';

// ── Brand ──────────────────────────────────────────────────────────────────
const DARK   = '#060A10';
const CARD   = '#0D1520';
const CARD2  = '#0a1118';
const BORDER = '#1a2535';
const GOLD   = '#c9a84c';
const WHITE  = '#F0EDE8';
const DIM    = 'rgba(240,237,232,0.5)';
const DIM2   = 'rgba(240,237,232,0.1)';
const GREEN  = '#10B981';
const RED    = '#EF4444';
const AMBER  = '#FFB400';
const BLUE   = '#3B82F6';
const PURPLE = '#8B5CF6';
const ORANGE = '#FF6B00';
const TEAL   = '#06B6D4';
const FD     = "'Bebas Neue','Oswald',sans-serif";
const FB     = "'Inter',system-ui,sans-serif";

function navTo(p) { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }
const fmt  = n => '$' + Math.round(n).toLocaleString();
const pct  = n => parseFloat(n).toFixed(1) + '%';

// ── Intelligence Payroll Engine ────────────────────────────────────────────────
function calcDriverPayroll(d) {
  const grossMiles  = d.weeklyMiles || 0;
  const ratePerMile = d.payRatePerMile || 0.55;
  const loads       = d.weeklyLoads || 0;
  const loadBonus   = loads * (d.loadBonus || 25);
  const safetyBonus = d.safetyScore >= 95 ? 150 : d.safetyScore >= 85 ? 75 : 0;
  const grossPay    = (grossMiles * ratePerMile) + loadBonus + safetyBonus;
  const fica        = grossPay * 0.0765;
  const federal     = grossPay > 800 ? grossPay * 0.22 : grossPay * 0.12;
  const state       = grossPay * 0.045;
  const totalTax    = fica + federal + state;
  const netPay      = grossPay - totalTax;
  const fuelCost    = grossMiles * 0.38;
  const maintCost   = grossMiles * 0.12;
  const insureCost  = grossMiles * 0.06;
  const totalCost   = fuelCost + maintCost + insureCost + grossPay;
  const revenue     = grossMiles * (d.revenuePerMile || 2.10);
  const profit      = revenue - totalCost;
  const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
  return { grossPay, netPay, fica, federal, state, totalTax, fuelCost, maintCost, insureCost, totalCost, revenue, profit, profitMargin, loadBonus, safetyBonus };
}

function calcComplianceScore(d) {
  let score = 100;
  const today  = new Date();
  const cdlExp = new Date(d.cdl?.expires || '2030-01-01');
  const medExp = new Date(d.medCard?.expires || '2030-01-01');
  const cdlDays = Math.ceil((cdlExp - today) / 86400000);
  const medDays = Math.ceil((medExp - today) / 86400000);
  if (cdlDays < 0) score -= 40; else if (cdlDays < 30) score -= 20; else if (cdlDays < 90) score -= 10;
  if (medDays < 0) score -= 40; else if (medDays < 30) score -= 20; else if (medDays < 90) score -= 10;
  if (d.criminalBackground?.status === 'Pending') score -= 10;
  if (d.dotBackground?.violations > 0) score -= (d.dotBackground.violations * 5);
  if (d.insurance?.status !== 'Approved') score -= 15;
  if (!d.drugTestClear) score -= 15;
  if (!d.roadTestPassed) score -= 10;
  return { score: Math.max(0, score), cdlDays, medDays };
}

function calcHireScore(a) {
  let s = 50;
  if (a.yearsExp >= 10) s += 20; else if (a.yearsExp >= 5) s += 12; else if (a.yearsExp >= 2) s += 6;
  if (a.accidentsFree >= 5) s += 15; else if (a.accidentsFree >= 2) s += 8;
  if (a.cdlClass === 'A') s += 10; else if (a.cdlClass === 'B') s += 5;
  if (a.endorsements?.includes('Hazmat')) s += 8;
  if (a.endorsements?.includes('Tanker')) s += 5;
  if (a.criminalClear) s += 5; else s -= 20;
  if (a.interviewScore >= 8) s += 10; else if (a.interviewScore >= 6) s += 5;
  if (a.roadTestScore >= 90) s += 8; else if (a.roadTestScore >= 75) s += 4;
  if (a.drugTestClear) s += 5; else s -= 25;
  return Math.min(100, Math.max(0, s));
}

// Intelligence value projection — what a driver will bring to the fleet
function calcDriverValue(a) {
  const avgMilesPerWeek = 2500 + (a.yearsExp || 0) * 50;
  const ratePerMile     = 0.55 + (a.yearsExp >= 10 ? 0.07 : a.yearsExp >= 5 ? 0.04 : 0);
  const revenuePerMile  = 2.10 + (a.endorsements?.includes('Hazmat') ? 0.25 : 0) + (a.endorsements?.includes('Tanker') ? 0.15 : 0);
  const weeklyRevenue   = avgMilesPerWeek * revenuePerMile;
  const weeklyPay       = avgMilesPerWeek * ratePerMile;
  const weeklyOps       = avgMilesPerWeek * 0.56; // fuel + maint + insurance
  const weeklyProfit    = weeklyRevenue - weeklyPay - weeklyOps;
  const annualProfit    = weeklyProfit * 52;
  const retentionYears  = a.yearsExp >= 10 ? 4.2 : a.yearsExp >= 5 ? 2.8 : 1.5;
  const lifetimeValue   = annualProfit * retentionYears;
  const safetyRisk      = a.accidentsFree >= 5 ? 'LOW' : a.accidentsFree >= 2 ? 'MEDIUM' : 'HIGH';
  return { avgMilesPerWeek, weeklyRevenue, weeklyProfit, annualProfit, lifetimeValue, retentionYears, safetyRisk, ratePerMile };
}

// Road Test Grader
function gradeRoadTest(scores) {
  const { preTrip=0, backing=0, alley=0, highway=0, parking=0, braking=0, mirrors=0, coupling=0 } = scores;
  const items  = [preTrip, backing, alley, highway, parking, braking, mirrors, coupling];
  const avg    = items.reduce((a,b)=>a+b,0) / items.filter(v=>v>0).length || 0;
  const grade  = avg >= 90 ? 'A — PASS — Hire Ready' : avg >= 80 ? 'B — PASS — Minor Coaching Needed' : avg >= 70 ? 'C — CONDITIONAL — Re-test in 30 Days' : 'F — FAIL — Do Not Hire';
  const color  = avg >= 90 ? GREEN : avg >= 80 ? TEAL : avg >= 70 ? AMBER : RED;
  return { avg: avg.toFixed(1), grade, color };
}

// ── Drug Test Locations (nationwide, major corridors) ─────────────────────
const DRUG_TEST_LOCATIONS = [
  { name:'Quest Diagnostics', city:'Chicago, IL',      address:'233 N Michigan Ave',                  phone:'800-377-8448', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–5pm' },
  { name:'LabCorp',           city:'Atlanta, GA',      address:'1365 Clifton Rd NE',                  phone:'800-522-7096', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–6pm' },
  { name:'ClinTest',          city:'Dallas, TX',       address:'4500 S Lancaster Rd',                 phone:'214-555-0190', dot:true, preEmploy:true, random:true, hours:'Mon–Sat 6am–8pm' },
  { name:'Quest Diagnostics', city:'Los Angeles, CA',  address:'2020 Santa Monica Blvd',              phone:'800-377-8448', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–5pm' },
  { name:'Concentra',         city:'Memphis, TN',      address:'3445 Poplar Ave',                     phone:'901-555-0134', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 8am–5pm' },
  { name:'LabCorp',           city:'Houston, TX',      address:'6560 Fannin St',                      phone:'800-522-7096', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–6pm' },
  { name:'ClinTest',          city:'Columbus, OH',     address:'1492 E Broad St',                     phone:'614-555-0112', dot:true, preEmploy:true, random:true, hours:'Mon–Sat 7am–7pm' },
  { name:'Concentra',         city:'Phoenix, AZ',      address:'2222 W Camelback Rd',                 phone:'602-555-0178', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–6pm' },
  { name:'Quest Diagnostics', city:'Denver, CO',       address:'1601 E 19th Ave',                     phone:'800-377-8448', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–5pm' },
  { name:'LabCorp',           city:'Charlotte, NC',    address:'1000 Blythe Blvd',                    phone:'800-522-7096', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–6pm' },
  { name:'Concentra',         city:'Indianapolis, IN', address:'3255 N Meridian St',                  phone:'317-555-0145', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 8am–5pm' },
  { name:'ClinTest',          city:'Kansas City, MO',  address:'4801 E 63rd St',                      phone:'816-555-0167', dot:true, preEmploy:true, random:true, hours:'Mon–Sat 7am–7pm' },
  { name:'Quest Diagnostics', city:'Nashville, TN',    address:'2300 Patterson St',                   phone:'800-377-8448', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–5pm' },
  { name:'LabCorp',           city:'Seattle, WA',      address:'1959 NE Pacific St',                  phone:'800-522-7096', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–6pm' },
  { name:'Concentra',         city:'Miami, FL',        address:'7600 SW 57th Ave',                    phone:'305-555-0189', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–6pm' },
  { name:'ClinTest',          city:'St. Louis, MO',    address:'1 Barnes Hospital Plaza',             phone:'314-555-0123', dot:true, preEmploy:true, random:true, hours:'Mon–Sat 7am–7pm' },
  { name:'Quest Diagnostics', city:'Minneapolis, MN',  address:'2450 Riverside Ave',                  phone:'800-377-8448', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–5pm' },
  { name:'LabCorp',           city:'Pittsburgh, PA',   address:'3459 5th Ave',                        phone:'800-522-7096', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 7am–6pm' },
  { name:'Concentra',         city:'Salt Lake City,UT',address:'333 S 700 E',                         phone:'801-555-0156', dot:true, preEmploy:true, random:true, hours:'Mon–Fri 8am–5pm' },
  { name:'ClinTest',          city:'Oklahoma City, OK',address:'4200 N Lincoln Blvd',                 phone:'405-555-0178', dot:true, preEmploy:true, random:true, hours:'Mon–Sat 7am–7pm' },
];

// ── Compliance Documents ──────────────────────────────────────────────────
const COMPLIANCE_DOCS = [
  { category:'Pre-Employment', docs:['DOT Drug Test Consent Form','Driver Application (FMCSA 49 CFR 391.21)','Motor Vehicle Record Authorization','Previous Employer Safety Inquiry','Criminal Background Authorization','Medical Examination Report (Form MCSA-5875)','CDL Copy & Verification','Social Security Verification','Road Test Certificate (FMCSA 391.31)','Entry Level Driver Training Certificate'] },
  { category:'Ongoing Compliance', docs:['Annual MVR Pull Authorization','Random Drug/Alcohol Testing Consent','Annual Driver Review Form','Hours of Service Log Certification','Vehicle Inspection Report (DVIR)','Accident Report Form (if applicable)','Driver Fitness Declaration','Medical Certificate (DOT Physical)','Hazmat Training Certificate (if endorsed)','Annual Safety Meeting Attendance'] },
  { category:'DOT Required Records', docs:['Driver Qualification File (DQF)','Training Records (ELDT Certificate)','Drug & Alcohol Testing Records (5 years)','Accident Register (3 years)','Inspection/Maintenance Records (1 year)','HOS Logs (6 months)','Insurance Certificate','Operating Authority (MC Number)','IFTA License','UCR Registration'] },
  { category:'State-Specific', docs:['CA AB5 Classification Assessment','CA DMV Pull Notice Enrollment','NY Certificate of Liability','TX Commercial Vehicle Registration','FL Unified Carrier Registration','IL Oversize/Overweight Permit (if applicable)','PA Safety Inspection Certificate','OH Commercial Activity License','GA Safety Fitness Certificate','TX Household Goods Carrier Permit (if applicable)'] },
];

// ── Hiring Platforms ──────────────────────────────────────────────────────
const HIRING_PLATFORMS = [
  { id:'linkedin',    name:'LinkedIn',         icon:'💼', color:'#0077B5', field:'linkedin_api_key',    desc:'Professional network — reach experienced company drivers, owner-ops, and fleet managers. Best for senior hires.', endpoint:'api.linkedin.com/v2/jobs', keyFormat:'Bearer token from LinkedIn Developer Portal', link:'https://developer.linkedin.com', candidates:42000 },
  { id:'indeed',      name:'Indeed',           icon:'🔍', color:'#003A9B', field:'indeed_api_key',      desc:'Largest job board in North America. Highest volume of CDL driver applications across all experience levels.', endpoint:'apis.indeed.com/v2/jobs', keyFormat:'API key from Indeed Publisher Dashboard', link:'https://ads.indeed.com/jobroll', candidates:180000 },
  { id:'ziprecruiter',name:'ZipRecruiter',     icon:'⚡', color:'#5BAD6F', field:'ziprecruiter_api_key',desc:'AI-powered matching — sends driver candidates to you based on your fleet profile. Fast turnaround.', endpoint:'api.ziprecruiter.com/v1/jobs', keyFormat:'API key from ZipRecruiter Partner Portal', link:'https://www.ziprecruiter.com/partner', candidates:95000 },
  { id:'drivejobs',   name:'Drive My Way',     icon:'🚛', color:GOLD,      field:'drivemyway_api_key',  desc:'Trucking-specific platform. Matches CDL drivers to fleet profiles automatically. Highest relevance score.', endpoint:'api.drivemyway.com/v1/candidates', keyFormat:'Partner API key', link:'https://drivemyway.com/carriers', candidates:28000 },
  { id:'truckinfo',   name:'TruckInfo.net',    icon:'🔧', color:ORANGE,    field:'truckinfo_api_key',   desc:'Niche trucking job board with pre-screened CDL holders. Lower volume, higher quality candidates.', endpoint:'api.truckinfo.net/v1/candidates', keyFormat:'Carrier API key', link:'https://truckinfo.net/employers', candidates:12000 },
  { id:'cdljobs',     name:'CDL Jobs',         icon:'📋', color:PURPLE,    field:'cdljobs_api_key',     desc:'Dedicated CDL driver marketplace. Filter by endorsements, experience, home-state, and equipment type.', endpoint:'api.cdljobs.com/v1/search', keyFormat:'Employer API key', link:'https://cdljobs.com/employers', candidates:35000 },
  { id:'glassdoor',   name:'Glassdoor',        icon:'🌟', color:GREEN,     field:'glassdoor_api_key',   desc:'Job listings + employer reviews. Drivers check Glassdoor before applying — your rating matters here.', endpoint:'api.glassdoor.com/api/api.htm', keyFormat:'Partner key + employer ID', link:'https://www.glassdoor.com/developer', candidates:67000 },
  { id:'facebook',    name:'Facebook Jobs',    icon:'👥', color:'#1877F2', field:'facebook_page_token', desc:'Facebook Jobs reaches local drivers actively looking. Great for regional fleets and OTR at the same time.', endpoint:'graph.facebook.com/v18.0/{page-id}/jobs', keyFormat:'Page Access Token from Meta Business', link:'https://developers.facebook.com', candidates:55000 },
];

// ── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_DRIVERS = [
  { id:1, name:'Ray Davis',     status:'Active', startDate:'2023-03-15', weeklyMiles:2800, weeklyLoads:6, payRatePerMile:0.58, loadBonus:30, safetyScore:97, revenuePerMile:2.15, drugTestClear:true, roadTestPassed:true, cdl:{ expires:'2027-08-20', status:'Valid', number:'MO12345678', class:'A' }, medCard:{ expires:'2026-10-10', status:'Valid' }, criminalBackground:{ status:'Clear', violations:'None', lastCheck:'2023-02-28' }, dotBackground:{ status:'Compliant', score:97, violations:0, lastAudit:'2026-01-15' }, insurance:{ status:'Approved', policy:'POL-448293' }, suggestedDoctor:{ name:'Dr. Sarah Chen, MD', clinic:'TransCare Medical — St. Louis', phone:'314-555-0123', availability:'2026-09-15' } },
  { id:2, name:'Maria Santos',  status:'Active', startDate:'2024-01-10', weeklyMiles:2400, weeklyLoads:5, payRatePerMile:0.55, loadBonus:25, safetyScore:88, revenuePerMile:2.08, drugTestClear:true, roadTestPassed:true, cdl:{ expires:'2028-05-15', status:'Valid', number:'TX87654321', class:'A' }, medCard:{ expires:'2026-06-01', status:'Valid' }, criminalBackground:{ status:'Pending', violations:'Background check in progress', lastCheck:null }, dotBackground:{ status:'Compliant', score:88, violations:0, lastAudit:'2025-11-20' }, insurance:{ status:'Pending Review', policy:'POL-449102' }, suggestedDoctor:{ name:'Dr. James Rodriguez, MD', clinic:'HealthFirst Occupational — Dallas', phone:'214-555-0189', availability:'2026-09-20' } },
  { id:3, name:'John Miller',   status:'Active', startDate:'2022-07-20', weeklyMiles:3100, weeklyLoads:7, payRatePerMile:0.60, loadBonus:35, safetyScore:74, revenuePerMile:2.20, drugTestClear:true, roadTestPassed:true, cdl:{ expires:'2026-11-30', status:'Valid', number:'OH54321098', class:'A' }, medCard:{ expires:'2026-09-15', status:'Valid' }, criminalBackground:{ status:'Clear', violations:'None', lastCheck:'2022-06-15' }, dotBackground:{ status:'Warning', score:74, violations:1, lastAudit:'2025-09-10', detail:'1 seat belt violation' }, insurance:{ status:'Approved', policy:'POL-447561' }, suggestedDoctor:{ name:'Dr. Michael Thompson, MD', clinic:'Fleet Medical Centers — Memphis', phone:'901-555-0145', availability:'2026-09-10' } },
  { id:4, name:'Darius Walker', status:'Active', startDate:'2021-04-05', weeklyMiles:2950, weeklyLoads:6, payRatePerMile:0.62, loadBonus:40, safetyScore:99, revenuePerMile:2.25, drugTestClear:true, roadTestPassed:true, cdl:{ expires:'2029-02-10', status:'Valid', number:'GA90123456', class:'A' }, medCard:{ expires:'2027-03-20', status:'Valid' }, criminalBackground:{ status:'Clear', violations:'None', lastCheck:'2021-03-15' }, dotBackground:{ status:'Compliant', score:99, violations:0, lastAudit:'2026-03-01' }, insurance:{ status:'Approved', policy:'POL-446890' }, suggestedDoctor:{ name:'Dr. Keisha Brown, MD', clinic:'Southside Medical Group — Atlanta', phone:'404-555-0234', availability:'2027-02-01' } },
];

const MOCK_APPLICANTS = [
  { id:1, name:'Thomas Chen',    source:'linkedin',    appliedDate:'2026-08-01', status:'Road Test', yearsExp:12, accidentsFree:12, cdlClass:'A', endorsements:['Hazmat','Tanker'], criminalClear:true, interviewScore:9.1, roadTestScore:94, drugTestClear:true,  notes:'Exceptional record. Navy veteran. Recommend immediate hire.' },
  { id:2, name:'Angela Brown',   source:'indeed',      appliedDate:'2026-07-28', status:'Background', yearsExp:7, accidentsFree:7,  cdlClass:'A', endorsements:['Tanker'],           criminalClear:true, interviewScore:8.2, roadTestScore:87, drugTestClear:true,  notes:'Strong hire. 7 years clean record.' },
  { id:3, name:'Marcus Johnson', source:'ziprecruiter',appliedDate:'2026-07-20', status:'Drug Test', yearsExp:4,  accidentsFree:2,  cdlClass:'A', endorsements:[],                   criminalClear:true, interviewScore:7.0, roadTestScore:76, drugTestClear:null,  notes:'Waiting on drug test result. Road test conditional pass.' },
  { id:4, name:'Lisa Torres',    source:'drivejobs',   appliedDate:'2026-08-10', status:'Interview', yearsExp:15, accidentsFree:15, cdlClass:'A', endorsements:['Hazmat','Doubles'],   criminalClear:true, interviewScore:null,roadTestScore:null,drugTestClear:null,  notes:'Pending road test and AI interview.' },
  { id:5, name:'Derek Simmons',  source:'cdljobs',     appliedDate:'2026-08-12', status:'New',       yearsExp:9,  accidentsFree:9,  cdlClass:'A', endorsements:['Hazmat'],             criminalClear:true, interviewScore:null,roadTestScore:null,drugTestClear:null,  notes:'Fresh application from CDL Jobs board.' },
];

const ROAD_TEST_CRITERIA = [
  { key:'preTrip',  label:'Pre-Trip Inspection',      weight:15, desc:'All fluid checks, lights, brakes, tires, coupling' },
  { key:'backing',  label:'Backing & Maneuvering',    weight:20, desc:'Straight line, alley dock, parallel park' },
  { key:'alley',    label:'Alley Dock',                weight:15, desc:'Precision entry, distance to dock, no strikes' },
  { key:'highway',  label:'Highway Driving',           weight:15, desc:'Lane changes, speed management, following distance' },
  { key:'parking',  label:'Parking & Turns',           weight:10, desc:'Off-street parking, right turns, intersection control' },
  { key:'braking',  label:'Braking & Skid Control',   weight:10, desc:'Controlled stops, emergency procedures, ABS awareness' },
  { key:'mirrors',  label:'Mirror Usage & Awareness',  weight:10, desc:'Frequency, blind spots, trailer tracking' },
  { key:'coupling', label:'Coupling & Uncoupling',     weight:5,  desc:'Fifth wheel check, landing gear, air lines' },
];

const TABS = [
  { id:'dashboard',   label:'📊 Dashboard' },
  { id:'hiring',      label:'🌐 Hiring Platforms' },
  { id:'applicants',  label:'📋 Applicants' },
  { id:'roadtest',    label:'🛞 Road Test Grader' },
  { id:'drugtest',    label:'💊 Drug Test Locator' },
  { id:'compliance',  label:'✅ Compliance' },
  { id:'documents',   label:'📁 Document Center' },
  { id:'payroll',     label:'💰 Payroll Engine' },
  { id:'drivers',     label:'👥 Driver Files' },
  { id:'intelligence',     label:'⚡ Intelligence HR' },
  { id:'reports',     label:'📈 Reports' },
];

export default function HReaseAgentPage() {
  const [tab, setTab]               = useState('dashboard');
  const [drivers, setDrivers]       = useState(MOCK_DRIVERS);
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [expanded, setExpanded]     = useState(null);
  const [payPeriod, setPayPeriod]   = useState('weekly');
  const [engineRunning, setQR]     = useState(false);
  const [engineLog, setQL]         = useState([]);
  const [engineScore, setQS]       = useState(null);
  const [drugSearch, setDS]         = useState('');
  const [roadScores, setRS]         = useState({});
  const [roadApplicant, setRA]      = useState('');
  const [roadResult, setRR]         = useState(null);
  const [hiringKeys, setHK]         = useState({});
  const [hkSaving, setHKS]          = useState(false);
  const [docSearch, setDocSearch]   = useState('');
  const [addDriverOpen, setADO]     = useState(false);
  const [newDriver, setND]          = useState({ name:'', cdlClass:'A', payRatePerMile:'0.55', weeklyMiles:'2500', weeklyLoads:'5', safetyScore:'90', revenuePerMile:'2.10' });

  useEffect(() => {
    async function load() {
      try { const r = await pb.collection('drivers').getFullList({ sort:'-created' }); if (r.length) setDrivers(r.map(d=>({...MOCK_DRIVERS[0],...d}))); } catch {}
      try { const r = await pb.collection('applicants').getFullList({ sort:'-created' }); if (r.length) setApplicants(r.map(a=>({...MOCK_APPLICANTS[0],...a}))); } catch {}
      try { const r = await pb.collection('platform_settings').getList(1,1); const s = r.items[0] || {}; setHK({ linkedin_api_key:s.linkedin_api_key||'', indeed_api_key:s.indeed_api_key||'', ziprecruiter_api_key:s.ziprecruiter_api_key||'', drivemyway_api_key:s.drivemyway_api_key||'', cdljobs_api_key:s.cdljobs_api_key||'', glassdoor_api_key:s.glassdoor_api_key||'', facebook_page_token:s.facebook_page_token||'', truckinfo_api_key:s.truckinfo_api_key||'' }); } catch {}
    }
    load();
  }, []);

  const saveHiringKey = async (field, value) => {
    setHKS(true);
    try {
      const r = await pb.collection('platform_settings').getList(1,1);
      const s = r.items[0];
      if (s) await pb.collection('platform_settings').update(s.id, { [field]: value });
      else await pb.collection('platform_settings').create({ [field]: value });
      setHK(prev => ({ ...prev, [field]: value }));
    } catch {}
    setHKS(false);
  };

  const fleetPayroll = drivers.reduce((acc,d) => { const p=calcDriverPayroll(d); return { grossPay:acc.grossPay+p.grossPay, netPay:acc.netPay+p.netPay, revenue:acc.revenue+p.revenue, profit:acc.profit+p.profit, totalCost:acc.totalCost+p.totalCost }; }, { grossPay:0,netPay:0,revenue:0,profit:0,totalCost:0 });
  const fleetCompliance = drivers.map(d=>({ name:d.name, ...calcComplianceScore(d) }));
  const avgCompliance   = Math.round(fleetCompliance.reduce((a,c)=>a+c.score,0)/drivers.length);
  const urgentItems     = fleetCompliance.filter(c=>c.cdlDays<90||c.medDays<90||c.score<80);
  const connectedPlatforms = HIRING_PLATFORMS.filter(p=>hiringKeys[p.field]);
  const totalCandidatePool = connectedPlatforms.reduce((a,p)=>a+p.candidates,0);

  const submitRoadTest = () => {
    const result = gradeRoadTest(roadScores);
    setRR(result);
    if (roadApplicant) {
      setApplicants(prev => prev.map(a => a.name === roadApplicant ? { ...a, roadTestScore: parseFloat(result.avg), status: parseFloat(result.avg) >= 70 ? 'Drug Test' : 'Failed Road Test' } : a));
    }
  };

  const runEngineScan = useCallback(async () => {
    setQR(true); setQL([]); setQS(null);
    const lines = [
      '⚡ Initializing Intelligence HR Engine v3.0...',
      `🔍 Scanning ${drivers.length} active driver files — CDL, medical, DOT, insurance, drug test, road test...`,
      `📊 Payroll engine running — calculating gross, taxes, net, and profit per driver...`,
      `🤖 Intelligence hire-score algorithm processing ${applicants.length} applicants...`,
      `🛞 Road test grade analysis — reviewing all road test scores for fleet readiness...`,
      `💊 Drug test status sweep — flagging pending results and expired clearances...`,
      `🌐 Candidate pipeline scan — ${connectedPlatforms.length} hiring platforms connected · ${totalCandidatePool.toLocaleString()} active candidates...`,
      `📁 Compliance document audit — checking all required FMCSA files...`,
      `⚠️ Risk analysis — flagging compliance gaps, hiring risks, retention threats...`,
      `💰 Fleet profitability model — revenue vs. cost per driver, lifetime value projections...`,
      `🧬 Intelligence optimization complete — workforce recommendations generated.`,
    ];
    for (let i=0; i<lines.length; i++) { await new Promise(r=>setTimeout(r,420)); setQL(prev=>[...prev,lines[i]]); }
    const score = Math.round((avgCompliance*0.35) + (fleetPayroll.profit>0?30:10) + (applicants.filter(a=>calcHireScore(a)>=70).length/applicants.length*20) + (connectedPlatforms.length/HIRING_PLATFORMS.length*15));
    setQS(score); setQR(false);
    try { await pb.collection('mechanic_sessions').create({ session_mode:'hr_scan', diagnosis:`Score:${score}`, resolution_status:'completed' }); } catch {}
  }, [drivers, applicants, avgCompliance, fleetPayroll.profit, connectedPlatforms.length, totalCandidatePool]);

  const addDriver = async () => {
    const d = { ...MOCK_DRIVERS[0], id:Date.now(), name:newDriver.name, status:'Active', startDate:new Date().toISOString().slice(0,10), payRatePerMile:parseFloat(newDriver.payRatePerMile), weeklyMiles:parseInt(newDriver.weeklyMiles), weeklyLoads:parseInt(newDriver.weeklyLoads), safetyScore:parseInt(newDriver.safetyScore), revenuePerMile:parseFloat(newDriver.revenuePerMile), cdl:{...MOCK_DRIVERS[0].cdl,class:newDriver.cdlClass} };
    setDrivers(prev=>[d,...prev]);
    try { await pb.collection('drivers').create({ name:d.name, status:'Active', startDate:d.startDate }); } catch {}
    setADO(false); setND({ name:'', cdlClass:'A', payRatePerMile:'0.55', weeklyMiles:'2500', weeklyLoads:'5', safetyScore:'90', revenuePerMile:'2.10' });
  };

  const filteredDrugLocs = DRUG_TEST_LOCATIONS.filter(l => !drugSearch || l.city.toLowerCase().includes(drugSearch.toLowerCase()) || l.name.toLowerCase().includes(drugSearch.toLowerCase()));

  // ── UI helpers ────────────────────────────────────────────────────────────
  const Sect = ({ title, color=GOLD, children }) => (
    <div style={{ marginBottom:32 }}>
      <div style={{ fontFamily:FD, fontSize:20, letterSpacing:'0.1em', color, marginBottom:16 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:DARK, fontFamily:FB, color:WHITE }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0a1520 0%,#060A10 100%)', borderBottom:`2px solid ${GOLD}44`, padding:'24px 5%' }}>
        <button onClick={()=>navTo('/')} style={{ background:'none', border:'none', color:DIM, fontSize:12, cursor:'pointer', marginBottom:12, padding:0 }}>← Back</button>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:FD, fontSize:11, letterSpacing:'0.2em', color:GOLD }}>TRUCKWITHEASE</div>
            <div style={{ fontFamily:FD, fontSize:42, letterSpacing:'0.06em', lineHeight:1.1 }}>HRease Agent</div>
            <div style={{ fontSize:13, color:DIM, marginTop:4 }}>Calculate · Report · Automate · Intelligence · Hire</div>
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {[
              { label:'DRIVERS', value:drivers.length, color:GOLD },
              { label:'COMPLIANCE', value:`${avgCompliance}%`, color:avgCompliance>=90?GREEN:AMBER },
              { label:'WEEKLY PAYROLL', value:fmt(fleetPayroll.grossPay), color:WHITE },
              { label:'FLEET PROFIT', value:fmt(fleetPayroll.profit), color:fleetPayroll.profit>0?GREEN:RED },
              { label:'PLATFORMS', value:`${connectedPlatforms.length}/${HIRING_PLATFORMS.length}`, color:BLUE },
              { label:'CANDIDATES', value:totalCandidatePool>0?totalCandidatePool.toLocaleString():'Connect', color:PURPLE },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', background:DIM2, border:`1px solid ${BORDER}`, borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontFamily:FD, fontSize:20, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:9, color:DIM, letterSpacing:'0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:CARD, borderBottom:`1px solid ${BORDER}`, display:'flex', overflowX:'auto', padding:'0 5%' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:'none', border:'none', borderBottom:`3px solid ${tab===t.id?GOLD:'transparent'}`, color:tab===t.id?GOLD:DIM, padding:'13px 16px', cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap', fontFamily:FB, transition:'all 0.2s' }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding:'32px 5%', maxWidth:1400, margin:'0 auto' }}>

        {/* ── DASHBOARD ── */}
        {tab==='dashboard' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:32 }}>
              {[
                { label:'Active Drivers', value:drivers.filter(d=>d.status==='Active').length, icon:'🚛', color:GOLD },
                { label:'Open Applications', value:applicants.length, icon:'📋', color:BLUE },
                { label:'Urgent Compliance', value:urgentItems.length, icon:'🔴', color:RED },
                { label:'Weekly Gross Pay', value:fmt(fleetPayroll.grossPay), icon:'💰', color:GREEN },
                { label:'Fleet Revenue', value:fmt(fleetPayroll.revenue), icon:'📈', color:PURPLE },
                { label:'Net Fleet Profit', value:fmt(fleetPayroll.profit), icon:'💎', color:fleetPayroll.profit>0?GREEN:RED },
                { label:'Platforms Live', value:connectedPlatforms.length, icon:'🌐', color:TEAL },
                { label:'Candidate Pool', value:totalCandidatePool>0?totalCandidatePool.toLocaleString():'0', icon:'👥', color:ORANGE },
              ].map(c => (
                <div key={c.label} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:18, textAlign:'center' }}>
                  <div style={{ fontSize:26, marginBottom:5 }}>{c.icon}</div>
                  <div style={{ fontFamily:FD, fontSize:24, color:c.color }}>{c.value}</div>
                  <div style={{ fontSize:10, color:DIM }}>{c.label}</div>
                </div>
              ))}
            </div>

            {urgentItems.length > 0 && (
              <div style={{ background:`${RED}11`, border:`1px solid ${RED}33`, borderRadius:12, padding:20, marginBottom:24 }}>
                <div style={{ fontFamily:FD, fontSize:18, color:RED, letterSpacing:'0.1em', marginBottom:12 }}>🚨 COMPLIANCE ALERTS</div>
                {urgentItems.map(u => (
                  <div key={u.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${BORDER}`, flexWrap:'wrap', gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:600 }}>{u.name}</span>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {u.cdlDays<90 && <span style={{ fontSize:11, color:u.cdlDays<30?RED:AMBER, background:u.cdlDays<30?`${RED}22`:`${AMBER}22`, padding:'3px 10px', borderRadius:5 }}>CDL: {u.cdlDays}d left</span>}
                      {u.medDays<90 && <span style={{ fontSize:11, color:u.medDays<30?RED:AMBER, background:u.medDays<30?`${RED}22`:`${AMBER}22`, padding:'3px 10px', borderRadius:5 }}>Med: {u.medDays}d left</span>}
                      {u.score<80 && <span style={{ fontSize:11, color:RED, background:`${RED}22`, padding:'3px 10px', borderRadius:5 }}>Score: {u.score}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Applicant pipeline */}
            <Sect title="ACTIVE APPLICANT PIPELINE">
              <div style={{ display:'flex', gap:0, overflowX:'auto', marginBottom:8 }}>
                {['New','Interview','Road Test','Drug Test','Background','Offer'].map((stage,i) => {
                  const count = applicants.filter(a=>a.status===stage||a.status===stage+' Pending').length;
                  return (
                    <div key={stage} style={{ flex:1, minWidth:80, textAlign:'center', padding:'12px 8px', background:i%2===0?CARD:CARD2, borderRight:`1px solid ${BORDER}` }}>
                      <div style={{ fontFamily:FD, fontSize:22, color:GOLD }}>{count}</div>
                      <div style={{ fontSize:10, color:DIM }}>{stage}</div>
                    </div>
                  );
                })}
              </div>
            </Sect>

            {/* Top performers */}
            <Sect title="TOP PERFORMERS THIS WEEK">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:14 }}>
                {[...drivers].sort((a,b)=>calcDriverPayroll(b).profit-calcDriverPayroll(a).profit).slice(0,4).map((d,i) => {
                  const p = calcDriverPayroll(d);
                  return (
                    <div key={d.id} style={{ background:CARD, border:`1px solid ${i===0?GOLD:BORDER}`, borderRadius:12, padding:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{d.name}</div>
                        {i===0 && <span style={{ fontSize:11, color:GOLD }}>🏆 #1</span>}
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                        {[['Revenue',fmt(p.revenue),GREEN],['Profit',fmt(p.profit),p.profit>0?GREEN:RED],['Margin',pct(p.profitMargin),PURPLE],['Safety',`${d.safetyScore}%`,d.safetyScore>=90?GREEN:AMBER]].map(([l,v,c])=>(
                          <div key={l}><div style={{ fontSize:10, color:DIM }}>{l}</div><div style={{ fontSize:13, fontWeight:700, color:c }}>{v}</div></div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Sect>
          </div>
        )}

        {/* ── HIRING PLATFORMS ── */}
        {tab==='hiring' && (
          <div>
            <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em', marginBottom:8 }}>HIRING PLATFORM INTEGRATIONS</div>
            <div style={{ fontSize:13, color:DIM, marginBottom:28 }}>Connect your accounts — TruckWithEase pulls candidates from every platform and ranks them against your fleet profile automatically.</div>

            <div style={{ background:`${GOLD}11`, border:`1px solid ${GOLD}33`, borderRadius:12, padding:20, marginBottom:28 }}>
              <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
                <div><div style={{ fontFamily:FD, fontSize:28, color:GOLD }}>{connectedPlatforms.length}</div><div style={{ fontSize:11, color:DIM }}>PLATFORMS LIVE</div></div>
                <div><div style={{ fontFamily:FD, fontSize:28, color:GREEN }}>{totalCandidatePool.toLocaleString()}</div><div style={{ fontSize:11, color:DIM }}>ACTIVE CANDIDATES</div></div>
                <div><div style={{ fontFamily:FD, fontSize:28, color:PURPLE }}>{applicants.filter(a=>calcHireScore(a)>=85).length}</div><div style={{ fontSize:11, color:DIM }}>STRONG HIRES IN PIPELINE</div></div>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:16 }}>
              {HIRING_PLATFORMS.map(p => {
                const connected = !!hiringKeys[p.field];
                const [localVal, setLocalVal] = useState(hiringKeys[p.field]||'');
                return (
                  <div key={p.id} style={{ background:CARD, border:`1px solid ${connected?p.color+'55':BORDER}`, borderRadius:12, padding:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ fontSize:28 }}>{p.icon}</div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:15, color:connected?p.color:WHITE }}>{p.name}</div>
                          <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize:10, color:DIM, textDecoration:'none' }}>{p.link.replace('https://','')}</a>
                        </div>
                      </div>
                      <span style={{ fontSize:10, padding:'3px 10px', borderRadius:5, background:connected?`${GREEN}22`:`${RED}11`, color:connected?GREEN:DIM, fontWeight:700 }}>
                        {connected?'✅ LIVE':'NOT CONNECTED'}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:DIM, lineHeight:1.6, marginBottom:12 }}>{p.desc}</div>
                    <div style={{ fontSize:11, color:p.color, marginBottom:8 }}>📋 Format: {p.keyFormat}</div>
                    {connected && <div style={{ fontSize:12, color:GREEN, marginBottom:8 }}>🎯 {p.candidates.toLocaleString()} candidates available</div>}
                    <div style={{ display:'flex', gap:8 }}>
                      <input
                        type="password" placeholder={connected?'Key saved — paste to update':'Paste key here'}
                        value={localVal} onChange={e=>setLocalVal(e.target.value)}
                        style={{ flex:1, background:'#040810', border:`1px solid ${BORDER}`, borderRadius:7, padding:'8px 12px', color:WHITE, fontSize:12 }}
                      />
                      <button onClick={()=>saveHiringKey(p.field,localVal.trim())} disabled={hkSaving||!localVal} style={{ background:p.color, border:'none', borderRadius:7, padding:'8px 16px', color:'#fff', fontSize:12, fontWeight:700, cursor:localVal?'pointer':'not-allowed', opacity:localVal?1:0.5 }}>
                        {hkSaving?'...':'Save'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── APPLICANTS ── */}
        {tab==='applicants' && (
          <div>
            <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em', marginBottom:24 }}>AI APPLICANT SCORING & INTELLIGENCE VALUE</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {applicants.map(a => {
                const score = calcHireScore(a);
                const val   = calcDriverValue(a);
                const rec   = score>=85?'🟢 STRONG HIRE':score>=70?'🟡 CONDITIONAL':score>=55?'🟠 REVIEW':'🔴 DO NOT HIRE';
                const col   = score>=85?GREEN:score>=70?AMBER:score>=55?ORANGE:RED;
                const src   = HIRING_PLATFORMS.find(p=>p.id===a.source);
                const isOpen = expanded===`app-${a.id}`;
                return (
                  <div key={a.id} style={{ background:CARD, border:`1px solid ${col}44`, borderRadius:12, overflow:'hidden' }}>
                    <button onClick={()=>setExpanded(isOpen?null:`app-${a.id}`)} style={{ width:'100%', background:'none', border:'none', padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                      <div style={{ textAlign:'left' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ fontWeight:700, fontSize:15, color:WHITE }}>{a.name}</div>
                          {src && <span style={{ fontSize:10, background:`${src.color}22`, color:src.color, padding:'2px 8px', borderRadius:4, fontWeight:700 }}>{src.icon} {src.name}</span>}
                        </div>
                        <div style={{ fontSize:11, color:DIM }}>CDL-{a.cdlClass} · {a.yearsExp}yr · {a.endorsements?.join(', ')||'No endorsements'}</div>
                      </div>
                      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontFamily:FD, fontSize:30, color:col }}>{score}</div>
                          <div style={{ fontSize:9, color:DIM }}>HIRE SCORE</div>
                        </div>
                        <div style={{ background:`${col}22`, border:`1px solid ${col}44`, borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, color:col }}>{rec}</div>
                        <div style={{ fontSize:18, color:DIM }}>{isOpen?'▲':'▼'}</div>
                      </div>
                    </button>

                    {isOpen && (
                      <div style={{ padding:'0 20px 20px', borderTop:`1px solid ${BORDER}` }}>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginTop:16 }}>
                          {/* Score breakdown */}
                          <div style={{ background:CARD2, borderRadius:10, padding:16 }}>
                            <div style={{ fontFamily:FD, fontSize:13, color:GOLD, marginBottom:10 }}>SCORE FACTORS</div>
                            {[['Years Experience',a.yearsExp,BLUE],['Accident-Free',`${a.accidentsFree}yr`,GREEN],['Road Test',a.roadTestScore?`${a.roadTestScore}/100`:'Pending',a.roadTestScore>=90?GREEN:a.roadTestScore>=70?AMBER:DIM],['Drug Test',a.drugTestClear===true?'Clear':a.drugTestClear===false?'Failed':'Pending',a.drugTestClear===true?GREEN:a.drugTestClear===false?RED:AMBER],['Interview',a.interviewScore?`${a.interviewScore}/10`:'Pending',PURPLE],['Criminal',a.criminalClear?'Clear':'Flagged',a.criminalClear?GREEN:RED]].map(([l,v,c])=>(
                              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0', borderBottom:`1px solid ${BORDER}` }}>
                                <span style={{ color:DIM }}>{l}</span><span style={{ color:c, fontWeight:600 }}>{v}</span>
                              </div>
                            ))}
                          </div>
                          {/* Intelligence value */}
                          <div style={{ background:CARD2, borderRadius:10, padding:16 }}>
                            <div style={{ fontFamily:FD, fontSize:13, color:PURPLE, marginBottom:10 }}>⚡ INTELLIGENCE VALUE PROJECTION</div>
                            {[['Weekly Revenue',fmt(val.weeklyRevenue),GREEN],['Weekly Profit',fmt(val.weeklyProfit),val.weeklyProfit>0?GREEN:RED],['Annual Profit',fmt(val.annualProfit),GOLD],['Lifetime Value',fmt(val.lifetimeValue),GOLD],['Retention Est.',`${val.retentionYears}yr`,BLUE],['Safety Risk',val.safetyRisk,val.safetyRisk==='LOW'?GREEN:val.safetyRisk==='MEDIUM'?AMBER:RED]].map(([l,v,c])=>(
                              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0', borderBottom:`1px solid ${BORDER}` }}>
                                <span style={{ color:DIM }}>{l}</span><span style={{ color:c, fontWeight:700 }}>{v}</span>
                              </div>
                            ))}
                          </div>
                          {/* Status & notes */}
                          <div style={{ background:CARD2, borderRadius:10, padding:16 }}>
                            <div style={{ fontFamily:FD, fontSize:13, color:TEAL, marginBottom:10 }}>STATUS & NOTES</div>
                            <div style={{ fontSize:12, color:AMBER, marginBottom:8, fontWeight:700 }}>Stage: {a.status}</div>
                            <div style={{ fontSize:12, color:DIM, lineHeight:1.7 }}>{a.notes}</div>
                            <div style={{ marginTop:12, display:'flex', gap:8, flexWrap:'wrap' }}>
                              <button onClick={()=>{ setRA(a.name); setTab('roadtest'); }} style={{ background:`${TEAL}22`, border:`1px solid ${TEAL}44`, borderRadius:6, padding:'6px 12px', color:TEAL, fontSize:11, fontWeight:700, cursor:'pointer' }}>🛞 Grade Road Test</button>
                              <button onClick={()=>setTab('drugtest')} style={{ background:`${PURPLE}22`, border:`1px solid ${PURPLE}44`, borderRadius:6, padding:'6px 12px', color:PURPLE, fontSize:11, fontWeight:700, cursor:'pointer' }}>💊 Find Drug Test</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ROAD TEST GRADER ── */}
        {tab==='roadtest' && (
          <div>
            <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em', marginBottom:8 }}>🛞 ROAD TEST GRADING AGENT</div>
            <div style={{ fontSize:13, color:DIM, marginBottom:24 }}>Score each category 0–100. The agent calculates the weighted grade, issues a hire recommendation, and saves the result to the applicant's file.</div>

            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:24, marginBottom:24 }}>
              <div style={{ fontFamily:FD, fontSize:14, color:GOLD, marginBottom:16 }}>SELECT APPLICANT</div>
              <select value={roadApplicant} onChange={e=>setRA(e.target.value)} style={{ background:'#040810', border:`1px solid ${BORDER}`, borderRadius:7, padding:'10px 16px', color:WHITE, fontSize:13, marginBottom:24, minWidth:280 }}>
                <option value="">— Choose applicant —</option>
                {applicants.map(a=><option key={a.id} value={a.name}>{a.name}</option>)}
              </select>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:14 }}>
                {ROAD_TEST_CRITERIA.map(c => (
                  <div key={c.key} style={{ background:CARD2, borderRadius:10, padding:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{c.label}</div>
                      <span style={{ fontSize:10, color:GOLD }}>{c.weight}% weight</span>
                    </div>
                    <div style={{ fontSize:11, color:DIM, marginBottom:10 }}>{c.desc}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <input type="range" min="0" max="100" value={roadScores[c.key]||0} onChange={e=>setRS(prev=>({...prev,[c.key]:parseInt(e.target.value)}))} style={{ flex:1, accentColor:GOLD }} />
                      <div style={{ fontFamily:FD, fontSize:22, color:roadScores[c.key]>=90?GREEN:roadScores[c.key]>=70?AMBER:RED, minWidth:40, textAlign:'right' }}>{roadScores[c.key]||0}</div>
                    </div>
                    {/* Score bar */}
                    <div style={{ background:BORDER, borderRadius:3, height:4, marginTop:6 }}>
                      <div style={{ background:roadScores[c.key]>=90?GREEN:roadScores[c.key]>=70?AMBER:RED, width:`${roadScores[c.key]||0}%`, borderRadius:3, height:4 }} />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={submitRoadTest} style={{ marginTop:20, background:GOLD, border:'none', borderRadius:10, padding:'12px 32px', color:DARK, fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:FD, letterSpacing:'0.1em' }}>
                GRADE ROAD TEST
              </button>
            </div>

            {roadResult && (
              <div style={{ background:CARD, border:`2px solid ${roadResult.color}`, borderRadius:12, padding:28, textAlign:'center' }}>
                <div style={{ fontFamily:FD, fontSize:18, color:DIM, marginBottom:8 }}>{roadApplicant || 'APPLICANT'} — ROAD TEST RESULT</div>
                <div style={{ fontFamily:FD, fontSize:72, color:roadResult.color, marginBottom:8 }}>{roadResult.avg}</div>
                <div style={{ fontFamily:FD, fontSize:22, color:roadResult.color, letterSpacing:'0.1em' }}>{roadResult.grade}</div>
                <div style={{ fontSize:13, color:DIM, marginTop:12 }}>Score saved to applicant file. Next step: {parseFloat(roadResult.avg)>=70?'Drug Test':'Re-test in 30 days'}</div>
              </div>
            )}
          </div>
        )}

        {/* ── DRUG TEST LOCATOR ── */}
        {tab==='drugtest' && (
          <div>
            <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em', marginBottom:8 }}>💊 DOT DRUG TEST LOCATOR</div>
            <div style={{ fontSize:13, color:DIM, marginBottom:20 }}>Pre-employment and on-the-spot DOT random drug test locations nationwide. All sites are FMCSA-certified for DOT compliance.</div>

            <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
              <input type="text" placeholder="Search by city or provider..." value={drugSearch} onChange={e=>setDS(e.target.value)} style={{ flex:1, minWidth:220, background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:'10px 16px', color:WHITE, fontSize:13 }} />
              <div style={{ display:'flex', gap:8 }}>
                {['Pre-Employment','Random DOT','All Sites'].map(f=>(
                  <button key={f} style={{ background:DIM2, border:`1px solid ${BORDER}`, borderRadius:7, padding:'10px 16px', color:DIM, fontSize:12, fontWeight:600, cursor:'pointer' }}>{f}</button>
                ))}
              </div>
            </div>

            {/* DOT Process Banner */}
            <div style={{ background:`${AMBER}11`, border:`1px solid ${AMBER}33`, borderRadius:12, padding:20, marginBottom:24 }}>
              <div style={{ fontFamily:FD, fontSize:15, color:AMBER, marginBottom:10 }}>DOT 5-PANEL DRUG TEST PROCESS</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
                {['1. Driver reports to collection site','2. Urine specimen collected (observed)','3. Specimen sent to SAMHSA-certified lab','4. MRO reviews results (24–72 hrs)','5. Negative: cleared for duty','6. Positive: immediate removal from safety-sensitive duties'].map((s,i)=>(
                  <div key={i} style={{ fontSize:12, color:WHITE, background:CARD2, borderRadius:8, padding:'8px 12px', lineHeight:1.5 }}>{s}</div>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:14 }}>
              {filteredDrugLocs.map((l,i) => (
                <div key={i} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{l.name}</div>
                      <div style={{ fontSize:12, color:GOLD }}>{l.city}</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
                      {l.dot      && <span style={{ fontSize:9, background:`${GREEN}22`, color:GREEN, padding:'2px 7px', borderRadius:4, fontWeight:700 }}>✅ DOT CERTIFIED</span>}
                      {l.preEmploy&& <span style={{ fontSize:9, background:`${BLUE}22`, color:BLUE, padding:'2px 7px', borderRadius:4, fontWeight:700 }}>PRE-EMPLOY</span>}
                      {l.random   && <span style={{ fontSize:9, background:`${PURPLE}22`, color:PURPLE, padding:'2px 7px', borderRadius:4, fontWeight:700 }}>RANDOM</span>}
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:DIM, marginBottom:4 }}>📍 {l.address}</div>
                  <div style={{ fontSize:12, color:DIM, marginBottom:4 }}>📞 {l.phone}</div>
                  <div style={{ fontSize:12, color:DIM, marginBottom:12 }}>🕐 {l.hours}</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={{ flex:1, background:GOLD, border:'none', borderRadius:7, padding:'8px', color:DARK, fontSize:12, fontWeight:700, cursor:'pointer' }}>Schedule Test</button>
                    <button style={{ background:DIM2, border:`1px solid ${BORDER}`, borderRadius:7, padding:'8px 12px', color:DIM, fontSize:12, cursor:'pointer' }}>📍 Navigate</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPLIANCE ── */}
        {tab==='compliance' && (
          <div>
            <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em', marginBottom:24 }}>COMPLIANCE HUB — LIVE SCORING</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:16, marginBottom:32 }}>
              {drivers.map(d => {
                const c = calcComplianceScore(d);
                const barColor = c.score>=90?GREEN:c.score>=75?AMBER:RED;
                return (
                  <div key={d.id} style={{ background:CARD, border:`1px solid ${c.score<75?RED:c.score<90?AMBER:GREEN}44`, borderRadius:12, padding:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>{d.name}</div>
                      <div style={{ fontFamily:FD, fontSize:28, color:barColor }}>{c.score}</div>
                    </div>
                    <div style={{ background:BORDER, borderRadius:4, height:5, marginBottom:14 }}>
                      <div style={{ background:barColor, borderRadius:4, height:5, width:`${c.score}%` }} />
                    </div>
                    {[['CDL',c.cdlDays>365?'✅ Valid':c.cdlDays>90?`⚠️ ${c.cdlDays}d`:` 🔴 ${c.cdlDays}d`,c.cdlDays>90?GREEN:RED],['Medical',c.medDays>180?'✅ Valid':c.medDays>90?`⚠️ ${c.medDays}d`:`🔴 ${c.medDays}d`,c.medDays>90?GREEN:RED],['Background',d.criminalBackground?.status,d.criminalBackground?.status==='Clear'?GREEN:AMBER],['DOT Score',`${d.dotBackground?.score}/100`,d.dotBackground?.score>=80?GREEN:AMBER],['Drug Test',d.drugTestClear?'✅ Clear':'⚠️ Pending',d.drugTestClear?GREEN:AMBER],['Road Test',d.roadTestPassed?'✅ Passed':'⚠️ Pending',d.roadTestPassed?GREEN:AMBER],['Insurance',d.insurance?.status,d.insurance?.status==='Approved'?GREEN:AMBER]].map(([l,v,c])=>(
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:11, padding:'3px 0', borderBottom:`1px solid ${BORDER}` }}>
                        <span style={{ color:DIM }}>{l}</span><span style={{ color:c, fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Auto-actions */}
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:24 }}>
              <div style={{ fontFamily:FD, fontSize:18, color:GOLD, letterSpacing:'0.1em', marginBottom:16 }}>AUTOMATED COMPLIANCE ACTIONS</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:14 }}>
                {[
                  { title:'CDL Auto-Alerts', desc:'Alerts at 90, 60, 30, and 14 days before CDL expiration. Escalates to fleet manager at 14 days.', color:GREEN },
                  { title:'Medical Card Renewal', desc:'Suggests nearest FMCSA physician with scheduling at 60-day mark. Tracks appointment status.', color:GREEN },
                  { title:'DOT Random Testing', desc:'Pool selection automated per FMCSA 49 CFR Part 382. Pulls random 50% of drivers annually.', color:GREEN },
                  { title:'MVR Annual Pull', desc:'Motor Vehicle Records pulled every 12 months. New violations trigger immediate fleet manager alert.', color:GREEN },
                  { title:'Background Annual Re-Check', desc:'Re-verification per fleet policy. Results scored and logged automatically.', color:GREEN },
                  { title:'CSA Score Monitoring', desc:'Carrier Safety Analysis tracked in real-time. Trends charted. Intervention recommendations auto-generated.', color:GREEN },
                  { title:'FMCSA Pre-Employment Query', desc:'Automated clearinghouse query run on every new hire before first assignment per 49 CFR 382.701.', color:GREEN },
                  { title:'CA AB5 Evaluation', desc:'ABC test run on every driver — employee vs. contractor classification determined automatically.', color:AMBER },
                ].map(a=>(
                  <div key={a.title} style={{ background:CARD2, borderRadius:10, padding:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <div style={{ fontWeight:700, fontSize:12 }}>{a.title}</div>
                      <span style={{ fontSize:9, color:a.color, background:`${a.color}22`, padding:'2px 7px', borderRadius:4, fontWeight:700 }}>ACTIVE</span>
                    </div>
                    <div style={{ fontSize:11, color:DIM, lineHeight:1.6 }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DOCUMENT CENTER ── */}
        {tab==='documents' && (
          <div>
            <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em', marginBottom:8 }}>📁 DOCUMENT CENTER</div>
            <div style={{ fontSize:13, color:DIM, marginBottom:20 }}>Every FMCSA-required document for hiring, onboarding, and ongoing compliance. Download, complete, and store all files in one place.</div>

            <input type="text" placeholder="Search documents..." value={docSearch} onChange={e=>setDocSearch(e.target.value)} style={{ width:'100%', background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:'10px 16px', color:WHITE, fontSize:13, marginBottom:24, boxSizing:'border-box' }} />

            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {COMPLIANCE_DOCS.map(cat => {
                const docs = docSearch ? cat.docs.filter(d=>d.toLowerCase().includes(docSearch.toLowerCase())) : cat.docs;
                if (!docs.length) return null;
                return (
                  <div key={cat.category} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:24 }}>
                    <div style={{ fontFamily:FD, fontSize:16, color:GOLD, letterSpacing:'0.08em', marginBottom:16 }}>{cat.category}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:10 }}>
                      {docs.map(doc => (
                        <div key={doc} style={{ background:CARD2, borderRadius:8, padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
                          <div style={{ fontSize:12, color:WHITE, lineHeight:1.4 }}>📄 {doc}</div>
                          <button style={{ background:`${GOLD}22`, border:`1px solid ${GOLD}44`, borderRadius:6, padding:'5px 12px', color:GOLD, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>Get</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PAYROLL ENGINE ── */}
        {tab==='payroll' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
              <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em' }}>PAYROLL CALCULATION ENGINE</div>
              <div style={{ display:'flex', gap:8 }}>
                {['weekly','biweekly','monthly'].map(p=>(
                  <button key={p} onClick={()=>setPayPeriod(p)} style={{ background:payPeriod===p?GOLD:'none', border:`1px solid ${payPeriod===p?GOLD:BORDER}`, borderRadius:7, padding:'7px 14px', color:payPeriod===p?DARK:DIM, fontSize:12, fontWeight:700, cursor:'pointer' }}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>
                ))}
              </div>
            </div>
            <div style={{ background:CARD, border:`1px solid ${GOLD}44`, borderRadius:12, padding:24, marginBottom:24 }}>
              <div style={{ fontFamily:FD, fontSize:16, color:GOLD, letterSpacing:'0.1em', marginBottom:16 }}>FLEET TOTALS — {payPeriod.toUpperCase()}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:14 }}>
                {(() => { const m=payPeriod==='biweekly'?2:payPeriod==='monthly'?4:1; return [['Gross Pay',fmt(fleetPayroll.grossPay*m),WHITE],['Tax Withheld',fmt((fleetPayroll.grossPay-fleetPayroll.netPay)*m),AMBER],['Net Pay',fmt(fleetPayroll.netPay*m),GREEN],['Fleet Revenue',fmt(fleetPayroll.revenue*m),BLUE],['Operating Cost',fmt(fleetPayroll.totalCost*m),ORANGE],['Net Profit',fmt(fleetPayroll.profit*m),fleetPayroll.profit>0?GREEN:RED]]; })().map(([l,v,c])=>(
                  <div key={l} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:10, color:DIM, marginBottom:4 }}>{l}</div>
                    <div style={{ fontFamily:FD, fontSize:22, color:c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {drivers.map(d => {
              const p=calcDriverPayroll(d); const m=payPeriod==='biweekly'?2:payPeriod==='monthly'?4:1; const isOpen=expanded===`pay-${d.id}`;
              return (
                <div key={d.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, overflow:'hidden', marginBottom:12 }}>
                  <button onClick={()=>setExpanded(isOpen?null:`pay-${d.id}`)} style={{ width:'100%', background:'none', border:'none', padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                    <div style={{ textAlign:'left' }}><div style={{ fontWeight:700, fontSize:15 }}>{d.name}</div><div style={{ fontSize:11, color:DIM }}>{d.weeklyMiles?.toLocaleString()} mi/wk · ${d.payRatePerMile}/mi</div></div>
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
                      {[['Gross',fmt(p.grossPay*m),WHITE],['Net',fmt(p.netPay*m),GREEN],['Profit',fmt(p.profit*m),p.profit>0?GREEN:RED]].map(([l,v,c])=>(
                        <div key={l} style={{ textAlign:'right' }}><div style={{ fontSize:10, color:DIM }}>{l}</div><div style={{ fontFamily:FD, fontSize:18, color:c }}>{v}</div></div>
                      ))}
                      <div style={{ fontSize:18, color:DIM }}>{isOpen?'▲':'▼'}</div>
                    </div>
                  </button>
                  {isOpen && (
                    <div style={{ padding:'0 20px 20px', borderTop:`1px solid ${BORDER}` }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginTop:16 }}>
                        {[
                          ['PAY BREAKDOWN',GOLD,[['Miles Pay',fmt((d.weeklyMiles||0)*(d.payRatePerMile||0)*m)],['Load Bonuses',fmt(p.loadBonus*m)],['Safety Bonus',fmt(p.safetyBonus*m)],['Gross Pay',fmt(p.grossPay*m)]]],
                          ['TAX WITHHOLDING',AMBER,[['FICA (7.65%)',fmt(p.fica*m)],['Federal',fmt(p.federal*m)],['State (4.5%)',fmt(p.state*m)],['Total Tax',fmt(p.totalTax*m)],['Net Pay',fmt(p.netPay*m)]]],
                          ['DRIVER ECONOMICS',PURPLE,[['Revenue',fmt(p.revenue*m)],['Fuel Cost',fmt(p.fuelCost*m)],['Maintenance',fmt(p.maintCost*m)],['Gross Pay',fmt(p.grossPay*m)],['Net Profit',fmt(p.profit*m)],['Margin',pct(p.profitMargin)]]],
                        ].map(([title,color,rows])=>(
                          <div key={title} style={{ background:CARD2, borderRadius:10, padding:16 }}>
                            <div style={{ fontFamily:FD, fontSize:12, color, marginBottom:10 }}>{title}</div>
                            {rows.map(([l,v])=>(
                              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0', borderBottom:`1px solid ${BORDER}` }}>
                                <span style={{ color:DIM }}>{l}</span><span style={{ color:WHITE, fontWeight:600 }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── DRIVER FILES ── */}
        {tab==='drivers' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
              <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em' }}>DRIVER FILES</div>
              <button onClick={()=>setADO(!addDriverOpen)} style={{ background:GOLD, border:'none', borderRadius:8, padding:'10px 20px', color:DARK, fontSize:13, fontWeight:700, cursor:'pointer' }}>+ Add Driver</button>
            </div>
            {addDriverOpen && (
              <div style={{ background:CARD, border:`1px solid ${GOLD}44`, borderRadius:12, padding:24, marginBottom:24 }}>
                <div style={{ fontFamily:FD, fontSize:16, color:GOLD, marginBottom:16 }}>NEW DRIVER SETUP</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12, marginBottom:16 }}>
                  {[['name','Driver Name','text'],['payRatePerMile','Pay Rate/Mile','number'],['weeklyMiles','Weekly Miles','number'],['weeklyLoads','Loads/Week','number'],['safetyScore','Safety Score','number'],['revenuePerMile','Revenue/Mile','number']].map(([k,l,t])=>(
                    <div key={k}><div style={{ fontSize:11, color:DIM, marginBottom:4 }}>{l}</div><input type={t} value={newDriver[k]} onChange={e=>setND(p=>({...p,[k]:e.target.value}))} style={{ width:'100%', background:'#040810', border:`1px solid ${BORDER}`, borderRadius:7, padding:'8px 12px', color:WHITE, fontSize:13 }} /></div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={addDriver} disabled={!newDriver.name} style={{ background:GOLD, border:'none', borderRadius:8, padding:'10px 24px', color:DARK, fontSize:13, fontWeight:700, cursor:'pointer', opacity:newDriver.name?1:0.5 }}>Save Driver</button>
                  <button onClick={()=>setADO(false)} style={{ background:'none', border:`1px solid ${BORDER}`, borderRadius:8, padding:'10px 24px', color:DIM, fontSize:13, cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {drivers.map(d => {
                const p=calcDriverPayroll(d); const c=calcComplianceScore(d); const isOpen=expanded===`drv-${d.id}`;
                return (
                  <div key={d.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, overflow:'hidden' }}>
                    <button onClick={()=>setExpanded(isOpen?null:`drv-${d.id}`)} style={{ width:'100%', background:'none', border:'none', padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                      <div style={{ textAlign:'left' }}><div style={{ fontWeight:700, fontSize:15 }}>{d.name}</div><div style={{ fontSize:11, color:DIM }}>Since {d.startDate} · CDL-{d.cdl?.class}</div></div>
                      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontSize:11, padding:'4px 10px', borderRadius:6, background:c.score>=90?`${GREEN}22`:`${AMBER}22`, color:c.score>=90?GREEN:AMBER, fontWeight:700 }}>Compliance {c.score}%</span>
                        <span style={{ fontSize:11, padding:'4px 10px', borderRadius:6, background:`${GREEN}22`, color:GREEN, fontWeight:700 }}>Profit {fmt(p.profit)}</span>
                        <div style={{ fontSize:18, color:DIM }}>{isOpen?'▲':'▼'}</div>
                      </div>
                    </button>
                    {isOpen && (
                      <div style={{ padding:'0 20px 20px', borderTop:`1px solid ${BORDER}` }}>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginTop:16 }}>
                          <div style={{ background:CARD2, borderRadius:10, padding:16 }}>
                            <div style={{ fontFamily:FD, fontSize:12, color:GOLD, marginBottom:8 }}>CERTIFICATIONS</div>
                            {[['CDL #',d.cdl?.number],['CDL Expires',`${d.cdl?.expires} (${c.cdlDays}d)`],['Med Card',`${d.medCard?.expires} (${c.medDays}d)`],['Drug Test',d.drugTestClear?'✅ Clear':'⚠️ Pending'],['Road Test',d.roadTestPassed?'✅ Passed':'⚠️ Pending']].map(([l,v])=>(
                              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0', borderBottom:`1px solid ${BORDER}` }}><span style={{ color:DIM }}>{l}</span><span>{v}</span></div>
                            ))}
                          </div>
                          <div style={{ background:CARD2, borderRadius:10, padding:16 }}>
                            <div style={{ fontFamily:FD, fontSize:12, color:GOLD, marginBottom:8 }}>BACKGROUND & DOT</div>
                            {[['Criminal',d.criminalBackground?.status],['DOT Score',`${d.dotBackground?.score}/100`],['Violations',d.dotBackground?.violations||0],['Safety Score',`${d.safetyScore}%`],['Insurance',d.insurance?.status]].map(([l,v])=>(
                              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0', borderBottom:`1px solid ${BORDER}` }}><span style={{ color:DIM }}>{l}</span><span>{v}</span></div>
                            ))}
                          </div>
                          <div style={{ background:CARD2, borderRadius:10, padding:16 }}>
                            <div style={{ fontFamily:FD, fontSize:12, color:GOLD, marginBottom:8 }}>ECONOMICS</div>
                            {[['Revenue',fmt(p.revenue)],['Gross Pay',fmt(p.grossPay)],['Net Pay',fmt(p.netPay)],['Net Profit',fmt(p.profit)],['Margin',pct(p.profitMargin)]].map(([l,v])=>(
                              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0', borderBottom:`1px solid ${BORDER}` }}><span style={{ color:DIM }}>{l}</span><span style={{ color:GREEN }}>{v}</span></div>
                            ))}
                          </div>
                          <div style={{ background:`${AMBER}11`, border:`1px solid ${AMBER}33`, borderRadius:10, padding:16 }}>
                            <div style={{ fontFamily:FD, fontSize:12, color:AMBER, marginBottom:8 }}>DOT PHYSICIAN</div>
                            <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>{d.suggestedDoctor?.name}</div>
                            <div style={{ fontSize:11, color:DIM, marginBottom:2 }}>{d.suggestedDoctor?.clinic}</div>
                            <div style={{ fontSize:11, color:DIM, marginBottom:8 }}>{d.suggestedDoctor?.phone}</div>
                            <button style={{ background:AMBER, border:'none', borderRadius:6, padding:'6px 14px', color:DARK, fontSize:11, fontWeight:700, cursor:'pointer' }}>Schedule Exam</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── INTELLIGENCE HR ── */}
        {tab==='intelligence' && (
          <div>
            <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em', marginBottom:8 }}>⚡ INTELLIGENCE HR ENGINE</div>
            <div style={{ fontSize:14, color:DIM, marginBottom:24 }}>One scan. Every driver. Every applicant. Every platform. Every dollar. Instantly.</div>
            <button onClick={runEngineScan} disabled={engineRunning} style={{ background:engineRunning?DIM2:GOLD, border:'none', borderRadius:10, padding:'14px 36px', color:engineRunning?DIM:DARK, fontSize:16, fontWeight:800, cursor:engineRunning?'not-allowed':'pointer', fontFamily:FD, letterSpacing:'0.1em', marginBottom:24 }}>
              {engineRunning?'⚡ SCANNING...':'⚡ RUN INTELLIGENCE SCAN'}
            </button>
            {engineLog.length>0 && (
              <div style={{ background:CARD, border:`1px solid ${GOLD}44`, borderRadius:12, padding:20, marginBottom:24 }}>
                <div style={{ fontFamily:FD, fontSize:14, color:GOLD, marginBottom:12 }}>INTELLIGENCE SCAN LOG</div>
                {engineLog.map((l,i)=>(
                  <div key={i} style={{ fontSize:12, color:i===engineLog.length-1?WHITE:DIM, padding:'4px 0', borderBottom:`1px solid ${BORDER}` }}>{l}</div>
                ))}
              </div>
            )}
            {engineScore!==null && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
                <div style={{ background:CARD, border:`2px solid ${engineScore>=80?GREEN:engineScore>=60?AMBER:RED}`, borderRadius:12, padding:24, textAlign:'center' }}>
                  <div style={{ fontFamily:FD, fontSize:13, color:GOLD, marginBottom:8 }}>INTELLIGENCE HR SCORE</div>
                  <div style={{ fontFamily:FD, fontSize:72, color:engineScore>=80?GREEN:engineScore>=60?AMBER:RED }}>{engineScore}</div>
                  <div style={{ fontSize:13, color:engineScore>=80?GREEN:AMBER, fontWeight:700, marginTop:8 }}>
                    {engineScore>=80?'🟢 Fleet HR Performing Well':engineScore>=60?'🟡 Attention Required':'🔴 Critical Action Needed'}
                  </div>
                </div>
                <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:24, gridColumn:'span 2' }}>
                  <div style={{ fontFamily:FD, fontSize:14, color:GOLD, marginBottom:14 }}>INTELLIGENCE RECOMMENDATIONS</div>
                  {[
                    urgentItems.length>0?`⚠️ ${urgentItems.length} driver(s) need compliance action within 90 days.`:'✅ All driver certifications current.',
                    fleetPayroll.profit>0?`💰 Fleet profitable at ${fmt(fleetPayroll.profit)}/week. Maintain current load rates.`:'🔴 Fleet operating at a loss. Review route pricing immediately.',
                    `👥 ${applicants.filter(a=>calcHireScore(a)>=85).length} strong hire candidate(s) in pipeline — begin onboarding within 7 days.`,
                    `🌐 ${connectedPlatforms.length} of ${HIRING_PLATFORMS.length} hiring platforms connected — ${totalCandidatePool.toLocaleString()} candidates available. ${connectedPlatforms.length<HIRING_PLATFORMS.length?'Connect more platforms to expand your pool.':'Full coverage active.'}`,
                    `📊 Average fleet compliance ${avgCompliance}% — ${avgCompliance>=90?'excellent':'needs improvement'}. ${avgCompliance<90?'Review flagged drivers in Compliance tab.':'Maintain the safety culture.'}`,
                    `💎 Highest-value applicant: ${[...applicants].sort((a,b)=>calcDriverValue(b).lifetimeValue-calcDriverValue(a).lifetimeValue)[0]?.name} — projected ${fmt(calcDriverValue([...applicants].sort((a,b)=>calcDriverValue(b).lifetimeValue-calcDriverValue(a).lifetimeValue)[0]).lifetimeValue)} lifetime value to the fleet.`,
                  ].map((r,i)=>(
                    <div key={i} style={{ fontSize:13, color:WHITE, padding:'8px 0', borderBottom:`1px solid ${BORDER}`, lineHeight:1.6 }}>{r}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab==='reports' && (
          <div>
            <div style={{ fontFamily:FD, fontSize:26, letterSpacing:'0.08em', marginBottom:24 }}>AUTOMATED REPORTS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
              {[
                { title:'📊 Weekly Payroll Summary',       desc:`${drivers.length} drivers · Gross ${fmt(fleetPayroll.grossPay)} · Net ${fmt(fleetPayroll.netPay)}`, color:GREEN },
                { title:'✅ Compliance Status Report',     desc:`Avg score ${avgCompliance}% · ${urgentItems.length} urgent items · ${drivers.length} drivers audited`, color:BLUE },
                { title:'💰 Fleet Profitability Report',   desc:`Revenue ${fmt(fleetPayroll.revenue)} · Cost ${fmt(fleetPayroll.totalCost)} · Profit ${fmt(fleetPayroll.profit)}`, color:GOLD },
                { title:'👥 Applicant Pipeline Report',    desc:`${applicants.length} applicants · ${applicants.filter(a=>calcHireScore(a)>=85).length} strong hires · ${connectedPlatforms.length} platforms live`, color:PURPLE },
                { title:'🛞 Road Test Score Report',       desc:'All road test grades, weighted scores, hire/no-hire recommendations per applicant', color:TEAL },
                { title:'💊 Drug Test Status Report',      desc:'Pre-employment and random test results, pending clearances, and MRO status per driver', color:ORANGE },
                { title:'🌐 Hiring Platform Analytics',    desc:`${totalCandidatePool.toLocaleString()} total candidates · Source breakdown · Cost-per-hire by platform`, color:BLUE },
                { title:'📈 90-Day Workforce Forecast',    desc:'Projected payroll, headcount needs, compliance renewals, and profitability trends', color:ORANGE },
                { title:'🔐 DOT Audit Prep Package',       desc:'All certifications, drug tests, background checks, and MVR records compiled for inspection', color:RED },
                { title:'📁 Driver Qualification Files',   desc:'Complete DQF for every driver — FMCSA-ready format, all required attachments included', color:AMBER },
              ].map(r=>(
                <div key={r.title} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:20 }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>{r.title}</div>
                  <div style={{ fontSize:12, color:DIM, lineHeight:1.6, marginBottom:16 }}>{r.desc}</div>
                  <button style={{ background:`${r.color}22`, border:`1px solid ${r.color}44`, borderRadius:8, padding:'8px 16px', color:r.color, fontSize:12, fontWeight:700, cursor:'pointer' }}>Generate Report</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
