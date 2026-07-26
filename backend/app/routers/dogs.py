import os
import shutil
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Dog
from ..schemas import DogCreate, DogOut
from typing import List

router = APIRouter(prefix="/api/dogs", tags=["dogs"])

KNOWLEDGE_BASE_PATH = os.getenv("KNOWLEDGE_BASE_PATH", "/app/data/knowledge")


@router.get("/", response_model=List[DogOut])
def list_dogs(db: Session = Depends(get_db)):
    return db.query(Dog).order_by(Dog.name).all()


@router.post("/", response_model=DogOut)
def create_dog(dog: DogCreate, db: Session = Depends(get_db)):
    db_dog = Dog(**dog.model_dump())
    db.add(db_dog)
    db.commit()
    db.refresh(db_dog)
    # Opprett knowledge-mappe for hunden
    dog_kb_path = os.path.join(KNOWLEDGE_BASE_PATH, str(db_dog.id))
    os.makedirs(dog_kb_path, exist_ok=True)
    return db_dog


@router.get("/{dog_id}", response_model=DogOut)
def get_dog(dog_id: int, db: Session = Depends(get_db)):
    dog = db.query(Dog).filter(Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Hund ikke funnet")
    return dog


@router.put("/{dog_id}", response_model=DogOut)
def update_dog(dog_id: int, dog: DogCreate, db: Session = Depends(get_db)):
    db_dog = db.query(Dog).filter(Dog.id == dog_id).first()
    if not db_dog:
        raise HTTPException(status_code=404, detail="Hund ikke funnet")
    for k, v in dog.model_dump().items():
        setattr(db_dog, k, v)
    db.commit()
    db.refresh(db_dog)
    return db_dog


@router.delete("/{dog_id}")
def delete_dog(dog_id: int, db: Session = Depends(get_db)):
    dog = db.query(Dog).filter(Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Hund ikke funnet")
    db.delete(dog)
    db.commit()
    # Slett knowledge-mappe
    dog_kb_path = os.path.join(KNOWLEDGE_BASE_PATH, str(dog_id))
    if os.path.exists(dog_kb_path):
        shutil.rmtree(dog_kb_path)
    return {"ok": True}
