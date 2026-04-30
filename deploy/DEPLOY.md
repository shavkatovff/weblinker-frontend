# weblinker.uz — Linux serverga deploy va Let’s Encrypt (Certbot)

Bu hujjat **weblinker.uz** (frontend) va **api.weblinker.uz** (Nest API) ni Nginx orqali **HTTPS** bilan ishga tushirish uchun umumiy tartib. Ubuntu/Debian uchun yozilgan.

## 1. DNS

Serveringiz **ochiq IP** sini oldingizdan:

| Yozuv | Turi | Qiymat |
|--------|------|--------|
| `weblinker.uz` | A | server IP |
| `www.weblinker.uz` | A | server IP |
| `api.weblinker.uz` | A | server IP |

TAR sozlanguncha **80** va **443** portlari tashqaridan ochiq bo‘lishi kerak.

## 2. Serverda dasturlar

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
# Node.js 20 LTS (NodeSource yoki nvm — loyihangizga mos)
```

## 3. Loyihani joylash va build

Loyiha yo‘li ixtiyoriy (`/opt/weblinker`, `~/weblinker-frontend` va hokazo). Quyida **`$ROOT`** deb loyiha ildizini nazarda tutamiz.

```bash
# Masalan:
cd ~ && git clone <sizning-repo-url> weblinker-frontend
cd ~/weblinker-frontend   # bu sizning $ROOT
```

Yoki: `sudo mkdir -p /opt/weblinker && sudo chown $USER:$USER /opt/weblinker` va `git clone` shu yerga.

Ildizdagi `.env` faylini yarating: `deploy/env.production.example` ni namuna sifatida ko‘rib chiqing. Kamida quyidagilar to‘g‘ri bo‘lishi kerak:

- `DATABASE_URL` — ishlayotgan PostgreSQL
- `JWT_*`, `TELEGRAM_BOT_TOKEN`, CLICK maydonlari
- `NEXT_PUBLIC_API_URL=https://api.weblinker.uz`
- `FRONTEND_ORIGIN=https://weblinker.uz,https://www.weblinker.uz`
- `TELEGRAM_POLLING=false` (prod odatda webhook)

**Muhim:** `NEXT_PUBLIC_*` o‘zgarishidan keyin frontendni **qayta build** qilish kerak.

```bash
cd $ROOT
npm ci
cd api && npm ci && cd ..
npm run build:all
npm run migrate:deploy
```

### Prisma / migrate (P1012, Prisma 7)

Bu loyiha **Prisma 5.x** bilan bog‘langan (`api/package.json`). Serverda **`npx prisma ...`** ni `api` ichida **dependencies o‘rnatilmasdan** ishlatsangiz, `npx` odatda **eng so‘nggi Prisma 7** ni yuklaydi va `datasource url is no longer supported` (**P1012**) xatosini beradi.

**To‘g‘ri tartib:** avval `cd api && npm ci` (yoki yuqoridagi ketma-ketlik), keyin **faqat loyiha skripti** orqali:

```bash
cd $ROOT
npm run migrate:deploy
```

Skript **Prisma 5.22.0** CLIni `npx prisma@5.22.0` orqali chaqiradi (global o‘rnatilgan Prisma 7 bundan **ta’sir qilmaydi**).

Agar hozir qo‘lda bajarsangiz (`api` papkasida, `.env` loyiha ildizida):

```bash
cd ~/weblinker-frontend/api
npm ci
./node_modules/.bin/dotenv -e ../.env -- npx prisma@5.22.0 migrate deploy
```

(`dotenv` — bu `dotenv-cli` paketi; tizim buyrug‘i emas, **`npm ci` dan keyin** `node_modules/.bin` dan ishlaydi.)

## 4. PM2 (yoki systemd)

Loyiha ildizida (`cd $ROOT`):

```bash
sudo npm i -g pm2
# PM2: api/dist/main.js va Next .next — avval build
npm run build:all
pm2 start weblinker.config.cjs
# yoki: npm run pm2
pm2 save
pm2 startup   # ko‘rsatma bo‘yicha systemd qo‘shing
```

Tekshiruv (server ichida):

```bash
curl -sI http://127.0.0.1:3000 | head -1
curl -sI http://127.0.0.1:8001
```

## 5. Nginx

`deploy` katalogi **loyiha ildizida** (`$ROOT/deploy`). Oldingi xato yo‘l `/opt/weblinker` bo‘lsa-yu, sizda klon boshqa papkada bo‘lishi mumkin — **to‘liq yo‘lni o‘zingiz yazing**:

```bash
# $ROOT o'rniga haqiqiy yo'l, masalan: /home/ubuntu/weblinker-frontend
sudo cp /home/ubuntu/weblinker-frontend/deploy/nginx-weblinker.conf.example /etc/nginx/sites-available/weblinker
sudo ln -sf /etc/nginx/sites-available/weblinker /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Eslatma:** `sudo` bilan `$ROOT` yoki `~` ba’zan boshqa foydalanuvchi uchun bo‘lishi mumkin — **mutlaq yo‘l** (`/home/.../weblinker-frontend/deploy/...`) ishlatish xavfsizroq.

Agar avval xato `ln` tufayli **buzilgan symlink** qolgan bo‘lsa: `sudo rm -f /etc/nginx/sites-enabled/weblinker`, keyin yuqoridagi qadamlarni qayta bajaring.

Brauzerda `http://weblinker.uz` ochilishi kerak (sertifikatsiz, vaqtincha).

## 6. Certbot — SSL sertifikat (HTTPS)

**weblinker.uz** uchun SSL olish va Nginx ga ulash **bitta buyruq** bilan (oldindan DNS va HTTP (80) ishlayotgan bo‘lsin):

```bash
sudo certbot --nginx -d weblinker.uz -d www.weblinker.uz -d api.weblinker.uz
```

Certbot Nginx faylingizga `listen 443 ssl` va sertifikat yo‘llarini qo‘shadi; HTTP → HTTPS yo‘naltirishni so‘raydi (odatda **2** ni tanlang).

```bash
sudo certbot renew --dry-run
```

Batafsil (tekshiruvlar, muammolar, `.env` da `https://`): **[deploy/SSL.md](./SSL.md)**.

## 7. Telegram

- **Webhook** (polling o‘chiq bo‘lsa): BotFather / `@BotFather` orqali yoki `setWebhook` API:

  `https://api.weblinker.uz/telegram/webhook`

- **CLICK** merchant kabinetida **Prepare/Complete:** `https://weblinker.uz/api/payments/click/prepare` va `.../complete` (asosiy domen; backend Nest ga Nginx yoki Next orqali proxylanadi).

## 8. Firewall (ixtiyoriy)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 9. Keyingi deploy (yangilanish)

```bash
cd $ROOT
git pull
npm ci
cd api && npm ci && cd ..
npm run build:all
npm run migrate:deploy
pm2 restart all
```

Agar faqat `.env` dagi `NEXT_PUBLIC_*` o‘zgargan bo‘lsa — **`npm run build`** qayta ishga tushiring (Next.js brauzerga embed qiladi).

## Muammolar

- **Prisma P1012 / Prisma 7:** `npx prisma` (versiyasiz) yoki global **Prisma 7** ishlatilmaydi. Faqat `npm run migrate:deploy` yoki `npx prisma@5.22.0 ...`.
- **CORS xatosi:** `FRONTEND_ORIGIN` da aynan brauzerdagi manzil (https, `www` bo‘lsa qo‘shing).
- **API 502:** PM2 da API ishlayotganini va `API_PORT=8001` ni tekshiring; Nginx `api.weblinker.uz` ni shu portga proxylayotganini tekshiring.
- **Sertifikat:** domenlar DNS da to‘g‘ri IP ga ko‘rsatayotganini va 80-port ochiq ekanini tekshiring.
