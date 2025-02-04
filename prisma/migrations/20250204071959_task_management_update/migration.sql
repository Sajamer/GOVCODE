/*
  Warnings:

  - You are about to drop the column `assignToId` on the `taskmanagement` table. All the data in the column will be lost.
  - Added the required column `priority` to the `TaskManagement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `taskmanagement` DROP FOREIGN KEY `TaskManagement_assignToId_fkey`;

-- DropIndex
DROP INDEX `TaskManagement_assignToId_fkey` ON `taskmanagement`;

-- AlterTable
ALTER TABLE `taskmanagement` DROP COLUMN `assignToId`,
    ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL;

-- CreateTable
CREATE TABLE `_AssignedTask` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AssignedTask_AB_unique`(`A`, `B`),
    INDEX `_AssignedTask_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AssignedTask` ADD CONSTRAINT `_AssignedTask_A_fkey` FOREIGN KEY (`A`) REFERENCES `TaskManagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AssignedTask` ADD CONSTRAINT `_AssignedTask_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
