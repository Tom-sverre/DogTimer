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

---

### Release 2.2.1 – Bugfix: Database eksport/import ###

# Fix: Feil URL for database eksport og import
Frontend kalte `/api/settings/export` og `/api/settings/import`, mens backend-endepunktene heter `/api/settings/export-db` og `/api/settings/import-db`. Eksport returnerte 404 og ble tolket som "database ikke funnet".

Endringer:
- frontend/src/api.js – `/api/settings/export` → `/api/settings/export-db`
- frontend/src/api.js – `/api/settings/import` → `/api/settings/import-db`

```
git add frontend/src/api.js
git commit -m "fix: correct export-db and import-db API URLs in api.js"
git add git.md
git commit -m "docs: update changelog for v2.2.1 database export/import fix"
```

---

### Release 2.3.0 – Import: statusindikatorer og feilhåndtering ###

# Fix: Import viste ingen tilbakemelding og feil ble ikke fanget opp
To rotproblemer ble identifisert:
1. Backend returnerte HTTP 400/500 med `{"detail": "..."}` som frontend aldri sjekket (sjekket kun `result.ok`)
2. SQLAlchemy hadde åpne tilkoblinger til gammel database – ny DB ble skrevet til disk men ikke tatt i bruk uten container-restart

# Backend – Validering, engine.dispose() og backup
Endringer i `backend/app/routers/settings.py`:
- Importerer `engine` fra `..database` og kaller `engine.dispose()` før skriving, slik at SQLAlchemy slipper gammel DB og ny tas i bruk umiddelbart
- Validerer at opplastet fil er en gyldig SQLite-database (sjekker magic bytes `SQLite format 3\x00`)
- Tar automatisk backup til `dogtime.db.bak` før overskriving
- Gjenoppretter backup og kaller `engine.dispose()` på nytt ved feil
- Returnerer filstørrelse i KB i svaret
- Bruker `raise HTTPException` med korrekte HTTP-statuskoder (400/500) i stedet for å returnere JSON-feil

```
git add backend/app/routers/settings.py
git commit -m "fix: validate SQLite magic bytes, dispose engine on import, auto-backup before overwrite"
```

# Frontend – Steg-for-steg statusvisning i Settings
Endringer i `frontend/src/pages/Settings.jsx`:
- Fjernet avhengighet av `importDb` fra `../api` – bruker nå direkte `fetch()` med `res.ok`-sjekk slik at HTTP-feil fra serveren kastes riktig
- Ny `importStatus`-state med tre tilstander: `uploading` / `success` / `error`
- Synlig statuskort under importknappen med farge og ikon per tilstand (blå/grønn/rød)
- Viser filnavn og størrelse under opplasting
- Viser serverens feilmelding (`detail`) direkte ved feil
- "Last inn siden på nytt"-knapp vises inline etter vellykket import
- Knappen disables og viser "⏳ Importerer…" under pågående opplasting
- Versjonsnummer i Om-seksjonen oppdatert til 2.2.1

```
git add frontend/src/pages/Settings.jsx
git commit -m "feat: add step-by-step import status indicator with error display in Settings"
git add git.md
git commit -m "docs: update changelog for v2.3.0 import status and error handling"
```

---

### Release 2.3.1 – Fix: Import blokkert av Safari PWA ###

# Rotårsak: window.confirm() blokkert i Safari standalone-modus
Safari blokkerer `window.confirm()` når appen kjøres som PWA fra hjemskjermen (standalone-modus) — dialogen vises ikke og returnerer alltid `false`. Import ble avbrutt stille uten noen tilbakemelding til bruker.

# Fix: Erstattet confirm() med innebygd bekreftelsesdialog
Endringer i `frontend/src/pages/Settings.jsx`:
- Fjernet `window.confirm()` helt
- Tostegs-flyt: (1) bruker velger fil → gult bekreftelseskort med filnavn/størrelse og "Ja, importer"/"Avbryt"-knapper vises, (2) bruker bekrefter → opplasting starter og statuskort oppdateres
- `accept` utvidet til `.db,.sqlite,.sqlite3` for bredere kompatibilitet
- Versjonsnummer oppdatert til 2.3.0

# Fix: nginx client_max_body_size
Endringer i `frontend/nginx.conf`:
- Lagt til `client_max_body_size 50M` (nginx-default er 1 MB og ville blokkert større databaser)
- Lagt til `proxy_request_buffering off` på API-proxyen for bedre strømming av store filer

```
git add frontend/src/pages/Settings.jsx frontend/nginx.conf
git commit -m "fix: replace window.confirm() with inline UI dialog to fix Safari PWA import block"
git add git.md
git commit -m "docs: update changelog for v2.3.1 Safari PWA import fix"
```

---

### Release 2.4.0 – Søvnlogg: varighetsformat og dagsoppsummering ###

# Varighetsvisning med timer i parentes
Varigheten på søvn/våken-økter vises nå med minutter og timer for bedre lesbarhet.

Endringer i `frontend/src/pages/SleepTracker.jsx`:
- Ny hjelpefunksjon `formatDuration(minutes)`: returnerer `"X min"` under 60 min,
  `"X min (Yt Zm)"` ved hele og halve timer, `"X min (Yt)"` ved eksakt time
- Varighetsfeltet i økt-listeelementer bruker nå `formatDuration()` i stedet for
  den rå `${dur} min`-strengen

# Dagsoppsummering – total søvntid 00:00–23:59
Ny oppsummeringskort over øktlisten som viser total søvntid for valgt dag.

Endringer i `frontend/src/pages/SleepTracker.jsx`:
- Ny hjelpefunksjon `calcDailySleepMinutes(sessions, dateStr)`:
  summer alle søvn-økter klippet til daggrensene 00:00–23:59 (håndterer
  aktive pågående økter ved å bruke `new Date()` som slutt)
- Vises kun når det finnes minst én søvn-økt for datoen
- Kortet viser dato ("i dag" / faktisk dato), ikon 🌙 og formatert total søvntid

```
git add frontend/src/pages/SleepTracker.jsx
git commit -m "feat: show duration as minutes + hours in parentheses, add daily sleep summary card"
git add git.md
git commit -m "docs: update changelog for v2.4.0 sleep log improvements"
```

---

### Release 2.4.1 – Fix: Søvnoppsummering teller ikke søvn over midnatt ###

# Rotårsak: dag-klipping ekskluderte søvnøkter som startet etter midnatt
`calcDailySleepMinutes` klippet alle varigheter til 00:00–23:59 for den valgte datoen.
Søvnøkter som starter etter midnatt (f.eks. 00:50–04:52 på neste dag), men som API-en
returnerer som del av nattens søvnsesjon, ble fullstendig utelatt fra summen.

# Fix: Summer alle søvnøkter som vises i listen
Endringer i `frontend/src/pages/SleepTracker.jsx`:
- `calcDailySleepMinutes` tar ikke lenger `dateStr` som argument
- Fjernet dag-klipping (dayStart / dayEnd / clippedStart / clippedEnd)
- Summerer nå varigheten av ALLE søvnøkter i `sessions`-arrayen – de øktene
  API-en faktisk returnerer for den valgte datoen, inkludert nattøkter over midnatt
- Aktive (pågående) søvnøkter teller frem til `new Date()` som før
- Fjernet "(00:00–23:59)" fra kortets undertekst

```
git add frontend/src/pages/SleepTracker.jsx
git commit -m "fix: sum all returned sleep sessions for daily total, not just 00:00-23:59 window"
git add git.md
git commit -m "docs: update changelog for v2.4.1 midnight sleep summary fix"
```

---

### Release 2.4.2 – Fix: Redigeringsskjema viste UTC-tid i stedet for lokal tid ###

# Rotårsak: .toISOString().slice(0,16) gir UTC, ikke lokal tid
`datetime-local`-inputene ble populert med `.toISOString().slice(0, 16)` som alltid
returnerer UTC-tid. I Oslo (UTC+2) vises dermed 22:50 i skjemaet for en sesjon
som i listen korrekt vises som 00:50. Selve lagringen var riktig.

# Fix: Ny hjelpefunksjon toLocalInput()
Endringer i `frontend/src/pages/SleepTracker.jsx`:
- Ny funksjon `toLocalInput(dateStr)` bygger en `YYYY-MM-DDTHH:MM`-streng fra
  lokale klokkeslett-komponenter (getFullYear, getMonth, getDate, getHours, getMinutes)
- `openNew()` bruker `toLocalInput(new Date())` for starttidspunkt
- `openEdit()` bruker `toLocalInput(s.start_time)` og `toLocalInput(s.end_time)`
- Lagringen via `new Date(form.start_time).toISOString()` fungerer fortsatt korrekt
  fordi nettleseren tolker en `datetime-local`-verdi uten tidssone som lokal tid

```
git add frontend/src/pages/SleepTracker.jsx
git commit -m "fix: use local time in datetime-local inputs instead of UTC (toLocalInput helper)"
git add git.md
git commit -m "docs: update changelog for v2.4.2 timezone fix in edit form"
```

---

### Release 2.5.0 – Ukegraf i søvnlogg ###

# Ukentlig søvngraf (Man–Søn)
Ny søylediagram over søvnloggen som viser total søvntid per dag for gjeldende uke.

Endringer i `frontend/src/pages/SleepTracker.jsx`:

Nye hjelpefunksjoner:
- `localDateStr(date?)` – returnerer lokal dato som `YYYY-MM-DD` (erstatter `.toISOString().slice(0,10)` som ga UTC-dato)
- `getWeekDays(dateStr)` – returnerer liste med 7 datostrenger fra mandag til søndag i uken som inneholder `dateStr`
- `sleepMinutesForDay(allSessions, dateStr)` – summerer søvnminutter for én dag ved å klippe alle søvnøkter til daggrensene 00:00–23:59 (håndterer sesjoner som spenner over midnatt korrekt)

Ny komponent `WeeklyChart`:
- Rendres øverst på siden, over dagsoppsummeringen
- Viser 7 søyler (Man–Tir–Ons–Tor–Fre–Lør–Søn) med høyde proporsjonal til søvnminutter
- Referansemaks: maks av ukens verdier og 480 min (8t) – grafen skalerer dynamisk
- Verdi vises over hver søyle (format: `6t 30m`, `45m` eller `–` ved null)
- Valgt dag: søylen er fullt opplyst (`--accent2`) med svak glow-ring
- Andre dager med data: 45 % opacity av accent2-fargen
- Dager uten data: tynn grå strek
- Fremtidige dager: 35 % opacity, ikke-klikkbare
- Dagen i dag: prikk under dag-etiketten
- Klikk på en søyle bytter dato-filteret til den aktuelle dagen

Øvrige forbedringer:
- `dateFilter` og "i dag"-sjekken bruker nå `localDateStr()` i stedet for `.toISOString().slice(0,10)` for å unngå UTC-datoforskyvning ved midnatt

```
git add frontend/src/pages/SleepTracker.jsx
git commit -m "feat: add weekly sleep bar chart (Mon-Sun) with clickable day navigation"
git add git.md
git commit -m "docs: update changelog for v2.5.0 weekly sleep chart"
```
