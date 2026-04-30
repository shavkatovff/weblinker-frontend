# Bir serverda bir nechta domen / loyiha (Nginx + weblinker)

`ERR_NAME_NOT_RESOLVED` (api.weblinker.uz) — DNS da `api` yo‘q. Loyihada brauzer endi **bir xil domen**dan chaqiradi; Nginx da `/auth`, `/vizitka` proxy bo‘lsin ([nginx-weblinker.conf.example](./nginx-weblinker.conf.example)). **443** bloki ham.

Agar `weblinker.uz` ochilganda **boshqa sayt** yoki **boshqa loyiha** fronti chiqsa, odatda sabab quyidagilardan biri.

## 1. `default_server` — noto‘g‘ri “standart” sayt

`listen 80 default_server` yoki `listen 443 ssl default_server` faqat **bitta** saytga qo‘yilishi kerak. Barcha fayllarda `default_server` bo‘lsa, Nginx so‘rovni noto‘g‘ri blokka yuboradi.

**Tekshiruv:**

```bash
sudo grep -R "default_server" /etc/nginx/sites-enabled/
```

Agar weblinker faylida `default_server` **kerak emas** — olib tashlang. Asosiy “default” faqat bitta sayt (masalan, texnik domen) uchun qolsin.

## 2. `server_name` mos kelmayapti

Har bir domen uchun **alohida** `server { ... server_name example.com; }` bo‘lishi kerak. `weblinker.uz` uchun:

```nginx
server_name weblinker.uz www.weblinker.uz;
```

Brauzer `Host: weblinker.uz` yuboradi; bu bilan mos bo‘lmagan blok tanlanmasligi kerak.

**Tekshiruv (butun konfig):**

```bash
sudo nginx -T 2>/dev/null | grep -E "server_name|listen 80|listen 443"
```

`weblinker.uz` faqat **weblinker** faylida bo‘lishi kerak (yoki shu domen boshqa faylda takrorlanmasin).

## 3. Bir xil port — ikki PM2 / ikki Next

Weblinker Next odatda **`127.0.0.1:8000`**, API **`8001`**. Agar boshqa loyiha ham **`8000`** ni band qilgan bo‘lsa, bir vaqtning o‘zida faqat **bittasi** tinglashi mumkin. **`weblinker-web`** PM2 da koʻp **`↺` restart** bo‘lsa — odatda port ziddiyati.

**Yechim:**

1. Loyiha ildizidagi `.env` da boshqa port (masalan `8010`):

   ```env
   WEBLINKER_WEB_PORT=8010
   WEBLINKER_API_PORT=8001
   INTERNAL_API_URL=http://127.0.0.1:8001
   ```

2. **`/etc/nginx/...` weblinker** faylida `upstream weblinker_next` → **`127.0.0.1:8010`** (443 blokda ham).

3. `sudo nginx -t && sudo systemctl reload nginx`

4. `cd ~/weblinker-frontend && npm ci && pm2 delete weblinker-web weblinker-api && pm2 start weblinker.config.cjs && pm2 save`

`weblinker.config.cjs` `.env` dan `WEBLINKER_WEB_PORT` ni o‘qiydi (`dotenv` paketi).

**Tekshiruv:**

```bash
ss -tlnp | grep -E ':8000|:8001'
pm2 list
```

**Yechim (API porti ham ziddiyat bo‘lsa):** weblinker uchun **boshqa juft** portlar (masalan Next `8010`, API `8011`), keyin:

1. `.env` da `WEBLINKER_WEB_PORT` / `WEBLINKER_API_PORT` va `INTERNAL_API_URL` ni moslang.
2. Nginx `upstream` lar ham xuddi shu portlarga.
3. `npm run build:all` va `pm2 restart weblinker-web weblinker-api`

## 4. Noto‘g‘ri `sites-enabled` tartibi

Nginx `server_name` bo‘yicha tanlaydi — fayl nomi muhim emas. Lekin **faqat bitta** faol konfig har bir domen uchun bo‘lsin: eski/buzilgan symlinklarni olib tashlang.

```bash
ls -la /etc/nginx/sites-enabled/
```

## 5. Brauzer keshi

Ba’zan eski HTML keshdan chiqadi. **Ctrl+F5** yoki boshqa brauzerda sinang.

## 6. Tez test (server ichida)

```bash
curl -sI -H "Host: weblinker.uz" http://127.0.0.1/ | head -5
```

(Bu faqat Nginx `localhost` da 80 ni tinglayotgan bo‘lsa ishlaydi; ko‘pincha `curl -sI https://weblinker.uz` yaxshiroq.)

---

**Xulosa:** weblinker uchun **alohida** nginx fayl (`sites-available/weblinker`), aniq **`server_name weblinker.uz`**, **`proxy_pass`** faqat shu loyiha portlariga (odat **8000** / **8001**), va boshqa loyiha bilan **shu portlarni ulashmaslik**.

Namuna upstream: [nginx-weblinker.conf.example](./nginx-weblinker.conf.example).
