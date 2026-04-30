const path = require("path");

const root = __dirname;

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
      args: "run start -- --hostname 127.0.0.1 --port 3000",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        TZ: "Asia/Tashkent",
        PORT: "3000",
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
        API_PORT: "8001",
      },
    },
  ],
};
