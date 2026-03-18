-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "idNumber" TEXT,
    "numberPlate" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "idNumber", "name", "numberPlate", "password", "phone", "resetToken", "resetTokenExpiry", "role", "updatedAt") SELECT "createdAt", "email", "id", "idNumber", "name", "numberPlate", "password", "phone", "resetToken", "resetTokenExpiry", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_idNumber_key" ON "User"("idNumber");
CREATE UNIQUE INDEX "User_numberPlate_key" ON "User"("numberPlate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
