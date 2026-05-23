-- Set default profile type for new midwife link codes
ALTER TABLE "public"."midwife_link_codes"
ALTER COLUMN "profile_type" SET DEFAULT 'any';
