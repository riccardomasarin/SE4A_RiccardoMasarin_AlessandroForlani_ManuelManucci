# NightOUT

NightOUT is a full-stack Software Engineering project for a mobile-first nightlife discovery and management platform.

## Structure

- `backend/`: Java 21 Spring Boot backend.
- `frontend/`: React, Vite, and TypeScript frontend.
- `docs/`: requirements, design document, API notes, traceability, and UI mockups.

## Run locally

Start the backend from the project root:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend runs at `http://localhost:8080`. Useful checks are:

```text
http://localhost:8080/
http://localhost:8080/api/health
http://localhost:8080/h2-console
```

Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo authentication

NightOUT uses a deliberately small authentication flow for the academic demo:

1. The login page at `/login` sends the entered credentials to `POST /api/auth/login`.
2. The backend finds the existing `AppUser` by email, checks its demo password, and derives the public authentication role from the stored `UserRole`.
3. The frontend stores only `authenticated`, `profileId`, `displayName`, `email`, and the public role in `localStorage` under `nightout-auth-session`. The password is never stored in the browser.
4. On refresh, the frontend reloads the existing profile through `GET /api/users/{profileId}` and verifies that its persisted role still matches the stored session.
5. Logout removes the stored session. Protected pages then redirect to `/login`.

The role mapping is:

| Stored profile role | Login response role | Home route | Allowed application area |
|---|---|---|---|
| `NORMAL_USER` | `USER` | `/feed` | User feed, events, tickets, pregames, notifications, and account pages |
| `VENUE_MANAGER` | `VENUE` | `/manager` | Existing venue-manager dashboard and `/manager/*` pages |
| `PR_MANAGER` | `PR` | `/pr` | Existing PR dashboard and `/pr/*` pages |

An authenticated profile that opens a route for another role is redirected to its own home route. The legacy `/role` URL redirects to `/login`; the existing `/api/demo/session` endpoint is retained for backward compatibility but is no longer used by the frontend.

### Demo credentials

| Role | Existing profile | Email | Password |
|---|---|---|---|
| `USER` | Daniele Lorenzano | `daniele.lorenzano@nightout.demo` | `user123` |
| `VENUE` | Matteo Conti | `matteo.conti@nightout.demo` | `venue123` |
| `PR` | Filippo Scaranello | `filippo.scaranello@nightout.demo` | `pr123` |

Passwords are stored as plain text only because this is an in-memory academic demo with no production authentication infrastructure. This implementation does not use Spring Security, password hashing, server sessions, JWTs, or backend authorization tokens and must not be used as production authentication. The client-side route guard improves the demo flow but is not a security boundary; the current APIs still identify profiles through request IDs.

### Authentication implementation files

New files:

- `backend/src/main/java/com/nightout/backend/controller/AuthController.java`: exposes the login endpoint.
- `backend/src/main/java/com/nightout/backend/dto/LoginRequestDto.java`: validates the credential request.
- `backend/src/main/java/com/nightout/backend/dto/LoginResponseDto.java`: returns only the session fields needed by the frontend.
- `backend/src/main/java/com/nightout/backend/service/AuthenticationService.java`: checks credentials against the existing profile repository and maps roles.
- `backend/src/test/java/com/nightout/backend/AuthControllerTests.java`: covers valid roles, invalid credentials, and password omission.

Modified files:

- `backend/src/main/java/com/nightout/backend/entity/AppUser.java`: adds the demo-only password field to the existing profile entity.
- `backend/src/main/java/com/nightout/backend/repository/AppUserRepository.java`: adds case-insensitive email lookup.
- `backend/src/main/java/com/nightout/backend/data/WorkbookSeedData.java`, `backend/src/main/java/com/nightout/backend/data/DemoDataLoader.java`, and `backend/src/main/resources/demo/nightout-workbook-seed.json`: attach three demo credentials to existing profiles.
- `frontend/src/App.tsx` and `frontend/src/session.tsx`: persist/restore authentication, provide login/logout, redirect by role, and protect routes.
- `frontend/src/api/nightoutApi.ts` and `frontend/src/types/nightout.ts`: add typed login/profile API support.
- `frontend/src/pages/RoleSelectionPage.tsx`: replaces manual role selection with the credential form while retaining the existing component file.
- `frontend/src/components/AppShell.tsx`, `frontend/src/pages/ProfilePage.tsx`, and `frontend/src/pages/PrAccountPage.tsx`: connect existing logout actions to the authenticated session.
- `frontend/src/App.css`: styles the login form using the current visual system.
- `docs/api-overview.md` and this `README.md`: document the endpoint, flow, roles, credentials, routes, limitations, and implementation files.

### Test commands

From the project root:

```powershell
cd backend
.\mvnw.cmd test

cd ..\frontend
npm install
npm run build
npm run lint
```

## Workbook-derived demo data

The workbook `Template_raccolta_dati_NightOut.xlsx` is the authoritative source for the fields it contains. It was converted once into `backend/src/main/resources/demo/nightout-workbook-seed.json`; the application does not parse Excel at runtime. `DemoDataLoader` reads that classpath JSON when the in-memory H2 database is empty and then adds the existing event, ticket, pregame, promotion, social, notification, sales-channel, and return-transport demo data.

Imported complete rows:

| Sheet | Complete rows processed | Runtime records created |
|---|---:|---:|
| `UTENTI_20` | 20 | 20 normal-user profiles |
| `VENUE_30` | 30 | 30 venues and 19 deduplicated venue managers |
| `PR_10` | 10 | 10 PR profiles |
| `ASSEGNAZIONI_PR` | 30 | 0 assignments; all 30 event references are unresolved |

The existing application values already match the workbook profile types: `NORMAL_USER`, `PR_MANAGER`, and `VENUE_MANAGER`. All four workbook venue categories map directly to the existing `VenueCategory` enum. Musical preferences remain in the application's existing string-set representation, including `R&B` and `Live music`.

Workbook IDs are retained as deterministic seed keys without changing the generated numeric JPA ID schema. Profiles and managers are deduplicated by normalized email. Venues are deduplicated by workbook venue ID. Assignment rows are deduplicated by assignment ID, validate their PR and venue references, and resolve events by stable numeric ID when supplied or by exact normalized title plus venue. Discounts remain percentages, commissions remain monetary numbers, booleans are JSON booleans, birth dates use `YYYY-MM-DD`, and assignment timestamps use ISO local date-time strings.

Fields not represented by the current entities remain in the converted JSON where useful for traceability but are not forced into the schema. Existing values absent from the workbook are preserved for matched baseline records, including privacy defaults, existing profile avatars, existing venue image fallbacks, and venue contact/social fields. Event dates, times, prices, capacity, inventory, categories, attendees, reviews, and other event metadata are unchanged.

### Unresolved PR-event references

The workbook has no standalone event table, and none of these exact title-and-venue pairs exists in the five-event demo dataset. They are intentionally not materialized as `PrEventAssignment` rows because the mandatory event date, time, pricing, capacity, and inventory data is unavailable.

| Assignment | Event reference | Workbook venue |
|---|---|---|
| A001 | Saturday Glam Night | V014 / Hollywood Rythmoteque |
| A002 | Friday Urban Beat & House | V020 / Tocqueville 13 |
| A003 | Brera Wine & Tasting Night | V027 / N'Ombra de Vin |
| A004 | Indie & Pop Thursday | V021 / Rocket Club |
| A005 | University Summer Splash | V015 / Old Fashion |
| A006 | Indie Pub Quiz & Aperitivo | V004 / GhePensiMI |
| A007 | Reggaeton Garden Sunset | V015 / Old Fashion |
| A008 | Exclusive Sunset & Urban Beats | V017 / Justme Milano |
| A009 | Elegance Saturday & Black Music | V018 / Il Gattopardo Milano |
| A010 | Milano Rock Festival | V012 / Alcatraz |
| A011 | Jazz & Gourmet Night | V022 / Blue Note Milano |
| A012 | Custom Night & House Drinks | V028 / Deus Cafe Isola |
| A013 | Underground Techno Marathon | V016 / Magazzini Generali |
| A014 | Electronic Sound Experience | V019 / Amnesia Milano |
| A015 | Indie Rock Sunday Live | V024 / Santeria Toscana 31 |
| A016 | Black Music & Groove Session | V023 / Biko Club |
| A017 | Historic Negroni Sbagliato Night | V001 / Bar Basso |
| A018 | Craft Beer & Vinyl Market | V024 / Santeria Toscana 31 |
| A019 | Rooftop Pool Sunset Lounge | V025 / Ceresio 7 |
| A020 | Duomo View Sunset Aperitivo | V026 / Terrazza Aperol |
| A021 | Fashion Week Closing Party | V014 / Hollywood Rythmoteque |
| A022 | Stand-Up Comedy & Beers | V004 / GhePensiMI |
| A023 | Pop & Rainbow Aperidisco | V005 / NoLoSo |
| A024 | Courtyard Chill & Acoustic Live | V006 / Hug |
| A025 | Big Live Concert Series | V013 / Fabrique |
| A026 | Open Air Summer Festival | V011 / Circolo Magnolia |
| A027 | All Night Long Disco Revolution | V012 / Alcatraz |
| A028 | Gin Craft Tasting & DJ Set | V029 / The Botanical Club |
| A029 | Navigli Master Mixology Evening | V030 / Rita & Cocktails |
| A030 | Techno Warehouse Rave | V013 / Fabrique |

The two pre-existing assignments for the retained demo events remain unchanged so the PR dashboard and ticket flows continue to work.

## Local event images

Nine supplied JPG files were copied without conversion to `frontend/public/images/events`. The frontend now reads each event's existing API `imageUrl` field, with the previous image helper retained only as a fallback. This prevents the event assets from being reused as venue images.

Filenames were sorted alphabetically before assigning the first five to the five existing events:

| Event | Local image |
|---|---|
| Urban Beats | `after-exams-party.jpg` |
| Electronic Sessions | `covermln-1.jpg` |
| Midnight House | `disco-2000s-revival.jpg` |
| Neon Pop | `international-students-night.jpg` |
| Late Night Flow | `navigli-house-session.jpg` |

No image is reused because there are more supplied images than existing events. The remaining four local event images are available for future event records: `queer-club-night.jpg`, `reggaeton-latin-urban-night.jpg`, `techno-warehouse.jpg`, and `tempio-del-futuro-perduto-1-club-milano-xceed-efaa.jpg`.

## Manual inspection commands

With both applications running:

```powershell
Invoke-RestMethod http://localhost:8080/api/health
Invoke-RestMethod "http://localhost:8080/api/demo/users?role=NORMAL_USER"
Invoke-RestMethod "http://localhost:8080/api/demo/users?role=PR_MANAGER"
Invoke-RestMethod "http://localhost:8080/api/demo/users?role=VENUE_MANAGER"
Invoke-RestMethod http://localhost:8080/api/events
Invoke-RestMethod http://localhost:8080/api/partner-bars
```

The authenticated demo profiles are Daniele Lorenzano, Filippo Scaranello, and Matteo Conti; their credentials are listed in the demo authentication section above.
