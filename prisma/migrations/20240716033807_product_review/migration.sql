/*
  Warnings:

  - You are about to drop the column `averageStar` on the `Review` table. All the data in the column will be lost.
  - Added the required column `averageStar` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "averageStar" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "averageStar";
