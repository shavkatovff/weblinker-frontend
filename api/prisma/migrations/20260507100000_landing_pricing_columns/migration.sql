-- Landing paket narxlari (vizitkadan mustaqil)
ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "landing_paket_6_som" INTEGER NOT NULL DEFAULT 780000;
ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "landing_paket_12_som" INTEGER NOT NULL DEFAULT 1180000;
