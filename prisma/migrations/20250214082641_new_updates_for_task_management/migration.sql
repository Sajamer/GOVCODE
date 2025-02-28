/*
  Warnings:

  - You are about to drop the column `comment` on the `taskmanagement` table. All the data in the column will be lost.
  - Added the required column `name` to the `TaskManagement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `taskmanagement` DROP FOREIGN KEY `TaskManagement_kpiId_fkey`;

-- DropIndex
DROP INDEX `TaskManagement_kpiId_fkey` ON `taskmanagement`;

-- AlterTable
ALTER TABLE `taskmanagement` DROP COLUMN `comment`,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `isArchived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastAssigneeId` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `percentDone` INTEGER NOT NULL DEFAULT 0,
    MODIFY `status` ENUM('ON_HOLD', 'TODO', 'IN_PROGRESS', 'REVIEW', 'REWORK', 'DONE') NOT NULL DEFAULT 'TODO',
    MODIFY `kpiId` INTEGER NULL,
    MODIFY `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW';

-- CreateTable
CREATE TABLE `TaskHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskId` INTEGER NOT NULL,
    `assignedById` VARCHAR(191) NOT NULL,
    `assignedToId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaskManagement` ADD CONSTRAINT `TaskManagement_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskManagement` ADD CONSTRAINT `TaskManagement_lastAssigneeId_fkey` FOREIGN KEY (`lastAssigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskHistory` ADD CONSTRAINT `TaskHistory_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `TaskManagement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskHistory` ADD CONSTRAINT `TaskHistory_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskHistory` ADD CONSTRAINT `TaskHistory_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
