import { useRef } from 'react'
import { Cpu, DownloadSimple, ImagesSquare, Sparkle, Waves, ImageSquare, SlidersHorizontal } from '@phosphor-icons/react'
import type { BgState, OutputFormat, Settings } from '../types'

interface Props {
  settings: Settings
  setSettings: (s: Settings) => void
  bg: BgState
  setBg: (b: BgState) => void
  canProcess: boolean
  onProcess: () => void
  onCustomBg: (file: File) => void
}

const COLOR_PRESETS = [
  { color: '#ffffff', title: 'White' },
  { color: '#000000', title: 'Black' },
  { color: '#6d28d9', title: 'Purple' },
  { color: '#3b82f6', title: 'Blue' },
  { color: '#f87171', title: 'Red' },
  { color: '#4ade80', title: 'Green' },
]

const GRADIENT_PRESETS = [
  { value: 'linear-gradient(135deg,#667eea,#764ba2)', title: 'Violet' },
  { value: 'linear-gradient(135deg,#f093fb,#f5576c)', title: 'Pink' },
  { value: 'linear-gradient(135deg,#4facfe,#00f2fe)', title: 'Sky' },
  { value: 'linear-gradient(135deg,#43e97b,#38f9d7)', title: 'Mint' },
  { value: 'linear-gradient(135deg,#fa709a,#fee140)', title: 'Sunset' },
  { value: 'linear-gradient(135deg,#30cfd0,#667eea)', title: 'Ocean' },
]

export function Sidebar({ settings, setSettings, bg, setBg, canProcess, onProcess, onCustomBg }: Props) {
  const bgInputRef = useRef<HTMLInputElement>(null)

  const isActive = (type: BgState['type'], color?: string) => {
    if (type === 'transparent') return bg.type === 'transparent'
    if (type === 'color') return bg.type === 'color' && bg.color === color
    if (type === 'custom') return bg.type === 'custom'
    return false
  }

  const isGradientActive = (value: string) =>
    bg.type === 'color' && bg.color === value

  return (
    <aside className="sidebar">
      {/* Model */}
      <div className="sidebar-block">
        <div className="sidebar-block-title">
          <Cpu size={14} weight="duotone" />
          AI Model
        </div>
        <div className="sidebar-field">
          <select
            value={settings.model}
            onChange={(e) => setSettings({ ...settings, model: e.target.value })}
          >
            <optgroup label="⭐ Recommended">
              <option value="birefnet-general">BiRefNet — Best overall</option>
              <option value="birefnet-portrait">BiRefNet Portrait — People</option>
            </optgroup>
            <optgroup label="Classic">
              <option value="isnet-general-use">ISNet — Great quality</option>
              <option value="u2net">U²-Net — Fast general</option>
              <option value="u2net_human_seg">U²-Net Human — Portraits</option>
            </optgroup>
          </select>
        </div>
        {(settings.model === 'birefnet-general' || settings.model === 'birefnet-portrait') && (
          <div className="model-badge-new">
            ✦ State-of-the-art · downloads ~200MB on first use
          </div>
        )}
        <div className="sidebar-field">
          <label className="toggle-row">
            <div className="toggle-label">
              <span>Alpha matting</span>
              <span className="toggle-sublabel">Smoother edges for hair/fur</span>
            </div>
            <input
              type="checkbox"
              className="toggle-input"
              checked={settings.alphaMatting}
              onChange={(e) => setSettings({ ...settings, alphaMatting: e.target.checked })}
            />
            <div className="toggle-track" />
          </label>
        </div>
      </div>

      {/* Edge refinement */}
      <div className="sidebar-block">
        <div className="sidebar-block-title">
          <Waves size={14} weight="duotone" />
          Edge Refinement
        </div>
        <div className="sidebar-field">
          <div className="slider-row">
            <label className="sidebar-label" style={{ marginBottom: 0 }}>Feather edges</label>
            <span className="slider-val">{settings.feather}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={settings.feather}
            onChange={(e) => setSettings({ ...settings, feather: Number(e.target.value) })}
            style={{ marginTop: 8 }}
          />
        </div>
        <div className="sidebar-field">
          <label className="toggle-row">
            <div className="toggle-label">
              <span>Smart crop</span>
              <span className="toggle-sublabel">Trim to subject bounding box</span>
            </div>
            <input
              type="checkbox"
              className="toggle-input"
              checked={settings.smartCrop}
              onChange={(e) => setSettings({ ...settings, smartCrop: e.target.checked })}
            />
            <div className="toggle-track" />
          </label>
        </div>
      </div>

      {/* Output format */}
      <div className="sidebar-block">
        <div className="sidebar-block-title">
          <DownloadSimple size={14} weight="duotone" />
          Output Format
        </div>
        <div className="format-pills">
          {(['png', 'webp'] as OutputFormat[]).map((f) => (
            <button
              key={f}
              type="button"
              className={`format-pill${settings.format === f ? ' active' : ''}`}
              onClick={() => setSettings({ ...settings, format: f })}
            >
              {f.toUpperCase()}
              {f === 'webp' && <span className="format-pill-sub">SMALLER</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div className="sidebar-block">
        <div className="sidebar-block-title">
          <ImagesSquare size={14} weight="duotone" />
          Background
        </div>

        <div className="sidebar-label" style={{ marginBottom: 6 }}>Solid</div>
        <div className="bg-swatches">
          <button
            type="button"
            className={`bg-swatch bg-swatch-transparent${isActive('transparent') ? ' active' : ''}`}
            title="Transparent"
            onClick={() => setBg({ type: 'transparent', color: null, file: null })}
          />
          {COLOR_PRESETS.map((p) => (
            <button
              type="button"
              key={p.color}
              className={`bg-swatch${isActive('color', p.color) ? ' active' : ''}`}
              style={{ background: p.color }}
              title={p.title}
              onClick={() => setBg({ type: 'color', color: p.color, file: null })}
            />
          ))}
          <button
            type="button"
            className={`bg-swatch${isActive('custom') ? ' active' : ''}`}
            title="Custom image"
            onClick={() => bgInputRef.current?.click()}
          >
            <ImageSquare size={14} weight="bold" />
          </button>
        </div>

        <div className="sidebar-label" style={{ marginBottom: 6, marginTop: 12 }}>Gradient</div>
        <div className="bg-swatches">
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g.value}
              type="button"
              className={`bg-swatch${isGradientActive(g.value) ? ' active' : ''}`}
              style={{ background: g.value }}
              title={g.title}
              onClick={() => setBg({ type: 'color', color: g.value, file: null })}
            />
          ))}
        </div>

        <div className="sidebar-field" style={{ marginTop: 12 }}>
          <label className="sidebar-label">Custom color</label>
          <input
            type="color"
            value={bg.type === 'color' && bg.color && !bg.color.startsWith('linear') ? bg.color : '#a855f7'}
            onChange={(e) => setBg({ type: 'color', color: e.target.value, file: null })}
          />
        </div>
        <input
          ref={bgInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onCustomBg(f)
            e.target.value = ''
          }}
        />
      </div>

      {/* Color correction */}
      <div className="sidebar-block">
        <div className="sidebar-block-title">
          <SlidersHorizontal size={14} weight="duotone" />
          Color Correction
        </div>
        {([
          { key: 'brightness', label: 'Brightness' },
          { key: 'contrast',   label: 'Contrast'   },
          { key: 'saturation', label: 'Saturation' },
        ] as const).map(({ key, label }) => (
          <div className="sidebar-field" key={key}>
            <div className="slider-row">
              <label className="sidebar-label" style={{ marginBottom: 0 }}>{label}</label>
              <span className="slider-val">{settings.colorAdjust[key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              value={settings.colorAdjust[key]}
              onChange={(e) =>
                setSettings({ ...settings, colorAdjust: { ...settings.colorAdjust, [key]: Number(e.target.value) } })
              }
              style={{ marginTop: 6 }}
            />
          </div>
        ))}
        <button
          className="btn btn-ghost"
          style={{ fontSize: 11, padding: '4px 10px', marginTop: 2 }}
          onClick={() => setSettings({ ...settings, colorAdjust: { brightness: 100, contrast: 100, saturation: 100 } })}
        >
          Reset
        </button>
      </div>

      {/* Process */}
      <div className="sidebar-footer">
        <div className="shortcuts-row">
          <div className="shortcut-chip"><kbd>Space</kbd> process</div>
          <div className="shortcut-chip"><kbd>Esc</kbd> clear</div>
          <div className="shortcut-chip"><kbd>?</kbd> shortcuts</div>
        </div>
        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={!canProcess}
          onClick={onProcess}
        >
          <Sparkle size={18} weight="fill" />
          Process all
        </button>
      </div>
    </aside>
  )
}
