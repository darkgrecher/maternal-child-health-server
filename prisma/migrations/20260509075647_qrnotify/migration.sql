-- CreateEnum
CREATE TYPE "MidwifeLinkProfileType" AS ENUM ('child', 'pregnancy');

-- CreateEnum
CREATE TYPE "MidwifeLinkNotificationType" AS ENUM ('mismatch');

-- AlterTable
ALTER TABLE "midwife_link_codes" ADD COLUMN     "profile_type" "MidwifeLinkProfileType" NOT NULL DEFAULT 'child';

-- CreateTable
CREATE TABLE "midwife_link_notifications" (
    "id" TEXT NOT NULL,
    "midwife_id" TEXT NOT NULL,
    "link_code_id" TEXT,
    "type" "MidwifeLinkNotificationType" NOT NULL DEFAULT 'mismatch',
    "expected_profile_type" "MidwifeLinkProfileType" NOT NULL,
    "scanned_profile_type" "MidwifeLinkProfileType" NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "midwife_link_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "midwife_link_notifications_midwife_id_is_read_idx" ON "midwife_link_notifications"("midwife_id", "is_read");

-- AddForeignKey
ALTER TABLE "midwife_link_notifications" ADD CONSTRAINT "midwife_link_notifications_midwife_id_fkey" FOREIGN KEY ("midwife_id") REFERENCES "midwives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "midwife_link_notifications" ADD CONSTRAINT "midwife_link_notifications_link_code_id_fkey" FOREIGN KEY ("link_code_id") REFERENCES "midwife_link_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
