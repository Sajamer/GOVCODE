/*
  Warnings:

  - You are about to alter the column `min` on the `rule` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `max` on the `rule` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `label` to the `Rule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `rule` ADD COLUMN `label` VARCHAR(191) NOT NULL,
    MODIFY `min` INTEGER NOT NULL,
    MODIFY `max` INTEGER NOT NULL;
