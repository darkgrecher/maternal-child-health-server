-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('vaccination', 'growth_check', 'development_check', 'general_checkup', 'specialist', 'emergency');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled', 'missed');

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "provider_name" TEXT,
    "provider_role" TEXT,
    "provider_phone" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;
