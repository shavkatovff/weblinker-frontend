-- CreateTable
CREATE TABLE "landing_publications" (
    "id" TEXT NOT NULL,
    "owner_public_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "template_id" TEXT NOT NULL DEFAULT 'simple',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "content_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_inquiries" (
    "id" SERIAL NOT NULL,
    "landing_id" TEXT NOT NULL,
    "owner_user_id" INTEGER NOT NULL,
    "visitor_name" VARCHAR(200) NOT NULL,
    "visitor_phone" VARCHAR(40) NOT NULL,
    "visitor_telegram" VARCHAR(80),
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_publications_slug_key" ON "landing_publications"("slug");

-- CreateIndex
CREATE INDEX "landing_publications_owner_public_id_idx" ON "landing_publications"("owner_public_id");

-- CreateIndex
CREATE INDEX "landing_inquiries_landing_id_idx" ON "landing_inquiries"("landing_id");

-- CreateIndex
CREATE INDEX "landing_inquiries_owner_user_id_idx" ON "landing_inquiries"("owner_user_id");

-- AddForeignKey
ALTER TABLE "landing_publications" ADD CONSTRAINT "landing_publications_owner_public_id_fkey" FOREIGN KEY ("owner_public_id") REFERENCES "users"("public_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_inquiries" ADD CONSTRAINT "landing_inquiries_landing_id_fkey" FOREIGN KEY ("landing_id") REFERENCES "landing_publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_inquiries" ADD CONSTRAINT "landing_inquiries_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
