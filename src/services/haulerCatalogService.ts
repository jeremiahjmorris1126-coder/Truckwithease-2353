// =========================================================================
// HAULER SPECIFICATION & DOT / FMCSA COMPLIANCE CATALOG
// Unifies all commercial motor vehicle types subject to DOT & FMCSA regulations:
// - Flatbed Haulers (48'/53' Deck, Step-Deck, RGN)
// - Dry Van Haulers (53' Freight, E-Track, Swing/Roll-up Doors)
// - Box Trucks (16'-26' Straight Trucks, Liftgates, Dock-High, Non-CDL & Class B)
// - Cargo / Sprinter Vans (Interstate Commercial 10,001+ lbs GVWR, HazMat)
// - Reefer Haulers (53' Temperature-Controlled, FSMA Rules)
// - Hotshot Flatbeds (Class 3-5 Pickup + Gooseneck Deck)
// =========================================================================

import { HaulerType, HaulerSpecification } from '../types';

export const HAULER_CATALOG: HaulerSpecification[] = [
  {
    id: 'FLATBED',
    name: 'Flatbed Hauler (48\' / 53\' Deck & Step-Deck)',
    shortLabel: 'Flatbed',
    dotTier: 'CLASS_A_COMBINATION',
    gvwrRange: '80,000 lbs Max Gross (Steer: 12k, Drive: 34k, Tandem: 34k)',
    cdlRequired: true,
    regulationsSummary:
      'Subject to FMCSA 49 CFR § 393.100 - § 393.136 (Cargo Securement Standard). Mandates minimum working load limit (WLL) of at least 50% of cargo weight, minimum 2 tiedowns for first 10 ft + 1 tiedown for every 10 ft thereafter, headerboard/headache rack verification, edge protectors for straps, steel coil bunks, and tarp securement.',
    dvirSpecialChecks: [
      'Winches, ratchets, and sliding track integrity',
      '4-inch nylon straps (zero tears, cuts, or frayed webbing)',
      'Grade 70 transport chains and lever/ratchet binders',
      'Bulkhead / headache rack certification plate intact',
      'Coil racks, dunnage timbers, and friction mats',
      'Oversize load warning flags and strobe light mounts',
    ],
    hosRuleVariant: 'Standard 49 CFR § 395.3 (11h Drive / 14h Shift / 70h 8-Day Cycle with 34h Reset)',
    equipmentExamples: ['48\' All-Aluminum Flatbed', '53\' Step-Deck with Ramps', 'Removable Gooseneck (RGN) Lowboy'],
  },
  {
    id: 'DRY_VAN',
    name: 'Dry Van Hauler (53\' General Freight Enclosed)',
    shortLabel: 'Dry Van',
    dotTier: 'CLASS_A_COMBINATION',
    gvwrRange: '80,000 lbs Max Gross (53ft tandem slider 40ft KPRA rule)',
    cdlRequired: true,
    regulationsSummary:
      'Subject to 49 CFR Part 393 Cargo Securement, California 40-foot Kingpin-to-Rear-Axle (KPRA) law, rear underride guard (49 CFR § 393.86), sliding tandem lock pins engagement, rear door latch security, and mandatory Bill of Lading seals.',
    dvirSpecialChecks: [
      'Sliding tandem air-pin locking mechanism fully seated in rail holes',
      'Rear swing door hinges, hold-backs, and tamper-evident bolt seal',
      'Rear roll-up door spring counter-balance and pull strap',
      'Interior E-Track horizontal rails and vertical logistical posts',
      'Load lock bars (minimum 2 locked against cargo)',
      'Roof aluminum/fiberglass sheet (zero leaks or light penetration)',
    ],
    hosRuleVariant: 'Standard 49 CFR § 395.3 (11h Drive / 14h Shift / 70h Cycle with Split-Sleeper 8/2 or 7/3)',
    equipmentExamples: ['53\' Dry Freight Van with Tandem Slider', '48\' Local P&D Dry Van', 'High-Cube Logistics Van'],
  },
  {
    id: 'BOX_TRUCK',
    name: 'Box Truck Hauler (16\' - 26\' Straight Truck / Liftgate)',
    shortLabel: 'Box Truck',
    dotTier: 'NON_CDL_INTERSTATE_10K_PLUS',
    gvwrRange: '10,001 - 26,000 lbs (Non-CDL) or 26,001+ lbs (Class B CDL)',
    cdlRequired: false, // Non-CDL version (<26,001 lbs) is popular for interstate commerce
    regulationsSummary:
      'Commercial box trucks operating in interstate commerce exceeding 10,001 lbs GVWR MUST comply with federal DOT regulations: USDOT number on power unit, DOT Medical Card (MCSA-5876), complete Driver Qualification File (DQF), daily DVIR (49 CFR § 396.11), annual vehicle inspection, and HOS logs. Eligible for 150-air-mile short-haul exemption (49 CFR § 395.1(e)(1)) if returning to normal work reporting location within 14 hours.',
    dvirSpecialChecks: [
      'Hydraulic tuck-under or rail-gate liftgate pump and cylinder hoses',
      'Liftgate emergency cutoff switch and dual latch chains',
      'Roll-up rear door track rollers, cables, and padlock latch',
      'Curbside side door safety latch and internal exit release',
      'Cargo retention nylon netting and floor tie-down anchors',
      'Wheel chocks and dock-leveler bumper blocks',
    ],
    hosRuleVariant: 'Eligible for 150 Air-Mile Short-Haul Exemption (14h duty window without ELD) or Standard ELD',
    equipmentExamples: ['26\' Freightliner M2-106 Straight Truck', '24\' International MV Series', '18\' Hino Dock-High Liftgate'],
  },
  {
    id: 'CARGO_VAN',
    name: 'Cargo / Sprinter Van (Interstate Commercial 10,001+ lbs / HazMat)',
    shortLabel: 'Cargo / Sprinter Van',
    dotTier: 'NON_CDL_INTERSTATE_10K_PLUS',
    gvwrRange: '10,001 - 14,000 lbs GVWR (Class 2b/3 Commercial Interstate)',
    cdlRequired: false, // CDL only required if transporting placarded hazmat or 16+ passengers
    regulationsSummary:
      'Any cargo van, sprinter van, or high-roof commercial van with a Gross Vehicle Weight Rating (GVWR) of 10,001 lbs or more operating across state lines is classified as a Commercial Motor Vehicle (CMV) under 49 CFR § 390.5. Requires USDOT registration, driver medical certificate, DQF file, post-trip inspection, fire extinguisher, warning triangles, and adherence to HOS rules (or short-haul timecard records).',
    dvirSpecialChecks: [
      'Steel or composite safety bulkhead cab partition',
      'Sliding side door roller tracks and secondary safety latch',
      'Rear 270-degree barn doors and mechanical magnetic door checks',
      'Cargo floor D-ring tiedown ratings and friction rubber flooring',
      'Emergency roadside kit (5 B:C fire extinguisher + 3 reflective triangles)',
      'Tire load rating: Minimum Load Range E (10-ply) cold inflation PSI',
    ],
    hosRuleVariant: '150 Air-Mile Short-Haul Exemption (Timecard) or Mobile ELD App Log',
    equipmentExamples: ['Mercedes Sprinter 3500 High-Roof', 'Ford Transit 350 Extended Dually', 'RAM ProMaster 3500 Cargo'],
  },
  {
    id: 'REEFER',
    name: 'Reefer Hauler (53\' Temperature-Controlled)',
    shortLabel: 'Refrigerated Van',
    dotTier: 'CLASS_A_COMBINATION',
    gvwrRange: '80,000 lbs Max Gross',
    cdlRequired: true,
    regulationsSummary:
      'Governed by FDA Food Safety Modernization Act (FSMA Sanitary Transportation Rule 21 CFR Part 1 Subpart O) and FMCSA 49 CFR Part 393/395. Requires continuous temperature data logging, pre-cooling verification, reefer diesel tank inspection (separate from tractor), clean washed out trailer floor, and air duct chute integrity.',
    dvirSpecialChecks: [
      'Thermo King / Carrier refrigeration microprocessor controller display',
      'Reefer independent 50-gallon diesel tank level and fuel cap seal',
      'Overhead vinyl air distribution chute (zero rips or detachment)',
      'Trailer floor grooved aluminum duct clean washout condition',
      'Rear cargo door dual-compression perimeter rubber gaskets',
      'Defrost cycle drain tubes clear of ice blockage',
    ],
    hosRuleVariant: 'Standard 49 CFR § 395.3 with Split-Sleeper Berth Support',
    equipmentExamples: ['53\' Utility 3000R with Thermo King Precedent', '53\' Great Dane Everest Carrier X4'],
  },
  {
    id: 'HOTSHOT_FLATBED',
    name: 'Hotshot Flatbed Hauler (Class 3-5 Pickup + Gooseneck Trailer)',
    shortLabel: 'Hotshot',
    dotTier: 'NON_CDL_INTERSTATE_10K_PLUS',
    gvwrRange: 'Combined GCWR 26,000 lbs (Non-CDL) or 30,000 - 40,000 lbs (Class A CDL)',
    cdlRequired: false, // Non-CDL if GCWR <= 26,000 lbs; Class A if GCWR > 26,000 lbs
    regulationsSummary:
      'Hotshot rigs consisting of a dual rear wheel heavy-duty pickup truck (Ford F-350/F-450, Ram 3500/5500) and a 30\'-40\' gooseneck flatbed trailer are subject to FMCSA 49 CFR regulations. Must have USDOT & MC authority, IFTA decals, 49 CFR § 393.100 cargo securement gear, electric-over-hydraulic trailer brakes with break-away battery switch, and certified tie-downs.',
    dvirSpecialChecks: [
      'Gooseneck 2-5/16" ball coupler and safety lock pin',
      'Dual 3/8" Grade 70 safety chains with latching hooks',
      'Trailer emergency breakaway switch pin and battery charge level',
      'Electric trailer brake controller synchronization and gain check',
      '4-inch strap winches, chain binders, and corner protectors',
      'Trailer tandem dual wheels and suspension equalizer springs',
    ],
    hosRuleVariant: 'Standard 49 CFR § 395 ELD or 150 Air-Mile Short-Haul Exemption',
    equipmentExamples: ['Ram 3500 Dually + 40\' PJ Gooseneck Flatbed', 'Ford F-450 + 36\' Big Tex Low Profile Deck'],
  },
];

export function getHaulerSpecification(type: HaulerType): HaulerSpecification {
  return HAULER_CATALOG.find((h) => h.id === type) || HAULER_CATALOG[0];
}

export function getAllHaulersList(): HaulerSpecification[] {
  return HAULER_CATALOG;
}
