"""
Entry point for the AI Background Remover backend.

Usage:
    # Start API server
    python main.py server

    # CLI mode
    python main.py cli -- image.jpg --model isnet-general-use

    # Direct script usage
    python main.py remove image.jpg
"""

import argparse
import sys
from pathlib import Path

from core.config import ModelName, OUTPUTS_DIR
from core.remover import engine


def cmd_server(args):
    import uvicorn
    print("Starting AI Background Remover API server...")
    print("Open http://localhost:8000/docs for interactive API documentation")
    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=False)


def cmd_cli(args):
    # Delegate to cli/main.py logic
    from cli.main import main as cli_main
    # Reconstruct sys.argv so cli.main parser works
    sys.argv = ["cli/main.py"] + args.cli_args
    cli_main()


def cmd_remove(args):
    model = ModelName(args.model)
    input_path = Path(args.input)
    out_path = Path(args.output) if args.output else OUTPUTS_DIR / f"{input_path.stem}_nobg.png"

    print(f"Processing: {input_path} with model={model.value}")
    result = engine.process_image(
        image=input_path,
        output_path=out_path,
        model=model,
        alpha_matting=args.alpha_matting,
    )
    print(f"Saved: {result['saved_path']} ({result['time_seconds']}s)")


def main():
    parser = argparse.ArgumentParser(description="AI Background Remover")
    sub = parser.add_subparsers(dest="command")

    # server
    sub.add_parser("server", help="Start FastAPI server")

    # remove (quick single-file)
    p_remove = sub.add_parser("remove", help="Remove background from a single image")
    p_remove.add_argument("input")
    p_remove.add_argument("-o", "--output", default=None)
    p_remove.add_argument("--model", default="isnet-general-use")
    p_remove.add_argument("--alpha-matting", action="store_true")

    # cli passthrough
    p_cli = sub.add_parser("cli", help="Run full CLI (pass -- followed by args)")
    p_cli.add_argument("cli_args", nargs=argparse.REMAINDER)

    args = parser.parse_args()

    if args.command == "server":
        cmd_server(args)
    elif args.command == "remove":
        cmd_remove(args)
    elif args.command == "cli":
        cmd_cli(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
