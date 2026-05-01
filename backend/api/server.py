"""
FastAPI Backend for AI Background Removal
==========================================
REST API + static web UI for local ML background removal.
"""

import io
import shutil
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from pydantic import BaseModel

from core.config import BgRemoverConfig, ModelName, OUTPUTS_DIR
from core.remover import engine

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
# Serve the Vite production build. During development, run `npm run dev`
# in the frontend folder — Vite proxies API calls to this server.
STATIC_DIR = PROJECT_ROOT / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    engine.preload_model(BgRemoverConfig.DEFAULT_MODEL)
    yield


app = FastAPI(
    title="Clear.bg",
    description="Local AI background removal. No API keys, no cloud, no data leaves your machine.",
    version="1.2.0",
    lifespan=lifespan,
)


class ModelInfo(BaseModel):
    name: str
    description: str
    speed: str
    quality: str
    best_for: str


# ───────────────────────────────────────────────
# UI + JSON root
# ───────────────────────────────────────────────

@app.get("/api")
async def api_root():
    return {
        "service": "AI Background Remover",
        "version": "1.1.0",
        "endpoints": ["/models", "/remove", "/remove/batch", "/health"],
    }


@app.get("/health")
async def health():
    return {"status": "ok", "default_model": BgRemoverConfig.DEFAULT_MODEL.value}


@app.get("/models", response_model=List[ModelInfo])
async def list_models():
    return engine.get_available_models()


# ───────────────────────────────────────────────
# Background removal
# ───────────────────────────────────────────────

@app.post("/remove")
async def remove_background(
    file: UploadFile = File(...),
    model: ModelName = Form(BgRemoverConfig.DEFAULT_MODEL),
    alpha_matting: bool = Form(False),
    return_mask: bool = Form(False),
    bg_color: Optional[str] = Form(None),
    bg_image: Optional[UploadFile] = File(None),
    format: str = Form("png"),
    feather: int = Form(0),
    smart_crop: bool = Form(False),
):
    """
    Upload a single image and get the background removed (or replaced).

    - **bg_color**: hex/CSS color (e.g. "#ffffff", "rgb(255,0,0)") for solid fill
    - **bg_image**: optional image file to use as the new background
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        max_bytes = BgRemoverConfig.MAX_FILE_SIZE_MB * 1024 * 1024
        if len(contents) > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File too large — max {BgRemoverConfig.MAX_FILE_SIZE_MB} MB",
            )
        cutout = engine.remove_background(
            image=contents,
            model=model,
            alpha_matting=alpha_matting,
            only_mask=return_mask,
        )

        # Feather: blur alpha channel edges
        if feather > 0 and not return_mask and cutout.mode == "RGBA":
            cutout = engine.feather_edges(cutout, feather)

        # Smart crop: trim to subject bounding box
        if smart_crop and not return_mask:
            cutout = engine.smart_crop(cutout)

        if not return_mask and (bg_color or bg_image):
            bg_img_pil = None
            if bg_image is not None:
                bg_bytes = await bg_image.read()
                if bg_bytes:
                    bg_img_pil = Image.open(io.BytesIO(bg_bytes))
            cutout = engine.compose_on_background(
                cutout=cutout,
                bg_color=bg_color or None,
                bg_image=bg_img_pil,
            )

        use_webp = format.lower() == "webp"
        img_format = "WEBP" if use_webp else "PNG"
        media_type = "image/webp" if use_webp else "image/png"
        ext = ".webp" if use_webp else ".png"

        # WebP needs RGB(A) — strip alpha if bg was applied
        if use_webp and cutout.mode == "RGBA":
            pass  # WEBP supports RGBA
        buf = io.BytesIO()
        cutout.save(buf, format=img_format)
        buf.seek(0)

        filename = f"{Path(file.filename or 'image').stem}_nobg{ext}"
        return StreamingResponse(buf, media_type=media_type, headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/remove/batch")
async def remove_background_batch(
    files: List[UploadFile] = File(...),
    model: ModelName = Form(BgRemoverConfig.DEFAULT_MODEL),
    alpha_matting: bool = Form(False),
):
    """
    Upload multiple images for batch background removal.
    Returns a ZIP file containing all processed images.
    """
    if len(files) > BgRemoverConfig.MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Max {BgRemoverConfig.MAX_BATCH_SIZE} files per batch",
        )

    batch_id = uuid.uuid4().hex[:8]
    batch_out = OUTPUTS_DIR / f"batch_{batch_id}"
    batch_out.mkdir(parents=True, exist_ok=True)

    processed = 0
    errors = []

    for upload in files:
        if not upload.content_type or not upload.content_type.startswith("image/"):
            errors.append(f"Skipped non-image: {upload.filename}")
            continue
        try:
            contents = await upload.read()
            engine.process_image(
                image=contents,
                output_path=batch_out / f"{Path(upload.filename).stem}_nobg.png",
                model=model,
                alpha_matting=alpha_matting,
            )
            processed += 1
        except Exception as e:
            errors.append(f"Failed {upload.filename}: {e}")

    zip_path = OUTPUTS_DIR / f"batch_{batch_id}.zip"
    shutil.make_archive(str(zip_path.with_suffix("")), "zip", batch_out)

    return {
        "success": True,
        "batch_id": batch_id,
        "processed": processed,
        "errors": errors,
        "download_url": f"/download/batch/{batch_id}",
    }


@app.get("/download/batch/{batch_id}")
async def download_batch(batch_id: str):
    zip_path = OUTPUTS_DIR / f"batch_{batch_id}.zip"
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="Batch not found")
    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename=f"batch_{batch_id}.zip",
    )


@app.post("/remove/local")
async def remove_local(
    input_path: str = Form(...),
    output_path: Optional[str] = Form(None),
    model: ModelName = Form(BgRemoverConfig.DEFAULT_MODEL),
    alpha_matting: bool = Form(False),
):
    """Process an image already on the server's filesystem."""
    src = Path(input_path)
    if not src.exists():
        raise HTTPException(status_code=404, detail="Input file not found")

    dst = Path(output_path) if output_path else OUTPUTS_DIR / f"{src.stem}_nobg.png"

    result = engine.process_image(
        image=src,
        output_path=dst,
        model=model,
        alpha_matting=alpha_matting,
    )

    return {
        "success": True,
        "input": str(src),
        "output": result["saved_path"],
        "time_seconds": result["time_seconds"],
        "model": model.value,
    }


# SPA fallback — serve index.html for all unmatched routes so React Router
# handles /app and any other client-side paths on hard refresh.
if STATIC_DIR.exists():
    from fastapi.responses import HTMLResponse

    _index = (STATIC_DIR / "index.html").read_text(encoding="utf-8")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        # Serve static assets directly, fall back to index.html for routes
        asset = STATIC_DIR / full_path
        if asset.is_file():
            return FileResponse(asset)
        return HTMLResponse(_index)

    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")
