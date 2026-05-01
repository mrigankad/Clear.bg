import { useEffect, useState } from 'react'
import { X, MagnifyingGlassPlus, DownloadSimple } from '@phosphor-icons/react'
import type { ColorAdjust, ImageItem } from '../types'

interface Props {
  item: ImageItem
  colorAdjust: ColorAdjust
  onClose: () => void
  onDownload: (id: string) => void
}

export function Lightbox({ item, colorAdjust, onClose, onDownload }: Props) {
  const [slider, setSlider] = useState(50)
  const hasResult = !!item.resultUrl

  const cssFilter = `brightness(${colorAdjust.brightness}%) contrast(${colorAdjust.contrast}%) saturate(${colorAdjust.saturation}%)`
  const isAdjusted = colorAdjust.brightness !== 100 || colorAdjust.contrast !== 100 || colorAdjust.saturation !== 100

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setSlider(pct)
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="lightbox-modal">
        <div className="lightbox-header">
          <div className="brush-modal-title">
            <MagnifyingGlassPlus size={18} weight="duotone" />
            Preview — <span className="brush-modal-filename">{item.file.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {hasResult && (
              <button className="btn btn-ghost btn-icon" title="Download" onClick={() => onDownload(item.id)}>
                <DownloadSimple size={16} weight="bold" />
              </button>
            )}
            <button className="btn btn-icon btn-ghost" onClick={onClose}>
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div
          className="lightbox-image-area"
          style={{ ['--slider' as string]: `${slider}%` }}
          onMouseMove={hasResult ? onMouseMove : undefined}
        >
          <img className="lightbox-original" src={item.originalUrl} alt="Original" />
          {item.resultUrl && (
            <>
              <img
                className="lightbox-result"
                src={item.resultUrl}
                alt="Result"
                style={isAdjusted ? { filter: cssFilter } : undefined}
              />
              <div className="slider-handle" />
            </>
          )}
          {!hasResult && (
            <div className="card-overlay">
              <span>Not processed yet</span>
            </div>
          )}
        </div>

        <div className="lightbox-footer">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {item.dimensions && <span>{item.dimensions.w} × {item.dimensions.h} px</span>}
            {isAdjusted && (
              <span className="lightbox-filter-badge">
                B:{colorAdjust.brightness} C:{colorAdjust.contrast} S:{colorAdjust.saturation}
              </span>
            )}
          </div>
          <span>{hasResult ? 'Drag to compare' : ''}</span>
        </div>
      </div>
    </div>
  )
}
