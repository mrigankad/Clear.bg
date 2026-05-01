import { useEffect, useRef, useState } from 'react'
import { Plus, Trash, DownloadSimple, Keyboard, ArrowsOut } from '@phosphor-icons/react'
import { ImageCard } from './ImageCard'
import { Sidebar } from './Sidebar'
import type { BgState, ColorAdjust, ImageItem, Settings, ViewMode } from '../types'

interface Props {
  items: ImageItem[]
  settings: Settings
  setSettings: (s: Settings) => void
  bg: BgState
  setBg: (b: BgState) => void
  onAddClick: () => void
  onClear: () => void
  onRemove: (id: string) => void
  onDownload: (id: string) => void
  onDownloadAll: () => void
  onDownloadZip: () => void
  onEdit: (id: string) => void
  onZoom: (id: string) => void
  onProcess: () => void
  onCustomBg: (file: File) => void
  onReorder: (fromId: string, toId: string) => void
  onShowShortcuts: () => void
  onCopyToClipboard: (id: string) => void
  onRetry: (id: string) => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
}

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'split', label: 'Split' },
  { value: 'original', label: 'Before' },
  { value: 'result', label: 'After' },
]

export function Editor({
  items, settings, setSettings, bg, setBg,
  onAddClick, onClear, onRemove, onDownload, onDownloadAll, onDownloadZip,
  onEdit, onZoom, onProcess, onCustomBg, onReorder, onShowShortcuts,
  onCopyToClipboard, onRetry, viewMode, setViewMode,
}: Props) {
  const anyDone = items.some((i) => i.resultBlob)
  const canProcess = items.some((i) => i.status !== 'done' && i.status !== 'processing')
  const totalCount = items.length
  const doneCount = items.filter((i) => i.status === 'done').length
  const processingCount = items.filter((i) => i.status === 'processing').length
  const isBatchRunning = processingCount > 0
  const batchPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
  const dragId = useRef<string | null>(null)

  // Onboarding tooltip — show once on first visit when a result is ready
  const [showTip, setShowTip] = useState(false)
  useEffect(() => {
    if (anyDone && !localStorage.getItem('clearbg_slider_tip')) {
      setShowTip(true)
      localStorage.setItem('clearbg_slider_tip', '1')
      const t = window.setTimeout(() => setShowTip(false), 4000)
      return () => clearTimeout(t)
    }
  }, [anyDone])

  return (
    <div className="editor-layout view-enter">
      <main className="editor-main">
        <header className="editor-header">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={onClear} title="Back to home">
            <span className="logo-clear">clear</span><span className="logo-dot">.</span>bg
          </div>

          {/* View mode pills */}
          <div className="view-pills">
            {VIEW_MODES.map((m) => (
              <button
                key={m.value}
                className={`view-pill${viewMode === m.value ? ' active' : ''}`}
                onClick={() => setViewMode(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="btn" onClick={onAddClick}>
              <Plus size={15} weight="bold" /> Add
            </button>
            <button className="btn btn-ghost" onClick={onClear}>
              <Trash size={15} weight="bold" /> Clear
            </button>
            {anyDone && (
              <button className="btn btn-primary" onClick={onDownloadAll}>
                <DownloadSimple size={15} weight="bold" /> Download all
              </button>
            )}
            <button className="btn btn-ghost btn-icon" title="Keyboard shortcuts (?)" onClick={onShowShortcuts}>
              <Keyboard size={16} weight="duotone" />
            </button>
          </div>
        </header>

        {/* Batch progress bar */}
        {isBatchRunning && (
          <div className="batch-progress">
            <div className="batch-progress-bar" style={{ width: `${batchPct}%` }} />
            <span className="batch-progress-label">
              {doneCount} / {totalCount} done
            </span>
          </div>
        )}

        {/* Onboarding slider tip */}
        {showTip && (
          <div className="onboarding-tip">
            <ArrowsOut size={16} weight="bold" />
            Drag the slider on any image to compare before &amp; after
            <button className="onboarding-tip-close" onClick={() => setShowTip(false)}>✕</button>
          </div>
        )}

        <div className="editor-grid">
          {items.length === 0 ? (
            <div className="editor-empty" onClick={onAddClick} style={{ cursor: 'pointer' }}>
              <div className="editor-empty-icon">
                <Plus size={40} weight="duotone" />
              </div>
              <h3>Drop more images here</h3>
              <p>Drag & drop or click to browse</p>
            </div>
          ) : (
            items.map((item) => (
              <ImageCard
                key={item.id}
                item={item}
                viewMode={viewMode}
                colorAdjust={settings.colorAdjust}
                onRemove={onRemove}
                onDownload={onDownload}
                onEdit={onEdit}
                onZoom={onZoom}
                onCopy={onCopyToClipboard}
                onRetry={onRetry}
                onDragStart={(id) => { dragId.current = id }}
                onDragOver={(id) => { if (dragId.current && dragId.current !== id) onReorder(dragId.current, id) }}
                onDragEnd={() => { dragId.current = null }}
              />
            ))
          )}
        </div>
      </main>

      <Sidebar
        settings={settings}
        setSettings={setSettings}
        bg={bg}
        setBg={setBg}
        canProcess={canProcess}
        onProcess={onProcess}
        onCustomBg={onCustomBg}
      />
    </div>
  )
}
