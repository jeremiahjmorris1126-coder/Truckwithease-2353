ALTER TABLE eld_devices ADD COLUMN IF NOT EXISTS telemetry_token_hash TEXT;
ALTER TABLE eld_devices ADD COLUMN IF NOT EXISTS last_sequence INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS eld_telemetry_receipts (
  id TEXT PRIMARY KEY NOT NULL,
  device_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  payload_hash TEXT NOT NULL,
  telemetry_id TEXT NOT NULL,
  received_at INTEGER NOT NULL,
  CONSTRAINT eld_telemetry_receipts_device_sequence_unique UNIQUE (device_id, sequence)
);
CREATE INDEX IF NOT EXISTS eld_telemetry_receipts_device_idx ON eld_telemetry_receipts(device_id);

CREATE TABLE IF NOT EXISTS eld_duty_events (
  id TEXT PRIMARY KEY NOT NULL,
  driver_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  location TEXT,
  note TEXT,
  source TEXT NOT NULL,
  revision_of TEXT,
  payload_hash TEXT NOT NULL,
  prev_hash TEXT NOT NULL,
  chain_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS eld_duty_events_driver_occurred_idx ON eld_duty_events(driver_id, occurred_at);

CREATE TABLE IF NOT EXISTS eld_log_certifications (
  id TEXT PRIMARY KEY NOT NULL,
  driver_id TEXT NOT NULL,
  period_start INTEGER NOT NULL,
  period_end INTEGER NOT NULL,
  event_chain_head TEXT NOT NULL,
  attestation TEXT NOT NULL,
  certified_by TEXT NOT NULL,
  certified_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS eld_log_certifications_driver_period_idx ON eld_log_certifications(driver_id, period_start, period_end);
