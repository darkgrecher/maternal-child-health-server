-- CreateTable
CREATE TABLE "growth_measurements" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "measurement_date" TIMESTAMP(3) NOT NULL,
    "age_in_months" INTEGER NOT NULL,
    "age_in_days" INTEGER,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "head_circumference" DOUBLE PRECISION,
    "weight_percentile" DOUBLE PRECISION,
    "height_percentile" DOUBLE PRECISION,
    "head_circumference_percentile" DOUBLE PRECISION,
    "weight_z_score" DOUBLE PRECISION,
    "height_z_score" DOUBLE PRECISION,
    "head_circumference_z_score" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "bmi_percentile" DOUBLE PRECISION,
    "bmi_z_score" DOUBLE PRECISION,
    "measured_by" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "growth_measurements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "growth_measurements" ADD CONSTRAINT "growth_measurements_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;
