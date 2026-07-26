import os
import uuid
import yaml
import shutil
import tempfile
import zipfile
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse

from ..schemas import KnowledgeArticleCreate, KnowledgeArticleUpdate, KnowledgeArticleOut

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

KNOWLEDGE_BASE_PATH = os.getenv("KNOWLEDGE_BASE_PATH", "/app/data/knowledge")

# ── Frontmatter helpers ────────────────────────────────────────────────────────

def parse_md(filepath: str) -> Optional[dict]:
    """Parse a Markdown file with YAML frontmatter. Returns dict with metadata + content."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            raw = f.read()
    except FileNotFoundError:
        return None

    metadata = {}
    content = raw

    if raw.startswith("---"):
        parts = raw.split("---", 2)
        if len(parts) >= 3:
            try:
                metadata = yaml.safe_load(parts[1]) or {}
            except yaml.YAMLError:
                metadata = {}
            content = parts[2].lstrip("\n")

    return {"metadata": metadata, "content": content}


def dump_md(filepath: str, metadata: dict, content: str):
    """Write a Markdown file with YAML frontmatter."""
    fm = yaml.dump(metadata, allow_unicode=True, default_flow_style=False, sort_keys=False)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"---\n{fm}---\n\n{content}")


# ── Path helpers ───────────────────────────────────────────────────────────────

def dog_path(dog_id: int) -> str:
    path = os.path.join(KNOWLEDGE_BASE_PATH, str(dog_id))
    os.makedirs(path, exist_ok=True)
    return path


def article_path(dog_id: int, article_id: str) -> str:
    return os.path.join(dog_path(dog_id), f"{article_id}.md")


def build_article_out(filepath: str) -> Optional[KnowledgeArticleOut]:
    parsed = parse_md(filepath)
    if parsed is None:
        return None
    m = parsed["metadata"]
    article_id = os.path.splitext(os.path.basename(filepath))[0]
    youtube_urls = m.get("youtube_urls") or []
    if isinstance(youtube_urls, str):
        youtube_urls = [u.strip() for u in youtube_urls.split(",") if u.strip()]
    return KnowledgeArticleOut(
        id=article_id,
        title=str(m.get("title", "Uten tittel")),
        category=str(m.get("category", "Generelt")),
        tags=str(m.get("tags", "")),
        content=parsed["content"],
        youtube_urls=youtube_urls,
        created_at=str(m.get("created_at", "")),
        updated_at=str(m.get("updated_at", "")),
    )


# ── List all articles ──────────────────────────────────────────────────────────
@router.get("/{dog_id}", response_model=List[KnowledgeArticleOut])
def list_articles(
    dog_id: int,
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
):
    base = dog_path(dog_id)
    articles = []
    for filename in os.listdir(base):
        if not filename.endswith(".md"):
            continue
        article = build_article_out(os.path.join(base, filename))
        if article is None:
            continue
        if category and article.category.lower() != category.lower():
            continue
        if q:
            ql = q.lower()
            if (
                ql not in article.title.lower()
                and ql not in article.content.lower()
                and ql not in article.tags.lower()
                and ql not in article.category.lower()
            ):
                continue
        articles.append(article)

    articles.sort(key=lambda a: a.updated_at, reverse=True)
    return articles


# ── Get single article ─────────────────────────────────────────────────────────
@router.get("/{dog_id}/meta/categories")
def list_categories(dog_id: int):
    base = dog_path(dog_id)
    categories = set()
    for filename in os.listdir(base):
        if not filename.endswith(".md"):
            continue
        article = build_article_out(os.path.join(base, filename))
        if article:
            categories.add(article.category)
    return sorted(list(categories))


@router.get("/{dog_id}/meta/export")
def export_knowledge(dog_id: int):
    base = dog_path(dog_id)
    tmp = tempfile.mktemp(suffix=".zip")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zf:
        for filename in os.listdir(base):
            if filename.endswith(".md"):
                zf.write(os.path.join(base, filename), arcname=filename)
    return FileResponse(
        tmp,
        media_type="application/zip",
        filename=f"knowledge-hund-{dog_id}.zip",
    )


@router.post("/{dog_id}/meta/import")
async def import_knowledge(dog_id: int, file: UploadFile = File(...)):
    base = dog_path(dog_id)
    content = await file.read()
    tmp = tempfile.mktemp(suffix=".zip")
    with open(tmp, "wb") as f:
        f.write(content)
    try:
        with zipfile.ZipFile(tmp, "r") as zf:
            for name in zf.namelist():
                if name.endswith(".md") and "/" not in name:
                    zf.extract(name, base)
    finally:
        os.remove(tmp)
    return {"ok": True, "message": "Knowledge base importert"}


@router.get("/{dog_id}/{article_id}", response_model=KnowledgeArticleOut)
def get_article(dog_id: int, article_id: str):
    filepath = article_path(dog_id, article_id)
    article = build_article_out(filepath)
    if article is None:
        raise HTTPException(status_code=404, detail="Artikkel ikke funnet")
    return article


# ── Create article ─────────────────────────────────────────────────────────────
@router.post("/{dog_id}", response_model=KnowledgeArticleOut)
def create_article(dog_id: int, body: KnowledgeArticleCreate):
    article_id = str(uuid.uuid4())
    filepath = article_path(dog_id, article_id)
    now = datetime.now().isoformat()
    metadata = {
        "title": body.title,
        "category": body.category,
        "tags": body.tags or "",
        "youtube_urls": body.youtube_urls or [],
        "created_at": now,
        "updated_at": now,
    }
    dump_md(filepath, metadata, body.content)
    return build_article_out(filepath)


# ── Update article ─────────────────────────────────────────────────────────────
@router.put("/{dog_id}/{article_id}", response_model=KnowledgeArticleOut)
def update_article(dog_id: int, article_id: str, body: KnowledgeArticleUpdate):
    filepath = article_path(dog_id, article_id)
    existing = build_article_out(filepath)
    if existing is None:
        raise HTTPException(status_code=404, detail="Artikkel ikke funnet")
    metadata = {
        "title": body.title if body.title is not None else existing.title,
        "category": body.category if body.category is not None else existing.category,
        "tags": body.tags if body.tags is not None else existing.tags,
        "youtube_urls": body.youtube_urls if body.youtube_urls is not None else existing.youtube_urls,
        "created_at": existing.created_at,
        "updated_at": datetime.now().isoformat(),
    }
    content = body.content if body.content is not None else existing.content
    dump_md(filepath, metadata, content)
    return build_article_out(filepath)


# ── Delete article ─────────────────────────────────────────────────────────────
@router.delete("/{dog_id}/{article_id}")
def delete_article(dog_id: int, article_id: str):
    filepath = article_path(dog_id, article_id)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Artikkel ikke funnet")
    os.remove(filepath)
    return {"ok": True}
