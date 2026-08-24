
## Entitled Index (`/entitled-index`)
Master platform hub: connects all 55 modules, staff alert system, activity log. Also available at `/index`, `/master-hub`, `/entitled`. Stores events in `entitled_index_log` collection.

## Collections Added (latest session)
- `entitled_index_log` — cross-platform activity log (event_type, event_description, affected_module, affected_staff, initiated_by, status, metadata)
- `platform_settings` — key/value store for all API keys and platform config
- `maintenance_records` — MaintEase work orders from DVIR defects
- `mechanic_sessions` — INDEX=MECHANIC session history

## New Pages Added (2026-08-20 — Fleet Memory Intelligence)
- `FleetMemoryPage` — `/fleet-memory` — Cross-fleet intelligence hub: entity lookup (broker/shipper/receiver warnings), file intelligence notes, flagged entity blacklist, top-rated charge stops fleet-wide, live intelligence feed

## New Collections Added (2026-08-20)
- `fleet_intelligence_notes` — complaints/comments about brokers, shippers, receivers (entity_name, entity_type, note_type, severity, note_text, fleet_name, driver_name, load_number, mc_number, resolved)
- `fleet_stop_intelligence` — aggregated cross-fleet charge stop ratings cache
- `road_danger_reports` — community-confirmed dangerous road segments (route_segment, report_type, severity, description, vehicle_type, confirmed_count, dismissed_count)
- `shipper_broker_ratings` — broker/shipper ratings (company_name, company_type, rating, pay_speed, communication, load_accuracy, detention_respect, would_work_again, review_text)
- `user_activity_index` — every user action across all modules (session_id, action_type, module, detail, value, device)
- `saved_routes` — saved charge-stop route plans per session
- `route_stop_feedback` — per-stop thumbs up/down ratings

## Shared Library (2026-08-20)
- `src/lib/fleetMemory.js` — shared utility: logAction(), checkEntityWarnings(), submitEntityNote(), getTopStops(), getWorstEntities(), logStopRating()
  - Import and use logAction(module, actionType, detail) on any page to wire that page into the personal performance index
  - Import checkEntityWarnings(name) anywhere a broker/shipper/receiver name is entered to surface instant warnings
