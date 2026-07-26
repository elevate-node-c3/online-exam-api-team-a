# Online Exam API

A backend API for an online exam platform: students register, take timed multiple-choice quizzes tied to a diploma/track, and get scored automatically against a passing threshold. Admins create diplomas and quizzes.

---

## Tech Stack

- **Runtime**: Node.js (ESM) + TypeScript
- **Framework**: Express 5
- **Database**: MongoDB via Mongoose
- **Cache / OTP store**: Redis
- **Validation**: Zod
- **Auth**: JSON Web Tokens (`jsonwebtoken`) + Argon2 password hashing
- **Email**: Nodemailer (SMTP)
- **File uploads**: Multer
- **Logging**: Pino
- **Security middleware**: Helmet, CORS, express-rate-limit, cookie-parser

---

## Documentation

- [docs/database-schema.md](docs/database-schema.md) — collections, fields, and index rationale
- [docs/api-endpoints.md](docs/api-endpoints.md) — the designed API contract (request/response shapes)

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection (local or Atlas)
- A Redis connection (local or hosted, e.g. Upstash)
- SMTP credentials for sending email (e.g. Brevo, Gmail)

### Installation

```bash
git clone <repo-url>
cd "Online Exam API"
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `APPLICATION_NAME` | Display name used in emails |
| `PORT` | Port the HTTP server listens on |
| `MONGO_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `SMTP_USER` / `SMTP_PASS` / `SMTP_PORT` / `SMTP_FROM` | SMTP credentials for outgoing email |
| `ENCRYPTION_SECRET` / `ENCRYPTION_IV_LENGTH` / `ENCRYPTION_ALGORITHM` | Symmetric encryption config |
| `USER_ACCESS_SECRET` / `USER_REFRESH_SECRET` | JWT secrets for student/user tokens |
| `ADMIN_ACCESS_SECRET` / `ADMIN_REFRESH_SECRET` | JWT secrets for admin tokens |
| `CLIENT_URL` | Frontend origin (used for CORS / links in emails) |

### Running

```bash
npm run dev
```

Runs the server with `tsx --watch` in development mode (`NODE_ENV=development`), connecting to MongoDB and Redis and verifying the SMTP connection on boot.

---

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Run the server in watch mode |
| `npm run format` | Format the codebase with Prettier |
| `npm test` | Placeholder — no test runner is wired up yet |

---

## Folder Structure

```text
src/
├── app.ts                 # Express app setup, middleware, route mounting
├── server.ts              # Entrypoint — boots the app
├── routes.ts               # Route path constants (ROUTES.AUTH, ...)
├── DB/
│   ├── db.ts               # MongoDB connection (DatabaseService)
│   ├── redis.ts             # Redis connection + key helpers (RedisService)
│   └── index.ts
├── models/                 # Mongoose models: User, Diploma, Quiz, Attempt
├── modules/                 # Feature modules
│   ├── auth/                 # Register, login, forgot/reset password
│   └── quiz/                  # Quiz creation and catalog
│       # each module has its own <name>.router.ts, <name>.controller.ts,
│       # <name>.service.ts, and <name>.spec.ts
└── common/                  # Shared, cross-module infrastructure
    ├── configs/               # Env var loading, cookie options
    ├── constants/              # Domain constants (quiz bounds/defaults, ...)
    ├── enums/                  # Shared enums (UserRole, QuestionType, ...)
    ├── middlewares/            # Global error handler, Zod request validation
    ├── repositories/           # Generic DatabaseRepo base + per-model repos
    ├── schemas/                # Zod request DTOs per domain
    ├── services/               # SMTP, OTP, security/hashing services
    ├── templates/              # HTML email templates
    ├── types/                  # Shared TypeScript interfaces
    └── utils/                  # Logger, exceptions, multer, response helpers
```

---

## Architecture Notes

- Business logic is organized by **feature module** (`modules/auth`, `modules/quiz`, ...). Each module composes its own service from repositories and other services, then exports a ready-to-use singleton (e.g. `authService`, `authController`) — manual composition at the bottom of each file, no DI container.
- Cross-cutting infrastructure (DB/Redis connections, error handling, logging, validation, shared repositories/types/schemas) lives under `common/`.
- Request validation is centralized in a `validate({ body, params, query })` middleware backed by Zod schemas.

---

## Implementation Status

This is under active development. Currently wired up end-to-end:

- **Auth**: forgot-password flow (send OTP by email, verify OTP, reset password)
- **Quiz**: quiz creation (with diploma validation, duplicate-name check, and photo upload)

The rest of [docs/api-endpoints.md](docs/api-endpoints.md) (registration/login, profile, quiz catalog, attempts, diplomas CRUD) describes the intended API contract and is not yet implemented.
