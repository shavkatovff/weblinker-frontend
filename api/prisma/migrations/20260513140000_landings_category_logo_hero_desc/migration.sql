-- Landing jadvaliga: kategoriya, logo URL, hero qisqa matni (Prisma `category`, `logourl`, `description` @map("hero_desc"))

ALTER TABLE "landings" ADD COLUMN "category" TEXT NOT NULL DEFAULT '';

ALTER TABLE "landings" ADD COLUMN "logourl" TEXT NOT NULL DEFAULT '';

ALTER TABLE "landings" ADD COLUMN "hero_desc" TEXT NOT NULL DEFAULT 'Qisqacha tavsif yozing';
