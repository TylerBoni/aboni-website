import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Aboni Tech'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#ffffff',
          padding: '72px',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
        }}
      >
        <div style={{ fontSize: 32, opacity: 0.8 }}>Aboni Tech</div>
        <div style={{ marginTop: 24, fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
          Engineering automation that scales.
        </div>
      </div>
    ),
    size,
  )
}
