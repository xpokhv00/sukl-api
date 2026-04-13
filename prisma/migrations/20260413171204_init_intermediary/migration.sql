-- CreateTable
CREATE TABLE "intermediaries" (
    "ic" TEXT NOT NULL,
    "name" TEXT,
    "city" TEXT,
    "street" TEXT,
    "street_number" TEXT,
    "street_number_orient" TEXT,
    "is_legal_person" BOOLEAN,
    "title" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intermediaries_pkey" PRIMARY KEY ("ic")
);

-- CreateIndex
CREATE INDEX "intermediaries_name_idx" ON "intermediaries"("name");

-- CreateIndex
CREATE INDEX "intermediaries_city_idx" ON "intermediaries"("city");
