import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f', padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>💸</div>
      <div style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>404</div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginBottom: 40 }}>這個頁面不存在</div>
      <Link href="/" style={{
        background: 'linear-gradient(135deg, #5b5fc7 0%, #7c3aed 100%)',
        borderRadius: 18, color: '#fff',
        fontWeight: 700, fontSize: 16, padding: '16px 40px',
        textDecoration: 'none',
        boxShadow: '0 8px 28px rgba(91,95,199,0.4)',
      }}>回首頁</Link>
    </div>
  );
}
