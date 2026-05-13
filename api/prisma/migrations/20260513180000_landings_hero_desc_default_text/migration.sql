-- `hero_desc` uchun mazmunli default (yangi qatorlar, INSERT da maydon berilmasa)

ALTER TABLE "landings"
ALTER COLUMN "hero_desc" SET DEFAULT 'Mijozlarimiz uchun qulay maskan — sifatli xizmat va yoqimli muhit.';
