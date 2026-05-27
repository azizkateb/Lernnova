-- AlterTable
ALTER TABLE users ADD COLUMN public_id VARCHAR(50) NULL,
    ADD COLUMN profile_slug VARCHAR(100) NULL;

-- CreateIndex
CREATE UNIQUE INDEX users_public_id_key ON users(public_id);
CREATE UNIQUE INDEX users_profile_slug_key ON users(profile_slug);
