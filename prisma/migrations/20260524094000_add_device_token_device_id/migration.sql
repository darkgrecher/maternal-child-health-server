-- AlterTable
ALTER TABLE "device_tokens" ADD COLUMN     "device_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_actor_type_actor_id_device_id_key" ON "device_tokens"("actor_type", "actor_id", "device_id");
