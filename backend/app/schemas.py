from pydantic import BaseModel, ConfigDict
from pydantic.functional_serializers import PlainSerializer
from datetime import datetime
from typing import Optional, List, Annotated


# ── UTC datetime-typer som alltid serialiseres med 'Z'-suffix ─────────────────
def _fmt_utc(v: datetime) -> str:
    return v.strftime('%Y-%m-%dT%H:%M:%S') + 'Z'

UTCDatetime    = Annotated[datetime,          PlainSerializer(_fmt_utc, when_used='json')]
OptUTCDatetime = Annotated[Optional[datetime], PlainSerializer(
    lambda v: _fmt_utc(v) if v else None, when_used='json'
)]


# ── Dog ───────────────────────────────────────────────────────────────────────
class DogCreate(BaseModel):
    name: str
    breed: Optional[str] = None
    birth_date: Optional[str] = None
    photo_url: Optional[str] = None


class DogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    breed: Optional[str]
    birth_date: Optional[str]
    photo_url: Optional[str]
    created_at: UTCDatetime


# ── Sleep Session ─────────────────────────────────────────────────────────────
class SessionCreate(BaseModel):
    dog_id: int
    type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    notes: Optional[str] = None


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dog_id: int
    type: str
    start_time: UTCDatetime
    end_time: OptUTCDatetime
    notes: Optional[str]
    created_at: UTCDatetime


# ── Feeding ───────────────────────────────────────────────────────────────────
class FeedingCreate(BaseModel):
    dog_id: int
    time: datetime
    food_type: Optional[str] = None
    amount: Optional[float] = None
    unit: Optional[str] = None
    notes: Optional[str] = None


class FeedingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dog_id: int
    time: UTCDatetime
    food_type: Optional[str]
    amount: Optional[float]
    unit: Optional[str]
    notes: Optional[str]
    created_at: UTCDatetime


# ── Vet Appointment ───────────────────────────────────────────────────────────
class VetCreate(BaseModel):
    dog_id: int
    title: str
    date: datetime
    vet_name: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class VetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dog_id: int
    title: str
    date: UTCDatetime
    vet_name: Optional[str]
    location: Optional[str]
    notes: Optional[str]
    created_at: UTCDatetime


# ── Knowledge Base ────────────────────────────────────────────────────────────
class KnowledgeArticleCreate(BaseModel):
    title: str
    category: str
    tags: Optional[str] = ""
    content: str
    youtube_urls: Optional[List[str]] = []


class KnowledgeArticleUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    content: Optional[str] = None
    youtube_urls: Optional[List[str]] = None


class KnowledgeArticleOut(BaseModel):
    id: str
    title: str
    category: str
    tags: str
    content: str
    youtube_urls: List[str]
    created_at: str
    updated_at: str
