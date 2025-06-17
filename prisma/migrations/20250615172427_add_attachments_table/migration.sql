/*
  Warnings:

  - You are about to drop the column `attachmentName` on the `auditdetails` table. All the data in the column will be lost.
  - You are about to drop the column `attachmentUrl` on the `auditdetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `auditdetails` DROP COLUMN `attachmentName`,
    DROP COLUMN `attachmentUrl`;
