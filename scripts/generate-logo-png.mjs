import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SIZE = 1024;
const VIEW = 24;
const inset = 5;
const outerRx = 5;
const innerRx = Math.max(0.5, outerRx - inset * 0.7);

function buildSvg({ background }) {
  const outerFill = "#000000";
  const innerFill = "#ffffff";
  const bgRect = background
    ? `<rect width="${VIEW}" height="${VIEW}" fill="${background}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}">
  ${bgRect}
  <rect x="0" y="0" width="${VIEW}" height="${VIEW}" rx="${outerRx}" fill="${outerFill}"/>
  <rect x="${inset}" y="${inset}" width="${VIEW - inset * 2}" height="${VIEW - inset * 2}" rx="${innerRx}" fill="${innerFill}"/>
</svg>`;
}

async function render(name, svg) {
  const out = resolve(process.cwd(), "public", name);
  await sharp(Buffer.from(svg))
    .resize(SIZE, SIZE)
    .png()
    .toFile(out);
  console.log("wrote", out);
}

await render("weblinker-logo-telegram.png", buildSvg({ background: "#ffffff" }));
await render("weblinker-logo-transparent.png", buildSvg({ background: null }));
