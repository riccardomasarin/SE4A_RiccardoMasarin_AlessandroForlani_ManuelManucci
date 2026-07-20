# NightOUT API Overview

Base URL for frontend calls:

```text
http://localhost:8080/api
```

The backend also exposes root health endpoints outside the `/api` base path.

## Endpoint Summary

| Method | Endpoint | Purpose | Request shape | Response shape | Frontend usage |
|---|---|---|---|---|---|
| GET | `/` | Basic backend health/root check. | None. | Plain health/status text. | Not used by frontend. |
| GET | `/api/health` | API health check. | None. | Plain health/status text. | Not used by frontend. |
| POST | `/api/auth/login` | Authenticate an existing seeded profile and derive its role. | JSON: `email`, `password`. | `LoginResponseDto`; `401 Unauthorized` for invalid credentials. | Login page and session setup. |
| GET | `/api/demo/users` | List demo users, optionally filtered by role. | Query: `role` optional. | `UserDto[]`. | Not currently used by page code. Useful for demos/manual testing. |
| GET | `/api/demo/session` | Return a seeded demo user for the legacy mock-role flow. | Query: `role` optional. | `UserDto`. | Retained for backward compatibility; the frontend no longer calls it. |
| GET | `/api/users` | List users, optionally by role. | Query: `role` optional. | `UserDto[]`. | Not currently used by frontend pages. |
| GET | `/api/users/{userId}` | Get one user. | Path: `userId`. | `UserDto`. | Not currently used by frontend pages. |
| GET | `/api/users/{userId}/profile` | Get profile summary for a user. | Path: `userId`. | `ProfileDto` with user details, counters, saved events, tickets, and notifications. | `ProfilePage`. |
| GET | `/api/events` | Browse/search event summaries. | Query: `city`, `area`, `genre`, `maxPrice`, `featured`, `sort` optional. | `EventSummaryDto[]`. | `DiscoveryFeedPage`, `TransportPage`. |
| GET | `/api/events/popular` | Get popular event summaries. | None. | `EventSummaryDto[]`. | API exists but current frontend does not call it directly. |
| GET | `/api/events/{eventId}` | Get full event detail. | Path: `eventId`. | `EventDetailDto`. | `EventDetailPage`, `TicketPurchasePage`. |
| GET | `/api/events/{eventId}/return-transport` | Get return transport options for an event. | Path: `eventId`. | `ReturnTransportDto[]`. | `TransportPage`. |
| GET | `/api/partner-bars` | List partner bars/venues. | None. | `VenueDto[]`. | API client has a method, but no current page renders it. |
| GET | `/api/users/{userId}/tickets` | List a user's tickets/reservations. | Path: `userId`. | `TicketDto[]`. | `TicketsPage`. |
| POST | `/api/tickets` | Request a ticket/reservation. | JSON `TicketRequestDto`: `userId`, `eventId`, optional `ticketType`, optional `salesChannel`. | `TicketDto` with status such as confirmed or waiting list. | `TicketPurchasePage`. |
| DELETE | `/api/tickets/{ticketId}` | Cancel a ticket/reservation. | Path: `ticketId`. | Updated `TicketDto`. | Not currently used by frontend. |
| GET | `/api/pregames` | List pregame rooms, optionally filtered by event. | Query: `eventId` optional. | `PregameRoomDto[]`. | `PregamePage`. |
| GET | `/api/events/{eventId}/pregames` | List pregames linked to an event. | Path: `eventId`. | `PregameRoomDto[]`. | Not directly called; event detail receives linked pregames through event detail DTO. |
| GET | `/api/pregames/{roomId}` | Get one pregame room. | Path: `roomId`. | `PregameRoomDto`. | Not currently used because there is no pregame detail page. |
| POST | `/api/pregames` | Create a pregame room. | JSON `CreatePregameRoomDto`: `title`, `eventId`, `hostId`, meeting place/time, max participants, description, image, partner flag. | `PregameRoomDto`. | `PregamePage` demo create action. |
| POST | `/api/pregames/{roomId}/join` | Join a pregame room. | Path: `roomId`; query: `userId`. | Updated `PregameRoomDto`. | `PregamePage`. |
| POST | `/api/pregames/{roomId}/leave` | Leave a pregame room. | Path: `roomId`; query: `userId`. | Updated `PregameRoomDto`. | Not currently used by frontend. |
| GET | `/api/users/{userId}/notifications` | List user notifications. | Path: `userId`. | `NotificationDto[]`. | Not directly called; notifications are currently shown through profile data. |
| PATCH | `/api/notifications/{notificationId}/read` | Mark a notification as read. | Path: `notificationId`. | Updated `NotificationDto`. | Not currently used by frontend. |
| GET | `/api/manager/dashboard` | Get PR/venue manager dashboard metrics. | Query: `managerId`, `eventId` optional. | `ManagerDashboardDto` with metrics, channels, insight cards, and managed events. | `ManagerDashboardPage`. |
| GET | `/api/manager/venues` | List venues managed by a manager. | Query: `managerId`. | `VenueDto[]`. | Not currently used by frontend. |
| POST | `/api/manager/events` | Create an event for a managed venue. | JSON `CreateEventDto`: `title`, `description`, `venueId`, `managerId`, `startsAt`, `musicGenre`, `dressCode`, `ageRestriction`, `entryCondition`, `price`, `vipPrice`, `capacity`, `imageUrl`. | `EventDetailDto`. | Not currently used by frontend. |

## Main DTO Shapes

The exact Java DTO classes are the source of truth. These summaries describe the fields the frontend currently depends on.

### `LoginResponseDto`

```json
{
  "authenticated": true,
  "profileId": 1,
  "displayName": "Daniele Lorenzano",
  "email": "daniele.lorenzano@nightout.demo",
  "role": "USER"
}
```

Login response roles are `USER`, `VENUE`, and `PR`, mapped from the existing `NORMAL_USER`, `VENUE_MANAGER`, and `PR_MANAGER` profile roles. The response never includes the password.

### `UserDto`

```json
{
  "id": 1,
  "name": "Sofia",
  "email": "sofia@example.com",
  "role": "NORMAL_USER",
  "city": "Milano",
  "verified": true,
  "points": 120,
  "avatarUrl": "https://...",
  "musicPreferences": ["TECHNO", "HOUSE"]
}
```

### `EventSummaryDto`

```json
{
  "id": 1,
  "title": "Neon Pulse",
  "venueName": "Crush Club",
  "city": "Milano",
  "area": "Navigli",
  "startsAt": "2026-06-20T23:00:00",
  "musicGenre": "TECHNO",
  "price": 18.0,
  "entryCondition": "Ticket",
  "capacity": 250,
  "confirmedTickets": 120,
  "availableSpots": 130,
  "imageUrl": "https://...",
  "popularityScore": 92,
  "featured": true,
  "promotionLabels": ["Early bird"]
}
```

### `EventDetailDto`

```json
{
  "id": 1,
  "title": "Neon Pulse",
  "description": "Late night event description",
  "venue": {},
  "startsAt": "2026-06-20T23:00:00",
  "musicGenre": "TECHNO",
  "dressCode": "Smart casual",
  "ageRestriction": "21+",
  "entryCondition": "Ticket",
  "price": 18.0,
  "vipPrice": 45.0,
  "capacity": 250,
  "confirmedTickets": 120,
  "availableSpots": 130,
  "popularityScore": 92,
  "atmosphereScore": 88,
  "musicScore": 94,
  "drinkScore": 81,
  "lineScore": 70,
  "featured": true,
  "imageUrl": "https://...",
  "promotions": [],
  "pregames": [],
  "returnTransport": []
}
```

### `TicketRequestDto`

```json
{
  "userId": 1,
  "eventId": 1,
  "ticketType": "STANDARD",
  "salesChannel": "NightOUT App"
}
```

### `TicketDto`

```json
{
  "id": 1,
  "code": "NO-1001",
  "userId": 1,
  "userName": "Sofia",
  "eventId": 1,
  "eventTitle": "Neon Pulse",
  "venueName": "Crush Club",
  "venueAddress": "Via Roma 12",
  "eventStartsAt": "2026-06-20T23:00:00",
  "status": "CONFIRMED",
  "ticketType": "STANDARD",
  "pricePaid": 18.0,
  "createdAt": "2026-06-19T10:15:00",
  "salesChannel": "NightOUT App",
  "qrPayload": "NIGHTOUT:NO-1001"
}
```

### `PregameRoomDto`

```json
{
  "id": 1,
  "title": "Warm-up at Bar Basso",
  "eventId": 1,
  "eventTitle": "Neon Pulse",
  "hostId": 1,
  "hostName": "Sofia",
  "meetingLocation": "Bar Basso",
  "meetingTime": "2026-06-20T21:30:00",
  "maxParticipants": 8,
  "currentParticipants": 5,
  "description": "Meet before the club",
  "imageUrl": "https://...",
  "officialPartner": true,
  "participants": []
}
```

### `CreatePregameRoomDto`

```json
{
  "title": "Warm-up at Bar Basso",
  "eventId": 1,
  "hostId": 1,
  "meetingLocation": "Bar Basso",
  "meetingTime": "2026-06-20T21:30:00",
  "maxParticipants": 8,
  "description": "Meet before the club",
  "imageUrl": "https://...",
  "officialPartner": true
}
```

### `ReturnTransportDto`

```json
{
  "id": 1,
  "provider": "Syncride",
  "label": "Shared return ride",
  "pickupTime": "2026-06-21T04:15:00",
  "pickupPoint": "Crush Club",
  "destinationArea": "Porta Romana",
  "price": 9.5,
  "status": "PLACEHOLDER"
}
```

### `ManagerDashboardDto`

```json
{
  "managerId": 3,
  "managerName": "PR Manager",
  "venueName": "Crush Club",
  "totalTickets": 120,
  "totalTables": 14,
  "totalPregames": 5,
  "todayRevenue": 2450.0,
  "checkinRate": 72,
  "salesChannels": [],
  "insightCards": [],
  "managedEvents": [],
  "selectedEventId": 1,
  "selectedEventTitle": "Neon Pulse"
}
```

## Manual API Test Examples

PowerShell examples:

```powershell
Invoke-RestMethod http://localhost:8080/api/health
$loginBody = @{ email = "daniele.lorenzano@nightout.demo"; password = "user123" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login -ContentType "application/json" -Body $loginBody
Invoke-RestMethod "http://localhost:8080/api/demo/session?role=NORMAL_USER"
Invoke-RestMethod "http://localhost:8080/api/events?city=Milano&genre=TECHNO&sort=popularity"
Invoke-RestMethod http://localhost:8080/api/events/1
Invoke-RestMethod "http://localhost:8080/api/users/1/tickets"
Invoke-RestMethod "http://localhost:8080/api/manager/dashboard?managerId=3"
```

Create a ticket:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/tickets `
  -ContentType "application/json" `
  -Body '{"userId":1,"eventId":1,"ticketType":"STANDARD","salesChannel":"NightOUT App"}'
```

Join a pregame:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8080/api/pregames/1/join?userId=1"
```
