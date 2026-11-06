#!/usr/bin/env python3
"""Verify commercial candidate ZIP is safe, complete, reproducible and buildable."""
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZipFile
import hashlib
import json
import os
import subprocess
import sys
import shutil

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import importlib.util

spec = importlib.util.spec_from_file_location("packager", ROOT / "scripts" / "package-template.py")
packager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packager)

def run(args, cwd, *, env=None):
    p = subprocess.run(args, cwd=cwd, text=True, capture_output=True, env=env)
    if p.returncode:
        raise AssertionError(f"{args} failed in {cwd}\nSTDOUT:\n{p.stdout[-2500:]}\nSTDERR:\n{p.stderr[-3000:]}")
    return p.stdout

packager.create()
zip_path = packager.OUTPUT
first_hash = hashlib.sha256(zip_path.read_bytes()).hexdigest()
packager.create()
assert hashlib.sha256(zip_path.read_bytes()).hexdigest() == first_hash, "ZIP must be reproducible"

with ZipFile(zip_path) as z:
    names = z.namelist()
    assert len(names) == len(set(names)), "Duplicate entries"
    assert len(names) >= 20, "Unexpectedly incomplete archive"
    for name in names:
        assert name.startswith(packager.PREFIX)
        rel = name[len(packager.PREFIX):]
        assert ".." not in Path(rel).parts
        assert not rel.startswith(".")
        assert not any(part.startswith(".") for part in Path(rel).parts)
        assert not rel.endswith((".env", ".pem", ".key", ".log", ".zip"))
        assert "/.git/" not in name and "node_modules" not in name and "dist/" not in name
    assert packager.PREFIX+"config/site.json" in names
    assert packager.PREFIX+"configurator/index.html" in names
    assert packager.PREFIX+"assets/images/hero-studio.webp" in names
    assert packager.PREFIX+"buyer/CONTENT-RIGHTS.md" in names

with TemporaryDirectory(prefix="a3-package-") as tmp:
    with ZipFile(zip_path) as z:
        z.extractall(tmp)
    site = Path(tmp) / packager.PREFIX
    assert site.is_dir()
    original = (site/"config/site.json").read_bytes()
    run(["npm", "test"], site)
    run(["npm", "run", "build"], site)
    default_html = (site/"dist/index.html").read_text()
    assert "Ruang Reka" in default_html
    assert 'noindex, nofollow' in default_html
    assert (site/"dist/configurator/index.html").is_file()
    # A second fully configured site must build cleanly without changing the source demo.
    shutil.copy2(site/"examples/studio-arunika.site.json",site/"config/site.json")
    run(["npm", "run", "build"], site)
    alternative = (site/"dist/index.html").read_text()
    assert "Studio Arunika" in alternative
    assert "Ruang Reka" not in alternative
    assert 'noindex, nofollow' in alternative
    assert "Kedai Pagi" in alternative
    assert len(json.loads((site/"config/site.json").read_text())["services"]["items"]) == 2
    (site/"config/site.json").write_bytes(original)

print("PASS A3: allowlisted deterministic ZIP, source scripts, no secrets/history, buyer npm test/build, alternate branding")
