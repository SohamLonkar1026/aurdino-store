#!/usr/bin/env node

// Simple QR code generator for testing
// Usage: node generate-qr.js [vehicle_id]

import { createHash, createHmac } from 'crypto';

const vehicleId = process.argv[2] || '550e8400-e29b-41d4-a716-446655440000';
const secret = 'default-secret';

// Generate simple QR payload
const simplePayload = vehicleId;

// Generate JSON QR payload with signature
const nonce = Date.now().toString();
const jsonPayload = {
    vehicle_id: vehicleId,
    nonce: nonce
};

// Add HMAC signature
const signature = createHmac('sha256', secret)
    .update(JSON.stringify(jsonPayload))
    .digest('hex');

const signedPayload = {
    ...jsonPayload,
    sig: signature
};

console.log('QR Code Payloads for Testing:');
console.log('============================');
console.log();
console.log('1. Simple format:');
console.log(simplePayload);
console.log();
console.log('2. JSON format:');
console.log(JSON.stringify(jsonPayload));
console.log();
console.log('3. Signed JSON format:');
console.log(JSON.stringify(signedPayload));
console.log();
console.log('Test these payloads by:');
console.log('1. Copy any payload above');
console.log('2. Paste into the manual lookup field in the web interface');
console.log('3. Or use cURL:');
console.log(`   curl -X POST http://localhost:3001/api/scan -H "Content-Type: application/json" -d '{"qr": "${simplePayload}"}'`);
console.log();
console.log('Available test vehicles:');
console.log('- 550e8400-e29b-41d4-a716-446655440000 (ABC-123, John Doe)');
console.log('- 6ba7b810-9dad-11d1-80b4-00c04fd430c8 (XYZ-789, Jane Smith)');
console.log('- simple-vehicle-001 (DEF-456, Bob Johnson)');