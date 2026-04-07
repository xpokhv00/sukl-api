-- AlterTable
ALTER TABLE "medications" ADD COLUMN     "dependency_category_code" TEXT,
ADD COLUMN     "indication_group_code" TEXT,
ADD COLUMN     "medication_type_code" TEXT,
ADD COLUMN     "narcotic_category_code" TEXT;

-- CreateTable
CREATE TABLE "doping_categories" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "doping_categories_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "medication_doping" (
    "medication_sukl_code" TEXT NOT NULL,
    "doping_category_code" TEXT NOT NULL,

    CONSTRAINT "medication_doping_pkey" PRIMARY KEY ("medication_sukl_code","doping_category_code")
);

-- CreateTable
CREATE TABLE "dependency_categories" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "dependency_categories_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "medication_types" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,

    CONSTRAINT "medication_types_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "indication_groups" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "indication_groups_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "narcotic_categories" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "narcotic_categories_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "registration_changes" (
    "id" TEXT NOT NULL,
    "change_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strength" TEXT,
    "form_code" TEXT,
    "route_code" TEXT,
    "registration_number" TEXT,
    "mrp_number" TEXT,
    "holder" TEXT,
    "effective_date" TIMESTAMP(3),
    "status_code" TEXT,

    CONSTRAINT "registration_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "district_code" TEXT NOT NULL,
    "district_name" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "sukl_code" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registration_changes_change_type_idx" ON "registration_changes"("change_type");

-- CreateIndex
CREATE INDEX "registration_changes_registration_number_idx" ON "registration_changes"("registration_number");

-- CreateIndex
CREATE INDEX "prescriptions_sukl_code_idx" ON "prescriptions"("sukl_code");

-- CreateIndex
CREATE INDEX "prescriptions_year_month_idx" ON "prescriptions"("year", "month");

-- CreateIndex
CREATE INDEX "prescriptions_district_code_idx" ON "prescriptions"("district_code");

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_district_code_year_month_sukl_code_key" ON "prescriptions"("district_code", "year", "month", "sukl_code");

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_dependency_category_code_fkey" FOREIGN KEY ("dependency_category_code") REFERENCES "dependency_categories"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_medication_type_code_fkey" FOREIGN KEY ("medication_type_code") REFERENCES "medication_types"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_indication_group_code_fkey" FOREIGN KEY ("indication_group_code") REFERENCES "indication_groups"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_narcotic_category_code_fkey" FOREIGN KEY ("narcotic_category_code") REFERENCES "narcotic_categories"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_doping" ADD CONSTRAINT "medication_doping_medication_sukl_code_fkey" FOREIGN KEY ("medication_sukl_code") REFERENCES "medications"("sukl_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_doping" ADD CONSTRAINT "medication_doping_doping_category_code_fkey" FOREIGN KEY ("doping_category_code") REFERENCES "doping_categories"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
