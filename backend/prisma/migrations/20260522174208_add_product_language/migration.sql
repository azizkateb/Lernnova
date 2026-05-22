-- AlterTable
ALTER TABLE `products` ADD COLUMN `language` ENUM('ar', 'en', 'de') NOT NULL DEFAULT 'en';
