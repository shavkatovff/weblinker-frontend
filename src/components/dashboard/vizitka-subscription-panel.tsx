"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { buildVizitkaPackages, formatSom, packagePriceByMonths } from "@/lib/vizitka-packages";
import {
  FALLBACK_PUBLIC_PRICING,
  fetchVizitkaPricing,
  type PublicPricing,
} from "@/lib/vizitka-pricing";
import { buildClickPayUrl } from "@/lib/click-checkout";
import { trialDaysLeft } from "@/lib/store/store";
import type { UnknownSite } from "@/lib/store/types";
import { createVizitkaSubscriptionPayment } from "@/lib/vizitka-client";

type Props = {
  site: UnknownSite;
};

export function VizitkaSubscriptionPanel({ site }: Props) {
  const [loadingMonths, setLoadingMonths] = useState<3 | 6 | 12 | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PublicPricing>(FALLBACK_PUBLIC_PRICING);

  useEffect(() => {
    void fetchVizitkaPricing().then(setPricing).catch(() => {});
  }, []);

  const packages = useMemo(() => buildVizitkaPackages(pricing), [pricing]);
  const priceByMonths = useMemo(() => packagePriceByMonths(pricing), [pricing]);

  if (site.type !== "vizitka") return null;

  const endsIso = site.subscriptionEndsAt ?? site.trialEndsAt;
  const days = trialDaysLeft(site);
  const endDate =
    endsIso &&
    new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(endsIso));

  async function pay(months: 3 | 6 | 12) {
    setMessage(null);
    setLoadingMonths(months);
    try {
      const amountSom = priceByMonths[months];
      const payment = await createVizitkaSubscriptionPayment({
        vizitkaId: site.id,
        subscriptionMonths: months,
        amountSom,
      });
      const returnUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard/sites/${site.id}?click=1`
          : `/dashboard/sites/${site.id}?click=1`;
      window.location.assign(buildClickPayUrl(payment, returnUrl));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "To‘lov boshlanmadi");
      setLoadingMonths(null);
    }
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-gradient-to-b from-neutral-50/80 to-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-neutral-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-black">Obuna muddati</h3>
          <p className="mt-1 text-xs text-neutral-600">
            CLICK orqali paket sotib oling — muddat joriy tugash sanasiga qo‘shiladi.
          </p>
        </div>
        <div className="mt-2 text-right sm:mt-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            Tugash sanasi
          </p>
          <p className="text-sm font-semibold tabular-nums text-neutral-900">
            {endDate ?? "—"}
          </p>
          <p className="mt-0.5 text-xs text-neutral-600">
            {days === 0 ? "Muddati tugagan yoki bugun tugaydi" : `~${days} kun qoldi`}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {packages.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={loadingMonths !== null}
            onClick={() => void pay(p.months)}
            className={cn(
              "flex flex-col rounded-xl border p-4 text-left transition",
              p.recommended
                ? "border-black bg-white ring-1 ring-black/10"
                : "border-neutral-200 bg-white hover:border-neutral-400",
              loadingMonths !== null && loadingMonths !== p.months && "opacity-50",
            )}
          >
            {p.recommended ? (
              <span className="mb-2 inline-flex w-fit rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Tavsiya
              </span>
            ) : (
              <span className="mb-2 h-5" />
            )}
            <span className="text-base font-semibold text-black">{p.title}</span>
            <span className="mt-1 text-lg font-bold tabular-nums text-neutral-900">
              {formatSom(p.priceSom)}
            </span>
            {p.hint ? (
              <span className="mt-1 text-[11px] text-neutral-500">{p.hint}</span>
            ) : null}
            <span className="mt-3 text-xs font-medium text-black underline-offset-4 group-hover:underline">
              {loadingMonths === p.months ? "Yo‘naltirilmoqda…" : "CLICK bilan to‘lash →"}
            </span>
          </button>
        ))}
      </div>

      {message ? (
        <p className="mt-4 text-sm text-amber-800" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
