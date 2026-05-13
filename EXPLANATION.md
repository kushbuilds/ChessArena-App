# ChessArena - Project Explanation

## What is it?
A full-stack chess application where users can play chess online in real-time, solve tactical puzzles, and play against a computer.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Spring Boot 3.2, Java 17 |
| Database | MySQL (RDS) |
| Real-time | WebSocket with STOMP protocol + SockJS |
| Auth | JWT (JSON Web Tokens) |
| Hosting | AWS (EC2 + RDS + CloudFront) |

---

## Architecture

```
User's Browser
     │
     ▼
CloudFront (HTTPS/CDN) ──→ EC2 (Spring Boot app on port 8080)
                                    │
                                    ▼
                              RDS MySQL (stores users, games, puzzles)
```

- **CloudFront** gives us HTTPS (secure URL) and caches static files (JS, CSS) globally for fast loading
- **EC2 t2.micro** runs the Java backend which serves both the API and the React frontend (bundled as static files)
- **Nginx** on EC2 acts as a reverse proxy (port 80 → 8080) and handles WebSocket upgrade headers
- **RDS MySQL** stores all persistent data

---

## Key Features & How They Work

### 1. Play vs Computer (Client-side)
- Runs entirely in the browser using `chess.js` for move validation
- Built a **minimax algorithm with alpha-beta pruning** for the AI
- Uses **piece-square tables** (positional scoring) so the computer knows where pieces should be
- Has a **1.5-second time limit** to prevent browser freezing
- Move sounds using **Web Audio API** (no audio files needed)

### 2. Puzzles
- Backend stores 50+ puzzles with FEN positions, solutions, and categories (Fork, Pin, Skewer, etc.)
- On wrong move: board resets, highlights the correct squares in orange, shows the tactic name
- Player retries the same puzzle until solved (teaches rather than skips)

### 3. Real-time Multiplayer
- Uses **WebSocket (STOMP over SockJS)** for bidirectional communication
- SockJS provides fallback to HTTP long-polling when WebSocket isn't available (e.g., through CloudFront)
- Game state synced via pub/sub: `/topic/game/{id}`

### 4. Authentication
- JWT-based stateless auth
- Token stored in localStorage, sent as `Authorization: Bearer <token>` header
- Spring Security filter validates token on every request

### 5. ELO Rating System
- Updates ratings after each game based on the ELO formula
- Separate ratings for different time controls

---

## AWS Deployment (Free Tier)

| Resource | Purpose | Cost |
|----------|---------|------|
| EC2 t2.micro | Runs the app | Free (750 hrs/month) |
| RDS db.t3.micro | MySQL database | Free (750 hrs/month) |
| CloudFront | HTTPS + CDN | Free (1TB/month) |

### Deployment Steps:
1. Created security groups (EC2 allows ports 22/80/8080, RDS allows 3306 only from EC2)
2. Launched RDS MySQL with 20GB storage
3. Launched EC2 with user-data script that installs Java 17 + Nginx
4. Built the app locally (`npm run build` + `mvn package`)
5. SCP'd the JAR to EC2, created a systemd service for auto-restart
6. Set up CloudFront distribution pointing to EC2 for HTTPS

---

## Problems Solved

| Problem | Root Cause | Fix |
|---------|-----------|-----|
| Puzzles not loading | SQL used `RANDOM()` (H2) instead of `RAND()` (MySQL) | Changed query syntax |
| WebSocket returning HTML | SPA catch-all controller was intercepting `/ws/*` routes | Excluded `/ws` from SPA regex |
| Can't move pieces (HTTPS) | Mixed content — HTTPS page calling HTTP WebSocket | Routed WebSocket through CloudFront with SockJS fallback |
| Computer game freezing | Minimax depth 4 too expensive, blocking main thread | Added 1.5s time limit, capped depth at 3 |
| Mobile puzzle layout broken | Fixed sidebar width pushing board off-screen | Made layout `flex-col` on mobile, hid tall sidebar section |

---

## Key Technical Concepts

- **Minimax with Alpha-Beta Pruning** — AI algorithm that explores game trees efficiently by cutting branches that can't affect the outcome
- **Piece-Square Tables** — pre-computed positional values telling the engine where each piece is strongest
- **WebSocket vs REST** — WebSocket for real-time bidirectional (game moves), REST for CRUD (create game, fetch puzzles)
- **SockJS** — WebSocket library with automatic fallback to HTTP polling for environments that don't support WebSocket
- **JWT** — stateless authentication where the server doesn't store sessions; token contains user info signed with a secret
- **CloudFront** — CDN that caches content at edge locations + provides free SSL certificate
- **Systemd** — Linux service manager that auto-restarts the app if it crashes

---

## Live URLs

- HTTPS: https://d30az6qlcmbj50.cloudfront.net
- HTTP: http://43.205.240.230
