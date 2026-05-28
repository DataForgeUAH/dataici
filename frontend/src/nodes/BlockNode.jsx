import { Handle, Position } from '@xyflow/react'

// Blocks that produce data but need no upstream connection
const SOURCE_BLOCKS = new Set(['load_csv', 'read_excel'])
// Blocks that consume data but produce no downstream output
const SINK_BLOCKS   = new Set(['write_csv'])

const CATEGORY_COLORS = {
  'Data I/O':   { bg: '#EEF1FB', border: '#B4C3DF', text: '#1B2D5B' },
  'Columns':    { bg: '#FAEAED', border: '#E9A5AE', text: '#9B1A2C' },
  'Index':      { bg: '#E6F5F5', border: '#8DCFD0', text: '#0B6B70' },
  'DataFrame':  { bg: '#E8F5EE', border: '#8FC8AA', text: '#1A5E38' },
  'Resampling': { bg: '#FDF3E6', border: '#F0C07B', text: '#865008' },
}

export default function BlockNode({ data }) {
  const colors = CATEGORY_COLORS[data.category] || { bg: '#F4F7FB', border: '#D0D8E8', text: '#374151' }
  const isSource = SOURCE_BLOCKS.has(data.blockType)
  const isSink   = SINK_BLOCKS.has(data.blockType)

  // Multi-input support
  const inputPorts = data.blockType === 'concatenate'
    ? Math.max(2, parseInt(data.params?.input_count) || 2)
    : 1

  return (
    <div style={{
      background: data.selected ? colors.bg : '#FAFBFD',
      border: `2px solid ${data.selected ? colors.border : '#D8E0EF'}`,
      borderRadius: 10,
      padding: '10px 14px',
      width: 200,
      boxShadow: data.selected
        ? `0 0 0 3px ${colors.border}`
        : '0 1px 4px rgba(27,45,91,0.08)',
      cursor: 'pointer',
      position: 'relative',
    }}>

      {/* ── Input handles (skipped for source blocks) ── */}
      {!isSource && (
        inputPorts === 1 ? (
          <Handle type="target" position={Position.Top} style={{
            background: 'white', border: '2px solid #94a3b8',
            width: 14, height: 14, top: -7,
          }} />
        ) : (
          Array.from({ length: inputPorts }, (_, i) => {
            const leftPct = ((i + 1) / (inputPorts + 1)) * 100
            return (
              <Handle
                key={i}
                id={`input-${i}`}
                type="target"
                position={Position.Top}
                style={{
                  left: `${leftPct}%`,
                  top: -7,
                  width: 14, height: 14,
                  background: '#86efac',
                  border: '2px solid #16a34a',
                  transform: 'translateX(-50%)',
                }}
              >
                <div style={{
                  position: 'absolute', top: -14, left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 9, fontWeight: 700, color: '#16a34a',
                  pointerEvents: 'none', userSelect: 'none',
                }}>{i + 1}</div>
              </Handle>
            )
          })
        )
      )}

      {/* Category badge + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: colors.text,
          background: colors.bg, border: `1px solid ${colors.border}`,
          borderRadius: 4, padding: '1px 6px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120,
        }}>
          {data.category}
        </div>
        <button
          onClick={e => { e.stopPropagation(); data.onDelete && data.onDelete(data.id) }}
          style={{
            marginLeft: 'auto', background: '#FAEAED', border: '1px solid #E9A5AE',
            borderRadius: 4, color: '#9B1A2C', fontSize: 13, lineHeight: 1,
            padding: '1px 5px', cursor: 'pointer', fontWeight: 700, flexShrink: 0,
          }}
        >×</button>
      </div>

      <div style={{
        fontWeight: 600, fontSize: 13, color: '#1B2D5B',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2,
      }}>
        {data.userLabel || data.label}
      </div>

      <div style={{
        fontSize: 11, color: '#7A8DB5',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {data.label}
      </div>

      {/* ── Output handle (skipped for sink blocks) ── */}
      {!isSink && (
        <Handle type="source" position={Position.Bottom} style={{
          background: 'white', border: '2px solid #94a3b8',
          width: 14, height: 14, bottom: -7,
        }} />
      )}
    </div>
  )
}
