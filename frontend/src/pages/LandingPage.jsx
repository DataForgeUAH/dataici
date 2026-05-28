import { useState } from 'react'

const NAV    = '#1B2D5B'
const RED    = '#C4122D'
const MUTED  = '#6278A0'
const BORDER = '#D8E0EF'

// ── Installation commands ─────────────────────────────────────────────────────
// Reemplaza USERNAME con el usuario real de GitHub antes de publicar
const GITHUB_URL = "https://github.com/DataForgeUAH/dataici.git"

const CMD_CREATE = `conda create --yes --name dataici python=3.11
conda activate dataici
pip install git+${GITHUB_URL}`

const CMD_UPDATE = `conda activate dataici
pip install --upgrade git+${GITHUB_URL}`

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
    <div style={{ position: 'relative', background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 10, padding: '14px 16px', marginBottom: 12, fontFamily: 'monospace' }}>
      <pre style={{ margin: 0, fontSize: 12, color: '#e2e8f0', lineHeight: 1.85, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{code}</pre>
      <button onClick={copy} style={{
        position: 'absolute', top: 10, right: 10,
        background: copied ? '#16a34a' : NAV, color: 'white',
        border: 'none', borderRadius: 6, padding: '4px 12px',
        fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
      }}>
        {copied ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

function StepBadge({ n, color = NAV }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: color, color: 'white',
      fontWeight: 800, fontSize: 13,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, marginTop: 1,
    }}>{n}</div>
  )
}

// Detecta si está corriendo local (app instalada) o en web pública
const IS_LOCAL = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export default function LandingPage({ onEnter }) {
  const [tab, setTab] = useState('create')

  // ── Modo local: pantalla de conexión limpia ──────────────────────────────
  if (IS_LOCAL) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${NAV} 0%, #0f1e40 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Nav mínimo */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 52, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 10 }}>
          <DataIciIcon size={26} light />
          <span style={{ fontWeight: 800, fontSize: 16, color: 'white', letterSpacing: '-0.3px' }}>DataForge</span>
          <span style={{ color: '#6E8FC4', fontSize: 11 }}>v1.0 · UAH</span>
        </div>

        {/* Centro */}
        <div style={{ textAlign: 'center', color: 'white', padding: '0 40px' }}>
          <div style={{ marginBottom: 28 }}>
            <DataIciIcon size={80} light />
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: 46, fontWeight: 800, letterSpacing: '-1.5px' }}>DataForge</h1>
          <p style={{ margin: '0 0 6px', fontSize: 17, color: '#93C5FD', fontWeight: 500 }}>
            Studio de Preprocesamiento de Datos
          </p>
          <p style={{ margin: '0 0 48px', fontSize: 13, color: '#6E8FC4' }}>
            Universidad Alberto Hurtado · Ingeniería Civil Industrial
          </p>

          {/* Indicador de conexión */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            <span style={{ fontSize: 13, color: '#86efac', fontWeight: 500 }}>DataForge conectado · 127.0.0.1:8000</span>
          </div>

          <button onClick={onEnter} style={{
            background: RED, color: 'white', border: 'none',
            borderRadius: 14, padding: '18px 56px',
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(196,18,45,0.5)',
            transition: 'filter 0.15s', letterSpacing: '0.02em',
          }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            Abrir DataForge →
          </button>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 20, fontSize: 11, color: '#3D5A8A' }}>
          DataForge · Universidad Alberto Hurtado · Proyecto de Tesis
        </div>
      </div>
    )
  }

  // ── Modo web pública: landing con instrucciones ──────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FB', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top nav ── */}
      <div style={{ background: NAV, padding: '0 40px', height: 52, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <DataIciIcon size={28} />
        <span style={{ fontWeight: 800, fontSize: 17, color: 'white', letterSpacing: '-0.3px' }}>DataForge</span>
        <span style={{ color: '#6E8FC4', fontSize: 11, marginLeft: 2 }}>v1.0 · UAH</span>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(135deg, ${NAV} 0%, #0f1e40 100%)`, padding: '60px 40px', textAlign: 'center', color: 'white' }}>
        <div style={{ marginBottom: 24 }}>
          <DataIciIcon size={72} light />
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: 42, fontWeight: 800, letterSpacing: '-1px' }}>DataForge</h1>
        <p style={{ margin: '0 0 8px', fontSize: 18, color: '#93C5FD', fontWeight: 500 }}>
          Studio de Preprocesamiento de Datos
        </p>
        <p style={{ margin: '0 0 40px', fontSize: 14, color: '#6E8FC4' }}>
          Universidad Alberto Hurtado · Ingeniería Civil Industrial
        </p>
        <button
          onClick={() => document.getElementById('instalacion')?.scrollIntoView({ behavior: 'smooth' })}
          style={{
            background: RED, color: 'white', border: 'none',
            borderRadius: 12, padding: '16px 48px',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(196,18,45,0.4)',
            transition: 'filter 0.15s', letterSpacing: '0.02em',
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}
        >
          Cómo instalar ↓
        </button>
      </div>

      {/* ── Feature pills ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '28px 40px' }}>
        {[
          { icon: '🔗', label: 'Pipeline visual de bloques' },
          { icon: '🐍', label: 'Código Python generado' },
          { icon: '📊', label: 'Exploración de datos' },
        ].map(f => (
          <div key={f.label} style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '10px 22px', fontSize: 13, color: NAV, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{f.icon}</span>{f.label}
          </div>
        ))}
      </div>

      {/* ── Installation ── */}
      <div id="instalacion" style={{ maxWidth: 860, margin: '0 auto', padding: '0 40px 60px', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Card 1 — Setup */}
        <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,45,91,0.07)' }}>
          <div style={{ background: NAV, padding: '18px 28px' }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>Instalación</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#93C5FD' }}>
              Configura el entorno de DataForge en tu computador
            </p>
          </div>

          <div style={{ padding: '24px 28px' }}>
            {/* Prerequisite */}
            <div style={{ background: '#FDF3E6', border: '1px solid #F0C07B', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#865008', lineHeight: 1.6 }}>
              <strong>Requisito previo:</strong> Instala{' '}
              <a href="https://docs.conda.io/en/latest/miniconda.html" target="_blank" rel="noreferrer"
                style={{ color: '#c07000', fontWeight: 600 }}>Miniconda</a>
              {' '}(o Anaconda) si aún no lo tienes. No necesitas Node.js ni ninguna otra herramienta.
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `2px solid ${BORDER}`, marginBottom: 20 }}>
              {[
                { key: 'create', label: '✨ Primera instalación' },
                { key: 'update', label: '🔄 Actualizar entorno existente' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding: '10px 24px', fontSize: 13, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
                  color: tab === t.key ? NAV : MUTED,
                  borderBottom: `3px solid ${tab === t.key ? NAV : 'transparent'}`,
                  marginBottom: -2, transition: 'color 0.15s',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 13, color: '#374151', margin: '0 0 14px' }}>
              {tab === 'create'
                ? 'Abre Anaconda Prompt (Windows) o terminal (macOS/Linux) y ejecuta:'
                : 'Si ya tienes el entorno creado, actualiza DataForge con este comando:'}
            </p>
            <CopyBlock code={tab === 'create' ? CMD_CREATE : CMD_UPDATE} />
            <p style={{ fontSize: 12, color: MUTED, margin: '4px 0 0' }}>
              Los mismos comandos funcionan en Windows, macOS y Linux.
            </p>
          </div>
        </div>

        {/* Card 2 — Run */}
        <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(27,45,91,0.07)' }}>
          <div style={{ background: '#0f572e', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🚀</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>Iniciar DataForge</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#86efac' }}>
                Ejecuta esto cada vez que quieras usar la plataforma
              </p>
            </div>
          </div>

          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <StepBadge n={1} color="#0f572e" />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                  En Anaconda Prompt o terminal, navega a la carpeta del proyecto y ejecuta:
                </p>
                <CopyBlock code={CMD_RUN} />
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <StepBadge n={2} color="#0f572e" />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                  Abre tu navegador en:
                </p>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div>
                    <code style={{ background: 'white', border: '1px solid #d1fae5', padding: '5px 12px', borderRadius: 6, fontWeight: 700, fontSize: 15, color: '#065f46' }}>
                      http://127.0.0.1:8000
                    </code>
                    <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                      y haz clic en <strong>Abrir DataForge</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', borderTop: `1px solid ${BORDER}`, padding: '16px 40px', textAlign: 'center', fontSize: 12, color: MUTED, background: 'white' }}>
        DataForge · Universidad Alberto Hurtado · Proyecto de Tesis
      </div>
    </div>
  )
}

// ── Icono SVG de DataForge ──────────────────────────────────────────────────────
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
