import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import dogs, sessions, feedings, vet, settings, knowledge

Base.metadata.create_all(bind=engine)

# Opprett knowledge-mappe
KNOWLEDGE_BASE_PATH = os.getenv("KNOWLEDGE_BASE_PATH", "/app/data/knowledge")
os.makedirs(KNOWLEDGE_BASE_PATH, exist_ok=True)

app = FastAPI(title="DogTime API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dogs.router)
app.include_router(sessions.router)
app.include_router(feedings.router)
app.include_router(vet.router)
app.include_router(settings.router)
app.include_router(knowledge.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
