-- AlterTable
ALTER TABLE "User" ADD COLUMN "numberPlate" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_numberPlate_key" ON "User"("numberPlate");
