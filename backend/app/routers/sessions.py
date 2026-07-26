from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import SleepSession
from ..schemas import SessionCreate, SessionOut
from typing import List, Optional
from datetime import datetime, date

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("/dog/{dog_id}", response_model=List[SessionOut])
def list_sessions(dog_id: int, date_filter: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(SleepSession).filter(SleepSession.dog_id == dog_id)
    if date_filter:
        try:
            d = datetime.strptime(date_filter, "%Y-%m-%d").date()
            q = q.filter(
                SleepSession.start_time >= datetime.combine(d, datetime.min.time()),
                SleepSession.start_time < datetime.combine(d, datetime.max.time())
            )
        except ValueError:
            pass
    return q.order_by(desc(SleepSession.start_time)).all()


@router.get("/active/{dog_id}", response_model=Optional[SessionOut])
def get_active_session(dog_id: int, db: Session = Depends(get_db)):
    session = (
        db.query(SleepSession)
        .filter(SleepSession.dog_id == dog_id, SleepSession.end_time.is_(None))
        .order_by(desc(SleepSession.start_time))
        .first()
    )
    return session


@router.post("/", response_model=SessionOut)
def create_session(session: SessionCreate, db: Session = Depends(get_db)):
    db_session = SleepSession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.put("/{session_id}", response_model=SessionOut)
def update_session(session_id: int, session: SessionCreate, db: Session = Depends(get_db)):
    db_session = db.query(SleepSession).filter(SleepSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Økt ikke funnet")
    for k, v in session.model_dump().items():
        setattr(db_session, k, v)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.patch("/{session_id}/stop", response_model=SessionOut)
def stop_session(session_id: int, db: Session = Depends(get_db)):
    db_session = db.query(SleepSession).filter(SleepSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Økt ikke funnet")
    db_session.end_time = datetime.utcnow()
    db.commit()
    db.refresh(db_session)
    return db_session


@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    db_session = db.query(SleepSession).filter(SleepSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Økt ikke funnet")
    db.delete(db_session)
    db.commit()
    return {"ok": True}
