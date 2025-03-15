/*
  Warnings:

  - Added the required column `statusId` to the `KPI` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kpi` ADD COLUMN `statusId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `min` VARCHAR(191) NOT NULL,
    `max` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `statusId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KPI` ADD CONSTRAINT `KPI_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `Status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rule` ADD CONSTRAINT `Rule_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `Status`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
