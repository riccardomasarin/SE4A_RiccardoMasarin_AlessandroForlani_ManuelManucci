# NightOUT 🌙

**NightOUT** is a mobile-oriented nightlife platform that combines **event discovery, personalized recommendations, digital ticketing, pregame organization, venue management, and PR promotion tools** in one application.

The project was developed for **Software Engineering for Automation — Project A** at Politecnico di Milano.

## Main features

### Normal users
- Browse, search, and filter nightlife events.
- View event details, availability, prices, promotions, venue information, and friends attending.
- Receive recommendations based on music preferences, distance, saved events, booking history, popularity, and social activity.
- Request tickets, confirm reservations, join waiting lists, cancel tickets, and view digital confirmations.
- Create, join, and leave pregame rooms.
- Save events, manage friendships, edit the profile, and receive notifications.

### Venue managers
- Create, update, and delete events for managed venues.
- Manage event capacity, promotions, and venue information.
- Inspect ticket sales, attendance, waiting lists, and dashboard statistics.

### PR managers
- View assigned events and promotional codes.
- Track attributed ticket sales, revenue, discounts, and commissions.
- Inspect tickets generated through PR collaborations.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Axios |
| Backend | Java 21, Spring Boot, REST APIs, Spring Data JPA |
| Database | H2 in-memory database |
| Data exchange | JSON DTOs |

NightOUT follows a client-server and layered architecture:

```text
React / TypeScript frontend
            ↓ REST / JSON
Spring Boot controllers and services
            ↓
Data mediators and JPA repositories
            ↓
       H2 database
```

The ticket lifecycle uses the **State pattern**, while personalized recommendations combine multiple **Strategy** implementations.

## Repository structure

The runnable application is inside the `IMPLEMENTATION` directory:

```text
IMPLEMENTATION/
├── backend/
└── frontend/
```

## Prerequisites

Install:

- Git
- Java JDK 21
- Node.js 20.19.x, or 22.12.0+
- npm, included with Node.js
- A modern browser
- VS Code or another IDE, optional

Apache Maven does not need to be installed globally because the repository includes the Maven Wrapper.

## Quick start

### 1. Clone the repository

```powershell
git clone https://github.com/riccardomasarin/SE4A_RiccardoMasarin_AlessandroForlani_ManuelManucci.git
cd .\SE4A_RiccardoMasarin_AlessandroForlani_ManuelManucci
```

### 2. Start the backend

```powershell
cd .\IMPLEMENTATION\backend
java -version
.\mvnw.cmd spring-boot:run
```

On Windows, if `mvnw.cmd` fails before Maven starts, use the verified Git Bash fallback:

```powershell
& "$env:ProgramFiles\Git\bin\bash.exe" -lc './mvnw spring-boot:run'
```

The backend runs at:

```text
http://localhost:8080
```

Useful checks:

```text
http://localhost:8080/            → NightOUT backend is running
http://localhost:8080/api/health  → OK
http://localhost:8080/h2-console
```

### 3. Start the frontend

Open a second terminal:

```powershell
cd .\IMPLEMENTATION\frontend
npm.cmd ci
npm.cmd run dev
```

Then open:

```text
http://localhost:5173
```

Use `npm.cmd` on Windows when PowerShell blocks the `npm.ps1` script. On macOS and Linux, use `npm`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Normal User | `daniele.lorenzano@nightout.demo` | `user123` |
| Venue Manager | `matteo.conti@nightout.demo` | `venue123` |
| PR Manager | `filippo.scaranello@nightout.demo` | `pr123` |

These credentials are public demo accounts and must not be reused for real services.

## Core workflows

- A ticket is created as `PENDING`.
- After confirmation, it becomes `CONFIRMED` when capacity is available or `WAITING_LIST` when the event is full.
- When a confirmed ticket is cancelled, the first eligible waiting-list ticket is promoted automatically.
- Pregame rooms enforce capacity limits and prevent duplicate participation.
- Manager-created events use the same persistence layer and become visible in the normal-user event feed.
- PR promo codes attribute ticket activity, revenue, and commissions to assigned collaborations.

## Testing and verification

From the backend directory:

```powershell
.\mvnw.cmd test
```

Git Bash fallback:

```powershell
& "$env:ProgramFiles\Git\bin\bash.exe" -lc './mvnw test'
```

From the frontend directory:

```powershell
npm.cmd run build
npm.cmd run lint
```

Current project status:

- backend compilation and all 7 automated tests pass;
- frontend production build succeeds;
- frontend lint currently reports known errors;
- no frontend automated test suite is configured yet.

## Prototype notes

NightOUT is an academic prototype:

- it uses a realistic synthetic dataset loaded automatically at startup;
- the H2 database uses `create-drop`, so runtime changes disappear when the backend stops;
- the default startup includes 20 demo events;
- no external database, API key, Docker setup, or payment provider is required;
- ticket purchase, payment methods, QR payloads, commissions, check-ins, and support requests are simulated;
- authentication is lightweight and not production-ready;
- backend port `8080` and frontend port `5173` must be available;
- the frontend must be opened at `http://localhost:5173`, because the API client and CORS configuration are tied to that origin.

## Common issues

### `vite` is not recognized

Run the commands from `IMPLEMENTATION/frontend`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Do not install Vite globally.

### The frontend cannot contact the backend

Check that the backend is running:

```powershell
Invoke-RestMethod http://localhost:8080/api/health
```

Use exactly `http://localhost:5173`; another Vite port may be rejected by CORS.

### Data disappear after restarting

This is expected. NightOUT uses an in-memory H2 database and reloads the original demo dataset at every backend startup.

## Authors

- Riccardo Masarin
- Manuel Mannucci
- Alessandro Forlani
