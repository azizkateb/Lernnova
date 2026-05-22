-- AlterTable
ALTER TABLE `order_messages`
    ADD COLUMN `attachment_url` VARCHAR(500) NULL,
    ADD COLUMN `attachment_name` VARCHAR(255) NULL,
    ADD COLUMN `attachment_type` VARCHAR(100) NULL,
    ADD COLUMN `attachment_size` INTEGER NULL;

-- AlterTable
ALTER TABLE `service_inquiry_messages`
    ADD COLUMN `attachment_url` VARCHAR(500) NULL,
    ADD COLUMN `attachment_name` VARCHAR(255) NULL,
    ADD COLUMN `attachment_type` VARCHAR(100) NULL,
    ADD COLUMN `attachment_size` INTEGER NULL;

