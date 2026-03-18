-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeliveryRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product" TEXT NOT NULL,
    "description" TEXT,
    "clientLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientId" TEXT NOT NULL,
    "riderId" TEXT,
    CONSTRAINT "DeliveryRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeliveryRequest_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DeliveryRequest" ("clientId", "clientLocation", "createdAt", "description", "destination", "id", "product", "riderId", "status", "updatedAt") SELECT "clientId", "clientLocation", "createdAt", "description", "destination", "id", "product", "riderId", "status", "updatedAt" FROM "DeliveryRequest";
DROP TABLE "DeliveryRequest";
ALTER TABLE "new_DeliveryRequest" RENAME TO "DeliveryRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
