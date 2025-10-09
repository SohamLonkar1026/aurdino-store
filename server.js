const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { z } = require('zod');

function initDb(dbPath = process.env.DB_PATH || path.join(__dirname, 'parking.db')) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schemaSql);
  return db;
}

function createApp(db) {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '200kb' }));
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' }
  });
  app.use(limiter);

  const HOURLY_RATE_CENTS = Number(process.env.HOURLY_RATE_CENTS || 500);
  const PER_MINUTE_RATE_CENTS = Number(process.env.PER_MINUTE_RATE_CENTS || 10);
  const FEE_MODE = process.env.FEE_MODE || 'hourly'; // 'hourly' | 'per_minute'
  const HMAC_SECRET = process.env.HMAC_SECRET || null;

  const insertVehicleStmt = db.prepare(`
    INSERT INTO vehicles (vehicle_id, plate, owner_name, phone, meta)
    VALUES (?, ?, ?, ?, ?)
  `);
  const getVehicleStmt = db.prepare(`SELECT * FROM vehicles WHERE vehicle_id = ?`);
  const getActiveLogStmt = db.prepare(`
    SELECT * FROM parking_logs
    WHERE vehicle_id = ? AND exit_time IS NULL
    ORDER BY id DESC
    LIMIT 1
  `);
  const insertLogStmt = db.prepare(`
    INSERT INTO parking_logs (vehicle_id, entry_time)
    VALUES (?, ?)
  `);
  const exitLogStmt = db.prepare(`
    UPDATE parking_logs
    SET exit_time = ?, duration_minutes = ?, fee_cents = ?, updated_at = ?
    WHERE id = ?
  `);
  const getLogsStmt = db.prepare(`
    SELECT id, vehicle_id, entry_time, exit_time, duration_minutes, fee_cents, created_at, updated_at
    FROM parking_logs WHERE vehicle_id = ? ORDER BY id DESC LIMIT 100
  `);

  function parseQrPayload(qr) {
    if (qr == null) throw new Error('qr is required');
    if (typeof qr === 'object') {
      const vehicle_id = qr.vehicle_id || qr.id || qr.vehicleId || qr.vid;
      return {
        vehicle_id: typeof vehicle_id === 'string' ? vehicle_id : String(vehicle_id),
        nonce: qr.nonce || null,
        sig: qr.sig || qr.signature || null,
        raw: qr
      };
    }
    if (typeof qr === 'string') {
      const s = qr.trim();
      try {
        const obj = JSON.parse(s);
        return parseQrPayload(obj);
      } catch {
        return { vehicle_id: s, nonce: null, sig: null, raw: s };
      }
    }
    throw new Error('Unsupported qr input');
  }

  function verifyHmacIfPresent(vehicleId, nonce, sig) {
    if (!sig) return { verified: !HMAC_SECRET, reason: sig ? 'no-secret' : 'no-sig' };
    if (!HMAC_SECRET) return { verified: true, reason: 'no-secret-configured' };
    const payload = `${vehicleId}|${nonce || ''}`;
    const hmac = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest();
    let sigBuf;
    try {
      sigBuf = Buffer.from(sig, 'hex');
      if (sigBuf.length !== 32) throw new Error('not-hex');
    } catch {
      sigBuf = Buffer.from(sig, 'base64');
    }
    if (sigBuf.length !== hmac.length) return { verified: false, reason: 'length-mismatch' };
    const ok = crypto.timingSafeEqual(hmac, sigBuf);
    return { verified: ok, reason: ok ? 'ok' : 'mismatch' };
  }

  function centsToCurrencyString(cents) {
    const amount = (cents / 100).toFixed(2);
    return `$${amount}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function calculateFeeCents(entryIso, exitIso) {
    const start = new Date(entryIso).getTime();
    const end = new Date(exitIso).getTime();
    const minutes = Math.max(0, Math.ceil((end - start) / 60000));
    if (FEE_MODE === 'per_minute') {
      return minutes * PER_MINUTE_RATE_CENTS;
    }
    const hours = Math.ceil(minutes / 60);
    return hours * HOURLY_RATE_CENTS;
  }

  const RegisterVehicleSchema = z.object({
    vehicle_id: z.string().min(1).max(128),
    // Optional fields should not fail validation when omitted; defaults are empty strings
    plate: z.string().max(32).optional().default(''),
    owner_name: z.string().min(1).max(128),
    phone: z.string().max(32).optional().default(''),
    meta: z.any().optional()
  });

  app.post('/api/register-vehicle', (req, res) => {
    try {
      const data = RegisterVehicleSchema.parse(req.body || {});
      const metaStr = data.meta ? JSON.stringify(data.meta) : null;
      insertVehicleStmt.run(data.vehicle_id, data.plate, data.owner_name, data.phone, metaStr);
      return res.status(201).json({ ok: true, vehicle_id: data.vehicle_id });
    } catch (err) {
      if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Vehicle already registered' });
      }
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: err.errors });
      }
      return res.status(500).json({ error: 'Failed to register vehicle' });
    }
  });

  const ScanSchema = z.object({
    qr: z.union([z.string(), z.record(z.any())])
  });

  const handleScanTx = db.transaction((vehicleId) => {
    const vehicle = getVehicleStmt.get(vehicleId);
    if (!vehicle) {
      return { notRegistered: true };
    }
    const active = getActiveLogStmt.get(vehicleId);
    if (active) {
      const exitTime = nowIso();
      const feeCents = calculateFeeCents(active.entry_time, exitTime);
      const durationMinutes = Math.max(0, Math.ceil((new Date(exitTime) - new Date(active.entry_time)) / 60000));
      const updatedAt = nowIso();
      exitLogStmt.run(exitTime, durationMinutes, feeCents, updatedAt, active.id);
      return {
        status: 'exit',
        vehicle,
        entry_time: active.entry_time,
        exit_time: exitTime,
        duration_minutes: durationMinutes,
        fee_cents: feeCents,
        fee_formatted: centsToCurrencyString(feeCents)
      };
    } else {
      const entryTime = nowIso();
      try {
        const info = insertLogStmt.run(vehicleId, entryTime);
        return { status: 'entry', vehicle, entry_time: entryTime, log_id: info.lastInsertRowid };
      } catch (e) {
        const concurrentActive = getActiveLogStmt.get(vehicleId);
        if (concurrentActive) {
          const exitTime = nowIso();
          const feeCents = calculateFeeCents(concurrentActive.entry_time, exitTime);
          const durationMinutes = Math.max(0, Math.ceil((new Date(exitTime) - new Date(concurrentActive.entry_time)) / 60000));
          const updatedAt = nowIso();
          exitLogStmt.run(exitTime, durationMinutes, feeCents, updatedAt, concurrentActive.id);
          return {
            status: 'exit',
            vehicle,
            entry_time: concurrentActive.entry_time,
            exit_time: exitTime,
            duration_minutes: durationMinutes,
            fee_cents: feeCents,
            fee_formatted: centsToCurrencyString(feeCents),
            raceCorrected: true
          };
        }
        throw e;
      }
    }
  });

  app.post('/api/scan', (req, res) => {
    try {
      const body = ScanSchema.parse(req.body || {});
      const { vehicle_id, nonce, sig } = parseQrPayload(body.qr);
      if (!vehicle_id) {
        return res.status(400).json({ error: 'Parsed QR has no vehicle_id' });
      }
      const sigCheck = verifyHmacIfPresent(vehicle_id, nonce, sig);
      if (!sigCheck.verified && sig) {
        return res.status(401).json({ error: 'Invalid signature', reason: sigCheck.reason });
      }
      const result = handleScanTx(vehicle_id);
      if (result.notRegistered) {
        return res.status(404).json({ error: 'Vehicle not registered' });
      }
      if (result.status === 'entry') {
        return res.json({
          status: 'entry',
          vehicle_id,
          entry_time: result.entry_time,
          message: 'Entry recorded',
          vehicle: {
            vehicle_id: result.vehicle.vehicle_id,
            plate: result.vehicle.plate,
            owner_name: result.vehicle.owner_name
          }
        });
      } else {
        return res.json({
          status: 'exit',
          vehicle_id,
          entry_time: result.entry_time,
          exit_time: result.exit_time,
          duration_minutes: result.duration_minutes,
          fee_cents: result.fee_cents,
          fee_formatted: result.fee_formatted,
          message: 'Exit recorded',
          vehicle: {
            vehicle_id: result.vehicle.vehicle_id,
            plate: result.vehicle.plate,
            owner_name: result.vehicle.owner_name
          }
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: err.errors });
      }
      return res.status(500).json({ error: 'Scan failed' });
    }
  });

  app.get('/api/logs', (req, res) => {
    try {
      const vehicleId = String(req.query.vehicle_id || '').trim();
      if (!vehicleId) {
        return res.status(400).json({ error: 'vehicle_id is required' });
      }
      const vehicle = getVehicleStmt.get(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not registered' });
      }
      const logs = getLogsStmt.all(vehicleId);
      return res.json({ vehicle_id: vehicleId, logs });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  return app;
}

let app;
let db;
if (require.main === module) {
  db = initDb();
  app = createApp(db);
  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = { createApp, initDb };
