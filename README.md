# AI Background Remover (Local ML Backend)

A powerful, end-to-end background removal backend that runs **entirely on your machine**. No API keys, no cloud services, no data leaving your computer.

## What Makes It Powerful

- **Local Deep Learning**: Uses state-of-the-art ONNX models (U²-Net, ISNet) running locally via `onnxruntime`
- **Multiple AI Models**: Choose the right model for your use case
- **Alpha Matting**: Optional edge refinement for professional-quality cutouts (hair, fur, transparent objects)
- **Session Caching**: Models stay loaded in memory for lightning-fast repeated processing
- **Batch Processing**: Process entire folders in parallel
- **REST API**: FastAPI backend for integration with any frontend or service
- **CLI Tool**: Direct command-line usage for scripts and automation

## Supported Models

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `u2net` | Fast | Good | General objects, product photos |
| `u2net_human_seg` | Fast | Good | People, selfies, portraits |
| `isnet-general-use` | Medium | Excellent | Professional photos, complex edges, hair/fur |

Models download automatically on first use (~170MB each) and are cached at `~/.u2net/`.

## Project Structure

```
Bg Remover/
├── core/
│   ├── config.py          # Configuration & enums
│   └── remover.py         # AI engine with session caching
├── api/
│   └── server.py          # FastAPI REST endpoints
├── cli/
│   └── main.py            # Command-line interface
├── uploads/               # API upload staging
├── outputs/               # Default output directory
├── main.py                # Unified entry point
├── requirements.txt
└── README.md
```

## Quick Start

### 1. Activate Virtual Environment

```powershell
# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

### 2. CLI Usage

```bash
# Single image
python main.py remove photo.jpg

# Specify model and alpha matting
python cli/main.py photo.jpg --model isnet-general-use --alpha-matting

# Batch process a folder
python cli/main.py ./photos/ --batch --output ./results

# Pre-load model (warm-up)
python cli/main.py --preload --model isnet-general-use
```

### 3. Start API Server

```bash
python main.py server
```

Server runs at `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

### 4. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check |
| `/models` | GET | List available models |
| `/remove` | POST | Upload single image, get transparent PNG |
| `/remove/batch` | POST | Upload multiple images, get ZIP |
| `/remove/local` | POST | Process server-side file path |
| `/download/batch/{id}` | GET | Download processed batch ZIP |

#### Example: cURL

```bash
# Remove background from image
curl -X POST "http://localhost:8000/remove" \
  -F "file=@photo.jpg" \
  -F "model=isnet-general-use" \
  -F "alpha_matting=true" \
  --output result.png

# Batch processing
curl -X POST "http://localhost:8000/remove/batch" \
  -F "files=@1.jpg" \
  -F "files=@2.jpg" \
  -F "model=u2net"
```

#### Example: Python Requests

```python
import requests

url = "http://localhost:8000/remove"
with open("photo.jpg", "rb") as f:
    response = requests.post(
        url,
        files={"file": f},
        data={"model": "isnet-general-use", "alpha_matting": "true"},
    )

with open("output.png", "wb") as f:
    f.write(response.content)
```

## Configuration

Edit `core/config.py` to change defaults:

```python
DEFAULT_MODEL = ModelName.ISNET_GENERAL
ALPHA_MATTING = True
MAX_BATCH_SIZE = 50
```

## Parameters Explained

- **model**: Which neural network to use. ISNet is higher quality but slower.
- **alpha_matting**: Post-processes edges using alpha matting for smoother results. Great for hair and fur.
- **alpha_fg_threshold**: Pixels above this are considered foreground (0-255)
- **alpha_bg_threshold**: Pixels below this are considered background (0-255)
- **alpha_erode_size**: Edge erosion amount for matting

## Requirements

- Python 3.10+
- ~500MB disk space for dependencies
- ~180MB per model (downloaded on first use)
- 4GB+ RAM recommended

## Tech Stack

- **rembg**: Background removal using U²-Net/ISNet ONNX models
- **ONNX Runtime**: High-performance local inference
- **FastAPI**: Modern async web framework
- **Pillow**: Image I/O and processing
- **NumPy**: Array operations for post-processing
