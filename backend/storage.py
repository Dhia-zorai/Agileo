import json
import os
import shutil
from pathlib import Path
from threading import Lock
from uuid import uuid4


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Vercel fix: Use /tmp for data storage since the deployment dir is read-only
if os.environ.get("VERCEL"):
    DATA_DIR = Path("/tmp/data")
    if not DATA_DIR.exists():
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        # Copy initial data from original location if it exists
        ORIGINAL_DATA_DIR = BASE_DIR / "data"
        if ORIGINAL_DATA_DIR.exists():
            for f in ORIGINAL_DATA_DIR.glob("*.json"):
                shutil.copy(f, DATA_DIR / f.name)
else:
    DATA_DIR = BASE_DIR / "data"

_LOCK = Lock()


def _file_path(filename: str) -> Path:
    return DATA_DIR / filename


def read_json(filename: str) -> list:
    path = _file_path(filename)
    if not path.exists():
        return []

    with _LOCK:
        try:
            with path.open("r", encoding="utf-8") as file:
                data = json.load(file)
            return data if isinstance(data, list) else []
        except (json.JSONDecodeError, OSError):
            return []


def write_json(filename: str, data: list) -> None:
    path = _file_path(filename)
    path.parent.mkdir(parents=True, exist_ok=True)

    with _LOCK:
        with path.open("w", encoding="utf-8") as file:
            json.dump(data, file, indent=2, ensure_ascii=True)


def find_by_id(filename: str, item_id: str) -> dict | None:
    items = read_json(filename)
    return next((item for item in items if item.get("id") == item_id), None)


def generate_id() -> str:
    return str(uuid4())
