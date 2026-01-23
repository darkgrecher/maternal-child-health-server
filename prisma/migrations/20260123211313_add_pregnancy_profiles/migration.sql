-- CreateEnum
CREATE TYPE "PregnancyStatus" AS ENUM ('active', 'delivered', 'terminated', 'converted');

-- CreateTable
CREATE TABLE "pregnancies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mother_first_name" TEXT NOT NULL,
    "mother_last_name" TEXT NOT NULL,
    "mother_date_of_birth" TIMESTAMP(3) NOT NULL,
    "mother_blood_type" "BloodType",
    "mother_photo_uri" TEXT,
    "expected_delivery_date" TIMESTAMP(3) NOT NULL,
    "last_menstrual_period" TIMESTAMP(3),
    "conception_date" TIMESTAMP(3),
    "status" "PregnancyStatus" NOT NULL DEFAULT 'active',
    "current_week" INTEGER,
    "trimester" INTEGER,
    "gravida" INTEGER,
    "para" INTEGER,
    "blood_pressure" TEXT,
    "pre_pregnancy_weight" DOUBLE PRECISION,
    "current_weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "is_high_risk" BOOLEAN NOT NULL DEFAULT false,
    "risk_factors" TEXT[],
    "medical_conditions" TEXT[],
    "allergies" TEXT[],
    "medications" TEXT[],
    "hospital_name" TEXT,
    "obgyn_name" TEXT,
    "obgyn_contact" TEXT,
    "midwife_name" TEXT,
    "midwife_contact" TEXT,
    "expected_gender" "Gender",
    "baby_nickname" TEXT,
    "number_of_babies" INTEGER NOT NULL DEFAULT 1,
    "converted_to_child_id" TEXT,
    "delivery_date" TIMESTAMP(3),
    "delivery_type" "DeliveryType",
    "delivery_notes" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "emergency_contact_relation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancy_checkups" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "checkup_date" TIMESTAMP(3) NOT NULL,
    "week_of_pregnancy" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "blood_pressure_systolic" INTEGER,
    "blood_pressure_diastolic" INTEGER,
    "fundal_height" DOUBLE PRECISION,
    "fetal_heart_rate" INTEGER,
    "fetal_weight" DOUBLE PRECISION,
    "fetal_length" DOUBLE PRECISION,
    "amniotic_fluid" TEXT,
    "placenta_position" TEXT,
    "urine_protein" TEXT,
    "urine_glucose" TEXT,
    "hemoglobin" DOUBLE PRECISION,
    "notes" TEXT,
    "recommendations" TEXT[],
    "next_checkup_date" TIMESTAMP(3),
    "provider_name" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancy_checkups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancy_measurements" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "measurement_date" TIMESTAMP(3) NOT NULL,
    "week_of_pregnancy" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "belly_circumference" DOUBLE PRECISION,
    "blood_pressure_systolic" INTEGER,
    "blood_pressure_diastolic" INTEGER,
    "symptoms" TEXT[],
    "mood" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancy_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pregnancies_converted_to_child_id_key" ON "pregnancies"("converted_to_child_id");

-- AddForeignKey
ALTER TABLE "pregnancies" ADD CONSTRAINT "pregnancies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_checkups" ADD CONSTRAINT "pregnancy_checkups_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_measurements" ADD CONSTRAINT "pregnancy_measurements_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
