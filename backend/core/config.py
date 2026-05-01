from enum import Enum
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)


class ModelName(str, Enum):
    U2NET = "u2net"
    U2NET_HUMAN = "u2net_human_seg"
    ISNET_GENERAL = "isnet-general-use"
    BIREFNET = "birefnet-general"
    BIREFNET_PORTRAIT = "birefnet-portrait"
    SAM = "sam"


class BgRemoverConfig:
    DEFAULT_MODEL: ModelName = ModelName.ISNET_GENERAL
    ALPHA_MATTING: bool = True
    ALPHA_MATTING_FOREGROUND_THRESHOLD: int = 240
    ALPHA_MATTING_BACKGROUND_THRESHOLD: int = 10
    ALPHA_MATTING_ERODE_SIZE: int = 10
    SUPPORTED_INPUT_FORMATS: tuple = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff")
    SUPPORTED_OUTPUT_FORMATS: tuple = (".png", ".webp", ".bmp", ".tiff")
    DEFAULT_OUTPUT_FORMAT: str = ".png"
    MAX_BATCH_SIZE: int = 50
    MAX_FILE_SIZE_MB: int = 50
