import { Handle, Position } from '@xyflow/react'

const SOURCE_BLOCKS = new Set(['load_csv', 'read_excel'])
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

  const inputPorts = data.blockType === 'concatenate'
    ? Math.max(2, parseInt(data.params?.input_count) || 2)
    : 1

  return (
    <div style={{
      background: data.selected ? colors.bg : '#FAFBFD',
      border: `2px solid ${data.selected ? colors.border : '#D8E0EF'}`,
      borderRadius: 14,
      padding: '13px 18px',
      width: 240,
      boxShadow: data.selected
        ? `0 0 0 3px ${colors.border}`
        : '0 2px 6px rgba(27,45,91,0.1)',
      cursor: 'pointer',
      position: 'relative',
    }}>

      {/* Input handles */}
      {!isSource && (
        inputPorts === 1 ? (
          <Handle type="target" position={Position.Top} style={{
            background: 'white', border: '2px solid #94a3b8',
            width: 16, height: 16, top: -8,
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
                  top: -8,
                  width: 16, height: 16,
                  background: '#86efac',
                  border: '2px solid #16a34a',
                  transform: 'translateX(-50%)',
                }}
              >
                <div style={{
                  position: 'absolute', top: -16, left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 11, fontWeight: 700, color: '#16a34a',
                  pointerEvents: 'none', userSelect: 'none',
                }}>{i + 1}</div>
              </Handle>
            )
          })
        )
      )}

      {/* Category badge + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: colors.text,
          background: colors.bg, border: `1px solid ${colors.border}`,
          borderRadius: 5, padding: '2px 8px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
        }}>
          {data.category}
        </div>
        <button
          onClick={e => { e.stopPropagation(); data.onDelete && data.onDelete(data.id) }}
          style={{
            marginLeft: 'auto', background: '#FAEAED', border: '1px solid #E9A5AE',
            borderRadius: 5, color: '#9B1A2C', fontSize: 15, lineHeight: 1,
            padding: '2px 7px', cursor: 'pointer', fontWeight: 700, flexShrink: 0,
          }}
        >×</button>
      </div>

      {/* Block name */}
      <div style={{
        fontWeight: 700, fontSize: 15, color: '#1B2D5B',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3,
      }}>
        {data.userLabel || data.label}
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: 13, color: '#7A8DB5',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {data.label}
      </div>

      {/* Output handle */}
      {!isSink && (
        <Handle type="source" position={Position.Bottom} style={{
          background: 'white', border: '2px solid #94a3b8',
          width: 16, height: 16, bottom: -8,
        }} />
      )}
    </div>
  )
}
