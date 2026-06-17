# NightOUT

NightOUT is a full-stack Software Engineering project for a mobile-first nightlife discovery and management platform.

## Structure

- `backend/`: Java 21 Spring Boot backend.
- `frontend/`: React + Vite + TypeScript frontend.
- `docs/`: requirements, design document, and UI mockups.

## Backend

Run from the project root:

```powershell
cd backend
.\mvnw.cmd spring-boot:run

Backend URLs:

http://localhost:8080/
http://localhost:8080/api/health
Frontend

Run from the project root:

cd frontend
npm install
npm run dev

Frontend URL:

http://localhost:5173
Notes

The current version is an initial full-stack setup. The backend includes a health controller. The frontend currently shows the default Vite React start page.

```powershell id="mrt7ft"