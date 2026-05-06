import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { apiBaseUrl } from "@/lib/api-base";
import { LANDING_PRICE_SOM } from "@/lib/landing-pricing";
import { FALLBACK_PUBLIC_PRICING, type PublicPricing } from "@/lib/vizitka-pricing";

type Plan = {
  id: string;
  name: string;
  price: number;
  /** Masalan `· 6 oy` */
  priceSuffix: string;
  /** Ikkinchi qator: masalan 12 oylik paket */
  secondaryPriceLine?: string;
  perMonthApproxLine?: string;
  priceNote?: string;
  tagline: string;
  features: string[];
  highlighted: boolean;
};

async function loadPricing(): Promise<PublicPricing> {
  try {
    const r = await fetch(`${apiBaseUrl()}/vizitka/pricing`, { next: { revalidate: 60 } });
    if (!r.ok) throw new Error("pricing");
    return r.json() as Promise<PublicPricing>;
  } catch {
    return FALLBACK_PUBLIC_PRICING;
  }
}

function formatPrice(value: number) {
  return value.toLocaleString("ru-RU").replace(/\u00a0/g, " ");
}

export async function Pricing() {
  const pricing = await loadPricing();
  const v6 = pricing.pricesSom["6"];
  const v12 = pricing.pricesSom["12"];
  const perMoV = Math.round(v6 / 6 / 100) * 100;
  const l6 = LANDING_PRICE_SOM["6"];
  const l12 = LANDING_PRICE_SOM["12"];
  const perMoL = Math.round(l6 / 6 / 100) * 100;
  const plans: Plan[] = [
    {
      id: "vizitka",
      name: "Vizitka",
      price: v6,
      priceSuffix: "· 6 oy",
      secondaryPriceLine: `${formatPrice(v12)} so'm · 12 oy`,
      perMonthApproxLine: `≈ ${formatPrice(perMoV)} so'm/oy (6 oy paketi)`,
      priceNote: "6 oy va 1 yil paketlari",
      tagline: "Bir ekranli biznes kartasi",
      features: [
        "1 ekranli sayt",
        "Telefon, manzil, ijtimoiy tarmoq linklari",
        "Mobil telefonda mukammal",
      ],
      highlighted: false,
    },
    {
      id: "landing",
      name: "Landing",
      price: l6,
      priceSuffix: "· 6 oy",
      secondaryPriceLine: `${formatPrice(l12)} so'm · 12 oy`,
      perMonthApproxLine: `≈ ${formatPrice(perMoL)} so'm/oy (6 oy paketi)`,
      tagline: "Bir nechta bo'limli sayt",
      features: [
        "Vizitka tarifidagi barchasi",
        "Xizmatlar va narxlar jadvali",
        "Aloqa formasi (Telegram bot)",
        "Galereya va sharhlar",
      ],
      highlighted: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="flex min-h-[100dvh] items-center border-t border-[color:var(--border)] bg-white"
    >
      <Container className="w-full py-16">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl md:text-5xl">
            Oddiy tariflar
          </h2>
          <p className="mt-4 text-base text-neutral-600">
            {pricing.freePublishDays} kun bepul. Karta ma&apos;lumotisiz. Istalgan vaqtda bekor qiling.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl bg-white p-8 transition-colors",
        plan.highlighted
          ? "border-2 border-black"
          : "border border-[color:var(--border)]",
      )}
    >
      {plan.highlighted ? (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
          Tavsiya
        </span>
      ) : null}

      <h3 className="text-xl font-semibold tracking-tight text-black">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-neutral-500">{plan.tagline}</p>

      <div className="mt-6 flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-semibold tracking-tight tabular-nums text-black">
            {formatPrice(plan.price)}
          </span>
          <span className="text-sm text-neutral-500">
            so&apos;m {plan.priceSuffix}
          </span>
        </div>
        {plan.secondaryPriceLine ? (
          <p className="text-sm font-medium text-neutral-700">{plan.secondaryPriceLine}</p>
        ) : null}
        {plan.perMonthApproxLine ? (
          <p className="text-sm font-medium text-neutral-600">{plan.perMonthApproxLine}</p>
        ) : null}
        {plan.priceNote ? (
          <p className="text-xs text-neutral-500">{plan.priceNote}</p>
        ) : null}
      </div>

      <div className="my-7 h-px w-full bg-[color:var(--border)]" />

      <ul className="space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-black">
            <svg
              className="mt-[3px] h-4 w-4 flex-shrink-0"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 7.5L6 10.5L11 4.5" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Button
          href={`/signup?plan=${plan.id}`}
          size="lg"
          className="w-full"
        >
          Tanlash
        </Button>
      </div>
    </div>
  );
}
