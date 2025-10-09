import assert from 'node:assert/strict';
import { describe, it, before } from 'node:test';
import Database from 'better-sqlite3';
import {
  initDb,
  parseQrPayload,
  verifySignature,
  computeFeeCents,
  processScan,
} from '../server.js';

describe('QR parsing and scan logic (unit)', () => {
  let db;

  before(() => {
    db = new Database(':memory:');
    initDb(db);
  });

  it('parses plain string QR as vehicle_id', () => {
    const parsed = parseQrPayload('CAR-123');
    assert.equal(parsed.vehicle_id, 'CAR-123');
  });

  it('parses JSON string QR', () => {
    const payload = JSON.stringify({ vehicle_id: 'UUID-1', nonce: 'n1' });
    const parsed = parseQrPayload(payload);
    assert.equal(parsed.vehicle_id, 'UUID-1');
    assert.equal(parsed.nonce, 'n1');
  });

  it('signature present without secret errors', () => {
    const r = verifySignature({ vehicle_id: 'X', nonce: 'n', sig: 'abcd' });
    assert.equal(r.ok, false);
  });

  it('computes hourly fee correctly (defaults)', () => {
    const entry = new Date('2024-01-01T00:00:00.000Z').toISOString();
    const exit = new Date('2024-01-01T01:01:00.000Z').toISOString();
    const { durationMinutes, feeCents } = computeFeeCents(entry, exit);
    assert.equal(durationMinutes, 61);
    // Default hourly rate is 500 cents, ceil(hours)=2
    assert.equal(feeCents, 1000);
  });

  it('returns 404 for unregistered vehicles', () => {
    const out = processScan(db, 'NOPE');
    assert.equal(out.status, 404);
  });

  it('creates entry then exit for registered vehicle', () => {
    db.prepare('INSERT INTO vehicles(vehicle_id, plate) VALUES (?, ?)').run('V-1', 'PLATE1');
    const now1 = new Date('2024-01-01T10:00:00.000Z').toISOString();
    const r1 = processScan(db, 'V-1', now1);
    assert.equal(r1.status, 200);
    assert.equal(r1.result.type, 'entry');

    const now2 = new Date('2024-01-01T11:05:00.000Z').toISOString();
    const r2 = processScan(db, 'V-1', now2);
    assert.equal(r2.status, 200);
    assert.equal(r2.result.type, 'exit');
    assert.equal(r2.result.duration_minutes, 65);
    assert.equal(r2.result.fee_cents, 1000);

    const rows = db.prepare('SELECT * FROM parking_logs WHERE vehicle_id = ?').all('V-1');
    assert.equal(rows.length, 1);
    assert.ok(rows[0].exit_time);
  });
});
