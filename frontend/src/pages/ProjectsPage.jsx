import { useState, useEffect } from 'react'
import axios from 'axios'

const NAV    = '#1B2D5B'
const RED    = '#C4122D'
const MUTED  = '#6278A0'
const BORDER = '#D8E0EF'
const LIGHT  = '#F4F7FB'

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export default function ProjectsPage({ onOpenProject, onBack }) {
  const [projects,     setProjects]     = useState([])
  const [search,       setSearch]       = useState('')
  const [selected,     setSelected]     = useState(null)
  const [showModal,    setShowModal]     = useState(false)
  const [newName,      setNewName]       = useState('')
  const [newDesc,      setNewDesc]       = useState('')
  const [creating,     setCreating]      = useState(false)
  const [delConfirm,   setDelConfirm]    = useState(null)

  useEffect(() => { loadProjects() }, [])

  const loadProjects = () => {
    axios.get('/api/projects').then(r => setProjects(r.data)).catch(() => {})
  }

  const createProject = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await axios.post('/api/projects', { name: newName.trim(), description: newDesc.trim() })
      setProjects(p => [res.data, ...p])
      setShowModal(false)
      setNewName('')
      setNewDesc('')
      onOpenProject(res.data)
    } catch {}
    setCreating(false)
  }

  const deleteProject = async (pid) => {
    await axios.delete(`/api/projects/${pid}`)
    setProjects(p => p.filter(x => x.id !== pid))
    if (selected?.id === pid) setSelected(null)
    setDelConfirm(null)
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: LIGHT, fontSize: 16 }}>

      {/* ── Top nav ── */}
      <div style={{ height: 60, background: NAV, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12, flexShrink: 0 }}>
        <DataIciIcon size={32} />
        <span style={{ fontWeight: 800, fontSize: 20, color: 'white' }}>DataForge</span>
        <span style={{ color: '#4a6fa1', fontSize: 13, marginLeft: 4, fontWeight: 500 }}>Preprocessing Studio</span>
        <div style={{ flex: 1 }} />
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>
          ← Inicio
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left: project list ── */}
        <div style={{ width: 380, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', background: 'white', flexShrink: 0 }}>

          {/* Search + new project */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setShowModal(true)} style={{
              width: 42, height: 42, borderRadius: '50%', background: NAV, color: 'white',
              border: 'none', fontSize: 24, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(27,45,91,0.3)',
            }}>+</button>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 15 }}>🔍</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar proyectos..."
                style={{ width: '100%', padding: '9px 12px 9px 36px', fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 9, outline: 'none', boxSizing: 'border-box', background: LIGHT, color: '#374151' }}
              />
            </div>
          </div>

          {/* Count */}
          <div style={{ padding: '7px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: MUTED }}>
              {filtered.length} proyecto{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Project list */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                {search ? 'Sin resultados' : 'No hay proyectos aún. Presiona + para crear uno.'}
              </div>
            )}
            {filtered.map(proj => (
              <div key={proj.id}
                onClick={() => setSelected(proj)}
                style={{
                  padding: '14px 18px',
                  borderBottom: `1px solid ${BORDER}`,
                  cursor: 'pointer',
                  background: selected?.id === proj.id ? '#EEF1FB' : 'white',
                  borderLeft: `4px solid ${selected?.id === proj.id ? NAV : 'transparent'}`,
                  transition: 'background 0.1s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: NAV, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.name}</div>
                    {proj.description && (
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.description}</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 500 }}>{fmtDate(proj.created_at)}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>mod: {fmtDate(proj.modified_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: project details ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
              {/* Details header */}
              <div style={{ padding: '28px 40px 24px', borderBottom: `1px solid ${BORDER}`, background: 'white', flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Proyecto</div>
                <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: NAV }}>{selected.name}</h2>
                {selected.description && (
                  <p style={{ margin: '0 0 14px', fontSize: 15, color: MUTED }}>{selected.description}</p>
                )}
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: MUTED }}>
                  <span>Creado: <strong style={{ color: '#374151' }}>{fmtDate(selected.created_at)} {fmtTime(selected.created_at)}</strong></span>
                  <span>Modificado: <strong style={{ color: '#374151' }}>{fmtDate(selected.modified_at)} {fmtTime(selected.modified_at)}</strong></span>
                </div>
              </div>

              {/* Pipeline info */}
              <div style={{ padding: '24px 40px', flex: 1 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                  <StatChip label="Bloques" value={selected.nodes?.length || 0} color={NAV} />
                  <StatChip label="Conexiones" value={selected.edges?.length || 0} color='#1A5E38' />
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 14 }}>
                  <button onClick={() => onOpenProject(selected)} style={{
                    flex: 1, padding: '16px', fontSize: 16, fontWeight: 700, border: 'none',
                    background: NAV, color: 'white', borderRadius: 14, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(27,45,91,0.3)', transition: 'filter 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    Abrir proyecto →
                  </button>
                  <button onClick={() => setDelConfirm(selected)} style={{
                    padding: '16px 24px', fontSize: 15, fontWeight: 600, border: `1px solid #E9A5AE`,
                    background: '#FAEAED', color: RED, borderRadius: 14, cursor: 'pointer',
                  }}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Selecciona un proyecto para ver sus detalles</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>o presiona + para crear uno nuevo</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── New project modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{ background: 'white', borderRadius: 20, width: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '22px 28px', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 22, marginRight: 12 }}>📁</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: NAV }}>Nuevo Proyecto</span>
              <button onClick={() => setShowModal(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 24, color: '#9ca3af', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '28px' }}>
              {/* Name input */}
              <div style={{ position: 'relative', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
                <div style={{ position: 'absolute', top: -10, left: 14, background: 'white', padding: '0 4px', fontSize: 12, color: MUTED, fontWeight: 600 }}>Nombre</div>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createProject()}
                  placeholder="Nombre del proyecto..."
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, fontWeight: 600, color: NAV, background: 'transparent', boxSizing: 'border-box' }}
                />
              </div>

              {/* Description textarea */}
              <div style={{ position: 'relative', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 16px', marginBottom: 28 }}>
                <div style={{ position: 'absolute', top: -10, left: 14, background: 'white', padding: '0 4px', fontSize: 12, color: MUTED, fontWeight: 600 }}>Descripción</div>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Descripción opcional..."
                  rows={4}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: '#374151', background: 'transparent', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '11px 24px', fontSize: 14, fontWeight: 600, background: LIGHT, border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 10, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={createProject} disabled={!newName.trim() || creating} style={{
                  padding: '11px 32px', fontSize: 14, fontWeight: 700, border: 'none',
                  background: newName.trim() ? NAV : '#d1d5db', color: 'white',
                  borderRadius: 10, cursor: newName.trim() ? 'pointer' : 'default',
                }}>
                  {creating ? 'Creando…' : 'Crear proyecto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {delConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 14, width: 380, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: NAV, marginBottom: 10 }}>¿Eliminar proyecto?</div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>
              Se eliminará <strong style={{ color: NAV }}>"{delConfirm.name}"</strong> de forma permanente.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDelConfirm(null)} style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600, background: LIGHT, border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 8, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={() => deleteProject(delConfirm.id)} style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, background: RED, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatChip({ label, value, color }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 28px', textAlign: 'center', minWidth: 110 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{label}</div>
    </div>
  )
}

function DataIciIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="8"  width="6" height="24" rx="2" fill="rgba(255,255,255,0.8)"/>
      <rect x="11" y="4" width="6" height="32" rx="2" fill="white"/>
      <rect x="20" y="12" width="6" height="16" rx="2" fill="#C4122D"/>
      <rect x="29" y="6" width="6" height="28" rx="2" fill="rgba(255,255,255,0.6)"/>
    </svg>
  )
}
