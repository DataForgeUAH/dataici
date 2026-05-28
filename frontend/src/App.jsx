import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import BlockNode from './nodes/BlockNode.jsx'
import Sidebar from './panels/Sidebar.jsx'
import ParamsPanel from './panels/ParamsPanel.jsx'
import ResultsView from './panels/ResultsView.jsx'
import BlockDesigner from './panels/BlockDesigner.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import axios from 'axios'

const nodeTypes = { block: BlockNode }

let nodeId = 1
const newId = () => `node_${nodeId++}`

// ── DataForge SVG icon (shared in topbar) ──────────────────────────────────────
function DataIciIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="8"  width="6" height="24" rx="2" fill="rgba(255,255,255,0.9)" opacity="0.9"/>
      <rect x="11" y="4"  width="6" height="32" rx="2" fill="rgba(255,255,255,0.9)"/>
      <rect x="20" y="12" width="6" height="16" rx="2" fill="rgba(196,18,45,0.85)"/>
      <rect x="29" y="6"  width="6" height="28" rx="2" fill="rgba(255,255,255,0.9)" opacity="0.7"/>
      <line x1="5" y1="20" x2="35" y2="20" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="2 3"/>
    </svg>
  )
}

function AppInner({ project, onBackToProjects }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edgesState, setEdgesState, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [availableBlocks, setAvailableBlocks] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [designerNode, setDesignerNode] = useState(null)
  const [designerLoading, setDesignerLoading] = useState(false)
  const [blockCodeModal, setBlockCodeModal] = useState(null)
  const [prevColumns, setPrevColumns] = useState([])
  const [saveStatus, setSaveStatus] = useState(null) // 'saving' | 'saved' | 'error'
  const { screenToFlowPosition } = useReactFlow()
  const saveTimerRef = useRef(null)
  const latestNodesRef = useRef([])
  const latestEdgesRef = useRef([])

  // Load blocks list
  useEffect(() => {
    axios.get('/api/blocks').then(r => setAvailableBlocks(r.data)).catch(() => {})
  }, [])

  // Load project nodes/edges on mount
  useEffect(() => {
    if (!project) return
    const pNodes = project.nodes || []
    const pEdges = project.edges || []
    if (pNodes.length > 0) {
      // Restore nodes — ensure they have the required React Flow shape
      setNodes(pNodes.map(n => ({
        ...n,
        type: n.type || 'block',
      })))
      // Advance the nodeId counter past any existing nodes
      const maxId = pNodes
        .map(n => parseInt(n.id.replace('node_', ''), 10))
        .filter(n => !isNaN(n))
        .reduce((a, b) => Math.max(a, b), 0)
      nodeId = maxId + 1
    }
    if (pEdges.length > 0) {
      setEdgesState(pEdges)
    }
  }, [project?.id])

  // Keep refs in sync so manual save always has latest state
  useEffect(() => { latestNodesRef.current = nodes }, [nodes])
  useEffect(() => { latestEdgesRef.current = edgesState }, [edgesState])

  // Immediate save (used by manual button)
  const saveNow = useCallback(async (n, e) => {
    if (!project) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveStatus('saving')
    try {
      await axios.put(`/api/projects/${project.id}`, {
        nodes: n ?? latestNodesRef.current,
        edges: e ?? latestEdgesRef.current,
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    } catch {
      setSaveStatus('error')
    }
  }, [project])

  // Auto-save debounced whenever nodes or edges change
  const triggerSave = useCallback(
    (latestNodes, latestEdges) => {
      if (!project) return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => saveNow(latestNodes, latestEdges), 1200)
    },
    [project, saveNow]
  )

  const addBlock = useCallback((blockMeta, position) => {
    const id = newId()
    const offset = nodes.length
    const pos = position || { x: 120 + (offset % 3) * 260, y: 80 + Math.floor(offset / 3) * 160 }
    const newNode = {
      id,
      type: 'block',
      position: pos,
      data: {
        label: blockMeta.label,
        blockType: blockMeta.type,
        category: blockMeta.category,
        paramsDef: blockMeta.params,
        params: Object.fromEntries(blockMeta.params.map(p => [p.key, p.default])),
        userLabel: '',
      },
    }
    setNodes(nds => {
      const next = [...nds, newNode]
      triggerSave(next, edgesState)
      return next
    })
    setSelectedNode(id)
  }, [nodes, setNodes, edgesState, triggerSave])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/dataici-block')
    if (!raw) return
    const blockMeta = JSON.parse(raw)
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    addBlock(blockMeta, position)
  }, [screenToFlowPosition, addBlock])

  const onEdgeClick = useCallback((_, edge) => {
    setEdgesState(eds => {
      const next = eds.filter(e => e.id !== edge.id)
      triggerSave(nodes, next)
      return next
    })
  }, [setEdgesState, nodes, triggerSave])

  const updateParams = useCallback((nid, newParams) => {
    setNodes(nds => {
      const next = nds.map(n =>
        n.id === nid ? { ...n, data: { ...n.data, params: newParams } } : n
      )
      triggerSave(next, edgesState)
      return next
    })
  }, [setNodes, edgesState, triggerSave])

  const onConnect = useCallback((params) =>
    setEdgesState(eds => {
      const next = addEdge({ ...params, type: 'straight' }, eds)
      triggerSave(nodes, next)
      return next
    }),
  [setEdgesState, nodes, triggerSave])

  const deleteNode = useCallback((nid) => {
    setNodes(nds => {
      const next = nds.filter(n => n.id !== nid)
      setEdgesState(eds => {
        const nextEdges = eds.filter(e => e.source !== nid && e.target !== nid)
        triggerSave(next, nextEdges)
        return nextEdges
      })
      return next
    })
    setSelectedNode(prev => prev === nid ? null : prev)
    if (designerNode?.id === nid) setDesignerNode(null)
  }, [setNodes, setEdgesState, designerNode, triggerSave])

  const getSubgraph = (targetId, edges) => {
    const visited = new Set()
    const queue = [targetId]
    while (queue.length) {
      const id = queue.shift()
      if (visited.has(id)) continue
      visited.add(id)
      edges.filter(e => e.target === id).forEach(e => queue.push(e.source))
    }
    return visited
  }

  const buildPayload = (nodeIds, edges) => {
    const idSet   = new Set(nodeIds)
    const subNodes = nodes
      .filter(n => idSet.has(n.id))
      .map(n => ({ id: n.id, type: n.data.blockType, params: n.data.params }))
    const subEdges = edges
      .filter(e => idSet.has(e.source) && idSet.has(e.target))
      .map(e => ({ source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }))
    return { nodes: subNodes, edges: subEdges }
  }

  const runUpToNode = useCallback(async (nid) => {
    const ancestorIds = getSubgraph(nid, edgesState)
    const payload = buildPayload([...ancestorIds], edgesState)
    const res = await axios.post('/api/run', payload)
    return res.data
  }, [nodes, edgesState])

  const runPipeline = useCallback(async () => {
    if (nodes.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const payload = buildPayload(nodes.map(n => n.id), edgesState)
      const res = await axios.post('/api/run', payload)
      if (res.data.error) setError(res.data.error)
      else { setResult(res.data); setShowResults(true) }
    } catch {
      setError('No se pudo conectar con el backend.')
    } finally { setLoading(false) }
  }, [nodes, edgesState])

  const openDesigner = useCallback(async (node) => {
    setDesignerLoading(true)
    const incomingEdge = edgesState.find(e =>
      e.target === node.id && (e.targetHandle === 'input-0' || !e.targetHandle)
    )
    if (incomingEdge) {
      try {
        const ancestorIds = getSubgraph(incomingEdge.source, edgesState)
        const payload = buildPayload([...ancestorIds], edgesState)
        const res = await axios.post('/api/run', payload)
        setPrevColumns(res.data.columns || [])
      } catch { setPrevColumns([]) }
    } else {
      setPrevColumns([])
    }
    setDesignerLoading(false)
    setDesignerNode(node)
  }, [nodes, edgesState])

  const showBlockCode = useCallback(async (nid) => {
    try {
      const data = await runUpToNode(nid)
      setBlockCodeModal(data?.error ? `# Error: ${data.error}` : data?.code || '')
    } catch { setBlockCodeModal('# Error de conexión') }
  }, [runUpToNode])

  const handleDesignerUpdate = useCallback((params) => {
    if (!designerNode) return
    updateParams(designerNode.id, params)
    setDesignerNode(n => ({ ...n, data: { ...n.data, params } }))
  }, [designerNode, updateParams])

  const selectedNodeData = nodes.find(n => n.id === selectedNode)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Topbar */}
      <div style={{ height: 48, background: '#1B2D5B', borderBottom: '1px solid #12234A', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, flexShrink: 0 }}>
        <DataIciIcon size={26} />
        <span style={{ fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: '-0.3px' }}>DataForge</span>
        <span style={{ color: '#6E8FC4', fontSize: 11 }}>v1.0 · UAH</span>

        {project && (
          <>
            <span style={{ color: '#3D5A8A', fontSize: 13 }}>·</span>
            <span style={{ color: '#93C5FD', fontSize: 12, fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.name}
            </span>
          </>
        )}

        <div style={{ flex: 1 }} />

        {/* Save status indicator */}
        {saveStatus === 'saving' && (
          <span style={{ color: '#93C5FD', fontSize: 11 }}>Guardando…</span>
        )}
        {saveStatus === 'saved' && (
          <span style={{ color: '#6EE7B7', fontSize: 11 }}>✓ Guardado</span>
        )}
        {saveStatus === 'error' && (
          <span style={{ color: '#FCA5A5', fontSize: 11 }}>⚠ Error al guardar</span>
        )}

        {/* Manual save button — only when inside a project */}
        {project && (
          <button
            onClick={() => saveNow()}
            disabled={saveStatus === 'saving'}
            title="Guardar proyecto"
            style={{
              background: saveStatus === 'saved' ? 'rgba(110,231,183,0.18)' : 'rgba(255,255,255,0.1)',
              color: saveStatus === 'saved' ? '#6EE7B7' : 'white',
              border: `1px solid ${saveStatus === 'saved' ? 'rgba(110,231,183,0.4)' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 8, padding: '5px 13px',
              fontWeight: 600, fontSize: 12, cursor: saveStatus === 'saving' ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
              opacity: saveStatus === 'saving' ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 13 }}>💾</span>
            Guardar
          </button>
        )}

        {error && <span style={{ color: '#FCA5A5', fontSize: 12, maxWidth: 320 }}>⚠ {error}</span>}

        {showResults && (
          <button onClick={() => setShowResults(false)} style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            ← Volver al canvas
          </button>
        )}

        {onBackToProjects && (
          <button onClick={onBackToProjects} style={{ background: 'rgba(255,255,255,0.08)', color: '#93C5FD', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            ← Proyectos
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar blocks={availableBlocks} onAddBlock={addBlock} hidden={showResults || !!designerNode} />

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, display: (showResults || designerNode) ? 'none' : 'block' }}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <ReactFlow
              nodes={nodes.map(n => ({
                ...n,
                data: { ...n.data, id: n.id, selected: n.id === selectedNode, onDelete: deleteNode }
              }))}
              edges={edgesState}
              onNodesChange={(changes) => {
                onNodesChange(changes)
                // Save after position changes settle (drag end)
                const hasMoved = changes.some(c => c.type === 'position' && c.dragging === false)
                if (hasMoved) triggerSave(nodes, edgesState)
              }}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              onNodeClick={(_, node) => setSelectedNode(node.id)}
              nodeTypes={nodeTypes}
              fitView
              edgesFocusable={true}
            >
              <Background gap={16} color="#e5e7eb" />
              <Controls />
              <MiniMap nodeColor="#3b82f6" maskColor="rgba(0,0,0,0.05)" />
            </ReactFlow>

            {nodes.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ textAlign: 'center', color: '#A0AECA' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>＋</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Agrega bloques desde el panel izquierdo</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>o arrástralos al canvas</div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {showResults && result && (
            <div style={{ position: 'absolute', inset: 0, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <ResultsView result={result} />
            </div>
          )}

          {/* Block designer */}
          {designerNode && (
            <div style={{ position: 'absolute', inset: 0, background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <BlockDesigner
                node={designerNode}
                columns={prevColumns}
                onUpdate={handleDesignerUpdate}
                onClose={() => setDesignerNode(null)}
                onRunExplore={() => runUpToNode(designerNode.id)}
              />
            </div>
          )}

          {/* Loading overlay */}
          {(loading || designerLoading) && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 400,
              background: 'rgba(27,45,91,0.45)',
              backdropFilter: 'blur(3px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'all',
            }}>
              <div style={{
                background: 'white', borderRadius: 16, padding: '32px 48px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                boxShadow: '0 20px 60px rgba(27,45,91,0.3)',
              }}>
                <div style={{
                  width: 44, height: 44,
                  border: '4px solid #D8E0EF',
                  borderTop: '4px solid #1B2D5B',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: '#1B2D5B' }}>
                  {designerLoading ? 'Cargando configuración…' : 'Ejecutando bloque…'}
                </span>
                <span style={{ fontSize: 12, color: '#6278A0' }}>
                  {designerLoading ? 'Procesando datos del bloque' : 'Calculando resultado'}
                </span>
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Code modal */}
          {blockCodeModal !== null && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 40 }}
              onClick={e => { if (e.target === e.currentTarget) setBlockCodeModal(null) }}>
              <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 720, maxHeight: '80%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Código Python generado</span>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => setBlockCodeModal(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ overflow: 'auto', padding: 16 }}>
                  <pre style={{ background: '#1e293b', color: '#e2e8f0', borderRadius: 8, padding: 14, fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {blockCodeModal}
                  </pre>
                  <button onClick={() => { const blob = new Blob([blockCodeModal], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pipeline_dataici.py'; a.click() }}
                    style={{ marginTop: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer' }}>
                    ⬇ Descargar .py
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        {!showResults && !designerNode && (
        <div style={{ width: 300, borderLeft: '1px solid #D8E0EF', display: 'flex', flexDirection: 'column', background: '#F4F7FB', overflow: 'hidden' }}>
          {selectedNodeData ? (
            <ParamsPanel
              node={selectedNodeData}
              onUpdate={(params) => updateParams(selectedNode, params)}
              onDelete={() => deleteNode(selectedNode)}
              onDesign={() => openDesigner(selectedNodeData)}
              onLabelChange={(val) => setNodes(nds => nds.map(n =>
                n.id === selectedNode ? { ...n, data: { ...n.data, userLabel: val } } : n
              ))}
              onRun={async () => {
                setError(null)
                setLoading(true)
                try {
                  const data = await runUpToNode(selectedNode)
                  if (data?.error) setError(data.error)
                  else { setResult(data); setShowResults(true) }
                } catch { setError('Error de conexión') }
                finally { setLoading(false) }
              }}
              onCode={() => showBlockCode(selectedNode)}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <div style={{ textAlign: 'center', color: '#A0AECA' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⚙️</div>
                <div style={{ fontSize: 13, color: '#6278A0' }}>Selecciona un bloque para ver sus opciones</div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('landing')   // 'landing' | 'projects' | 'editor'
  const [currentProject, setCurrentProject] = useState(null)

  // Toggle editor-mode class on body so overflow:hidden only applies in the editor
  useEffect(() => {
    if (view === 'editor') {
      document.body.classList.add('editor-mode')
    } else {
      document.body.classList.remove('editor-mode')
    }
    return () => document.body.classList.remove('editor-mode')
  }, [view])

  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('projects')} />
  }

  if (view === 'projects') {
    return (
      <ProjectsPage
        onOpenProject={(proj) => { setCurrentProject(proj); setView('editor') }}
        onBack={() => setView('landing')}
      />
    )
  }

  // editor view
  return (
    <ReactFlowProvider>
      <AppInner
        project={currentProject}
        onBackToProjects={() => setView('projects')}
      />
    </ReactFlowProvider>
  )
}
