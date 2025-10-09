#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import sqlite3 from 'sqlite3';
import { createHash, createHmac } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = join(__dirname, 'parking.db');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Scan endpoint rate limiting (more restrictive)
const scanLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 scans per minute per IP
    message: { error: 'Too many scan requests, please slow down' }
});

// Database connection
let db;
function initDatabase() {
    if (!existsSync(DB_PATH)) {
        console.error('Database not found. Please run: npm run setup-db');
        process.exit(1);
    }
    
    db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            process.exit(1);
        }
        console.log('Connected to SQLite database');
    });
}

// Utility functions
function parseQRPayload(qrString) {
    try {
        // Try to parse as JSON first
        const parsed = JSON.parse(qrString);
        if (parsed.vehicle_id) {
            return {
                vehicle_id: parsed.vehicle_id,
                nonce: parsed.nonce || null,
                sig: parsed.sig || null
            };
        }
    } catch (e) {
        // If JSON parsing fails, treat as simple vehicle_id string
    }
    
    // Treat as simple vehicle_id string
    return {
        vehicle_id: qrString.trim(),
        nonce: null,
        sig: null
    };
}

function verifyHMACSignature(payload, signature, secret = 'default-secret') {
    if (!signature) return true; // No signature to verify
    
    const expectedSig = createHmac('sha256', secret)
        .update(JSON.stringify({ vehicle_id: payload.vehicle_id, nonce: payload.nonce }))
        .digest('hex');
    
    return signature === expectedSig;
}

function calculateParkingFee(durationMinutes, config) {
    const gracePeriod = parseInt(config.grace_period_minutes) || 15;
    const hourlyRate = parseFloat(config.hourly_rate) || 5.0;
    const maxDailyFee = parseFloat(config.max_daily_fee) || 50.0;
    
    if (durationMinutes <= gracePeriod) {
        return 0;
    }
    
    // Calculate fee: ceil(duration/60) * hourly_rate
    const billableHours = Math.ceil((durationMinutes - gracePeriod) / 60);
    const fee = billableHours * hourlyRate;
    
    return Math.min(fee, maxDailyFee);
}

// Database helper functions
function getVehicle(vehicleId) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM vehicles WHERE vehicle_id = ?',
            [vehicleId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

function getActiveParkingLog(vehicleId) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM parking_logs WHERE vehicle_id = ? AND status = "active" AND exit_time IS NULL',
            [vehicleId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

function getParkingConfig() {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT config_key, config_value FROM parking_config',
            (err, rows) => {
                if (err) reject(err);
                else {
                    const config = {};
                    rows.forEach(row => {
                        config[row.config_key] = row.config_value;
                    });
                    resolve(config);
                }
            }
        );
    });
}

function createParkingEntry(vehicleId) {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db.run(
            'INSERT INTO parking_logs (vehicle_id, entry_time, status) VALUES (?, ?, "active")',
            [vehicleId, now],
            function(err) {
                if (err) reject(err);
                else {
                    db.get(
                        'SELECT * FROM parking_logs WHERE id = ?',
                        [this.lastID],
                        (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        }
                    );
                }
            }
        );
    });
}

function completeParkingExit(logId, durationMinutes, fee) {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db.run(
            'UPDATE parking_logs SET exit_time = ?, duration_minutes = ?, fee_amount = ?, status = "completed", updated_at = ? WHERE id = ?',
            [now, durationMinutes, fee, now, logId],
            function(err) {
                if (err) reject(err);
                else {
                    db.get(
                        'SELECT * FROM parking_logs WHERE id = ?',
                        [logId],
                        (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        }
                    );
                }
            }
        );
    });
}

// API Routes

/**
 * POST /api/scan
 * Main QR code scanning endpoint
 */
app.post('/api/scan', scanLimiter, async (req, res) => {
    try {
        const { qr } = req.body;
        
        if (!qr) {
            return res.status(400).json({ 
                error: 'Missing QR code data',
                message: 'Please provide QR code content in the request body'
            });
        }

        // Parse QR payload
        const payload = parseQRPayload(qr);
        
        if (!payload.vehicle_id) {
            return res.status(400).json({ 
                error: 'Invalid QR format',
                message: 'QR code must contain vehicle_id'
            });
        }

        // Verify HMAC signature if present
        if (!verifyHMACSignature(payload, payload.sig)) {
            return res.status(401).json({ 
                error: 'Invalid signature',
                message: 'QR code signature verification failed'
            });
        }

        // Check if vehicle is registered
        const vehicle = await getVehicle(payload.vehicle_id);
        if (!vehicle) {
            return res.status(404).json({ 
                error: 'Vehicle not registered',
                message: `Vehicle ${payload.vehicle_id} is not registered in the system`
            });
        }

        // Check for active parking session
        const activeLog = await getActiveParkingLog(payload.vehicle_id);
        const config = await getParkingConfig();

        if (activeLog) {
            // Vehicle is exiting
            const entryTime = new Date(activeLog.entry_time);
            const exitTime = new Date();
            const durationMinutes = Math.floor((exitTime - entryTime) / (1000 * 60));
            const fee = calculateParkingFee(durationMinutes, config);

            const completedLog = await completeParkingExit(activeLog.id, durationMinutes, fee);

            res.json({
                action: 'exit',
                vehicle_id: payload.vehicle_id,
                vehicle: {
                    plate: vehicle.plate,
                    owner_name: vehicle.owner_name
                },
                parking_session: {
                    entry_time: completedLog.entry_time,
                    exit_time: completedLog.exit_time,
                    duration_minutes: completedLog.duration_minutes,
                    fee_amount: completedLog.fee_amount
                },
                message: `Vehicle ${vehicle.plate} exited. Duration: ${durationMinutes} minutes, Fee: $${fee.toFixed(2)}`
            });
        } else {
            // Vehicle is entering
            const newLog = await createParkingEntry(payload.vehicle_id);

            res.json({
                action: 'entry',
                vehicle_id: payload.vehicle_id,
                vehicle: {
                    plate: vehicle.plate,
                    owner_name: vehicle.owner_name
                },
                parking_session: {
                    entry_time: newLog.entry_time,
                    session_id: newLog.id
                },
                message: `Vehicle ${vehicle.plate} entered parking at ${new Date(newLog.entry_time).toLocaleString()}`
            });
        }

    } catch (error) {
        console.error('Scan endpoint error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'An error occurred while processing the scan'
        });
    }
});

/**
 * POST /api/register-vehicle
 * Register a new vehicle
 */
app.post('/api/register-vehicle', async (req, res) => {
    try {
        const { vehicle_id, plate, owner_name, phone, meta } = req.body;

        // Validation
        if (!vehicle_id || !plate || !owner_name) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'vehicle_id, plate, and owner_name are required'
            });
        }

        const metaJson = meta ? JSON.stringify(meta) : null;
        const now = new Date().toISOString();

        db.run(
            'INSERT INTO vehicles (vehicle_id, plate, owner_name, phone, meta, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [vehicle_id, plate, owner_name, phone || null, metaJson, now, now],
            function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ 
                            error: 'Vehicle already registered',
                            message: `Vehicle ${vehicle_id} is already registered`
                        });
                    }
                    console.error('Database error:', err);
                    return res.status(500).json({ 
                        error: 'Database error',
                        message: 'Failed to register vehicle'
                    });
                }

                res.status(201).json({
                    message: 'Vehicle registered successfully',
                    vehicle: {
                        id: this.lastID,
                        vehicle_id,
                        plate,
                        owner_name,
                        phone,
                        meta: meta || null
                    }
                });
            }
        );

    } catch (error) {
        console.error('Register vehicle error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'An error occurred while registering the vehicle'
        });
    }
});

/**
 * GET /api/logs
 * Get parking logs for a vehicle
 */
app.get('/api/logs', (req, res) => {
    try {
        const { vehicle_id, limit = 50, offset = 0 } = req.query;

        if (!vehicle_id) {
            return res.status(400).json({ 
                error: 'Missing vehicle_id parameter',
                message: 'Please provide vehicle_id as query parameter'
            });
        }

        db.all(
            'SELECT * FROM parking_logs WHERE vehicle_id = ? ORDER BY entry_time DESC LIMIT ? OFFSET ?',
            [vehicle_id, parseInt(limit), parseInt(offset)],
            (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ 
                        error: 'Database error',
                        message: 'Failed to retrieve parking logs'
                    });
                }

                res.json({
                    vehicle_id,
                    logs: rows,
                    count: rows.length
                });
            }
        );

    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'An error occurred while retrieving logs'
        });
    }
});

/**
 * GET /api/vehicles
 * Get all registered vehicles (for admin/testing)
 */
app.get('/api/vehicles', (req, res) => {
    db.all('SELECT * FROM vehicles ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Database error',
                message: 'Failed to retrieve vehicles'
            });
        }

        res.json({
            vehicles: rows,
            count: rows.length
        });
    });
});

/**
 * GET /api/config
 * Get parking configuration
 */
app.get('/api/config', async (req, res) => {
    try {
        const config = await getParkingConfig();
        res.json({ config });
    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to retrieve configuration'
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve the React app
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Start server
initDatabase();
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Parking system server running on http://0.0.0.0:${PORT}`);
    console.log(`Also accessible at http://localhost:${PORT}`);
    console.log('API endpoints:');
    console.log('  POST /api/scan - QR code scanning');
    console.log('  POST /api/register-vehicle - Register new vehicle');
    console.log('  GET /api/logs?vehicle_id=<id> - Get parking logs');
    console.log('  GET /api/vehicles - List all vehicles');
    console.log('  GET /api/config - Get parking configuration');
    console.log('  GET /api/health - Health check');
});