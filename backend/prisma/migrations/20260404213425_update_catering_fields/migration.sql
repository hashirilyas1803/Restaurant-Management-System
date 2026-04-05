/*
  Warnings:

  - Added the required column `eventName` to the `Catering` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guestCount` to the `Catering` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Catering" ADD COLUMN     "eventName" TEXT NOT NULL,
ADD COLUMN     "guestCount" INTEGER NOT NULL;
