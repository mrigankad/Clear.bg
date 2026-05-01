"""
AI Background Removal Engine
============================
Local deep-learning powered background removal using ONNX models.
No API calls, everything runs on your machine.

Supported Models:
- u2net: Fast, good general-purpose results
- u2net_human_seg: Optimized for human portraits
- isnet-general-use: Higher quality, slower, best edges
"""

import io
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import List, Optional, Union

import numpy as np
from PIL import Image
from rembg import remove, new_session
from rembg.sessions import BaseSession

from core.config import BgRemoverConfig, ModelName, OUTPUTS_DIR


class BgRemoverEngine:
    """
    High-performance background removal engine with session caching
    and alpha matting support for professional-quality edges.
    """

    def __init__(self):
        self._sessions: dict[ModelName, BaseSession] = {}
        self._executor = ThreadPoolExecutor(max_workers=4)

    def _get_session(self, model: ModelName) -> BaseSession:
        """Cache and reuse ONNX sessions for performance."""
        if model not in self._sessions:
            print(f"[Engine] Loading model: {model.value} ...")
            t0 = time.time()
            self._sessions[model] = new_session(model.value)
            print(f"[Engine] Model loaded in {time.time() - t0:.2f}s")
        return self._sessions[model]

    def remove_background(
        self,
        image: Union[Image.Image, bytes, Path, str],
        model: ModelName = BgRemoverConfig.DEFAULT_MODEL,
        alpha_matting: bool = BgRemoverConfig.ALPHA_MATTING,
        alpha_fg_threshold: int = BgRemoverConfig.ALPHA_MATTING_FOREGROUND_THRESHOLD,
        alpha_bg_threshold: int = BgRemoverConfig.ALPHA_MATTING_BACKGROUND_THRESHOLD,
        alpha_erode_size: int = BgRemoverConfig.ALPHA_MATTING_ERODE_SIZE,
        only_mask: bool = False,
    ) -> Image.Image:
        """
        Remove background from a single image.

        Args:
            image: PIL Image, raw bytes, or file path
            model: Which ONNX model to use
            alpha_matting: Enable alpha matting for smoother edges
            alpha_fg_threshold: Foreground threshold for alpha matting
            alpha_bg_threshold: Background threshold for alpha matting
            alpha_erode_size: Erosion size for alpha matting
            only_mask: Return the binary mask instead of the cutout

        Returns:
            PIL Image with transparent background (RGBA) or mask (L)
        """
        # Normalize input to PIL Image
        if isinstance(image, (str, Path)):
            img = Image.open(image)
        elif isinstance(image, bytes):
            img = Image.open(io.BytesIO(image))
        else:
            img = image.copy()

        # Convert to RGB if needed (rembg handles RGBA input fine)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")

        session = self._get_session(model)

        # Convert PIL to bytes for rembg
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        img_bytes = buf.getvalue()

        result_bytes = remove(
            data=img_bytes,
            session=session,
            alpha_matting=alpha_matting,
            alpha_matting_foreground_threshold=alpha_fg_threshold,
            alpha_matting_background_threshold=alpha_bg_threshold,
            alpha_matting_erode_size=alpha_erode_size,
            only_mask=only_mask,
        )

        return Image.open(io.BytesIO(result_bytes))

    def process_image(
        self,
        image: Union[Image.Image, bytes, Path, str],
        output_path: Optional[Path] = None,
        model: ModelName = BgRemoverConfig.DEFAULT_MODEL,
        alpha_matting: bool = BgRemoverConfig.ALPHA_MATTING,
        post_process: bool = True,
    ) -> dict:
        """
        Full pipeline: remove background + optional post-processing + save.

        Returns:
            Metadata dict with timing, paths, and image info.
        """
        t_start = time.perf_counter()

        result = self.remove_background(
            image=image,
            model=model,
            alpha_matting=alpha_matting,
        )

        # Optional post-processing: remove faint edge artifacts
        if post_process:
            result = self._post_process(result)

        # Save if path provided
        saved_path = None
        if output_path:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            # Always save as PNG to preserve alpha
            if output_path.suffix.lower() != ".png":
                output_path = output_path.with_suffix(".png")
            result.save(output_path, "PNG")
            saved_path = str(output_path)

        elapsed = time.perf_counter() - t_start

        return {
            "image": result,
            "saved_path": saved_path,
            "time_seconds": round(elapsed, 3),
            "model_used": model.value,
            "dimensions": result.size,
            "mode": result.mode,
        }

    def batch_process(
        self,
        inputs: List[Union[Path, str, bytes]],
        output_dir: Path = OUTPUTS_DIR,
        model: ModelName = BgRemoverConfig.DEFAULT_MODEL,
        alpha_matting: bool = False,  # faster for batch
        max_workers: int = 2,
    ) -> List[dict]:
        """
        Process multiple images in parallel using a thread pool.
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        results = []

        def _process_one(idx: int, item) -> dict:
            if isinstance(item, (str, Path)):
                path = Path(item)
                name = path.stem + "_nobg.png"
                out_path = output_dir / name
                meta = self.process_image(
                    image=path,
                    output_path=out_path,
                    model=model,
                    alpha_matting=alpha_matting,
                )
            else:
                out_path = output_dir / f"batch_{idx:04d}_nobg.png"
                meta = self.process_image(
                    image=item,
                    output_path=out_path,
                    model=model,
                    alpha_matting=alpha_matting,
                )
            meta["index"] = idx
            return meta

        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = [pool.submit(_process_one, i, inp) for i, inp in enumerate(inputs)]
            for f in futures:
                results.append(f.result())

        return results

    @staticmethod
    def compose_on_background(
        cutout: Image.Image,
        bg_color: Optional[str] = None,
        bg_image: Optional[Image.Image] = None,
    ) -> Image.Image:
        """
        Composite an RGBA cutout onto a solid color or another image.
        Returns RGBA (preserves alpha if no bg given).
        """
        if cutout.mode != "RGBA":
            cutout = cutout.convert("RGBA")

        if bg_image is not None:
            bg = bg_image.convert("RGBA").resize(cutout.size, Image.LANCZOS)
            bg.alpha_composite(cutout)
            return bg

        if bg_color:
            bg = Image.new("RGBA", cutout.size, bg_color)
            bg.alpha_composite(cutout)
            return bg

        return cutout

    @staticmethod
    def _post_process(img: Image.Image) -> Image.Image:
        """
        Clean up faint alpha artifacts around edges.
        """
        if img.mode != "RGBA":
            return img

        arr = np.array(img)
        alpha = arr[:, :, 3]

        # Zero out very transparent pixels to avoid JPEG-like halo
        alpha[alpha < 15] = 0
        arr[:, :, 3] = alpha

        return Image.fromarray(arr, "RGBA")

    def get_available_models(self) -> List[dict]:
        """Return metadata about available models."""
        return [
            {
                "name": ModelName.U2NET.value,
                "description": "Fast general-purpose background removal",
                "speed": "fast",
                "quality": "good",
                "best_for": "General objects, product photos",
            },
            {
                "name": ModelName.U2NET_HUMAN.value,
                "description": "Optimized for human portraits",
                "speed": "fast",
                "quality": "good",
                "best_for": "People, selfies, portraits",
            },
            {
                "name": ModelName.ISNET_GENERAL.value,
                "description": "High-accuracy general model with superior edges",
                "speed": "medium",
                "quality": "excellent",
                "best_for": "Professional photos, complex edges, hair/fur",
            },
            {
                "name": ModelName.BIREFNET.value,
                "description": "State-of-the-art model, best overall quality",
                "speed": "medium",
                "quality": "excellent",
                "best_for": "Complex scenes, fine details, anything",
            },
            {
                "name": ModelName.BIREFNET_PORTRAIT.value,
                "description": "BiRefNet tuned specifically for portraits",
                "speed": "medium",
                "quality": "excellent",
                "best_for": "People, faces, studio shots",
            },
        ]

    @staticmethod
    def feather_edges(img: Image.Image, radius: int) -> Image.Image:
        """Blur the alpha channel edges for a softer, more natural cutout."""
        from PIL import ImageFilter
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        r, g, b, a = img.split()
        a_blurred = a.filter(ImageFilter.GaussianBlur(radius))
        return Image.merge("RGBA", (r, g, b, a_blurred))

    @staticmethod
    def smart_crop(img: Image.Image) -> Image.Image:
        """Crop image to the tight bounding box of the non-transparent subject."""
        if img.mode != "RGBA":
            return img
        bbox = img.split()[3].getbbox()  # alpha channel bounding box
        if bbox:
            # Add small padding
            pad = 4
            w, h = img.size
            bbox = (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(w, bbox[2] + pad),
                min(h, bbox[3] + pad),
            )
            return img.crop(bbox)
        return img

    def preload_model(self, model: ModelName) -> None:
        """Pre-load a model into memory to avoid first-request latency."""
        self._get_session(model)


# Global singleton engine
engine = BgRemoverEngine()
