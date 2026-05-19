/*
  Warnings:

  - A unique constraint covering the columns `[stripe_session_id]` on the table `product_orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `product_orders` ADD COLUMN `stripe_payment_intent_id` VARCHAR(255) NULL,
    ADD COLUMN `stripe_session_id` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `product_orders_stripe_session_id_key` ON `product_orders`(`stripe_session_id`);
