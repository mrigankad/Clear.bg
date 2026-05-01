import { useEffect } from 'react'
import { X, Keyboard } from '@phosphor-icons/react'

interface Props {
  onClose: () => void
}

const SHORTCUTS = [
  { keys: ['Space'], desc: 'Process all pending images' },
  { keys: ['Esc'], desc: 'Clear all / close modal' },
  { keys: ['?'], desc: 'Show this shortcuts panel' },
  { keys: ['Ctrl', 'V'], desc: 'Paste image from clipboard' },
  { keys: ['E'], desc: 'Erase mode (in brush editor)' },
  { keys: ['R'], desc: 'Restore mode (in brush editor)' },
  { keys: ['Ctrl', 'Z'], desc: 'Undo brush stroke' },
  { keys: ['Ctrl', 'Y'], desc: 'Redo brush stroke' },
]

export function ShortcutsOverlay({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Escape' || e.key === '?') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="shortcuts-modal">
        <div className="brush-modal-header">
          <div className="brush-modal-title">
            <Keyboard size={18} weight="duotone" />
            Keyboard shortcuts
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>
            <X size={18} weight="bold" />
          </button>
        </div>
        <div className="shortcuts-list">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="shortcut-row">
              <span className="shortcut-desc">{s.desc}</span>
              <div className="shortcut-keys">
                {s.keys.map((k) => <kbd key={k}>{k}</kbd>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
