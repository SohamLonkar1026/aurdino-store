import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import Database from 'better-sqlite3';
import { createHmac, timingSafeEqual } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const PORT = Number(process.env.PORT || 3001);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'parking.sqlite');
const HOURLY_RATE = Number(process.env.PARKING_HOURLY_RATE || 500); // cents
const RATE_MODE = process.env.PARKING_RATE_MODE || 'per_hour'; // 'per_hour' | 'per_minute'
const PER_MINUTE_RATE = Number(
  process.env.PARKING_PER_MINUTE_RATE || Math.ceil(HOURLY_RATE / 60)
); // cents

// Initialize DB
export function initDb(db) {
  // If schema.sql exists, apply it; otherwise create minimal schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(sql);
  } else {
    db.exec(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS vehicles (
        vehicle_id TEXT PRIMARY KEY,
        plate TEXT NOT NULL,
        owner_name TEXT,
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
        fee_cents INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_log_per_vehicle
      ON parking_logs(vehicle_id)
      WHERE exit_time IS NULL;
      CREATE INDEX IF NOT EXISTS idx_logs_vehicle ON parking_logs(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_logs_entry_time ON parking_logs(entry_time);
      CREATE INDEX IF NOT EXISTS idx_logs_exit_time ON parking_logs(exit_time);
    `);
  }
}

// Utility: parse QR payload (JSON string or plain vehicle_id)
export function parseQrPayload(qr) {
  let raw = qr;
  if (typeof qr !== 'string') {
    raw = JSON.stringify(qr);
  }

  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && obj.vehicle_id) {
      return { vehicle_id: String(obj.vehicle_id), nonce: obj.nonce ?? '', sig: obj.sig ?? '' };
    }
  } catch (_) {
    // not JSON, fall back to plain string
  }
  return { vehicle_id: String(raw).trim(), nonce: '', sig: '' };
}

// Optional HMAC verification if sig is present
export function verifySignature({ vehicle_id, nonce, sig }) {
  if (!sig) return { ok: true };
  const secret = process.env.QR_HMAC_SECRET;
  if (!secret) {
    return { ok: false, error: 'Signature present but QR_HMAC_SECRET not configured' };
  }
  const base = `${vehicle_id}|${nonce || ''}`;
  const expectedHex = createHmac('sha256', secret).update(base).digest('hex');
  try {
    const a = Buffer.from(expectedHex, 'hex');
    const b = Buffer.from(sig, 'hex');
    if (a.length !== b.length) return { ok: false, error: 'Invalid signature length' };
    const match = timingSafeEqual(a, b);
    return match ? { ok: true } : { ok: false, error: 'Invalid signature' };
  } catch (e) {
    return { ok: false, error: 'Invalid signature encoding' };
  }
}

// Fee calculation
export function computeFeeCents(entryISO, exitISO) {
  const entry = new Date(entryISO);
  const exit = new Date(exitISO);
  const durationMinutes = Math.max(0, Math.ceil((exit.getTime() - entry.getTime()) / 60000));
  if (RATE_MODE === 'per_minute') {
    const fee = durationMinutes * PER_MINUTE_RATE;
    return { durationMinutes, feeCents: fee };
  }
  const hours = Math.max(1, Math.ceil(durationMinutes / 60));
  const fee = hours * HOURLY_RATE;
  return { durationMinutes, feeCents: fee };
}

// Main scan transaction (idempotent / concurrency-safe by unique active-log index)
export function processScan(db, vehicleId, nowISO = new Date().toISOString()) {
  const tx = db.transaction(() => {
    const v = db.prepare('SELECT vehicle_id, plate FROM vehicles WHERE vehicle_id = ?').get(vehicleId);
    if (!v) {
      return { status: 404, error: 'Vehicle not registered' };
    }

    const active = db
      .prepare(
        'SELECT id, entry_time FROM parking_logs WHERE vehicle_id = ? AND exit_time IS NULL ORDER BY entry_time DESC LIMIT 1'
      )
      .get(vehicleId);

    if (active) {
      // Exit
      const { durationMinutes, feeCents } = computeFeeCents(active.entry_time, nowISO);
      db.prepare(
        'UPDATE parking_logs SET exit_time = ?, duration_minutes = ?, fee_cents = ? WHERE id = ?'
      ).run(nowISO, durationMinutes, feeCents, active.id);
      return {
        status: 200,
        result: {
          type: 'exit',
          vehicle_id: vehicleId,
          exit_time: nowISO,
          duration_minutes: durationMinutes,
          fee_cents: feeCents,
        },
      };
    }

    // Entry
    db.prepare(
      'INSERT INTO parking_logs(vehicle_id, entry_time, fee_cents) VALUES (?, ?, 0)'
    ).run(vehicleId, nowISO);
    return {
      status: 200,
      result: { type: 'entry', vehicle_id: vehicleId, entry_time: nowISO },
    };
  });

  try {
    return tx();
  } catch (e) {
    // Handle uniqueness race (should not occur in single-threaded better-sqlite3, but safe)
    if (String(e.message).includes('idx_one_active_log_per_vehicle')) {
      // Retry once as exit
      const active = db
        .prepare(
          'SELECT id, entry_time FROM parking_logs WHERE vehicle_id = ? AND exit_time IS NULL ORDER BY entry_time DESC LIMIT 1'
        )
        .get(vehicleId);
      if (active) {
        const { durationMinutes, feeCents } = computeFeeCents(active.entry_time, nowISO);
        db.prepare(
          'UPDATE parking_logs SET exit_time = ?, duration_minutes = ?, fee_cents = ? WHERE id = ?'
        ).run(nowISO, durationMinutes, feeCents, active.id);
        return {
          status: 200,
          result: {
            type: 'exit',
            vehicle_id: vehicleId,
            exit_time: nowISO,
            duration_minutes: durationMinutes,
            fee_cents: feeCents,
          },
        };
      }
    }
    return { status: 500, error: 'Internal error' };
  }
}

export function createApp({ db }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '200kb' }));
  app.use(morgan('tiny'));

  const generalLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 600 });
  app.use(generalLimiter);

  const scanLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });

  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.post('/api/register-vehicle', (req, res) => {
    const { vehicle_id, plate, owner_name = '', phone = '', meta = '' } = req.body || {};
    if (!vehicle_id || !plate) {
      return res.status(400).json({ error: 'vehicle_id and plate are required' });
    }
    try {
      db.prepare(
        'INSERT INTO vehicles(vehicle_id, plate, owner_name, phone, meta) VALUES (?, ?, ?, ?, ?)'
      ).run(String(vehicle_id), String(plate), String(owner_name), String(phone), String(meta));
      return res.json({ ok: true });
    } catch (e) {
      if (String(e.message).includes('UNIQUE') || String(e.message).includes('PRIMARY')) {
        return res.status(409).json({ error: 'Vehicle already registered' });
      }
      return res.status(500).json({ error: 'Failed to register vehicle' });
    }
  });

  app.post('/api/scan', scanLimiter, (req, res) => {
    const body = req.body || {};
    const qrValue = body.qr ?? body;
    if (!qrValue) return res.status(400).json({ error: 'Missing qr' });

    const parsed = parseQrPayload(qrValue);
    if (!parsed.vehicle_id) return res.status(400).json({ error: 'Missing vehicle_id' });

    const sigCheck = verifySignature(parsed);
    if (!sigCheck.ok) return res.status(400).json({ error: sigCheck.error });

    const outcome = processScan(db, parsed.vehicle_id);
    if (outcome.status !== 200) {
      return res.status(outcome.status).json({ error: outcome.error });
    }
    return res.json(outcome.result);
  });

  app.get('/api/logs', (req, res) => {
    const vehicleId = String(req.query.vehicle_id || '').trim();
    if (!vehicleId) return res.status(400).json({ error: 'vehicle_id is required' });
    const rows = db
      .prepare(
        'SELECT id, vehicle_id, entry_time, exit_time, duration_minutes, fee_cents FROM parking_logs WHERE vehicle_id = ? ORDER BY id DESC LIMIT 100'
      )
      .all(vehicleId);
    return res.json(rows);
  });

  return app;
}

// Boot when executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = new Database(DB_PATH);
  initDb(db);
  const app = createApp({ db });
  app.listen(PORT, () => {
    console.log(`Parking server listening on http://localhost:${PORT}`);
  });
}
