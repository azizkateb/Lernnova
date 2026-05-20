-- AlterTable
ALTER TABLE `users` ADD COLUMN `avatar_url` VARCHAR(500) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `headline` VARCHAR(150) NULL;
