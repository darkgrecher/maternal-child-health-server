-- AlterTable
ALTER TABLE "midwives" ADD COLUMN     "password_hash" TEXT,
ALTER COLUMN "auth0_id" DROP NOT NULL;
