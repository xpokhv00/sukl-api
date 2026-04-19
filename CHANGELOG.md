# Changelog

## Initial setup — 2026-03-28
- Initial project setup — Express 5, TypeScript, Prisma, PostgreSQL
- Core schema: `Medication`, `Substance`, `Composition`, `Synonym`, `AtcNode`, `Organization`, `PharmaceuticalForm`, `AdministrationRoute`, `DispensingCategory`, `RegistrationStatus`, `MedicationDocument`, `Disruption`, `PriceReport`, `DispensingRestriction`, `Pharmacy`, `PharmacyHour`
- Generic `createLoader` factory with batch processing and win1250 encoding support
- Data loaders for all core tables from DLP, MR, LEKARNY, and LEK datasets
- `GET /medications` — list with `name` and `atc` filters, pagination
- Swagger UI at `/docs`
- `npm run seed` script

## 2026-04-07
### Added
- `GET /medications` — enriched response with resolved FK relations; new filters: `substance`, `form`, `dispensing`
- `GET /medications/:suklCode` — full detail including compositions, documents, disruptions, prices, restrictions, doping entries
- `GET /medications/:suklCode/prescriptions` — prescription statistics scoped to one medication
- `GET /substances` — search by name / INN name
- `GET /substances/:id` — detail with synonyms and all medications containing the substance
- `GET /pharmacies` — filter by `name`, `city`, `postalCode`, `isMailOrder`, `isDuty`
- `GET /pharmacies/:id` — detail with weekly opening hours
- `GET /prescriptions` — filter by `suklCode`, `districtCode`, `year`, `month`
- `GET /registration-changes` — filter by `changeType` (NEW / CANCELLED / CANCELLED_EU), `name`, `holder`
- `GET /atc` — browse ATC classification tree level by level via `?parent=`
- `GET /atc/:code` — node detail with direct children and medication count
- Zod validation middleware on all list endpoints — coerces types, enforces bounds, returns structured 400 with field-level error details
- `AppError` class and centralised error handler middleware
- `pino-http` request logging
- `express-rate-limit` — 120 req/min per IP
- Prisma connection pool capped at `max: 5` for Supabase free-tier compatibility
- 17 reusable Swagger component schemas; all endpoints documented

#### Database schema
- `DopingCategory`, `MedicationDoping`, `DependencyCategory`, `MedicationType`, `IndicationGroup`, `NarcoticCategory`
- `RegistrationChange` model — new/cancelled registrations
- `Prescription` model — district-level eRecept prescription statistics
- `Medication` — 4 new FK columns: `dependencyCategoryCode`, `medicationTypeCode`, `indicationGroupCode`, `narcoticCategoryCode`

#### Data loading
- `loadDispensingRestrictions`, `loadDopingCategories`, `loadDependencyCategories`, `loadMedicationTypes`, `loadIndicationGroups`, `loadNarcoticCategories`, `loadMedicationDoping`, `loadRegistrationChanges`, `loadPrescriptions`
- `updateMedicationFks` — bulk `UPDATE … FROM (VALUES …)` to backfill FK columns efficiently
- `encoding` parameter added to `streamCsv` / `createLoader` (default `win1250`) to support UTF-8 source files

### Fixed
- `loadDispensingCategories` — wrong source column `FORMA` → `VYDEJ`
- `loadMedicationDocuments` — wrong file path → `dlp_nazvydokumentu.csv`
- `loadMedications` — now maps all FK columns from source CSV
- SUKL codes shorter than 7 digits now normalized with leading zeros consistently across all loaders

## 2026-04-13
### Added
- `GET /supply-risk` — supply chain risk statistics per ATC group, ranked by sigmoid-weighted risk score using active disruptions and prescription volume; in-memory cache with configurable TTL (`SUPPLY_RISK_CACHE_TTL_MS`)
- `GET /organizations` — list medication holders with `name` / `country` filters and pagination
- `GET /organizations/:code` — holder detail
- `GET /organizations/:code/medications` — medications held by an organization
- `GET /organizations/:code/disruptions` — active disruptions for an organization's medications
- `GET /prescriptions/top` — top prescribed medications, filterable by `districtCode` and `atcCode`
- `GET /prescriptions` — added `atcCode` filter; response now includes full medication data
- `GET /disruptions` — added `atc` filter across all disruption endpoints
- Metadata endpoints: `GET /meta/forms`, `/meta/routes`, `/meta/dispensing-categories`, `/meta/registration-statuses`, `/meta/doping-categories`, `/meta/dependency-categories`, `/meta/medication-types`, `/meta/indication-groups`, `/meta/narcotic-categories`, `/meta/pharmacy-types`
- `GET /substances/:id/medications` — paginated list of medications containing a substance with latest price
- Substance search: synonym-aware in-memory ranking (exact name → INN → prefix → synonym tiers)
- CI pipeline with automated test runs
- Automated and scheduled data loading

## 2026-04-16
### Removed
- ZPROSTRED dataset — download and load removed (no loader needed)
- Intermediaries (`/intermediaries`) route and model

## 2026-04-17
- `env.example` — documented all environment variables
- Express type augmentation (`src/types/express.d.ts`) — `req.parsed_query` / `req.parsed_params` properly typed via `z.infer<>`; removed all `as any` casts across controllers
