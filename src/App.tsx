import React, { useState } from 'react'
import { BrowserLiveView } from 'bedrock-agentcore/browser/live-view'
import { HttpRequest } from '@smithy/protocol-http'
import { SignatureV4 } from '@smithy/signature-v4'
import { Sha256 } from '@aws-crypto/sha256-js'
import { REGION, BROWSER_ID, SESSION_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, SESSION_TOKEN } from './constants'

const VIEWPORT = { width: 1920, height: 1080 }

async function generatePresignedUrl(): Promise<string> {
  const host = `bedrock-agentcore.${REGION}.amazonaws.com`
  const path = `/browser-streams/${BROWSER_ID}/sessions/${SESSION_ID}/live-view`

  const signer = new SignatureV4({
    service: 'bedrock-agentcore',
    region: REGION,
    credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY, sessionToken: SESSION_TOKEN },
    sha256: Sha256,
  })

  // Must use https: protocol for signing — the DCV SDK handles wss upgrade internally
  const signed = await signer.presign(
    new HttpRequest({ protocol: 'https:', hostname: host, path, method: 'GET', headers: { host } }),
    { expiresIn: 300 },
  )

  const qs = Object.entries(signed.query ?? {})
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return `https://${host}${path}?${qs}`
}

export const App: React.FC = () => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setError(null)
      setSignedUrl(await generatePresignedUrl())
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (signedUrl) {
    return (
      <div style={{ width: '100%', maxWidth: '1800px', aspectRatio: `${VIEWPORT.width}/${VIEWPORT.height}`, margin: '0 auto' }}>
        <BrowserLiveView signedUrl={signedUrl} remoteWidth={VIEWPORT.width} remoteHeight={VIEWPORT.height} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>Browser Live View Sample</h2>
        <p style={{ margin: '12px 0', color: '#666' }}>Fill in <code>src/constants.ts</code>, then click Connect.</p>
        {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}
        <button onClick={handleConnect} style={{ padding: '10px 24px', fontSize: '16px', cursor: 'pointer' }}>
          Connect
        </button>
      </div>
    </div>
  )
}
