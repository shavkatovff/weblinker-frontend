-- Vizitka: `user_id` (users.id) -> `owner_public_id` (users.public_id)

ALTER TABLE "vizitkas" ADD COLUMN IF NOT EXISTS "owner_public_id" TEXT;

UPDATE "vizitkas" AS v
SET "owner_public_id" = u."public_id"
FROM "users" AS u
WHERE u."id" = v."user_id";

DELETE FROM "vizitkas" WHERE "owner_public_id" IS NULL;

ALTER TABLE "vizitkas" DROP CONSTRAINT IF EXISTS "vizitkas_user_id_fkey";

DROP INDEX IF EXISTS "vizitkas_user_id_idx";

ALTER TABLE "vizitkas" DROP COLUMN IF EXISTS "user_id";

ALTER TABLE "vizitkas" ALTER COLUMN "owner_public_id" SET NOT NULL;

ALTER TABLE "vizitkas"
  ADD CONSTRAINT "vizitkas_owner_public_id_fkey"
  FOREIGN KEY ("owner_public_id") REFERENCES "users"("public_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "vizitkas_owner_public_id_idx" ON "vizitkas"("owner_public_id");
