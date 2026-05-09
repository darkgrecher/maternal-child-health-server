-- CreateTable
CREATE TABLE "midwife_link_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "midwife_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "midwife_link_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "midwife_link_codes_code_key" ON "midwife_link_codes"("code");

-- CreateIndex
CREATE INDEX "midwife_link_codes_midwife_id_is_active_idx" ON "midwife_link_codes"("midwife_id", "is_active");

-- AddForeignKey
ALTER TABLE "midwife_link_codes" ADD CONSTRAINT "midwife_link_codes_midwife_id_fkey" FOREIGN KEY ("midwife_id") REFERENCES "midwives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
