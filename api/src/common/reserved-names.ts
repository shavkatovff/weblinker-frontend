/**
 * Vizitka va Landing manzillari uchun yagona band-bo'sh tekshiruvchi util.
 *
 * `weblinker.uz/{name}` slug ikkala model uchun ham noyob bo'lishi shart:
 *  - bitta `name` faqat bitta marta — yo Vizitka, yo Landing tomonidan ishlatilishi mumkin.
 *  - tizim yo'llari (route nomlari) hech qaysi modelda olinmasligi kerak.
 */
import { ConflictException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

/**
 * Tizim tomonidan band yo'llar — frontend route va statik resurslar bilan
 * to'qnashmasligi uchun. Ikkala model ham shu ro'yxatdan foydalanadi.
 */
export const RESERVED_NAMES: ReadonlySet<string> = new Set([
  '_next',
  'admin',
  'api',
  'auth',
  'billing',
  'check',
  'dashboard',
  'demo',
  'favicon',
  'gradeadmin',
  'health',
  'inbox',
  'landing',
  'login',
  'm',
  'new',
  'pricing',
  'privacy',
  'public',
  'robots',
  'settings',
  'signup',
  'sitemap',
  'sites',
  'static',
  'tahrir',
  'telegram',
  'terms',
  'vizitka',
  'webhook',
]);

export function assertNameAllowed(name: string): void {
  if (RESERVED_NAMES.has(name)) {
    throw new ConflictException('Bu manzil tizim tomonidan band');
  }
}

/**
 * `name` Vizitka yoki Landing tomonidan olinganligini tekshirish.
 *
 * @param prisma joriy PrismaService (yoki transaction client)
 * @param name tekshiriladigan slug
 * @param except agar update bo'lsa — joriy yozuv id sini chiqarib tashlash
 *               (`vizitka`/`landing` — qaysi modelda update qilinayotganini bildiradi)
 */
export async function assertNameFreeAcrossModels(
  prisma: Pick<PrismaService, 'vizitka' | 'landing'>,
  name: string,
  except?: { kind: 'vizitka' | 'landing'; id: string },
): Promise<void> {
  const v = await prisma.vizitka.findUnique({ where: { name } });
  if (v && !(except?.kind === 'vizitka' && except.id === v.id)) {
    throw new ConflictException('Bu manzil vizitka sifatida band');
  }
  const l = await prisma.landing.findUnique({ where: { name } });
  if (l && !(except?.kind === 'landing' && except.id === l.id)) {
    throw new ConflictException('Bu manzil landing sayt tomonidan band');
  }
}
