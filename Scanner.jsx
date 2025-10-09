import React, { useEffect, useRef, useState } from 'react';

// Minimal inline styles for clarity
const styles = {
  container: { maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' },
  videoWrap: { position: 'relative', background: '#000', borderRadius: 8, overflow: 'hidden' },
  video: { width: '100%', height: 'auto', transform: 'scaleX(-1)' },
  overlay: { position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 12 },
  toast: (type) => ({ position: 'fixed', right: 12, top: 12, background: type === 'error' ? '#dc2626' : '#16a34a', color: '#fff', padding: '8px 12px', borderRadius: 8 }),
  controls: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  list: { marginTop: 12, padding: 0, listStyle: 'none' },
  listItem: { padding: '6px 8px', borderBottom: '1px solid #eee' },
  badge: (type) => ({ display: 'inline-block', padding: '2px 6px', borderRadius: 6, background: type === 'entry' ? '#d1fae5' : '#fee2e2', color: type === 'entry' ? '#065f46' : '#991b1b', fontSize: 12, marginLeft: 8 })
};

// Lazy import jsQR to keep file standalone
let jsQRLib = null;
async function ensureJsQR() {
  if (!jsQRLib) {
    jsQRLib = (await import('jsqr')).default;
  }
  return jsQRLib;
}

export default function Scanner({ apiBase = '' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamError, setStreamError] = useState('');
  const [toast, setToast] = useState(null);
  const [lastScans, setLastScans] = useState([]); // { vehicle_id, status, time, fee_formatted? }
  const [lastCode, setLastCode] = useState('');
  const lastCodeAtRef = useRef(0);
  const [fps, setFps] = useState(10);
  const rafRef = useRef(null);
  const scanningRef = useRef(false);
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await ensureJsQR();
        const constraints = { video: { facingMode: 'environment' } };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        startScanning();
      } catch (err) {
        setStreamError('Camera access failed. Please allow camera permissions.');
      }
    })();
    return () => {
      isMounted = false;
      stopScanning();
      const v = videoRef.current;
      const s = v && v.srcObject;
      if (s && s.getTracks) s.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startScanning() {
    if (scanningRef.current) return;
    scanningRef.current = true;
    scheduleScan();
  }

  function stopScanning() {
    scanningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function scheduleScan() {
    const intervalMs = Math.max(50, Math.floor(1000 / fps));
    const loop = () => {
      if (!scanningRef.current) return;
      setTimeout(() => {
        scanFrame();
        rafRef.current = requestAnimationFrame(loop);
      }, intervalMs);
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  async function scanFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const targetW = 640;
    const scale = w ? targetW / w : 1;
    const cw = Math.floor(w * scale);
    const ch = Math.floor(h * scale);
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, cw, ch);
    const imageData = ctx.getImageData(0, 0, cw, ch);
    const jsqr = await ensureJsQR();
    const code = jsqr(imageData.data, imageData.width, imageData.height);
    if (code && code.data) {
      onCodeDecoded(code.data);
    }
  }

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  }

  async function sendScan(qrStringOrObj) {
    try {
      const res = await fetch(`${apiBase}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr: qrStringOrObj })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Scan failed');
      setLastScans(prev => [{
        vehicle_id: data.vehicle_id,
        status: data.status,
        time: new Date().toISOString(),
        fee_formatted: data.fee_formatted
      }, ...prev].slice(0, 5));
      showToast('success', data.message || 'Success');
    } catch (e) {
      showToast('error', e.message || 'Scan failed');
    }
  }

  function onCodeDecoded(decoded) {
    const now = Date.now();
    if (decoded === lastCode && now - lastCodeAtRef.current < 5000) {
      return; // debounce duplicate decodes within 5s
    }
    setLastCode(decoded);
    lastCodeAtRef.current = now;
    let payload = decoded;
    try {
      payload = JSON.parse(decoded);
    } catch {}
    sendScan(payload);
  }

  async function handleManualLookup() {
    const id = manualId.trim();
    if (!id) return;
    await sendScan(id);
  }

  return (
    <div style={styles.container}>
      <h2>Automatic Parking QR Scanner</h2>
      <div style={styles.videoWrap}>
        <video ref={videoRef} style={styles.video} playsInline muted />
        {lastCode ? (
          <div style={styles.overlay}>Last QR: {String(lastCode).slice(0, 64)}</div>
        ) : null}
      </div>
      {streamError ? <p style={{ color: '#dc2626' }}>{streamError}</p> : null}
      <div style={styles.controls}>
        <button onClick={startScanning}>Rescan</button>
        <label>
          FPS:
          <input type="number" value={fps} min={4} max={30} onChange={e => setFps(Number(e.target.value || 10))} style={{ width: 64, marginLeft: 6 }} />
        </label>
        <input placeholder="Manual vehicle_id" value={manualId} onChange={e => setManualId(e.target.value)} />
        <button onClick={handleManualLookup}>Manual lookup</button>
      </div>
      <ul style={styles.list}>
        {lastScans.map((s, i) => (
          <li key={i} style={styles.listItem}>
            <strong>{s.vehicle_id}</strong>
            <span style={styles.badge(s.status)}>{s.status}</span>
            <span style={{ marginLeft: 8, color: '#6b7280' }}>{new Date(s.time).toLocaleTimeString()}</span>
            {s.fee_formatted ? <span style={{ marginLeft: 8 }}>Fee: {s.fee_formatted}</span> : null}
          </li>
        ))}
      </ul>
      {toast ? <div style={styles.toast(toast.type)}>{toast.message}</div> : null}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <details style={{ marginTop: 12 }}>
        <summary>Help / Instructions</summary>
        <div>
          <p>- Point the camera at a vehicle QR.</p>
          <p>- Debounce prevents duplicate reads within 5 seconds.</p>
          <p>- Use manual lookup if QR unreadable.</p>
        </div>
      </details>
    </div>
  );
}
