-- CreateTable
CREATE TABLE "landings" (
    "id" TEXT NOT NULL,
    "owner_public_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT '10kun',
    "expired_at" TIMESTAMP(3),

    "block_header" BOOLEAN NOT NULL DEFAULT true,
    "block_hero" BOOLEAN NOT NULL DEFAULT true,
    "block_about" BOOLEAN NOT NULL DEFAULT true,
    "block_faq" BOOLEAN NOT NULL DEFAULT true,
    "block_contact" BOOLEAN NOT NULL DEFAULT true,
    "block_footer" BOOLEAN NOT NULL DEFAULT true,
    "block_theme" TEXT NOT NULL DEFAULT '1',

    "brand_name" TEXT NOT NULL DEFAULT 'Mening saytim',
    "nav_about" TEXT NOT NULL DEFAULT 'Biz haqimizda',
    "nav_faq" TEXT NOT NULL DEFAULT 'FAQ',
    "nav_contact" TEXT NOT NULL DEFAULT 'Aloqa',
    "nav_cta" TEXT NOT NULL DEFAULT 'Bog''lanish',

    "hero_title" TEXT NOT NULL DEFAULT '',
    "hero_cta" TEXT NOT NULL DEFAULT 'Bog''lanish',
    "hero_image_url" TEXT NOT NULL DEFAULT '',

    "about_title" TEXT NOT NULL DEFAULT '',
    "about_lead" TEXT NOT NULL DEFAULT '',
    "about_image_url" TEXT NOT NULL DEFAULT '',
    "about_bullet_1" TEXT NOT NULL DEFAULT '',
    "about_bullet_2" TEXT NOT NULL DEFAULT '',
    "about_bullet_3" TEXT NOT NULL DEFAULT '',
    "about_bullet_4" TEXT NOT NULL DEFAULT '',

    "faq_1_q" TEXT NOT NULL DEFAULT '',
    "faq_1_a" TEXT NOT NULL DEFAULT '',
    "faq_2_q" TEXT NOT NULL DEFAULT '',
    "faq_2_a" TEXT NOT NULL DEFAULT '',
    "faq_3_q" TEXT NOT NULL DEFAULT '',
    "faq_3_a" TEXT NOT NULL DEFAULT '',
    "faq_4_q" TEXT NOT NULL DEFAULT '',
    "faq_4_a" TEXT NOT NULL DEFAULT '',

    "contact_subtitle" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "phone_tel" TEXT NOT NULL DEFAULT '',
    "telegram" TEXT NOT NULL DEFAULT '',
    "hours" TEXT NOT NULL DEFAULT '',

    "footer_copyright_suffix" TEXT NOT NULL DEFAULT '',

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landings_name_key" ON "landings"("name");

-- CreateIndex
CREATE INDEX "landings_owner_public_id_idx" ON "landings"("owner_public_id");

-- AddForeignKey
ALTER TABLE "landings" ADD CONSTRAINT "landings_owner_public_id_fkey" FOREIGN KEY ("owner_public_id") REFERENCES "users"("public_id") ON DELETE CASCADE ON UPDATE CASCADE;
