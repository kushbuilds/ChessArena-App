# ChessArena

A full-stack chess application with real-time multiplayer, puzzles, and leaderboards.

## Tech Stack

- **Backend:** Spring Boot 3.2, Java 17, H2 (in-memory), WebSocket (STOMP), JWT auth
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, react-chessboard, chess.js

## Prerequisites

- Java 17+
- Node.js 18+

## Quick Start

```bash
./start.sh
```

This builds the frontend, packages the backend, and starts the app at **http://localhost:8080**.

## Manual Setup

### Frontend

```bash
cd frontend
npm install
npm run build
```

The build output goes to `backend/src/main/resources/static/`.

### Backend

```bash
cd backend
./mvnw package -DskipTests
java -jar target/chess-arena-1.0.0.jar
```

## Development Mode

Run backend and frontend separately for hot-reload:

```bash
# Terminal 1 - Backend
cd backend
./mvnw spring-boot:run

# Terminal 2 - Frontend (proxies API to :8080)
cd frontend
npm run dev
```

Frontend dev server runs on http://localhost:5173 with API proxy to the backend.

## Features

- Real-time multiplayer chess via WebSocket
- Play vs computer (random move engine)
- Multiple time controls (Bullet, Blitz, Rapid, Classical)
- Chess puzzles with rating system
- ELO rating system
- Leaderboards
- Friend system
- In-game chat

## Default Accounts

Register a new account at `/register`. The database is in-memory and resets on restart.
