#!/usr/bin/env node
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'parking.db');
const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(schemaSql);

const vehicle = {
  vehicle_id: process.env.SEED_VEHICLE_ID || 'DEMO-VEH-123',
  plate: 'ABC-1234',
  owner_name: 'Demo User',
  phone: '+10000000000',
  meta: JSON.stringify({ seeded: true })
};

try {
  const insert = db.prepare(`INSERT INTO vehicles (vehicle_id, plate, owner_name, phone, meta) VALUES (?, ?, ?, ?, ?)`);
  insert.run(vehicle.vehicle_id, vehicle.plate, vehicle.owner_name, vehicle.phone, vehicle.meta);
  console.log('Seeded vehicle:', vehicle.vehicle_id);
} catch (e) {
  if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    console.log('Vehicle already exists:', vehicle.vehicle_id);
  } else {
    console.error('Seeding failed:', e.message);
    process.exit(1);
  }
}

console.log('DB at:', dbPath);
