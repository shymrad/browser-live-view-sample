import React, { useState } from 'react'
import { BrowserLiveView } from 'bedrock-agentcore/browser/live-view'
import { HttpRequest } from '@smithy/protocol-http'
import { SignatureV4 } from '@smithy/signature-v4'
import { Sha256 } from '@aws-crypto/sha256-js'
import { REGION, BROWSER_ID, SESSION_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, SESSION_TOKEN } from './constants'

const REMOTE_WIDTH = 1920
const REMOTE_HEIGHT = 1080

async function generatePresignedUrl(sessionId: string): Promise<string> {
  const host = `bedrock-agentcore.${REGION}.amazonaws.com`
  const path = `/browser-streams/${BROWSER_ID}/sessions/${sessionId}/live-view`

  const signer = new SignatureV4({
    service: 'bedrock-agentcore',
    region: REGION,
    credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY, sessionToken: SESSION_TOKEN },
    sha256: Sha256,
  })

  const signed = await signer.presign(
    new HttpRequest({ protocol: 'https:', hostname: host, path, method: 'GET', headers: { host } }),
    { expiresIn: 300 },
  )

  const qs = Object.entries(signed.query ?? {})
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return `https://${host}${path}?${qs}`
}

const SessionPanel = ({ url, loading, onConnect, label, style }: { url: string | null; loading: boolean; onConnect: () => void; label: string; style?: React.CSSProperties }) => (
  <div style={{ aspectRatio: `${REMOTE_WIDTH}/${REMOTE_HEIGHT}`, background: url ? '' : '#1a1a2e', position: 'relative', overflow: 'hidden', ...style }}>
    {url ? (
      <BrowserLiveView signedUrl={url} remoteWidth={REMOTE_WIDTH} remoteHeight={REMOTE_HEIGHT} />
    ) : (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
        </svg>
        <span style={{ fontSize: '14px', color: '#adb5bd' }}>{label}</span>
        <button
          onClick={onConnect}
          disabled={loading}
          style={{ padding: '8px 24px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'wait' : 'pointer', background: '#ff9900', color: '#fff', border: 'none', borderRadius: '6px' }}
        >
          {loading ? 'Connecting…' : 'Connect'}
        </button>
      </div>
    )}
  </div>
)

const Card = ({ title, children, style }: { title?: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', ...style }}>
    {title && <div style={{ padding: '12px 16px', borderBottom: '1px solid #e9ecef', fontSize: '14px', fontWeight: 600, color: '#232f3e' }}>{title}</div>}
    {children}
  </div>
)

export const App: React.FC = () => {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    try { setError(null); setLoading(true); setUrl(await generatePresignedUrl(SESSION_ID)) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ background: '#232f3e', color: '#fff', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9900" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
        <span style={{ fontSize: '18px', fontWeight: 600 }}>AgentCore Browser</span>
        <span style={{ fontSize: '13px', color: '#adb5bd', marginLeft: 'auto' }}>Live View Demo</span>
      </header>

      {error && <div style={{ background: '#fff3cd', color: '#856404', padding: '8px 24px', fontSize: '13px' }}>{error}</div>}

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '24px', gap: '24px' }}>
        {/* Sidebar */}
        <aside style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Session Info">
            <div style={{ padding: '12px 16px', fontSize: '13px', color: '#6c757d' }}>
              {[['Region', REGION], ['Browser ID', BROWSER_ID.slice(0, 20) + '…'], ['Resolution', `${REMOTE_WIDTH}×${REMOTE_HEIGHT}`],
                ['Status', url ? '● Active' : '○ Idle'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 500, color: String(value).startsWith('●') ? '#28a745' : undefined }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recent Activity">
            <div style={{ padding: '12px 16px', fontSize: '13px', color: '#6c757d' }}>
              {['Agent navigated to aws.amazon.com', 'Form filled: search query', 'Screenshot captured', 'Page scroll completed', 'Cookie consent dismissed'].map((item, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < 4 ? '1px solid #f1f3f5' : 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#adb5bd' }}>•</span>{item}
                </div>
              ))}
            </div>
          </Card>

          {[['Uptime', '4m 32s', '↑ Active'], ['Bandwidth', '2.4 Mbps', '↓ Stable'], ['Latency', '18ms', '● Low']].map(([label, value, badge]) => (
            <Card key={label}>
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '22px', fontWeight: 600, color: '#232f3e' }}>{value}</div>
                <div style={{ fontSize: '12px', color: '#28a745', marginTop: '4px' }}>{badge}</div>
              </div>
            </Card>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Browser Session — Live View">
            <SessionPanel url={url} loading={loading} onConnect={connect} label="Click to connect" />
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[['Actions', '47', 'Total steps executed'], ['Pages Visited', '12', 'Unique URLs loaded'], ['Avg Response', '210ms', 'Server response time'], ['Errors', '0', 'Failed requests']].map(([label, value, sub]) => (
              <Card key={label}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#232f3e', margin: '4px 0 2px' }}>{value}</div>
                  <div style={{ fontSize: '12px', color: '#adb5bd' }}>{sub}</div>
                </div>
              </Card>
            ))}
          </div>

          <Card title="Session Logs" style={{ width: '100%' }}>
            <div style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#6c757d', lineHeight: 1.8 }}>
              {['10:12:01 GET /search → 200 OK', '10:12:03 Click #submit-btn', '10:12:04 Navigation → /results', '10:12:06 Scroll → y:480', '10:12:08 Screenshot saved', '10:12:10 GET /api/data → 200 OK', '10:12:12 Input #email → <value>', '10:12:14 Click .next-page'].map((line, i) => (
                <div key={i} style={{ borderBottom: '1px solid #f1f3f5', padding: '4px 0' }}>{line}</div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
