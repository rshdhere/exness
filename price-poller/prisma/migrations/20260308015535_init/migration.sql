-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "tradeId" BIGINT NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL,
    "quantity" BIGINT NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id","timestamp")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_tradeId_timestamp_key" ON "Trade"("tradeId", "timestamp");
