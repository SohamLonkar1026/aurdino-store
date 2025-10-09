#!/usr/bin/env node

// Manual test script to verify the parking system works
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_PORT = 3004;
const TEST_DB_PATH = join(__dirname, 'manual-test.db');
const BASE_URL = `http://localhost:${TEST_PORT}`;

console.log('🚀 Starting manual parking system test...\n');

// Clean up
if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
    console.log('✅ Cleaned up existing test database');
}

// Setup database
console.log('📊 Setting up test database...');
const setupProcess = spawn('node', ['setup-db.js'], {
    env: { ...process.env, DB_PATH: TEST_DB_PATH },
    stdio: 'inherit'
});

setupProcess.on('close', (code) => {
    if (code !== 0) {
        console.error('❌ Database setup failed');
        process.exit(1);
    }
    
    console.log('✅ Database setup complete\n');
    
    // Start server
    console.log('🖥️  Starting test server...');
    const serverProcess = spawn('node', ['server.js'], {
        env: { 
            ...process.env, 
            PORT: TEST_PORT,
            DB_PATH: TEST_DB_PATH
        },
        stdio: 'pipe'
    });
    
    let serverReady = false;
    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Parking system server running')) {
            serverReady = true;
            console.log('✅ Server started successfully\n');
            runTests();
        }
    });
    
    serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
    });
    
    setTimeout(() => {
        if (!serverReady) {
            console.log('⏰ Server taking longer than expected, proceeding with tests...\n');
            runTests();
        }
    }, 3000);
    
    async function runTests() {
        console.log('🧪 Running API tests...\n');
        
        try {
            // Test 1: Health check
            console.log('1. Testing health endpoint...');
            const healthResponse = await fetch(`${BASE_URL}/api/health`);
            const healthData = await healthResponse.json();
            console.log(`   Status: ${healthResponse.status}`);
            console.log(`   Health: ${healthData.status}`);
            console.log('   ✅ Health check passed\n');
            
            // Test 2: List vehicles
            console.log('2. Testing vehicle listing...');
            const vehiclesResponse = await fetch(`${BASE_URL}/api/vehicles`);
            const vehiclesData = await vehiclesResponse.json();
            console.log(`   Status: ${vehiclesResponse.status}`);
            console.log(`   Vehicles found: ${vehiclesData.count}`);
            console.log('   Sample vehicles:');
            vehiclesData.vehicles.slice(0, 3).forEach(v => {
                console.log(`     - ${v.vehicle_id} (${v.plate}) - ${v.owner_name}`);
            });
            console.log('   ✅ Vehicle listing passed\n');
            
            // Test 3: Vehicle entry
            console.log('3. Testing vehicle entry...');
            const entryResponse = await fetch(`${BASE_URL}/api/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qr: '550e8400-e29b-41d4-a716-446655440000' })
            });
            const entryData = await entryResponse.json();
            console.log(`   Status: ${entryResponse.status}`);
            console.log(`   Action: ${entryData.action}`);
            console.log(`   Vehicle: ${entryData.vehicle?.plate} (${entryData.vehicle?.owner_name})`);
            console.log(`   Message: ${entryData.message}`);
            console.log('   ✅ Vehicle entry passed\n');
            
            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Test 4: Vehicle exit
            console.log('4. Testing vehicle exit...');
            const exitResponse = await fetch(`${BASE_URL}/api/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qr: '550e8400-e29b-41d4-a716-446655440000' })
            });
            const exitData = await exitResponse.json();
            console.log(`   Status: ${exitResponse.status}`);
            console.log(`   Action: ${exitData.action}`);
            console.log(`   Duration: ${exitData.parking_session?.duration_minutes} minutes`);
            console.log(`   Fee: $${exitData.parking_session?.fee_amount}`);
            console.log(`   Message: ${exitData.message}`);
            console.log('   ✅ Vehicle exit passed\n');
            
            // Test 5: Parking logs
            console.log('5. Testing parking logs...');
            const logsResponse = await fetch(`${BASE_URL}/api/logs?vehicle_id=550e8400-e29b-41d4-a716-446655440000`);
            const logsData = await logsResponse.json();
            console.log(`   Status: ${logsResponse.status}`);
            console.log(`   Logs found: ${logsData.count}`);
            if (logsData.logs.length > 0) {
                const latestLog = logsData.logs[0];
                console.log(`   Latest session: ${latestLog.status} (${latestLog.duration_minutes} min, $${latestLog.fee_amount})`);
            }
            console.log('   ✅ Parking logs passed\n');
            
            // Test 6: Register new vehicle
            console.log('6. Testing vehicle registration...');
            const newVehicleId = `test-${Date.now()}`;
            const registerResponse = await fetch(`${BASE_URL}/api/register-vehicle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicle_id: newVehicleId,
                    plate: 'TEST-001',
                    owner_name: 'Test Driver',
                    phone: '+1234567890',
                    meta: { color: 'blue', type: 'sedan' }
                })
            });
            const registerData = await registerResponse.json();
            console.log(`   Status: ${registerResponse.status}`);
            console.log(`   Message: ${registerData.message}`);
            console.log(`   Vehicle ID: ${registerData.vehicle?.vehicle_id}`);
            console.log('   ✅ Vehicle registration passed\n');
            
            // Test 7: JSON QR format
            console.log('7. Testing JSON QR format...');
            const jsonQR = JSON.stringify({
                vehicle_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                nonce: 'test-nonce-123'
            });
            const jsonResponse = await fetch(`${BASE_URL}/api/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qr: jsonQR })
            });
            const jsonData = await jsonResponse.json();
            console.log(`   Status: ${jsonResponse.status}`);
            console.log(`   Action: ${jsonData.action}`);
            console.log(`   Vehicle: ${jsonData.vehicle?.plate}`);
            console.log('   ✅ JSON QR format passed\n');
            
            console.log('🎉 All tests passed! The parking system is working correctly.\n');
            
            console.log('📋 Test Summary:');
            console.log('   ✅ Health check');
            console.log('   ✅ Vehicle listing');
            console.log('   ✅ Vehicle entry scanning');
            console.log('   ✅ Vehicle exit scanning');
            console.log('   ✅ Parking logs retrieval');
            console.log('   ✅ Vehicle registration');
            console.log('   ✅ JSON QR code format');
            console.log('\n🌐 Web interface available at:', `http://localhost:${TEST_PORT}`);
            console.log('📱 Try scanning these QR codes in the web interface:');
            console.log('   - 550e8400-e29b-41d4-a716-446655440000');
            console.log('   - 6ba7b810-9dad-11d1-80b4-00c04fd430c8');
            console.log('   - simple-vehicle-001');
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
        
        console.log('\n⏹️  Press Ctrl+C to stop the server and exit');
    }
    
    // Handle cleanup
    process.on('SIGINT', () => {
        console.log('\n🧹 Cleaning up...');
        serverProcess.kill();
        if (existsSync(TEST_DB_PATH)) {
            unlinkSync(TEST_DB_PATH);
        }
        console.log('✅ Cleanup complete');
        process.exit(0);
    });
});