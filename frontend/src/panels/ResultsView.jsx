import { useState, useEffect } from 'react'
import axios from 'axios'

const blue = '#1d4ed8'
const red  = '#ef4444'

const thStyle = { background: '#dbeafe', padding: '6px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#1e40af', borderBottom: '1px solid #bfdbfe' }
const tdStyle  = { padding: '6px 12px', fontSize: 12, borderBottom: '1px solid #e5e7eb', color: '#374151' }
const tdBold   = { ...tdStyle, fontWeight: 700, background: '#eff6ff', color: '#1e3a8a' }

function SectionTitle({ children }) {
  return <div style={{ fontSize: 15, fontWeight: 600, color: blue, margin: '20px 0 12px' }}>{children}</div>
}

function MiniTable({ rows, cols, caption }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 8 }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr>{cols.map(c => <th key={c} style={thStyle}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j} style={j === 0 ? tdBold : tdStyle}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
      {caption && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{caption}</div>}
    </div>
  )
}

function DonutChart({ pct, color, label, sublabel }) {
  const r = 44, cx = 56, cy = 56, circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min((pct / 100) * circ, circ))
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={112} height={112}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={10} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill={color}>
          {pct.toFixed(1)} %
        </text>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</div>
      <div style={{ fontSize: 11, color: '#6b7280' }}>{sublabel}</div>
    </div>
  )
}

// ── Column Explore ────────────────────────────────────────────────────────────
export function ColumnExplore({ col, result }) {
  const [mode, setMode] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loadingCharts, setLoadingCharts] = useState(false)

  const dtype    = result.dtypes?.[col] || ''
  const isNum    = dtype.includes('int') || dtype.includes('float')
  const isDt     = dtype.includes('datetime')
  const autoMode = isDt ? 'datetime' : 'numeric'
  const activeMode = mode ?? autoMode

  const desc       = result.describe?.[col] || {}
  const boxStats   = result.box_stats?.[col] || {}
  const valueCounts = result.value_counts?.[col] || []
  const totalRows  = result.shape?.[0] || 0

  // Count from describe (full dataset)
  const countFromDesc  = parseFloat(desc['count']) || boxStats.count || 0
  const missingCount   = totalRows - countFromDesc
  const validPct       = totalRows > 0 ? (countFromDesc / totalRows) * 100 : 0
  const missingPct     = 100 - validPct

  useEffect(() => {
    setCharts(null)
    setLoadingCharts(true)
    axios.get(`/api/charts`, { params: { col } })
      .then(r => setCharts(r.data))
      .catch(() => setCharts({}))
      .finally(() => setLoadingCharts(false))
  }, [col])

  const fmt = v => { const n = parseFloat(v); return isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 6 }) }

  const descRowsNum = [
    ['count', countFromDesc.toLocaleString()],
    ['mean',  fmt(desc['mean'])],
    ['std',   fmt(desc['std'])],
    ['min',   fmt(desc['min'])],
    ['25%',   fmt(desc['25%'])],
    ['50%',   fmt(desc['50%'])],
    ['75%',   fmt(desc['75%'])],
    ['max',   fmt(desc['max'])],
  ]

  const descRowsDt = [
    ['count', countFromDesc.toLocaleString()],
    ['mean',  desc['mean']  || '—'],
    ['min',   desc['min']   || '—'],
    ['25%',   desc['25%']   || '—'],
    ['50%',   desc['50%']   || '—'],
    ['75%',   desc['75%']   || '—'],
    ['max',   desc['max']   || '—'],
  ]

  const ChartImg = ({ src, label }) => {
    if (loadingCharts) return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>Generando gráfico...</div>
    if (!src) return <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 12 }}>Sin datos para graficar</div>
    return <img src={`data:image/png;base64,${src}`} alt={label} style={{ width: 'calc(100% - 32px)', display: 'block', borderRadius: 6, border: '1px solid #e5e7eb', margin: '0 16px' }} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: blue, marginBottom: 4 }}>{col}</div>
        <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace', marginBottom: 12 }}>{dtype}</div>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {['numeric', 'datetime'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '7px 16px', fontSize: 12, border: 'none', cursor: 'pointer', background: 'none',
              color: activeMode === m ? blue : '#9ca3af',
              fontWeight: activeMode === m ? 600 : 400,
              borderBottom: `2px solid ${activeMode === m ? blue : 'transparent'}`,
              marginBottom: -1,
            }}>
              {m === 'numeric' ? 'Describe Numeric Content' : 'Describe Date-Time Content'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 24px' }}>

        {/* ── NUMERIC MODE ── */}
        {activeMode === 'numeric' && (
          <>
            <SectionTitle>Descriptive Statistics</SectionTitle>
            <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {isNum ? (
                <MiniTable rows={descRowsNum} cols={['', 'description']} />
              ) : (
                <div style={{ fontSize: 13, color: '#6b7280' }}>Columna no numérica — conversión a float64 resultaría en NaN</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {missingCount > 0 && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: red }}>
                    Missing Values: {missingCount.toLocaleString()} / {totalRows.toLocaleString()}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 32 }}>
                  <DonutChart pct={isNum ? validPct : 0}   color={isNum ? '#16a34a' : '#9ca3af'} label="Valid Values"   sublabel={`${isNum ? countFromDesc.toLocaleString() : 0} / ${totalRows.toLocaleString()}`} />
                  <DonutChart pct={isNum ? missingPct : 100} color={(!isNum || missingPct > 0) ? red : '#9ca3af'}     label="Missing Values" sublabel={`${isNum ? missingCount.toLocaleString() : totalRows.toLocaleString()} / ${totalRows.toLocaleString()}`} />
                </div>
              </div>
            </div>

            <SectionTitle>Unique Values</SectionTitle>
            <MiniTable
              rows={valueCounts.slice(0, 10).map(r => [r.value, r.count, r.pct.toFixed(6)])}
              cols={[col, 'value counts', 'normalized value counts']}
              caption={`${valueCounts.length} rows × 2 columns`}
            />

            {isNum && (
              <>
                <SectionTitle>Graphical View</SectionTitle>
                <ChartImg src={charts?.scatter} label="scatter" />

                <SectionTitle>Distribution</SectionTitle>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <ChartImg src={charts?.hist} label="histogram" />
                  </div>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <ChartImg src={charts?.box} label="boxplot" />
                  </div>
                </div>
              </>
            )}

            <SectionTitle>Non-Numeric Values</SectionTitle>
            <MiniTable
              rows={[['Bad Input', missingCount, missingCount > 0 ? (missingCount/totalRows).toFixed(6) : '0.0']]}
              cols={[col, 'value counts', 'normalized value counts']}
            />
          </>
        )}

        {/* ── DATETIME MODE ── */}
        {activeMode === 'datetime' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0 8px', borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: blue, fontWeight: 500 }}>Describe Date-Time Content</span>
              <button style={{ padding: '4px 14px', background: '#dbeafe', color: blue, border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>Describe</button>
            </div>

            <div style={{ fontSize: 12, color: '#374151', marginBottom: 16 }}>
              Need help to define datetime formats?{' '}
              <a href="https://strftime.org" target="_blank" rel="noreferrer" style={{ color: blue }}>Visit this page</a>
            </div>

            {isDt ? (
              <>
                <SectionTitle>Descriptive Statistics</SectionTitle>
                <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <MiniTable rows={descRowsDt} cols={['', 'description']} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {missingCount > 0 && (
                      <div style={{ fontSize: 13, fontWeight: 700, color: red }}>
                        Missing Values: {missingCount.toLocaleString()} / {totalRows.toLocaleString()}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 32 }}>
                      <DonutChart pct={validPct}   color="#16a34a" label="Valid Values"   sublabel={`${countFromDesc.toLocaleString()} / ${totalRows.toLocaleString()}`} />
                      <DonutChart pct={missingPct} color={missingPct > 0 ? red : '#9ca3af'} label="Missing Values" sublabel={`${missingCount.toLocaleString()} / ${totalRows.toLocaleString()}`} />
                    </div>
                  </div>
                </div>

                <SectionTitle>Unique Values</SectionTitle>
                <MiniTable
                  rows={valueCounts.slice(0, 10).map(r => [r.value, r.count, r.pct.toFixed(6)])}
                  cols={[col, 'value counts', 'normalized value counts']}
                  caption={`${valueCounts.length} rows × 2 columns`}
                />

                <SectionTitle>Graphical View</SectionTitle>
                <ChartImg src={charts?.scatter} label="datetime line" />
              </>
            ) : (
              <>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: red }}>
                    ⚠ Formato no reconocido como datetime — todos los valores resultan en NaT
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 32, marginBottom: 20 }}>
                  <DonutChart pct={0}   color="#9ca3af" label="Valid Values"   sublabel={`0 / ${totalRows.toLocaleString()}`} />
                  <DonutChart pct={100} color={red}     label="Missing Values" sublabel={`${totalRows.toLocaleString()} / ${totalRows.toLocaleString()}`} />
                </div>
                <SectionTitle>Non-Datetime Values</SectionTitle>
                <MiniTable
                  rows={valueCounts.slice(0, 10).map(r => [r.value, r.count, r.pct.toFixed(6)])}
                  cols={[col, 'value counts', 'normalized value counts']}
                  caption={`${valueCounts.length} rows × 2 columns`}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Resampler Windows View ────────────────────────────────────────────────────
function ResamplerView({ result }) {
  const windows = result.windows || []

  const thS = { background: '#dbeafe', padding: '5px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#1e40af', borderBottom: '1px solid #bfdbfe', whiteSpace: 'nowrap' }
  const tdS = { padding: '4px 10px', fontSize: 11, borderBottom: '1px solid #e5e7eb', color: '#374151', whiteSpace: 'nowrap' }
  const idxS = { ...tdS, fontWeight: 700, background: '#eff6ff', color: '#1e3a8a', borderRight: '2px solid #93c5fd' }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#FDF3E6', border: '1px solid #F0C07B', borderRadius: 8, padding: '6px 16px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#865008' }}>Resampler</span>
        </div>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          <strong style={{ color: '#111' }}>{result.n_windows}</strong> ventanas
          {windows.length < result.n_windows && ` (mostrando ${windows.length})`}
        </span>
      </div>

      {/* Windows */}
      {windows.map((win, wi) => (
        <div key={wi} style={{ marginBottom: 24 }}>
          {/* Window header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#865008', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {wi + 1}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#865008', fontFamily: 'monospace' }}>
              {win.timestamp}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              {win.n_rows} fila{win.n_rows !== 1 ? 's' : ''}
              {win.n_rows > 5 && ' (mostrando primeras 5)'}
            </div>
          </div>

          {/* Window table */}
          {win.data.length > 0 && (
            <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, marginLeft: 30 }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ ...thS, background: '#FDF3E6', color: '#865008', borderRight: '2px solid #F0C07B' }}>{win.index_col || 'Time'}</th>
                    {win.columns.map(col => <th key={col} style={thS}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {win.data.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ ...idxS, background: '#FDF3E633', color: '#865008', borderRight: '2px solid #F0C07B', fontFamily: 'monospace' }}>
                        {String(row[win.index_col] ?? row['Time'] ?? '').replace('T', ' ').split('.')[0]}
                      </td>
                      {win.columns.map(col => (
                        <td key={col} style={tdS}>
                          {row[col] === null || row[col] === undefined
                            ? <span style={{ color: '#d1d5db' }}>—</span>
                            : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* Generated code */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Código Python generado</div>
        <pre style={{ background: '#1e293b', color: '#e2e8f0', borderRadius: 8, padding: 14, fontSize: 11, lineHeight: 1.7, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {result.code}
        </pre>
      </div>
    </div>
  )
}

// ── Main ResultsView ──────────────────────────────────────────────────────────
export default function ResultsView({ result }) {
  const [tab, setTab]           = useState('results')
  const [selectedCol, setSelectedCol] = useState(result.columns?.[0] || null)

  // Resampler response — show windows view directly
  if (result.is_resampler) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'white' }}>
        <ResamplerView result={result} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'white' }}>
      {/* Tabs + metrics */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '0 20px', flexShrink: 0 }}>
        {['results', 'explore'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '12px 16px', fontSize: 12, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: `3px solid ${tab === t ? blue : 'transparent'}`,
            color: tab === t ? blue : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t === 'results' ? 'Results' : 'Explore'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
          <span><strong style={{ color: '#111' }}>{result.shape?.[0]?.toLocaleString()}</strong> filas</span>
          <span><strong style={{ color: '#111' }}>{result.shape?.[1]}</strong> columnas</span>
          <span><strong style={{ color: result.nulls > 0 ? red : '#16a34a' }}>{result.nulls?.toLocaleString()}</strong> nulos</span>
        </div>
      </div>

      {/* Results tab */}
      {tab === 'results' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            {(() => {
              const indexCols = result.index_names || []
              const hasIndex  = indexCols.length > 0
              const dataCols  = result.columns?.filter(c => !indexCols.includes(c)) || []
              const idxThStyle = { padding: '6px 12px', borderBottom: '1px solid #bfdbfe', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#1e40af', whiteSpace: 'nowrap', minWidth: 110, background: '#dbeafe', borderRight: '2px solid #93c5fd' }
              const idxTdStyle = { padding: '4px 12px', borderBottom: '1px solid #e5e7eb', borderRight: '2px solid #93c5fd', fontWeight: 700, background: '#eff6ff', color: '#1e3a8a', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 11 }
              const fmtVal = (val, col) => {
                if (val === null || val === undefined) return ''
                const dtype = result.dtypes?.[col] || ''
                return dtype.includes('datetime') ? String(val).replace('T', ' ').split('.')[0] : String(val)
              }
              return (
                <table style={{ fontSize: 12, borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {!hasIndex && <th style={{ padding: '6px 10px', borderBottom: '1px solid #e5e7eb', color: '#9ca3af', fontSize: 11, minWidth: 36 }}></th>}
                      {indexCols.map(col => <th key={col} style={idxThStyle}>{col}</th>)}
                      {dataCols.map(col => (
                        <th key={col} style={{ padding: '6px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#374151', whiteSpace: 'nowrap', minWidth: 110 }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data?.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        {!hasIndex && <td style={{ padding: '4px 10px', borderBottom: '1px solid #f3f4f6', color: '#9ca3af', fontSize: 11, fontWeight: 600, textAlign: 'right' }}>{i}</td>}
                        {indexCols.map(col => <td key={col} style={idxTdStyle}>{fmtVal(row[col], col)}</td>)}
                        {dataCols.map(col => (
                          <td key={col} style={{ padding: '4px 12px', borderBottom: '1px solid #f3f4f6', color: row[col] === null ? '#d1d5db' : '#111', whiteSpace: 'nowrap' }}>
                            {fmtVal(row[col], col)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            })()}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Código Python generado</div>
            <pre style={{ background: '#1e293b', color: '#e2e8f0', borderRadius: 8, padding: 14, fontSize: 11, lineHeight: 1.7, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {result.code}
            </pre>
            <button onClick={() => { const blob = new Blob([result.code], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pipeline_dataici.py'; a.click() }}
              style={{ marginTop: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, background: '#eff6ff', color: blue, border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer' }}>
              ⬇ Descargar .py
            </button>
          </div>
        </div>
      )}

      {/* Explore tab */}
      {tab === 'explore' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: 220, borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
              ↻ DataFrame Columns
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {result.columns?.map(col => (
                <div key={col} onClick={() => setSelectedCol(col)} style={{
                  padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                  background: selectedCol === col ? '#eff6ff' : 'white',
                  color: selectedCol === col ? blue : '#374151',
                  borderBottom: '1px solid #f3f4f6',
                  fontWeight: selectedCol === col ? 600 : 400,
                  borderLeft: `3px solid ${selectedCol === col ? blue : 'transparent'}`,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {col}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedCol
              ? <ColumnExplore col={selectedCol} result={result} />
              : <div style={{ padding: 24, color: '#9ca3af', fontSize: 13 }}>Selecciona una columna.</div>}
          </div>
        </div>
      )}
    </div>
  )
}
