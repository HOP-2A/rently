/*
  Warnings:

  - A unique constraint covering the columns `[currentRentId]` on the table `Listing` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rentalRequestId]` on the table `Rent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,rentId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Made the column `rentId` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_rentId_fkey";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "currentRentId" TEXT,
ADD COLUMN     "currentRenterId" TEXT;

-- AlterTable
ALTER TABLE "Rent" ADD COLUMN     "rentalRequestId" TEXT;

-- AlterTable
ALTER TABLE "RentalRequest" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decisionNote" TEXT;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "rentId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_currentRentId_key" ON "Listing"("currentRentId");

-- CreateIndex
CREATE INDEX "Listing_currentRenterId_idx" ON "Listing"("currentRenterId");

-- CreateIndex
CREATE INDEX "Listing_kind_idx" ON "Listing"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "Rent_rentalRequestId_key" ON "Rent"("rentalRequestId");

-- CreateIndex
CREATE INDEX "Rent_startAt_idx" ON "Rent"("startAt");

-- CreateIndex
CREATE INDEX "RentalRequest_createdAt_idx" ON "RentalRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_rentId_key" ON "Review"("userId", "rentId");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_currentRenterId_fkey" FOREIGN KEY ("currentRenterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_currentRentId_fkey" FOREIGN KEY ("currentRentId") REFERENCES "Rent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rent" ADD CONSTRAINT "Rent_rentalRequestId_fkey" FOREIGN KEY ("rentalRequestId") REFERENCES "RentalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_rentId_fkey" FOREIGN KEY ("rentId") REFERENCES "Rent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
