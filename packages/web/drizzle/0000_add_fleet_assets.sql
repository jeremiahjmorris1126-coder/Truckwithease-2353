CREATE TABLE IF NOT EXISTS fleet_assets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  unit TEXT,
  vin TEXT,
  assigned_to TEXT,
  odometer INTEGER,
  engine_hours REAL,
  document_key TEXT,
  notes TEXT,
  next_service_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS fleet_assets_status_idx ON fleet_assets(status);
CREATE INDEX IF NOT EXISTS fleet_assets_type_idx ON fleet_assets(asset_type);
