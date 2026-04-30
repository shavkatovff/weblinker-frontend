# weblinker.uz — SSL (Let’s Encrypt) va ulash

Bepul sertifikat: [Let’s Encrypt](https://letsencrypt.org/). Serverda **Certbot** + **Nginx** plugin ishlatiladi.

## 1. Oldindan tekshiruvlar

| Tekshiruv | Buyruq / qoida |
|-----------|----------------|
| DNS | `weblinker.uz`, `www.weblinker.uz`, `api.weblinker.uz` **A** yozuvlari server **ochiq IP** siga ishora qiladi. |
| 80-port | Tashqaridan ochiq: `curl -I http://weblinker.uz` — javob kelishi kerak (200 yoki 301). |
| Nginx | Loyihangizdagi site yoqilgan, `sudo nginx -t` xatosiz. |
| Ilovalar | Next (`127.0.0.1:8000`) va API (`127.0.0.1:8001`) PM2 orqali ishlayapti — aks holda HTTPS ochilganda ham 502 bo‘lishi mumkin. |

O‘rnatish (agar yo‘q bo‘lsa):

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

## 1a. Certbotdan oldin: Nginx `nginx -t` xatosiz bo‘lishi kerak

Certbot ishga tushishidan oldin **`sudo nginx -t`** muvaffaqiyatli tugashi shart. Agar ilgari noto‘g‘ri `cp` yoki yo‘l bilan symlink qilingan bo‘lsa, xato:

```text
open() "/etc/nginx/sites-enabled/weblinker" failed (2: No such file or directory)
```

Bu — **`sites-enabled/weblinker`** bor, lekin **`sites-available/weblinker`** yo‘q yoki symlink buzilgan.

**Tuzatish** (loyiha yo‘lingizni qo‘ying; root uchun `~/weblinker-frontend`):

```bash
sudo rm -f /etc/nginx/sites-enabled/weblinker

sudo cp ~/weblinker-frontend/deploy/nginx-weblinker.conf.example \
  /etc/nginx/sites-available/weblinker

sudo ln -sf /etc/nginx/sites-available/weblinker /etc/nginx/sites-enabled/weblinker

sudo nginx -t && sudo systemctl reload nginx
```

Keyin yana **§ 2** dagi `certbot --nginx` buyrug‘ini bajaring.

## 1b. DNS: `api` alohida yozuv talab qiladi

`weblinker.uz` A yozuvi **avtomatik ravishda** `api.weblinker.uz` ni yaratmaydi. Registrator yoki DNS (Cloudflare, UZINFOCOM va hokazo) panelida **alohida** yozuv qo‘shing:

| Yozuv (host) | Turi | Qiymat |
|--------------|------|--------|
| `api` yoki to‘liq `api.weblinker.uz` | **A** | serveringizning **o‘sha** IP manzili (asosiy domen bilan bir xil) |

Serverda sinov (NXDOMAIN bo‘lmasa, IP qaytadi):

```bash
dig +short api.weblinker.uz A
# yoki
getent hosts api.weblinker.uz
```

Yangilanish 1–10 daqiqadan 48 soatgacha cho‘zilishi mumkin. **Let’s Encrypt** xatosi `NXDOMAIN` yoki `DNS problem` — hali A yozuv yo‘q yoki hali tarqalmagan.

**Sertifikatga `api` qo‘shish** (DNS ishlay boshlagach):

```bash
sudo certbot --nginx \
  -d weblinker.uz \
  -d www.weblinker.uz \
  -d api.weblinker.uz
```

Agar sertifikat allaqachon 2 domen bilan olingan bo‘lsa, shu buyruq odatda mavjud sertifikatni **kengaytiradi** (`--expand` kerak bo‘lsa certbot so‘raydi).

## 2. Sertifikat olish va Nginx ga ulash

### Barcha domenlar DNS da tayyor bo‘lsa

Bitta sertifikat uchala host uchun (SAN):

```bash
sudo certbot --nginx \
  -d weblinker.uz \
  -d www.weblinker.uz \
  -d api.weblinker.uz
```

### `api` DNS da hali yo‘q (vaqtincha)

Avval faqat sayt domenlari uchun sertifikat oling; **`api` yozuvini panelda qo‘shib**, `dig` orqali tekshirgach, yuqoridagi 3 domenli buyruqni qayta bajaring (yoki keyingi marta `certbot` kengaytirishni taklif qiladi).

```bash
sudo certbot --nginx -d weblinker.uz -d www.weblinker.uz
```

**Eslatma:** `api` sertifikatsiz qolguncha brauzer `https://api.weblinker.uz` da xato beradi — bu kutiladigan; DNS + qayta `certbot` dan keyin hammasi to‘g‘rilanadi.

Keyin:

- Email so‘raladi (xabar va tiklash uchun).
- Let’s Encrypt qoidalariga rozilik.
- **Redirect** tanlang: HTTP → HTTPS (2-variant odatda ma’qul).

Certbot `/etc/nginx/sites-available/weblinker` (yoki siz qaysi faylni ishlatayotgan bo‘lsangiz) ni **o‘zi yangilaydi**: `listen 443 ssl`, `ssl_certificate` va hokazo.

Sertifikat fayllari odatda:

- ` /etc/letsencrypt/live/weblinker.uz/fullchain.pem`
- ` /etc/letsencrypt/live/weblinker.uz/privkey.pem`

(Birinchi `-d` qaysi domen bo‘lsa, papka nomi shu bo‘lishi mumkin; certbot chiqishida aniq yo‘l ko‘rsatiladi.)

## 3. Tekshiruv

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sI https://weblinker.uz | head -5
curl -sI https://api.weblinker.uz | head -5
```

Brauzerda qulf ikonkasi va sertifikat domenlari to‘g‘ri ko‘rinishi kerak.

## 4. Avtomatik yangilanish

Certbot odatda **systemd timer** orqali kuniga ikki marta tekshiradi. Qo‘lda sinov:

```bash
sudo certbot renew --dry-run
```

Muvaffaqiyatli bo‘lsa, sertifikat muddati tugashidan oldin avtomatik yangilanadi.

## 5. `.env` va ilovalar

HTTPS dan keyin server `.env` da quyidagilar **https** bo‘lishi kerak (keyin frontendni qayta **build** qiling — `NEXT_PUBLIC_*` build vaqtida yoziladi):

```env
NEXT_PUBLIC_API_URL=https://api.weblinker.uz
FRONTEND_ORIGIN=https://weblinker.uz,https://www.weblinker.uz
```

So‘ngra:

```bash
cd /path/to/weblinker-frontend
npm run build
pm2 restart all
```

## 6. Tez-tez muammolar

| Muammo | Yechim |
|--------|--------|
| Agar avval noto‘g‘ri `ln` / yo‘l bo‘lsa, `sites-enabled/weblinker` buzilgan | [§ 1a](#1a-certbotdan-oldin-nginx-nginx--t-xatosiz-bolishi-kerak) — `sites-available` ga fayl nusxalang, symlinkni qayta yarating. |
| `nginx -t` / Certbot: `open() ... sites-enabled/weblinker failed` | Yuqoridagi kabi: buzilgan symlinkni o‘chirib, `nginx-weblinker.conf.example` ni `sites-available` ga nusxalang. |
| `NXDOMAIN` / `DNS problem` for `api.weblinker.uz` | [§ 1b](#1b-dns-api-alohida-yozuv-talab-qiladi) — `api` uchun **A** yozuv qo‘shing; `dig +short api.weblinker.uz` IP qaytarishini kuting. |
| Certbot “connection refused” / challenge failed | 80-port firewallda ochiqmi; DNS hali eski IP dami — `dig weblinker.uz +short` tekshiring. |
| `Too many certificates` | Bir haftada bir xil domen uchun juda ko‘p urinish — LetsEncrypt cheklovi; biroz kuting yoki [staging](https://letsencrypt.org/docs/staging-environment/) bilan sinab ko‘ring. |
| HTTPS ochiladi, sahifa 502 | PM2 da `weblinker-web` / `weblinker-api` ishlayaptimi, portlar 8000 va 8001. |

To‘liq deploy ketma-ketligi: [DEPLOY.md](./DEPLOY.md).

**Bir serverda bir nechta domen / chalkash front:** [NGINX-MULTI-SITE.md](./NGINX-MULTI-SITE.md).
