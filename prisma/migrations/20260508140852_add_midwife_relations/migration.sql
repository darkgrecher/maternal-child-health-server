/*
  Warnings:

  - You are about to drop the column `midwife_contact` on the `pregnancies` table. All the data in the column will be lost.
  - You are about to drop the column `midwife_name` on the `pregnancies` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MidwifeRole" AS ENUM ('midwife', 'admin', 'supervisor');

-- AlterTable
ALTER TABLE "children" ADD COLUMN     "midwife_id" TEXT;

-- AlterTable
ALTER TABLE "pregnancies" DROP COLUMN "midwife_contact",
DROP COLUMN "midwife_name",
ADD COLUMN     "midwife_id" TEXT;

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "midwife_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "midwives" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "given_name" TEXT,
    "family_name" TEXT,
    "picture" TEXT,
    "auth0_id" TEXT NOT NULL,
    "role" "MidwifeRole" NOT NULL DEFAULT 'midwife',
    "phone" TEXT,
    "license_number" TEXT,
    "facility_name" TEXT,
    "region" TEXT,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "midwives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "midwives_email_key" ON "midwives"("email");

-- CreateIndex
CREATE UNIQUE INDEX "midwives_auth0_id_key" ON "midwives"("auth0_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_midwife_id_fkey" FOREIGN KEY ("midwife_id") REFERENCES "midwives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_midwife_id_fkey" FOREIGN KEY ("midwife_id") REFERENCES "midwives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancies" ADD CONSTRAINT "pregnancies_midwife_id_fkey" FOREIGN KEY ("midwife_id") REFERENCES "midwives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
