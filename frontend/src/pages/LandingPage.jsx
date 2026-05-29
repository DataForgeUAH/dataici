import { useState } from 'react'

const NAV    = '#1B2D5B'
const RED    = '#C4122D'
const MUTED  = '#6278A0'
const BORDER = '#D8E0EF'

// ── Installation commands ─────────────────────────────────────────────────────
const GITHUB_URL = "https://github.com/DataForgeUAH/dataici.git"

const CMD_CREATE = `conda create --yes --name dataici python=3.11
conda activate dataici
pip install git+${GITHUB_URL}`

const CMD_UPDATE = `conda activate dataici
pip install --upgrade --force-reinstall --no-cache-dir git+${GITHUB_URL}`

const CMD_RUN = `conda activate dataici
dataici`

// ── CopyBlock ─────────────────────────────────────────────────────────────────
function CopyBlock({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div style={{ position: 'relative', background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 12, padding: '16px 20px', marginBottom: 14, fontFamily: 'monospace' }}>
      <pre style={{ margin: 0, fontSize: 13.5, color: '#e2e8f0', lineHeight: 1.9, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{code}</pre>
      <button onClick={copy} style={{
        position: 'absolute', top: 12, right: 12,
        background: copied ? '#16a34a' : NAV, color: 'white',
        border: 'none', borderRadius: 7, padding: '5px 14px',
        fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
      }}>
        {copied ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

function StepBadge({ n, color = NAV }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: color, color: 'white',
      fontWeight: 800, fontSize: 15,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, marginTop: 2,
    }}>{n}</div>
  )
}

export default function LandingPage({ onEnter }) {
  const [tab, setTab] = useState('create')

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FB', display: 'flex', flexDirection: 'column', fontSize: 16 }}>

      {/* Top nav */}
      <div style={{ background: NAV, padding: '0 48px', height: 60, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <DataIciIcon size={32} />
        <span style={{ fontWeight: 800, fontSize: 20, color: 'white', letterSpacing: '-0.3px' }}>DataForge</span>
        <span style={{ color: '#6E8FC4', fontSize: 13, marginLeft: 2 }}>v1.0.1 · UAH</span>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${NAV} 0%, #0f1e40 100%)`, padding: '80px 48px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>

        {/* Código pandas de fondo */}
        {[
          // horizontal
          { t: 'import pandas as pd',         x: '2%',   y: '8%',   r: 0,    o: 0.55 },
          { t: 'import pandas as pd',         x: '2%',   y: '14%',  r: 0,    o: 0.28 },
          { t: 'df.dropna()',                 x: '72%',  y: '16%',  r: 0,    o: 0.42 },
          { t: 'df.fillna(method="ffill")',   x: '2%',   y: '88%',  r: 0,    o: 0.48 },
          { t: 'pd.concat([df1, df2])',       x: '55%',  y: '94%',  r: 0,    o: 0.4  },
          { t: 'df.reset_index()',            x: '70%',  y: '92%',  r: 0,    o: 0.44 },
          { t: 'df.drop_duplicates()',        x: '28%',  y: '96%',  r: 0,    o: 0.38 },
          { t: 'df[df["col"] > 0]',           x: '2%',   y: '20%',  r: 0,    o: 0.36 },
          { t: 'df.to_csv("out.csv")',        x: '72%',  y: '38%',  r: 0,    o: 0.3  },
          { t: 'df.dtypes',                   x: '22%',  y: '12%',  r: 0,    o: 0.32 },
          // diagonal
          { t: 'pd.read_csv("data.csv")',     x: '78%',  y: '24%',  r: -35,  o: 0.4  },
          { t: 'df.resample("1H").mean()',    x: '2%',   y: '36%',  r: 25,   o: 0.36 },
          { t: 'df.rename(columns={...})',    x: '68%',  y: '74%',  r: -20,  o: 0.44 },
          { t: 'df.set_index("fecha")',       x: '6%',   y: '70%',  r: 15,   o: 0.3  },
          { t: 'df.groupby("col").agg("sum")',x: '44%',  y: '5%',   r: -12,  o: 0.34 },
          { t: 'df.astype({"col": float})',   x: '10%',  y: '92%',  r: -8,   o: 0.38 },
          { t: 'df.sample(n=100)',            x: '74%',  y: '50%',  r: 18,   o: 0.28 },
          { t: 'df.merge(df2, on="id")',      x: '42%',  y: '90%',  r: -15,  o: 0.3  },
          // vertical
          { t: 'df.describe()',               x: '96%',  y: '18%',  r: 90,   o: 0.38 },
          { t: 'df.info()',                   x: '0.5%', y: '62%',  r: -90,  o: 0.32 },
          { t: 'df.shape',                    x: '98%',  y: '55%',  r: 90,   o: 0.3  },
        ].map((s, i) => (
          <span key={i} style={{
            position: 'absolute', left: s.x, top: s.y,
            fontFamily: 'monospace', fontSize: 11, color: '#4a6fa1',
            opacity: s.o, transform: `rotate(${s.r}deg)`,
            transformOrigin: 'left top', whiteSpace: 'nowrap',
            pointerEvents: 'none', userSelect: 'none',
          }}>{s.t}</span>
        ))}

        {/* Contenido central */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 28 }}>
            <DataIciIcon size={88} light />
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 54, fontWeight: 800, letterSpacing: '-1.5px' }}>DataForge</h1>
          <p style={{ margin: '0 0 10px', fontSize: 22, color: '#93C5FD', fontWeight: 500 }}>
            Studio de Preprocesamiento de Datos
          </p>
          <p style={{ margin: '0 0 48px', fontSize: 15, color: '#6E8FC4' }}>
            Universidad Alberto Hurtado · Ingeniería Civil Industrial
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => document.getElementById('instalacion')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'rgba(255,255,255,0.12)', color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: 14, padding: '18px 44px',
              fontSize: 17, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s', letterSpacing: '0.02em',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            Cómo instalar ↓
          </button>

          <button
            onClick={() => { window.location.href = 'http://127.0.0.1:8000' }}
            style={{
              background: RED, color: 'white', border: 'none',
              borderRadius: 14, padding: '18px 44px',
              fontSize: 17, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(196,18,45,0.45)',
              transition: 'filter 0.15s', letterSpacing: '0.02em',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            Abrir DataForge →
          </button>
        </div>
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '32px 48px', flexWrap: 'wrap' }}>
        {[
          { icon: '🔗', label: 'Pipeline visual de bloques' },
          { icon: '🐍', label: 'Código Python generado' },
          { icon: '📊', label: 'Exploración de datos' },
        ].map(f => (
          <div key={f.label} style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 24, padding: '13px 28px', fontSize: 15, color: NAV, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 8px rgba(27,45,91,0.06)' }}>
            <span style={{ fontSize: 18 }}>{f.icon}</span>{f.label}
          </div>
        ))}
      </div>

      {/* Installation */}
      <div id="instalacion" style={{ maxWidth: 980, margin: '0 auto', padding: '0 48px 80px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Card 1 — Setup */}
        <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(27,45,91,0.08)' }}>
          <div style={{ background: NAV, padding: '22px 32px' }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>Instalación</h2>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#93C5FD' }}>
              Configura el entorno de DataForge en tu computador
            </p>
          </div>

          <div style={{ padding: '28px 32px' }}>
            {/* Prerequisite */}
            <div style={{ background: '#FDF3E6', border: '1px solid #F0C07B', borderRadius: 12, padding: '16px 22px', marginBottom: 28, fontSize: 14, color: '#865008', lineHeight: 1.7 }}>
              <strong>Requisito previo:</strong> Instala{' '}
              <a href="https://docs.conda.io/en/latest/miniconda.html" target="_blank" rel="noreferrer"
                style={{ color: '#c07000', fontWeight: 600 }}>Miniconda</a>
              {' '}(o Anaconda) si aún no lo tienes. No necesitas Node.js ni ninguna otra herramienta.
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `2px solid ${BORDER}`, marginBottom: 24 }}>
              {[
                { key: 'create', label: '✨ Primera instalación' },
                { key: 'update', label: '🔄 Actualizar entorno existente' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding: '12px 28px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
                  color: tab === t.key ? NAV : MUTED,
                  borderBottom: `3px solid ${tab === t.key ? NAV : 'transparent'}`,
                  marginBottom: -2, transition: 'color 0.15s',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 14, color: '#374151', margin: '0 0 16px' }}>
              {tab === 'create'
                ? 'Abre Anaconda Prompt (Windows) o terminal (macOS/Linux) y ejecuta:'
                : 'Si ya tienes el entorno creado, actualiza DataForge con este comando:'}
            </p>
            <CopyBlock code={tab === 'create' ? CMD_CREATE : CMD_UPDATE} />
            <p style={{ fontSize: 13, color: MUTED, margin: '6px 0 0' }}>
              Los mismos comandos funcionan en Windows, macOS y Linux.
            </p>
          </div>
        </div>

        {/* Card 2 — Run */}
        <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(27,45,91,0.08)' }}>
          <div style={{ background: '#0f572e', padding: '22px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 26 }}>🚀</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>Iniciar DataForge</h2>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#86efac' }}>
                Ejecuta esto cada vez que quieras usar la plataforma
              </p>
            </div>
          </div>

          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <StepBadge n={1} color="#0f572e" />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: '#374151', fontWeight: 500 }}>
                  En Anaconda Prompt o terminal, ejecuta:
                </p>
                <CopyBlock code={CMD_RUN} />
                <p style={{ fontSize: 13, color: MUTED, margin: '4px 0 0' }}>
                  El terminal mostrará la URL — <strong>no abrirá el navegador automáticamente</strong>.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <StepBadge n={2} color="#0f572e" />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: '#374151', fontWeight: 500 }}>
                  Vuelve a esta página y haz clic en <strong>Abrir DataForge →</strong> (botón de arriba).
                </p>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div style={{ fontSize: 14, color: '#065f46' }}>
                    Serás redirigido directamente a tus <strong>proyectos</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', borderTop: `1px solid ${BORDER}`, padding: '20px 48px', textAlign: 'center', fontSize: 13, color: MUTED, background: 'white' }}>
        DataForge · Universidad Alberto Hurtado · Proyecto de Tesis
      </div>
    </div>
  )
}

// ── Icono SVG de DataForge ────────────────────────────────────────────────────
function DataIciIcon({ size = 32, light = false }) {
  const c = light ? 'rgba(255,255,255,0.9)' : '#1B2D5B'
  const a = light ? 'rgba(196,18,45,0.85)' : '#C4122D'
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="8"  width="6" height="24" rx="2" fill={c} opacity="0.9"/>
      <rect x="11" y="4"  width="6" height="32" rx="2" fill={c}/>
      <rect x="20" y="12" width="6" height="16" rx="2" fill={a}/>
      <rect x="29" y="6"  width="6" height="28" rx="2" fill={c} opacity="0.7"/>
      <line x1="5" y1="20" x2="35" y2="20" stroke={light ? 'rgba(255,255,255,0.3)' : 'rgba(27,45,91,0.2)'} strokeWidth="1" strokeDasharray="2 3"/>
    </svg>
  )
}
