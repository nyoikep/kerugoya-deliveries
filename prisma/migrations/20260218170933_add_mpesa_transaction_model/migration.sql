-- CreateTable
CREATE TABLE "MpesaTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantRequestID" TEXT NOT NULL,
    "checkoutRequestID" TEXT NOT NULL,
    "resultCode" TEXT NOT NULL,
    "resultDesc" TEXT,
    "mpesaReceiptNumber" TEXT,
    "amount" REAL NOT NULL,
    "transactionDate" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "deliveryRequestId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MpesaTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MpesaTransaction_deliveryRequestId_fkey" FOREIGN KEY ("deliveryRequestId") REFERENCES "DeliveryRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MpesaTransaction_checkoutRequestID_key" ON "MpesaTransaction"("checkoutRequestID");

-- CreateIndex
CREATE UNIQUE INDEX "MpesaTransaction_mpesaReceiptNumber_key" ON "MpesaTransaction"("mpesaReceiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MpesaTransaction_deliveryRequestId_key" ON "MpesaTransaction"("deliveryRequestId");
