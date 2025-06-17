/*
  Warnings:

  - Made the column `auditBy` on table `auditdetails` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `auditdetails` DROP FOREIGN KEY `AuditDetails_auditBy_fkey`;

-- AlterTable
ALTER TABLE `auditdetails` ADD COLUMN `comment` TEXT NULL,
    ADD COLUMN `ownedBy` VARCHAR(191) NULL,
    MODIFY `auditBy` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `AuditDetails_ownedBy_idx` ON `AuditDetails`(`ownedBy`);

-- AddForeignKey
ALTER TABLE `AuditDetails` ADD CONSTRAINT `AuditDetails_auditBy_fkey` FOREIGN KEY (`auditBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditDetails` ADD CONSTRAINT `AuditDetails_ownedBy_fkey` FOREIGN KEY (`ownedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
