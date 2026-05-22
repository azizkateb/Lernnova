-- CreateTable
CREATE TABLE `service_inquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service_id` INTEGER NOT NULL,
    `buyer_id` INTEGER NOT NULL,
    `seller_id` INTEGER NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'open',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `service_inquiries_service_id_idx`(`service_id`),
    INDEX `service_inquiries_buyer_id_idx`(`buyer_id`),
    INDEX `service_inquiries_seller_id_idx`(`seller_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_inquiry_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inquiry_id` INTEGER NOT NULL,
    `sender_id` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_inquiry_messages_inquiry_id_idx`(`inquiry_id`),
    INDEX `service_inquiry_messages_sender_id_idx`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_inquiries` ADD CONSTRAINT `service_inquiries_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `service_inquiries` ADD CONSTRAINT `service_inquiries_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `service_inquiries` ADD CONSTRAINT `service_inquiries_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_inquiry_messages` ADD CONSTRAINT `service_inquiry_messages_inquiry_id_fkey` FOREIGN KEY (`inquiry_id`) REFERENCES `service_inquiries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `service_inquiry_messages` ADD CONSTRAINT `service_inquiry_messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

