-- AlterTable
ALTER TABLE `framework` ADD COLUMN `statusId` INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `Framework` ADD CONSTRAINT `Framework_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `auditStatus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
