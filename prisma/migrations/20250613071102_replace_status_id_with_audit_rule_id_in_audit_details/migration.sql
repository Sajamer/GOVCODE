/*
  Warnings:

  - You are about to drop the column `statusId` on the `auditdetails` table. All the data in the column will be lost.
  - Added the required column `auditRuleId` to the `AuditDetails` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `auditdetails` DROP FOREIGN KEY `AuditDetails_statusId_fkey`;

-- DropIndex
DROP INDEX `AuditDetails_statusId_fkey` ON `auditdetails`;

-- AlterTable
ALTER TABLE `auditdetails` DROP COLUMN `statusId`,
    ADD COLUMN `auditRuleId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `AuditDetails` ADD CONSTRAINT `AuditDetails_auditRuleId_fkey` FOREIGN KEY (`auditRuleId`) REFERENCES `auditRules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
