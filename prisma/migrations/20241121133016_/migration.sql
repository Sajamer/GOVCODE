/*
  Warnings:

  - You are about to drop the `complience` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deparment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kpicomplience` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `deparment` DROP FOREIGN KEY `Deparment_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `kpi` DROP FOREIGN KEY `KPI_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `kpicomplience` DROP FOREIGN KEY `KPIComplience_complienceId_fkey`;

-- DropForeignKey
ALTER TABLE `kpicomplience` DROP FOREIGN KEY `KPIComplience_kpiId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_departmentId_fkey`;

-- DropTable
DROP TABLE `complience`;

-- DropTable
DROP TABLE `deparment`;

-- DropTable
DROP TABLE `kpicomplience`;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` INTEGER NOT NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Compliance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Compliance_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KPICompliance` (
    `kpiId` INTEGER NOT NULL,
    `complianceId` INTEGER NOT NULL,

    PRIMARY KEY (`kpiId`, `complianceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPI` ADD CONSTRAINT `KPI_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPICompliance` ADD CONSTRAINT `KPICompliance_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPICompliance` ADD CONSTRAINT `KPICompliance_complianceId_fkey` FOREIGN KEY (`complianceId`) REFERENCES `Compliance`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
