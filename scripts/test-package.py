#!/usr/bin/env python3
"""Verify package input review, hashes, deterministic ZIP, and customer builds."""
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZipFile
import hashlib
import json
import subprocess
import sys
import shutil

ROOT = Path(__file__).resolve().parents[1]
import importlib.util

spec = importlib.util.spec_from_file_location("packager", ROOT / "scripts" / "package-template.py")
packager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packager)


def run(args, cwd):
    p = subprocess.run(args, cwd=cwd, text=True, capture_output=True)
    if p.returncode:
        raise AssertionError(f"{args} failed in {cwd}\nSTDOUT:\n{p.stdout[-2500:]}\nSTDERR:\n{p.stderr[-3000:]}")
    return p.stdout


# Regression: strict asset checks reject unknown, malformed, active, or externally
# referencing assets. These tests require no writes to the source repository.
assert packager.validate_svg((ROOT / "assets/favicon.svg").read_bytes())
for svg in [
    b'<svg xmlns="http://www.w3.org/2000/svg"><script>evil()</script></svg>',
    b'<svg xmlns="http://www.w3.org/2000/svg"><path onload="evil()" d="M0 0"/></svg>',
    b'<svg xmlns="http://www.w3.org/2000/svg"><image href="https://elsewhere.test/x"/></svg>',
    b'<!DOCTYPE svg [<!ENTITY e SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"/>',
]:
    try:
        packager.validate_svg(svg)
    except ValueError:
        pass
    else:
        raise AssertionError("Unsafe SVG allowed")
try:
    packager.scan_secrets("fake.txt", b"-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----")
except ValueError:
    pass
else:
    raise AssertionError("Private key marker was not caught")
try:
    packager.validate_asset("fake.webp", b"not-a-webp")
except ValueError:
    pass
else:
    raise AssertionError("Invalid WebP header allowed")

files = packager.plan()
assert {p.relative_to(ROOT).as_posix() for p in files} == set(packager.EXACT + packager.ASSETS)
assert "buyer/RENCANA-PENJUALAN.md" not in packager.EXACT
packager.create()
zip_path = packager.OUTPUT
first_hash = hashlib.sha256(zip_path.read_bytes()).hexdigest()
packager.create()
assert hashlib.sha256(zip_path.read_bytes()).hexdigest() == first_hash, "ZIP must be reproducible"

with ZipFile(zip_path) as z:
    assert z.testzip() is None
    names = z.namelist()
    expected = {packager.PREFIX + p for p in packager.EXACT + packager.ASSETS}
    expected.add(packager.PREFIX + packager.MANIFEST)
    assert set(names) == expected, "ZIP missing/extra file(s): " + repr(sorted(set(names) ^ expected))
    assert len(names) == len(expected), "Duplicate ZIP entries"
    manifest = json.loads(z.read(packager.PREFIX + packager.MANIFEST))
    assert manifest["schema"] == 1
    assert manifest["rights_verified"] is False
    assert manifest["commercial_release_approved"] is False
    assert {i["path"] for i in manifest["files"]} == set(packager.EXACT + packager.ASSETS)
    for item in manifest["files"]:
        rel = item["path"]
        blob = z.read(packager.PREFIX + rel)
        assert item["size"] == len(blob), "Incorrect size: " + rel
        assert item["sha256"] == hashlib.sha256(blob).hexdigest(), "Incorrect SHA-256: " + rel
        assert ".." not in Path(rel).parts
        assert not any(part.startswith(".") for part in Path(rel).parts)
        assert "/.git/" not in rel and "node_modules" not in rel and "dist/" not in rel
    assert not any("RENCANA-PENJUALAN" in name for name in names)

# Demonstrate tampering detection independently of the source tree.
with TemporaryDirectory(prefix="a3-package-") as tmp:
    with ZipFile(zip_path) as z:
        z.extractall(tmp)
    site = Path(tmp) / packager.PREFIX
    assert site.is_dir()
    original = (site / "config/site.json").read_bytes()
    run(["npm", "test"], site)
    run(["npm", "run", "build"], site)
    default_html = (site / "dist/index.html").read_text()
    assert "Ruang Reka" in default_html
    assert 'noindex, nofollow' in default_html
    assert (site / "dist/configurator/index.html").is_file()
    shutil.copy2(site / "examples/studio-arunika.site.json", site / "config/site.json")
    run(["npm", "run", "build"], site)
    alternative = (site / "dist/index.html").read_text()
    assert "Studio Arunika" in alternative
    assert "Ruang Reka" not in alternative
    assert 'noindex, nofollow' in alternative
    assert "Kedai Pagi" in alternative
    assert len(json.loads((site / "config/site.json").read_text())["services"]["items"]) == 2
    dest = ROOT / "artifacts" / "arunika-dist"
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(site / "dist", dest)
    (site / "config/site.json").write_bytes(original)

print("PASS A3: reviewed asset allowlist and SVG checks; complete SHA-256 manifest; reproducible ZIP; buyer npm test/build; Arunika built assets staged for Chromium")
