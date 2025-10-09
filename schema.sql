PRAGMA foreign_keys = ON;

-- Vehicles registered to use the parking lot
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id TEXT PRIMARY KEY,
  plate TEXT NOT NULL,
  owner_name TEXT,
  phone TEXT,
  meta TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Parking logs for entries and exits
CREATE TABLE IF NOT EXISTS parking_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id TEXT NOT NULL,
  entry_time TEXT NOT NULL,
  exit_time TEXT,
  duration_minutes INTEGER,
  fee_cents INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
);

-- Ensure only one active log (exit_time IS NULL) per vehicle
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_log_per_vehicle
ON parking_logs(vehicle_id)
WHERE exit_time IS NULL;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_logs_vehicle ON parking_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_logs_entry_time ON parking_logs(entry_time);
CREATE INDEX IF NOT EXISTS idx_logs_exit_time ON parking_logs(exit_time);
