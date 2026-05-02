-- Vizitka narxlari va bepul sinov muddati (yagona qator id=1)
CREATE TABLE "app_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "free_publish_days" INTEGER NOT NULL DEFAULT 10,
    "paket_3_som" INTEGER NOT NULL DEFAULT 37000,
    "paket_6_som" INTEGER NOT NULL DEFAULT 57000,
    "paket_12_som" INTEGER NOT NULL DEFAULT 97000,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "app_settings" ("id", "free_publish_days", "paket_3_som", "paket_6_som", "paket_12_som", "updated_at")
VALUES (1, 10, 37000, 57000, 97000, CURRENT_TIMESTAMP);
