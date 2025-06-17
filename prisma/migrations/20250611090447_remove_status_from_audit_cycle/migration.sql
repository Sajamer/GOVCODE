/*
  Warnings:

  - You are about to drop the column `statusId` on the `auditcycle` table. All the data in the column will be lost.
  - Made the column `auditBy` on table `auditcycle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `auditcycle` DROP FOREIGN KEY `AuditCycle_auditBy_fkey`;

-- DropForeignKey
ALTER TABLE `auditcycle` DROP FOREIGN KEY `AuditCycle_statusId_fkey`;

-- DropIndex
DROP INDEX `AuditCycle_auditBy_fkey` ON `auditcycle`;

-- DropIndex
DROP INDEX `AuditCycle_statusId_fkey` ON `auditcycle`;

-- AlterTable
ALTER TABLE `auditcycle` DROP COLUMN `statusId`,
    MODIFY `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `auditBy` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `AuditCycle` ADD CONSTRAINT `AuditCycle_auditBy_fkey` FOREIGN KEY (`auditBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
