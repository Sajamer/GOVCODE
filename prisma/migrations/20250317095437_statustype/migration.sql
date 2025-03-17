-- DropForeignKey
ALTER TABLE `kpi` DROP FOREIGN KEY `KPI_statusId_fkey`;

-- DropIndex
DROP INDEX `KPI_statusId_fkey` ON `kpi`;

-- AlterTable
ALTER TABLE `kpi` ADD COLUMN `statusType` VARCHAR(191) NOT NULL DEFAULT 'default',
    MODIFY `statusId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `KPI` ADD CONSTRAINT `KPI_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `Status`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
