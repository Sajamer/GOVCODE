/*
  Warnings:

  - You are about to alter the column `taskType` on the `taskmanagement` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(8))` to `Enum(EnumId(6))`.

*/
-- AlterTable
ALTER TABLE `taskmanagement` MODIFY `taskType` ENUM('KPI_RELATED', 'AUDIT_RELATED') NOT NULL DEFAULT 'KPI_RELATED';
