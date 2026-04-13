# 🧪 SUKL API – Medication Data Aggregation API

Backend API that aggregates and exposes structured data about medications from the Czech State Institute for Drug Control (SÚKL) open datasets.

This project transforms raw CSV datasets into a modern, queryable REST API.

---

## 🚀 Tech Stack

- Node.js (v22 LTS)
- TypeScript
- Express
- Prisma ORM (v7)
- PostgreSQL (Supabase)

---

## 📦 Project Structure

sukl-api/
├─ src/
│  ├─ db/
│  ├─ services/
│  ├─ controllers/
│  ├─ routes/
│  ├─ app.ts
│  └─ server.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ prisma.config.ts
├─ package.json
├─ tsconfig.json
└─ .env

---

## ⚙️ Setup

### Install dependencies

npm install

### Configure environment

Create .env (REDUCED_DATA=true for testing with smaller datasets):

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
PORT=3000
REDUCED_DATA=true



### Run migrations

npx prisma migrate dev --name init

### Generate Prisma client

npx prisma generate

### Start dev server

npm run dev

---

## 🔗 API

### Health

GET /

### Medications

GET /medications

Query:
- name
- atc
- page
- limit

---

## 🏗️ Architecture

Client → Express → Controller → Service → Prisma → PostgreSQL

---

## 📌 Roadmap

- /medications/:suklCode
- ETL for CSV datasets
- Swagger docs
- Caching

---

## 📄 License

MIT
