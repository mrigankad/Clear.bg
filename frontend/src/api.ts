import type { BgState, Settings } from './types'

// Parse "linear-gradient(135deg, #667eea, #764ba2)" → [[0,'#667eea'],[1,'#764ba2']]
function extractGradientStops(gradient: string): [number, string][] {
  const inner = gradient.replace(/^.*?\(/, '').replace(/\)$/, '')
  const parts = inner.split(',').map((s) => s.trim()).filter((s) => s.startsWith('#') || s.startsWith('rgb'))
  if (parts.length < 2) return [[0, '#6d28d9'], [1, '#a78bfa']]
  return parts.map((color, i) => [i / (parts.length - 1), color] as [number, string])
}

export interface RemoveResult {
  blob: Blob
  timeMs: number
}

export async function removeBackground(
  file: File,
  settings: Settings,
  bg: BgState,
): Promise<RemoveResult> {
  const t0 = performance.now()

  const fd = new FormData()
  fd.append('file', file)
  fd.append('model', settings.model)
  fd.append('alpha_matting', settings.alphaMatting ? 'true' : 'false')
  fd.append('format', settings.format)
  fd.append('feather', String(settings.feather ?? 0))
  fd.append('smart_crop', settings.smartCrop ? 'true' : 'false')
  if (bg.type === 'color' && bg.color) {
    if (bg.color.startsWith('linear-gradient') || bg.color.startsWith('radial-gradient')) {
      // Render gradient to a canvas blob and send as bg_image
      const dims = await getImageDimensions(file)
      const canvas = document.createElement('canvas')
      canvas.width = dims.w
      canvas.height = dims.h
      const ctx = canvas.getContext('2d')!
      // Parse the gradient string into a CanvasGradient
      const gradientBlob = await new Promise<Blob | null>((resolve) => {
        // Use CSS gradient via offscreen image trick
        const div = document.createElement('div')
        div.style.cssText = `position:fixed;left:-9999px;width:${dims.w}px;height:${dims.h}px;background:${bg.color}`
        document.body.appendChild(div)
        // Draw using gradient stops — map common gradients manually
        // Fallback: just send as a 2-stop linear gradient
        const stops = extractGradientStops(bg.color)
        const grad = ctx.createLinearGradient(0, 0, dims.w, dims.h)
        stops.forEach(([pos, color]) => grad.addColorStop(pos, color))
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, dims.w, dims.h)
        document.body.removeChild(div)
        canvas.toBlob(resolve, 'image/png')
      })
      if (gradientBlob) fd.append('bg_image', new File([gradientBlob], 'gradient.png', { type: 'image/png' }))
    } else {
      fd.append('bg_color', bg.color)
    }
  }
  if (bg.type === 'custom' && bg.file) fd.append('bg_image', bg.file)

  const res = await fetch('/remove', { method: 'POST', body: fd })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string }
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  const blob = await res.blob()
  return { blob, timeMs: Math.round(performance.now() - t0) }
}

export async function getImageDimensions(
  file: File,
): Promise<{ w: number; h: number }> {
  const bitmap = await createImageBitmap(file)
  const dims = { w: bitmap.width, h: bitmap.height }
  bitmap.close()
  return dims
}
