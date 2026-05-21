-- AlterTable
ALTER TABLE `service_orders` ADD COLUMN `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending';
ALTER TABLE `service_orders` ADD COLUMN `payment_method` VARCHAR(50) NULL;
ALTER TABLE `service_orders` ADD COLUMN `stripe_session_id` VARCHAR(255) NULL;
ALTER TABLE `service_orders` ADD COLUMN `stripe_payment_intent_id` VARCHAR(255) NULL;
ALTER TABLE `service_orders` ADD COLUMN `paid_at` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `service_orders_stripe_session_id_key` ON `service_orders`(`stripe_session_id`);
