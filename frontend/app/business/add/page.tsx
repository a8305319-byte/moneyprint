'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const FORMATS = [
  { value: 'ELECTRONIC', label: '電子發票' },
  { value: 'UNIFORM', label: '統一發票' },
  { value: 'PAPER', label: '紙本收據' },
  { value: 'CLOUD', label: '雲端發票' },
  { value: 'RECEIPT', label: '一般收據' },
];

export default function AddInvoicePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState({
    direction: 'RECEIVED' as 'RECEIVED' | 'ISSUED',
    format: 'ELECTRONIC',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    counterpartyName: '',
    counterpartyTaxId: '',
    amount: '',
    taxType: 'TAXABLE' as 'TAXABLE' | 'ZERO_RATE' | 'EXEMPT',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Tax preview
  const amt = Number(form.amount) || 0;
  const taxAmt = form.taxType === 'TAXABLE' ? Math.round(amt * 5 / 105 * 100) / 100 : 0;
  const untaxed = amt - taxAmt;

  // Camera scan
  async function startCamera() {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch { setError('無法存取相機'); setScanning(false); }
  }

  function captureFrame() {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    // Stop camera
    const stream = video.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    video.srcObject = null;
    setScanning(false);
    // Parse invoice number from image (basic OCR simulation)
    // In production, send canvas.toDataURL() to a vision API
    parseInvoiceFromCanvas(canvas);
  }

  function parseInvoiceFromCanvas(canvas: HTMLCanvasElement) {
    // Placeholder: in production integrate Google Vision or Tesseract.js
    // For now just show guidance message
    setError('📸 圖片已擷取！請手動確認並補填發票資料');
  }

  async function save() {
    if (!form.invoiceNo || !form.counterpartyName || !form.amount) { setError('請填寫必填欄位'); return; }
    setSaving(true); setError('');
    const t = localStorage.getItem('mp_token');
    try {
      const res = await fetch(`${API}/business-invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      router.push('/business/invoices');
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  const inp = (label: string, key: string, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: '#8892a4', marginBottom: 5 }}>{label}</div>
      <input type={type} value={(form as any)[key]} onChange={set(key)} placeholder={placeholder}
        style={{ width: '100%', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e', background: '#fafbff' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--background)' }}>
      <div style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #48cfad 100%)', padding: '48px 20px 24px' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>➕ 新增發票</div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Camera scan */}
        {!scanning ? (
          <button onClick={startCamera} style={{
            width: '100%', background: '#fff', border: '2px dashed #6c63ff', borderRadius: 20,
            padding: '20px', marginBottom: 16, cursor: 'pointer', color: '#6c63ff', fontWeight: 700, fontSize: 14,
          }}>📷 相機掃描發票</button>
        ) : (
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <video ref={videoRef} style={{ width: '100%', borderRadius: 20 }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <button onClick={captureFrame} style={{
              position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
              background: '#fff', border: 'none', borderRadius: '50%', width: 60, height: 60,
              fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>📸</button>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 16px rgba(108,99,255,0.08)', marginBottom: 16 }}>
          {/* Direction */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#8892a4', marginBottom: 5 }}>發票類型</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['RECEIVED','📥 進項（收到）'],['ISSUED','📤 銷項（開出）']].map(([v,l]) => (
                <button key={v} onClick={() => setForm(f=>({...f, direction: v as any}))} style={{
                  padding: '11px', borderRadius: 12, border: '2px solid', cursor: 'pointer',
                  borderColor: form.direction === v ? '#6c63ff' : '#e8ecf4',
                  background: form.direction === v ? '#f0f0ff' : '#fafbff',
                  color: form.direction === v ? '#6c63ff' : '#8892a4',
                  fontWeight: form.direction === v ? 700 : 400, fontSize: 13,
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#8892a4', marginBottom: 5 }}>發票格式</div>
            <select value={form.format} onChange={set('format')} style={{ width: '100%', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', background: '#fafbff', color: '#1a1a2e' }}>
              {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {inp('發票號碼 *', 'invoiceNo', 'text', 'AB-12345678')}
          {inp('發票日期 *', 'invoiceDate', 'date')}
          {inp('交易對象（公司/商家名稱）*', 'counterpartyName', 'text', '統一超商股份有限公司')}
          {inp('對方統一編號（選填）', 'counterpartyTaxId', 'text', '12345678')}
          {inp('含稅金額 *', 'amount', 'number', '0')}

          {/* Tax type */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#8892a4', marginBottom: 5 }}>稅別</div>
            <select value={form.taxType} onChange={set('taxType')} style={{ width: '100%', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', background: '#fafbff', color: '#1a1a2e' }}>
              <option value="TAXABLE">應稅（5%）</option>
              <option value="ZERO_RATE">零稅率</option>
              <option value="EXEMPT">免稅</option>
            </select>
          </div>

          {/* Tax preview */}
          {amt > 0 && (
            <div style={{ background: '#f5f6fa', borderRadius: 12, padding: '12px', marginBottom: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#8892a4' }}>未稅金額</span>
                <span style={{ fontWeight: 600 }}>NT$ {untaxed.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#8892a4' }}>稅額 (5%)</span>
                <span style={{ fontWeight: 600, color: '#6c63ff' }}>NT$ {taxAmt.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>含稅金額</span>
                <span style={{ fontWeight: 800, color: '#1a1a2e' }}>NT$ {amt.toLocaleString()}</span>
              </div>
            </div>
          )}

          {inp('備註（選填）', 'description', 'text', '說明...')}
          {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 10, textAlign: 'center' }}>{error}</div>}

          <button onClick={save} disabled={saving} style={{
            width: '100%', background: 'linear-gradient(135deg, #6c63ff, #48cfad)',
            border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 16,
            padding: '15px', cursor: saving ? 'not-allowed' : 'pointer',
          }}>{saving ? '儲存中...' : '✓ 儲存發票'}</button>
        </div>
      </div>
    </div>
  );
}
