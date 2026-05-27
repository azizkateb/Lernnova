-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_verification_expires` DATETIME(3) NULL,
    ADD COLUMN `email_verification_token` VARCHAR(255) NULL,
    ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `password_reset_expires` DATETIME(3) NULL,
    ADD COLUMN `password_reset_token` VARCHAR(255) NULL;
