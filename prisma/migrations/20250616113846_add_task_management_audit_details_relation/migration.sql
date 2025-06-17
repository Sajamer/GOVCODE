-- AlterTable
ALTER TABLE `taskmanagement` ADD COLUMN `auditDetailId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `TaskManagement` ADD CONSTRAINT `TaskManagement_auditDetailId_fkey` FOREIGN KEY (`auditDetailId`) REFERENCES `AuditDetails`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
