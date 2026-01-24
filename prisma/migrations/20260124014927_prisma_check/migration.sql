/*
  Warnings:

  - The values [pending,approved,rejected] on the enum `ApprovalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,ended] on the enum `RentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [renter,landlord,admin] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApprovalStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."Listing" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Listing" ALTER COLUMN "status" TYPE "ApprovalStatus_new" USING ("status"::text::"ApprovalStatus_new");
ALTER TYPE "ApprovalStatus" RENAME TO "ApprovalStatus_old";
ALTER TYPE "ApprovalStatus_new" RENAME TO "ApprovalStatus";
DROP TYPE "public"."ApprovalStatus_old";
ALTER TABLE "Listing" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RentStatus_new" AS ENUM ('ACTIVE', 'ENDED');
ALTER TABLE "public"."Rent" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Rent" ALTER COLUMN "status" TYPE "RentStatus_new" USING ("status"::text::"RentStatus_new");
ALTER TYPE "RentStatus" RENAME TO "RentStatus_old";
ALTER TYPE "RentStatus_new" RENAME TO "RentStatus";
DROP TYPE "public"."RentStatus_old";
ALTER TABLE "Rent" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('RENTER', 'LANDLORD', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'RENTER';
COMMIT;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Rent" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'RENTER';
