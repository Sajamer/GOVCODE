/*
  Warnings:

  - You are about to drop the column `alternativeResultLevel` on the `auditcycle` table. All the data in the column will be lost.
  - You are about to drop the column `alternativeResultName` on the `auditcycle` table. All the data in the column will be lost.
  - You are about to drop the column `resultLevel` on the `auditcycle` table. All the data in the column will be lost.
  - You are about to drop the column `resultName` on the `auditcycle` table. All the data in the column will be lost.
  - You are about to drop the column `auditCycleCaseId` on the `taskmanagement` table. All the data in the column will be lost.
  - You are about to drop the `auditcyclecase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compliancestatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `relatedevidencedoc` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `statusId` to the `AuditCycle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `auditcyclecase` DROP FOREIGN KEY `AuditCycleCase_auditCycleId_fkey`;

-- DropForeignKey
ALTER TABLE `auditcyclecase` DROP FOREIGN KEY `AuditCycleCase_complianceStatusId_fkey`;

-- DropForeignKey
ALTER TABLE `relatedevidencedoc` DROP FOREIGN KEY `RelatedEvidenceDoc_auditCycleCaseId_fkey`;

-- DropForeignKey
ALTER TABLE `relatedevidencedoc` DROP FOREIGN KEY `RelatedEvidenceDoc_taskManagementId_fkey`;

-- DropForeignKey
ALTER TABLE `taskmanagement` DROP FOREIGN KEY `TaskManagement_auditCycleCaseId_fkey`;

-- DropIndex
DROP INDEX `TaskManagement_auditCycleCaseId_fkey` ON `taskmanagement`;

-- AlterTable
ALTER TABLE `auditcycle` DROP COLUMN `alternativeResultLevel`,
    DROP COLUMN `alternativeResultName`,
    DROP COLUMN `resultLevel`,
    DROP COLUMN `resultName`,
    ADD COLUMN `frameworkId` VARCHAR(191) NULL,
    ADD COLUMN `statusId` INTEGER NOT NULL,
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `taskmanagement` DROP COLUMN `auditCycleCaseId`;

-- DropTable
DROP TABLE `auditcyclecase`;

-- DropTable
DROP TABLE `compliancestatus`;

-- DropTable
DROP TABLE `relatedevidencedoc`;

-- CreateTable
CREATE TABLE `AuditDetails` (
    `id` VARCHAR(191) NOT NULL,
    `frameworkAttributeId` VARCHAR(191) NOT NULL,
    `auditCycleId` INTEGER NOT NULL,
    `auditBy` VARCHAR(191) NULL,
    `statusId` INTEGER NOT NULL,
    `attachmentUrl` TEXT NULL,
    `attachmentName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AuditDetails_frameworkAttributeId_idx`(`frameworkAttributeId`),
    INDEX `AuditDetails_auditCycleId_idx`(`auditCycleId`),
    INDEX `AuditDetails_auditBy_idx`(`auditBy`),
    UNIQUE INDEX `AuditDetails_frameworkAttributeId_auditCycleId_key`(`frameworkAttributeId`, `auditCycleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditRules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `statusId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AuditCycle_frameworkId_idx` ON `AuditCycle`(`frameworkId`);

-- AddForeignKey
ALTER TABLE `AuditDetails` ADD CONSTRAINT `AuditDetails_frameworkAttributeId_fkey` FOREIGN KEY (`frameworkAttributeId`) REFERENCES `FrameworkAttribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditDetails` ADD CONSTRAINT `AuditDetails_auditCycleId_fkey` FOREIGN KEY (`auditCycleId`) REFERENCES `AuditCycle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditDetails` ADD CONSTRAINT `AuditDetails_auditBy_fkey` FOREIGN KEY (`auditBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditDetails` ADD CONSTRAINT `AuditDetails_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `auditStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditCycle` ADD CONSTRAINT `AuditCycle_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `auditStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditCycle` ADD CONSTRAINT `AuditCycle_frameworkId_fkey` FOREIGN KEY (`frameworkId`) REFERENCES `Framework`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditRules` ADD CONSTRAINT `auditRules_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `auditStatus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
