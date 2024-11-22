/*
  Warnings:

  - You are about to drop the column `hashed_pass` on the `passwords` table. All the data in the column will be lost.
  - Added the required column `hash` to the `passwords` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `passwords` DROP COLUMN `hashed_pass`,
    ADD COLUMN `hash` VARCHAR(191) NOT NULL;
