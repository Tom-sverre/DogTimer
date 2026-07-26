import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/settings", tags=["settings"])

DATABASE_PATH = "/app/data/dogtime.db"
DATA_PATH = "/app/data"


@router.get("/export-db")
def export_database():
    if not os.path.exists(DATABASE_PATH):
        return {"error": "Database ikke funnet"}
    return FileResponse(
        DATABASE_PATH,
        media_type="application/octet-stream",
        filename="dogtime-backup.db"
    )


@router.post("/import-db")
async def import_database(file: UploadFile = File(...)):
    content = await file.read()
    with open(DATABASE_PATH, "wb") as f:
        f.write(content)
    return {"ok": True, "message": "Database importert. Start appen på nytt for full effekt."}
