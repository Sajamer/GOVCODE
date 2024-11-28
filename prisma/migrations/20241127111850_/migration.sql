-- DropForeignKey
ALTER TABLE `kpicompliance` DROP FOREIGN KEY `KPICompliance_kpiId_fkey`;

-- DropForeignKey
ALTER TABLE `kpiobjective` DROP FOREIGN KEY `KPIObjective_kpiId_fkey`;

-- DropForeignKey
ALTER TABLE `kpiprocess` DROP FOREIGN KEY `KPIProcess_kpiId_fkey`;

-- AddForeignKey
ALTER TABLE `KPIObjective` ADD CONSTRAINT `KPIObjective_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPICompliance` ADD CONSTRAINT `KPICompliance_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPIProcess` ADD CONSTRAINT `KPIProcess_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
