BEGIN;

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id TEXT NOT NULL UNIQUE,
  plate TEXT,
  owner_name TEXT NOT NULL,
  phone TEXT,
  meta TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS parking_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id TEXT NOT NULL,
  entry_time TEXT NOT NULL,
  exit_time TEXT,
  duration_minutes INTEGER,
  fee_cents INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_parking_logs_vehicle ON parking_logs(vehicle_id);
-- Ensure at most one active log (no exit_time) per vehicle
CREATE UNIQUE INDEX IF NOT EXISTS idx_parking_active ON parking_logs(vehicle_id) WHERE exit_time IS NULL;

COMMIT;
