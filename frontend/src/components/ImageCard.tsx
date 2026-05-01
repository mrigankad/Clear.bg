import { useRef, useState, type PointerEvent } from 'react'
import { ArrowsOut, PaintBrush, DownloadSimple, X, Lightning, WarningCircle, ClipboardText, ArrowClockwise } from '@phosphor-icons/react'
import type { ColorAdjust, ImageItem, ViewMode } from '../types'

interface Props {
  item: ImageItem
  viewMode: ViewMode
  colorAdjust: ColorAdjust
  onRemove: (id: string) => void
  onDownload: (id: string) => void
  onEdit: (id: string) => void
  onZoom: (id: string) => void
  onCopy: (id: string) => void
  onRetry: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
  onDragEnd: () => void
}

export function ImageCard({
  item, viewMode, colorAdjust,
  onRemove, onDownload, onEdit, onZoom, onCopy, onRetry,
  onDragStart, onDragOver, onDragEnd,
}: Props) {
  const [slider, setSlider] = useState(50)
  const [dragOver, setDragOver] = useState(false)
  const dragging = useRef(false)
  const imgRef = useRef<HTMLDivElement>(null)
  const hasResult = !!item.resultUrl

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setSlider(pct)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!hasResult || viewMode !== 'split') return
    dragging.current = true
    move(e)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => { if (dragging.current) move(e) }
  const onPointerUp = () => { dragging.current = false }

  const dimLabel = item.dimensions ? `${item.dimensions.w}×${item.dimensions.h}` : null
  const timeLabel = item.processTime != null
    ? item.processTime < 1000 ? `${item.processTime}ms` : `${(item.processTime / 1000).toFixed(1)}s`
    : null

  // Determine what images to show based on viewMode
  const showOriginal = viewMode === 'original' || viewMode === 'split'
  const showResult = (viewMode === 'result' || viewMode === 'split') && hasResult
  const isSplit = viewMode === 'split' && hasResult
  const cssFilter = `brightness(${colorAdjust.brightness}%) contrast(${colorAdjust.contrast}%) saturate(${colorAdjust.saturation}%)`
  const isAdjusted = colorAdjust.brightness !== 100 || colorAdjust.contrast !== 100 || colorAdjust.saturation !== 100

  return (
    <div
      className={`card card-enter${dragOver ? ' card-drag-over' : ''}`}
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); onDragOver(item.id) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => setDragOver(false)}
      onDragEnd={() => { setDragOver(false); onDragEnd() }}
    >
      <div
        ref={imgRef}
        className={`card-image${!hasResult ? ' no-result' : ''}${isSplit ? '' : ' no-cursor'}`}
        style={{ ['--slider' as string]: `${slider}%` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {showOriginal && (
          <img
            className={isSplit ? 'img-original' : 'img-fill'}
            src={item.originalUrl}
            alt=""
          />
        )}
        {showResult && (
          <img
            className={isSplit ? 'img-result' : 'img-fill'}
            src={item.resultUrl!}
            alt=""
            style={isAdjusted ? { filter: cssFilter } : undefined}
          />
        )}
        {isSplit && <div className="slider-handle" />}

        {item.status === 'processing' && (
          <div className="card-overlay">
            <div className="spinner" />
            <span>Processing…</span>
            {item.progress != null && (
              <div className="card-progress-wrap">
                <div className="card-progress-bar" style={{ width: `${item.progress}%` }} />
              </div>
            )}
          </div>
        )}

        {item.status === 'error' && (
          <div className="card-overlay card-overlay-error">
            <WarningCircle size={20} weight="fill" />
            <span>{item.error || 'Failed'}</span>
            <button className="btn btn-sm retry-btn" onClick={(e) => { e.stopPropagation(); onRetry(item.id) }}>
              <ArrowClockwise size={12} weight="bold" /> Retry
            </button>
          </div>
        )}

        <div className="card-actions-overlay">
          {hasResult && (
            <button className="card-action-btn" title="Full view" onClick={() => onZoom(item.id)}>
              <ArrowsOut size={14} weight="bold" />
            </button>
          )}
        </div>
      </div>

      <div className="card-meta">
        <div className="card-info">
          <span className="card-filename" title={item.file.name}>{item.file.name}</span>
          <div className="card-sub">
            {dimLabel && <span>{dimLabel}</span>}
            {timeLabel && item.status === 'done' && (
              <span className="card-time">
                <Lightning size={10} weight="fill" />
                {timeLabel}
              </span>
            )}
          </div>
        </div>
        <div className="card-bottom-actions">
          {item.resultBlob && (
            <button className="btn btn-icon" title="Copy to clipboard" onClick={() => onCopy(item.id)}>
              <ClipboardText size={14} weight="bold" />
            </button>
          )}
          {item.resultBlob && (
            <button className="btn btn-icon" title="Refine edges" onClick={() => onEdit(item.id)}>
              <PaintBrush size={14} weight="bold" />
            </button>
          )}
          {item.resultBlob && (
            <button className="btn btn-icon" title="Download" onClick={() => onDownload(item.id)}>
              <DownloadSimple size={14} weight="bold" />
            </button>
          )}
          <button className="btn btn-icon" title="Remove" onClick={() => onRemove(item.id)}>
            <X size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
