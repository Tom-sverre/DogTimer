# 🐾 DogTime

> **Note:** The application interface is in Norwegian.

A self-hosted dog management system built with Docker Compose. Track your dog's sleep, feeding, vet appointments, and more — with support for multiple dogs and no login required.

![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)
![Database](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🏠 Main Dashboard
- Overview of all registered dogs
- Quick navigation to each dog's individual dashboard

### ⏱️ Sleep & Wake Tracking
- One-click start/stop timer for sleep and wake sessions
- Live timer display while a session is running
- Automatic date (today) used by default
- Manually add or edit sessions in the past or today
- Session history with full list view

### 🍽️ Feeding Log
- Log meals with type and amount
- View feeding history per dog

### 🏥 Vet Appointments
- Track upcoming and past vet appointments
- Export appointments to your iPhone Calendar via `.ics` / iCal

### 📚 Knowledge Base
- Per-dog knowledge base with Markdown articles
- Organize by categories and tags
- Full-text search across title, content, tags and category
- Embed YouTube videos inline using `[youtube:VIDEO_ID]` shortcodes or a URL field
- Render tables, code blocks, images and more with full Markdown support
- Export knowledge base as ZIP (per dog)
- Import knowledge base from ZIP (restore backup)

### ⚙️ Settings
- Export the entire database (`.db` file) for backup
- Import a previously exported database
- Configurable port via `.env`

---

## 🗂️ Project Structure

```
dogtime/
├── docker-compose.yml
├── .env                    ← Set PORT here
├── .gitignore
├── git.md                  ← Changelog with git commands
├── data/                   ← Not tracked in git
│   ├── dogtime.db          ← SQLite database
│   └── knowledge/
│       └── {dog_id}/       ← Markdown articles per dog
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       └── routers/
│           ├── dogs.py
│           ├── sessions.py
│           ├── feedings.py
│           ├── vet.py
│           ├── settings.py
│           └── knowledge.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── MainDashboard.jsx
            ├── DogDashboard.jsx
            ├── SleepTracker.jsx
            ├── FeedingLog.jsx
            ├── VetAppointments.jsx
            ├── KnowledgeBase.jsx
            └── Settings.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/dogtime.git
   cd dogtime
   ```

2. **Configure port (optional)**

   Edit the `.env` file to set your preferred port:

   ```env
   PORT=8080
   ```

   The default port is `8080` if not specified.

3. **Build and start the application**

   ```bash
   docker-compose up --build -d
   ```

4. **Open in your browser**

   ```
   http://localhost:8080
   ```

That's it — no database setup, no login, no configuration needed beyond the port.

### Stopping the Application

```bash
docker-compose down
```

### Updating

```bash
git pull
docker-compose up --build -d
```

---

## 💾 Backup & Restore

DogTime stores everything in a single SQLite database file (`data/dogtime.db`) and Markdown files for the knowledge base (`data/knowledge/`). The `data/` folder is **not tracked in git**.

### Export database
Go to **Settings** in the app and click **Export database**. This downloads the `.db` file to your computer.

### Import database
Go to **Settings** and click **Import database**, then select a previously exported `.db` file.

### Knowledge Base backup (per dog)
Inside a dog's Knowledge Base, use the **Export ZIP** button to download all articles. Use **Import ZIP** to restore.

---

## 📅 iCal / iPhone Calendar Export

Vet appointments can be exported as `.ics` files, compatible with Apple Calendar, Google Calendar, and most other calendar apps.

1. Go to a dog's **Vet** section
2. Click the export button on any appointment
3. Open the downloaded `.ics` file on your iPhone to add it to your calendar

---

## 🔌 API Overview

The backend is a REST API built with FastAPI. Interactive documentation is available at:

```
http://localhost:8080/api/docs
```

### Key endpoints

| Resource | Base path |
|---|---|
| Dogs | `/api/dogs` |
| Sleep sessions | `/api/sessions` |
| Feedings | `/api/feedings` |
| Vet appointments | `/api/vet` |
| Knowledge Base | `/api/knowledge/{dog_id}` |
| Settings (export/import) | `/api/settings` |

### Knowledge Base article format

Articles are stored as Markdown files with YAML frontmatter:

```markdown
---
title: Maltipoo characteristics
category: Breed
tags: maltipoo, health, coat
youtube_urls:
  - https://youtu.be/VIDEO_ID
created_at: '2026-07-26T10:00:00'
updated_at: '2026-07-26T10:00:00'
---

# Maltipoo

Content with full Markdown formatting here...

[youtube:VIDEO_ID]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python · FastAPI · SQLAlchemy · PyYAML |
| Frontend | React 18 · Vite · react-markdown |
| Database | SQLite |
| Deployment | Docker · Docker Compose |
| Web server | Nginx |

---

## 🌐 Language

The user interface is entirely in **Norwegian (Bokmål)**. The API and codebase use English naming conventions.

---

## 📋 Changelog

See [`git.md`](./git.md) for a full changelog with git commands, organized by release.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
