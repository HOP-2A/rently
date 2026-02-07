-- CreateEnum
CREATE TYPE "RentalRequestType" AS ENUM ('RENT_REQUEST', 'BUY_REQUEST');

-- AlterTable
ALTER TABLE "RentalRequest" ADD COLUMN     "type" "RentalRequestType" NOT NULL DEFAULT 'RENT_REQUEST';

-- CreateIndex
CREATE INDEX "RentalRequest_type_idx" ON "RentalRequest"("type");
