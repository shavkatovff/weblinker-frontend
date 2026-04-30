# Click To'lov Tizimi Integratsiyasi

## Umumiy Ma'lumot

Ushbu loyihada Click to'lov tizimi orqali quyidagi xizmatlar uchun to'lovlar qabul qilinadi:
- Ot e'lonlarini reklama qilish (OSON_START, TEZKOR_SAVDO, TURBO_SAVDO)
- E'lon nashr qilish uchun kredit paketlari (5, 10, 20 ta e'lon)
- Muddati tugagan e'lonlarni qayta faollashtirish
- Mahsulot e'lonlarini nashr qilish

## Texnik Arxitektura

### Backend (NestJS)
- **Modul**: `src/payments/`
- **Asosiy fayllar**:
  - `payment.controller.ts` - API endpointlar
  - `payment.service.ts` - Biznes logika va Click webhook handlerlari
  - `payment.module.ts` - Modul konfiguratsiyasi

### Frontend (Next.js)
- To'lov sahifalari va natija sahifalari
- Click to'lov URL'iga yo'naltirish

## Konfiguratsiya

### Environment Variables (.env)

```env
# Click To'lov Tizimi
CLICK_SERVICE_ID=95967
CLICK_MERCHANT_ID=44242
CLICK_MERCHANT_USER_ID=77952
CLICK_SECRET_KEY=M6EQFmuA1qlIl

# Frontend URL (Click return URL uchun)
FRONTEND_URL=https://otbozor.uz
```

### Database Schema (Prisma)

```prisma
model Payment {
  id                String          @id @default(uuid())
  listingId         String?         @map("listing_id")
  userId            String          @map("user_id")
  packageType       PaymentPackage? @map("package_type")
  amount            Decimal         @map("amount") @db.Decimal(15, 2)
  status            PaymentStatus   @default(PENDING)
  clickTransId      String?         @map("click_trans_id")
  clickPaydocId     String?         @map("click_paydoc_id")
  merchantPrepareId Int             @default(0) @map("merchant_prepare_id")
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")
  productId         String?         @map("product_id")
  listingBundleSize Int?            @map("listing_bundle_size")
  
  listing           HorseListing?   @relation(...)
  product           Product?        @relation(...)
  user              User            @relation(...)
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}

enum PaymentPackage {
  OSON_START      // 3 kun
  TEZKOR_SAVDO    // 7 kun
  TURBO_SAVDO     // 30 kun
}
```

## API Endpointlar

### 1. Reklama Paketlari Narxlarini Olish
```http
GET /payments/packages
```

**Response:**
```json
{
  "success": true,
  "data": {
    "OSON_START": {
      "amount": 41600,
      "originalAmount": 41600,
      "hasDiscount": false
    },
    "TEZKOR_SAVDO": {
      "amount": 85700,
      "originalAmount": 85700,
      "hasDiscount": false
    },
    "TURBO_SAVDO": {
      "amount": 249300,
      "originalAmount": 249300,
      "hasDiscount": false
    }
  }
}
```

### 2. Reklama Paketi Uchun Invoice Yaratish
```http
POST /payments/create-invoice
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "uuid",
  "packageType": "OSON_START"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "amount": 41600,
    "clickUrl": "https://my.click.uz/services/pay?service_id=95967&..."
  }
}
```

### 3. Kredit Paketi Narxlarini Olish
```http
GET /payments/listing-bundles
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bundle5": 50000,
    "bundle10": 90000,
    "bundle20": 160000
  }
}
```

### 4. Kredit Paketi Uchun Invoice Yaratish
```http
POST /payments/create-listing-bundle-invoice
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "uuid",
  "bundleSize": 5
}
```

### 5. E'lonni Qayta Faollashtirish Narxi
```http
GET /payments/reactivation-price
```

**Response:**
```json
{
  "success": true,
  "data": {
    "amount": 50000
  }
}
```

### 6. Qayta Faollashtirish Invoice
```http
POST /payments/create-reactivation-invoice
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "uuid"
}
```

### 7. Mahsulot Uchun Invoice
```http
POST /payments/create-product-invoice
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid"
}
```

### 8. To'lov Statusini Tekshirish
```http
GET /payments/status/:paymentId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "amount": 41600,
    "packageType": "OSON_START",
    "listing": {
      "id": "uuid",
      "title": "E'lon nomi",
      "slug": "elon-nomi",
      "isPaid": true
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Click Webhook Endpointlar

### 1. Prepare (Action 0)
```http
POST /payments/click/prepare
Content-Type: application/x-www-form-urlencoded

click_trans_id=123456
service_id=95967
click_paydoc_id=789
merchant_trans_id=<paymentId>
amount=41600
action=0
sign_time=2024-01-01 12:00:00
sign_string=<md5_hash>
error=0
```

**Response:**
```json
{
  "click_trans_id": "123456",
  "merchant_trans_id": "uuid",
  "merchant_prepare_id": 123456789,
  "error": 0,
  "error_note": "Success"
}
```

### 2. Complete (Action 1)
```http
POST /payments/click/complete
Content-Type: application/x-www-form-urlencoded

click_trans_id=123456
service_id=95967
click_paydoc_id=789
merchant_trans_id=<paymentId>
merchant_prepare_id=123456789
amount=41600
action=1
sign_time=2024-01-01 12:00:00
sign_string=<md5_hash>
error=0
```

**Response:**
```json
{
  "click_trans_id": "123456",
  "merchant_trans_id": "uuid",
  "merchant_confirm_id": 123456789,
  "error": 0,
  "error_note": "Success"
}
```

## Imzo (Signature) Tekshirish

### Prepare uchun:
```javascript
const sign = crypto
  .createHash('md5')
  .update(`${click_trans_id}${service_id}${secret_key}${merchant_trans_id}${amount}${action}${sign_time}`)
  .digest('hex');
```

### Complete uchun:
```javascript
const sign = crypto
  .createHash('md5')
  .update(`${click_trans_id}${service_id}${secret_key}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`)
  .digest('hex');
```

## To'lov Jarayoni

### 1. Reklama Paketi To'lovi
```
1. Foydalanuvchi paket tanlaydi (OSON_START/TEZKOR_SAVDO/TURBO_SAVDO)
2. Frontend POST /payments/create-invoice ga so'rov yuboradi
3. Backend Payment record yaratadi (status: PENDING)
4. Backend Click URL qaytaradi
5. Foydalanuvchi Click saytiga yo'naltiriladi
6. Foydalanuvchi to'lovni amalga oshiradi
7. Click PREPARE webhook chaqiradi (action=0)
8. Backend to'lovni tasdiqlaydi
9. Click COMPLETE webhook chaqiradi (action=1)
10. Backend:
    - Payment status -> COMPLETED
    - Listing isPaid=true, isTop=true, boostExpiresAt o'rnatiladi
    - TURBO_SAVDO uchun isPremium=true
    - Telegram kanaliga e'lon yuboriladi
11. Foydalanuvchi return_url ga qaytariladi
```

### 2. Kredit Paketi To'lovi
```
1. Foydalanuvchi paket hajmini tanlaydi (5/10/20)
2. Frontend POST /payments/create-listing-bundle-invoice
3. Backend Payment yaratadi (listingBundleSize set)
4. To'lov Click orqali amalga oshiriladi
5. COMPLETE webhook:
    - Payment status -> COMPLETED
    - User.listingCredits += bundleSize
    - Agar listingId mavjud bo'lsa:
      * Listing status -> PENDING (avtomatik yuboriladi)
      * User.listingCredits += (bundleSize - 1)
```

### 3. Qayta Faollashtirish To'lovi
```
1. Muddati tugagan e'lon (status: EXPIRED)
2. Frontend POST /payments/create-reactivation-invoice
3. Backend tekshiradi: listing.status === EXPIRED
4. To'lov amalga oshiriladi
5. COMPLETE webhook:
    - Payment status -> COMPLETED
    - Listing status -> PENDING (admin tasdiqlashi kerak)
```

### 4. Mahsulot To'lovi
```
1. Foydalanuvchi mahsulot yaratadi
2. Frontend POST /payments/create-product-invoice
3. To'lov amalga oshiriladi
4. COMPLETE webhook:
    - Payment status -> COMPLETED
    - Product isPaid=true
    - Admin Telegram orqali xabardor qilinadi
```

## Xatoliklar va Ularni Hal Qilish

### Click Error Kodlari

| Kod | Ma'nosi | Hal qilish |
|-----|---------|------------|
| -1  | SIGN CHECK FAILED | Secret key to'g'riligini tekshiring |
| -2  | Incorrect parameter | service_id yoki amount xato |
| -3  | Action not found | action 0 yoki 1 bo'lishi kerak |
| -4  | Already paid | To'lov allaqachon amalga oshirilgan |
| -5  | Transaction not found | merchant_trans_id (paymentId) topilmadi |
| -9  | Transaction cancelled | To'lov bekor qilingan |

### Keng Tarqalgan Muammolar

#### 1. Signature mismatch
```
Sabab: Secret key noto'g'ri yoki parametrlar tartibi xato
Yechim: 
- CLICK_SECRET_KEY ni tekshiring
- Parametrlar tartibini tekshiring
- sign_time formatini tekshiring
```

#### 2. Amount mismatch
```
Sabab: Click yuborgan amount va DB dagi amount mos kelmaydi
Yechim:
- 1 sum margin qo'shilgan (Math.abs(diff) > 1)
- Narxlarni AppSettings dan to'g'ri olganingizni tekshiring
```

#### 3. Webhook ishlamayapti
```
Sabab: Click serverdan webhook URL ga kirish imkoni yo'q
Yechim:
- URL public bo'lishi kerak
- HTTPS talab qilinadi (production)
- Firewall sozlamalarini tekshiring
```

## Test Qilish

### 1. Development Muhitida
```bash
# ngrok orqali local serverni expose qilish
ngrok http 5000

# .env da URL ni yangilash
APP_URL=https://your-ngrok-url.ngrok-free.app
FRONTEND_URL=https://your-frontend-ngrok.ngrok-free.app
```

### 2. Click Test Kartasi
```
Karta: 8600 4954 7331 6478
Amal qilish muddati: 03/99
SMS kod: 666666
```

### 3. Webhook Testlash
```bash
# Prepare webhook
curl -X POST http://localhost:5000/payments/click/prepare \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "click_trans_id=123&service_id=95967&merchant_trans_id=<paymentId>&amount=41600&action=0&sign_time=2024-01-01 12:00:00&sign_string=<hash>&error=0"

# Complete webhook
curl -X POST http://localhost:5000/payments/click/complete \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "click_trans_id=123&service_id=95967&merchant_trans_id=<paymentId>&merchant_prepare_id=123456&amount=41600&action=1&sign_time=2024-01-01 12:00:00&sign_string=<hash>&error=0"
```

## Monitoring va Logging

### Payment Logs
```typescript
// payment.service.ts da
console.log('📥 Click PREPARE:', { merchant_trans_id, amount, action, error });
console.log('📥 Click COMPLETE:', { merchant_trans_id, amount, action, error });
console.log('✅ Payment completed:', paymentId);
console.log('❌ Sign mismatch:', { expected, got });
```

### Database Queries
```sql
-- Pending to'lovlar
SELECT * FROM payments WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '1 hour';

-- Bugungi to'lovlar
SELECT COUNT(*), SUM(amount) FROM payments 
WHERE status = 'COMPLETED' AND DATE(created_at) = CURRENT_DATE;

-- Paket bo'yicha statistika
SELECT package_type, COUNT(*), SUM(amount) FROM payments 
WHERE status = 'COMPLETED' 
GROUP BY package_type;
```

## Production Checklist

- [ ] HTTPS sozlangan
- [ ] Click webhook URL lari to'g'ri konfiguratsiya qilingan
- [ ] Secret key xavfsiz saqlangan
- [ ] Error handling to'liq amalga oshirilgan
- [ ] Logging va monitoring o'rnatilgan
- [ ] Database backup strategiyasi mavjud
- [ ] Rate limiting qo'shilgan
- [ ] Transaction idempotency ta'minlangan
- [ ] Webhook retry mexanizmi mavjud (Click tomonidan)

## Qo'shimcha Resurslar

- [Click Merchant API Dokumentatsiyasi](https://docs.click.uz/merchant-api/)
- [Click Test Muhiti](https://test.click.uz/)
- [Click Support](https://click.uz/support)

## Muallif va Yordam

Savollar yoki muammolar bo'lsa:
- Telegram: @shahriyorjs
- Email: support@otbozor.uz
