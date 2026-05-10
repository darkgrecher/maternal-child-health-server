-- Add claim tracking for midwife link codes
ALTER TABLE "midwife_link_codes" ADD COLUMN IF NOT EXISTS "last_profile_id" TEXT;

-- Add notification type for unregistered scans
ALTER TYPE "MidwifeLinkNotificationType" ADD VALUE IF NOT EXISTS 'unregistered';
