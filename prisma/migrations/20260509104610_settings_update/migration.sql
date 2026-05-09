-- AlterTable
ALTER TABLE "midwives" ADD COLUMN     "date_format" TEXT NOT NULL DEFAULT 'dmy',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "notify_appointments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_daily_digest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notify_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_high_risk" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_sms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notify_vaccinations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';
