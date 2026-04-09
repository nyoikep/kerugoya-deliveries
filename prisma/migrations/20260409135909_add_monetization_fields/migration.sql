-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'SHOP',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Business" ("category", "createdAt", "description", "id", "name", "ownerId", "updatedAt") SELECT "category", "createdAt", "description", "id", "name", "ownerId", "updatedAt" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE UNIQUE INDEX "Business_name_key" ON "Business"("name");
CREATE TABLE "new_DeliveryRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "clientLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price" REAL NOT NULL DEFAULT 0,
    "platformFee" REAL NOT NULL DEFAULT 0,
    "isExpress" BOOLEAN NOT NULL DEFAULT false,
    "tipAmount" REAL NOT NULL DEFAULT 0,
    "surgeMultiplier" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientId" TEXT NOT NULL,
    "riderId" TEXT,
    "scheduledAt" DATETIME,
    CONSTRAINT "DeliveryRequest_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeliveryRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DeliveryRequest" ("clientId", "clientLocation", "createdAt", "description", "destination", "id", "riderId", "scheduledAt", "status", "updatedAt") SELECT "clientId", "clientLocation", "createdAt", "description", "destination", "id", "riderId", "scheduledAt", "status", "updatedAt" FROM "DeliveryRequest";
DROP TABLE "DeliveryRequest";
ALTER TABLE "new_DeliveryRequest" RENAME TO "DeliveryRequest";
CREATE INDEX "DeliveryRequest_status_idx" ON "DeliveryRequest"("status");
CREATE INDEX "DeliveryRequest_clientId_idx" ON "DeliveryRequest"("clientId");
CREATE INDEX "DeliveryRequest_riderId_idx" ON "DeliveryRequest"("riderId");
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
    "isGold" BOOLEAN NOT NULL DEFAULT false,
    "fcmToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "fcmToken", "id", "idCardUrl", "idNumber", "loyaltyPoints", "motorcyclePlateNumber", "name", "numberPlate", "password", "phone", "resetToken", "resetTokenExpiry", "role", "status", "updatedAt") SELECT "createdAt", "email", "fcmToken", "id", "idCardUrl", "idNumber", "loyaltyPoints", "motorcyclePlateNumber", "name", "numberPlate", "password", "phone", "resetToken", "resetTokenExpiry", "role", "status", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_idNumber_key" ON "User"("idNumber");
CREATE UNIQUE INDEX "User_numberPlate_key" ON "User"("numberPlate");
CREATE UNIQUE INDEX "User_motorcyclePlateNumber_key" ON "User"("motorcyclePlateNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
