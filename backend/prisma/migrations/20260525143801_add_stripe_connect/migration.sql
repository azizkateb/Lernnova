-- AlterTable
ALTER TABLE `product_orders` ADD COLUMN `connected_account_id` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `service_orders` ADD COLUMN `connected_account_id` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `stripe_account_id` VARCHAR(255) NULL,
    ADD COLUMN `stripe_charges_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `stripe_details_submitted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `stripe_onboarding_complete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `stripe_payouts_enabled` BOOLEAN NOT NULL DEFAULT false;
