/*
  Warnings:

  - You are about to drop the column `productId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[itemId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Product_productId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productId",
ADD COLUMN     "itemId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_itemId_key" ON "Product"("itemId");
