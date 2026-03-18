/*
  Warnings:

  - A unique constraint covering the columns `[motorcyclePlateNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "motorcyclePlateNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_motorcyclePlateNumber_key" ON "User"("motorcyclePlateNumber");
