#!/usr/bin/env python3
"""Create a buyer-facing ZIP from an explicit source allowlist.

Python standard library only. No Git history, CI artifacts, environment files,
or hidden files are included. Do not publish before asset rights are checked.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo
import sys

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "release" / "template-website-jasa-v1.0.0.zip"
PREFIX = "template-website-jasa-v1.0.0/"
EXACT = [
    "index.html", "styles.css", "script.js", "package.json",
    "config/site.json", "configurator/index.html",
    "configurator/configurator.css", "configurator/configurator.js",
    "scripts/build-site.mjs", "scripts/render-site.mjs",
    "scripts/validate-site.mjs",
    "examples/studio-arunika.site.json",
    "buyer/README-PEMBELI.md", "buyer/LICENSE-DRAFT.md",
    "buyer/CHECKLIST-LAUNCH.md", "buyer/CONTENT-RIGHTS.md",
]
ASSETS_DIR = ROOT / "assets"
ALLOWED_ASSET_EXT = {".svg", ".webp", ".png", ".jpg", ".jpeg"}
MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_TOTAL_BYTES = 35 * 1024 * 1024


def plan():
    files = [ROOT / p for p in EXACT]
    if not ASSETS_DIR.is_dir():
        raise SystemExit("Missing assets directory")
    for p in sorted(ASSETS_DIR.rglob("*")):
        if p.is_symlink():
            raise SystemExit("Refusing asset symlink: " + str(p))
        if p.is_file():
            if p.suffix.lower() not in ALLOWED_ASSET_EXT:
                raise SystemExit("Asset extension not allowlisted: " + str(p))
            files.append(p)
    seen = set()
    total = 0
    for path in files:
        if path.is_symlink() or not path.is_file():
            raise SystemExit("Missing or symbolic-link package input: " + str(path))
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith(".") or "/." in rel or ".." in Path(rel).parts or rel in seen:
            raise SystemExit("Unsafe or duplicate path: " + rel)
        seen.add(rel)
        size = path.stat().st_size
        if size > MAX_FILE_BYTES:
            raise SystemExit("File exceeds 10 MB: " + rel)
        total += size
    if total > MAX_TOTAL_BYTES:
        raise SystemExit("Package exceeds 35 MB source limit")
    return sorted(files, key=lambda p: p.relative_to(ROOT).as_posix())


def create():
    files = plan()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for file in files:
            rel = file.relative_to(ROOT).as_posix()
            info = ZipInfo(PREFIX + rel, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, file.read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)
    print(f"Created {OUTPUT.relative_to(ROOT)}: {len(files)} allowlisted files ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    if len(sys.argv) != 1:
        raise SystemExit("Usage: python3 scripts/package-template.py")
    create()
