-- Obuna tugashi haqida bot xabari (bir marta)
ALTER TABLE "vizitkas" ADD COLUMN "expiry_notice_sent_at" TIMESTAMP(3);

CREATE INDEX "vizitkas_expiry_notice_idx" ON "vizitkas" ("expired_at", "expiry_notice_sent_at");
