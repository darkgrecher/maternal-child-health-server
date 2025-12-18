/*
  Warnings:

  - A unique constraint covering the columns `[auth0_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth0_id" TEXT,
ADD COLUMN     "password_hash" TEXT,
ALTER COLUMN "google_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_auth0_id_key" ON "users"("auth0_id");
