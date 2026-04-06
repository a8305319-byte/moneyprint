'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const FORMATS = [
  { value: 'ELECTRONIC', label: '電子發票' },
  { value: 'UNIFORM',    label: '統一發票' },
  { value: 'PAPER',      label: '紙本收據' },
  { value: 'CLOUD',      label: '雲端發票' },
  { value: 'RECEIPT',    label: '一般收據' },
];

export default function AddInvoicePage() {
  const { apiFetch } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scanning, setScanning]           = useState(false);
  const [captureDataUrl, setCaptureDataUrl] = useState<string | null>(null);

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
  const [error, setError]   = useState('');

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  const amt    = Number(form.amount) || 0;
  const taxAmt = form.taxType === 'TAXABLE' ? Math.round(amt * 5 / 105 * 100) / 100 : 0;
  const untaxed = amt - taxAmt;

  // ── 相機 ──────────────────────────────────────────────────────────────────
  async function startCamera() {
    setError('');
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setError('無法存取相機，請允許相機權限或手動填寫');
      setScanning(false);
    }
  }

  function cancelCamera() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }

  function captureFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const stream = video.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    video.srcObject = null;
    setScanning(false);
    // 顯示拍攝預覽，讓使用者對照圖片填寫資料
    setCaptureDataUrl(canvas.toDataURL('image/jpeg', 0.85));
  }

  // ── 儲存 ──────────────────────────────────────────────────────────────────
  async function save() {
    if (!form.invoiceNo || !form.counterpartyName || !form.amount) {
      setError('請填寫發票號碼、交易對象及金額');
      return;
    }
    setSaving(true); setError('');
    try {
      const res = await apiFetch('/business-invoices', {
        method: 'POST',
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      router.push('/business/invoices');
    } catch (e: any) { setError(e.message ?? '儲存失敗，請再試一次'); }
    finally { setSaving(false); }
  }

  const inp: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 12,
    padding: '12px 14px', fontSize: 14, outline: 'none', color: '#1e1b4b',
    background: '#f8fafc', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #5b5fc7 0%, #7c3aed 100%)', padding: '56px 20px 24px' }}>
        <button onClick={() => router.back()} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 12,
          color: '#fff', fontSize: 13, padding: '6px 14px', cursor: 'pointer', marginBottom: 12,
        }}>← 返回</button>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>新增發票</div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* ── 相機區域 ── */}
        {scanning ? (
          /* 相機預覽中 */
          <div style={{ position: 'relative', marginBottom: 14, borderRadius: 18, overflow: 'hidden' }}>
            <video ref={videoRef} style={{ width: '100%', display: 'block' }} autoPlay playsInline />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {/* 關閉按鈕 */}
            <button onClick={cancelCamera} style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%',
              width: 38, height: 38, color: '#fff', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
            {/* 拍照按鈕 */}
            <button onClick={captureFrame} style={{
              position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
              background: '#fff', border: 'none', borderRadius: '50%',
              width: 64, height: 64, fontSize: 30, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>📸</button>
          </div>
        ) : captureDataUrl ? (
          /* 拍攝預覽 */
          <div style={{ marginBottom: 14 }}>
            <img
              src={captureDataUrl}
              alt="發票照片"
              style={{ width: '100%', borderRadius: 18, display: 'block' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <div style={{
                flex: 1, background: '#eff2ff', borderRadius: 12,
                padding: '10px 14px', fontSize: 12, color: '#5b5fc7', fontWeight: 600,
              }}>
                📷 對照圖片填寫下方欄位
              </div>
              <button
                onClick={() => setCaptureDataUrl(null)}
                style={{
                  background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: 12, padding: '10px 14px',
                  fontSize: 12, color: '#64748b', cursor: 'pointer', fontWeight: 600,
                }}
              >重拍</button>
            </div>
          </div>
        ) : (
          /* 未拍攝 */
          <button onClick={startCamera} style={{
            width: '100%', background: '#fff', border: '2px dashed #5b5fc7',
            borderRadius: 18, padding: '18px', marginBottom: 14,
            cursor: 'pointer', color: '#5b5fc7', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>📷 掃描發票（拍照後手動填寫）</button>
        )}

        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>

          {/* 進項 / 銷項 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>發票類型</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(['RECEIVED', 'ISSUED'] as const).map(v => (
                <button key={v} onClick={() => setForm(f => ({ ...f, direction: v }))} style={{
                  padding: '12px', borderRadius: 12, border: '2px solid', cursor: 'pointer',
                  borderColor: form.direction === v ? '#5b5fc7' : '#e2e8f0',
                  background:  form.direction === v ? '#eff2ff' : '#f8fafc',
                  color:       form.direction === v ? '#5b5fc7' : '#64748b',
                  fontWeight:  form.direction === v ? 700 : 500, fontSize: 13,
                  transition: 'all 0.2s',
                }}>
                  {v === 'RECEIVED' ? '進項（收到）' : '銷項（開出）'}
                </button>
              ))}
            </div>
          </div>

          {/* 發票格式 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>發票格式</div>
            <select value={form.format} onChange={set('format')} style={{ ...inp, appearance: 'none' as any }}>
              {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {/* 必填欄位 */}
          {[
            { label: '發票號碼',            key: 'invoiceNo',         placeholder: 'AB-12345678',      required: true  },
            { label: '發票日期',            key: 'invoiceDate',        type: 'date',                   required: true  },
            { label: '交易對象',            key: 'counterpartyName',   placeholder: '統一超商股份有限公司', required: true  },
            { label: '對方統一編號（選填）', key: 'counterpartyTaxId',  placeholder: '12345678'                         },
            { label: '含稅金額',            key: 'amount',             type: 'number', placeholder: '0', required: true },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>
                {f.label}{(f as any).required && <span style={{ color: '#f43f5e', marginLeft: 2 }}>*</span>}
              </div>
              <input
                type={(f as any).type ?? 'text'}
                value={(form as any)[f.key]}
                onChange={set(f.key)}
                placeholder={(f as any).placeholder}
                style={inp}
                onFocus={e => (e.target.style.borderColor = '#5b5fc7')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
          ))}

          {/* 稅別 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>稅別</div>
            <select value={form.taxType} onChange={set('taxType')} style={{ ...inp, appearance: 'none' as any }}>
              <option value="TAXABLE">應稅（5%）</option>
              <option value="ZERO_RATE">零稅率</option>
              <option value="EXEMPT">免稅</option>
            </select>
          </div>

          {/* 稅額預覽 */}
          {amt > 0 && (
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px', marginBottom: 16, fontSize: 13 }}>
              {[
                { label: '未稅金額', value: `NT$ ${untaxed.toLocaleString()}`,  color: '#1e1b4b' },
                { label: '稅額 (5%)', value: `NT$ ${taxAmt.toLocaleString()}`,  color: '#5b5fc7' },
                { label: '含稅金額', value: `NT$ ${amt.toLocaleString()}`,      color: '#1e1b4b', bold: true },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#94a3b8' }}>{r.label}</span>
                  <span style={{ fontWeight: (r as any).bold ? 800 : 600, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* 備註 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>備註（選填）</div>
            <input
              value={form.description} onChange={set('description')}
              placeholder="說明..."
              style={inp}
              onFocus={e => (e.target.style.borderColor = '#5b5fc7')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {error && (
            <div style={{
              background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
              padding: '10px 14px', color: '#e11d48', fontSize: 13, marginBottom: 14,
            }}>{error}</div>
          )}

          <button onClick={save} disabled={saving} style={{
            width: '100%',
            background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
            border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 16,
            padding: '16px', cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 6px 20px rgba(91,95,199,0.4)',
          }}>
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                儲存中
              </span>
            ) : '儲存發票'}
          </button>
        </div>
      </div>
    </div>
  );
}
