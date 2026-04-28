import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="flex min-h-[calc(100dvh-4rem)] items-center">
      <Container className="w-full py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-5xl font-semibold leading-[1.04] tracking-tight text-black sm:text-6xl md:text-7xl">
            15 daqiqada biznes saytingizni yarating
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-neutral-600 sm:text-xl">
            Dasturchisiz va dizaynersiz. Shablon tanlang, matn yozing — tayyor.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Button href="/signup" size="lg">
              Boshlash
            </Button>
            <Button href="#pricing" variant="secondary" size="lg">
              Tariflar
            </Button>
          </div>
          <p className="mt-5 text-sm text-neutral-500">
            Karta ma&apos;lumotisiz · Istalgan vaqtda bekor qilish
          </p>
        </div>
      </Container>
    </section>
  );
}
