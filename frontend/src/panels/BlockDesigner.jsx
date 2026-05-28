import { useState, useEffect } from 'react'
import { ColumnExplore } from './ResultsView.jsx'

// ── UAH palette ───────────────────────────────────────────────────────────────
const UAH = { navy: '#1B2D5B', red: '#C4122D', border: '#D8E0EF', muted: '#6278A0', light: '#F4F7FB' }

// ── Shared column panel styles ────────────────────────────────────────────────
const colPanelStyle    = { width: 240, borderRight: `1px solid ${UAH.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
const colHeaderStyle   = { padding: '8px 14px', borderBottom: `1px solid ${UAH.border}`, fontSize: 13, fontWeight: 600, color: UAH.navy, flexShrink: 0 }
const colItemStyle = (active) => ({
  padding: '9px 14px', fontSize: 13, cursor: 'pointer', userSelect: 'none',
  borderBottom: '1px solid #f3f4f6',
  background: active ? '#EEF1FB' : 'white',
  color: active ? UAH.navy : '#374151',
  borderLeft: `3px solid ${active ? UAH.navy : 'transparent'}`,
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
})
const previewPanelStyle  = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
const previewHeaderStyle = { padding: '8px 20px', borderBottom: `1px solid ${UAH.border}`, fontSize: 13, fontWeight: 600, color: UAH.navy, flexShrink: 0 }

// ── FilterRows shared atoms (OUTSIDE component to keep stable reference) ──────
const AMBER   = '#f59e0b'
const CARD_BG = '#fefce8'
const CARD_BD = '#fde68a'

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 12, color: '#92400e', fontFamily: 'monospace', marginBottom: 2, marginTop: 14 }}>
      {children}
    </div>
  )
}

function USelect({ value, options, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', fontSize: 14, border: 'none',
        borderBottom: `1px solid ${AMBER}`, background: 'transparent',
        color: value ? '#111' : '#9ca3af', padding: '4px 24px 4px 0', outline: 'none',
        cursor: 'pointer', appearance: 'none', fontFamily: 'monospace',
      }}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#92400e', fontSize: 11 }}>▾</span>
    </div>
  )
}

function UInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', fontSize: 14, border: 'none',
        borderBottom: `1px solid ${AMBER}`, background: 'transparent',
        color: '#111', padding: '4px 0', outline: 'none', fontFamily: 'monospace',
      }}
    />
  )
}

// ── Append a Column ───────────────────────────────────────────────────────────
function AppendColumnDesigner({ node, onUpdate }) {
  const [colname, setColname] = useState(node.data.params?.colname || 'new_col')
  useEffect(() => { onUpdate({ colname }) }, [colname])

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <label style={{ fontSize: 12, color: UAH.muted, fontWeight: 500 }}>colname</label>
      <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${UAH.border}`, borderRadius: 6, overflow: 'hidden' }}>
        <input value={colname} onChange={e => setColname(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: 'none', outline: 'none', fontFamily: 'monospace' }} />
        <button onClick={() => setColname('')} style={{ padding: '8px 10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16 }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
        La columna se creará con valores <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>None</code>
      </div>
    </div>
  )
}

// ── Drop Columns ──────────────────────────────────────────────────────────────
function DropColumnsDesigner({ node, columns, onUpdate }) {
  const init = node.data.params?.columns ? node.data.params.columns.split(',').map(s => s.trim()).filter(Boolean) : []
  const [dropped, setDropped] = useState(init)
  useEffect(() => { onUpdate({ columns: dropped.join(', ') }) }, [dropped])

  const remaining = columns.filter(c => !dropped.includes(c))
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={colPanelStyle}>
        <div style={colHeaderStyle}>DataFrame Columns</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {remaining.map(col => <div key={col} onClick={() => setDropped(s => [...s, col])} style={colItemStyle(false)}>{col}</div>)}
        </div>
      </div>
      <div style={colPanelStyle}>
        <div style={colHeaderStyle}>Dropped Columns</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {dropped.map(col => (
            <div key={col} onClick={() => setDropped(s => s.filter(c => c !== col))} style={{ ...colItemStyle(true), display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{col}</span>
              <span style={{ color: '#9ca3af', marginLeft: 4, flexShrink: 0 }}>×</span>
            </div>
          ))}
          {dropped.length === 0 && <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Haz clic en columnas para eliminar.</div>}
        </div>
      </div>
      <div style={previewPanelStyle}>
        <div style={previewHeaderStyle}>Drop</div>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 20px' }}>
          {dropped.map((col, i) => (
            <div key={col} style={{ padding: '5px 0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#1A5E38', fontWeight: 600, minWidth: 20 }}>{columns.indexOf(col)}</span>
              <span style={{ color: '#374151' }}>— {col}</span>
            </div>
          ))}
          {dropped.length === 0 && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Sin columnas seleccionadas.</div>}
        </div>
      </div>
    </div>
  )
}

// ── Rename Columns ────────────────────────────────────────────────────────────
function RenameColumnsDesigner({ node, columns, onUpdate }) {
  const initMapping = {}
  if (node.data.params?.mapping) {
    node.data.params.mapping.split('|').forEach(pair => {
      const [old, newName] = pair.split(':').map(s => s.trim())
      if (old && newName) initMapping[old] = newName
    })
  }
  const [mapping, setMapping]   = useState(initMapping)
  const [selected, setSelected] = useState(null)
  const [toValue, setToValue]   = useState('')

  useEffect(() => {
    onUpdate({ mapping: Object.entries(mapping).map(([k, v]) => `${k}:${v}`).join('|') })
  }, [mapping])

  const applyRename = () => {
    if (!selected || !toValue.trim()) return
    setMapping(m => ({ ...m, [selected]: toValue.trim() }))
    setSelected(null); setToValue('')
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={colPanelStyle}>
        <div style={colHeaderStyle}>DataFrame Columns</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {columns.map(col => (
            <div key={col} onClick={() => { setSelected(col); setToValue(mapping[col] || '') }} style={colItemStyle(selected === col || col in mapping)}>
              {col}{col in mapping && <span style={{ fontSize: 10, color: UAH.navy, marginLeft: 6 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ width: 240, borderRight: `1px solid ${UAH.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={colHeaderStyle}>Rename the Column</div>
        <div style={{ padding: 16, flex: 1 }}>
          {selected ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 12 }}>{selected}</div>
              <input value={toValue} onChange={e => setToValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyRename()} placeholder="to" autoFocus
                style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${UAH.border}`, borderRadius: 6, fontFamily: 'monospace', marginBottom: 10 }} />
              <button onClick={applyRename} style={{ width: '100%', padding: '7px', fontSize: 12, fontWeight: 600, background: '#EEF1FB', color: UAH.navy, border: `1px solid ${UAH.border}`, borderRadius: 6, cursor: 'pointer' }}>Aplicar</button>
            </>
          ) : <div style={{ fontSize: 12, color: '#9ca3af' }}>Selecciona una columna para renombrar.</div>}
        </div>
      </div>
      <div style={previewPanelStyle}>
        <div style={previewHeaderStyle}>Renamed Columns</div>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 20px' }}>
          {Object.entries(mapping).map(([old, newName]) => (
            <div key={old} onClick={() => { setMapping(m => { const n = { ...m }; delete n[old]; return n }) }} style={{ padding: '6px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}>
              <div style={{ fontSize: 13, color: '#374151' }}>{old}</div>
              <div style={{ fontSize: 12, color: UAH.navy, fontWeight: 600 }}>{newName}</div>
            </div>
          ))}
          {Object.keys(mapping).length === 0 && <div style={{ fontSize: 12, color: '#9ca3af' }}>Sin renombrados aún.</div>}
        </div>
      </div>
    </div>
  )
}

// ── Reorder Columns ───────────────────────────────────────────────────────────
function ReorderColumnsDesigner({ node, columns, onUpdate }) {
  const initOrder = node.data.params?.columns
    ? node.data.params.columns.split(',').map(s => s.trim()).filter(c => columns.includes(c))
    : [...columns]
  const [order, setOrder]     = useState(initOrder.length ? initOrder : [...columns])
  const [selected, setSelected] = useState(null)
  useEffect(() => { onUpdate({ columns: order.join(', ') }) }, [order])

  const moveUp   = (i) => { if (i === 0) return; const n = [...order]; [n[i-1], n[i]] = [n[i], n[i-1]]; setOrder(n) }
  const moveDown = (i) => { if (i === order.length-1) return; const n = [...order]; [n[i+1], n[i]] = [n[i], n[i+1]]; setOrder(n) }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={colPanelStyle}>
        <div style={colHeaderStyle}>DataFrame Columns</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {columns.map(col => <div key={col} style={colItemStyle(false)}>{col}</div>)}
        </div>
      </div>
      <div style={{ width: 260, borderRight: `1px solid ${UAH.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={colHeaderStyle}>Original Order</div>
        <div style={{ overflow: 'auto', flex: 1, padding: '4px 0' }}>
          {columns.map((col, i) => (
            <div key={col} style={{ padding: '6px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#1A5E38', fontWeight: 600, minWidth: 20, fontSize: 12 }}>{i}</span>
              <span style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>— {col}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={previewPanelStyle}>
        <div style={previewHeaderStyle}>New Order</div>
        <div style={{ overflow: 'auto', flex: 1, padding: '4px 0' }}>
          {order.map((col, i) => (
            <div key={col} onClick={() => setSelected(selected === col ? null : col)}
              style={{ padding: '6px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selected === col ? '#EEF1FB' : 'white' }}>
              <span style={{ color: '#1A5E38', fontWeight: 600, minWidth: 20, fontSize: 12 }}>{i}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' }}>— {col}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); moveUp(i) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 12, lineHeight: 1, padding: '1px 4px' }}>▲</button>
                <button onClick={e => { e.stopPropagation(); moveDown(i) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 12, lineHeight: 1, padding: '1px 4px' }}>▼</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Select Columns ────────────────────────────────────────────────────────────
function SelectColumnsDesigner({ node, columns, onUpdate }) {
  const init = node.data.params?.columns ? node.data.params.columns.split(',').map(s => s.trim()).filter(Boolean) : []
  const [selected, setSelected] = useState(init)
  useEffect(() => { onUpdate({ columns: selected.join(', ') }) }, [selected])
  const remaining = columns.filter(c => !selected.includes(c))

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={colPanelStyle}>
        <div style={colHeaderStyle}>DataFrame Columns</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {remaining.map(col => <div key={col} onClick={() => setSelected(s => [...s, col])} style={colItemStyle(false)}>{col}</div>)}
          {remaining.length === 0 && columns.length > 0 && <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Todas las columnas seleccionadas.</div>}
        </div>
      </div>
      <div style={colPanelStyle}>
        <div style={{ ...colHeaderStyle, display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1 }}>Selected Columns</span>
          {selected.length > 0 && <button onClick={() => setSelected([])} style={{ fontSize: 10, color: UAH.red, background: 'none', border: 'none', cursor: 'pointer' }}>Limpiar</button>}
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {selected.map(col => (
            <div key={col} onClick={() => setSelected(s => s.filter(c => c !== col))} style={{ ...colItemStyle(true), display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{col}</span>
              <span style={{ color: '#9ca3af', marginLeft: 4, flexShrink: 0 }}>×</span>
            </div>
          ))}
          {selected.length === 0 && <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Haz clic en columnas para seleccionar.</div>}
        </div>
      </div>
      <div style={previewPanelStyle}>
        <div style={previewHeaderStyle}>Select</div>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 20px' }}>
          {selected.map((col, i) => (
            <div key={col} style={{ padding: '5px 0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#1A5E38', fontWeight: 600, minWidth: 20 }}>{i + 1}</span>
              <span>— {col}</span>
            </div>
          ))}
          {selected.length === 0 && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Sin columnas seleccionadas.</div>}
        </div>
      </div>
    </div>
  )
}


// ── Set Index ─────────────────────────────────────────────────────────────────
function SetIndexDesigner({ node, columns, onUpdate }) {
  const init = node.data.params?.columns ? node.data.params.columns.split(',').map(c => c.trim()).filter(Boolean) : []
  const [selected, setSelected] = useState(init)
  useEffect(() => { onUpdate({ columns: selected.join(', ') }) }, [selected])
  const toggle = (col) => setSelected(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={colPanelStyle}>
        <div style={colHeaderStyle}>DataFrame Columns</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {columns.map(col => <div key={col} onClick={() => toggle(col)} style={colItemStyle(selected.includes(col))}>{col}</div>)}
          {columns.length === 0 && <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Ejecuta el bloque anterior primero.</div>}
        </div>
      </div>
      <div style={colPanelStyle}>
        <div style={colHeaderStyle}>Index Columns</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {selected.map(col => (
            <div key={col} onClick={() => toggle(col)} style={{ ...colItemStyle(true), display: 'flex', justifyContent: 'space-between' }}>
              <span>{col}</span><span style={{ color: '#9ca3af' }}>×</span>
            </div>
          ))}
          {selected.length === 0 && <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Haz clic en una columna.</div>}
        </div>
      </div>
      <div style={previewPanelStyle}>
        <div style={previewHeaderStyle}>Index</div>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 20px' }}>
          {selected.map((col, i) => (
            <div key={col} style={{ padding: '5px 0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#1A5E38', fontWeight: 600, minWidth: 20 }}>{i}</span>
              <span>— {col}</span>
            </div>
          ))}
          {selected.length === 0 && <div style={{ fontSize: 12, color: '#9ca3af' }}>Sin columna seleccionada.</div>}
        </div>
      </div>
    </div>
  )
}

// ── Set Dtypes ────────────────────────────────────────────────────────────────
function SetDtypesDesigner({ node, columns, onUpdate }) {
  const DTYPE_OPTIONS = ['numeric', 'datetime', 'categorical', 'string', 'boolean', 'integer']
  const DTYPE_COLORS  = { numeric: UAH.navy, datetime: UAH.red, categorical: '#865008', string: '#1A5E38', boolean: UAH.red, integer: '#0B6B70' }

  const parseMapping = (raw) => {
    const map = {}
    if (!raw) return map
    for (const pair of raw.split(';')) {
      const parts = pair.split(':').map(s => s.trim())
      if (parts.length >= 2 && parts[0]) map[parts[0]] = parts[1]
    }
    return map
  }

  const [mapping, setMapping]     = useState(() => parseMapping(node.data.params?.mapping || ''))
  const [selected, setSelected]   = useState(null)
  const [convertTo, setConvertTo] = useState('')

  useEffect(() => {
    onUpdate({ mapping: Object.entries(mapping).map(([c, t]) => `${c}:${t}`).join(';') })
  }, [mapping])

  const selectCol  = (col) => { setSelected(col); setConvertTo(mapping[col] || '') }
  const addFormat  = () => { if (!selected || !convertTo) return; setMapping(p => ({ ...p, [selected]: convertTo })) }
  const removeDtype = (col) => { setMapping(p => { const n = { ...p }; delete n[col]; return n }); if (selected === col) { setSelected(null); setConvertTo('') } }
  const currentDtype = selected ? (mapping[selected] || 'object') : null

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={colPanelStyle}>
        <div style={colHeaderStyle}>DataFrame Columns</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {columns.map(col => <div key={col} onClick={() => selectCol(col)} style={colItemStyle(selected === col)}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</span></div>)}
          {columns.length === 0 && <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Ejecuta el bloque anterior primero.</div>}
        </div>
      </div>
      <div style={{ width: 260, borderRight: `1px solid ${UAH.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={colHeaderStyle}>Set Column's Dtype</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
          {selected ? (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: UAH.navy, marginBottom: 4 }}>{selected}</div>
                <div style={{ fontSize: 12, color: UAH.muted }}>dtype: <span style={{ color: DTYPE_COLORS[currentDtype] || '#374151', fontWeight: 600 }}>{currentDtype}</span></div>
              </div>
              <div style={{ width: '100%' }}>
                <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>convert to</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', border: `1px solid ${UAH.border}`, borderRadius: 6, overflow: 'hidden', background: 'white' }}>
                  <select value={convertTo} onChange={e => setConvertTo(e.target.value)}
                    style={{ flex: 1, padding: '8px 32px 8px 10px', fontSize: 13, border: 'none', outline: 'none', background: 'transparent', appearance: 'none', cursor: 'pointer', color: convertTo ? (DTYPE_COLORS[convertTo] || '#374151') : '#9ca3af', fontWeight: convertTo ? 600 : 400 }}>
                    <option value="" disabled>— elegir tipo —</option>
                    {DTYPE_OPTIONS.map(dt => <option key={dt} value={dt} style={{ color: DTYPE_COLORS[dt] || '#374151' }}>{dt}</option>)}
                  </select>
                  {convertTo && <button onClick={() => setConvertTo('')} style={{ position: 'absolute', right: 24, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>}
                  <span style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: '#9ca3af', fontSize: 12 }}>▾</span>
                </div>
              </div>
              <button onClick={addFormat} disabled={!convertTo}
                style={{ width: '100%', padding: '9px', fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: convertTo ? 'pointer' : 'not-allowed', background: convertTo ? UAH.navy : '#e5e7eb', color: convertTo ? 'white' : '#9ca3af', border: 'none' }}>
                Add Format
              </button>
            </>
          ) : <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>Selecciona una columna<br />para configurar su tipo.</div>}
        </div>
      </div>
      <div style={previewPanelStyle}>
        <div style={previewHeaderStyle}>Configured Columns</div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          {Object.entries(mapping).map(([col, dtype]) => (
            <div key={col} onClick={() => selectCol(col)}
              style={{ padding: '8px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: selected === col ? '#EEF1FB' : 'white' }}>
              <div>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{col}</div>
                <div style={{ fontSize: 11, color: DTYPE_COLORS[dtype] || '#374151', marginTop: 2 }}>{dtype}</div>
              </div>
              <span onClick={e => { e.stopPropagation(); removeDtype(col) }}
                style={{ color: '#d1d5db', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}
                onMouseEnter={e => e.currentTarget.style.color = UAH.red}
                onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>×</span>
            </div>
          ))}
          {Object.keys(mapping).length === 0 && <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Aún no hay columnas configuradas.</div>}
        </div>
      </div>
    </div>
  )
}

// ── Concatenate ───────────────────────────────────────────────────────────────
function ConcatenateDesigner({ node, onUpdate }) {
  const p = node.data.params || {}

  const [inputCount,    setInputCount]    = useState(Math.max(2, parseInt(p.input_count) || 2))
  const [axis,          setAxis]          = useState(p.axis          || 'index')
  const [join,          setJoin]          = useState(p.join          || 'outer')
  const [changeColNames,setChangeColNames]= useState(p.change_col_names || 'None')
  const [ignoreIndex,   setIgnoreIndex]   = useState(p.ignore_index === 'true' || p.ignore_index === true)
  const [sort,          setSort]          = useState(p.sort === 'true' || p.sort === true)

  useEffect(() => {
    onUpdate({ input_count: inputCount, axis, join, change_col_names: changeColNames, ignore_index: ignoreIndex, sort })
  }, [inputCount, axis, join, changeColNames, ignoreIndex, sort])

  // Shared styled select with floating label
  const LabeledSelect = ({ label, value, options, onChange }) => (
    <div style={{ position: 'relative', border: `1px solid ${UAH.border}`, borderRadius: 8, padding: '6px 12px 8px', marginBottom: 18 }}>
      <div style={{ position: 'absolute', top: -9, left: 10, background: 'white', padding: '0 4px', fontSize: 11, color: '#9ca3af' }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', fontSize: 14, border: 'none', outline: 'none', background: 'transparent', color: '#111', padding: '4px 0', cursor: 'pointer', appearance: 'none' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-25%)', pointerEvents: 'none', color: UAH.muted, fontSize: 12 }}>▾</span>
    </div>
  )

  const Toggle = ({ value, onChange, label }) => (
    <div onClick={() => onChange(!value)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 18 }}>
      <div style={{ width: 44, height: 26, borderRadius: 13, background: value ? UAH.navy : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: 'white', position: 'absolute', top: 3, left: value ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      <span style={{ fontSize: 14, color: '#374151' }}>{label}</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* ── Left: port management ── */}
      <div style={{ width: 260, borderRight: `1px solid ${UAH.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
        <div style={colHeaderStyle}>More DataFrames?</div>
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
          {Array.from({ length: inputCount }, (_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#E8F5EE', border: '1px solid #8FC8AA', borderRadius: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1A5E38', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 12, color: '#1A5E38', fontWeight: 500 }}>DataFrame {i + 1}</span>
              <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{i === 0 ? 'principal' : `entrada ${i + 1}`}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, lineHeight: 1.5 }}>Conecta los nodos fuente a los puertos del nodo en el canvas.</div>
        </div>
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${UAH.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => setInputCount(c => c + 1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#1A5E38', padding: '5px 0' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #1A5E38', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, lineHeight: 1, flexShrink: 0 }}>+</span>
            add port
          </button>
          <button onClick={() => setInputCount(c => Math.max(2, c - 1))} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: inputCount > 2 ? 'pointer' : 'default', fontSize: 13, color: inputCount > 2 ? UAH.red : '#d1d5db', padding: '5px 0' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${inputCount > 2 ? UAH.red : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, lineHeight: 1, flexShrink: 0 }}>-</span>
            remove port
          </button>
        </div>
      </div>

      {/* ── Right: dynamic settings form ── */}
      <div style={{ flex: 1, padding: 32, overflow: 'auto', maxWidth: 400 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: UAH.navy, marginBottom: 24 }}>Concatenation</div>

        <LabeledSelect label="axis" value={axis} options={['index', 'columns']} onChange={v => { setAxis(v); setIgnoreIndex(false) }} />
        <LabeledSelect label="join" value={join} options={['outer', 'inner']} onChange={setJoin} />

        {/* axis=columns → change column names */}
        {axis === 'columns' && (
          <LabeledSelect
            label="change column names"
            value={changeColNames}
            options={['None', 'prefix', 'suffix']}
            onChange={setChangeColNames}
          />
        )}

        {/* axis=index → ignore index */}
        {axis === 'index' && (
          <Toggle value={ignoreIndex} onChange={setIgnoreIndex} label="ignore index" />
        )}

        <Toggle value={sort} onChange={setSort} label="sort" />
      </div>
    </div>
  )
}

// ── Filter Rows ───────────────────────────────────────────────────────────────
function FilterRowsDesigner({ node, columns, onUpdate }) {
  const OPERATORS = ['==', '!=', '<', '<=', '>', '>=', 'isin', 'isna', 'notna']
  const TYPES     = ['number', 'string', 'datetime', 'column']
  const LOGICALS  = ['and', 'or', 'xor']

  const defaultCond = (withLogical = false) => ({
    ...(withLogical ? { logical: 'and' } : {}),
    not: false,
    column: columns[0] || '',
    operator: '>=',
    type: 'number',
    value: '0',
  })

  const parseConds = (raw) => {
    try {
      const p = JSON.parse(raw)
      return Array.isArray(p) && p.length > 0 ? p : [defaultCond()]
    } catch { return [defaultCond()] }
  }

  const [conds, setConds] = useState(() => parseConds(node.data.params?.conditions || '[]'))

  useEffect(() => { onUpdate({ conditions: JSON.stringify(conds) }) }, [conds])

  const updateCond = (i, key, val) => setConds(cs => cs.map((c, j) => j === i ? { ...c, [key]: val } : c))
  const addCond    = () => setConds(cs => [...cs, defaultCond(true)])
  const removeCond = (i) => setConds(cs => cs.filter((_, j) => j !== i))
  const noValue    = (op) => op === 'isna' || op === 'notna'

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 0' }}>
      {/* Centering wrapper */}
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '0 24px' }}>
        {/* + Where button */}
        <button onClick={addCond} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: AMBER, color: 'white', border: 'none',
          borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', marginBottom: 24,
        }}>+ Where</button>

        {columns.length === 0 && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
            Ejecuta el bloque anterior para cargar las columnas.
          </div>
        )}

        {/* Condition rows */}
        {conds.map((cond, i) => (
          <div key={i}>
            {/* Row: X button + card */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* X button aligned to top of card */}
              <button onClick={() => removeCond(i)} style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 8,
                background: AMBER, border: 'none', color: 'white',
                fontSize: 18, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>

              {/* Condition card */}
              <div style={{ flex: 1, background: CARD_BG, border: `1px solid ${CARD_BD}`, borderRadius: 10, padding: '16px 20px' }}>
                {/* First: just "not" */}
                {i === 0 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151', marginBottom: 4 }}>
                    <input type="checkbox" checked={!!cond.not} onChange={e => updateCond(i, 'not', e.target.checked)} style={{ width: 14, height: 14, accentColor: AMBER }} />
                    not
                  </label>
                )}

                {/* Subsequent: logical op + not */}
                {i > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 4 }}>
                    <div style={{ flex: 1 }}>
                      <FieldLabel>logical operator</FieldLabel>
                      <USelect value={cond.logical || 'and'} options={LOGICALS} onChange={v => updateCond(i, 'logical', v)} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#374151', paddingBottom: 6, whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={!!cond.not} onChange={e => updateCond(i, 'not', e.target.checked)} style={{ width: 14, height: 14, accentColor: AMBER }} />
                      not
                    </label>
                  </div>
                )}

                <FieldLabel>column</FieldLabel>
                {columns.length > 0
                  ? <USelect value={cond.column || columns[0]} options={columns} onChange={v => updateCond(i, 'column', v)} />
                  : <UInput value={cond.column} onChange={v => updateCond(i, 'column', v)} placeholder="nombre_columna" />
                }

                <FieldLabel>operator</FieldLabel>
                <USelect value={cond.operator} options={OPERATORS} onChange={v => updateCond(i, 'operator', v)} />

                {!noValue(cond.operator) && (
                  <>
                    <FieldLabel>type</FieldLabel>
                    <USelect value={cond.type || 'number'} options={TYPES} onChange={v => updateCond(i, 'type', v)} />

                    <FieldLabel>
                      value
                      {cond.operator === 'isin' && <span style={{ color: '#b45309', marginLeft: 6, fontSize: 11 }}>(separar con coma)</span>}
                      {cond.type === 'string'   && <span style={{ color: '#b45309', marginLeft: 6, fontSize: 11 }}>(sin comillas)</span>}
                    </FieldLabel>
                    {cond.type === 'column'
                      ? <USelect value={cond.value || columns[0] || ''} options={columns} onChange={v => updateCond(i, 'value', v)} />
                      : <UInput  value={cond.value || ''} onChange={v => updateCond(i, 'value', v)} placeholder={cond.operator === 'isin' ? 'val1, val2, val3' : '0'} />
                    }
                  </>
                )}
              </div>
            </div>

            {/* Connector line between conditions */}
            {i < conds.length - 1 && (
              <div style={{ marginLeft: 27, width: 2, height: 16, background: '#fcd34d' }} />
            )}
          </div>
        ))}

        {conds.length === 0 && (
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Presiona "+ Where" para agregar una condición.</div>
        )}
      </div>
    </div>
  )
}

// ── Sample Rows ───────────────────────────────────────────────────────────────
// Clearable input field (floating label + X button) — module level
function ClearableInput({ label, value, onChange }) {
  return (
    <div style={{ position: 'relative', border: `1px solid ${UAH.border}`, borderRadius: 8, padding: '6px 38px 8px 12px', marginBottom: 16 }}>
      <div style={{ position: 'absolute', top: -9, left: 10, background: 'white', padding: '0 4px', fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="None"
        style={{ width: '100%', fontSize: 14, border: 'none', outline: 'none', background: 'transparent', color: value ? '#111' : '#9ca3af', padding: '2px 0', fontFamily: 'monospace' }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
          fontSize: 18, lineHeight: 1, padding: '2px 4px',
        }}>×</button>
      )}
    </div>
  )
}

function SampleRowsDesigner({ node, onUpdate }) {
  const p = node.data.params || {}
  const [n,           setN]           = useState(p.n            || '')
  const [frac,        setFrac]        = useState(p.frac         || '')
  const [randomState, setRandomState] = useState(p.random_state || '')
  const [ignoreIndex, setIgnoreIndex] = useState(p.ignore_index === 'true' || p.ignore_index === true)

  useEffect(() => {
    onUpdate({ n, frac, random_state: randomState, ignore_index: ignoreIndex })
  }, [n, frac, randomState, ignoreIndex])

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
      <div style={{ maxWidth: 400 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: UAH.navy, marginBottom: 24 }}>Sample Rows</div>

        <ClearableInput label="n"            value={n}           onChange={setN} />
        <ClearableInput label="frac"         value={frac}        onChange={setFrac} />
        <ClearableInput label="random state" value={randomState} onChange={setRandomState} />

        {/* ignore index toggle */}
        <div onClick={() => setIgnoreIndex(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginTop: 8 }}>
          <div style={{ width: 44, height: 26, borderRadius: 13, background: ignoreIndex ? UAH.navy : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: 10, background: 'white', position: 'absolute', top: 3, left: ignoreIndex ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
          <span style={{ fontSize: 14, color: '#374151' }}>ignore index</span>
        </div>
      </div>
    </div>
  )
}

// ── Replace Values ────────────────────────────────────────────────────────────
// Color tokens for the three sections (match DataBruin palette)
const RV_BLUE  = { bg: '#DBEAFE', border: '#93C5FD', text: '#1e40af', title: '#1e3a8a' }
const RV_PINK  = { bg: '#FCE7F3', border: '#F9A8D4', text: '#9d174d', title: '#831843' }
const RV_AMBER = '#f59e0b'
const RV_CARD  = { bg: '#fefce8', border: '#fde68a' }

// ── ReplaceValues shared atoms — module level to avoid focus/remount bugs ──────
function PinkInput({ label, value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', border: `1px solid ${RV_PINK.border}`, borderRadius: 8, padding: '5px 10px 7px', marginBottom: 12 }}>
      <div style={{ position: 'absolute', top: -8, left: 10, background: RV_PINK.bg, padding: '0 4px', fontSize: 10, color: RV_PINK.text, fontWeight: 600 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', fontSize: 14, border: 'none', outline: 'none', background: 'transparent', color: RV_PINK.title, padding: '2px 0', fontFamily: 'monospace', boxSizing: 'border-box' }} />
    </div>
  )
}

// Floating-label select for pink & blue cards — module level
function RVSelect({ label, value, options, onChange, color, placeholder }) {
  return (
    <div style={{ position: 'relative', border: `1px solid ${color.border}`, borderRadius: 8, padding: '5px 10px 7px', marginBottom: 12 }}>
      <div style={{ position: 'absolute', top: -8, left: 10, background: color.bg, padding: '0 4px', fontSize: 10, color: color.text, fontWeight: 600 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', fontSize: 14, border: 'none', outline: 'none', background: 'transparent',
        color: value ? color.title : '#9ca3af', padding: '2px 0', cursor: 'pointer', appearance: 'none',
      }}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 10, top: '55%', transform: 'translateY(-50%)', pointerEvents: 'none', color: color.text, fontSize: 11 }}>▾</span>
    </div>
  )
}

// Section card — module level
function RVCard({ color, title, children }) {
  return (
    <div style={{ background: color.bg, border: `1px solid ${color.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: color.text, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}

function ReplaceValuesDesigner({ node, columns, onUpdate }) {
  const OPERATORS  = ['==', '!=', '<', '<=', '>', '>=', 'isin', 'isna', 'notna']
  const WITH_TYPES = ['number', 'na', 'string', 'datetime', 'column']
  const LOGICALS   = ['and', 'or', 'xor']
  const COND_TYPES = ['number', 'string', 'datetime', 'column']

  const p = node.data.params || {}

  // All start empty so the user makes an explicit selection
  const [targetCol,  setTargetCol]  = useState(p.target_col  || '')
  const [withType,   setWithType]   = useState(p.with_type   || '')
  const [withValue,  setWithValue]  = useState(p.with_value  || '')
  const [withFormat, setWithFormat] = useState(p.with_format || '%Y-%m-%d %H:%M:%S')
  const [conds,      setConds]      = useState(() => {
    try { const r = JSON.parse(p.conditions || '[]'); return Array.isArray(r) ? r : [] } catch { return [] }
  })

  useEffect(() => {
    onUpdate({ target_col: targetCol, with_type: withType, with_value: withValue, with_format: withFormat, conditions: JSON.stringify(conds) })
  }, [targetCol, withType, withValue, withFormat, conds])

  // Conditions always start completely empty — user selects everything explicitly
  const defaultCond = (withLogical = false) => ({
    ...(withLogical ? { logical: 'and' } : {}),
    not: false, column: '', operator: '', type: '', value: '',
  })

  const updateCond = (i, key, val) => setConds(cs => cs.map((c, j) => j === i ? { ...c, [key]: val } : c))
  const addCond    = () => setConds(cs => [...cs, defaultCond(cs.length > 0)])
  const removeCond = (i) => setConds(cs => cs.filter((_, j) => j !== i))
  const noValue    = (op) => op === 'isna' || op === 'notna'

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 0' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 28px' }}>

        {/* ── Blue card: target column ── */}
        <RVCard color={RV_BLUE} title="Replace values of">
          {columns.length > 0
            ? <RVSelect label="column" value={targetCol} options={columns} onChange={setTargetCol} color={RV_BLUE} placeholder="— seleccionar columna —" />
            : <PinkInput label="column" value={targetCol} onChange={setTargetCol} placeholder="nombre_columna" />
          }
        </RVCard>

        {/* ── Pink card: with type ── */}
        <RVCard color={RV_PINK} title="with">
          <RVSelect label="type" value={withType} options={WITH_TYPES} onChange={v => { setWithType(v); setWithValue('') }} color={RV_PINK} placeholder="— seleccionar tipo —" />

          {withType === 'number' && (
            <PinkInput label="value" value={withValue} onChange={setWithValue} placeholder="0" />
          )}
          {withType === 'na' && (
            <div style={{ fontSize: 12, color: RV_PINK.text, fontStyle: 'italic', marginTop: 4 }}>
              Reemplazará con NaN (valor faltante)
            </div>
          )}
          {withType === 'string' && (
            <PinkInput label="value" value={withValue} onChange={setWithValue} placeholder="texto" />
          )}
          {withType === 'datetime' && (
            <>
              <PinkInput label="value"  value={withValue}  onChange={setWithValue}  placeholder="2024-01-01 00:00:00" />
              <PinkInput label="format" value={withFormat} onChange={setWithFormat} placeholder="%Y-%m-%d %H:%M:%S" />
            </>
          )}
          {withType === 'column' && (
            columns.length > 0
              ? <RVSelect label="column" value={withValue} options={columns} onChange={setWithValue} color={RV_PINK} placeholder="— seleccionar columna —" />
              : <PinkInput label="column" value={withValue} onChange={setWithValue} placeholder="nombre_columna" />
          )}
        </RVCard>

        {/* ── Orange + WHERE button ── */}
        <button onClick={addCond} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: RV_AMBER, color: 'white', border: 'none',
          borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', marginBottom: 20,
        }}>+ WHERE</button>

        {columns.length === 0 && conds.length === 0 && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>Ejecuta el bloque anterior para cargar columnas.</div>
        )}

        {/* ── Yellow condition cards ── */}
        {conds.map((cond, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* X button */}
              <button onClick={() => removeCond(i)} style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginTop: 8,
                background: RV_AMBER, border: 'none', color: 'white',
                fontSize: 18, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>

              {/* Condition card — plain div, no inner component to avoid remount */}
              <div style={{ flex: 1, background: RV_CARD.bg, border: `1px solid ${RV_CARD.border}`, borderRadius: 10, padding: '14px 18px' }}>
                {/* Logical + not (from 2nd condition onwards) */}
                {i > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 4 }}>
                    <div style={{ flex: 1 }}>
                      <FieldLabel>logical operator</FieldLabel>
                      <USelect value={cond.logical || 'and'} options={LOGICALS} onChange={v => updateCond(i, 'logical', v)} placeholder="— and / or / xor —" />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#374151', paddingBottom: 6, whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={!!cond.not} onChange={e => updateCond(i, 'not', e.target.checked)} style={{ width: 14, height: 14, accentColor: RV_AMBER }} />
                      not
                    </label>
                  </div>
                )}
                {i === 0 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151', marginBottom: 4 }}>
                    <input type="checkbox" checked={!!cond.not} onChange={e => updateCond(i, 'not', e.target.checked)} style={{ width: 14, height: 14, accentColor: RV_AMBER }} />
                    not
                  </label>
                )}

                {/* Column */}
                <FieldLabel>column</FieldLabel>
                {columns.length > 0
                  ? <USelect value={cond.column} options={columns} onChange={v => updateCond(i, 'column', v)} placeholder="— seleccionar columna —" />
                  : <UInput  value={cond.column} onChange={v => updateCond(i, 'column', v)} placeholder="nombre_columna" />
                }

                {/* Operator — show only once column is selected */}
                {cond.column && (
                  <>
                    <FieldLabel>operator</FieldLabel>
                    <USelect value={cond.operator} options={OPERATORS} onChange={v => updateCond(i, 'operator', v)} placeholder="— seleccionar operador —" />
                  </>
                )}

                {/* Type + value — show only once operator is selected and doesn't need no value */}
                {cond.column && cond.operator && !noValue(cond.operator) && (
                  <>
                    <FieldLabel>type</FieldLabel>
                    <USelect value={cond.type} options={COND_TYPES} onChange={v => updateCond(i, 'type', v)} placeholder="— seleccionar tipo —" />

                    {cond.type && (
                      <>
                        <FieldLabel>
                          value
                          {cond.operator === 'isin' && <span style={{ color: '#b45309', marginLeft: 6, fontSize: 11 }}>(separar con coma)</span>}
                        </FieldLabel>
                        {cond.type === 'column'
                          ? <USelect value={cond.value} options={columns} onChange={v => updateCond(i, 'value', v)} placeholder="— columna de comparación —" />
                          : <UInput  value={cond.value} onChange={v => updateCond(i, 'value', v)} placeholder={cond.operator === 'isin' ? 'val1, val2, val3' : ''} />
                        }
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Connector line between conditions */}
            {i < conds.length - 1 && (
              <div style={{ marginLeft: 27, width: 2, height: 14, background: '#fcd34d' }} />
            )}
          </div>
        ))}

        {conds.length === 0 && (
          <div style={{ fontSize: 13, color: '#9ca3af' }}>Presiona "+ WHERE" para agregar una condición.</div>
        )}
      </div>
    </div>
  )
}

// ── Aggregate ─────────────────────────────────────────────────────────────────
const AGG_FUNCS = ['max', 'min', 'mean', 'median', 'var', 'std', 'sem', 'sum', 'prod', 'count', 'unique', 'first', 'last']

function AggregateDesigner({ node, columns, onUpdate }) {
  const p = node.data.params || {}

  const [custom,   setCustom]   = useState(p.custom === 'true' || p.custom === true)
  const [func,     setFunc]     = useState(p.func || 'mean')
  const [colFuncs, setColFuncs] = useState(() => {
    try { return JSON.parse(p.col_funcs || '{}') } catch { return {} }
  })
  const [selCol, setSelCol] = useState(null)

  useEffect(() => {
    onUpdate({ custom, func, col_funcs: JSON.stringify(colFuncs) })
  }, [custom, func, colFuncs])

  const updateColFunc = (col, fn) => setColFuncs(prev => ({ ...prev, [col]: fn }))
  const clearColFunc  = (col)     => setColFuncs(prev => { const n = { ...prev }; delete n[col]; return n })

  // Floating select reusing RsSelect style
  const FuncSelect = ({ value, onChange, placeholder }) => (
    <div style={{ position: 'relative', border: `1px solid ${UAH.border}`, borderRadius: 8, padding: '6px 38px 8px 12px' }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', fontSize: 14, border: 'none', outline: 'none', background: 'transparent',
        color: value ? '#111' : '#9ca3af', padding: '2px 0', cursor: 'pointer', appearance: 'none',
      }}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {AGG_FUNCS.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 12, top: '55%', transform: 'translateY(-50%)', pointerEvents: 'none', color: UAH.muted, fontSize: 12 }}>▾</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* ── Left panel ── */}
      <div style={{ width: 240, borderRight: `1px solid ${UAH.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white', flexShrink: 0 }}>

        {/* Custom Functions toggle */}
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${UAH.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div onClick={() => { setCustom(v => !v); setSelCol(null) }}
            style={{ width: 44, height: 26, borderRadius: 13, background: custom ? UAH.navy : '#d1d5db', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: 10, background: 'white', position: 'absolute', top: 3, left: custom ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
          <span style={{ fontSize: 13, color: UAH.muted, fontWeight: 500 }}>Custom Functions</span>
        </div>

        {/* All Columns label (custom OFF) */}
        {!custom && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: UAH.navy }}>All Columns</div>
          </div>
        )}

        {/* Column list (custom ON) */}
        {custom && (
          <>
            <div style={colHeaderStyle}>Columns</div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {columns.length === 0 && (
                <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Ejecuta el bloque anterior primero.</div>
              )}
              {columns.map(col => (
                <div key={col} onClick={() => setSelCol(col)}
                  style={{ ...colItemStyle(selCol === col), display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{col}</span>
                  {colFuncs[col] && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#865008', fontFamily: 'monospace' }}>{colFuncs[col]}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Clear all */}
            {Object.keys(colFuncs).length > 0 && (
              <div style={{ padding: '8px 14px', borderTop: `1px solid ${UAH.border}` }}>
                <button onClick={() => setColFuncs({})} style={{ fontSize: 11, color: UAH.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Limpiar todo
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, padding: 32, overflow: 'auto', maxWidth: 400 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: UAH.navy, marginBottom: 28 }}>Aggregation Function</div>

        {/* Custom OFF → single global function */}
        {!custom && (
          <div>
            <label style={{ display: 'block', fontSize: 12, color: UAH.muted, fontWeight: 500, marginBottom: 8 }}>general function</label>
            <FuncSelect value={func} onChange={setFunc} />
          </div>
        )}

        {/* Custom ON + column selected */}
        {custom && selCol && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: UAH.navy, marginBottom: 16, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selCol}
            </div>
            <label style={{ display: 'block', fontSize: 12, color: UAH.muted, fontWeight: 500, marginBottom: 8 }}>function</label>
            <FuncSelect
              value={colFuncs[selCol] || ''}
              onChange={fn => updateColFunc(selCol, fn)}
              placeholder="— seleccionar función —"
            />
            {colFuncs[selCol] && (
              <button onClick={() => clearColFunc(selCol)}
                style={{ marginTop: 12, fontSize: 12, color: UAH.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Limpiar función
              </button>
            )}
          </div>
        )}

        {/* Custom ON + no column selected */}
        {custom && !selCol && (
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            Selecciona una columna para asignar su función de agregación.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Resample ──────────────────────────────────────────────────────────────────
// Floating-label select for Resample — module level to keep stable reference
function RsSelect({ label, value, options, onChange }) {
  return (
    <div style={{ position: 'relative', border: `1px solid ${UAH.border}`, borderRadius: 8, padding: '6px 38px 8px 12px', marginBottom: 16 }}>
      <div style={{ position: 'absolute', top: -9, left: 10, background: 'white', padding: '0 4px', fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', fontSize: 14, border: 'none', outline: 'none', background: 'transparent',
        color: '#111', padding: '2px 0', cursor: 'pointer', appearance: 'none',
      }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 12, top: '55%', transform: 'translateY(-50%)', pointerEvents: 'none', color: UAH.muted, fontSize: 12 }}>▾</span>
    </div>
  )
}

function ResampleDesigner({ node, onUpdate }) {
  const p = node.data.params || {}

  // sparse=true by default (simple mode)
  const [sparse,  setSparse]  = useState(!(p.sparse === 'false' || p.sparse === false))
  const [rule,    setRule]    = useState(p.rule   || '')
  // Advanced params (sparse OFF only)
  const [closed,  setClosed]  = useState(p.closed  || 'None')
  const [rsLabel, setRsLabel] = useState(p.label   || 'None')
  const [kind,    setKind]    = useState(p.kind    || 'None')
  const [origin,  setOrigin]  = useState(p.origin  || 'epoch')
  const [offset,  setOffset]  = useState(p.offset  || '')

  useEffect(() => {
    onUpdate({ sparse, rule, closed, label: rsLabel, kind, origin, offset })
  }, [sparse, rule, closed, rsLabel, kind, origin, offset])

  const CLOSED  = ['None', 'left', 'right']
  const LABELS  = ['None', 'left', 'right']
  const KINDS   = ['None', 'timestamp', 'period']
  const ORIGINS = ['epoch', 'start', 'start_day', 'timestamp', 'offset']

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: UAH.navy, marginBottom: 24 }}>Resample</div>

        {/* Sparse resampling toggle */}
        <div onClick={() => setSparse(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 28 }}>
          <div style={{ width: 44, height: 26, borderRadius: 13, background: sparse ? UAH.navy : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: 10, background: 'white', position: 'absolute', top: 3, left: sparse ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
          <span style={{ fontSize: 14, color: '#374151' }}>sparse resampling</span>
        </div>

        {/* Rule — always visible */}
        <ClearableInput label="rule  (e.g. 1S · 1T · 2H · 1D)" value={rule} onChange={setRule} />

        {/* ── Advanced params — only when sparse is OFF ── */}
        {!sparse && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 20px' }}>
              <div style={{ flex: 1, height: 1, background: UAH.border }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Advanced</span>
              <div style={{ flex: 1, height: 1, background: UAH.border }} />
            </div>

            <RsSelect label="closed" value={closed}  options={CLOSED}  onChange={setClosed} />
            <RsSelect label="label"  value={rsLabel} options={LABELS}  onChange={setRsLabel} />
            <RsSelect label="kind"   value={kind}    options={KINDS}   onChange={setKind} />
            <RsSelect label="origin" value={origin}  options={ORIGINS} onChange={setOrigin} />
            <ClearableInput label="offset (timedelta)" value={offset} onChange={setOffset} />
          </>
        )}

        {/* Alias hint */}
        <div style={{ marginTop: 16, padding: '10px 14px', background: UAH.light, borderRadius: 8, fontSize: 11, color: UAH.muted, lineHeight: 1.9 }}>
          <span style={{ fontWeight: 700, color: UAH.navy }}>Aliases: </span>
          S = segundos · T / min = minutos · H = horas · D = días · W = semanas · M = mes
        </div>
      </div>
    </div>
  )
}

// ── Handle Missings ───────────────────────────────────────────────────────────
function HandleMissingsDesigner({ node, columns, onUpdate }) {
  const p = node.data.params || {}

  const [allCols,   setAllCols]   = useState(p.all_columns !== 'false')
  const [selCols,   setSelCols]   = useState(
    p.columns ? p.columns.split(',').map(s => s.trim()).filter(Boolean) : []
  )
  const [op,        setOp]        = useState(p.operation || 'dropna')

  // dropna
  const [axis,      setAxis]      = useState(p.axis      || 'index')
  const [how,       setHow]       = useState(p.how       || 'any')
  const [thresh,    setThresh]    = useState(p.thresh    || '')

  // fillna
  const [fillType,  setFillType]  = useState(p.fill_type  || 'value')
  const [valueType, setValueType] = useState(p.value_type || 'number')
  const [fillValue, setFillValue] = useState(p.fill_value ?? '0')
  const [fillMethod,setFillMethod]= useState(p.fill_method || 'ffill')
  const [fillAxis,  setFillAxis]  = useState(p.fill_axis  || 'index')
  const [fillLimit, setFillLimit] = useState(p.fill_limit || '')

  // interpolate
  const [iMethod,   setIMethod]   = useState(p.interp_method           || 'linear')
  const [iAxis,     setIAxis]     = useState(p.interp_axis             || 'index')
  const [iLimit,    setILimit]    = useState(p.interp_limit            || '')
  const [iLimitDir, setILimitDir] = useState(p.interp_limit_direction  || 'None')
  const [iLimitArea,setILimitArea]= useState(p.interp_limit_area       || 'None')

  useEffect(() => {
    onUpdate({
      all_columns: allCols ? 'true' : 'false',
      columns:     selCols.join(', '),
      operation:   op,
      axis, how, thresh,
      fill_type:   fillType,
      value_type:  valueType,
      fill_value:  fillValue,
      fill_method: fillMethod,
      fill_axis:   fillAxis,
      fill_limit:  fillLimit,
      interp_method:           iMethod,
      interp_axis:             iAxis,
      interp_limit:            iLimit,
      interp_limit_direction:  iLimitDir,
      interp_limit_area:       iLimitArea,
    })
  }, [allCols, selCols, op, axis, how, thresh, fillType, valueType, fillValue,
      fillMethod, fillAxis, fillLimit, iMethod, iAxis, iLimit, iLimitDir, iLimitArea])

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{
      cursor: 'pointer', width: 44, height: 26, borderRadius: 13,
      background: value ? UAH.navy : '#d1d5db', position: 'relative',
      transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10, background: 'white',
        position: 'absolute', top: 3, left: value ? 21 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  )

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: UAH.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )

  const Sel = ({ value, options, onChange }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: `1px solid ${UAH.border}`, borderRadius: 6, background: 'white', color: '#111', outline: 'none' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  const Inp = ({ value, onChange, placeholder }) => (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: `1px solid ${UAH.border}`, borderRadius: 6, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
  )

  const remainingCols = columns.filter(c => !selCols.includes(c))

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* ── Left panel ── */}
      <div style={{ width: 240, borderRight: `1px solid ${UAH.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white', flexShrink: 0 }}>
        {/* All Columns toggle */}
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${UAH.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: UAH.navy }}>All Columns</span>
          <Toggle value={allCols} onChange={setAllCols} />
        </div>

        {allCols && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 12 }}>Se aplicará a todas las columnas del DataFrame</div>
            </div>
          </div>
        )}

        {!allCols && (
          <>
            <div style={colHeaderStyle}>DataFrame Columns</div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {remainingCols.map(col => (
                <div key={col} onClick={() => setSelCols(s => [...s, col])} style={colItemStyle(false)}>{col}</div>
              ))}
              {remainingCols.length === 0 && columns.length > 0 && (
                <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Todas las columnas seleccionadas.</div>
              )}
              {columns.length === 0 && (
                <div style={{ padding: 14, fontSize: 12, color: '#9ca3af' }}>Ejecuta el bloque anterior primero.</div>
              )}
            </div>
            <div style={{ borderTop: `1px solid ${UAH.border}`, padding: '6px 0' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: UAH.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 14px 6px' }}>Seleccionadas</div>
              {selCols.map(col => (
                <div key={col} onClick={() => setSelCols(s => s.filter(c => c !== col))}
                  style={{ ...colItemStyle(true), display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{col}</span>
                  <span style={{ color: '#9ca3af', marginLeft: 4, flexShrink: 0 }}>×</span>
                </div>
              ))}
              {selCols.length === 0 && <div style={{ padding: '0 14px 8px', fontSize: 12, color: '#9ca3af' }}>Haz clic arriba para seleccionar.</div>}
            </div>
          </>
        )}
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: UAH.navy, marginBottom: 20 }}>Handle Missing Values</div>

        {/* Operation selector */}
        <div style={{ display: 'flex', marginBottom: 24, border: `1px solid ${UAH.border}`, borderRadius: 8, overflow: 'hidden', width: 'fit-content' }}>
          {['dropna', 'fillna', 'interpolate'].map((o, idx, arr) => (
            <button key={o} onClick={() => setOp(o)} style={{
              padding: '8px 20px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              borderRight: idx < arr.length - 1 ? `1px solid ${UAH.border}` : 'none',
              background: op === o ? UAH.navy : 'white',
              color: op === o ? 'white' : UAH.muted,
            }}>{o}</button>
          ))}
        </div>

        {/* ── dropna ── */}
        {op === 'dropna' && (
          <div style={{ maxWidth: 360 }}>
            <Field label="axis">
              <Sel value={axis} options={['index', 'columns']} onChange={setAxis} />
            </Field>
            <Field label="how">
              <Sel value={how} options={['any', 'all']} onChange={setHow} />
            </Field>
            <Field label="thresh — % mínimo de valores no-NA para conservar">
              <Inp value={thresh} onChange={setThresh} placeholder="ej. 50  → conservar si ≥50% no-NA" />
            </Field>
          </div>
        )}

        {/* ── fillna ── */}
        {op === 'fillna' && (
          <div style={{ maxWidth: 360 }}>
            <Field label="type">
              <div style={{ display: 'flex', gap: 8 }}>
                {['value', 'method'].map(t => (
                  <button key={t} onClick={() => setFillType(t)} style={{
                    flex: 1, padding: '8px', fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: 'pointer',
                    border: `1px solid ${fillType === t ? UAH.navy : UAH.border}`,
                    background: fillType === t ? '#EEF1FB' : 'white',
                    color: fillType === t ? UAH.navy : UAH.muted,
                  }}>{t}</button>
                ))}
              </div>
            </Field>

            {fillType === 'value' && (
              <>
                <Field label="value type">
                  <Sel value={valueType} options={['number', 'string']} onChange={setValueType} />
                </Field>
                <Field label="value">
                  <Inp value={fillValue} onChange={setFillValue} placeholder={valueType === 'number' ? '0' : 'texto'} />
                </Field>
              </>
            )}

            {fillType === 'method' && (
              <>
                <Field label="method">
                  <Sel value={fillMethod} options={['None', 'ffill', 'bfill']} onChange={setFillMethod} />
                </Field>
                <Field label="axis">
                  <Sel value={fillAxis} options={['None', 'index', 'columns']} onChange={setFillAxis} />
                </Field>
                <Field label="limit — max valores consecutivos a rellenar">
                  <Inp value={fillLimit} onChange={setFillLimit} placeholder="sin límite" />
                </Field>
              </>
            )}
          </div>
        )}

        {/* ── interpolate ── */}
        {op === 'interpolate' && (
          <div style={{ maxWidth: 360 }}>
            <Field label="method">
              <Sel value={iMethod} options={['linear', 'time', 'nearest', 'polynomial']} onChange={setIMethod} />
            </Field>
            <Field label="axis">
              <Sel value={iAxis} options={['None', 'index', 'columns']} onChange={setIAxis} />
            </Field>
            <Field label="limit — max valores interpolados consecutivos">
              <Inp value={iLimit} onChange={setILimit} placeholder="sin límite" />
            </Field>
            <Field label="limit_direction">
              <Sel value={iLimitDir} options={['None', 'forward', 'backward', 'both']} onChange={setILimitDir} />
            </Field>
            <Field label="limit_area">
              <Sel value={iLimitArea} options={['None', 'inside', 'outside']} onChange={setILimitArea} />
            </Field>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Generic fallback ──────────────────────────────────────────────────────────
function GenericDesigner({ node, onUpdate }) {
  const { paramsDef = [], params = {} } = node.data
  const [local, setLocal] = useState({ ...params })
  const handleChange = (key, value) => { const u = { ...local, [key]: value }; setLocal(u); onUpdate(u) }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, overflow: 'auto' }}>
      {paramsDef.map(p => (
        <div key={p.key}>
          <label style={{ display: 'block', fontSize: 12, color: UAH.muted, marginBottom: 6, fontWeight: 500 }}>{p.label}</label>
          {p.type === 'text' && <input value={local[p.key] ?? p.default} onChange={e => handleChange(p.key, e.target.value)} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${UAH.border}`, borderRadius: 6, fontFamily: 'monospace' }} />}
          {p.type === 'select' && (
            <select value={local[p.key] ?? p.default} onChange={e => handleChange(p.key, e.target.value)} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${UAH.border}`, borderRadius: 6 }}>
              {p.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}
          {p.type === 'toggle' && (
            <div onClick={() => handleChange(p.key, !(local[p.key] ?? p.default))} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: (local[p.key] ?? p.default) ? UAH.navy : '#d1d5db', position: 'relative' }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: 'white', position: 'absolute', top: 2, left: (local[p.key] ?? p.default) ? 18 : 2, transition: 'left 0.15s' }} />
              </div>
              <span style={{ fontSize: 13 }}>{(local[p.key] ?? p.default) ? 'Sí' : 'No'}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────
const DESIGNERS = {
  append_column:     AppendColumnDesigner,
  drop_columns:      DropColumnsDesigner,
  rename_columns:    RenameColumnsDesigner,
  reorder_columns:   ReorderColumnsDesigner,
  select_columns:    SelectColumnsDesigner,
  set_index:         SetIndexDesigner,
  set_dtypes:        SetDtypesDesigner,
  concatenate:       ConcatenateDesigner,
  filter_rows:       FilterRowsDesigner,
  handle_missings:   HandleMissingsDesigner,
  replace_values:    ReplaceValuesDesigner,
  sample_rows:       SampleRowsDesigner,
  resample:          ResampleDesigner,
  aggregate:         AggregateDesigner,
}

// ── BlockDesigner shell with Design / Explore tabs ────────────────────────────
export default function BlockDesigner({ node, columns, onUpdate, onClose, onRunExplore }) {
  const [activeTab,     setActiveTab]     = useState('design')
  const [exploreResult, setExploreResult] = useState(null)
  const [exploreLoading,setExploreLoading]= useState(false)
  const [exploreError,  setExploreError]  = useState(null)
  const [exploreCol,    setExploreCol]    = useState(null)

  const Designer = DESIGNERS[node.data.blockType] || GenericDesigner

  const handleExploreClick = async () => {
    setActiveTab('explore')
    if (exploreResult) return   // already loaded
    setExploreLoading(true)
    setExploreError(null)
    try {
      const result = await onRunExplore()
      if (result?.error) { setExploreError(result.error); setExploreResult(null) }
      else {
        setExploreResult(result)
        setExploreCol(result.columns?.[0] || null)
      }
    } catch { setExploreError('Error de conexión') }
    finally { setExploreLoading(false) }
  }

  // When design is updated, invalidate explore result so it re-fetches
  const handleUpdate = (params) => {
    setExploreResult(null)
    onUpdate(params)
  }

  const TabBtn = ({ id, label, onClick }) => (
    <button onClick={onClick} style={{
      padding: '14px 16px', fontSize: 12, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
      color: activeTab === id ? UAH.navy : '#9ca3af',
      borderBottom: `3px solid ${activeTab === id ? UAH.navy : 'transparent'}`,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      transition: 'color 0.15s',
    }}>{label}</button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ── Header with tabs ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', padding: '0 20px', borderBottom: `1px solid ${UAH.border}`, flexShrink: 0, background: 'white' }}>
        <div style={{ paddingRight: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, color: UAH.muted }}>Configurar bloque</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: UAH.navy }}>{node.data.label}</div>
        </div>
        <TabBtn id="design"  label="Design"  onClick={() => setActiveTab('design')} />
        <TabBtn id="explore" label="Explore" onClick={handleExploreClick} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={onClose} style={{
            background: UAH.light, color: UAH.navy, border: `1px solid ${UAH.border}`,
            borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>← Volver</button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {activeTab === 'design' && (
          <Designer node={node} columns={columns} onUpdate={handleUpdate} />
        )}

        {activeTab === 'explore' && (
          exploreLoading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: `4px solid ${UAH.border}`, borderTop: `4px solid ${UAH.navy}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13, color: UAH.muted }}>Ejecutando bloque…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : exploreError ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
              <div style={{ background: '#FAEAED', border: `1px solid #E9A5AE`, borderRadius: 10, padding: '20px 28px', maxWidth: 480, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>⚠️</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: UAH.red, marginBottom: 6 }}>Error al ejecutar el bloque</div>
                <div style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace', wordBreak: 'break-word' }}>{exploreError}</div>
                <button onClick={handleExploreClick} style={{ marginTop: 14, padding: '7px 16px', fontSize: 12, fontWeight: 600, background: UAH.navy, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  Reintentar
                </button>
              </div>
            </div>
          ) : exploreResult ? (
            /* ── Explore: column list + ColumnExplore (no Results tab) ── */
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Column list */}
              <div style={{ width: 220, borderRight: `1px solid ${UAH.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: UAH.navy, borderBottom: `1px solid ${UAH.border}`, flexShrink: 0 }}>
                  DataFrame Columns
                </div>
                <div style={{ overflow: 'auto', flex: 1 }}>
                  {exploreResult.columns?.map(col => (
                    <div key={col} onClick={() => setExploreCol(col)} style={{
                      padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                      background: exploreCol === col ? '#EEF1FB' : 'white',
                      color: exploreCol === col ? UAH.navy : '#374151',
                      borderBottom: '1px solid #f3f4f6',
                      fontWeight: exploreCol === col ? 600 : 400,
                      borderLeft: `3px solid ${exploreCol === col ? UAH.navy : 'transparent'}`,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {col}
                    </div>
                  ))}
                </div>
                {/* shape / nulls summary */}
                <div style={{ padding: '10px 14px', borderTop: `1px solid ${UAH.border}`, flexShrink: 0, fontSize: 11, color: UAH.muted }}>
                  <span><strong style={{ color: UAH.navy }}>{exploreResult.shape?.[0]?.toLocaleString()}</strong> filas · </span>
                  <span><strong style={{ color: UAH.navy }}>{exploreResult.shape?.[1]}</strong> cols</span>
                </div>
              </div>
              {/* Column detail */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {exploreCol
                  ? <ColumnExplore col={exploreCol} result={exploreResult} />
                  : <div style={{ padding: 24, color: '#9ca3af', fontSize: 13 }}>Selecciona una columna.</div>}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  )
}
