# DogTime – Git Endringslogg

---

### Release 1.0.0 – Initial Release ###

# Prosjektoppsett
Initialisert git-repository og prosjektstruktur

```
git init
git add .gitignore
git commit -m "chore: initial project setup"
```

# Docker-konfigurasjon
Opprettet docker-compose.yml med backend og frontend services, port-konfigurasjon via .env

```
git add docker-compose.yml .env
git commit -m "chore: add docker-compose configuration with configurable port"
```

# Backend – FastAPI + SQLite
Fullstendig backend med FastAPI, SQLAlchemy og SQLite

Filer:
- backend/Dockerfile
- backend/requirements.txt
- backend/app/__init__.py
- backend/app/database.py – SQLite tilkobling og session factory
- backend/app/models.py – Dog, SleepSession, Feeding, VetAppointment, ActiveTimer
- backend/app/schemas.py – Pydantic schemas for alle modeller
- backend/app/main.py – FastAPI app med CORS og ruteregistrering

```
git add backend/
git commit -m "feat: add FastAPI backend with SQLite database and data models"
```

# Backend – API Routers
REST API endepunkter for alle ressurser

Filer:
- backend/app/routers/dogs.py – CRUD for hunder
- backend/app/routers/sessions.py – Søvn/våken-økter og timer start/stopp
- backend/app/routers/feedings.py – Måltidslogging
- backend/app/routers/vet.py – Veterinærtimer med iCal-eksport
- backend/app/routers/settings.py – Database eksport/import

```
git add backend/app/routers/
git commit -m "feat: add REST API routers for dogs, sessions, feedings, vet appointments and settings"
```

# Frontend – React + Vite
Fullstendig React frontend med norsk brukergrensesnitt

Filer:
- frontend/Dockerfile – Multi-stage build (Node → nginx)
- frontend/nginx.conf – Nginx med API proxy og SPA fallback
- frontend/package.json – React 18, React Router 6
- frontend/vite.config.js – Vite med dev-proxy
- frontend/index.html – HTML entry point

```
git add frontend/Dockerfile frontend/nginx.conf frontend/package.json frontend/vite.config.js frontend/index.html
git commit -m "chore: add frontend Docker and Vite configuration"
```

# Frontend – Kjernekomponenter
Filer:
- frontend/src/main.jsx – React root
- frontend/src/App.jsx – Routing
- frontend/src/index.css – Global CSS med design tokens og komponenter
- frontend/src/api.js – API klient

```
git add frontend/src/main.jsx frontend/src/App.jsx frontend/src/index.css frontend/src/api.js
git commit -m "feat: add React app shell, routing, global CSS and API client"
```

# Frontend – Sider
Alle applikasjonssider på norsk

Filer:
- frontend/src/pages/MainDashboard.jsx – Oversikt over alle hunder, legg til/rediger/slett
- frontend/src/pages/DogDashboard.jsx – Hunddashbord med timer, stats og aktivitetsoversikt
- frontend/src/pages/SleepTracker.jsx – Søvn/våken-timer med historikk og manuell redigering
- frontend/src/pages/FeedingLog.jsx – Måltidslogging med historikk
- frontend/src/pages/VetAppointments.jsx – Veterinærtimer med iCal-eksport til iPhone
- frontend/src/pages/Settings.jsx – Database eksport og import

```
git add frontend/src/pages/
git commit -m "feat: add all application pages (dashboard, sleep tracker, feeding log, vet appointments, settings)"
```

# Dokumentasjon
```
git add git.md
git commit -m "docs: add git changelog"
```

---

### Release 1.1.0 – Mobilstøtte ###

# PWA og iPhone-optimalisering
Lagt til Progressive Web App-støtte (manifest, hjemskjermikon) og full iOS Safari-optimalisering

Endringer:
- frontend/index.html – viewport-fit=cover, apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style: black-translucent, theme-color, manifest-link, apple-touch-icon
- frontend/public/manifest.json – PWA-manifest med navn, farger, display: standalone
- frontend/public/icon-192.png – App-ikon 192×192 (sky-blå med hvit pote)
- frontend/public/icon-512.png – App-ikon 512×512

```
git add frontend/index.html frontend/public/manifest.json frontend/public/icon-192.png frontend/public/icon-512.png
git commit -m "feat: add PWA manifest and iOS home screen support"
```

# Mobil CSS-optimalisering
Full responsiv design for telefoner med safe-area-insets og touch-forbedringer

Endringer i frontend/src/index.css:
- -webkit-tap-highlight-color: transparent på alle knapper
- touch-action: manipulation for å unngå 300ms delay
- min-height: 100dvh (dynamic viewport height) for iOS Safari
- font-size: 16px på alle inputs (hindrer iOS auto-zoom)
- env(safe-area-inset-bottom) på main-content, toast og modal
- Større touch-targets (min 44px) på btn-icon og btn-sm
- Forbedret modal-overlay for mobil (align-items: flex-end, border-radius topp)

```
git add frontend/src/index.css
git commit -m "feat: mobile CSS optimizations with safe-area-insets and touch improvements"
```

---

### Release 1.2.0 – iPad-støtte ###

# iPad-ikoner og manifest
Lagt til Apple touch icons for iPad Mini (152×152), iPad Air (167×167) og iPhone (180×180)

Endringer:
- frontend/index.html – apple-touch-icon for 152, 167, 180 og 512px
- frontend/public/manifest.json – orientation: any, alle ikonstørrelser inkludert
- frontend/public/icon-152.png – iPad-ikon 152×152
- frontend/public/icon-167.png – iPad Pro-ikon 167×167
- frontend/public/icon-180.png – iPhone-ikon 180×180

```
git add frontend/index.html frontend/public/manifest.json frontend/public/icon-152.png frontend/public/icon-167.png frontend/public/icon-180.png
git commit -m "feat: add iPad-specific touch icons and update PWA manifest for all screen sizes"
```

# iPad responsivt layout med sidebar-navigasjon
Tre breakpoints for iPad Mini, iPad Air/Pro og iPad Pro 12.9" i landskapsmodus

Endringer i frontend/src/index.css:
- .tablet-layout { display: contents } på mobil (usynlig wrapper)
- .tablet-main { display: contents } på mobil
- 768px (iPad Mini portrait): 3-kol hundegrid, 4-kol statsgrid, timer 72px, sentrert modal
- 1024px (iPad Air/Pro portrait + Mini landscape): sidebar aktivert, .sub-nav 210px bred og sticky, .tablet-main flex: 1, timer 84px, 4-kol hundegrid
- 1366px (iPad Pro 12.9" landscape): 5-kol hundegrid, timer 100px, max-width 1280px

```
git add frontend/src/index.css
git commit -m "feat: add responsive iPad layout with sidebar navigation at 1024px+"
```

# Tablet-layout wrappers i alle sideskomponenter
Lagt til tablet-layout og tablet-main wrappers i alle fire hundsider

Endringer:
- frontend/src/pages/DogDashboard.jsx – tablet-layout wrapper rundt sub-nav og innhold
- frontend/src/pages/SleepTracker.jsx – tablet-layout wrapper rundt sub-nav og innhold
- frontend/src/pages/FeedingLog.jsx – tablet-layout wrapper rundt sub-nav og innhold
- frontend/src/pages/VetAppointments.jsx – tablet-layout wrapper rundt sub-nav og innhold

```
git add frontend/src/pages/DogDashboard.jsx frontend/src/pages/SleepTracker.jsx frontend/src/pages/FeedingLog.jsx frontend/src/pages/VetAppointments.jsx
git commit -m "feat: add tablet-layout wrappers to all dog pages for iPad sidebar support"
```

---

### Release 1.3.0 – Sikkerhet og opprydding ###

# .gitignore
Lagt til .gitignore som ekskluderer sensitive filer og genererte artefakter

Filer som ignoreres:
- .env og .env.* (miljøvariabler med passord og porter)
- *.db, *.sqlite, *.sqlite3 (SQLite-databaser)
- db_data/ (Docker-volume for database)
- __pycache__/, .venv/, node_modules/, dist/ (genererte filer)
- .DS_Store, Thumbs.db (OS-filer)

```
git add .gitignore
git commit -m "chore: add .gitignore to exclude .env and SQLite database files"
```

---

### Release 2.0.0 – Knowledge Base ###

# Backend – Knowledge Base router og filsystem
Ny kunnskapsbase med artikler lagret som Markdown-filer med YAML frontmatter

Endringer:
- backend/app/routers/knowledge.py – Nytt CRUD API for artikler
- backend/app/schemas.py – KnowledgeArticleCreate, KnowledgeArticleUpdate, KnowledgeArticleOut
- backend/app/main.py – Registrert knowledge router
- backend/requirements.txt – Lagt til pyyaml og aiofiles

API-endepunkter:
- GET  /api/knowledge/{dog_id}                 – List artikler (søk/kategori-filter)
- GET  /api/knowledge/{dog_id}/{article_id}    – Hent enkeltartikkel
- POST /api/knowledge/{dog_id}                 – Opprett artikkel
- PUT  /api/knowledge/{dog_id}/{article_id}    – Oppdater artikkel
- DEL  /api/knowledge/{dog_id}/{article_id}    – Slett artikkel
- GET  /api/knowledge/{dog_id}/meta/categories – List kategorier
- GET  /api/knowledge/{dog_id}/meta/export     – Last ned ZIP-arkiv
- POST /api/knowledge/{dog_id}/meta/import     – Last opp ZIP-arkiv

```
git add backend/app/routers/knowledge.py backend/app/schemas.py backend/app/main.py backend/requirements.txt
git commit -m "feat: add Knowledge Base backend with Markdown file storage and ZIP export/import"
```

# Frontend – KnowledgeBase-side
Fullstendig kunnskapsbase UI med sidebar, søk, kategorier og YouTube-støtte

Endringer:
- frontend/src/pages/KnowledgeBase.jsx – Ny side med artikkelvisning og redigering
- frontend/package.json – Lagt til marked^12

Funksjoner:
- Markdown-rendering (tabeller, kodeblokker, bilder)
- Sidebar med kategorier og fritekst-søk
- YouTube shortcode [youtube:VIDEO_ID] og URL-felt
- Eksport/import av kunnskapsbase som ZIP
- Legg til, rediger og slett artikler med stikkord

```
git add frontend/src/pages/KnowledgeBase.jsx frontend/package.json
git commit -m "feat: add KnowledgeBase page with Markdown rendering, search and YouTube support"
```

# App.jsx – Ny rute for Knowledge Base
```
git add frontend/src/App.jsx
git commit -m "feat: add /dog/:dogId/kunnskap route for Knowledge Base"
```

# DogDashboard – Snarvei til Knowledge Base
```
git add frontend/src/pages/DogDashboard.jsx
git commit -m "feat: add Knowledge Base link to dog dashboard"
```

# .gitignore – Ekskluder data/-mappe
Lagt til data/ i .gitignore slik at Knowledge Base MD-filer og SQLite ikke havner i git

```
git add .gitignore
git commit -m "chore: exclude data/ directory (knowledge base articles and SQLite db) from git"
```

# Dokumentasjon
```
git add git.md
git commit -m "docs: update changelog for v2.0.0 Knowledge Base release"
```

---

### Release 2.1.0 – Bugfikser ###

# Fix: React-krasj ved oppstart – duplikat BrowserRouter
React Router v6 kaster en tom Error (uten melding) når to BrowserRouter er nestet.
main.jsx hadde allerede én BrowserRouter; App.jsx fikk ved en feil en til da Knowledge Base ble lagt til.

Endringer:
- frontend/src/App.jsx – Fjernet BrowserRouter import og wrapper-tag; beholdt kun Routes

```
git add frontend/src/App.jsx
git commit -m "fix: remove duplicate BrowserRouter from App.jsx causing silent React crash"
```

# Fix: KnowledgeBase – marked API og komponent-anti-mønster
marked v12 eksporterer et klasse-instans; man må kalle marked.parse() ikke marked() direkte.
SidebarContent var definert inne i KnowledgeBase render-funksjonen (re-mountet ved hvert render).

Endringer:
- frontend/src/pages/KnowledgeBase.jsx – marked() → marked.parse(), null-guard i MarkdownContent, SidebarContent flyttet ut som selvstendig Sidebar-komponent

```
git add frontend/src/pages/KnowledgeBase.jsx
git commit -m "fix: use marked.parse() instead of marked(), fix SidebarContent anti-pattern"
```

# Fix: Timer +2 timer offset – UTC datetime serialisering
Python naive datetime-objekter ble serialisert uten 'Z'-suffix. Nettleseren tolket dem som lokal tid (UTC+2 i Norge), mens Date.now() er UTC → 2 timers avvik.

Endringer:
- backend/app/schemas.py – Pydantic v2 PlainSerializer legger til 'Z' på alle datetime-felt i JSON (UTCDatetime og OptUTCDatetime annotated types)
- backend/app/routers/sessions.py – datetime.now() → datetime.utcnow() i stop_session

```
git add backend/app/schemas.py backend/app/routers/sessions.py
git commit -m "fix: serialize all datetimes with Z suffix, use utcnow() in stop_session"
```

# Fix: VetAppointments – tom side (API-import og feil feltnavngivning)
Siden importerte fra en ikke-eksisterende ../api-modul og brukte feil feltnavn.
Skrevet om til direkte fetch()-kall mot riktige endepunkter.

Endringer:
- frontend/src/pages/VetAppointments.jsx – Komplett omskriving: direkte fetch(), korrekte feltnavn (date, vet_name, location, notes), korrekte ruter (/dog/ i stedet for /hund/), kommende/tidligere-filter, iCal-eksport

```
git add frontend/src/pages/VetAppointments.jsx
git commit -m "fix: rewrite VetAppointments with direct fetch(), correct field names and routing"
```

# Fix: FeedingLog – tom side (API-import og feil feltnavngivning)
Samme problem som VetAppointments; importerte fra ../api og brukte CSS-variabler som ikke finnes.
Skrevet om til direkte fetch()-kall.

Endringer:
- frontend/src/pages/FeedingLog.jsx – Komplett omskriving: direkte fetch() mot /api/feedings/, korrekte feltnavn (time, food_type, amount, unit, notes), korrekte ruter (/dog/), gruppert historikk per dato, dagsoppsummering

```
git add frontend/src/pages/FeedingLog.jsx
git commit -m "fix: rewrite FeedingLog with direct fetch(), correct field names and routing"
```

# .gitignore – Oppdatert med data/ og kunnskapsbase-filer
Lagt til data/ slik at SQLite-databasen og Knowledge Base MD-filer ekskluderes fra git

```
git add .gitignore
git commit -m "chore: add data/ to .gitignore to exclude SQLite and knowledge base MD files"
```

# Dokumentasjon
```
git add git.md
git commit -m "docs: update changelog for v2.1.0 bugfix release"
```

---

### Release 2.2.0 – iPhone PWA safe area fix ###

# Fix: Navbar skjult bak iOS-statuslinje (CSS safe area insets)
Navbaren ble skjult bak klokke og batteri i Safari fordi appen bruker
viewport-fit=cover uten at CSS tok høyde for safe area insets.

Endringer:
- frontend/src/index.css – .navbar bruker nå env(safe-area-inset-top) som
  padding-top og min-height: calc(var(--nav-h) + env(safe-area-inset-top)).
  Lagt til env(safe-area-inset-left/right) for korrekt avstand i liggende modus.

```
git add frontend/src/index.css
git commit -m "fix: add iOS safe-area-inset-top to navbar so it clears the status bar"
```

# Fix: Navbar fortsatt skjult i standalone PWA-modus (hjemskjerm-app)
CSS-fiksen fungerte i Safari, men ikke når appen kjøres som PWA fra hjemskjermen.
Årsak: black-translucent statuslinje overlapper innholdet i standalone-modus uten
at env(safe-area-inset-top) ble respektert konsekvent på tvers av iOS-versjoner.

Endringer:
- frontend/index.html – apple-mobile-web-app-status-bar-style endret fra
  black-translucent til black. Statuslinjen får nå solid svart bakgrunn og
  innholdet starter automatisk under den uten CSS-beregninger.

NB: Krever at appen slettes og legges til på nytt fra hjemskjermen etter rebuild,
da PWA-en cacher den gamle versjonen.

```
git add frontend/index.html
git commit -m "fix: change status bar style to black so navbar is visible in standalone PWA mode"
```

# Dokumentasjon
```
git add git.md
git commit -m "docs: update changelog for v2.2.0 iPhone PWA safe area fix"
```
