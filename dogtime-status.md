# DogTime – Prosjektstatus

**Versjon:** 1.0.0  
**Status:** ✅ Komplett og klar til bruk  
**Sist oppdatert:** 2026-07-26

## Teknisk stack
- **Backend:** FastAPI (Python) + SQLite via SQLAlchemy
- **Frontend:** React 18 + Vite, tilpasset CSS (ingen ekstern framework)
- **Deploy:** Docker Compose (port konfigurerbar via `.env`)

## Filstruktur
```
dogtime/
├── docker-compose.yml
├── .env                  ← Endre PORT her
├── git.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py, database.py, models.py, schemas.py
│       └── routers/
│           ├── dogs.py, sessions.py, feedings.py, vet.py, settings.py
└── frontend/
    ├── Dockerfile, nginx.conf
    └── src/
        └── pages/
            ├── MainDashboard.jsx   – Alle hunder
            ├── DogDashboard.jsx    – Per-hund dashbord + timer
            ├── SleepTracker.jsx    – Søvn/våken sporing
            ├── FeedingLog.jsx      – Måltidslogging
            ├── VetAppointments.jsx – Veterinærtimer + iCal
            └── Settings.jsx        – DB eksport/import
```

## Kjøring
```bash
# Start appen
cd dogtime
docker-compose up --build -d

# Endre port: rediger .env
PORT=8080
```

## Funksjoner implementert
- ✅ Støtte for flere hunder
- ✅ Start/stopp timer (søvn og våken), vises live
- ✅ Manuell redigering av historiske økt
- ✅ Måltidslogging med typer og mengder
- ✅ Veterinærtimer med iCal-eksport til iPhone
- ✅ Database eksport/import i innstillinger
- ✅ Norsk brukergrensesnitt
- ✅ Ingen innlogging kreves