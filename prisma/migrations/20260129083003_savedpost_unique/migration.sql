/*
  Warnings:

  - A unique constraint covering the columns `[renterId,listingId]` on the table `SavedPost` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SavedPost_renterId_listingId_key" ON "SavedPost"("renterId", "listingId");
