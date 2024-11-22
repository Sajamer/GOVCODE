/*
  Warnings:

  - You are about to drop the column `identifier` on the `verification_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,token]` on the table `verification_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `verification_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `verification_tokens_identifier_token_key` ON `verification_tokens`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `emailVerified` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `verification_tokens` DROP COLUMN `identifier`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `verification_tokens_email_token_key` ON `verification_tokens`(`email`, `token`);
