import { useState } from 'react'

const CATEGORY_ORDER = ['Data I/O', 'Columns', 'Index', 'DataFrame', 'Resampling']

const CATEGORY_COLORS = {
  'Data I/O':   '#1B2D5B',
  'Columns':    '#C4122D',
  'Index':      '#0B6B70',
  'DataFrame':  '#1A5E38',
  'Resampling': '#865008',
}

export default function Sidebar({ blocks, onAddBlock, hidden = false }) {
  const initialCollapsed = CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  if (hidden) return null

  const grouped = blocks.reduce((acc, b) => {
    if (!acc[b.category]) acc[b.category] = []
    acc[b.category].push(b)
    return acc
  }, {})

  const toggleCategory = (cat) =>
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))

  const onDragStart = (e, blockMeta) => {
    e.dataTransfer.setData('application/dataici-block', JSON.stringify(blockMeta))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div style={{
      width: 200, background: 'white', borderRight: '1px solid #D8E0EF',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #D8E0EF', background: '#1B2D5B' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Bloques</div>
        <div style={{ fontSize: 11, color: '#A8BADA', marginTop: 2 }}>Arrastra al canvas o haz clic</div>
      </div>

      <div style={{ overflow: 'auto', flex: 1 }}>
        {CATEGORY_ORDER.map(cat => {
          const items = grouped[cat] || []
          if (!items.length) return null
          const color = CATEGORY_COLORS[cat] || '#374151'
          const isCollapsed = collapsed[cat]

          return (
            <div key={cat} style={{ borderBottom: '1px solid #EEF2F9' }}>
              <div
                onClick={() => toggleCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 14px', cursor: 'pointer',
                  background: isCollapsed ? 'white' : '#F4F7FB',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color }}>{cat}</span>
                <span style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1 }}>
                  {isCollapsed ? '›' : '⌄'}
                </span>
              </div>

              {!isCollapsed && (
                <div style={{ padding: '4px 0 8px' }}>
                  {items.map(b => (
                    <button
                      key={b.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, b)}
                      onClick={() => onAddBlock(b)}
                      style={{
                        display: 'block', width: 'calc(100% - 20px)',
                        margin: '2px 10px', padding: '7px 10px',
                        fontSize: 12, color: '#374151',
                        background: '#F4F7FB', border: '1px solid #D8E0EF',
                        borderRadius: 6, textAlign: 'left', cursor: 'grab',
                        transition: 'background 0.12s, color 0.12s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${color}15`
                        e.currentTarget.style.color = color
                        e.currentTarget.style.borderColor = `${color}50`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#F4F7FB'
                        e.currentTarget.style.color = '#374151'
                        e.currentTarget.style.borderColor = '#D8E0EF'
                      }}
                    >
                      ⠿ {b.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {blocks.length === 0 && (
          <div style={{ padding: '20px 14px', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            Conectando con el backend...
          </div>
        )}
      </div>
    </div>
  )
}
