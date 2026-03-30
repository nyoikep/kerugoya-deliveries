-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "idNumber" TEXT,
    "idCardUrl" TEXT,
    "numberPlate" TEXT,
    "motorcyclePlateNumber" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "fcmToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "idNumber", "loyaltyPoints", "motorcyclePlateNumber", "name", "numberPlate", "password", "phone", "resetToken", "resetTokenExpiry", "role", "updatedAt") SELECT "createdAt", "email", "id", "idNumber", "loyaltyPoints", "motorcyclePlateNumber", "name", "numberPlate", "password", "phone", "resetToken", "resetTokenExpiry", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_idNumber_key" ON "User"("idNumber");
CREATE UNIQUE INDEX "User_numberPlate_key" ON "User"("numberPlate");
CREATE UNIQUE INDEX "User_motorcyclePlateNumber_key" ON "User"("motorcyclePlateNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DeliveryRequest_status_idx" ON "DeliveryRequest"("status");

-- CreateIndex
CREATE INDEX "DeliveryRequest_clientId_idx" ON "DeliveryRequest"("clientId");

-- CreateIndex
CREATE INDEX "DeliveryRequest_riderId_idx" ON "DeliveryRequest"("riderId");

-- CreateIndex
CREATE INDEX "MpesaTransaction_userId_idx" ON "MpesaTransaction"("userId");

-- CreateIndex
CREATE INDEX "Product_businessId_idx" ON "Product"("businessId");
