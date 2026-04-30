-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('UZ', 'RU', 'EN');

-- CreateEnum
CREATE TYPE "VizitkaStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "telegram_id" TEXT,
    "login_otp" TEXT,
    "login_otp_expires_at" TIMESTAMP(3),
    "user_id" TEXT,
    "username" TEXT,
    "full_name" TEXT,
    "refresh_token" TEXT,
    "refresh_token_exp" TIMESTAMP(3),
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lang" "Lang" NOT NULL DEFAULT 'UZ',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "merchant_trans_id" TEXT NOT NULL,
    "click_trans_id" TEXT,
    "click_paydoc_id" TEXT,
    "merchant_prepare_id" INTEGER,
    "merchant_confirm_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tg_users" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "number" TEXT NOT NULL,
    "full_name" TEXT,
    "login_otp" TEXT,
    "login_otp_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tg_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vizitkas" (
    "id" TEXT NOT NULL,
    "owner_public_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'vizitka',
    "expired_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "headline" TEXT,
    "category" TEXT,
    "photo_url" TEXT,
    "contact_number" TEXT,
    "address" TEXT,
    "work_hour" TEXT,
    "short_description" TEXT,
    "description" TEXT,
    "template_id" TEXT,
    "color_theme_id" TEXT,
    "pattern_id" TEXT,
    "status" "VizitkaStatus" NOT NULL DEFAULT 'DRAFT',
    "map_link" TEXT,
    "instagram_link" TEXT,
    "telegram_link" TEXT,
    "tiktok_link" TEXT,
    "youtube_link" TEXT,
    "facebook_link" TEXT,
    "linkedin_link" TEXT,
    "x_link" TEXT,
    "threads_link" TEXT,
    "whatsapp_link" TEXT,
    "website_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vizitkas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_public_id_key" ON "users"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_number_key" ON "users"("number");

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_key" ON "users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_merchant_trans_id_key" ON "payments"("merchant_trans_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tg_users_userId_key" ON "tg_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tg_users_number_key" ON "tg_users"("number");

-- CreateIndex
CREATE UNIQUE INDEX "vizitkas_name_key" ON "vizitkas"("name");

-- CreateIndex
CREATE INDEX "vizitkas_owner_public_id_idx" ON "vizitkas"("owner_public_id");

-- CreateIndex
CREATE INDEX "vizitkas_name_idx" ON "vizitkas"("name");

-- CreateIndex
CREATE INDEX "vizitkas_status_idx" ON "vizitkas"("status");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vizitkas" ADD CONSTRAINT "vizitkas_owner_public_id_fkey" FOREIGN KEY ("owner_public_id") REFERENCES "users"("public_id") ON DELETE CASCADE ON UPDATE CASCADE;
