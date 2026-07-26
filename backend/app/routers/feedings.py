from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import Feeding
from ..schemas import FeedingCreate, FeedingOut
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/feedings", tags=["feedings"])


@router.get("/dog/{dog_id}", response_model=List[FeedingOut])
def list_feedings(dog_id: int, date_filter: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Feeding).filter(Feeding.dog_id == dog_id)
    if date_filter:
        try:
            d = datetime.strptime(date_filter, "%Y-%m-%d").date()
            q = q.filter(
                Feeding.time >= datetime.combine(d, datetime.min.time()),
                Feeding.time < datetime.combine(d, datetime.max.time())
            )
        except ValueError:
            pass
    return q.order_by(desc(Feeding.time)).all()


@router.post("/", response_model=FeedingOut)
def create_feeding(feeding: FeedingCreate, db: Session = Depends(get_db)):
    db_feeding = Feeding(**feeding.model_dump())
    db.add(db_feeding)
    db.commit()
    db.refresh(db_feeding)
    return db_feeding


@router.put("/{feeding_id}", response_model=FeedingOut)
def update_feeding(feeding_id: int, feeding: FeedingCreate, db: Session = Depends(get_db)):
    db_f = db.query(Feeding).filter(Feeding.id == feeding_id).first()
    if not db_f:
        raise HTTPException(status_code=404, detail="Måltid ikke funnet")
    for k, v in feeding.model_dump().items():
        setattr(db_f, k, v)
    db.commit()
    db.refresh(db_f)
    return db_f


@router.delete("/{feeding_id}")
def delete_feeding(feeding_id: int, db: Session = Depends(get_db)):
    db_f = db.query(Feeding).filter(Feeding.id == feeding_id).first()
    if not db_f:
        raise HTTPException(status_code=404, detail="Måltid ikke funnet")
    db.delete(db_f)
    db.commit()
    return {"ok": True}
