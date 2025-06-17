-- CreateTable
CREATE TABLE `Attachment` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `size` INTEGER NULL,
    `type` VARCHAR(191) NULL,
    `auditDetailId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Attachment_auditDetailId_idx`(`auditDetailId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_auditDetailId_fkey` FOREIGN KEY (`auditDetailId`) REFERENCES `AuditDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
