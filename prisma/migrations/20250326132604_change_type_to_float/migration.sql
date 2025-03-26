/*
  Warnings:

  - You are about to alter the column `min` on the `rule` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `max` on the `rule` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `rule` MODIFY `min` DOUBLE NOT NULL,
    MODIFY `max` DOUBLE NOT NULL;
