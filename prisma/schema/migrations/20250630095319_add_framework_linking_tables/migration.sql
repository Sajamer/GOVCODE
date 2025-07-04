-- CreateTable
CREATE TABLE `FrameworkLink` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `sourceFrameworkId` VARCHAR(191) NOT NULL,
    `sourceAttributeId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FrameworkLink_sourceFrameworkId_idx`(`sourceFrameworkId`),
    INDEX `FrameworkLink_sourceAttributeId_idx`(`sourceAttributeId`),
    INDEX `FrameworkLink_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FrameworkLinkItem` (
    `id` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `order` INTEGER NOT NULL DEFAULT 1,
    `frameworkLinkId` VARCHAR(191) NOT NULL,
    `targetFrameworkId` VARCHAR(191) NOT NULL,
    `targetAttributeId` VARCHAR(191) NULL,
    `displayConfig` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FrameworkLinkItem_frameworkLinkId_idx`(`frameworkLinkId`),
    INDEX `FrameworkLinkItem_targetFrameworkId_idx`(`targetFrameworkId`),
    INDEX `FrameworkLinkItem_targetAttributeId_idx`(`targetAttributeId`),
    UNIQUE INDEX `FrameworkLinkItem_frameworkLinkId_level_order_key`(`frameworkLinkId`, `level`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FrameworkLink` ADD CONSTRAINT `FrameworkLink_sourceFrameworkId_fkey` FOREIGN KEY (`sourceFrameworkId`) REFERENCES `Framework`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FrameworkLink` ADD CONSTRAINT `FrameworkLink_sourceAttributeId_fkey` FOREIGN KEY (`sourceAttributeId`) REFERENCES `FrameworkAttribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FrameworkLink` ADD CONSTRAINT `FrameworkLink_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FrameworkLinkItem` ADD CONSTRAINT `FrameworkLinkItem_frameworkLinkId_fkey` FOREIGN KEY (`frameworkLinkId`) REFERENCES `FrameworkLink`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FrameworkLinkItem` ADD CONSTRAINT `FrameworkLinkItem_targetFrameworkId_fkey` FOREIGN KEY (`targetFrameworkId`) REFERENCES `Framework`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FrameworkLinkItem` ADD CONSTRAINT `FrameworkLinkItem_targetAttributeId_fkey` FOREIGN KEY (`targetAttributeId`) REFERENCES `FrameworkAttribute`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
