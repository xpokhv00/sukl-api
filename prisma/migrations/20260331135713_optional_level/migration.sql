/*
  Warnings:

  - The primary key for the `pharmacies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `pharmacies` table. All the data in the column will be lost.
  - Added the required column `pharmacy_id` to the `pharmacies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pharmacy_hours" DROP CONSTRAINT "pharmacy_hours_pharmacy_id_fkey";

-- AlterTable
ALTER TABLE "atc_nodes" ALTER COLUMN "level" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pharmacies" DROP CONSTRAINT "pharmacies_pkey",
DROP COLUMN "id",
ADD COLUMN     "pharmacy_id" TEXT NOT NULL,
ADD CONSTRAINT "pharmacies_pkey" PRIMARY KEY ("pharmacy_id");

-- AddForeignKey
ALTER TABLE "pharmacy_hours" ADD CONSTRAINT "pharmacy_hours_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("pharmacy_id") ON DELETE CASCADE ON UPDATE CASCADE;
