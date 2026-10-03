// ============================================================================
// CB RADIO CHANNELS & FCC 27MHz FREQUENCY ALLOCATION DATA
// Complete 40-Channel specifications, standard calling frequencies,
// trucker handles, 10-code index, and realistic transmission chatter.
// ============================================================================

export interface CBChannelSpec {
  channel: number;
  frequencyMhz: number;
  name: string;
  designation: string;
  color: string;
  isEmergency?: boolean;
  isHighwayPrimary?: boolean;
  isCalling?: boolean;
  trafficLevel: 'HEAVY' | 'MODERATE' | 'SPARSE' | 'SILENT';
  description: string;
}

export interface CBRadioMessage {
  id: string;
  channel: number;
  senderHandle: string;
  senderUnit?: string;
  role: 'DRIVER' | 'USER' | 'DISPATCH' | 'HIGHWAY_PATROL' | 'WEIGH_STATION' | 'WEATHER_NET';
  text: string;
  timestamp: string;
  signalStrengthS: number; // S1 to S9 (+30dB)
  distanceMiles?: number;
  tenCode?: string;
  location?: string;
  verified: boolean;
  audioDurationSec?: number;
}

export interface CB10CodeItem {
  code: string;
  meaning: string;
  example: string;
  category: 'STANDARD' | 'EMERGENCY' | 'STATUS' | 'TECHNICAL';
}

export const CB_CHANNELS: CBChannelSpec[] = [
  { channel: 1, frequencyMhz: 26.965, name: 'Channel 1', designation: 'General Mobile', color: '#888888', trafficLevel: 'SPARSE', description: 'Low frequency local simplex calling.' },
  { channel: 2, frequencyMhz: 26.975, name: 'Channel 2', designation: 'Local Operations', color: '#888888', trafficLevel: 'SPARSE', description: 'Local terminal shuttle traffic.' },
  { channel: 3, frequencyMhz: 26.985, name: 'Channel 3', designation: 'Farm & Ag', color: '#888888', trafficLevel: 'SPARSE', description: 'Agricultural & rural logistics.' },
  { channel: 4, frequencyMhz: 27.005, name: 'Channel 4', designation: '4x4 & Offroad', color: '#3b82f6', trafficLevel: 'MODERATE', description: 'Trail leaders & off-highway convoys.' },
  { channel: 5, frequencyMhz: 27.015, name: 'Channel 5', designation: 'Local Relay', color: '#888888', trafficLevel: 'SPARSE', description: 'General regional chatter.' },
  { channel: 6, frequencyMhz: 27.025, name: 'Channel 6', designation: 'The Super Bowl (DX Skip)', color: '#ef4444', trafficLevel: 'HEAVY', description: 'High-power skip shooting & long-range DX.' },
  { channel: 7, frequencyMhz: 27.035, name: 'Channel 7', designation: 'Regional Comms', color: '#888888', trafficLevel: 'SPARSE', description: 'Interstate bypass coordination.' },
  { channel: 8, frequencyMhz: 27.055, name: 'Channel 8', designation: 'Terminal Yards', color: '#888888', trafficLevel: 'SPARSE', description: 'Freight yard spotter channel.' },
  { channel: 9, frequencyMhz: 27.065, name: 'Channel 9', designation: 'EMERGENCY / REACT 911', color: '#dc2626', isEmergency: true, trafficLevel: 'MODERATE', description: 'Official FCC Emergency, Motorist Assistance & Severe Weather.' },
  { channel: 10, frequencyMhz: 27.075, name: 'Channel 10', designation: 'Regional Freight', color: '#888888', trafficLevel: 'SPARSE', description: 'Short-haul freight operations.' },
  { channel: 11, frequencyMhz: 27.085, name: 'Channel 11', designation: 'General Chitchat / Lounge', color: '#10b981', isCalling: true, trafficLevel: 'HEAVY', description: 'National calling frequency & trucker road stories.' },
  { channel: 12, frequencyMhz: 27.105, name: 'Channel 12', designation: 'Escort & Oversize', color: '#f59e0b', trafficLevel: 'MODERATE', description: 'Heavy haul pilot cars & oversize load escorts.' },
  { channel: 13, frequencyMhz: 27.115, name: 'Channel 13', designation: 'Marine & RV Coast', color: '#06b6d4', trafficLevel: 'SPARSE', description: 'Coastal RV & convoy communication.' },
  { channel: 14, frequencyMhz: 27.125, name: 'Channel 14', designation: 'Local Haul / Gravel', color: '#888888', trafficLevel: 'MODERATE', description: 'Dump trucks, aggregate & job site dispatch.' },
  { channel: 15, frequencyMhz: 27.135, name: 'Channel 15', designation: 'Secondary Trucking', color: '#888888', trafficLevel: 'SPARSE', description: 'Alternative highway overflow channel.' },
  { channel: 16, frequencyMhz: 27.155, name: 'Channel 16', designation: '4WD / Trail Net', color: '#3b82f6', trafficLevel: 'SPARSE', description: 'Backcountry recovery & off-road.' },
  { channel: 17, frequencyMhz: 27.165, name: 'Channel 17', designation: 'Interstate North / South', color: '#f97316', trafficLevel: 'HEAVY', description: 'Official Northbound/Southbound Interstate Linehaul (I-5, I-35, I-75, I-95).' },
  { channel: 18, frequencyMhz: 27.175, name: 'Channel 18', designation: 'Midwest Interline', color: '#888888', trafficLevel: 'SPARSE', description: 'Midwestern regional freight link.' },
  { channel: 19, frequencyMhz: 27.185, name: 'Channel 19', designation: 'THE OPEN HIGHWAY (National Primary)', color: '#C9A84C', isHighwayPrimary: true, trafficLevel: 'HEAVY', description: 'Primary National Trucker Highway Channel — Speed Traps, Weigh Scales, Road Hazards & Traffic.' },
  { channel: 20, frequencyMhz: 27.205, name: 'Channel 20', designation: 'General Interstate', color: '#888888', trafficLevel: 'SPARSE', description: 'Secondary east/west chatter.' },
  { channel: 21, frequencyMhz: 27.215, name: 'Channel 21', designation: 'Port Operations', color: '#888888', trafficLevel: 'SPARSE', description: 'Maritime container terminal coordination.' },
  { channel: 22, frequencyMhz: 27.225, name: 'Channel 22', designation: 'Logging & Timber', color: '#888888', trafficLevel: 'SPARSE', description: 'Logging roads & mountain passes.' },
  { channel: 23, frequencyMhz: 27.255, name: 'Channel 23', designation: 'General Mobile', color: '#888888', trafficLevel: 'SPARSE', description: 'Regional dispatch backup.' },
  { channel: 24, frequencyMhz: 27.235, name: 'Channel 24', designation: 'Cross-Country Simplex', color: '#888888', trafficLevel: 'SPARSE', description: 'Coast-to-coast linehaul testing.' },
  { channel: 25, frequencyMhz: 27.245, name: 'Channel 25', designation: 'Refrigerated Fleets', color: '#888888', trafficLevel: 'SPARSE', description: 'Reefer temperature checks & produce corridors.' },
  { channel: 26, frequencyMhz: 27.265, name: 'Channel 26', designation: 'Flatbed & Rigging', color: '#888888', trafficLevel: 'SPARSE', description: 'Tarping, tie-down checks & flatbed ops.' },
  { channel: 27, frequencyMhz: 27.275, name: 'Channel 27', designation: 'Fuel Tanker Safety', color: '#888888', trafficLevel: 'SPARSE', description: 'Hazmat bulk tanker route advisories.' },
  { channel: 28, frequencyMhz: 27.285, name: 'Channel 28', designation: 'Heavy Wrecker / Tow', color: '#888888', trafficLevel: 'SPARSE', description: 'Rotator tow & roadside recovery link.' },
  { channel: 29, frequencyMhz: 27.295, name: 'Channel 29', designation: 'Regional Freight', color: '#888888', trafficLevel: 'SPARSE', description: 'Local delivery route sharing.' },
  { channel: 30, frequencyMhz: 27.305, name: 'Channel 30', designation: 'General Mobile', color: '#888888', trafficLevel: 'SPARSE', description: 'Standard open channel.' },
  { channel: 31, frequencyMhz: 27.315, name: 'Channel 31', designation: 'Southern Cross-Country', color: '#888888', trafficLevel: 'SPARSE', description: 'I-10 & I-20 Southern route chatter.' },
  { channel: 32, frequencyMhz: 27.325, name: 'Channel 32', designation: 'General Mobile', color: '#888888', trafficLevel: 'SPARSE', description: 'Interstate simplex link.' },
  { channel: 33, frequencyMhz: 27.335, name: 'Channel 33', designation: 'Auto Haulers', color: '#888888', trafficLevel: 'SPARSE', description: 'Car carrier loading & clearance advisories.' },
  { channel: 34, frequencyMhz: 27.345, name: 'Channel 34', designation: 'General Mobile', color: '#888888', trafficLevel: 'SPARSE', description: 'General communications.' },
  { channel: 35, frequencyMhz: 27.355, name: 'Channel 35', designation: 'Long Haul SSBC', color: '#888888', trafficLevel: 'SPARSE', description: 'Single Sideband calling link.' },
  { channel: 36, frequencyMhz: 27.365, name: 'Channel 36', designation: 'SSB DX Calling', color: '#a855f7', trafficLevel: 'MODERATE', description: 'Single Sideband LSB/USB long distance.' },
  { channel: 37, frequencyMhz: 27.375, name: 'Channel 37', designation: 'SSB Cross-Country', color: '#a855f7', trafficLevel: 'SPARSE', description: 'SSB clear channel operation.' },
  { channel: 38, frequencyMhz: 27.385, name: 'Channel 38', designation: 'SSB National Calling (LSB)', color: '#a855f7', trafficLevel: 'HEAVY', description: 'National Lower Sideband (LSB) calling channel.' },
  { channel: 39, frequencyMhz: 27.395, name: 'Channel 39', designation: 'SSB Continental Link', color: '#a855f7', trafficLevel: 'SPARSE', description: 'Upper Sideband long-haul link.' },
  { channel: 40, frequencyMhz: 27.405, name: 'Channel 40', designation: 'SSB Upper Boundary (USB)', color: '#a855f7', trafficLevel: 'MODERATE', description: 'Top frequency band boundary simplex.' },
];

export const TEN_CODES: CB10CodeItem[] = [
  { code: '10-4', meaning: 'Message Received / Acknowledged (Affirmative)', example: '10-4 driver, see you at the scale house.', category: 'STANDARD' },
  { code: '10-20', meaning: 'Current Location (What is your 20?)', example: 'What is your 10-20, driver?', category: 'STATUS' },
  { code: '10-33', meaning: 'Emergency Traffic at this Station / Clear the Channel', example: '10-33! Multi-vehicle incident eastbound!', category: 'EMERGENCY' },
  { code: '10-36', meaning: 'Correct Local Time', example: 'Can I get a 10-36 radio check?', category: 'STANDARD' },
  { code: '10-77', meaning: 'Estimated Time of Arrival (ETA)', example: '10-77 to the Dallas receiver is 14:30.', category: 'STATUS' },
  { code: '10-100', meaning: 'Restroom / Rest Stop Break', example: 'Taking a 10-100 at the Pilot exit 42.', category: 'STATUS' },
  { code: '10-200', meaning: 'Police / Law Enforcement Needed', example: '10-200 at mile marker 115.', category: 'EMERGENCY' },
  { code: '10-1', meaning: 'Receiving Poorly / Low Signal', example: 'You are coming in 10-1 through the hills.', category: 'TECHNICAL' },
  { code: '10-2', meaning: 'Receiving Well / Strong Signal', example: 'You are 10-2 wall-to-wall!', category: 'TECHNICAL' },
  { code: '10-9', meaning: 'Repeat Message (Say Again)', example: '10-9 driver, you were stepped on.', category: 'STANDARD' },
  { code: '10-42', meaning: 'Ending Shift / Out of Service / In the Sleeper', example: '10-42 for the night in the sleeper berth.', category: 'STATUS' },
  { code: '10-99', meaning: 'Mission / Load Completed', example: '10-99 on the reefer drop in Chicago.', category: 'STATUS' },
];

export const TRUCKER_SLANG_GLOSSARY = [
  { term: 'Smokey / Bear', definition: 'State Highway Patrol or State Trooper.' },
  { term: 'Chicken Coop', definition: 'DOT Weigh Station or Inspection Facility.' },
  { term: 'Alligator', definition: 'Blown tire retread piece laying on the highway.' },
  { term: 'Hammer Down', definition: 'Accelerating or moving at full allowable speed.' },
  { term: 'Bear Cave', definition: 'Police headquarters or hidden cruiser speed trap.' },
  { term: 'Yardstick', definition: 'Highway mile marker post.' },
  { term: 'Ears On', definition: 'CB radio turned on and actively listening.' },
  { term: 'Four-Wheeler', definition: 'Passenger car or SUV on the roadway.' },
  { term: 'Motion Lotion', definition: 'Diesel fuel.' },
  { term: 'Wall to Wall and Tree Top Tall', definition: 'Crystal clear, high-power radio reception.' },
  { term: 'Kodiak with a Camera', definition: 'Police officer taking radar speed readings.' },
  { term: 'Super Rooster', definition: 'Peterbilt or heavy-spec custom rig.' },
];

export const INITIAL_CHANNEL_MESSAGES: Record<number, CBRadioMessage[]> = {
  19: [
    {
      id: 'cb-19-1',
      channel: 19,
      senderHandle: 'Rubber Duck',
      senderUnit: 'UNIT #104-E (Peterbilt 579)',
      role: 'DRIVER',
      text: 'Break one-nine for a radio check! How am I sounding out there on I-80 eastbound?',
      timestamp: '2 mins ago',
      signalStrengthS: 9,
      distanceMiles: 1.4,
      tenCode: '10-36',
      location: 'I-80 Mile Marker 142 EB',
      verified: true,
      audioDurationSec: 4,
    },
    {
      id: 'cb-19-2',
      channel: 19,
      senderHandle: 'Midnight Hauler',
      senderUnit: 'UNIT #208-T (Freightliner Cascadia)',
      role: 'DRIVER',
      text: 'You got me loud and proud, Duck! Wall-to-wall and tree-top tall. Heads up, Smokey sitting in the grass under the overpass at mile 148!',
      timestamp: '1 min ago',
      signalStrengthS: 9,
      distanceMiles: 2.8,
      tenCode: '10-4',
      location: 'I-80 Mile Marker 146 EB',
      verified: true,
      audioDurationSec: 6,
    },
    {
      id: 'cb-19-3',
      channel: 19,
      senderHandle: 'Silver Dollar',
      senderUnit: 'Kenworth W900L',
      role: 'DRIVER',
      text: 'Big alligator in the middle lane just past exit 151. Watch your steer tires, drivers!',
      timestamp: 'Just now',
      signalStrengthS: 8,
      distanceMiles: 4.1,
      tenCode: '10-4',
      location: 'I-80 Mile Marker 151 EB',
      verified: true,
      audioDurationSec: 5,
    },
  ],
  9: [
    {
      id: 'cb-9-1',
      channel: 9,
      senderHandle: 'REACT Dispatch Central',
      senderUnit: 'FCC Emergency Emergency Net',
      role: 'DISPATCH',
      text: 'National Emergency Net Channel 9. Severe thunderstorm and wind advisory on I-70 between Exit 80 and 110. All units reduce speed to 45 MPH.',
      timestamp: '4 mins ago',
      signalStrengthS: 9,
      distanceMiles: 0.5,
      tenCode: '10-33',
      location: 'State Emergency Net Relay',
      verified: true,
      audioDurationSec: 7,
    },
    {
      id: 'cb-9-2',
      channel: 9,
      senderHandle: 'Safety Unit 4',
      senderUnit: 'Incident Command',
      role: 'HIGHWAY_PATROL',
      text: 'Disabled heavy vehicle on right shoulder cleared at Mile 94. All lanes now open.',
      timestamp: '1 min ago',
      signalStrengthS: 8,
      distanceMiles: 3.2,
      tenCode: '10-4',
      location: 'Mile Marker 94',
      verified: true,
      audioDurationSec: 4,
    },
  ],
  17: [
    {
      id: 'cb-17-1',
      channel: 17,
      senderHandle: 'Lone Star Express',
      senderUnit: 'Volvo VNL 860',
      role: 'DRIVER',
      text: 'Southbound I-35 convoy rolling past Waco. Scale house is open and green-lighting PrePass.',
      timestamp: '3 mins ago',
      signalStrengthS: 9,
      distanceMiles: 3.5,
      tenCode: '10-4',
      location: 'I-35 Southbound Waco',
      verified: true,
      audioDurationSec: 5,
    },
    {
      id: 'cb-17-2',
      channel: 17,
      senderHandle: 'Diesel Queen',
      senderUnit: 'Peterbilt 389 Pride',
      role: 'DRIVER',
      text: 'Copy that Lone Star! Got 3 trucks in our pack. Looking for open parking at the TA in Troy.',
      timestamp: 'Just now',
      signalStrengthS: 8,
      distanceMiles: 5.2,
      tenCode: '10-77',
      location: 'I-35 Mile Marker 312',
      verified: true,
      audioDurationSec: 4,
    },
  ],
  11: [
    {
      id: 'cb-11-1',
      channel: 11,
      senderHandle: 'Iron Horse',
      senderUnit: 'Mack Anthem 70-inch',
      role: 'DRIVER',
      text: 'Who has the best homemade pie off I-65 near Bowling Green? Need a good sit-down meal tonight.',
      timestamp: '5 mins ago',
      signalStrengthS: 7,
      distanceMiles: 6.0,
      tenCode: '10-100',
      location: 'I-65 Exit 28',
      verified: true,
      audioDurationSec: 5,
    },
    {
      id: 'cb-11-2',
      channel: 11,
      senderHandle: 'Highway Knight',
      senderUnit: 'International Lonestar',
      role: 'DRIVER',
      text: 'Check out the diner right across from the Petro, driver. Best hot roast beef and cobbler in the state!',
      timestamp: '2 mins ago',
      signalStrengthS: 8,
      distanceMiles: 4.8,
      tenCode: '10-4',
      location: 'I-65 Exit 32',
      verified: true,
      audioDurationSec: 6,
    },
  ],
  6: [
    {
      id: 'cb-6-1',
      channel: 6,
      senderHandle: 'Prime Minister 405',
      senderUnit: '1000W Texas Star Base',
      role: 'DRIVER',
      text: 'AUDDDIOOOO! Break 6 for the Super Bowl! 500 watts pushing skip straight from Dallas up to Chicago! Who is hearing the big rig?',
      timestamp: '1 min ago',
      signalStrengthS: 9,
      distanceMiles: 450,
      tenCode: '10-2',
      location: 'Midwest Atmospheric Skip',
      verified: true,
      audioDurationSec: 6,
    },
  ],
};
