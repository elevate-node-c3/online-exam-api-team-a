# Online Exam Platform

A backend API for a streamlined online exam system where students register, take timed multiple-choice quizzes, track their performance on a dashboard, and review correct answers after submission.

Built as Project 1 of the Node.js Backend Engineering Bootcamp — focused on designing the API from scratch and writing solid unit tests.

---

## Tech Stack

- Node.js + TypeScript
- Express.js
- MongoDB (Mongoose)
- JWT + bcrypt for auth
- Jest for testing

---

## Architecture

The project is organized into **feature modules** rather than technical layers:

```
src/
├── modules/
│   ├── auth/         # Registration, login, password reset
│   ├── quiz/          # Quiz catalog, timed attempts, scoring, results
│   └── dashboard/     # Performance insights
├── common/            # Shared middlewares, utils, error handling
├── config/            # Env vars & DB connection
├── app.ts
└── server.ts
```

Each module keeps its own routes, controller, service, model, and tests together.

---

## Core Features

- **Auth** — register, login, forgot/reset password
- **Dashboard** — quizzes passed, fastest completion time, total correct answers
- **Quiz Catalog** — browse available quizzes
- **Quiz Engine** — timed attempts with server-enforced scoring and time limits
- **Results & Review** — score summary and a question-by-question breakdown

---

## Guiding Principles

- Design the API and data models from scratch before coding
- Keep things simple (KISS)
- Never trust the client — timing and scoring are enforced server-side
- Write unit tests for all core logic

---

## Status

Early stage — API contract and data models are still being designed before implementation begins.