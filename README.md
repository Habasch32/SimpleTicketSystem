# TicketApp

Ein einfaches Jira-ähnliches Ticketsystem mit Kanban-Board, Drag & Drop, Prioritäten, Labels, Kommentaren und Benutzer-Authentifizierung.

## Features

- **Kanban-Board** mit 5 Spalten: Backlog → To Do → In Progress → Review → Done
- **Drag & Drop** zum Verschieben von Tickets zwischen Spalten (mit optimistischen Updates)
- **Prioritäten**: Critical, High, Medium, Low
- **Labels**: Farbige Tags zur Kategorisierung (bug, feature, enhancement, docs, urgent)
- **Ticket-Detail**: Inline-Editing, Status/Priorität/Assignee-Auswahl
- **Kommentare**: Kommentare auf Tickets schreiben und eigene löschen
- **Benutzer-Authentifizierung**: Registrierung, Login, JWT-basiert (7 Tage)

## Tech Stack

| Bereich   | Technologie                              |
|-----------|------------------------------------------|
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS |
| Routing   | React Router v6                          |
| Drag & Drop | @hello-pangea/dnd                      |
| Backend   | Node.js, Express, TypeScript             |
| Datenbank | SQLite (better-sqlite3)                  |
| Auth      | JWT + bcrypt                             |
| Deployment | Docker, Nginx                           |

## Deployment

### Produktion — Docker (empfohlen)

Für den Betrieb auf einem Server wird ausschließlich Docker benötigt. Node.js muss **nicht** installiert sein.

**Voraussetzungen:** Docker, Docker Compose

```bash
# Container bauen und starten
docker-compose up -d

# Nach Code-Änderungen neu bauen
docker-compose up -d --build

# Logs verfolgen
docker-compose logs -f

# Stoppen (Daten bleiben erhalten)
docker-compose down
```

Die App ist unter **http://localhost** erreichbar.

Vor dem Produktionseinsatz den `JWT_SECRET` in [docker-compose.yml](docker-compose.yml) auf einen sicheren Wert ändern:

```yaml
environment:
  JWT_SECRET: "dein-langer-zufaelliger-geheimer-schluessel"
```

Die SQLite-Datenbank wird in einem Docker Volume (`db_data`) gespeichert und bleibt beim Neustart erhalten.

### Lokale Entwicklung

`npm run dev` wird **nur** für die lokale Entwicklung benötigt — es startet Vite mit Hot Reload und den Backend-Server mit Auto-Restart bei Dateiänderungen. Für Produktion **nicht** verwenden.

**Voraussetzungen:** Node.js 18+, npm 9+

```bash
npm install   # einmalig
npm run dev   # startet Frontend (:5173) + Backend (:3001) parallel
```

## Projektstruktur

```
ticket-app/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── index.ts          # Express-Server
│       ├── db.ts             # SQLite-Initialisierung & Schema
│       ├── middleware/
│       │   └── auth.ts       # JWT-Middleware
│       └── routes/
│           ├── auth.ts       # POST /api/auth/register, /login, GET /me
│           ├── tickets.ts    # CRUD + PATCH /move
│           ├── comments.ts   # GET/POST/DELETE Kommentare
│           ├── labels.ts     # GET/POST Labels
│           └── users.ts      # GET Benutzer
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── context/
        │   ├── AuthContext.tsx   # Auth-State & JWT
        │   └── BoardContext.tsx  # Kanban-State & Drag-Drop-Logik
        ├── components/
        │   ├── board/            # Board, Column, TicketCard
        │   ├── ticket/           # TicketModal
        │   └── comments/         # CommentList, CommentForm
        └── pages/
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            └── BoardPage.tsx
```

## API-Übersicht

| Methode | Endpoint                          | Beschreibung                  |
|---------|-----------------------------------|-------------------------------|
| POST    | `/api/auth/register`              | Konto erstellen               |
| POST    | `/api/auth/login`                 | Einloggen                     |
| GET     | `/api/auth/me`                    | Aktuellen User abrufen        |
| GET     | `/api/tickets`                    | Alle Tickets                  |
| POST    | `/api/tickets`                    | Ticket erstellen              |
| PATCH   | `/api/tickets/:id`                | Ticket bearbeiten             |
| PATCH   | `/api/tickets/:id/move`           | Ticket verschieben (DnD)      |
| DELETE  | `/api/tickets/:id`                | Ticket löschen                |
| GET     | `/api/tickets/:id/comments`       | Kommentare laden              |
| POST    | `/api/tickets/:id/comments`       | Kommentar hinzufügen          |
| DELETE  | `/api/tickets/:id/comments/:cid`  | Kommentar löschen             |
| GET     | `/api/labels`                     | Alle Labels                   |
| GET     | `/api/users`                      | Alle Benutzer                 |
