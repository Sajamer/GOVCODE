/*
  Warnings:

  - Added the required column `fullName` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invitation` ADD COLUMN `fullName` VARCHAR(191) NOT NULL;
