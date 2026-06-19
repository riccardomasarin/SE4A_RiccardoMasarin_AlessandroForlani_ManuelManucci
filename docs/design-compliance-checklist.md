# NightOUT Design Compliance Checklist

This checklist compares the current prototype against the design document and the UI mockups in `docs/ui-mockups`.

Status legend:

- **Compliant**: current implementation matches the design well enough for the demo.
- **Partially compliant**: the main idea exists, but details or important flows are missing.
- **Not compliant**: design expectation is not implemented.

## Architecture And Backend Design

| Design point | Current implementation | Status | Concrete fixes |
|---|---|---|---|
| Client-server architecture with REST communication | React frontend calls Spring Boot REST APIs under `http://localhost:8080/api`. | Compliant | Keep all new frontend data access in the API client. |
| Layered backend with controllers, services, repositories, entities, and DTOs | Backend has separate `controller`, `service`, `repository`, `entity`, and `dto` packages. | Compliant | Continue avoiding business logic in controllers. |
| H2 database for first demo version | H2 is configured with create-drop schema and H2 console. | Compliant | Add documented H2 console URL and sample users in README later. |
| CORS for Vite frontend | CORS allows `http://localhost:5173` for `/api/**`. | Compliant | Include any non-API health paths only if frontend starts calling them. |
| DTO boundary between frontend and JPA entities | Controllers return DTOs via mapper/service methods. | Compliant | Avoid returning entities directly in future endpoints. |
| Auth/User component | Mock session and users exist, but no real auth or registration. | Partially compliant | Keep mock login for demo, but document it and add simple role validation for manager actions. |
| Event Management component | Event browse/detail and manager event creation exist. Update/edit is missing. | Partially compliant | Add update event, capacity update, and event form UI. |
| Event Search/Filtering component | Basic filtering by city/area/genre/price/featured/sort exists. | Partially compliant | Add date and venue category filters, plus a richer frontend filter panel. |
| Reservation/Ticketing component | Ticket request, cancellation, capacity, waiting list, and promotion logic exist. | Partially compliant | Add frontend cancellation and service tests for edge cases. |
| Pregame Room component | Browse/create/join/leave endpoints exist; frontend browse/create/join exists. | Partially compliant | Add leave UI, full-room disabled state, and detail page. |
| Social Interaction component | Social entities and seed data exist. No social API or UI. | Not compliant | Add social service/controller and friends-attending event summary. |
| Notification component | Notification endpoints and generated ticket/pregame notifications exist. | Partially compliant | Add dedicated notification page and mark-as-read UI. |
| Popularity/Recommendation component | Popularity score and dashboard metrics exist. Recommendation logic is not implemented. | Partially compliant | Add simple recommendation endpoint using genre, popularity, and ticket history. |
| Data Access component | Repository layer exists for each major entity. | Compliant | Consider a small aggregation service instead of a broad mediator unless the design requires explicit pattern evidence. |

## Design Pattern Compliance

| Design pattern | Expected use | Current implementation | Status | Concrete fixes |
|---|---|---|---|---|
| State pattern | Reservation lifecycle states and transitions. | `TicketStatus` enum plus service conditionals. | Not compliant | Add a small documented transition helper or state policy class for valid status changes. |
| Observer pattern | Notifications generated from events such as reservations, waiting list changes, and social activity. | Services call `NotificationService` directly. | Partially compliant | Add a lightweight domain-event/notification publisher abstraction, or document direct service notification as demo simplification. |
| Strategy pattern | Filtering, popularity, and recommendation algorithms should be extensible. | Filtering and sorting are inline in `EventService`; no recommendation strategies. | Not compliant | Extract filter/recommendation strategies only after completing required filters. |
| Mediator-like coordination | Coordinate repository interactions through a mediator/service. | Services coordinate repositories directly. | Partially compliant | Either add a small dashboard/statistics aggregation service as mediator evidence or update design docs to match implementation. |

## UI And Mockup Compliance

| UI area | Mockup/design expectation | Current implementation | Status | Concrete fixes |
|---|---|---|---|---|
| Mobile-first visual style | Dark, modern, mobile-first nightlife UI with bottom navigation. | Frontend uses a dark mobile-first layout and bottom navigation. | Compliant | Continue testing at narrow mobile widths. |
| Discovery feed | City/search/filter header, event cards, featured carousel/rails, quick actions, save controls. | Discovery feed has event rails/cards and genre chips. Search and save are not functional. | Partially compliant | Wire search, add richer filters, and show saved state on cards. |
| Event detail | Hero image, title, location/rating, chips, action buttons, info cards, vibe/playlist-like sections. | Event detail has hero-like layout, core info, chips, actions, promotions, pregames, and transport link. | Partially compliant | Add functional save/share/contact actions or hide inactive controls; improve social and capacity sections. |
| Ticket view | Digital ticket card with confirmed status, ticket details, access info, and QR. | Ticket purchase page renders a digital ticket with QR-style placeholder and status. | Compliant | Add ticket cancellation/status changes in ticket list. |
| Pregame list | Active rooms and partner venue/bar context. | Pregame page lists rooms and can create/join. Partner bars are in backend/API client but not shown. | Partially compliant | Show partner bars and event-linked room grouping. |
| Pregame detail | Dedicated pregame detail with host, participants, meeting info, and join action. | No dedicated pregame detail route/page. | Not compliant | Add `/pregames/:roomId` page using `GET /api/pregames/{roomId}`. |
| Account/profile | Profile stats, settings rows, user information, saved/active activity. | Profile page exists with basic user summary, tickets link, and notification preview. | Partially compliant | Add saved events, preferences, pregames, friends, and better stats. |
| Syncride/return transport | Placeholder return transport integration. | Transport page uses return transport endpoint and presents options. | Compliant | Make external-placeholder nature explicit in docs/UI copy. |
| PR/venue dashboard | PR dashboard with metrics, search, filter chips, active ticket/table/pregame sections, performance tabs, and seller channels. | Dashboard has metrics, sales channels, insights, and managed events. Missing search/tabs/active sections. | Partially compliant | Add tabs/chips/search and separate ticket/table/pregame panels. |
| Venue manager event creation | Form for title, venue, date/time, genre, dress code, price, capacity, description, promotions. | Backend create endpoint exists, but no frontend form. | Not compliant | Add manager create/edit event page. |
| Notifications | Notification list with read/unread handling. | Profile preview only; no notification page/read action. | Partially compliant | Add notification route and mark-read interaction. |
| Social/activity | Friends/followed users, activity feed, friends attending events. | No social frontend. | Not compliant | Add simple seeded friends and event attendance sections. |

## Testing And Quality Compliance

| Quality point | Current implementation | Status | Concrete fixes |
|---|---|---|---|
| Backend compiles | Previous backend build/test passed in the prototype workflow. | Compliant | Keep running Maven build after backend changes. |
| Frontend builds | Previous Vite build passed in the prototype workflow. | Compliant | Keep running `npm.cmd run build` after frontend changes. |
| Backend unit tests | No focused service tests were identified for reservation/pregame edge cases. | Not compliant | Add tests for ticket capacity, duplicate prevention, cancellation, and waiting-list promotion. |
| API integration tests | No API-level tests were identified. | Not compliant | Add Spring Boot controller tests for main endpoints. |
| Frontend interaction tests | No frontend tests were identified. | Not compliant | Add lightweight component/e2e smoke tests for feed, ticket purchase, and dashboard. |
| Manual demo readiness | Core flows can be manually exercised with seed data. | Partially compliant | Add a manual test script with URLs, demo users, and expected results. |

## Overall Assessment

The prototype is a solid first demo implementation for browsing events, viewing event details, purchasing mock tickets, joining pregames, viewing return transport placeholders, and showing a PR/venue dashboard. The largest compliance gaps are not in the basic architecture; they are in the missing social layer, incomplete filtering, incomplete manager CRUD, incomplete notification UI, and the design-pattern evidence requested by the design document.

The safest next phase is to complete existing flows before adding new concepts: wire saved events, finish filters, expose cancellation/leave/read actions, and add manager event editing. After that, add social and recommendation features with small, testable service classes.
