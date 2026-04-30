const path = require("path");

const root = __dirname;

try {
  require("dotenv").config({ path: path.join(root, ".env") });
} catch {
  /* dotenv yo'q bo'lsa — faqat tizim env */
}

/**
 * Portlar: ildizdagi .env
 *   WEBLINKER_WEB_PORT  — Next (odat 8000)
 *   WEBLINKER_API_PORT  — Nest (odat 8001)
 * Nginx dagi upstream ham shu portlarga mos bo'lsin.
 */
const webPort = String(
  process.env.WEBLINKER_WEB_PORT || process.env.PORT || "8000",
);
const apiPort = String(
  process.env.WEBLINKER_API_PORT || process.env.API_PORT || "8001",
);

/**
 * Bitta buyruq — frontend (Next) + backend (Nest):
 *
 *   npm run build:all
 *   pm2 start weblinker.config.cjs
 *
 * yoki: npm run pm2
 *
 * To‘xtatish: pm2 stop weblinker-web weblinker-api
 * Qayta ishga tushirish: pm2 restart weblinker-web weblinker-api
 *
 * .env loyiha ildizida (root) bo‘lishi kerak.
 */
module.exports = {
  apps: [
    {
      name: "weblinker-web",
      cwd: root,
      script: "npm",
      args: `run start -- --hostname 127.0.0.1 --port ${webPort}`,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        TZ: "Asia/Tashkent",
        PORT: webPort,
      },
    },
    {
      name: "weblinker-api",
      cwd: path.join(root, "api"),
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        TZ: "Asia/Tashkent",
        API_PORT: apiPort,
        PORT: apiPort,
      },
    },
  ],
};
