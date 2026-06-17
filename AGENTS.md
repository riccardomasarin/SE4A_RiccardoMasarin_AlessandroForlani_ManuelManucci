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