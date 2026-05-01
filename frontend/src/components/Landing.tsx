import {
  UploadSimple,
  LockSimple,
  Lightning,
  Diamond,
  CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react'

interface Props {
  dragging: boolean
  onFiles: (files: File[]) => void
  onBrowse: () => void
}

const FEATURES = [
  {
    icon: <LockSimple size={36} weight="duotone" />,
    type: 'purple',
    title: 'Completely private',
    desc: 'Images are processed entirely on your machine. Nothing is uploaded. Nothing is stored. Your data never leaves.',
  },
  {
    icon: <Lightning size={36} weight="duotone" />,
    type: 'yellow',
    title: 'No limits, ever',
    desc: 'No credits, no account, no queue. Process one image or a thousand — it runs as fast as your machine allows.',
  },
  {
    icon: <Diamond size={36} weight="duotone" />,
    type: 'green',
    title: 'Professional quality',
    desc: 'ISNet AI with optional alpha matting delivers studio-grade edge quality — hair, fur, transparent objects.',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Drop your images',
    desc: 'Drag & drop, click to browse, or paste from clipboard. PNG, JPG, WebP — any size.',
  },
  {
    n: '2',
    title: 'AI removes the background',
    desc: 'Local deep learning runs instantly. No internet required, no waiting for a server.',
  },
  {
    n: '3',
    title: 'Download or refine',
    desc: 'Get transparent PNG or WebP. Use the brush tool to refine any edge perfectly.',
  },
]

const MODELS = [
  {
    name: 'ISNet - General Use',
    speed: 'Medium',
    quality: 'Excellent',
    bestFor: 'Professional photos, complex edges',
    speedBadge: 'badge-blue',
    qualityBadge: 'badge-purple',
    desc: 'The gold standard. Best for hair, fur, and intricate details.',
  },
  {
    name: 'U²-Net - Fast General',
    speed: 'Fast',
    quality: 'Good',
    bestFor: 'General objects, product photos',
    speedBadge: 'badge-green',
    qualityBadge: 'badge-green',
    desc: 'Highly efficient model for everyday objects and clear subjects.',
  },
  {
    name: 'U²-Net Human - Portraits',
    speed: 'Fast',
    quality: 'Good',
    bestFor: 'People, portraits, selfies',
    speedBadge: 'badge-green',
    qualityBadge: 'badge-green',
    desc: 'Optimized specifically for finding and masking human figures.',
  },
]

export function Landing({ dragging, onFiles, onBrowse }: Props) {
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    )
    if (files.length) onFiles(files)
  }

  return (
    <div className="landing-page">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="logo">
          <span className="logo-clear">clear</span><span className="logo-dot">.</span>bg
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#models" className="nav-link">Models</a>
          <button className="nav-cta" onClick={onBrowse}>
            <UploadSimple size={18} weight="bold" />
            Start removing
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Local AI · No Data Sent
          </div>
          <h1 className="hero-title">
            Background removal that<br />
            <span className="hero-title-gradient">stays on your machine.</span>
          </h1>
          <p className="hero-subtitle">
            Local AI, zero uploads, unlimited free removes.
            Your images never leave your computer.
          </p>

          <div className="hero-trust">
            <div className="trust-row">
              <div className="trust-item">
                <CheckCircle className="trust-icon" size={16} weight="fill" />
                Never uploaded
              </div>
              <div className="trust-item">
                <CheckCircle className="trust-icon" size={16} weight="fill" />
                Unlimited free
              </div>
              <div className="trust-item">
                <CheckCircle className="trust-icon" size={16} weight="fill" />
                Works offline
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-illustration">
            <img src="/images/hero-illustration.png" alt="Hero Illustration" />
          </div>
          <div className="hero-float-card hero-float-1">
            <div className="hero-float-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✓</div>
            <span>Privacy guaranteed</span>
          </div>
          <div className="hero-float-card hero-float-2">
            <div className="hero-float-card-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>⚡</div>
            <span>Fast local AI</span>
          </div>
        </div>
      </section>

      {/* Drop zone */}
      <div className="drop-zone-wrapper">
        <div
          className={`drop-zone${dragging ? ' dragging' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={onBrowse}
        >
          <div className="drop-zone-icon">
            <UploadSimple size={32} weight="duotone" />
          </div>
          <h2>{dragging ? 'Drop to remove background' : 'Drop images here'}</h2>
          <p>or click to browse your files</p>

          <div className="drop-zone-actions">
            <button className="btn btn-primary btn-lg" onClick={(e) => { e.stopPropagation(); onBrowse() }}>
              Choose images
            </button>
          </div>

          <div className="drop-formats">
            <span className="drop-format-tag">PNG</span>
            <span className="drop-format-tag">JPG</span>
            <span className="drop-format-tag">WebP</span>
            <span className="drop-format-tag">Any size</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-label">Why Clear.bg</div>
        <h2 className="section-title">Built for privacy & quality</h2>
        <p className="section-subtitle">
          Every other background remover sends your images to a cloud server. Clear.bg runs the AI model directly on your machine.
        </p>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className={`feature-card feature-card-${f.type}`}>
              <div className="feature-icon-wrap">
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="section steps-section" id="how-it-works">
        <div className="section-label">Simple by design</div>
        <h2 className="section-title">Three steps, done</h2>
        <div style={{ maxWidth: 1040, margin: '48px auto 0' }}>
          <img src="/images/steps-illustration.png" alt="Process" className="steps-illustration" />
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div key={s.n} className={`step-card step-${s.n}`}>
                <div className="step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section className="section" id="models">
        <div className="section-label">AI models</div>
        <h2 className="section-title">Pick the right tool</h2>
        <p className="section-subtitle">
          All models run locally via ONNX Runtime. Download once (~170MB), cached forever.
        </p>

        <div className="models-grid">
          {MODELS.map((m) => (
            <div key={m.name} className="model-card">
              <div className="model-card-header">
                <span className="model-name">{m.name.split(' — ')[0]}</span>
                <div className="model-badges">
                  <span className={`badge ${m.speedBadge}`}>{m.speed}</span>
                  <span className={`badge ${m.qualityBadge}`}>{m.quality}</span>
                </div>
              </div>
              <p>{m.desc}</p>
              <div className="trust-item" style={{ fontSize: 11, color: 'var(--muted)' }}>
                <ArrowRight size={12} weight="bold" style={{ color: 'var(--accent)' }} />
                {m.bestFor}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-left">
          <div className="logo">
            <span className="logo-clear">clear</span><span className="logo-dot">.</span>bg
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">GitHub</a>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">API</a>
          </div>
        </div>
        <div className="footer-right">
          Local AI · No data sent · Built with ONNX & React
        </div>
      </footer>
    </div>
  )
}

