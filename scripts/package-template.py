#!/usr/bin/env python3
"""Create a deterministic buyer ZIP from reviewed explicit source and asset lists.

Security checks reduce accidental inclusion of secrets/active SVG. They do NOT
prove intellectual-property rights; do not publish commercially without review.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo
from xml.etree import ElementTree
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "release" / "template-website-jasa-v1.0.0.zip"
PREFIX = "template-website-jasa-v1.0.0/"
MANIFEST = "MANIFEST.sha256.json"
EXACT = [
    "index.html", "styles.css", "script.js", "package.json",
    "config/site.json", "configurator/index.html",
    "configurator/configurator.css", "configurator/configurator.js",
    "scripts/build-site.mjs", "scripts/render-site.mjs",
    "scripts/validate-site.mjs",
    "scripts/check-site.mjs", "scripts/test-menu.mjs",
    "scripts/test-stage2.mjs", "scripts/test-production.mjs",
    "scripts/test-template.mjs",
    "scripts/package-template.py", "scripts/test-package.py",
    "examples/studio-arunika.site.json",
    "buyer/README-PEMBELI.md", "buyer/LICENSE-DRAFT.md",
    "buyer/CHECKLIST-LAUNCH.md", "buyer/CONTENT-RIGHTS.md",
]
# Newly introduced assets require explicit review and additions here.
ASSETS = ["assets/favicon.svg", "assets/images/hero-studio.webp"]
MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_TOTAL_BYTES = 35 * 1024 * 1024

SUSPICIOUS = (
    re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    re.compile(rb"\bgh[pousr]_[A-Za-z0-9_]{20,}\b"),
    re.compile(rb"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
    re.compile(rb"\bsk-(?:proj-|live-)[A-Za-z0-9_-]{20,}\b"),
)
ALLOWED_SVG_ELEMENTS = {"svg", "title", "rect", "path", "g", "circle", "ellipse", "line", "polyline", "polygon"}
ALLOWED_SVG_ATTRS = {"xmlns", "viewBox", "role", "aria-labelledby", "id", "width", "height",
                     "x", "y", "rx", "ry", "fill", "d", "cx", "cy", "r", "x1", "y1",
                     "x2", "y2", "points", "stroke", "stroke-width", "transform"}
SVG_NS = "http://www.w3.org/2000/svg"


def validate_svg(blob):
    if b"<!DOCTYPE" in blob.upper() or b"<!ENTITY" in blob.upper():
        raise ValueError("SVG DTD/entities forbidden")
    try:
        root = ElementTree.fromstring(blob)
    except ElementTree.ParseError as exc:
        raise ValueError("Malformed SVG") from exc
    if root.tag != "{" + SVG_NS + "}svg":
        raise ValueError("SVG must use official namespace")
    for el in root.iter():
        if not isinstance(el.tag, str) or not el.tag.startswith("{" + SVG_NS + "}"):
            raise ValueError("SVG foreign element forbidden")
        local = el.tag.split("}", 1)[1]
        if local not in ALLOWED_SVG_ELEMENTS:
            raise ValueError("SVG active or unknown element: " + local)
        for attr, val in el.attrib.items():
            if attr not in ALLOWED_SVG_ATTRS:
                raise ValueError("SVG attribute forbidden: " + attr)
            if re.search(r"url\s*\(|javascript:|data:|https?://|@import|expression\s*\(", val, re.I):
                raise ValueError("SVG external resource or script-like value forbidden")
    return True


def validate_asset(rel, blob):
    if rel.endswith(".svg"):
        validate_svg(blob)
    elif rel.endswith(".webp"):
        if len(blob) < 12 or blob[:4] != b"RIFF" or blob[8:12] != b"WEBP":
            raise ValueError("Invalid WebP header: " + rel)
    else:
        raise ValueError("Asset extension not approved: " + rel)


def scan_secrets(rel, blob):
    for pattern in SUSPICIOUS:
        if pattern.search(blob):
            raise ValueError("Potential secret in " + rel + "; review before packaging")


def plan():
    files = [ROOT / p for p in EXACT + ASSETS]
    expected = set(ASSETS)
    assets = ROOT / "assets"
    if not assets.is_dir():
        raise ValueError("Missing assets directory")
    actual = {p.relative_to(ROOT).as_posix() for p in assets.rglob("*") if p.is_file() or p.is_symlink()}
    if actual != expected:
        raise ValueError("Unreviewed or missing assets: " + str(sorted(actual ^ expected)))
    total = 0
    seen = set()
    for path in files:
        if path.is_symlink() or not path.is_file():
            raise ValueError("Missing or symlink package input: " + str(path))
        rel = path.relative_to(ROOT).as_posix()
        if rel in seen or rel.startswith(".") or "/." in rel or ".." in Path(rel).parts:
            raise ValueError("Unsafe or duplicate path: " + rel)
        seen.add(rel)
        blob = path.read_bytes()
        if len(blob) > MAX_FILE_BYTES:
            raise ValueError("File exceeds size limit: " + rel)
        total += len(blob)
        scan_secrets(rel, blob)
        if rel in ASSETS:
            validate_asset(rel, blob)
    if total > MAX_TOTAL_BYTES:
        raise ValueError("Package exceeds total limit")
    return sorted(files, key=lambda p: p.relative_to(ROOT).as_posix())


def manifest_for(files):
    return {
        "schema": 1,
        "package": PREFIX.rstrip("/"),
        "rights_verified": False,
        "commercial_release_approved": False,
        "files": [
            {"path": file.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(file.read_bytes()).hexdigest(),
             "size": file.stat().st_size} for file in files
        ]
    }


def create():
    files = plan()
    manifest = manifest_for(files)
    manifest_bytes = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf8")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for rel, blob in [(p.relative_to(ROOT).as_posix(), p.read_bytes()) for p in files] + [(MANIFEST, manifest_bytes)]:
            info = ZipInfo(PREFIX + rel, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, blob, compress_type=ZIP_DEFLATED, compresslevel=9)
    print(f"Created {OUTPUT.relative_to(ROOT)}: {len(files) + 1} allowlisted files ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    if len(sys.argv) != 1:
        raise SystemExit("Usage: python3 scripts/package-template.py")
    create()
