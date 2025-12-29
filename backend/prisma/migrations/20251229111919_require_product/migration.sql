/*
  Warnings:

  - Made the column `product` on table `Delivery` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Delivery" ALTER COLUMN "product" SET NOT NULL;
