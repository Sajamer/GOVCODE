/*
  Warnings:

  - Made the column `targetAttributeId` on table `frameworklinkitem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `frameworklinkitem` DROP FOREIGN KEY `FrameworkLinkItem_targetAttributeId_fkey`;

-- AlterTable
ALTER TABLE `frameworklinkitem` MODIFY `targetAttributeId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `FrameworkLinkItem` ADD CONSTRAINT `FrameworkLinkItem_targetAttributeId_fkey` FOREIGN KEY (`targetAttributeId`) REFERENCES `FrameworkAttribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
