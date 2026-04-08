# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — 2026-04-08

### Added

#### Database schema
- `DopingCategory` model — 13 WADA doping categories
- `MedicationDoping` junction table — medication ↔ doping category (9,493 rows)
- `DependencyCategory` model — 13 drug dependency/precursor categories
- `MedicationType` model — 42 medication type classifications
- `IndicationGroup` model — 88 indication groups
- `NarcoticCategory` model — 6 narcotic/controlled substance categories
- `RegistrationChange` model — new/cancelled registrations (Feb 2026, 181 rows)
- `Prescription` model — district-level eRecept prescription statistics (380,723 rows)
- `Medication` — 4 new FK columns: `dependencyCategoryCode`, `medicationTypeCode`, `indicationGroupCode`, `narcoticCategoryCode`

#### REST API endpoints
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

#### Infrastructure
- Zod validation middleware on all list endpoints — coerces types, enforces bounds, returns structured 400 with field-level error details
- `AppError` class and centralised error handler middleware — controllers no longer contain try/catch boilerplate
- `pino-http` request logging — structured JSON log on every request
- `express-rate-limit` — 120 requests/min per IP, standard `RateLimit-*` response headers
- Prisma connection pool capped at `max: 5` for Supabase free-tier compatibility

#### Swagger documentation (`/docs`)
- 17 reusable component schemas: `MedicationSummary`, `MedicationDetail`, `SubstanceSummary`, `SubstanceDetail`, `Pharmacy`, `PharmacyHour`, `Prescription`, `RegistrationChange`, `AtcNode`, `AtcNodeDetail`, `MedicationDocument`, `Disruption`, `PriceReport`, `DispensingRestriction`, `PaginationMeta`, `ErrorResponse`, `CodeName`
- All 11 endpoints documented with full parameter specs, response schemas via `$ref`, and field descriptions

#### Data loading
- `loadDispensingRestrictions` — loads `cedi.csv` (UTF-8, generates up to 3 restriction records per row: DOCTOR / PHARMACIST / PATIENT)
- `loadDopingCategories`, `loadDependencyCategories`, `loadMedicationTypes`, `loadIndicationGroups`, `loadNarcoticCategories`
- `loadMedicationDoping` — junction loader with medication existence validation
- `loadRegistrationChanges(filePath, changeType)` — shared loader for all three REG files
- `loadPrescriptions` — UTF-8, comma-delimited, with medication validation
- `updateMedicationFks` — bulk `UPDATE … FROM (VALUES …)` to backfill all FK columns on existing medication rows efficiently
- `csv.ts` / `createLoader.ts` — added `encoding` parameter (default `win1250`) to support UTF-8 source files

### Fixed
- `loadDispensingCategories` — wrong source column `FORMA` → `VYDEJ`
- `loadMedicationDocuments` — wrong file path → `dlp_nazvydokumentu.csv`
- `loadMedications` — now maps all FK columns present in the source CSV: `formCode` (`FORMA`), `routeCode` (`CESTA`), `organizationCode` (`DRZ`), `registrationStatusCode` (`REG`), `dispensingCategoryCode` (`VYDEJ`), `ean` (`EAN`), `registrationNumber` (`RC`)

---

## [0.1.0] — 2026-04-01

### Added
- Initial project setup — Express 5, TypeScript, Prisma, PostgreSQL
- Core schema: `Medication`, `Substance`, `Composition`, `Synonym`, `AtcNode`, `Organization`, `PharmaceuticalForm`, `AdministrationRoute`, `DispensingCategory`, `RegistrationStatus`, `MedicationDocument`, `Disruption`, `PriceReport`, `DispensingRestriction`, `Pharmacy`, `PharmacyHour`
- Generic `createLoader` factory with batch processing and win1250 encoding support
- Data loaders for all core tables from DLP, MR, LEKARNY, and LEK datasets
- `GET /medications` — list with `name` and `atc` filters, pagination
- Swagger UI at `/docs`
- `npm run seed` script
