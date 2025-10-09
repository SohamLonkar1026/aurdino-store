-- Automatic Parking System Database Schema
-- SQLite compatible schema

-- Table for registered vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT UNIQUE NOT NULL,  -- UUID or registration number from QR code
    plate TEXT NOT NULL,             -- License plate number
    owner_name TEXT NOT NULL,        -- Vehicle owner name
    phone TEXT,                      -- Contact phone number
    meta TEXT,                       -- JSON metadata (vehicle type, color, etc.)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for parking logs (entry/exit records)
CREATE TABLE IF NOT EXISTS parking_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT NOT NULL,        -- References vehicles.vehicle_id
    entry_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time DATETIME,              -- NULL when vehicle is parked, set on exit
    duration_minutes INTEGER,        -- Calculated duration in minutes
    fee_amount DECIMAL(10,2),        -- Calculated parking fee
    status TEXT DEFAULT 'active',   -- 'active', 'completed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    -- Ensure only one active parking session per vehicle
    UNIQUE(vehicle_id, status) ON CONFLICT IGNORE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_id ON vehicles(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_parking_logs_vehicle_id ON parking_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_parking_logs_status ON parking_logs(status);
CREATE INDEX IF NOT EXISTS idx_parking_logs_entry_time ON parking_logs(entry_time);

-- Configuration table for parking rates
CREATE TABLE IF NOT EXISTS parking_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default parking configuration
INSERT OR IGNORE INTO parking_config (config_key, config_value, description) VALUES
('hourly_rate', '5.00', 'Parking fee per hour in currency units'),
('grace_period_minutes', '15', 'Free parking duration in minutes'),
('max_daily_fee', '50.00', 'Maximum fee per 24-hour period');

-- Sample data for testing
INSERT OR IGNORE INTO vehicles (vehicle_id, plate, owner_name, phone, meta) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'ABC-123', 'John Doe', '+1234567890', '{"color": "blue", "type": "sedan"}'),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'XYZ-789', 'Jane Smith', '+0987654321', '{"color": "red", "type": "suv"}'),
('simple-vehicle-001', 'DEF-456', 'Bob Johnson', '+1122334455', '{"color": "white", "type": "hatchback"}');