#!/usr/bin/env node

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_PORT = 3002;
const TEST_DB_PATH = join(__dirname, '..', 'test-parking.db');
const BASE_URL = `http://localhost:${TEST_PORT}`;

let serverProcess;

// Test utilities
async function makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    const data = await response.json();
    return { response, data };
}

// Setup test database and server
before(async () => {
    // Clean up any existing test database
    if (existsSync(TEST_DB_PATH)) {
        unlinkSync(TEST_DB_PATH);
    }
    
    // Setup test database
    const setupProcess = spawn('node', ['setup-db.js'], {
        cwd: join(__dirname, '..'),
        env: { ...process.env, DB_PATH: TEST_DB_PATH },
        stdio: 'pipe'
    });
    
    await new Promise((resolve, reject) => {
        setupProcess.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Database setup failed with code ${code}`));
        });
    });
    
    // Start test server
    serverProcess = spawn('node', ['server.js'], {
        cwd: join(__dirname, '..'),
        env: { 
            ...process.env, 
            PORT: TEST_PORT,
            DB_PATH: TEST_DB_PATH
        },
        stdio: 'pipe'
    });
    
    // Wait for server to start
    await new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
});

// Helper function to clear active parking sessions
async function clearActiveSessions() {
    try {
        await makeRequest('/api/scan', {
            method: 'POST',
            body: JSON.stringify({ qr: 'clear-test-sessions' })
        });
    } catch (e) {
        // Ignore errors - this is just cleanup
    }
}

// Cleanup after tests
after(() => {
    if (serverProcess) {
        serverProcess.kill();
    }
    
    // Clean up test database
    if (existsSync(TEST_DB_PATH)) {
        unlinkSync(TEST_DB_PATH);
    }
});

describe('Parking System API Tests', () => {
    
    describe('Health Check', () => {
        test('GET /api/health should return healthy status', async () => {
            const { response, data } = await makeRequest('/api/health');
            
            assert.strictEqual(response.status, 200);
            assert.strictEqual(data.status, 'healthy');
            assert(data.timestamp);
            assert(typeof data.uptime === 'number');
        });
    });
    
    describe('Vehicle Registration', () => {
        test('POST /api/register-vehicle should register a new vehicle', async () => {
            const vehicleData = {
                vehicle_id: `test-vehicle-${Date.now()}`,
                plate: 'TEST-001',
                owner_name: 'Test Owner',
                phone: '+1234567890',
                meta: { color: 'blue', type: 'sedan' }
            };
            
            const { response, data } = await makeRequest('/api/register-vehicle', {
                method: 'POST',
                body: JSON.stringify(vehicleData)
            });
            
            assert.strictEqual(response.status, 201);
            assert.strictEqual(data.message, 'Vehicle registered successfully');
            assert.strictEqual(data.vehicle.vehicle_id, vehicleData.vehicle_id);
            assert.strictEqual(data.vehicle.plate, vehicleData.plate);
        });
        
        test('POST /api/register-vehicle should reject duplicate vehicle_id', async () => {
            const uniqueId = `test-vehicle-dup-${Date.now()}`;
            
            // First registration
            await makeRequest('/api/register-vehicle', {
                method: 'POST',
                body: JSON.stringify({
                    vehicle_id: uniqueId,
                    plate: 'TEST-DUP-1',
                    owner_name: 'First Owner'
                })
            });
            
            // Duplicate registration
            const vehicleData = {
                vehicle_id: uniqueId, // Same as above
                plate: 'TEST-DUP-2',
                owner_name: 'Another Owner'
            };
            
            const { response, data } = await makeRequest('/api/register-vehicle', {
                method: 'POST',
                body: JSON.stringify(vehicleData)
            });
            
            assert.strictEqual(response.status, 409);
            assert.strictEqual(data.error, 'Vehicle already registered');
        });
        
        test('POST /api/register-vehicle should reject missing required fields', async () => {
            const vehicleData = {
                vehicle_id: 'test-vehicle-002'
                // Missing plate and owner_name
            };
            
            const { response, data } = await makeRequest('/api/register-vehicle', {
                method: 'POST',
                body: JSON.stringify(vehicleData)
            });
            
            assert.strictEqual(response.status, 400);
            assert.strictEqual(data.error, 'Missing required fields');
        });
    });
    
    describe('QR Code Scanning', () => {
        test('POST /api/scan should handle vehicle entry (simple vehicle_id)', async () => {
            // Use one of the sample vehicles from schema.sql
            const scanData = {
                qr: 'simple-vehicle-001'
            };
            
            const { response, data } = await makeRequest('/api/scan', {
                method: 'POST',
                body: JSON.stringify(scanData)
            });
            
            assert.strictEqual(response.status, 200);
            assert.strictEqual(data.action, 'entry');
            assert.strictEqual(data.vehicle_id, scanData.qr);
            assert.strictEqual(data.vehicle.plate, 'DEF-456');
            assert(data.parking_session.entry_time);
            assert(data.message.includes('entered parking'));
        });
        
        test('POST /api/scan should handle vehicle exit', async () => {
            // Scan the same vehicle again for exit
            const scanData = {
                qr: 'simple-vehicle-001'
            };
            
            const { response, data } = await makeRequest('/api/scan', {
                method: 'POST',
                body: JSON.stringify(scanData)
            });
            
            assert.strictEqual(response.status, 200);
            assert.strictEqual(data.action, 'exit');
            assert.strictEqual(data.vehicle_id, scanData.qr);
            assert(data.parking_session.exit_time);
            assert(typeof data.parking_session.duration_minutes === 'number');
            assert(typeof data.parking_session.fee_amount === 'number');
            assert(data.message.includes('exited'));
        });
        
        test('POST /api/scan should handle JSON QR format', async () => {
            const qrPayload = {
                vehicle_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                nonce: 'test-nonce-123'
            };
            
            const scanData = {
                qr: JSON.stringify(qrPayload)
            };
            
            const { response, data } = await makeRequest('/api/scan', {
                method: 'POST',
                body: JSON.stringify(scanData)
            });
            
            assert.strictEqual(response.status, 200);
            assert.strictEqual(data.action, 'entry');
            assert.strictEqual(data.vehicle_id, qrPayload.vehicle_id);
            assert.strictEqual(data.vehicle.plate, 'XYZ-789');
        });
        
        test('POST /api/scan should reject unregistered vehicle', async () => {
            const scanData = {
                qr: 'unregistered-vehicle-123'
            };
            
            const { response, data } = await makeRequest('/api/scan', {
                method: 'POST',
                body: JSON.stringify(scanData)
            });
            
            assert.strictEqual(response.status, 404);
            assert.strictEqual(data.error, 'Vehicle not registered');
        });
        
        test('POST /api/scan should reject missing QR data', async () => {
            const { response, data } = await makeRequest('/api/scan', {
                method: 'POST',
                body: JSON.stringify({})
            });
            
            assert.strictEqual(response.status, 400);
            assert.strictEqual(data.error, 'Missing QR code data');
        });
    });
    
    describe('Parking Logs', () => {
        test('GET /api/logs should return parking logs for a vehicle', async () => {
            const vehicleId = '550e8400-e29b-41d4-a716-446655440000';
            
            const { response, data } = await makeRequest(`/api/logs?vehicle_id=${vehicleId}`);
            
            assert.strictEqual(response.status, 200);
            assert.strictEqual(data.vehicle_id, vehicleId);
            assert(Array.isArray(data.logs));
            assert(data.logs.length > 0); // Should have logs from previous tests
            assert(typeof data.count === 'number');
        });
        
        test('GET /api/logs should require vehicle_id parameter', async () => {
            const { response, data } = await makeRequest('/api/logs');
            
            assert.strictEqual(response.status, 400);
            assert.strictEqual(data.error, 'Missing vehicle_id parameter');
        });
    });
    
    describe('Vehicle Listing', () => {
        test('GET /api/vehicles should return all registered vehicles', async () => {
            const { response, data } = await makeRequest('/api/vehicles');
            
            assert.strictEqual(response.status, 200);
            assert(Array.isArray(data.vehicles));
            assert(data.vehicles.length >= 3); // Sample vehicles + test vehicle
            assert(typeof data.count === 'number');
        });
    });
    
    describe('Configuration', () => {
        test('GET /api/config should return parking configuration', async () => {
            const { response, data } = await makeRequest('/api/config');
            
            assert.strictEqual(response.status, 200);
            assert(data.config);
            assert(data.config.hourly_rate);
            assert(data.config.grace_period_minutes);
            assert(data.config.max_daily_fee);
        });
    });
    
    describe('Entry-Exit Flow Integration', () => {
        test('Complete parking session flow', async () => {
            const vehicleId = '550e8400-e29b-41d4-a716-446655440000';
            
            // Entry scan
            const entryResult = await makeRequest('/api/scan', {
                method: 'POST',
                body: JSON.stringify({ qr: vehicleId })
            });
            
            assert.strictEqual(entryResult.response.status, 200);
            assert.strictEqual(entryResult.data.action, 'entry');
            
            // Wait a moment to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Exit scan
            const exitResult = await makeRequest('/api/scan', {
                method: 'POST',
                body: JSON.stringify({ qr: vehicleId })
            });
            
            assert.strictEqual(exitResult.response.status, 200);
            assert.strictEqual(exitResult.data.action, 'exit');
            assert(exitResult.data.parking_session.duration_minutes >= 0);
            assert(exitResult.data.parking_session.fee_amount >= 0);
            
            // Verify logs
            const logsResult = await makeRequest(`/api/logs?vehicle_id=${vehicleId}`);
            assert.strictEqual(logsResult.response.status, 200);
            assert(logsResult.data.logs.length > 0);
            
            const latestLog = logsResult.data.logs[0];
            assert.strictEqual(latestLog.status, 'completed');
            assert(latestLog.exit_time);
            assert(latestLog.duration_minutes >= 0);
        });
    });
});

console.log('Running parking system tests...');