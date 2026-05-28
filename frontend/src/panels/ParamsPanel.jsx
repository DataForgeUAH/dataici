// ── UAH-inspired palette ──────────────────────────────────────────────────
const UAH = {
  navy:    '#1B2D5B',
  red:     '#C4122D',
  light:   '#F4F7FB',
  border:  '#D8E0EF',
  muted:   '#6278A0',
  cream:   '#FAFBFD',
}

const CATEGORY_COLORS = {
  'Data I/O':   UAH.navy,
  'Columns':    UAH.red,
  'Index':      '#0B6B70',
  'DataFrame':  '#1A5E38',
  'Resampling': '#865008',
}

const IO_TYPES = ['load_csv', 'write_csv', 'read_excel']

function InlineParams({ paramsDef, params, onUpdate }) {
  const handleChange = (key, value) => onUpdate({ ...params, [key]: value })

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {paramsDef.map(p => (
        <div key={p.key}>
          <label style={{ display: 'block', fontSize: 11, color: UAH.muted, marginBottom: 4, fontWeight: 500 }}>{p.label}</label>
          {p.type === 'text' && (
            <input value={params[p.key] ?? p.default} onChange={e => handleChange(p.key, e.target.value)}
              style={{ width: '100%', padding: '6px 0', fontSize: 12, border: 'none', borderBottom: `1px solid ${UAH.border}`, background: 'transparent', color: '#111', fontFamily: 'monospace', outline: 'none' }} />
          )}
          {p.type === 'select' && (
            <select value={params[p.key] ?? p.default} onChange={e => handleChange(p.key, e.target.value)}
              style={{ width: '100%', padding: '6px 0', fontSize: 12, border: 'none', borderBottom: `1px solid ${UAH.border}`, background: 'transparent', color: '#111', outline: 'none' }}>
              {p.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}
          {p.type === 'toggle' && (
            <div onClick={() => handleChange(p.key, !(params[p.key] ?? p.default))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 2 }}>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: (params[p.key] ?? p.default) ? UAH.navy : '#d1d5db', position: 'relative' }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: 'white', position: 'absolute', top: 2, left: (params[p.key] ?? p.default) ? 18 : 2, transition: 'left 0.15s' }} />
              </div>
              <span style={{ fontSize: 12, color: UAH.muted }}>{p.label}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Section header helper ─────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: UAH.muted,
      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
    }}>{children}</div>
  )
}

function BlockSummary({ blockType, params }) {
  const empty = (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚙️</div>
        <div style={{ fontSize: 12 }}>Haz clic en Configurar para ajustar este bloque</div>
      </div>
    </div>
  )

  const colList = (label, cols, color = '#374151') => cols.length > 0 && (
    <div style={{ marginBottom: 10 }}>
      <SectionLabel>{label}</SectionLabel>
      {cols.map(c => (
        <div key={c} style={{ fontSize: 12, fontFamily: 'monospace', padding: '2px 6px', background: UAH.light, borderRadius: 4, color, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</div>
      ))}
    </div>
  )

  if (blockType === 'append_column') {
    const col = params.colname
    return col ? (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        {colList('Nueva columna', [col], UAH.red)}
        <div style={{ fontSize: 11, color: UAH.muted }}>Valor inicial: <code>None</code></div>
      </div>
    ) : empty
  }

  if (blockType === 'drop_columns') {
    const cols = params.columns ? params.columns.split(',').map(s => s.trim()).filter(Boolean) : []
    return cols.length ? <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>{colList('Columns to drop', cols, UAH.red)}</div> : empty
  }

  if (blockType === 'rename_columns') {
    const mapping = {}
    if (params.mapping) {
      params.mapping.split('|').forEach(pair => {
        const [old, newName] = pair.split(':').map(s => s?.trim())
        if (old && newName) mapping[old] = newName
      })
    }
    return Object.keys(mapping).length ? (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        <SectionLabel>Rename</SectionLabel>
        {Object.entries(mapping).map(([old, newName]) => (
          <div key={old} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${UAH.border}` }}>
            <div style={{ fontSize: 12, color: UAH.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{old}</div>
            <div style={{ fontSize: 12, color: UAH.navy, fontWeight: 600 }}>{newName}</div>
          </div>
        ))}
      </div>
    ) : empty
  }

  if (blockType === 'reorder_columns' || blockType === 'select_columns') {
    const cols = params.columns ? params.columns.split(',').map(s => s.trim()).filter(Boolean) : []
    return cols.length ? (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        <SectionLabel>Columns to keep</SectionLabel>
        {cols.map((c, i) => (
          <div key={c} style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 12, borderBottom: `1px solid ${UAH.border}` }}>
            <span style={{ color: '#1A5E38', fontWeight: 600, minWidth: 20 }}>{i}</span>
            <span style={{ color: '#1B2D5B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>
          </div>
        ))}
      </div>
    ) : empty
  }

  if (blockType === 'set_index') {
    const cols = params.columns ? params.columns.split(',').map(s => s.trim()).filter(Boolean) : []
    return cols.length ? (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        <SectionLabel>Index</SectionLabel>
        {cols.map(c => (
          <div key={c} style={{ fontSize: 13, fontFamily: 'monospace', padding: '4px 8px', background: '#E6F5F5', borderRadius: 4, color: '#0B6B70', fontWeight: 600, marginBottom: 6 }}>{c}</div>
        ))}
      </div>
    ) : empty
  }

  if (blockType === 'set_dtypes') {
    const DTYPE_COLORS = { numeric: UAH.navy, datetime: UAH.red, categorical: '#865008', string: '#1A5E38', boolean: '#C4122D', integer: '#0B6B70' }
    const mapping = {}
    if (params.mapping) {
      params.mapping.split(';').forEach(pair => {
        const [col, dtype] = pair.split(':').map(s => s?.trim())
        if (col && dtype) mapping[col] = dtype
      })
    }
    return Object.keys(mapping).length ? (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        <SectionLabel>Columns → dtype</SectionLabel>
        {Object.entries(mapping).map(([col, dtype]) => (
          <div key={col} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid ${UAH.border}` }}>
            <div style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</div>
            <div style={{ fontSize: 11, color: DTYPE_COLORS[dtype] || '#374151', fontWeight: 600 }}>{dtype}</div>
          </div>
        ))}
      </div>
    ) : empty
  }

  if (blockType === 'filter_rows') {
    let conds = []
    try { conds = JSON.parse(params.conditions || '[]') } catch {}

    const LOGICAL_LABEL = { and: 'AND', or: 'OR', xor: 'XOR' }

    return conds.length ? (
      <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <div style={{
          fontSize: 13, fontWeight: 600, color: UAH.muted,
          fontFamily: 'monospace', marginBottom: 14,
        }}>
          Keep rows where:
        </div>

        {/* One block per condition */}
        {conds.map((c, i) => (
          <div key={i}>
            {/* Logical connector */}
            {i > 0 && (
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#865008',
                fontFamily: 'monospace', margin: '6px 0 4px',
              }}>
                {LOGICAL_LABEL[c.logical] || 'AND'}
              </div>
            )}

            {/* Column name — truncated on its own line */}
            <div style={{
              fontFamily: 'monospace', fontSize: 12,
              color: UAH.navy, fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {c.not && <span style={{ color: UAH.red }}>NOT </span>}
              {c.column}
            </div>

            {/* Operator + value — indented below */}
            <div style={{
              fontFamily: 'monospace', fontSize: 13,
              color: UAH.navy, paddingLeft: 10, marginTop: 1,
            }}>
              <span style={{ color: UAH.red, fontWeight: 700 }}>{c.operator}</span>
              {c.operator !== 'isna' && c.operator !== 'notna' && (
                <span style={{ color: '#374151' }}> {c.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : empty
  }

  if (blockType === 'concatenate') {
    const count = Math.max(2, parseInt(params.input_count) || 2)
    const axis  = params.axis || 'index'
    const join  = params.join || 'outer'
    return (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        <SectionLabel>DataFrames de entrada</SectionLabel>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={{ fontSize: 12, fontFamily: 'monospace', padding: '3px 8px', background: '#E8F5EE', borderRadius: 4, color: '#1A5E38', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#1A5E38', color: 'white', fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            DataFrame {i + 1}
          </div>
        ))}
        {/* +/- port buttons */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, marginBottom: 12 }}>
          <button
            onClick={() => onUpdate({ ...params, input_count: count + 1 })}
            style={{ flex: 1, padding: '5px 0', fontSize: 12, fontWeight: 600, background: '#E8F5EE', border: '1px solid #8FC8AA', color: '#1A5E38', borderRadius: 6, cursor: 'pointer' }}>
            + port
          </button>
          <button
            onClick={() => count > 2 && onUpdate({ ...params, input_count: count - 1 })}
            style={{ flex: 1, padding: '5px 0', fontSize: 12, fontWeight: 600, background: count > 2 ? '#FAEAED' : '#f3f4f6', border: `1px solid ${count > 2 ? '#E9A5AE' : '#e5e7eb'}`, color: count > 2 ? UAH.red : '#d1d5db', borderRadius: 6, cursor: count > 2 ? 'pointer' : 'default' }}>
            − port
          </button>
        </div>
        {/* Settings summary */}
        <div style={{ borderTop: `1px solid ${UAH.border}`, paddingTop: 8, fontSize: 11, color: UAH.muted, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div><span>axis: </span><span style={{ fontWeight: 600, color: UAH.navy }}>{axis}</span></div>
          <div><span>join: </span><span style={{ fontWeight: 600, color: UAH.navy }}>{join}</span></div>
          {axis === 'index' && (params.ignore_index === 'true' || params.ignore_index === true) && (
            <div style={{ fontWeight: 600, color: '#0B6B70' }}>ignore index ✓</div>
          )}
          {axis === 'columns' && params.change_col_names && params.change_col_names !== 'None' && (
            <div><span>col names: </span><span style={{ fontWeight: 600, color: UAH.navy }}>{params.change_col_names}</span></div>
          )}
          {(params.sort === 'true' || params.sort === true) && (
            <div style={{ fontWeight: 600, color: '#865008' }}>sort ✓</div>
          )}
        </div>
      </div>
    )
  }

  if (blockType === 'replace_values') {
    const col      = params.target_col || ''
    const withType = params.with_type  || 'value'
    const withVal  = params.with_value || ''
    let conds = []
    try { conds = JSON.parse(params.conditions || '[]') } catch {}
    const LOGICAL_LABEL = { and: 'AND', or: 'OR', xor: 'XOR' }
    return col ? (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        {/* Replace values of */}
        <div style={{ background: '#DBEAFE', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Replace values of</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#1e3a8a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</div>
        </div>
        {/* With */}
        <div style={{ background: '#FCE7F3', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9d174d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>with</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#831843', fontWeight: 600 }}>
            {withType === 'value' ? withVal || '—' : withType}
          </div>
        </div>
        {/* Conditions */}
        {conds.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: UAH.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Where</div>
            {conds.map((c, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                {i > 0 && <div style={{ fontSize: 10, fontWeight: 700, color: '#865008', fontFamily: 'monospace', marginBottom: 2 }}>{LOGICAL_LABEL[c.logical] || 'AND'}</div>}
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: UAH.navy, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.not && <span style={{ color: UAH.red }}>NOT </span>}{c.column}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: UAH.navy, paddingLeft: 8 }}>
                  <span style={{ color: UAH.red, fontWeight: 700 }}>{c.operator}</span>
                  {c.operator !== 'isna' && c.operator !== 'notna' && <span style={{ color: '#374151' }}> {c.value}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : empty
  }

  if (blockType === 'sample_rows') {
    const n           = params.n            || ''
    const frac        = params.frac         || ''
    const randomState = params.random_state || ''
    const ignoreIdx   = params.ignore_index === 'true' || params.ignore_index === true
    const hasAny      = n || frac || randomState

    const Row = ({ label, val }) => val ? (
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: `1px solid ${UAH.border}` }}>
        <span style={{ color: UAH.muted }}>{label}</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: UAH.navy }}>{val}</span>
      </div>
    ) : null

    return hasAny || ignoreIdx ? (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        <SectionLabel>Configuración</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          <Row label="n"            val={n} />
          <Row label="frac"         val={frac} />
          <Row label="random state" val={randomState} />
        </div>
        {ignoreIdx && (
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0B6B70' }}>ignore index ✓</div>
        )}
      </div>
    ) : empty
  }

  if (blockType === 'aggregate') {
    const custom = params.custom === 'true' || params.custom === true
    const func   = params.func || 'mean'
    let colFuncs = {}
    try { colFuncs = JSON.parse(params.col_funcs || '{}') } catch {}
    const colEntries = Object.entries(colFuncs)

    return (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        {!custom ? (
          <>
            <SectionLabel>All Columns</SectionLabel>
            <div style={{ background: '#FDF3E6', border: '1px solid #F0C07B', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#865008', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>function</div>
              <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: '#865008' }}>{func}</div>
            </div>
          </>
        ) : (
          <>
            <SectionLabel>Custom Functions</SectionLabel>
            {colEntries.length === 0 && (
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Sin funciones asignadas aún.</div>
            )}
            {colEntries.map(([col, fn]) => (
              <div key={col} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid ${UAH.border}` }}>
                <div style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{col}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#865008' }}>{fn}</div>
              </div>
            ))}
          </>
        )}
      </div>
    )
  }

  if (blockType === 'resample') {
    const rule   = params.rule || ''
    const sparse = !(params.sparse === 'false' || params.sparse === false)

    // Non-default advanced values
    const ADVANCED_KEYS = ['closed', 'label', 'kind', 'origin', 'offset']
    const advancedRows  = !sparse
      ? ADVANCED_KEYS.filter(k => params[k] && params[k] !== 'None' && params[k] !== '')
      : []

    return rule ? (
      <div style={{ padding: 14, flex: 1, overflow: 'auto' }}>
        {/* Rule chip */}
        <div style={{ background: '#FDF3E6', border: '1px solid #F0C07B', borderRadius: 8, padding: '10px 14px', marginBottom: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#865008', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>rule</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 700, color: '#865008' }}>{rule}</div>
        </div>

        {/* Mode badge */}
        <div style={{
          display: 'inline-block', fontSize: 11, fontWeight: 700,
          padding: '2px 8px', borderRadius: 4, marginBottom: 10,
          background: sparse ? '#E8F5EE' : '#FDF3E6',
          color: sparse ? '#1A5E38' : '#865008',
          border: `1px solid ${sparse ? '#8FC8AA' : '#F0C07B'}`,
        }}>
          {sparse ? 'sparse' : 'advanced'}
        </div>

        {/* Advanced non-default params */}
        {advancedRows.length > 0 && (
          <div style={{ borderTop: `1px solid ${UAH.border}`, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {advancedRows.map(k => (
              <div key={k} style={{ fontSize: 11 }}>
                <span style={{ color: UAH.muted }}>{k}: </span>
                <span style={{ fontFamily: 'monospace', color: '#374151', fontWeight: 600 }}>{params[k]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : empty
  }

  return empty
}

export default function ParamsPanel({ node, onUpdate, onDelete, onDesign, onRun, onCode, onLabelChange }) {
  const { label, category, blockType, paramsDef = [], params = {}, userLabel = '' } = node.data
  const color = CATEGORY_COLORS[category] || UAH.navy
  const isIO = IO_TYPES.includes(blockType)

  const Btn = ({ onClick, title, icon, bg, border, textColor }) => (
    <button onClick={onClick} title={title} style={{
      flex: 1, padding: '8px 0', fontSize: 15, border: `1px solid ${border}`,
      background: bg, color: textColor, borderRadius: 8, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'filter 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.93)'}
      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
    >
      {icon}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: UAH.cream }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${UAH.border}`, flexShrink: 0, background: 'white' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          {category} — {label}
        </div>
        <input
          value={userLabel}
          onChange={e => onLabelChange(e.target.value)}
          placeholder="Nombre del bloque..."
          style={{
            width: '100%', padding: '5px 8px', fontSize: 13, fontWeight: 600,
            border: `1px solid ${UAH.border}`, borderRadius: 6, background: UAH.light,
            color: UAH.navy, outline: 'none',
          }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${UAH.border}`, flexShrink: 0, background: 'white' }}>
        {!isIO && <Btn onClick={onDesign} title="Configurar"        icon="⚙️"  bg={UAH.light}   border={UAH.border} textColor={UAH.navy} />}
        <Btn onClick={onRun}    title="Ejecutar hasta aquí" icon="▶"   bg="#E8F5EE" border="#8FC8AA" textColor="#1A5E38" />
        <Btn onClick={onCode}   title="Ver código Python"   icon="{ }" bg="#FAEAED" border="#E9A5AE" textColor={UAH.red} />
      </div>

      {isIO
        ? <InlineParams paramsDef={paramsDef} params={params} onUpdate={onUpdate} />
        : <BlockSummary blockType={blockType} params={params} />
      }

      <div style={{ padding: '10px 14px', borderTop: `1px solid ${UAH.border}`, flexShrink: 0, background: 'white' }}>
        <button onClick={onDelete} style={{
          width: '100%', padding: '7px', fontSize: 12, fontWeight: 600,
          background: '#FAEAED', border: `1px solid #E9A5AE`, color: UAH.red,
          borderRadius: 6, cursor: 'pointer',
        }}>
          Eliminar bloque
        </button>
      </div>
    </div>
  )
}
