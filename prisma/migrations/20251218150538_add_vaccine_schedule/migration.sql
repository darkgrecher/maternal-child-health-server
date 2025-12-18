-- CreateEnum
CREATE TYPE "VaccinationStatus" AS ENUM ('pending', 'completed', 'overdue', 'missed', 'scheduled');

-- CreateTable
CREATE TABLE "vaccines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "description" TEXT,
    "scheduled_age_months" INTEGER NOT NULL,
    "scheduled_age_days" INTEGER,
    "dose_number" INTEGER NOT NULL DEFAULT 1,
    "total_doses" INTEGER NOT NULL DEFAULT 1,
    "age_group" TEXT NOT NULL,
    "diseases_prevented" TEXT[],
    "side_effects" TEXT[],
    "contraindications" TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaccines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccination_records" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "vaccine_id" TEXT NOT NULL,
    "status" "VaccinationStatus" NOT NULL DEFAULT 'pending',
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "administered_date" TIMESTAMP(3),
    "administered_by" TEXT,
    "location" TEXT,
    "batch_number" TEXT,
    "notes" TEXT,
    "side_effects_occurred" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaccination_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vaccines_short_name_dose_number_key" ON "vaccines"("short_name", "dose_number");

-- CreateIndex
CREATE UNIQUE INDEX "vaccination_records_child_id_vaccine_id_key" ON "vaccination_records"("child_id", "vaccine_id");

-- AddForeignKey
ALTER TABLE "vaccination_records" ADD CONSTRAINT "vaccination_records_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccination_records" ADD CONSTRAINT "vaccination_records_vaccine_id_fkey" FOREIGN KEY ("vaccine_id") REFERENCES "vaccines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
