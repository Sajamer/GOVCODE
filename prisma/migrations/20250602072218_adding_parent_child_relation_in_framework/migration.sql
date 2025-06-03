-- AlterTable
ALTER TABLE `frameworkattribute` ADD COLUMN `colIndex` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `parentId` VARCHAR(191) NULL,
    ADD COLUMN `rowIndex` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `FrameworkAttribute_parentId_idx` ON `FrameworkAttribute`(`parentId`);

-- AddForeignKey
ALTER TABLE `FrameworkAttribute` ADD CONSTRAINT `FrameworkAttribute_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `FrameworkAttribute`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
