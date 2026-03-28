-- CreateEnum
CREATE TYPE "CompositionType" AS ENUM ('ACTIVE', 'EXCIPIENT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PIL', 'SPC', 'PACKAGE_LEAFLET', 'OTHER');

-- CreateEnum
CREATE TYPE "RestrictionType" AS ENUM ('DOCTOR', 'PHARMACIST', 'PATIENT', 'OTHER');

-- CreateTable
CREATE TABLE "medications" (
    "sukl_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strength" TEXT,
    "ean" TEXT,
    "registration_number" TEXT,
    "atc_code" TEXT,
    "organization_code" TEXT,
    "form_code" TEXT,
    "route_code" TEXT,
    "dispensing_category_code" TEXT,
    "registration_status_code" TEXT,
    "is_reimbursed" BOOLEAN,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("sukl_code")
);

-- CreateTable
CREATE TABLE "substances" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inn_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "substances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compositions" (
    "id" TEXT NOT NULL,
    "medication_sukl_code" TEXT NOT NULL,
    "substance_id" TEXT NOT NULL,
    "amount" DECIMAL(14,4),
    "unit" TEXT,
    "type" "CompositionType" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,

    CONSTRAINT "compositions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synonyms" (
    "id" TEXT NOT NULL,
    "substance_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "synonyms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atc_nodes" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_code" TEXT,
    "level" INTEGER NOT NULL,

    CONSTRAINT "atc_nodes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "organizations" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country_code" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "medication_documents" (
    "id" TEXT NOT NULL,
    "medication_sukl_code" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "medication_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disruptions" (
    "id" TEXT NOT NULL,
    "medication_sukl_code" TEXT NOT NULL,
    "type" TEXT,
    "reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "reported_at" TIMESTAMP(3),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "replacement_sukl_code" TEXT,

    CONSTRAINT "disruptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_reports" (
    "id" TEXT NOT NULL,
    "medication_sukl_code" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "max_price" DECIMAL(14,2),
    "reimbursement" DECIMAL(14,2),
    "patient_copay" DECIMAL(14,2),
    "dispensing_mode" TEXT,
    "reported_at" TIMESTAMP(3),

    CONSTRAINT "price_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispensing_restrictions" (
    "id" TEXT NOT NULL,
    "medication_sukl_code" TEXT NOT NULL,
    "restriction_type" "RestrictionType" NOT NULL,
    "subject" TEXT,
    "description" TEXT,
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),

    CONSTRAINT "dispensing_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "type" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "is_mail_order" BOOLEAN,
    "is_duty" BOOLEAN,

    CONSTRAINT "pharmacies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_hours" (
    "id" TEXT NOT NULL,
    "pharmacy_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TEXT,
    "close_time" TEXT,
    "note" TEXT,

    CONSTRAINT "pharmacy_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmaceutical_forms" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "edqm_code" TEXT,

    CONSTRAINT "pharmaceutical_forms_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "administration_routes" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "edqm_code" TEXT,

    CONSTRAINT "administration_routes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "dispensing_categories" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "dispensing_categories_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "registration_statuses" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "registration_statuses_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "medications_name_idx" ON "medications"("name");

-- CreateIndex
CREATE INDEX "medications_atc_code_idx" ON "medications"("atc_code");

-- CreateIndex
CREATE INDEX "medications_organization_code_idx" ON "medications"("organization_code");

-- CreateIndex
CREATE INDEX "medications_ean_idx" ON "medications"("ean");

-- CreateIndex
CREATE INDEX "substances_name_idx" ON "substances"("name");

-- CreateIndex
CREATE INDEX "substances_inn_name_idx" ON "substances"("inn_name");

-- CreateIndex
CREATE INDEX "compositions_substance_id_idx" ON "compositions"("substance_id");

-- CreateIndex
CREATE INDEX "compositions_medication_sukl_code_idx" ON "compositions"("medication_sukl_code");

-- CreateIndex
CREATE UNIQUE INDEX "compositions_medication_sukl_code_substance_id_type_key" ON "compositions"("medication_sukl_code", "substance_id", "type");

-- CreateIndex
CREATE INDEX "synonyms_substance_id_idx" ON "synonyms"("substance_id");

-- CreateIndex
CREATE INDEX "synonyms_name_idx" ON "synonyms"("name");

-- CreateIndex
CREATE INDEX "atc_nodes_parent_code_idx" ON "atc_nodes"("parent_code");

-- CreateIndex
CREATE INDEX "organizations_name_idx" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "organizations_country_code_idx" ON "organizations"("country_code");

-- CreateIndex
CREATE INDEX "medication_documents_medication_sukl_code_idx" ON "medication_documents"("medication_sukl_code");

-- CreateIndex
CREATE INDEX "medication_documents_type_idx" ON "medication_documents"("type");

-- CreateIndex
CREATE INDEX "disruptions_medication_sukl_code_idx" ON "disruptions"("medication_sukl_code");

-- CreateIndex
CREATE INDEX "disruptions_is_active_idx" ON "disruptions"("is_active");

-- CreateIndex
CREATE INDEX "disruptions_replacement_sukl_code_idx" ON "disruptions"("replacement_sukl_code");

-- CreateIndex
CREATE INDEX "price_reports_medication_sukl_code_idx" ON "price_reports"("medication_sukl_code");

-- CreateIndex
CREATE INDEX "price_reports_period_idx" ON "price_reports"("period");

-- CreateIndex
CREATE UNIQUE INDEX "price_reports_medication_sukl_code_period_key" ON "price_reports"("medication_sukl_code", "period");

-- CreateIndex
CREATE INDEX "dispensing_restrictions_medication_sukl_code_idx" ON "dispensing_restrictions"("medication_sukl_code");

-- CreateIndex
CREATE INDEX "dispensing_restrictions_restriction_type_idx" ON "dispensing_restrictions"("restriction_type");

-- CreateIndex
CREATE INDEX "pharmacies_name_idx" ON "pharmacies"("name");

-- CreateIndex
CREATE INDEX "pharmacies_city_idx" ON "pharmacies"("city");

-- CreateIndex
CREATE INDEX "pharmacies_postal_code_idx" ON "pharmacies"("postal_code");

-- CreateIndex
CREATE INDEX "pharmacy_hours_pharmacy_id_idx" ON "pharmacy_hours"("pharmacy_id");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacy_hours_pharmacy_id_day_of_week_key" ON "pharmacy_hours"("pharmacy_id", "day_of_week");

-- CreateIndex
CREATE INDEX "pharmaceutical_forms_name_idx" ON "pharmaceutical_forms"("name");

-- CreateIndex
CREATE INDEX "administration_routes_name_idx" ON "administration_routes"("name");

-- CreateIndex
CREATE INDEX "dispensing_categories_name_idx" ON "dispensing_categories"("name");

-- CreateIndex
CREATE INDEX "registration_statuses_name_idx" ON "registration_statuses"("name");

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_atc_code_fkey" FOREIGN KEY ("atc_code") REFERENCES "atc_nodes"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_organization_code_fkey" FOREIGN KEY ("organization_code") REFERENCES "organizations"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_form_code_fkey" FOREIGN KEY ("form_code") REFERENCES "pharmaceutical_forms"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_route_code_fkey" FOREIGN KEY ("route_code") REFERENCES "administration_routes"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_dispensing_category_code_fkey" FOREIGN KEY ("dispensing_category_code") REFERENCES "dispensing_categories"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_registration_status_code_fkey" FOREIGN KEY ("registration_status_code") REFERENCES "registration_statuses"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compositions" ADD CONSTRAINT "compositions_medication_sukl_code_fkey" FOREIGN KEY ("medication_sukl_code") REFERENCES "medications"("sukl_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compositions" ADD CONSTRAINT "compositions_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "substances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synonyms" ADD CONSTRAINT "synonyms_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "substances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atc_nodes" ADD CONSTRAINT "atc_nodes_parent_code_fkey" FOREIGN KEY ("parent_code") REFERENCES "atc_nodes"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_documents" ADD CONSTRAINT "medication_documents_medication_sukl_code_fkey" FOREIGN KEY ("medication_sukl_code") REFERENCES "medications"("sukl_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disruptions" ADD CONSTRAINT "disruptions_medication_sukl_code_fkey" FOREIGN KEY ("medication_sukl_code") REFERENCES "medications"("sukl_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_reports" ADD CONSTRAINT "price_reports_medication_sukl_code_fkey" FOREIGN KEY ("medication_sukl_code") REFERENCES "medications"("sukl_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensing_restrictions" ADD CONSTRAINT "dispensing_restrictions_medication_sukl_code_fkey" FOREIGN KEY ("medication_sukl_code") REFERENCES "medications"("sukl_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_hours" ADD CONSTRAINT "pharmacy_hours_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
