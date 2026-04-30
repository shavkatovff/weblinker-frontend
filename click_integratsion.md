# Click to‘lovi — Otbozor `horse-backend` integratsiyasi

Bu hujjat [Click](https://docs.click.uz) merchant to‘lov oqimining **shu backendda** qanday ulanganini va qaysi API orqali ishlatilishini tushuntiradi. Kod asoslari: `src/payments/payment.service.ts`, `src/payments/payment.controller.ts`.

---

## 1. Umumiy sxema

1. **Mijoz** JWT bilan himoyalangan endpoint orqali **invoice** yaratadi → server `payments` jadvaliga `PENDING` yozuv ochadi va **Click to‘lov sahifasi URL** qaytaradi.
2. Mijoz brauzerda `https://my.click.uz/services/pay?...` ga o‘tadi, Click orqali to‘laydi.
3. **Click** serveringizga ikki bosqichda so‘rov yuboradi:
   - **Prepare** (`action = 0`) — buyurtmani tekshirish, summa va imzo.
   - **Complete** (`action = 1`) — pul yechilgach yakuniy tasdiq; shu yerda biz biznes-mantiqni (e‘lon/paket/mahsulot) yangilaymiz.
4. To‘lovdan keyin foydalanuvchi **return_url** bo‘yicha frontendga qaytadi; holatni `GET .../payments/status/:id` yoki mahsulot uchun `product-status/:id` bilan tekshirish mumkin.

Rasmiy Click talablari: [Merchant API — Request](https://docs.click.uz/en/merchant-api-request/) (Prepare/Complete, MD5 imzo).

---

## 2. Muhit o‘zgaruvchilari (`.env`)

| O‘zgaruvchi | Ma’nosi |
|-------------|---------|
| `CLICK_SERVICE_ID` | Click kabinetidagi **service_id** |
| `CLICK_MERCHANT_ID` | **merchant_id** (to‘lov URL uchun) |
| `CLICK_SECRET_KEY` | Merchant **secret_key** — faqat serverda; imzo tekshiruvi uchun |
| `FRONTEND_URL` | `return_url` va natija sahifalari bazasi (masalan `https://otbozor.uz`) |

> **Muhim:** `CLICK_SECRET_KEY` ni repozitoriyga commit qilmang. Kodda default qiymatlar bor — productionda har doim `.env` orqali o‘z qiymatlaringizni bering.

Global API prefiks: `api` (`main.ts`), shuning uchun webhook to‘liq yo‘l: **`/api/payments/click/prepare`** va **`/api/payments/click/complete`**.

---

## 3. Click Merchant kabinetida sozlash

Click merchant interfeysida quyidagi **URL manzillar** ko‘rsatilishi kerak (HTTPS, tashqi dunyodan ochilishi shart):

| Bosqich | Yo‘l (backend domeningiz bilan) |
|---------|----------------------------------|
| Prepare | `https://<API_HOST>/api/payments/click/prepare` |
| Complete | `https://<API_HOST>/api/payments/click/complete` |

Server **`application/x-www-form-urlencoded`** tan oladi (`main.ts` da `urlencoded` parser yoqilgan). Endpointlar `@Public()` — JWT talab qilinmaydi (Click serverdan keladi).

---

## 4. To‘lov sahifasiga yo‘naltirish (Click Pass URL)

Barcha invoice metodlari bir xil shablonda **to‘lov linki** quradi:

```text
https://my.click.uz/services/pay
  ?service_id=<CLICK_SERVICE_ID>
  &merchant_id=<CLICK_MERCHANT_ID>
  &amount=<summa so‘mda>
  &transaction_param=<payment.id>
  &return_url=<encode qilingan frontend URL>
```

- **`transaction_param`** — bizda bu **`Payment.id`** (UUID). Click uni **merchant_trans_id** sifatida Prepare/Complete da qaytaradi — shu ID bo‘yicha `payments` qatorini topamiz.
- **`return_url`** — har xil to‘lov turiga qarab alohida (quyida jadvalda).

---

## 5. Imzo (MD5) — Click bilan moslik

Kod `crypto.createHash('md5')` bilan qatorlarni **birlashtirib** (concat) heks qiladi. [Click hujjati](https://docs.click.uz/en/merchant-api-request/) bilan mos.

**Prepare (`action = 0`):**

```text
MD5( click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time )
```

**Complete (`action = 1`):**

```text
MD5( click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time )
```

`sign_string` tana parametridan keladi; mos kelmasa javob: `error: -1`, `error_note: 'SIGN CHECK FAILED!'`.

---

## 6. Prepare webhook — `POST /api/payments/click/prepare`

**Kutilgan parametrlar** (string sifatida ishlatiladi): `click_trans_id`, `service_id`, `click_paydoc_id`, `merchant_trans_id`, `amount`, `action`, `sign_time`, `sign_string`, `error`.

**Tekshiruvlar:**

- Imzo, `service_id` mosligi, `action === 0`.
- `merchant_trans_id` → `Payment` topilishi, status `COMPLETED` emas, `CANCELLED` emas.
- Summa: DB dagi `payment.amount` bilan Click `amount` farqi **1 so‘mdan oshmasin**.
- Agar `error < 0` bo‘lsa — to‘lov bekor; yozuv `CANCELLED`, `clickTransId` saqlanishi mumkin.

**Muvaffaqiyatli javob** (JSON obyekt sifatida qaytariladi):

- `click_trans_id`, `merchant_trans_id`, `merchant_prepare_id` (DB dagi `merchantPrepareId`), `error: 0`, `error_note: 'Success'`.
- Muvaffaqiyatda `clickTransId` va `clickPaydocId` yangilanadi.

---

## 7. Complete webhook — `POST /api/payments/click/complete`

**Parametrlar:** Prepare ga qo‘shimcha `merchant_prepare_id` (Prepare javobidagi `merchant_prepare_id` bilan bir xil bo‘lishi kerak).

**Tekshiruvlar:** Complete uchun MD5, `service_id`, `action === 1`, to‘lov holati, summa (yana ±1 so‘m).

**`error < 0`:** `Payment` → `CANCELLED`.

**`error >= 0` (muvaffaqiyat):** `Payment` → `COMPLETED`, keyin **to‘lov turiga qarab** biznes-mantiq:

| Shart (payment) | Natija |
|-----------------|--------|
| `listingBundleSize` bor, `listingId` yo‘q | Foydalanuvchiga `listingCredits` += bundle |
| `listingBundleSize` bor, `listingId` bor | Kredit += `bundleSize - 1`, e‘lon `PENDING`, `isPaid: true` |
| `listingId` + `packageType` (boost) | E‘lon: `isPaid`, `isTop`, `isPremium` (faqat TURBO), `publishedAt`, `boostExpiresAt` |
| `listingId`, `packageType` yo‘q (reaktivatsiya / nashr) | E‘lon `PENDING`; agar oldin `DRAFT` bo‘lsa `isPaid: true` |
| `productId` | Mahsulot `isPaid: true` (status admin tasdigigacha `DRAFT` bo‘lishi mumkin) |

Boost to‘lovi yakunida Telegram kanalga e‘lon joylashishi (`TelegramChannelService`) va mahsulot uchun admin xabari — xatolarda to‘lov javobini buzmaslik uchun `catch` bilan.

**Javob:** `click_trans_id`, `merchant_trans_id`, `merchant_confirm_id` (= `merchantPrepareId`), `error: 0`, `error_note: 'Success'`.

---

## 8. Ma’lumotlar bazasi — `Payment` modeli

`prisma/schema.prisma` — `payments` jadvali:

- `id` — UUID, Click da `merchant_trans_id` / `transaction_param`.
- `amount`, `status` (`PENDING` | `COMPLETED` | `FAILED` | `CANCELLED`).
- `packageType` — boost paketlari uchun enum.
- `listingId`, `productId`, `listingBundleSize` — qaysi ssenariy ekanini ajratish uchun.
- `merchantPrepareId` — tasodifiy butun son; Prepare/Complete zanjiri uchun Click talabi.
- `clickTransId`, `clickPaydocId` — Click identifikatorlari.

---

## 9. Invoice yaratish endpointlari (JWT kerak)

Barchasi `PaymentController` ostida, prefiks `api/payments`:

| Metod | Yo‘l | Vazifa |
|-------|------|--------|
| POST | `/create-invoice` | Tasdiqlangan e‘longa boost paketi (`listingId`, `packageType`) |
| POST | `/create-reactivation-invoice` | `EXPIRED` e‘lonni qayta faollashtirish |
| POST | `/create-listing-bundle-invoice` | Qoralama e‘longa nashr paketi (5/10/20) |
| POST | `/create-credit-bundle-invoice` | Faqat kreditlar (e‘lonsiz) |
| POST | `/create-product-invoice` | Mahsulot joylashuvi to‘lovi |
| POST | `/boost-package` | Reklama paketi (ixtiyoriy `listingId`) |

Javob shakli umuman: `{ success: true, data: { paymentId, amount, clickUrl } }`.

**return_url** misollari (kod bilan mos):

- Boost (e‘lon bilan): `/elon/:listingId/tolov/natija?paymentId=...`
- Reaktivatsiya: xuddi shu pattern.
- Nashr to‘lovi (bundle + listing): `/elon/:listingId/nashr-tolov/natija?paymentId=...`
- Kredit paketi (listing yo‘q): `/paketlar/natija?paymentId=...`
- Boost paketi (listing ixtiyoriy): `/elon/:id/reklama-natija` yoki `/paketlar/natija`
- Mahsulot: `/mahsulot/:productId/tolov/natija?paymentId=...`

---

## 10. Narx manbalari

- Boost paketlari: `PACKAGE_DEFAULTS` + `AppSetting` kalitlari `listing_<slug>_price`, `listing_<slug>_discount`.
- Reaktivatsiya: `listing_reactivation_price`.
- Nashr paketlari: `listing_bundle_5_price`, `listing_bundle_10_price`, `listing_bundle_20_price`.
- Mahsulot: `product_listing_price`.

---

## 11. Xavfsizlik va ekspluatatsiya

- Webhook URL larni faqat HTTPS orqali oching; **secret_key** ni hech qayerda log qilmang.
- Prepare/Complete **imzo** asosida autentifikatsiya qilinadi; qo‘shimcha IP allowlist Click tomonda bo‘lishi mumkin (ularning qoidalariga qarang).
- CORS Click serverni bevosita ta’sirlamaydi (server-to-server POST).
- Agar webhook 5xx yoki noto‘g‘ri javob bersa, Click qayta urinadi — idempotent tekshiruvlar `COMPLETED` / `CANCELLED` holatlarida mavjud.

---

## 12. Foydali havolalar

- [Click Merchant — Request (Prepare/Complete)](https://docs.click.uz/en/merchant-api-request/)
- [Click Merchant — Overview](https://docs.click.uz/en/merchant/)

---

*Hujjat `horse-backend` kod bazasiga mos; o‘zgarishlardan keyin servis va controller fayllarini qayta tekshiring.*
