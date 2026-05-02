<div align="center">

<img src="./Clear%20BG.png" alt="Clear BG — AI Background Remover" width="100%" />

# Clear BG

**A self-hosted, privacy-first background removal platform powered by state-of-the-art ONNX models.**

Run entirely on your machine — no API keys, no cloud, no data leaves your environment.

[![Python](https://img.shields.io/badge/python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-1.15%2B-005CED?logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[**Documentation**](#documentation) · [**Quick Start**](#quick-start) · [**API Reference**](#api-reference) · [**Contributing**](#contributing) · [**Report Bug**](https://github.com/your-org/clear-bg/issues)

</div>

---

## Overview

Clear BG is a production-ready, full-stack application for removing backgrounds from images using deep learning. It pairs a high-performance Python inference engine with a modern React user interface, delivering professional-grade results without sacrificing privacy or requiring third-party services.

### Why Clear BG?

| | Clear BG | Cloud APIs |
|---|---|---|
| **Privacy** | All processing local | Images sent to third party |
| **Cost** | Free, unlimited | Per-image pricing |
| **Latency** | < 1s on cached models | Network round-trip |
| **Offline** | Fully offline-capable | Requires internet |
| **Customizable** | Full source access | Black box |
| **Rate Limits** | None | Vendor-imposed |

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
  - [Web UI](#web-ui)
  - [REST API](#rest-api)
  - [CLI](#cli)
  - [Python SDK](#python-sdk)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Models](#models)
- [Testing](#testing)
- [Deployment](#deployment)
- [Performance](#performance)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

**Core Capabilities**
- Local deep-learning inference (no cloud dependency)
- Three production-grade segmentation models (U²-Net, U²-Net Human, ISNet)
- Alpha matting for sub-pixel edge refinement
- Batch processing with parallelization
- Session-based model caching for sub-second repeated inference

**Developer Experience**
- RESTful API with OpenAPI 3.0 specification
- TypeScript-first React frontend
- Full CLI for scripting and automation
- Comprehensive E2E test coverage (Playwright + pytest)
- Docker-ready deployment

**Operations**
- Structured logging
- Health-check endpoints for orchestration
- Configurable concurrency limits
- File upload validation (MIME type, size, dimensions)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          Client Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Web Browser   │  │  CLI / Scripts  │  │  Third-party    │  │
│  │   (React UI)    │  │   (Python)      │  │  Integrations   │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            └────────────────────┴────────────────────┘
                                 │ HTTP/JSON
            ┌────────────────────▼─────────────────────┐
            │          FastAPI Application             │
            │  ┌───────────────────────────────────┐   │
            │  │  Routes  │  Validation  │  CORS   │   │
            │  └───────────────────────────────────┘   │
            └────────────────────┬─────────────────────┘
                                 │
            ┌────────────────────▼─────────────────────┐
            │          Inference Engine                │
            │  ┌─────────────┐    ┌─────────────────┐  │
            │  │  Session    │ →  │  ONNX Runtime   │  │
            │  │  Cache      │    │  (CPU/GPU)      │  │
            │  └─────────────┘    └─────────────────┘  │
            │  ┌─────────────┐    ┌─────────────────┐  │
            │  │ Pre-process │ →  │  Post-process   │  │
            │  │  (Pillow)   │    │  (Alpha Matting)│  │
            │  └─────────────┘    └─────────────────┘  │
            └──────────────────────────────────────────┘
```

---

## Requirements

| Requirement | Minimum | Recommended |
|:---|:---:|:---:|
| Python | 3.10 | 3.11+ |
| Node.js | 18 | 20+ |
| RAM | 4 GB | 8 GB+ |
| Disk Space | 1 GB | 2 GB |
| OS | Windows 10 / macOS 11 / Ubuntu 20.04 | Latest |

> **Note:** GPU acceleration is supported via `onnxruntime-gpu` with CUDA 11.8+.

---

## Quick Start

Get up and running in under two minutes:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/clear-bg.git
cd clear-bg

# 2. Set up the backend
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Set up the frontend (in a separate terminal)
cd frontend
npm install

# 4. Start both services
# Terminal 1 (backend):
python main.py server

# Terminal 2 (frontend):
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Installation

### Option 1: Local Development

<details>
<summary><b>Backend Setup</b></summary>

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Activate (choose based on OS)
source venv/bin/activate          # macOS/Linux
venv\Scripts\activate              # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Verify installation
python main.py --help
```

</details>

<details>
<summary><b>Frontend Setup</b></summary>

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

</details>

### Option 2: Docker (Recommended for Production)

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Option 3: Pre-built Binaries

Download platform-specific releases from the [Releases page](https://github.com/your-org/clear-bg/releases).

---

## Usage

### Web UI

Navigate to `http://localhost:5173` after starting both services. The UI supports:

- Drag-and-drop image upload
- Real-time preview with transparent background
- Model selection per image
- Batch upload with ZIP download
- Side-by-side comparison view

### REST API

The backend exposes a fully-documented REST API at `http://localhost:8000`.

**Interactive documentation:** `http://localhost:8000/docs` (Swagger UI)
**Alternative documentation:** `http://localhost:8000/redoc` (ReDoc)

### CLI

```bash
# Process a single image
python main.py remove input.jpg

# Specify model and output
python cli/main.py input.jpg \
  --model isnet-general-use \
  --alpha-matting \
  --output ./result.png

# Batch process a directory
python cli/main.py ./photos/ \
  --batch \
  --output ./results \
  --workers 4

# Pre-warm a model into memory
python cli/main.py --preload --model isnet-general-use
```

### Python SDK

```python
from core.remover import engine
from core.config import ModelName

# Single image
result = engine.process_image(
    image="photo.jpg",
    output_path="output.png",
    model=ModelName.ISNET_GENERAL,
    alpha_matting=True,
)
print(f"Processed in {result['time_seconds']}s")

# Batch
results = engine.process_batch(
    input_dir="./photos",
    output_dir="./results",
    model=ModelName.U2NET,
    workers=4,
)
```

---

## API Reference

### Endpoints

| Method | Endpoint | Description | Response |
|:------:|:---------|:------------|:---------|
| `GET` | `/` | Service metadata | `application/json` |
| `GET` | `/health` | Health check | `application/json` |
| `GET` | `/models` | List available models | `application/json` |
| `POST` | `/remove` | Process single image | `image/png` |
| `POST` | `/remove/batch` | Process multiple images | `application/zip` |
| `POST` | `/remove/local` | Process server-side path | `image/png` |
| `GET` | `/download/batch/{id}` | Retrieve batch result | `application/zip` |

### Request Examples

<details>
<summary><b>cURL</b></summary>

```bash
# Single image
curl -X POST "http://localhost:8000/remove" \
  -F "file=@photo.jpg" \
  -F "model=isnet-general-use" \
  -F "alpha_matting=true" \
  --output result.png

# Batch
curl -X POST "http://localhost:8000/remove/batch" \
  -F "files=@1.jpg" \
  -F "files=@2.jpg" \
  -F "model=u2net" \
  --output batch.zip
```

</details>

<details>
<summary><b>Python (requests)</b></summary>

```python
import requests

with open("photo.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/remove",
        files={"file": f},
        data={
            "model": "isnet-general-use",
            "alpha_matting": "true",
        },
        timeout=30,
    )
    response.raise_for_status()

with open("output.png", "wb") as f:
    f.write(response.content)
```

</details>

<details>
<summary><b>JavaScript (fetch)</b></summary>

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("model", "isnet-general-use");
formData.append("alpha_matting", "true");

const response = await fetch("http://localhost:8000/remove", {
  method: "POST",
  body: formData,
});

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

const blob = await response.blob();
const url = URL.createObjectURL(blob);
```

</details>

<details>
<summary><b>TypeScript (axios)</b></summary>

```typescript
import axios from "axios";

interface RemoveOptions {
  model?: "u2net" | "u2net_human_seg" | "isnet-general-use";
  alphaMatting?: boolean;
}

async function removeBackground(
  file: File,
  options: RemoveOptions = {}
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", options.model ?? "isnet-general-use");
  formData.append("alpha_matting", String(options.alphaMatting ?? true));

  const { data } = await axios.post<Blob>(
    "http://localhost:8000/remove",
    formData,
    { responseType: "blob" }
  );

  return data;
}
```

</details>

### Error Codes

| Code | Meaning | Resolution |
|:----:|:--------|:-----------|
| `400` | Invalid request payload | Verify required fields |
| `413` | Payload too large | Reduce image size or batch count |
| `415` | Unsupported media type | Use JPG, PNG, or WebP |
| `422` | Validation error | Check parameter ranges |
| `500` | Internal server error | Check server logs |
| `503` | Model loading | Retry after a few seconds |

---

## Configuration

Configuration is managed via `backend/core/config.py` and environment variables.

### Environment Variables

```bash
# .env file
CLEARBG_HOST=0.0.0.0
CLEARBG_PORT=8000
CLEARBG_DEFAULT_MODEL=isnet-general-use
CLEARBG_MAX_BATCH_SIZE=50
CLEARBG_MAX_FILE_SIZE_MB=20
CLEARBG_CACHE_MODELS=true
CLEARBG_LOG_LEVEL=INFO
CLEARBG_CORS_ORIGINS=http://localhost:5173
```

### Configuration File

```python
# backend/core/config.py
DEFAULT_MODEL = ModelName.ISNET_GENERAL
ALPHA_MATTING = True
MAX_BATCH_SIZE = 50
SESSION_CACHE_ENABLED = True

# Alpha matting parameters
ALPHA_FG_THRESHOLD = 240    # Pixels above = foreground
ALPHA_BG_THRESHOLD = 10     # Pixels below = background
ALPHA_ERODE_SIZE = 10       # Edge erosion
```

---

## Models

| Model | Size | Speed (CPU) | Quality | Use Case |
|:------|:----:|:-----------:|:-------:|:---------|
| `u2net` | 176 MB | ~0.8s | Good | General-purpose, products |
| `u2net_human_seg` | 176 MB | ~0.8s | Good | Portraits, people |
| `isnet-general-use` | 178 MB | ~1.4s | Excellent | Hair, fur, complex edges |

> Models are downloaded automatically on first use and cached at `~/.u2net/`. To pre-download all models, run `python main.py --preload-all`.

---

## Testing

The project includes comprehensive end-to-end test coverage across both the API and UI.

### Backend (pytest)

```bash
cd backend
pip install pytest httpx pytest-asyncio pytest-cov

# Run all tests
pytest

# With coverage report
pytest --cov=api --cov=core --cov-report=html

# Specific test file
pytest tests/test_api_e2e.py -v
```

<details>
<summary><b>Example test (<code>backend/tests/test_api_e2e.py</code>)</b></summary>

```python
import pytest
from httpx import AsyncClient
from api.server import app


@pytest.mark.asyncio
async def test_remove_returns_png_with_alpha():
    async with AsyncClient(app=app, base_url="http://test") as client:
        with open("test_image.png", "rb") as f:
            response = await client.post(
                "/remove",
                files={"file": f},
                data={"model": "u2net"},
            )

        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"
        assert len(response.content) > 0


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
```

</details>

### Frontend (Playwright)

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install

# Run all tests
npx playwright test

# Interactive UI mode
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

<details>
<summary><b>Example test (<code>frontend/tests-pw/upload.spec.ts</code>)</b></summary>

```typescript
import { test, expect } from "@playwright/test";

test.describe("Image Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
  });

  test("uploads an image and displays the result", async ({ page }) => {
    await page
      .locator('input[type="file"]')
      .setInputFiles("fixtures/test-image.png");

    await expect(
      page.locator('[data-testid="result-preview"]')
    ).toBeVisible({ timeout: 30_000 });

    const downloadButton = page.locator('[data-testid="download-button"]');
    await expect(downloadButton).toBeEnabled();
  });

  test("displays available models", async ({ page }) => {
    const modelSelect = page.locator('[data-testid="model-select"]');
    await expect(modelSelect).toContainText("isnet-general-use");
  });
});
```

</details>

### CI/CD (GitHub Actions)

<details>
<summary><b><code>.github/workflows/ci.yml</code></b></summary>

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"
      - run: |
          cd backend
          pip install -r requirements.txt pytest httpx pytest-asyncio
          pytest tests/ -v --cov=api --cov=core

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json
      - run: |
          cd frontend
          npm ci
          npx playwright install --with-deps chromium
          npm run build

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - name: Start services
        run: |
          cd backend && pip install -r requirements.txt && python main.py server &
          cd frontend && npm ci && npm run dev &
          sleep 10
      - name: Run Playwright tests
        run: cd frontend && npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

</details>

---

## Deployment

### Docker Compose (Production)

```yaml
# docker-compose.yml
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - CLEARBG_LOG_LEVEL=INFO
    volumes:
      - model-cache:/root/.u2net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  model-cache:
```

### Kubernetes

A reference Helm chart is provided in `deploy/helm/`. See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for full instructions.

### Reverse Proxy (nginx)

```nginx
server {
    listen 80;
    server_name clearbg.example.com;

    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 60s;
    }

    location / {
        proxy_pass http://frontend:80/;
    }
}
```

---

## Performance

### Optimization Tips

- **Pre-warm models** at startup with `--preload` to avoid cold-start latency
- **Enable GPU** with `pip install onnxruntime-gpu` for 5–10× speedup
- **Use batch endpoints** for bulk processing (more efficient than parallel singles)
- **Disable alpha matting** for product photography where edges are clean
- **Cache aggressively** — leave `SESSION_CACHE_ENABLED=true`

### Benchmarks

| Hardware | Model | Image Size | Time |
|:---------|:------|:----------:|:----:|
| CPU (i7-11700K) | u2net | 1024×1024 | ~0.8s |
| CPU (i7-11700K) | isnet | 1024×1024 | ~1.4s |
| GPU (RTX 3080) | u2net | 1024×1024 | ~0.1s |
| GPU (RTX 3080) | isnet | 1024×1024 | ~0.2s |

> Benchmarks are approximate and depend on hardware, OS, and image content.

---

## Security

### Reporting Vulnerabilities

Please report security vulnerabilities privately to **security@example.com**. Do not open public issues for security concerns.

### Security Considerations

- **Input validation:** All uploads are validated for MIME type, size, and dimensions
- **Path traversal:** File paths are sanitized before disk operations
- **Resource limits:** Configurable max batch size and file size prevent DoS
- **CORS:** Restricted by default; configure via `CLEARBG_CORS_ORIGINS`
- **No secrets:** No external API keys or credentials required
- **Local processing:** Images never leave your infrastructure

See [SECURITY.md](SECURITY.md) for the full security policy.

---

## Troubleshooting

<details>
<summary><b>Models fail to download</b></summary>

Models are fetched from S3 on first use. Verify:
- Internet connectivity (first run only)
- Write permissions to `~/.u2net/`
- ~180 MB free disk space per model
- Corporate proxy settings (set `HTTPS_PROXY` if needed)

</details>

<details>
<summary><b>Out-of-memory errors</b></summary>

Memory consumption depends on image size. Solutions:
- Resize input images to ≤ 2048px
- Reduce batch concurrency: `--workers 1`
- Use the smaller `u2net` model
- Increase Docker memory limits

</details>

<details>
<summary><b>Slow first request</b></summary>

Models are loaded lazily on first inference. Pre-warm them:

```bash
python cli/main.py --preload --model isnet-general-use
```

</details>

<details>
<summary><b>CORS errors in browser</b></summary>

Add your frontend origin to `CLEARBG_CORS_ORIGINS`:

```bash
CLEARBG_CORS_ORIGINS=http://localhost:5173,https://clearbg.example.com
```

</details>

<details>
<summary><b>Port conflicts</b></summary>

```bash
# Backend
python main.py server --port 8080

# Frontend (vite.config.ts)
export default { server: { port: 5174 } }
```

</details>

---

## Contributing

Contributions are welcome and appreciated! See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution guide.

### Quick Contribution Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/<you>/clear-bg.git`
3. **Create** a feature branch: `git checkout -b feat/my-feature`
4. **Commit** your changes following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add WebP output format`
   - `fix: handle empty batch uploads`
   - `docs: clarify alpha-matting parameters`
5. **Push** and open a Pull Request

### Development Standards

- Python: Follows [PEP 8](https://peps.python.org/pep-0008/), enforced via `ruff`
- TypeScript: ESLint with strict mode
- All new features require tests
- All public APIs require docstrings/JSDoc

### Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/). See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## Roadmap

- [x] CPU-based inference with U²-Net
- [x] FastAPI REST backend
- [x] React frontend with drag-and-drop
- [x] Batch processing
- [x] ISNet model support
- [ ] GPU acceleration documentation
- [ ] WebP and AVIF output formats
- [ ] Custom background replacement
- [ ] Streaming/chunked uploads for large images
- [ ] Browser-side ONNX inference (privacy mode)
- [ ] Plugin system for custom models

See the [open issues](https://github.com/your-org/clear-bg/issues) for a full list of proposed features.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for the full text.

---

## Acknowledgments

This project stands on the shoulders of:

- [**rembg**](https://github.com/danielgatis/rembg) — The core background-removal toolkit
- [**U²-Net**](https://github.com/xuebinqin/U-2-Net) — Original salient object detection architecture
- [**ISNet**](https://github.com/xuebinqin/DIS) — Highly accurate dichotomous image segmentation
- [**ONNX Runtime**](https://onnxruntime.ai/) — Cross-platform inference accelerator
- [**FastAPI**](https://fastapi.tiangolo.com/) — Modern Python web framework
- [**React**](https://react.dev/) and [**Vite**](https://vitejs.dev/) — Frontend tooling

---

<div align="center">

**[⬆ Back to Top](#clear-bg)**

Made with care for developers who value privacy.

</div>
