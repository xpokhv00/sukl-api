# SUKL API – Medication Data Aggregation API

Backend API that aggregates and exposes structured data about medications from the Czech State Institute for Drug Control (SÚKL) open datasets.

This project transforms raw CSV datasets into a modern, queryable REST API with 41 endpoints across 10 resource groups.

Full documentation: [`docs/documentation.tex`](docs/documentation.tex)

---

## Tech Stack

- Node.js (v22 LTS) + TypeScript
- Express 5
- Prisma ORM (v7) + PostgreSQL (Supabase)
- Zod (validation), Pino (logging), Swagger/OpenAPI (docs)

---

## Project Structure

```
sukl-api/
├─ src/
│  ├─ controllers/
│  ├─ services/
│  ├─ routes/
│  ├─ loaders/
│  ├─ schemas/
│  ├─ types/
│  ├─ app.ts
│  └─ server.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ docs/
│  └─ documentation.tex
└─ src/__tests__/
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp env .env
# Fill in DATABASE_URL and DIRECT_URL

# 3. Run migrations
npx prisma migrate deploy

# 4. Generate Prisma client
npx prisma generate

# 5. Start dev server
npm run dev
```

Server runs on `http://localhost:3000`. Swagger UI at `http://localhost:3000/docs`.

Set `REDUCED_DATA=true` in `.env` for testing with smaller datasets.

---

## API Overview

| Prefix | Description |
|--------|-------------|
| `/medications` | Medications with filtering, detail, prescriptions |
| `/substances` | Active substances with synonym search |
| `/pharmacies` | Pharmacies with location and duty filters |
| `/disruptions` | Supply disruptions — all / active / active with replacements |
| `/atc` | ATC classification tree browser |
| `/prescriptions` | Prescription statistics by district, year, month |
| `/organizations` | Marketing authorisation holders |
| `/registration-changes` | New, cancelled, and EU-cancelled registrations |
| `/statistics` | Supply risk dashboard by ATC group |
| `/meta` | Reference codelists (forms, routes, dispensing categories, …) |

All list endpoints support `page` / `limit` pagination. Rate limit: 120 req / 60 s per IP.

---

## Testing

```bash
npm test
```

E2E tests cover all endpoint groups via Jest + Supertest against a live server.

---

## Contributors

| Author | Contributions |
|--------|---------------|
| **Vsevolod Pokhvalenko** (xpokhv00) | Project setup, core endpoints (medications, substances, pharmacies, prescriptions, ATC, registration changes), Zod middleware, rate limiting, Swagger docs, TypeScript type safety, E2E tests, documentation |
| **Michael Janeček** (YanehCheck) | Supply risk endpoint, organizations, disruptions (all 3 variants), metadata endpoints, substance synonym ranking, CI/CD pipeline, SÚKL code normalization fix |
| **Michal Žatečka** (MikiiN) | FK validation in loaders, encoding/batch fixes, registration status fix |
| **Lukáš Csáder** (LukasCsader) | `createLoader` factory, data loaders for core tables, `seed.ts` entrypoint |

---
