import { useCallback, useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Landing } from './components/Landing'
import { Editor } from './components/Editor'
import { BrushEditor } from './components/BrushEditor'
import { Lightbox } from './components/Lightbox'
import { ShortcutsOverlay } from './components/ShortcutsOverlay'
import { removeBackground, getImageDimensions } from './api'
import type { BgState, ImageItem, Settings, ViewMode } from './types'

const uid = () => Math.random().toString(36).slice(2, 9)

function App() {
  const navigate = useNavigate()

  const [items, setItems] = useState<ImageItem[]>([])
  const [settings, setSettings] = useState<Settings>({
    model: 'isnet-general-use',
    alphaMatting: false,
    format: 'png',
    feather: 0,
    smartCrop: false,
    colorAdjust: { brightness: 100, contrast: 100, saturation: 100 },
  })
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [bg, setBg] = useState<BgState>({ type: 'transparent', color: null, file: null })
  const [dragging, setDragging] = useState(false)
  const [toasts, setToasts] = useState<{ id: number; msg: string; type?: 'success' | 'error' }[]>([])
  const toastId = useRef(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [zoomId, setZoomId] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const showToast = useCallback((msg: string, type?: 'success' | 'error') => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, msg, type }])
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800)
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<ImageItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  const addFiles = useCallback(
    async (files: File[] | FileList) => {
      const all = Array.from(files)
      const images = all.filter((f) => f.type.startsWith('image/'))
      if (images.length === 0) { showToast('No images found', 'error'); return }
      if (images.length < all.length)
        showToast(`Skipped ${all.length - images.length} non-image file(s)`)

      // Auto model selector — suggest best model based on filename hints
      const portraitKeywords = /portrait|selfie|headshot|person|people|face|profile|avatar/i
      const hasPortrait = images.some((f) => portraitKeywords.test(f.name))
      if (hasPortrait) {
        setSettings((prev) => {
          if (prev.model !== 'u2net_human_seg' && prev.model !== 'birefnet-portrait') {
            showToast('Portrait detected — switched to Portrait model', 'success')
            return { ...prev, model: 'birefnet-portrait' }
          }
          return prev
        })
      }

      const newItems: ImageItem[] = images.map((file) => ({
        id: uid(),
        file,
        originalUrl: URL.createObjectURL(file),
        resultBlob: null,
        resultUrl: null,
        status: 'pending',
      }))

      setItems((prev) => {
        const next = [...prev, ...newItems]
        // Navigate to editor on first file add
        if (prev.length === 0) navigate('/app')
        return next
      })

      for (const item of newItems) {
        getImageDimensions(item.file)
          .then((dimensions) =>
            setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, dimensions } : i)))
          )
          .catch(() => {})
      }
    },
    [showToast, navigate],
  )

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const t = prev.find((i) => i.id === id)
      if (t) { URL.revokeObjectURL(t.originalUrl); if (t.resultUrl) URL.revokeObjectURL(t.resultUrl) }
      const next = prev.filter((i) => i.id !== id)
      if (next.length === 0) navigate('/')
      return next
    })
  }, [navigate])

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => { URL.revokeObjectURL(i.originalUrl); if (i.resultUrl) URL.revokeObjectURL(i.resultUrl) })
      return []
    })
    navigate('/')
  }, [navigate])

  const downloadItem = useCallback(async (id: string) => {
    const item = itemsRef.current.find((i) => i.id === id)
    if (!item?.resultUrl) return
    const ext = settings.format === 'webp' ? '.webp' : '.png'
    const ca = settings.colorAdjust
    const isAdjusted = ca.brightness !== 100 || ca.contrast !== 100 || ca.saturation !== 100

    let href = item.resultUrl
    if (isAdjusted) {
      // Bake CSS filters into a canvas before download
      const img = new Image()
      img.src = item.resultUrl
      await new Promise((r) => { img.onload = r })
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.filter = `brightness(${ca.brightness}%) contrast(${ca.contrast}%) saturate(${ca.saturation}%)`
      ctx.drawImage(img, 0, 0)
      href = canvas.toDataURL(settings.format === 'webp' ? 'image/webp' : 'image/png')
    }

    const a = document.createElement('a')
    a.href = href
    a.download = item.file.name.replace(/\.[^.]+$/, '') + '_nobg' + ext
    a.click()
  }, [settings.format, settings.colorAdjust])

  const downloadAll = useCallback(async () => {
    const ready = itemsRef.current.filter((i) => i.resultBlob)
    for (const item of ready) {
      downloadItem(item.id)
      await new Promise((r) => setTimeout(r, 250))
    }
  }, [downloadItem])

  const processAll = useCallback(async () => {
    const pending = itemsRef.current.filter(
      (i) => i.status !== 'done' && i.status !== 'processing',
    )
    if (pending.length === 0) return
    for (const item of pending) {
      updateItem(item.id, { status: 'processing', progress: 0 })

      // Simulate progress 0→88 while waiting for the model
      let pct = 0
      const progressTimer = window.setInterval(() => {
        pct = Math.min(pct + Math.random() * 12, 88)
        updateItem(item.id, { progress: Math.round(pct) })
      }, 350)

      try {
        const { blob, timeMs } = await removeBackground(item.file, settings, bg)
        clearInterval(progressTimer)
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl)
        updateItem(item.id, {
          status: 'done',
          resultBlob: blob,
          resultUrl: URL.createObjectURL(blob),
          processTime: timeMs,
          progress: 100,
        })
      } catch (e) {
        clearInterval(progressTimer)
        updateItem(item.id, { status: 'error', error: e instanceof Error ? e.message : 'Failed', progress: 0 })
      }
    }
    showToast(`✓ ${pending.length} image${pending.length > 1 ? 's' : ''} processed`, 'success')
  }, [settings, bg, showToast, updateItem])

  const copyToClipboard = useCallback(async (id: string) => {
    const item = itemsRef.current.find((i) => i.id === id)
    if (!item?.resultBlob) return
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': item.resultBlob }),
      ])
      showToast('Copied to clipboard', 'success')
    } catch {
      showToast('Clipboard not supported in this browser', 'error')
    }
  }, [showToast])

  const downloadZip = useCallback(async () => {
    const ready = itemsRef.current.filter((i) => i.resultBlob)
    if (ready.length === 0) return
    const ext = settings.format === 'webp' ? '.webp' : '.png'
    for (const item of ready) {
      const a = document.createElement('a')
      a.href = item.resultUrl!
      a.download = item.file.name.replace(/\.[^.]+$/, '') + '_nobg' + ext
      a.click()
      await new Promise((r) => setTimeout(r, 200))
    }
    showToast(`Downloaded ${ready.length} images`, 'success')
  }, [settings.format, showToast])

  const reorderItems = useCallback((fromId: string, toId: string) => {
    setItems((prev) => {
      const from = prev.findIndex((i) => i.id === fromId)
      const to = prev.findIndex((i) => i.id === toId)
      if (from === -1 || to === -1 || from === to) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  const onBrushSave = useCallback((blob: Blob) => {
    if (!editingId) return
    const item = itemsRef.current.find((i) => i.id === editingId)
    if (item?.resultUrl) URL.revokeObjectURL(item.resultUrl)
    updateItem(editingId, { resultBlob: blob, resultUrl: URL.createObjectURL(blob) })
    setEditingId(null)
    showToast('Edges saved', 'success')
  }, [editingId, updateItem, showToast])

  // Global drag-and-drop
  useEffect(() => {
    const over = (e: globalThis.DragEvent) => { e.preventDefault(); setDragging(true) }
    const leave = (e: globalThis.DragEvent) => { if (!e.relatedTarget) setDragging(false) }
    const drop = (e: globalThis.DragEvent) => {
      e.preventDefault(); setDragging(false)
      if (e.dataTransfer?.files.length) addFiles(e.dataTransfer.files)
    }
    window.addEventListener('dragover', over)
    window.addEventListener('dragleave', leave)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragover', over)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('drop', drop)
    }
  }, [addFiles])

  // Keyboard shortcuts (editor only)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (editingId || zoomId) return
      if (e.code === 'Space') { e.preventDefault(); processAll() }
      if (e.code === 'Escape' && items.length > 0) clearAll()
      if (e.key === '?') { e.preventDefault(); setShowShortcuts((s) => !s) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [processAll, clearAll, editingId, zoomId, items.length])

  // Clipboard paste
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'))
      if (files.length) { e.preventDefault(); addFiles(files) }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [addFiles])

  // Blob URL cleanup
  useEffect(() => () => {
    itemsRef.current.forEach((i) => {
      URL.revokeObjectURL(i.originalUrl)
      if (i.resultUrl) URL.revokeObjectURL(i.resultUrl)
    })
  }, [])

  const editorProps = {
    items,
    settings, setSettings,
    bg, setBg,
    onAddClick: () => fileInputRef.current?.click(),
    onClear: clearAll,
    onRemove: removeItem,
    onDownload: downloadItem,
    onDownloadAll: downloadAll,
    onEdit: setEditingId,
    onZoom: setZoomId,
    onProcess: processAll,
    onCustomBg: (file: File) => { setBg({ type: 'custom', color: null, file }); showToast('Custom background loaded') },
    onReorder: reorderItems,
    onShowShortcuts: () => setShowShortcuts(true),
    onCopyToClipboard: copyToClipboard,
    onDownloadZip: downloadZip,
    onRetry: (id: string) => {
      updateItem(id, { status: 'pending', error: undefined, progress: 0 })
      // processAll picks up pending items
      setTimeout(() => processAll(), 50)
    },
    viewMode,
    setViewMode,
  }

  const editingItem = editingId ? items.find((i) => i.id === editingId) : null
  const zoomItem = zoomId ? items.find((i) => i.id === zoomId) : null

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Landing
              dragging={dragging}
              onFiles={(files) => addFiles(files)}
              onBrowse={() => fileInputRef.current?.click()}
            />
          }
        />
        <Route
          path="/app"
          element={
            items.length > 0
              ? <Editor {...editorProps} />
              : <Navigate to="/" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }}
      />

      {editingItem?.resultUrl && (
        <BrushEditor
          resultUrl={editingItem.resultUrl}
          fileName={editingItem.file.name}
          onSave={onBrushSave}
          onClose={() => setEditingId(null)}
        />
      )}

      {zoomItem && (
        <Lightbox
          item={zoomItem}
          colorAdjust={settings.colorAdjust}
          onClose={() => setZoomId(null)}
          onDownload={downloadItem}
        />
      )}
      {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}

      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show${t.type ? ` ${t.type}` : ''}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  )
}

export default App
