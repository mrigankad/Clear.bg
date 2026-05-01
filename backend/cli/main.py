"""
CLI Tool for AI Background Removal
===================================
Command-line interface to process images locally.

Examples:
    python cli/main.py image.jpg
    python cli/main.py image.jpg --model isnet-general-use --alpha-matting
    python cli/main.py folder/ --batch --output ./results
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.config import BgRemoverConfig, ModelName, OUTPUTS_DIR
from core.remover import engine


def main():
    parser = argparse.ArgumentParser(
        description="AI Background Remover - Remove backgrounds locally using deep learning",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Models:
  u2net              Fast general-purpose (default)
  u2net_human_seg    Optimized for people/portraits
  isnet-general-use  Higher quality, best edges
        """,
    )
    parser.add_argument("input", help="Input image file or folder")
    parser.add_argument("-o", "--output", help="Output file or folder", default=None)
    parser.add_argument(
        "--model",
        choices=[m.value for m in ModelName],
        default=BgRemoverConfig.DEFAULT_MODEL.value,
        help="AI model to use",
    )
    parser.add_argument(
        "--alpha-matting",
        action="store_true",
        help="Enable alpha matting for smoother edges (slower)",
    )
    parser.add_argument(
        "--batch",
        action="store_true",
        help="Process all images in input folder",
    )
    parser.add_argument(
        "--mask-only",
        action="store_true",
        help="Output binary mask instead of transparent image",
    )
    parser.add_argument(
        "--preload",
        action="store_true",
        help="Pre-load model and exit (warm-up)",
    )

    args = parser.parse_args()
    model = ModelName(args.model)

    if args.preload:
        print(f"Pre-loading model: {model.value}")
        engine.preload_model(model)
        print("Done.")
        return

    input_path = Path(args.input)

    if args.batch or input_path.is_dir():
        if not input_path.is_dir():
            print(f"Error: {input_path} is not a directory")
            sys.exit(1)

        out_dir = Path(args.output) if args.output else OUTPUTS_DIR / input_path.name
        out_dir.mkdir(parents=True, exist_ok=True)

        files = [
            f for f in input_path.iterdir()
            if f.suffix.lower() in BgRemoverConfig.SUPPORTED_INPUT_FORMATS
        ]

        if not files:
            print("No supported images found.")
            sys.exit(1)

        print(f"Batch processing {len(files)} images -> {out_dir}")
        results = engine.batch_process(
            inputs=files,
            output_dir=out_dir,
            model=model,
            alpha_matting=args.alpha_matting,
        )

        total_time = sum(r["time_seconds"] for r in results)
        print(f"\nDone! {len(results)} images processed in {total_time:.2f}s")
        print(f"Results saved to: {out_dir}")

    else:
        if not input_path.exists():
            print(f"Error: File not found: {input_path}")
            sys.exit(1)

        out_path = None
        if args.output:
            out_path = Path(args.output)
        else:
            out_path = OUTPUTS_DIR / f"{input_path.stem}_nobg.png"

        print(f"Processing: {input_path}")
        print(f"Model: {model.value} | Alpha matting: {args.alpha_matting}")

        result = engine.process_image(
            image=input_path,
            output_path=out_path,
            model=model,
            alpha_matting=args.alpha_matting,
        )

        print(f"Done in {result['time_seconds']}s -> {result['saved_path']}")


if __name__ == "__main__":
    main()
