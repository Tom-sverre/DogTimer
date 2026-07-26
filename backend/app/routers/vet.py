from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import VetAppointment
from ..schemas import VetCreate, VetOut
from typing import List
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/vet", tags=["vet"])


@router.get("/dog/{dog_id}", response_model=List[VetOut])
def list_vet(dog_id: int, db: Session = Depends(get_db)):
    return db.query(VetAppointment).filter(VetAppointment.dog_id == dog_id).order_by(VetAppointment.date).all()


@router.post("/", response_model=VetOut)
def create_vet(appt: VetCreate, db: Session = Depends(get_db)):
    db_appt = VetAppointment(**appt.model_dump())
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db_appt


@router.put("/{appt_id}", response_model=VetOut)
def update_vet(appt_id: int, appt: VetCreate, db: Session = Depends(get_db)):
    db_appt = db.query(VetAppointment).filter(VetAppointment.id == appt_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Time ikke funnet")
    for k, v in appt.model_dump().items():
        setattr(db_appt, k, v)
    db.commit()
    db.refresh(db_appt)
    return db_appt


@router.delete("/{appt_id}")
def delete_vet(appt_id: int, db: Session = Depends(get_db)):
    db_appt = db.query(VetAppointment).filter(VetAppointment.id == appt_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Time ikke funnet")
    db.delete(db_appt)
    db.commit()
    return {"ok": True}


@router.get("/dog/{dog_id}/export/ical")
def export_ical(dog_id: int, db: Session = Depends(get_db)):
    appointments = db.query(VetAppointment).filter(VetAppointment.dog_id == dog_id).all()
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DogTime//NO",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]
    for appt in appointments:
        dt = appt.date.strftime("%Y%m%dT%H%M%S")
        uid = str(uuid.uuid4())
        lines += [
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTART:{dt}",
            f"DTEND:{dt}",
            f"SUMMARY:{appt.title}",
            f"DESCRIPTION:{appt.notes or ''}",
            f"LOCATION:{appt.location or ''}",
            "END:VEVENT",
        ]
    lines.append("END:VCALENDAR")
    content = "\r\n".join(lines)
    return PlainTextResponse(content, media_type="text/calendar", headers={
        "Content-Disposition": "attachment; filename=veterinærtimer.ics"
    })
