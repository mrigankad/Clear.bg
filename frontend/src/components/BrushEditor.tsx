import { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser, ArrowCounterClockwise, X, FloppyDisk, PaintBrush, ArrowClockwise, MagnifyingGlassMinus, MagnifyingGlassPlus } from '@phosphor-icons/react'

interface Props {
  resultUrl: string
  fileName: string
  onSave: (blob: Blob) => void
  onClose: () => void
}

type Mode = 'erase' | 'restore'
const MAX_HISTORY = 30

export function BrushEditor({ resultUrl, fileName, onSave, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pristineRef = useRef<HTMLCanvasElement | null>(null)
  const historyRef = useRef<ImageData[]>([])
  const historyIndexRef = useRef(-1)
  const isDrawing = useRef(false)
  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })
  const spaceHeld = useRef(false)

  const [mode, setMode] = useState<Mode>('erase')
  const [size, setSize] = useState(30)
  const [loaded, setLoaded] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const pristine = document.createElement('canvas')
      pristine.width = img.naturalWidth
      pristine.height = img.naturalHeight
      pristine.getContext('2d')!.drawImage(img, 0, 0)
      pristineRef.current = pristine
      historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)]
      historyIndexRef.current = 0
      setLoaded(true)
    }
    img.src = resultUrl
  }, [resultUrl])

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(snapshot)
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
    historyIndexRef.current = historyRef.current.length - 1
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(false)
  }, [])

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.putImageData(historyRef.current[historyIndexRef.current], 0, 0)
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(true)
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.putImageData(historyRef.current[historyIndexRef.current], 0, 0)
    setCanUndo(true)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }, [])

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const paint = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y } = getCanvasPoint(e)
    const r = (size / 2) * (canvas.width / canvas.getBoundingClientRect().width)
    if (mode === 'erase') {
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    } else {
      const pristine = pristineRef.current
      if (!pristine) return
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip()
      ctx.drawImage(pristine, 0, 0)
      ctx.restore()
    }
  }, [mode, size])

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (spaceHeld.current) {
      isPanning.current = true
      lastPan.current = { x: e.clientX, y: e.clientY }
      return
    }
    isDrawing.current = true
    ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
    paint(e)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      const dx = e.clientX - lastPan.current.x
      const dy = e.clientY - lastPan.current.y
      lastPan.current = { x: e.clientX, y: e.clientY }
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
      return
    }
    if (isDrawing.current) paint(e)
  }
  const onPointerUp = () => {
    isPanning.current = false
    if (isDrawing.current) { isDrawing.current = false; pushHistory() }
  }

  // Wheel zoom
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    setZoom((z) => Math.max(0.25, Math.min(5, z * (e.deltaY < 0 ? 1.1 : 0.9))))
  }

  const handleSave = () => {
    canvasRef.current?.toBlob((blob) => { if (blob) onSave(blob) }, 'image/png')
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') { e.preventDefault(); spaceHeld.current = true }
    if (e.code === 'Escape') onClose()
    if (e.key === 'e' || e.key === 'E') setMode('erase')
    if (e.key === 'r' || e.key === 'R') setMode('restore')
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo() }
    if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) { e.preventDefault(); redo() }
    if (e.key === '0') { setZoom(1); setPan({ x: 0, y: 0 }) }
  }, [onClose, undo, redo])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') { spaceHeld.current = false; isPanning.current = false }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp) }
  }, [handleKeyDown, handleKeyUp])

  const cursorStyle = spaceHeld.current ? 'grab' : `brush-cursor-${mode}`

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="brush-modal">
        <div className="brush-modal-header">
          <div className="brush-modal-title">
            <PaintBrush size={18} weight="duotone" />
            Refine edges — <span className="brush-modal-filename">{fileName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="zoom-label">{Math.round(zoom * 100)}%</span>
            <button className="btn btn-ghost btn-icon" onClick={() => setZoom((z) => Math.min(5, z * 1.25))}><MagnifyingGlassPlus size={16} weight="bold" /></button>
            <button className="btn btn-ghost btn-icon" onClick={() => setZoom((z) => Math.max(0.25, z * 0.8))}><MagnifyingGlassMinus size={16} weight="bold" /></button>
            <button className="btn btn-ghost btn-icon" title="Reset view (0)" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>1:1</button>
            <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18} weight="bold" /></button>
          </div>
        </div>

        <div
          ref={wrapRef}
          className="brush-canvas-area"
          onWheel={onWheel}
          style={{ overflow: 'hidden' }}
        >
          {!loaded && <div className="brush-canvas-loading"><div className="spinner" /></div>}
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.05s' }}>
            <canvas
              ref={canvasRef}
              className={`brush-canvas ${cursorStyle}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          </div>
        </div>

        <div className="brush-toolbar">
          <div className="brush-modes">
            <button className={`btn${mode === 'erase' ? ' btn-primary' : ''}`} onClick={() => setMode('erase')} title="Erase (E)">
              <Eraser size={15} weight="bold" /> Erase
            </button>
            <button className={`btn${mode === 'restore' ? ' btn-primary' : ''}`} onClick={() => setMode('restore')} title="Restore (R)">
              <ArrowCounterClockwise size={15} weight="bold" /> Restore
            </button>
          </div>

          <div className="brush-size-group">
            <span className="brush-size-label">Size</span>
            <input type="range" min={4} max={120} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            <span className="brush-size-val">{size}px</span>
          </div>

          <div className="brush-undo-redo">
            <button className="btn btn-ghost btn-icon" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}><ArrowCounterClockwise size={15} weight="bold" /></button>
            <button className="btn btn-ghost btn-icon" title="Redo (Ctrl+Y)" disabled={!canRedo} onClick={redo}><ArrowClockwise size={15} weight="bold" /></button>
          </div>

          <div className="brush-toolbar-actions">
            <button className="btn btn-ghost" onClick={onClose}><X size={14} weight="bold" /> Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}><FloppyDisk size={14} weight="bold" /> Save changes</button>
          </div>
        </div>

        <div className="brush-hints">
          <span><kbd>Space</kbd>+drag to pan</span>
          <span><kbd>Scroll</kbd> to zoom</span>
          <span><kbd>0</kbd> reset view</span>
          <span><kbd>E</kbd> erase · <kbd>R</kbd> restore</span>
        </div>
      </div>
    </div>
  )
}
