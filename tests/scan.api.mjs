import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import Database from 'better-sqlite3';
import request from 'supertest';
import { initDb, createApp } from '../server.js';

describe('Scan API (integration)', () => {
  let db;
  let app;
  let server;

  before(() => {
    db = new Database(':memory:');
    initDb(db);
    app = createApp({ db });
    server = app.listen(0);
  });

  after(() => {
    server?.close();
    db?.close();
  });

  it('registers a vehicle and logs entry then exit', async () => {
    // Register vehicle
    const reg = await request(server)
      .post('/api/register-vehicle')
      .send({ vehicle_id: 'V-2', plate: 'PLT2', owner_name: 'Alice' })
      .set('Content-Type', 'application/json');
    assert.equal(reg.status, 200);

    // Entry
    const entry = await request(server)
      .post('/api/scan')
      .send({ qr: 'V-2' })
      .set('Content-Type', 'application/json');
    assert.equal(entry.status, 200);
    assert.equal(entry.body.type, 'entry');

    // Exit
    const exit = await request(server)
      .post('/api/scan')
      .send({ qr: JSON.stringify({ vehicle_id: 'V-2' }) })
      .set('Content-Type', 'application/json');
    assert.equal(exit.status, 200);
    assert.equal(exit.body.type, 'exit');
    assert.ok(typeof exit.body.fee_cents === 'number');

    // Logs
    const logs = await request(server).get('/api/logs').query({ vehicle_id: 'V-2' });
    assert.equal(logs.status, 200);
    assert.equal(logs.body.length, 1);
    assert.ok(logs.body[0].exit_time);
  });
});
