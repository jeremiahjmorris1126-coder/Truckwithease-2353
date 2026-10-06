export interface TollFacility {
  name: string;
  highway: string;
  milepostOrLocation: string;
  typical5AxleTruckToll: string;
  videoTollSurcharge: string;
  cashlessStatus: '100% Cashless AET' | 'Gantry Overhead' | 'Toll-by-Plate' | 'Bridge Crossing';
  notes: string;
}

export interface TollAgency {
  name: string;
  acronym: string;
  website: string;
  phone: string;
  portalUrl: string;
}

export interface StateTollProfile {
  stateCode: string;
  stateName: string;
  region: 'Northeast' | 'Mid-Atlantic' | 'Southeast' | 'Midwest' | 'South' | 'Plains' | 'Mountain' | 'West Coast' | 'Non-Contiguous';
  hasTollFacilities: boolean;
  systemType: 'All-Electronic (Cashless AET)' | 'Hybrid Cashless & Cash' | 'Express / HOT Lanes Only' | 'International Border Bridges Only' | 'No Active Toll Roads';
  primaryAgencies: TollAgency[];
  acceptedTransponders: string[];
  majorFacilities: TollFacility[];
  truckerAdvisories: string[];
  discountTips: string[];
  bestpassInteroperable: boolean;
  ezPassInteroperable: boolean;
}

export const ALL_50_STATES_TOLL_DATA: StateTollProfile[] = [
  // --- NORTHEAST ---
  {
    stateCode: 'NY',
    stateName: 'New York',
    region: 'Northeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'New York State Thruway Authority', acronym: 'NYSTA', website: 'https://www.thruway.ny.gov', phone: '1-800-847-8929', portalUrl: 'https://www.e-zpassny.com' },
      { name: 'MTA Bridges and Tunnels', acronym: 'MTA', website: 'https://new.mta.info', phone: '1-800-333-8655', portalUrl: 'https://www.e-zpassny.com' },
      { name: 'Port Authority of New York & New Jersey', acronym: 'PANYNJ', website: 'https://www.panynj.gov', phone: '1-800-221-1601', portalUrl: 'https://www.e-zpassny.com' },
    ],
    acceptedTransponders: ['E-ZPass (NY / Regional)', 'Bestpass', 'PrePass Plus', 'I-PASS', 'SunPass Pro', 'NC Quick Pass'],
    majorFacilities: [
      { name: 'Governor Thomas E. Dewey Thruway', highway: 'I-87 / I-90', milepostOrLocation: 'NYC to Buffalo / Erie PA border', typical5AxleTruckToll: '$78.00 - $145.00', videoTollSurcharge: '+30% Tolls-by-Mail surcharge', cashlessStatus: '100% Cashless AET', notes: 'Main East-West freight spine. 5-axle commercial rates depend on distance.' },
      { name: 'George Washington Bridge (GWB)', highway: 'I-95 / US-1/9', milepostOrLocation: 'Fort Lee NJ to Manhattan NY', typical5AxleTruckToll: '$115.00 (Off-Peak) / $126.00 (Peak)', videoTollSurcharge: '$176.00 Tolls by Mail', cashlessStatus: '100% Cashless AET', notes: 'Eastbound toll only into NYC. Heavy truck volume, strict overnight off-peak discounts.' },
      { name: 'Gov. Mario M. Cuomo (Tappan Zee) Bridge', highway: 'I-87 / I-287', milepostOrLocation: 'South Nyack to Tarrytown', typical5AxleTruckToll: '$36.50 - $48.25', videoTollSurcharge: '+30% without NY E-ZPass', cashlessStatus: '100% Cashless AET', notes: 'Preferred NYC bypass route to bypass Manhattan bottleneck.' },
      { name: 'Verrazzano-Narrows Bridge', highway: 'I-278', milepostOrLocation: 'Staten Island to Brooklyn', typical5AxleTruckToll: '$68.00 - $89.00', videoTollSurcharge: 'Up to $124.00 mail rate', cashlessStatus: '100% Cashless AET', notes: 'Split-tolling in both directions since 2020.' },
    ],
    truckerAdvisories: [
      '100% cashless tolling state-wide. No cash booths remain.',
      'Unpaid Tolls-by-Mail escalate to DMV registration suspension within 60 days.',
      'Overdimensional & overweight superloads require pre-trip NYSTA special hauling permits.'
    ],
    discountTips: ['Equip NY E-ZPass or Bestpass Commercial to receive 30% to 50% discount compared to Tolls-by-Mail.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'NJ',
    stateName: 'New Jersey',
    region: 'Northeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'New Jersey Turnpike Authority', acronym: 'NJTA', website: 'https://www.njta.com', phone: '1-732-750-5300', portalUrl: 'https://www.ezpassnj.com' },
      { name: 'South Jersey Transportation Authority', acronym: 'SJTA', website: 'https://www.sjta.com', phone: '1-609-965-6060', portalUrl: 'https://www.ezpassnj.com' },
      { name: 'Delaware River Joint Toll Bridge Commission', acronym: 'DRJTBC', website: 'https://www.drjtbc.org', phone: '1-267-815-5700', portalUrl: 'https://www.ezpassnj.com' },
    ],
    acceptedTransponders: ['E-ZPass', 'Bestpass', 'PrePass Plus', 'I-PASS', 'SunPass Pro'],
    majorFacilities: [
      { name: 'New Jersey Turnpike', highway: 'I-95', milepostOrLocation: 'Delaware Memorial Bridge (MM 0) to GW Bridge (MM 122)', typical5AxleTruckToll: '$42.00 - $68.50', videoTollSurcharge: 'Standard Toll-by-Plate', cashlessStatus: '100% Cashless AET', notes: 'Separated Cars and Trucks/Buses/Cars dual-dual roadways from Interchange 6 to Interchange 14.' },
      { name: 'Garden State Parkway', highway: 'Route 444', milepostOrLocation: 'Cape May (MM 0) to NY State line (MM 172)', typical5AxleTruckToll: 'Commercial prohibited North of Int 105', videoTollSurcharge: 'N/A for heavy trucks', cashlessStatus: '100% Cashless AET', notes: 'STRICT NOTICE: Class 8 commercial trucks over 10,000 lbs prohibited north of Interchange 105.' },
      { name: 'Atlantic City Expressway', highway: 'Route 446', milepostOrLocation: 'Atlantic City to Turnersville', typical5AxleTruckToll: '$14.25 - $22.50', videoTollSurcharge: 'Mail toll rate applied', cashlessStatus: '100% Cashless AET', notes: 'Connects Philadelphia metro to South Jersey coast.' },
    ],
    truckerAdvisories: ['Dual-dual roadway on NJ Turnpike: commercial trucks must strictly stay in outer truck roadway lanes.'],
    discountTips: ['Off-peak E-ZPass commercial discount applies from 10 PM to 6 AM.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    region: 'Northeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Pennsylvania Turnpike Commission', acronym: 'PTC', website: 'https://www.paturnpike.com', phone: '1-800-331-3414', portalUrl: 'https://www.paturnpike.com/e-zpass' },
      { name: 'Delaware River Port Authority', acronym: 'DRPA', website: 'https://www.drpa.org', phone: '1-856-968-2000', portalUrl: 'https://www.drpa.org' },
    ],
    acceptedTransponders: ['E-ZPass', 'Bestpass', 'PrePass Plus', 'I-PASS', 'SunPass Pro'],
    majorFacilities: [
      { name: 'Pennsylvania Turnpike Mainline', highway: 'I-76 / I-70 / I-276', milepostOrLocation: 'Ohio line (MM 0) to New Jersey line (MM 359)', typical5AxleTruckToll: '$125.00 - $184.00 (E-ZPass) / $260.00+ (Toll by Plate)', videoTollSurcharge: '+100% Toll-by-Plate Markup!', cashlessStatus: '100% Cashless AET', notes: 'CRITICAL: Toll-By-Plate is literally DOUBLE the E-ZPass rate on PA Turnpike. A mounted transponder is mandatory for commercial fleets.' },
      { name: 'Northeast Extension', highway: 'I-476', milepostOrLocation: 'Mid-County to Clarks Summit (Scranton)', typical5AxleTruckToll: '$45.00 - $72.00', videoTollSurcharge: '+100% markup', cashlessStatus: '100% Cashless AET', notes: 'Key connector between Philadelphia and I-80/I-81.' },
    ],
    truckerAdvisories: [
      'PA Turnpike enforces a 100% penalty rate for vehicles without an active transponder.',
      'Always ensure Bestpass or E-ZPass transponder is properly mounted on windshield to avoid plate-scanning penalty.'
    ],
    discountTips: ['Save over 50% on every single mile on PA Turnpike by using an in-cab transponder.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'MA',
    stateName: 'Massachusetts',
    region: 'Northeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Massachusetts Department of Transportation', acronym: 'MassDOT', website: 'https://www.mass.gov/orgs/massachusetts-department-of-transportation', phone: '1-877-627-7746', portalUrl: 'https://www.ezdrivema.com' },
    ],
    acceptedTransponders: ['E-ZPass (EZDriveMA)', 'Bestpass', 'PrePass Plus', 'I-PASS'],
    majorFacilities: [
      { name: 'Massachusetts Turnpike (MassPike)', highway: 'I-90', milepostOrLocation: 'NY State border (West Stockbridge) to Boston Logan Airport', typical5AxleTruckToll: '$24.50 - $48.75', videoTollSurcharge: '+35% Pay-By-Plate', cashlessStatus: '100% Cashless AET', notes: 'Entire I-90 corridor is overhead cashless gantries.' },
      { name: 'Ted Williams & Sumner/Callahan Tunnels', highway: 'I-90 / Route 1A', milepostOrLocation: 'Boston to Logan International Airport', typical5AxleTruckToll: '$18.00 - $26.50', videoTollSurcharge: 'Pay-By-Plate surcharge', cashlessStatus: '100% Cashless AET', notes: 'Strict hazardous material restrictions in tunnels.' },
    ],
    truckerAdvisories: ['Hazardous materials strictly forbidden in Boston harbor tunnels (I-93 Thomas P. O’Neill, Ted Williams, Sumner).'],
    discountTips: ['In-state Massachusetts E-ZPass accounts receive bridge/tunnel volume tier discounts.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'ME',
    stateName: 'Maine',
    region: 'Northeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Maine Turnpike Authority', acronym: 'MTA', website: 'https://www.maineturnpike.com', phone: '1-800-698-7747', portalUrl: 'https://www.ezpassmaineturnpike.com' },
    ],
    acceptedTransponders: ['E-ZPass', 'Bestpass', 'PrePass Plus'],
    majorFacilities: [
      { name: 'Maine Turnpike', highway: 'I-95', milepostOrLocation: 'Kittery (NH Border) to Augusta (MM 109)', typical5AxleTruckToll: '$18.00 - $34.00', videoTollSurcharge: '+25% Toll-by-Plate', cashlessStatus: '100% Cashless AET', notes: 'Main artery connecting New England freight to Portland and central Maine.' },
    ],
    truckerAdvisories: ['Converted to open road tolling (ORT) with high speed gantry lanes.'],
    discountTips: ['E-ZPass volume discount rebate program for commercial carriers over $500/mo.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'NH',
    stateName: 'New Hampshire',
    region: 'Northeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'NHDOT Bureau of Turnpikes', acronym: 'NHDOT', website: 'https://www.nh.gov/dot/org/operations/turnpikes', phone: '1-877-643-9727', portalUrl: 'https://www.ezpassnh.com' },
    ],
    acceptedTransponders: ['E-ZPass', 'Bestpass', 'PrePass Plus'],
    majorFacilities: [
      { name: 'Blue Star Turnpike (I-95)', highway: 'I-95', milepostOrLocation: 'Hampton Gantry', typical5AxleTruckToll: '$6.50 - $9.50', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Key 16-mile coastal corridor between MA and ME.' },
      { name: 'F.E. Everett Turnpike', highway: 'Route 3 / I-293', milepostOrLocation: 'Nashua to Concord', typical5AxleTruckToll: '$4.50 - $8.00', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Bedford and Hooksett plaza locations.' },
    ],
    truckerAdvisories: ['High-speed open road tolling in center lanes.'],
    discountTips: ['NH E-ZPass offers 30% discount on in-state turnpikes.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'RI',
    stateName: 'Rhode Island',
    region: 'Northeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Rhode Island Turnpike and Bridge Authority', acronym: 'RITBA', website: 'https://www.ritba.org', phone: '1-401-423-0800', portalUrl: 'https://www.ezpassritba.com' },
    ],
    acceptedTransponders: ['E-ZPass', 'Bestpass', 'PrePass Plus'],
    majorFacilities: [
      { name: 'Claiborne Pell Newport Bridge', highway: 'Route 138', milepostOrLocation: 'Jamestown to Newport', typical5AxleTruckToll: '$10.00 - $15.00', videoTollSurcharge: '$15.00 Toll-by-Plate', cashlessStatus: '100% Cashless AET', notes: 'Note: Rhode Island previous truck-only tolls (RhodeWorks) were struck down in federal court in 2022; bridge tolls remain active.' },
    ],
    truckerAdvisories: ['The contested truck-only toll gantries across Rhode Island highways have been disabled.'],
    discountTips: ['E-ZPass transponder provides automatic base rate.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'VT',
    stateName: 'Vermont',
    region: 'Northeast',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Vermont Agency of Transportation', acronym: 'VTrans', website: 'https://vtrans.vermont.gov', phone: '1-802-828-2657', portalUrl: 'https://vtrans.vermont.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['No state toll highways in Vermont. All Interstate corridors (I-89, I-91) are toll-free.'],
    discountTips: ['Fuel tax IFTA reporting applies; no transponder billing required inside VT.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'CT',
    stateName: 'Connecticut',
    region: 'Northeast',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Connecticut Department of Transportation', acronym: 'CTDOT', website: 'https://portal.ct.gov/dot', phone: '1-860-594-2000', portalUrl: 'https://portal.ct.gov/dot' },
    ],
    acceptedTransponders: ['N/A - Interstates are Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: [
      'No toll booths on Connecticut highways (tolls abolished on I-95/I-84 in the 1980s).',
      'NOTE: Connecticut Highway Use Fee (CT HUF) mileage tax applies to heavy commercial carriers.'
    ],
    discountTips: ['Track monthly CT highway miles for CT HUF tax portal filing.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },

  // --- MID-ATLANTIC ---
  {
    stateCode: 'DE',
    stateName: 'Delaware',
    region: 'Mid-Atlantic',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Delaware Department of Transportation', acronym: 'DelDOT', website: 'https://deldot.gov', phone: '1-888-865-5338', portalUrl: 'https://www.ezpassde.com' },
      { name: 'Delaware River and Bay Authority', acronym: 'DRBA', website: 'https://www.drba.net', phone: '1-877-336-5377', portalUrl: 'https://www.drba.net' },
    ],
    acceptedTransponders: ['E-ZPass', 'Bestpass', 'PrePass Plus', 'SunPass Pro'],
    majorFacilities: [
      { name: 'Delaware Turnpike (I-95)', highway: 'I-95', milepostOrLocation: 'Newark Plaza near MD border', typical5AxleTruckToll: '$14.00 - $18.00', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Crucial freight chokepoint between Baltimore and Philadelphia.' },
      { name: 'Delaware Memorial Twin Bridges', highway: 'I-295 / US-40', milepostOrLocation: 'New Castle DE to Pennsville NJ', typical5AxleTruckToll: '$24.00 - $36.00', videoTollSurcharge: 'Southbound/Westbound only', cashlessStatus: '100% Cashless AET', notes: 'Toll collected westbound into Delaware only.' },
      { name: 'Route 1 Relief Route (SR 1)', highway: 'DE SR 1', milepostOrLocation: 'Biddles Corner & Dover Plazas', typical5AxleTruckToll: '$8.00 - $16.00', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Bypasses US-13 corridor down to Delaware beaches.' },
    ],
    truckerAdvisories: ['Overhead gantries operate at full 65 MPH highway speeds.'],
    discountTips: ['E-ZPass commercial fleet accounts receive 25% off peak frequency rebates.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'MD',
    stateName: 'Maryland',
    region: 'Mid-Atlantic',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Maryland Transportation Authority', acronym: 'MDTA', website: 'https://mdta.maryland.gov', phone: '1-888-321-6824', portalUrl: 'https://www.driveezmd.com' },
    ],
    acceptedTransponders: ['E-ZPass', 'DriveEzMD', 'Bestpass', 'PrePass Plus', 'SunPass Pro'],
    majorFacilities: [
      { name: 'Fort McHenry Tunnel & Baltimore Harbor Tunnel', highway: 'I-95 / I-895', milepostOrLocation: 'Baltimore City Harbor', typical5AxleTruckToll: '$30.00 - $48.00', videoTollSurcharge: '+50% video rate', cashlessStatus: '100% Cashless AET', notes: 'HAZMAT TRUCKS STRICTLY PROHIBITED in both tunnels. Must detour via I-695 outer loop.' },
      { name: 'Francis Scott Key Bridge (Detour Operations)', highway: 'I-695', milepostOrLocation: 'Baltimore Beltway South', typical5AxleTruckToll: 'Detour active', videoTollSurcharge: 'N/A', cashlessStatus: '100% Cashless AET', notes: 'Rebuilding in progress; follow mandatory hazardous & overweight truck detours on I-695 West.' },
      { name: 'Chesapeake Bay Bridge (Gov. William Preston Lane Jr.)', highway: 'US-50 / US-301', milepostOrLocation: 'Sandy Point to Kent Island', typical5AxleTruckToll: '$24.00 - $36.00', videoTollSurcharge: 'Eastbound toll only', cashlessStatus: '100% Cashless AET', notes: 'High wind restrictions frequently enforce empty truck halts.' },
      { name: 'JFK Memorial Highway (I-95)', highway: 'I-95', milepostOrLocation: 'Perryville (Susquehanna River)', typical5AxleTruckToll: '$24.00 - $36.00', videoTollSurcharge: 'Northbound toll only', cashlessStatus: '100% Cashless AET', notes: 'Toll collected northbound only towards Wilmington/Philadelphia.' },
    ],
    truckerAdvisories: [
      'Hazardous material, propane, and explosive loads are banned from Baltimore tunnels.',
      'Check wind speed warnings on Chesapeake Bay Bridge before crossing.'
    ],
    discountTips: ['DriveEzMD and E-ZPass accounts receive deep commercial tier discounts.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'VA',
    stateName: 'Virginia',
    region: 'Mid-Atlantic',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Virginia Department of Transportation', acronym: 'VDOT', website: 'https://www.virginiadot.org', phone: '1-877-762-7824', portalUrl: 'https://www.ezpassva.com' },
      { name: 'Chesapeake Bay Bridge-Tunnel Commission', acronym: 'CBBT', website: 'https://www.cbbt.com', phone: '1-757-331-2960', portalUrl: 'https://www.cbbt.com' },
      { name: 'Dulles Greenway (TRIP II)', acronym: 'DullesGW', website: 'https://www.dullesgreenway.com', phone: '1-703-707-8870', portalUrl: 'https://www.ezpassva.com' },
    ],
    acceptedTransponders: ['E-ZPass', 'Bestpass', 'PrePass Plus', 'SunPass Pro', 'Peach Pass'],
    majorFacilities: [
      { name: 'Chesapeake Bay Bridge-Tunnel (CBBT)', highway: 'US-13', milepostOrLocation: 'Virginia Beach to Eastern Shore', typical5AxleTruckToll: '$52.00 - $65.00', videoTollSurcharge: 'Credit/E-ZPass', cashlessStatus: 'Gantry Overhead', notes: '17.6-mile engineering marvel. Significant freight savings bypassing I-95 corridor.' },
      { name: 'Downtown & Midtown Tunnels (ERC)', highway: 'I-264 / US-58', milepostOrLocation: 'Norfolk to Portsmouth', typical5AxleTruckToll: '$12.50 - $18.75', videoTollSurcharge: 'Pay-By-Plate +$4.50 fee', cashlessStatus: '100% Cashless AET', notes: 'Serving Port of Virginia terminals.' },
      { name: 'I-66 & I-495 / I-95 Express Lanes', highway: 'I-66 / I-495 / I-95', milepostOrLocation: 'Northern VA Washington DC Beltway', typical5AxleTruckToll: 'Commercial restrictions on some segments', videoTollSurcharge: 'Dynamic congestion pricing', cashlessStatus: '100% Cashless AET', notes: 'Dynamic tolling. Trucks permitted on I-95 express lanes south of DC.' },
    ],
    truckerAdvisories: ['CBBT enforces strict 4-level wind restriction protocols for tractor-trailers.'],
    discountTips: ['E-ZPass Flex transponder with switch not needed for commercial 5-axle.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'WV',
    stateName: 'West Virginia',
    region: 'Mid-Atlantic',
    hasTollFacilities: true,
    systemType: 'Hybrid Cashless & Cash',
    primaryAgencies: [
      { name: 'West Virginia Parkways Authority', acronym: 'WVPA', website: 'https://transportation.wv.gov/parkways', phone: '1-800-206-6222', portalUrl: 'https://www.transportation.wv.gov/parkways' },
    ],
    acceptedTransponders: ['E-ZPass', 'Bestpass', 'PrePass Plus'],
    majorFacilities: [
      { name: 'West Virginia Turnpike (I-77 / I-64)', highway: 'I-77 / I-64', milepostOrLocation: 'Charleston to Princeton (Toll Barriers A, B, C)', typical5AxleTruckToll: '$12.00 per barrier ($36.00 total trip)', videoTollSurcharge: 'Cashless conversion underway', cashlessStatus: 'Gantry Overhead', notes: 'Three mainline toll barriers through mountainous Appalachia.' },
    ],
    truckerAdvisories: ['Steep grades on WV Turnpike; run in appropriate engine brake gear.'],
    discountTips: ['West Virginia commercial E-ZPass plan offers discounted per-barrier rates.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'DC',
    stateName: 'District of Columbia',
    region: 'Mid-Atlantic',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'District Department of Transportation', acronym: 'DDOT', website: 'https://ddot.dc.gov', phone: '1-202-671-2700', portalUrl: 'https://ddot.dc.gov' },
    ],
    acceptedTransponders: ['N/A inside DC'],
    majorFacilities: [],
    truckerAdvisories: ['No toll roads inside DC; however, commercial through-truck routing is strictly restricted on downtown streets.'],
    discountTips: ['Use I-495 Beltway to bypass DC core.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },

  // --- SOUTHEAST ---
  {
    stateCode: 'FL',
    stateName: 'Florida',
    region: 'Southeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Florida’s Turnpike Enterprise', acronym: 'FTE', website: 'https://floridasturnpike.com', phone: '1-888-865-5352', portalUrl: 'https://www.sunpass.com' },
      { name: 'Central Florida Expressway Authority', acronym: 'CFX', website: 'https://www.cfxway.com', phone: '1-407-690-5000', portalUrl: 'https://www.epass.discovercfx.com' },
      { name: 'Miami-Dade Expressway Authority', acronym: 'MDX', website: 'https://www.mdxway.com', phone: '1-305-637-3277', portalUrl: 'https://www.sunpass.com' },
      { name: 'Tampa Hillsborough Expressway Authority', acronym: 'THEA', website: 'https://www.tampa-xway.com', phone: '1-813-272-6740', portalUrl: 'https://www.sunpass.com' },
    ],
    acceptedTransponders: ['SunPass / SunPass PRO', 'E-ZPass (interoperable statewide)', 'Bestpass', 'PrePass Plus', 'Uni / E-PASS', 'Peach Pass'],
    majorFacilities: [
      { name: 'Florida’s Turnpike Mainline', highway: 'SR 91', milepostOrLocation: 'Wildwood (I-75 MM 309) to Miami (Golden Glades MM 0)', typical5AxleTruckToll: '$42.00 - $64.00 (SunPass) / $60.00 - $92.00 (TOLL-BY-PLATE)', videoTollSurcharge: '+45% Toll-By-Plate surcharge', cashlessStatus: '100% Cashless AET', notes: 'Prime freight corridor through central and south Florida. 100% cashless AET.' },
      { name: 'Beachline Expressway', highway: 'SR 528', milepostOrLocation: 'Orlando to Cape Canaveral / Cocoa Beach', typical5AxleTruckToll: '$12.50 - $22.00', videoTollSurcharge: '+40% Toll-By-Plate', cashlessStatus: '100% Cashless AET', notes: 'Major logistics corridor serving Orlando International Airport and intermodal hubs.' },
      { name: 'Alligator Alley (Everglades Parkway)', highway: 'I-75', milepostOrLocation: 'Naples to Fort Lauderdale', typical5AxleTruckToll: '$14.00 - $18.00', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Trans-peninsula route connecting Gulf Coast to Atlantic Coast.' },
      { name: 'Sawgrass Expressway', highway: 'SR 869', milepostOrLocation: 'Coral Springs to Deerfield Beach', typical5AxleTruckToll: '$8.50 - $14.00', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Western Broward County bypass.' },
      { name: 'Selmon Expressway', highway: 'SR 618', milepostOrLocation: 'Tampa / Brandon', typical5AxleTruckToll: '$6.50 - $12.00', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Reversible elevated express bridge in Tampa.' },
    ],
    truckerAdvisories: [
      'Florida is 100% interoperable with E-ZPass. If you already have an E-ZPass or Bestpass transponder, it works seamlessly on all Florida toll roads.',
      'Toll-by-Plate adds a $2.50 monthly administrative fee plus higher per-mile rates.'
    ],
    discountTips: ['SunPass PRO or E-ZPass delivers automatic 25% savings compared to Toll-By-Plate.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'GA',
    stateName: 'Georgia',
    region: 'Southeast',
    hasTollFacilities: true,
    systemType: 'Express / HOT Lanes Only',
    primaryAgencies: [
      { name: 'State Road and Tollway Authority', acronym: 'SRTA', website: 'https://www.srta.ga.gov', phone: '1-855-724-4327', portalUrl: 'https://www.mypeachpass.com' },
    ],
    acceptedTransponders: ['Peach Pass', 'SunPass', 'E-ZPass (Express Lanes)', 'NC Quick Pass', 'Bestpass'],
    majorFacilities: [
      { name: 'I-85 Express Lanes', highway: 'I-85', milepostOrLocation: 'Gwinnett County / Atlanta Northeast', typical5AxleTruckToll: 'Commercial trucks prohibited in express lanes', videoTollSurcharge: 'N/A', cashlessStatus: '100% Cashless AET', notes: 'Class 8 commercial trucks with more than 2 axles are prohibited in GA Express Lanes; must use general purpose lanes.' },
      { name: 'I-75 South Metro Express Lanes', highway: 'I-75', milepostOrLocation: 'McDonough to Stockbridge', typical5AxleTruckToll: 'Commercial trucks prohibited', videoTollSurcharge: 'N/A', cashlessStatus: '100% Cashless AET', notes: 'Reversible toll lanes strictly reserved for passenger vehicles.' },
    ],
    truckerAdvisories: ['Commercial trucks with more than 2 axles are strictly barred from Georgia Express Toll Lanes. Use general purpose highway lanes.'],
    discountTips: ['Peach Pass is reciprocal with SunPass and NC Quick Pass for non-prohibited fleet support vehicles.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'NC',
    stateName: 'North Carolina',
    region: 'Southeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'North Carolina Turnpike Authority', acronym: 'NCTA', website: 'https://www.ncdot.gov/divisions/turnpike', phone: '1-877-787-2837', portalUrl: 'https://www.ncquickpass.com' },
    ],
    acceptedTransponders: ['NC Quick Pass', 'E-ZPass', 'SunPass', 'Peach Pass', 'Bestpass'],
    majorFacilities: [
      { name: 'Triangle Expressway (Toll NC 540)', highway: 'NC 540', milepostOrLocation: 'Research Triangle / Raleigh-Durham', typical5AxleTruckToll: '$14.50 - $24.00', videoTollSurcharge: '+35% Bill by Mail', cashlessStatus: '100% Cashless AET', notes: 'Complete western outer loop around Raleigh.' },
      { name: 'Monroe Expressway (Toll US 74 Bypass)', highway: 'US 74 Bypass', milepostOrLocation: 'Union County / Charlotte Southeast bypass', typical5AxleTruckToll: '$12.00 - $18.50', videoTollSurcharge: '+35% Bill by Mail', cashlessStatus: '100% Cashless AET', notes: 'Bypasses heavy traffic on surface US 74.' },
    ],
    truckerAdvisories: ['All North Carolina toll facilities are 100% cashless with overhead high-speed gantries.'],
    discountTips: ['NC Quick Pass or E-ZPass saves 35% over Bill by Mail.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'SC',
    stateName: 'South Carolina',
    region: 'Southeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'South Carolina Department of Transportation', acronym: 'SCDOT', website: 'https://www.scdot.gov', phone: '1-855-467-2368', portalUrl: 'https://www.palmettopass.com' },
    ],
    acceptedTransponders: ['Palmetto Pass (PAL PASS)', 'Bestpass'],
    majorFacilities: [
      { name: 'Southern Connector', highway: 'I-185', milepostOrLocation: 'Greenville to I-385', typical5AxleTruckToll: '$8.00 - $14.00', videoTollSurcharge: 'Pay-By-Mail fee', cashlessStatus: '100% Cashless AET', notes: 'Note: Cross Island Parkway on Hilton Head became toll-free in 2021.' },
    ],
    truckerAdvisories: ['I-185 Southern Connector is the only active toll facility in SC.'],
    discountTips: ['PAL PASS accounts provide volume incentives.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'AL',
    stateName: 'Alabama',
    region: 'Southeast',
    hasTollFacilities: true,
    systemType: 'Hybrid Cashless & Cash',
    primaryAgencies: [
      { name: 'Alabama Department of Transportation', acronym: 'ALDOT', website: 'https://www.dot.state.al.us', phone: '1-334-242-6358', portalUrl: 'https://www.dot.state.al.us' },
      { name: 'American Roads', acronym: 'AmRoads', website: 'https://www.americanroads.com', phone: '1-334-670-0010', portalUrl: 'https://www.freedompass.com' },
    ],
    acceptedTransponders: ['Freedom Pass', 'Bestpass'],
    majorFacilities: [
      { name: 'Foley Beach Express Bridge', highway: 'Beach Express', milepostOrLocation: 'Orange Beach / Gulf Shores', typical5AxleTruckToll: '$6.00 - $10.00', videoTollSurcharge: 'Cash / Card', cashlessStatus: 'Gantry Overhead', notes: 'Private toll bridge across Intracoastal Waterway (state acquisition finalized for free bridge).' },
      { name: 'Tuscaloosa Eastern Bypass (Black Warrior River Bridge)', highway: 'AL 297', milepostOrLocation: 'Tuscaloosa', typical5AxleTruckToll: '$4.50 - $7.50', videoTollSurcharge: 'Cash / Card', cashlessStatus: 'Gantry Overhead', notes: 'Bypasses downtown Tuscaloosa.' },
    ],
    truckerAdvisories: ['Interstates in Alabama (I-65, I-20, I-85, I-10, I-59) are entirely toll-free.'],
    discountTips: ['Use designated interstate bypass corridors to avoid localized private toll bridges.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'MS',
    stateName: 'Mississippi',
    region: 'Southeast',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Mississippi Department of Transportation', acronym: 'MDOT', website: 'https://mdot.ms.gov', phone: '1-601-359-7001', portalUrl: 'https://mdot.ms.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['No toll roads or bridges operate in Mississippi. Interstates I-20, I-55, I-10 are toll-free.'],
    discountTips: ['Clean IFTA reporting through state fuel depots.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'TN',
    stateName: 'Tennessee',
    region: 'Southeast',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Tennessee Department of Transportation', acronym: 'TDOT', website: 'https://www.tn.gov/tdot', phone: '1-615-741-2848', portalUrl: 'https://www.tn.gov/tdot' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: [
      'Tennessee has zero toll roads or bridges.',
      'Transportation Modernization Act passed for future Choice Lanes, currently zero toll collection.'
    ],
    discountTips: ['Enjoy 100% toll-free transit across I-40, I-24, I-65, I-75.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'KY',
    stateName: 'Kentucky',
    region: 'Southeast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'RiverLink', acronym: 'RiverLink', website: 'https://riverlink.com', phone: '1-855-748-5465', portalUrl: 'https://riverlink.com' },
    ],
    acceptedTransponders: ['E-ZPass', 'RiverLink', 'Bestpass', 'PrePass Plus', 'I-PASS'],
    majorFacilities: [
      { name: 'Ohio River Bridges (I-65 Abraham Lincoln & Kennedy Bridges)', highway: 'I-65', milepostOrLocation: 'Louisville KY to Jeffersonville IN', typical5AxleTruckToll: '$12.50 - $16.80', videoTollSurcharge: '$17.50+ unregistered video rate', cashlessStatus: '100% Cashless AET', notes: 'Key north-south corridor on I-65 across the Ohio River.' },
      { name: 'Lewis and Clark Bridge (SR 265 / IN 265)', highway: 'I-265', milepostOrLocation: 'East End Bridge', typical5AxleTruckToll: '$12.50 - $16.80', videoTollSurcharge: 'Video billing surcharge', cashlessStatus: '100% Cashless AET', notes: 'East end bypass around Louisville.' },
    ],
    truckerAdvisories: [
      'I-64 Sherman Minton Bridge and US-31 Clark Memorial Bridge in Louisville remain TOLL-FREE alternatives.',
      'Kentucky Parkway system (Western KY, Bluegrass, Cumberland) are all toll-free.'
    ],
    discountTips: ['E-ZPass or RiverLink account avoids the $5+ per-crossing video invoice surcharge.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },

  // --- MIDWEST ---
  {
    stateCode: 'IL',
    stateName: 'Illinois',
    region: 'Midwest',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Illinois State Toll Highway Authority', acronym: 'ISTHA', website: 'https://www.illinoistollway.com', phone: '1-800-824-7277', portalUrl: 'https://www.getipass.com' },
      { name: 'Chicago Skyway Concession Company', acronym: 'Skyway', website: 'https://www.chicagoskyway.org', phone: '1-773-356-0001', portalUrl: 'https://www.getipass.com' },
    ],
    acceptedTransponders: ['I-PASS', 'E-ZPass', 'Bestpass', 'PrePass Plus', 'SunPass Pro'],
    majorFacilities: [
      { name: 'Tri-State Tollway', highway: 'I-294 / I-94', milepostOrLocation: 'O’Hare Airport / Chicago Circumferential Bypass', typical5AxleTruckToll: '$28.00 - $48.00', videoTollSurcharge: '+100% Pay By Plate markup', cashlessStatus: '100% Cashless AET', notes: 'Massive freight volume bypassing Chicago city core.' },
      { name: 'Jane Addams Memorial Tollway', highway: 'I-90', milepostOrLocation: 'O’Hare to Wisconsin state line (South Beloit)', typical5AxleTruckToll: '$18.00 - $34.00', videoTollSurcharge: 'Pay By Plate surcharge', cashlessStatus: '100% Cashless AET', notes: 'Direct connection to Rockford and Madison.' },
      { name: 'Reagan Memorial Tollway', highway: 'I-88', milepostOrLocation: 'Hillside (I-290) to Rock Falls', typical5AxleTruckToll: '$16.00 - $28.00', videoTollSurcharge: 'Pay By Plate surcharge', cashlessStatus: '100% Cashless AET', notes: 'Connects Chicago to Quad Cities and I-80 West.' },
      { name: 'Chicago Skyway', highway: 'I-90', milepostOrLocation: 'Dan Ryan (I-94) to Indiana Toll Road (I-80/90)', typical5AxleTruckToll: '$38.20 - $52.00', videoTollSurcharge: 'Pay-By-Plate higher rate', cashlessStatus: '100% Cashless AET', notes: 'Concession-operated 7.8-mile bridge highway.' },
    ],
    truckerAdvisories: [
      'Illinois Tollway is 100% cashless. Pay-By-Plate has strict 14-day online settlement deadlines before penalties.',
      'Nighttime off-peak commercial truck discounts apply between 10 PM and 6 AM.'
    ],
    discountTips: ['E-ZPass or I-PASS cuts commercial toll costs by exactly 50% on all Illinois Tollway gantries.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'IN',
    stateName: 'Indiana',
    region: 'Midwest',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Indiana Toll Road Concession Company', acronym: 'ITRCC', website: 'https://www.indianatollroad.org', phone: '1-574-674-8836', portalUrl: 'https://www.ezpassin.com' },
    ],
    acceptedTransponders: ['E-ZPass', 'I-PASS', 'Bestpass', 'PrePass Plus', 'SunPass Pro'],
    majorFacilities: [
      { name: 'Indiana Toll Road', highway: 'I-80 / I-90', milepostOrLocation: 'Illinois line (MM 0) to Ohio line (MM 157)', typical5AxleTruckToll: '$68.00 - $84.00', videoTollSurcharge: '+35% video invoice fee', cashlessStatus: '100% Cashless AET', notes: 'Premier cross-country freight route between Chicago and East Coast.' },
    ],
    truckerAdvisories: ['Overnight parking fills up quickly at Travel Plazas along I-80/90; reserve parking in advance.'],
    discountTips: ['E-ZPass provides instant class-based toll discounts.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'OH',
    stateName: 'Ohio',
    region: 'Midwest',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Ohio Turnpike and Infrastructure Commission', acronym: 'OTIC', website: 'https://www.ohioturnpike.org', phone: '1-440-234-2081', portalUrl: 'https://www.ezpassoh.com' },
    ],
    acceptedTransponders: ['E-ZPass', 'Bestpass', 'PrePass Plus', 'I-PASS', 'SunPass Pro'],
    majorFacilities: [
      { name: 'Ohio Turnpike', highway: 'I-80 / I-90 / I-76', milepostOrLocation: 'Indiana line (MM 0) to Pennsylvania line (MM 241)', typical5AxleTruckToll: '$42.00 - $68.00 (E-ZPass) / $65.00 - $98.00 (Cash/License Plate)', videoTollSurcharge: '+33% higher non-E-ZPass rate', cashlessStatus: '100% Cashless AET', notes: 'New modern open-road cashless tolling system launched in 2024 with express gantry lanes.' },
    ],
    truckerAdvisories: ['Long Combination Vehicles (LCVs) permitted on Ohio Turnpike with special OTIC permit.'],
    discountTips: ['E-ZPass transponder saves 33% across all 241 miles of the Ohio Turnpike.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'MI',
    stateName: 'Michigan',
    region: 'Midwest',
    hasTollFacilities: true,
    systemType: 'International Border Bridges Only',
    primaryAgencies: [
      { name: 'Mackinac Bridge Authority', acronym: 'MBA', website: 'https://www.mackinacbridge.org', phone: '1-906-643-7600', portalUrl: 'https://www.mackinacbridge.org' },
      { name: 'Detroit International Bridge Company (Ambassador Bridge)', acronym: 'DIBC', website: 'https://www.ambassadorbridge.com', phone: '1-586-250-2500', portalUrl: 'https://www.ambassadorbridge.com' },
      { name: 'Blue Water Bridge (MDOT)', acronym: 'BWB', website: 'https://www.michigan.gov/mdot', phone: '1-810-984-3131', portalUrl: 'https://www.bluewaterbridge.ca' },
    ],
    acceptedTransponders: ['MacPass (Mackinac)', 'Ambassador Bridge Premier Card', 'E-ZPass (at select international crossings)', 'Bestpass'],
    majorFacilities: [
      { name: 'Mackinac Bridge', highway: 'I-75', milepostOrLocation: 'St. Ignace to Mackinaw City', typical5AxleTruckToll: '$25.00 ($5.00 per axle)', videoTollSurcharge: 'Cash / Card', cashlessStatus: 'Gantry Overhead', notes: 'Connects Upper and Lower Peninsulas. Escort service provided for high-wind conditions.' },
      { name: 'Ambassador Bridge', highway: 'I-75 / I-96 to Windsor ON', milepostOrLocation: 'Detroit MI to Windsor Ontario Canada', typical5AxleTruckToll: '$45.00 - $75.00 USD/CAD', videoTollSurcharge: 'Commercial border rate', cashlessStatus: 'Bridge Crossing', notes: 'Busiest commercial international border crossing in North America.' },
      { name: 'Blue Water Bridge', highway: 'I-94 / I-69 to Sarnia ON', milepostOrLocation: 'Port Huron MI to Sarnia Ontario Canada', typical5AxleTruckToll: '$24.50 - $45.00', videoTollSurcharge: 'Edge RFID tag / Cash', cashlessStatus: 'Bridge Crossing', notes: 'Primary northern border route connecting to Ontario 402/401.' },
    ],
    truckerAdvisories: [
      'No state toll roads in Michigan; tolls exist exclusively on major water bridges and international border crossings.',
      'Check CBP FAST lane credentials before queuing for Canadian border bridges.'
    ],
    discountTips: ['Blue Water Bridge prepaid commercial accounts offer transponder discount.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'WI',
    stateName: 'Wisconsin',
    region: 'Midwest',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Wisconsin Department of Transportation', acronym: 'WisDOT', website: 'https://wisconsindot.gov', phone: '1-608-266-2827', portalUrl: 'https://wisconsindot.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Wisconsin has zero toll highways. I-94, I-90, I-43, I-39 are 100% toll-free.'],
    discountTips: ['Be aware that crossing south into Illinois immediately initiates Illinois Tollway (I-PASS) cashless gantries.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'MN',
    stateName: 'Minnesota',
    region: 'Midwest',
    hasTollFacilities: true,
    systemType: 'Express / HOT Lanes Only',
    primaryAgencies: [
      { name: 'Minnesota Department of Transportation', acronym: 'MnDOT', website: 'https://www.dot.state.mn.us', phone: '1-651-296-3000', portalUrl: 'https://www.dot.state.mn.us/ezpassmn' },
    ],
    acceptedTransponders: ['E-ZPass Minnesota (formerly MnPASS)', 'E-ZPass Regional'],
    majorFacilities: [
      { name: 'E-ZPass Express Lanes (I-394, I-35W, I-35E)', highway: 'I-394 / I-35W', milepostOrLocation: 'Minneapolis / St. Paul Twin Cities', typical5AxleTruckToll: 'Commercial trucks prohibited in express lanes', videoTollSurcharge: 'N/A', cashlessStatus: '100% Cashless AET', notes: 'Commercial trucks over 26,000 lbs strictly prohibited from using E-ZPass MN express lanes; general lanes are toll-free.' },
    ],
    truckerAdvisories: ['Commercial trucks must utilize general purpose lanes in the Twin Cities.'],
    discountTips: ['All general interstate highways in MN are toll-free.'],
    bestpassInteroperable: true,
    ezPassInteroperable: true,
  },
  {
    stateCode: 'IA',
    stateName: 'Iowa',
    region: 'Midwest',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Iowa Department of Transportation', acronym: 'IowaDOT', website: 'https://iowadot.gov', phone: '1-515-239-1101', portalUrl: 'https://iowadot.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Iowa highways (I-80, I-35, I-29, I-380) are 100% toll-free.'],
    discountTips: ['Check I-80 scale compliance at Avoca and Dallas County weigh stations.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'MO',
    stateName: 'Missouri',
    region: 'Midwest',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Missouri Department of Transportation', acronym: 'MoDOT', website: 'https://www.modot.org', phone: '1-888-275-6636', portalUrl: 'https://www.modot.org' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [
      { name: 'Lake Ozark Community Bridge', highway: 'Private Route', milepostOrLocation: 'Lake of the Ozarks', typical5AxleTruckToll: '$4.00 - $6.00', videoTollSurcharge: 'Local bridge only', cashlessStatus: 'Gantry Overhead', notes: 'Isolated recreational bridge; no commercial throughway impact.' },
    ],
    truckerAdvisories: ['Missouri state highway network (I-70, I-44, I-55, I-35) is 100% toll-free.'],
    discountTips: ['Save toll expenses by routing through MO instead of northern turnpikes.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },

  // --- PLAINS ---
  {
    stateCode: 'KS',
    stateName: 'Kansas',
    region: 'Plains',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Kansas Turnpike Authority', acronym: 'KTA', website: 'https://www.ksturnpike.com', phone: '1-800-827-7867', portalUrl: 'https://www.myktag.com' },
    ],
    acceptedTransponders: ['K-TAG', 'Bestpass', 'PrePass Plus', 'PikePass (OK)', 'TxTag / TollTag / EZ TAG (TX)', 'SunPass Pro'],
    majorFacilities: [
      { name: 'Kansas Turnpike', highway: 'I-35 / I-70 / I-470', milepostOrLocation: 'Kansas City to Oklahoma border (236 miles)', typical5AxleTruckToll: '$24.00 - $38.50 (K-TAG) / $45.00 - $68.00 (DriveKS Plate)', videoTollSurcharge: '+50% DriveKS video toll surcharge', cashlessStatus: '100% Cashless AET', notes: 'Converted to 100% cashless open road tolling in mid-2024.' },
    ],
    truckerAdvisories: [
      'Cash booths have been permanently removed across the entire 236-mile Kansas Turnpike.',
      'Central interoperability hub with Oklahoma (PikePass) and Texas (TxTag/TollTag).'
    ],
    discountTips: ['K-TAG or Bestpass delivers 50% savings over video license plate tolling.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'OK',
    stateName: 'Oklahoma',
    region: 'Plains',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Oklahoma Turnpike Authority', acronym: 'OTA (PikePass)', website: 'https://www.pikepass.com', phone: '1-800-745-3727', portalUrl: 'https://www.pikepass.com' },
    ],
    acceptedTransponders: ['PikePass', 'Bestpass', 'PrePass Plus', 'K-TAG (KS)', 'TxTag / TollTag / EZ TAG (TX)'],
    majorFacilities: [
      { name: 'Turner Turnpike', highway: 'I-44', milepostOrLocation: 'Oklahoma City to Tulsa', typical5AxleTruckToll: '$14.50 - $22.00', videoTollSurcharge: '+60% PlatePay rate', cashlessStatus: '100% Cashless AET', notes: 'High-density commercial artery connecting OKC and Tulsa.' },
      { name: 'Will Rogers Turnpike', highway: 'I-44', milepostOrLocation: 'Tulsa to Missouri state line (Joplin)', typical5AxleTruckToll: '$15.00 - $24.00', videoTollSurcharge: '+60% PlatePay rate', cashlessStatus: '100% Cashless AET', notes: 'Primary freight link from St. Louis to Texas and Southwest.' },
      { name: 'Indian Nation Turnpike', highway: 'SH-375', milepostOrLocation: 'Henryetta to Hugo (Texas border)', typical5AxleTruckToll: '$16.50 - $25.00', videoTollSurcharge: '+60% PlatePay rate', cashlessStatus: '100% Cashless AET', notes: 'North-south shortcut to Paris and Dallas TX.' },
      { name: 'Cimarron Turnpike', highway: 'US-412', milepostOrLocation: 'I-35 to Tulsa', typical5AxleTruckToll: '$10.00 - $16.50', videoTollSurcharge: '+60% PlatePay rate', cashlessStatus: '100% Cashless AET', notes: 'Fast connector across northern Oklahoma.' },
    ],
    truckerAdvisories: ['PlatePay cashless tolling is active on all Oklahoma turnpikes. PlatePay invoices are significantly higher than transponder rates.'],
    discountTips: ['PikePass, K-TAG, or Bestpass cuts toll bills by up to 40%.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'NE',
    stateName: 'Nebraska',
    region: 'Plains',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Nebraska Department of Transportation', acronym: 'NDOT', website: 'https://dot.nebraska.gov', phone: '1-402-471-4567', portalUrl: 'https://dot.nebraska.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Nebraska interstates (I-80, I-76, I-680) are entirely toll-free.'],
    discountTips: ['Check I-80 high wind advisories near North Platte and Big Springs.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'SD',
    stateName: 'South Dakota',
    region: 'Plains',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'South Dakota Department of Transportation', acronym: 'SDDOT', website: 'https://dot.sd.gov', phone: '1-605-773-3265', portalUrl: 'https://dot.sd.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Zero toll facilities in South Dakota. I-90 and I-29 are toll-free.'],
    discountTips: ['Monitor winter blizzard closures on I-90 gates.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'ND',
    stateName: 'North Dakota',
    region: 'Plains',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'North Dakota Department of Transportation', acronym: 'NDDOT', website: 'https://www.dot.nd.gov', phone: '1-701-328-2500', portalUrl: 'https://www.dot.nd.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Zero toll roads in North Dakota. I-94 and I-29 are toll-free.'],
    discountTips: ['Watch for oilfield heavy haul corridors and frost law seasonal weight restrictions.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },

  // --- SOUTH & TEXAS ---
  {
    stateCode: 'TX',
    stateName: 'Texas',
    region: 'South',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Texas Department of Transportation', acronym: 'TxDOT (TxTag)', website: 'https://www.txtag.org', phone: '1-888-468-9824', portalUrl: 'https://www.txtag.org' },
      { name: 'North Texas Tollway Authority', acronym: 'NTTA (TollTag)', website: 'https://www.ntta.org', phone: '1-972-818-6882', portalUrl: 'https://www.ntta.org' },
      { name: 'Harris County Toll Road Authority', acronym: 'HCTRA (EZ TAG)', website: 'https://www.hctra.org', phone: '1-281-875-3279', portalUrl: 'https://www.hctra.org' },
      { name: 'Central Texas Regional Mobility Authority', acronym: 'CTRMA', website: 'https://www.mobilityauthority.com', phone: '1-512-996-9778', portalUrl: 'https://www.ctrma.org' },
    ],
    acceptedTransponders: ['TxTag', 'TollTag (NTTA)', 'EZ TAG (HCTRA)', 'PikePass (OK)', 'K-TAG (KS)', 'Bestpass', 'PrePass Plus', 'SunPass Pro', 'BancPass'],
    majorFacilities: [
      { name: 'President George Bush Turnpike (PGBT)', highway: 'SH 161 / SH 190', milepostOrLocation: 'Dallas / Fort Worth northern outer loop', typical5AxleTruckToll: '$22.00 - $38.50', videoTollSurcharge: '+50% ZipCash rate', cashlessStatus: '100% Cashless AET', notes: 'Prime commercial cross-metro bypass around DFW.' },
      { name: 'Sam Rayburn Tollway (SRT)', highway: 'SH 121', milepostOrLocation: 'Grapevine to McKinney', typical5AxleTruckToll: '$18.00 - $32.00', videoTollSurcharge: '+50% ZipCash rate', cashlessStatus: '100% Cashless AET', notes: 'Key freight artery serving North Dallas distribution centers.' },
      { name: 'Sam Houston Tollway (Beltway 8)', highway: 'Beltway 8', milepostOrLocation: 'Houston Circumferential Loop', typical5AxleTruckToll: '$24.00 - $44.00', videoTollSurcharge: 'Pay-By-Plate invoice', cashlessStatus: '100% Cashless AET', notes: 'Main ring road serving Port of Houston and distribution hubs.' },
      { name: 'SH 130 Toll (Pickle Parkway)', highway: 'SH 130', milepostOrLocation: 'Georgetown to Seguin (Austin Bypass)', typical5AxleTruckToll: '$34.00 - $58.00', videoTollSurcharge: '+33% Pay By Mail', cashlessStatus: '100% Cashless AET', notes: 'High speed (85 MPH posted speed limit). Premier bypass for congested I-35 Austin corridor.' },
      { name: 'Grand Parkway (SH 99)', highway: 'SH 99', milepostOrLocation: 'Greater Houston Outer Loop (180 miles)', typical5AxleTruckToll: '$28.00 - $52.00', videoTollSurcharge: 'Pay-By-Mail invoice', cashlessStatus: '100% Cashless AET', notes: 'Massive mega-loop around Houston metro.' },
    ],
    truckerAdvisories: [
      'Texas operates the largest network of cashless toll roads in North America. No cash toll booths exist on any major tollway.',
      'Central Texas, North Texas, and Houston agencies are fully interoperable with TxTag, TollTag, and EZ TAG.'
    ],
    discountTips: ['Mounting an active TxTag, TollTag, or Bestpass transponder eliminates 50% ZipCash surcharges immediately.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'LA',
    stateName: 'Louisiana',
    region: 'South',
    hasTollFacilities: true,
    systemType: 'Hybrid Cashless & Cash',
    primaryAgencies: [
      { name: 'Louisiana Department of Transportation and Development', acronym: 'LA DOTD', website: 'http://www.dotd.la.gov', phone: '1-877-452-3683', portalUrl: 'https://www.geauxpass.com' },
    ],
    acceptedTransponders: ['GeauxPass', 'Bestpass'],
    majorFacilities: [
      { name: 'LA 1 Expressway', highway: 'LA 1', milepostOrLocation: 'Leeville to Port Fourchon', typical5AxleTruckToll: '$15.00 - $25.00', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Elevated highway providing vital link to offshore oil hubs at Port Fourchon.' },
    ],
    truckerAdvisories: ['Interstates I-10, I-20, I-12, I-49 across Louisiana are completely toll-free.'],
    discountTips: ['GeauxPass transponder gives automated toll deduction for coastal runs.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'AR',
    stateName: 'Arkansas',
    region: 'South',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Arkansas Department of Transportation', acronym: 'ARDOT', website: 'https://www.ardot.gov', phone: '1-501-569-2000', portalUrl: 'https://www.ardot.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Arkansas highways (I-40, I-30, I-55) are 100% toll-free.'],
    discountTips: ['I-40 bridge across Mississippi River at West Memphis is toll-free.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },

  // --- MOUNTAIN ---
  {
    stateCode: 'CO',
    stateName: 'Colorado',
    region: 'Mountain',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'E-470 Public Highway Authority', acronym: 'E-470', website: 'https://www.e-470.com', phone: '1-303-537-3470', portalUrl: 'https://www.expresstoll.com' },
      { name: 'Colorado Department of Transportation (ExpressToll)', acronym: 'CDOT HPTE', website: 'https://www.codot.gov/programs/expresslanes', phone: '1-303-537-3470', portalUrl: 'https://www.expresstoll.com' },
    ],
    acceptedTransponders: ['ExpressToll', 'Bestpass', 'PrePass Plus'],
    majorFacilities: [
      { name: 'E-470 Beltway', highway: 'E-470', milepostOrLocation: 'Denver Eastern Bypass (I-25 South to I-25 North / DIA)', typical5AxleTruckToll: '$38.00 - $58.00', videoTollSurcharge: '+40% License Plate Toll (LPT)', cashlessStatus: '100% Cashless AET', notes: 'Essential commercial bypass avoiding congested I-25 central Denver and serving Denver International Airport logistics.' },
      { name: 'Northwest Parkway', highway: 'NW Parkway', milepostOrLocation: 'Broomfield to I-25', typical5AxleTruckToll: '$12.00 - $18.50', videoTollSurcharge: 'License Plate Toll surcharge', cashlessStatus: '100% Cashless AET', notes: 'Private tollway connecting US 36 and I-25.' },
      { name: 'I-70 Mountain Express Lanes', highway: 'I-70', milepostOrLocation: 'Empire to Idaho Springs', typical5AxleTruckToll: 'Commercial vehicles prohibited in peak express lane', videoTollSurcharge: 'N/A', cashlessStatus: '100% Cashless AET', notes: 'Strictly passenger vehicles only. Class 8 trucks must stay in general lanes and comply with winter tire chain laws.' },
    ],
    truckerAdvisories: [
      'Colorado winter chain law on I-70 (Dotsero to Morrison) is strictly enforced from Sept 1 to May 31. Fines up to $1,000 for blocking lanes.',
      'E-470 is 100% cashless.'
    ],
    discountTips: ['ExpressToll or Bestpass saves 40% compared to License Plate Toll billing.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'UT',
    stateName: 'Utah',
    region: 'Mountain',
    hasTollFacilities: true,
    systemType: 'Express / HOT Lanes Only',
    primaryAgencies: [
      { name: 'Utah Department of Transportation', acronym: 'UDOT', website: 'https://www.udot.utah.gov', phone: '1-801-965-4000', portalUrl: 'https://www.udotexpresslanes.com' },
    ],
    acceptedTransponders: ['UDOT Express Pass'],
    majorFacilities: [
      { name: 'I-15 Express Lanes', highway: 'I-15', milepostOrLocation: 'Salt Lake City to Spanish Fork / Layton (72 miles)', typical5AxleTruckToll: 'Commercial trucks over 2 axles prohibited', videoTollSurcharge: 'N/A', cashlessStatus: '100% Cashless AET', notes: 'Single/dual axle passenger vehicles only. Heavy commercial trucks prohibited in express lanes; use general lanes for free.' },
      { name: 'Adams Avenue Parkway', highway: 'Adams Ave', milepostOrLocation: 'Washington Terrace / South Ogden', typical5AxleTruckToll: '$3.00 - $5.00', videoTollSurcharge: 'Local bridge toll', cashlessStatus: 'Gantry Overhead', notes: 'Small private parkway shortcut.' },
    ],
    truckerAdvisories: ['Commercial trucks must utilize general purpose lanes through Salt Lake City.'],
    discountTips: ['General I-15 and I-80 lanes are completely toll-free.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'AZ',
    stateName: 'Arizona',
    region: 'Mountain',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Arizona Department of Transportation', acronym: 'ADOT', website: 'https://azdot.gov', phone: '1-602-712-7355', portalUrl: 'https://azdot.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Zero toll roads in Arizona. I-10, I-40, I-17, and I-8 are completely toll-free.'],
    discountTips: ['Be mindful of high summer ambient temperatures on tires across desert corridors.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'NV',
    stateName: 'Nevada',
    region: 'Mountain',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Nevada Department of Transportation', acronym: 'NDOT', website: 'https://www.dot.nv.gov', phone: '1-775-888-7000', portalUrl: 'https://www.dot.nv.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Nevada state constitution explicitly restricts toll roads. I-80 and I-15 are 100% toll-free.'],
    discountTips: ['No toll expenses across Las Vegas or Reno corridors.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'NM',
    stateName: 'New Mexico',
    region: 'Mountain',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'New Mexico Department of Transportation', acronym: 'NMDOT', website: 'https://www.dot.nm.gov', phone: '1-800-432-4269', portalUrl: 'https://www.dot.nm.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['New Mexico has zero toll facilities. I-40, I-10, I-25 are toll-free. (Note: NM Weight-Distance Tax applies via quarterly reporting).'],
    discountTips: ['Keep accurate records of NM mileage for Weight-Distance tax filing.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'WY',
    stateName: 'Wyoming',
    region: 'Mountain',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Wyoming Department of Transportation', acronym: 'WYDOT', website: 'https://www.dot.state.wy.us', phone: '1-307-777-4375', portalUrl: 'https://www.dot.state.wy.us' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: [
      'Wyoming has zero toll roads.',
      'CRITICAL: I-80 high wind blows over empty trucks frequently. Obey dynamic closure signs near Arlington & Elk Mountain.'
    ],
    discountTips: ['Check WYDOT 511 app before crossing I-80 in winter.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'ID',
    stateName: 'Idaho',
    region: 'Mountain',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Idaho Transportation Department', acronym: 'ITD', website: 'https://itd.idaho.gov', phone: '1-208-334-8000', portalUrl: 'https://itd.idaho.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Zero toll roads in Idaho. I-84, I-15, I-90 are completely toll-free.'],
    discountTips: ['Check port of entry weigh stations at Boise and Inkom.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'MT',
    stateName: 'Montana',
    region: 'Mountain',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Montana Department of Transportation', acronym: 'MDT', website: 'https://www.mdt.mt.gov', phone: '1-406-444-6200', portalUrl: 'https://www.mdt.mt.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Montana has zero toll roads. I-90, I-94, I-15 are toll-free.'],
    discountTips: ['Be aware of Bozeman Pass and Lookout Pass mountain driving protocols.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },

  // --- WEST COAST ---
  {
    stateCode: 'CA',
    stateName: 'California',
    region: 'West Coast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Bay Area Toll Authority', acronym: 'BATA (FasTrak)', website: 'https://www.bayareafastrak.org', phone: '1-877-229-8655', portalUrl: 'https://www.bayareafastrak.org' },
      { name: 'Golden Gate Bridge, Highway & Transportation District', acronym: 'GGBHTD', website: 'https://www.goldengate.org', phone: '1-877-229-8655', portalUrl: 'https://www.bayareafastrak.org' },
      { name: 'Transportation Corridor Agencies (The Toll Roads)', acronym: 'TCA', website: 'https://thetollroads.com', phone: '1-949-727-4800', portalUrl: 'https://thetollroads.com' },
      { name: 'Orange County Transportation Authority (OCTA 91 Express)', acronym: 'OCTA', website: 'https://www.octa.net', phone: '1-800-600-9191', portalUrl: 'https://www.91expresslanes.com' },
    ],
    acceptedTransponders: ['FasTrak / FasTrak Flex', 'Bestpass', 'PrePass Plus', 'NationalPass'],
    majorFacilities: [
      { name: 'San Francisco-Oakland Bay Bridge', highway: 'I-80', milepostOrLocation: 'Oakland to San Francisco', typical5AxleTruckToll: '$28.00 - $38.00', videoTollSurcharge: 'Invoice fee added', cashlessStatus: '100% Cashless AET', notes: 'Westbound toll only into San Francisco. 5-axle rate is based on number of axles.' },
      { name: 'Golden Gate Bridge', highway: 'US-101 / SR 1', milepostOrLocation: 'Marin County to San Francisco', typical5AxleTruckToll: '$34.00 - $46.00', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Southbound toll only. Iconic crossing with strict wind safety halts.' },
      { name: 'San Mateo-Hayward Bridge', highway: 'SR 92', milepostOrLocation: 'Hayward to Foster City', typical5AxleTruckToll: '$24.00 - $32.00', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Westbound toll into peninsula.' },
      { name: 'The Toll Roads (Orange County SR 73, 133, 241, 261)', highway: 'SR 73 / SR 241', milepostOrLocation: 'I-5 to Irvine / Anaheim Hills', typical5AxleTruckToll: '$18.00 - $34.00', videoTollSurcharge: 'Pay Toll Online rate', cashlessStatus: '100% Cashless AET', notes: 'Essential bypass around congested I-5 in Orange County.' },
      { name: 'SR 125 South Bay Expressway', highway: 'SR 125', milepostOrLocation: 'Otay Mesa (Mexico border) to Spring Valley', typical5AxleTruckToll: '$8.50 - $14.50', videoTollSurcharge: 'Toll-by-Plate fee', cashlessStatus: '100% Cashless AET', notes: 'Direct connection from Otay Mesa commercial border crossing.' },
    ],
    truckerAdvisories: [
      '100% cashless tolling on all 8 Bay Area toll bridges and Southern California toll roads.',
      'California statutory truck speed limit is strictly 55 MPH statewide on all highways.',
      'CARB emissions compliance enforced at all California weigh stations and inspection facilities.'
    ],
    discountTips: ['FasTrak or Bestpass transponder eliminates invoice delinquency penalties.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'WA',
    stateName: 'Washington',
    region: 'West Coast',
    hasTollFacilities: true,
    systemType: 'All-Electronic (Cashless AET)',
    primaryAgencies: [
      { name: 'Washington State Department of Transportation (Good To Go!)', acronym: 'WSDOT', website: 'https://wsdot.wa.gov/travel/roads-bridges/toll-roads-bridges-tunnels', phone: '1-866-936-8246', portalUrl: 'https://mygoodtogo.com' },
    ],
    acceptedTransponders: ['Good To Go!', 'Bestpass', 'PrePass Plus'],
    majorFacilities: [
      { name: 'SR 520 Floating Bridge (Gov. Albert D. Rosellini Bridge)', highway: 'SR 520', milepostOrLocation: 'Seattle to Bellevue / Redmond', typical5AxleTruckToll: '$14.25 - $22.50 (Peak)', videoTollSurcharge: '+$2.00 Pay By Mail fee per crossing', cashlessStatus: '100% Cashless AET', notes: 'Longest floating bridge in the world across Lake Washington.' },
      { name: 'SR 99 Downtown Seattle Tunnel', highway: 'SR 99', milepostOrLocation: 'SODO to South Lake Union', typical5AxleTruckToll: '$6.50 - $12.00', videoTollSurcharge: 'Pay By Mail surcharge', cashlessStatus: '100% Cashless AET', notes: 'Deep-bore 2-mile tunnel under downtown Seattle. Dangerous goods/HAZMAT forbidden.' },
      { name: 'Tacoma Narrows Bridge', highway: 'SR 16', milepostOrLocation: 'Gig Harbor to Tacoma', typical5AxleTruckToll: '$18.00 - $27.00', videoTollSurcharge: 'Eastbound toll only', cashlessStatus: '100% Cashless AET', notes: 'Toll collected eastbound only towards I-5.' },
    ],
    truckerAdvisories: [
      'Hazardous materials and propane containers over statutory limits strictly banned from SR 99 Seattle Tunnel.',
      'I-5 through Seattle is TOLL-FREE (express lanes are for carpools).'
    ],
    discountTips: ['Good To Go! pass saves $2.00 to $4.00 per crossing over Pay By Mail.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'OR',
    stateName: 'Oregon',
    region: 'West Coast',
    hasTollFacilities: true,
    systemType: 'International Border Bridges Only',
    primaryAgencies: [
      { name: 'Port of Hood River', acronym: 'POHR', website: 'https://portofhoodriver.com', phone: '1-541-386-1645', portalUrl: 'https://breezeby.portofhoodriver.com' },
      { name: 'Port of Cascade Locks', acronym: 'Bridge of the Gods', website: 'https://portofcascadelocks.org', phone: '1-541-374-8619', portalUrl: 'https://portofcascadelocks.org' },
    ],
    acceptedTransponders: ['BreezeBy', 'Bestpass'],
    majorFacilities: [
      { name: 'Hood River-White Salmon Interstate Bridge', highway: 'OR 35 to WA SR 14', milepostOrLocation: 'Columbia River Gorge', typical5AxleTruckToll: '$15.00 - $24.00', videoTollSurcharge: 'BreezeBy or Cash', cashlessStatus: 'Bridge Crossing', notes: 'Narrow historic bridge across Columbia River. Weight limit strictly enforced.' },
      { name: 'Bridge of the Gods', highway: 'Cascade Locks to Stevenson WA', milepostOrLocation: 'Columbia River', typical5AxleTruckToll: '$12.00 - $20.00', videoTollSurcharge: 'Cash / Card', cashlessStatus: 'Bridge Crossing', notes: 'Historic cantilever bridge connecting OR and WA.' },
    ],
    truckerAdvisories: [
      'All major Oregon state freeways (I-5, I-84, I-205) are currently toll-free (ODOT regional toll proposals halted).',
      'NOTE: Oregon Weight-Mile Tax applies to all commercial carriers over 26,000 lbs.'
    ],
    discountTips: ['File monthly or quarterly Oregon Weight-Mile Tax to avoid roadside auditing.'],
    bestpassInteroperable: true,
    ezPassInteroperable: false,
  },

  // --- NON-CONTIGUOUS ---
  {
    stateCode: 'AK',
    stateName: 'Alaska',
    region: 'Non-Contiguous',
    hasTollFacilities: true,
    systemType: 'Hybrid Cashless & Cash',
    primaryAgencies: [
      { name: 'Alaska Department of Transportation and Public Facilities', acronym: 'DOT&PF', website: 'https://dot.alaska.gov', phone: '1-907-465-3900', portalUrl: 'https://dot.alaska.gov' },
    ],
    acceptedTransponders: ['Anton Anderson Memorial Tunnel Pass'],
    majorFacilities: [
      { name: 'Anton Anderson Memorial Tunnel (Whittier Tunnel)', highway: 'Portage Glacier Hwy', milepostOrLocation: 'Bear Valley to Whittier', typical5AxleTruckToll: '$42.00 - $68.00', videoTollSurcharge: 'Ticket booth toll', cashlessStatus: 'Bridge Crossing', notes: 'Longest combined vehicle-railroad tunnel in North America (2.5 miles). Shared single-track schedule.' },
    ],
    truckerAdvisories: ['Whittier Tunnel operates on strict alternating 15-minute directional schedules between cars, freight, and trains.'],
    discountTips: ['Commercial pass book available for frequent port deliveries.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
  {
    stateCode: 'HI',
    stateName: 'Hawaii',
    region: 'Non-Contiguous',
    hasTollFacilities: false,
    systemType: 'No Active Toll Roads',
    primaryAgencies: [
      { name: 'Hawaii Department of Transportation', acronym: 'HDOT', website: 'https://hidot.hawaii.gov', phone: '1-808-587-2160', portalUrl: 'https://hidot.hawaii.gov' },
    ],
    acceptedTransponders: ['N/A - State is Toll-Free'],
    majorFacilities: [],
    truckerAdvisories: ['Hawaii has zero toll roads across all islands.'],
    discountTips: ['Inter-island container shipping freight rules apply.'],
    bestpassInteroperable: false,
    ezPassInteroperable: false,
  },
];

// Helper search & filter functions
export function getTollDataByState(stateCode: string): StateTollProfile | undefined {
  return ALL_50_STATES_TOLL_DATA.find(
    (s) => s.stateCode.toUpperCase() === stateCode.toUpperCase()
  );
}

export function getAllStatesSummary() {
  const total = ALL_50_STATES_TOLL_DATA.length;
  const withTolls = ALL_50_STATES_TOLL_DATA.filter((s) => s.hasTollFacilities).length;
  const cashless = ALL_50_STATES_TOLL_DATA.filter((s) => s.systemType === 'All-Electronic (Cashless AET)').length;
  const ezPassCompatible = ALL_50_STATES_TOLL_DATA.filter((s) => s.ezPassInteroperable).length;
  const bestpassCompatible = ALL_50_STATES_TOLL_DATA.filter((s) => s.bestpassInteroperable).length;

  return {
    totalStates: total,
    statesWithTollFacilities: withTolls,
    cashlessAetStates: cashless,
    ezPassCompatibleStates: ezPassCompatible,
    bestpassCompatibleStates: bestpassCompatible,
  };
}
