# AGENTS.md — NightOUT Project Instructions

## Project overview

NightOUT is a Software Engineering university project. It is a full-stack mobile-first web application for nightlife discovery, event participation, ticketing, pregames, return transport integration, and PR/venue management.

The repository contains:
- `backend/`: Java 21 Spring Boot backend using Maven Wrapper.
- `frontend/`: React + Vite + TypeScript frontend.
- `docs/`: requirements document, design document, and UI mockups.

Use the documents in `docs/` as the source of truth.

## Tech stack

Backend:
- Java 21
- Spring Boot
- Maven Wrapper (`./mvnw` or `mvnw.cmd`)
- Spring Web
- Spring Data JPA
- H2 database for the first demo version
- REST APIs

Frontend:
- React
- Vite
- TypeScript
- Mobile-first responsive design
- REST API client connected to the backend

## Local run commands

Backend on Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run

Backend health checks:

http://localhost:8080/
http://localhost:8080/api/health

Frontend on Windows:

cd frontend
npm install
npm run dev

Frontend local URL:

http://localhost:5173
Architecture expectations

Keep a clean separation between:

controllers
DTOs
services
repositories
entities
frontend pages
frontend components
frontend API client

Do not put business logic directly inside controllers.

Implementation constraints
Keep the first version demo-oriented and suitable for a university project.
Do not implement complex authentication yet.
Use a mock login or role selector between normal user and PR/venue manager.
Add sample/demo data for users, venues, events, bars, pregames, tickets, and PR dashboard.
Configure CORS for http://localhost:5173.
Prefer readable and maintainable code over overly complex architecture.
Avoid adding unnecessary dependencies.
Do not delete or overwrite project documents in docs/.
Do not commit generated folders such as node_modules, target, or dist.
First implementation goal

Before coding, analyze the documents and produce an implementation plan.

Then implement in small steps:

Backend domain model and REST APIs.
Backend sample data and H2 configuration.
Frontend page structure and routing.
Frontend API integration.
UI polishing based on the uploaded mockups.
README update with run instructions.

Definition of done
A task is complete only when:
backend compiles successfully,
frontend installs and runs successfully,
relevant endpoints or pages are manually testable,
changes are summarized clearly,
run/test instructions are provided.