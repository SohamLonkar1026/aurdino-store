import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import jsQR from 'jsqr';

const SERVER_URL = typeof window !== 'undefined' && window.location && window.location.origin
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : 'http://localhost:3001';

const fiveSeconds = 5000;

export default function Scanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const readerRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [overlay, setOverlay] = useState('');
  const [toast, setToast] = useState(null); // {type: 'success'|'error', text}
  const [lastScans, setLastScans] = useState([]); // {vehicle_id, type, time, fee_cents, duration_minutes}
  const [manualId, setManualId] = useState('');
  const recentMapRef = useRef(new Map());

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    readerRef.current = new BrowserMultiFormatReader(hints, 500);
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        beginScanning();
      }
    } catch (e) {
      showToast('error', `Camera error: ${e.message || e}`);
    }
  }

  function stopCamera() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause?.();
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
    }
  }

  function beginScanning() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(captureAndDecode, 100); // ~10 fps
  }

  async function captureAndDecode() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const cw = video.videoWidth || 640;
    const ch = video.videoHeight || 480;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = cw;
    canvas.height = ch;
    ctx.drawImage(video, 0, 0, cw, ch);

    // Try ZXing first
    let text = '';
    try {
      const result = await readerRef.current.decodeFromCanvas(canvas);
      text = result?.getText?.() || result?.text || '';
    } catch (_) {
      // ignore
    }

    // Fallback to jsQR
    if (!text) {
      try {
        const imageData = ctx.getImageData(0, 0, cw, ch);
        const code = jsQR(imageData.data, cw, ch, { inversionAttempts: 'dontInvert' });
        if (code && code.data) text = code.data;
      } catch (_) {}
    }

    if (!text) return;

    // Debounce same QR for 5s
    const now = Date.now();
    const last = recentMapRef.current.get(text);
    if (last && now - last < fiveSeconds) return;
    recentMapRef.current.set(text, now);

    setOverlay(text);
    setTimeout(() => setOverlay(''), 2000);

    await submitScan(text);
  }

  async function submitScan(qr) {
    try {
      const res = await fetch(`${SERVER_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');

      const now = new Date().toISOString();
      const item = {
        vehicle_id: data.vehicle_id,
        type: data.type,
        time: data.entry_time || data.exit_time || now,
        fee_cents: data.fee_cents,
        duration_minutes: data.duration_minutes,
      };
      setLastScans((prev) => [item, ...prev].slice(0, 5));
      showToast('success', data.type === 'entry' ? 'Entry logged' : `Exit logged. Fee: ${(data.fee_cents/100).toFixed(2)}`);
    } catch (e) {
      showToast('error', e.message || 'Scan error');
    }
  }

  function rescan() {
    recentMapRef.current.clear();
    setOverlay('');
    beginScanning();
  }

  async function manualLookup() {
    if (!manualId.trim()) return;
    await submitScan(manualId.trim());
    setManualId('');
  }

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>Automatic Parking Scanner</h2>
      <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #ccc' }}>
        <video ref={videoRef} playsInline muted style={{ width: '100%', background: '#000' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {overlay ? (
          <div style={{ position:'absolute', bottom: 10, left: 10, right: 10, padding: 8, background: 'rgba(0,0,0,0.6)', color: '#0f0', borderRadius: 4, fontFamily: 'monospace' }}>
            {overlay}
          </div>
        ) : null}
      </div>

      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <button onClick={rescan}>Rescan</button>
        <input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="Manual vehicle_id or QR payload" style={{ flex:1 }} />
        <button onClick={manualLookup}>Manual lookup</button>
      </div>

      {toast ? (
        <div style={{ marginTop:12, padding:10, borderRadius:6, color:'#fff', background: toast.type === 'success' ? '#16a34a' : '#dc2626' }}>
          {toast.text}
        </div>
      ) : null}

      <div style={{ marginTop:16 }}>
        <h3>Last 5 scans</h3>
        <ul>
          {lastScans.map((s, idx) => (
            <li key={idx} style={{ marginBottom:6 }}>
              <span style={{ fontWeight:600 }}>{s.type.toUpperCase()}</span> • {s.vehicle_id} • {new Date(s.time).toLocaleString()} {s.type==='exit' ? `• ${(s.fee_cents/100).toFixed(2)} • ${s.duration_minutes}m` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
