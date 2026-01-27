-- CreateTable
CREATE TABLE "pregnancy_symptoms" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "week_of_pregnancy" INTEGER NOT NULL,
    "symptoms" TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancy_symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancy_journals" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "week_of_pregnancy" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mood" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancy_journals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pregnancy_symptoms" ADD CONSTRAINT "pregnancy_symptoms_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_journals" ADD CONSTRAINT "pregnancy_journals_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
