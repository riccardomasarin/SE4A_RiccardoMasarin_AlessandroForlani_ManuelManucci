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

The normal-user mock session starts with Daniele Lorenzano, the PR session with Filippo Scaranello, and the venue-manager session with Matteo Conti.
