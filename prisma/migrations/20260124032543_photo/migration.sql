/*
  Warnings:

  - Added the required column `photo` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "photo" TEXT NOT NULL;
