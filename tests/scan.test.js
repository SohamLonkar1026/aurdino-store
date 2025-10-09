const request = require('supertest');
const crypto = require('crypto');
const { createApp, initDb } = require('../server');

function makeAppWithEnv(env = {}) {
  const prev = {};
  for (const k of Object.keys(env)) { prev[k] = process.env[k]; process.env[k] = env[k]; }
  const db = initDb(':memory:');
  const app = createApp(db);
  // restore promptly to avoid leakage to other tests
  for (const k of Object.keys(env)) { if (prev[k] === undefined) delete process.env[k]; else process.env[k] = prev[k]; }
  return { app, db };
}

describe('Parking scan flow', () => {
  test('returns 404 for unregistered vehicle', async () => {
    const { app } = makeAppWithEnv();
    const res = await request(app).post('/api/scan').send({ qr: 'UNREG-1' });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/Vehicle not registered/);
  });

  test('register vehicle then entry -> exit flow', async () => {
    const { app } = makeAppWithEnv({ HOURLY_RATE_CENTS: '600' });
    await request(app).post('/api/register-vehicle').send({ vehicle_id: 'ABC123', owner_name: 'John Doe', plate: 'AB-1234' }).expect(201);

    const entryRes = await request(app).post('/api/scan').send({ qr: 'ABC123' }).expect(200);
    expect(entryRes.body.status).toBe('entry');
    expect(entryRes.body.vehicle_id).toBe('ABC123');

    const exitRes = await request(app).post('/api/scan').send({ qr: 'ABC123' }).expect(200);
    expect(exitRes.body.status).toBe('exit');
    expect(exitRes.body.duration_minutes).toBeGreaterThanOrEqual(0);
    expect(exitRes.body.fee_cents).toBeGreaterThanOrEqual(0);

    const logs = await request(app).get('/api/logs').query({ vehicle_id: 'ABC123' }).expect(200);
    expect(Array.isArray(logs.body.logs)).toBe(true);
    expect(logs.body.logs.length).toBeGreaterThanOrEqual(1);
  });

  test('accepts JSON QR with HMAC, rejects bad signature', async () => {
    const secret = 'testsecret123';
    const { app } = makeAppWithEnv({ HMAC_SECRET: secret });
    await request(app).post('/api/register-vehicle').send({ vehicle_id: 'SEC123', owner_name: 'Alice' }).expect(201);

    const nonce = 'n1';
    const goodSig = crypto.createHmac('sha256', secret).update(`SEC123|${nonce}`).digest('hex');
    const good = await request(app).post('/api/scan').send({ qr: { vehicle_id: 'SEC123', nonce, sig: goodSig } });
    expect(good.status).toBe(200);
    expect(good.body.status).toBe('entry');

    const bad = await request(app).post('/api/scan').send({ qr: { vehicle_id: 'SEC123', nonce, sig: 'deadbeef' } });
    expect(bad.status).toBe(401);
  });

  test('GET /api/logs validates vehicle existence', async () => {
    const { app } = makeAppWithEnv();
    const r1 = await request(app).get('/api/logs').query({ vehicle_id: '' });
    expect(r1.status).toBe(400);
    const r2 = await request(app).get('/api/logs').query({ vehicle_id: 'NOPE' });
    expect(r2.status).toBe(404);
  });
});
