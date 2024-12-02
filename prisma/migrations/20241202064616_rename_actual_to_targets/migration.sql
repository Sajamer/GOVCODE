/*
  Warnings:

  - You are about to drop the column `actualValue` on the `kpiactual` table. All the data in the column will be lost.
  - Added the required column `targetValue` to the `KPIActual` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kpiactual` DROP COLUMN `actualValue`,
    ADD COLUMN `targetValue` DOUBLE NOT NULL;
