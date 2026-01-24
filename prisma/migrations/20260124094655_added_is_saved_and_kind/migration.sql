-- CreateEnum
CREATE TYPE "Kind" AS ENUM ('SALE', 'RENT');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "isSaved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kind" "Kind" NOT NULL DEFAULT 'RENT';
