"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  buildClickPayUrl,
  type CreateClickPaymentRes,
} from "@/lib/click-checkout";

const PRESET_SOMS = [10_000, 25_000, 50_000, 100_000] as const;
const MIN_SOM = 1000;

type Me = { user: { balance: number } };

/**
 * Rasmiy: https://my.click.uz/services/pay
 * (O‘qituvchi loyihadagi kabi: service_id, merchant_id, amount, transaction_param, return_url;
 * karta turi — Click o‘z sahifasida tanlanadi, `card_type` yuborilmaydi.)
 */
export function ClickTopUpPanel() {
  const [amountSom, setAmountSom] = useState(10_000);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    try {
      const r = await api<Me>("/auth/me");
      setBalance(r.user.balance);
    } catch {
      setBalance(null);
    }
  }, []);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void refreshBalance();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshBalance]);

  async function pay() {
    setMessage(null);
    if (!Number.isFinite(amountSom) || amountSom < MIN_SOM) {
      setMessage(`Kamida ${MIN_SOM.toLocaleString("uz-UZ")} so‘m.`);
      return;
    }

    setLoading(true);
    let payment: CreateClickPaymentRes;
    try {
      payment = await api<CreateClickPaymentRes>("/payments/click", {
        method: "POST",
        body: JSON.stringify({ amount: Math.floor(amountSom) }),
      });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "To‘lov yaratishda xato";
      setMessage(msg);
      setLoading(false);
      return;
    }

    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/dashboard/billing?click=1`
        : "/dashboard/billing?click=1";

    const url = buildClickPayUrl(payment, returnUrl);
    window.location.assign(url);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-sm">
      {/* CLICK brand header */}
      <div className="relative bg-gradient-to-br from-[#0065ff]/12 via-white to-sky-50/80 px-6 pb-5 pt-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#0065ff]/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md shadow-[#0065ff]/15 ring-1 ring-[#0065ff]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/click_logo.svg"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0065ff]/90">
                To‘lov tizimi
              </p>
              <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-[#0065ff] sm:text-[1.65rem]">
                CLICK
              </h2>
              <p className="mt-1 max-w-md text-sm text-neutral-600">
                Balansni bank kartasi orqali to‘ldiring — xavfsiz va tezkor.
              </p>
            </div>
          </div>
          {balance != null && (
            <div className="rounded-xl border border-[#0065ff]/15 bg-white/90 px-4 py-3 text-right shadow-sm backdrop-blur-sm sm:min-w-[160px]">
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Joriy balans
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-neutral-900">
                {new Intl.NumberFormat("ru-RU").format(Math.round(balance))}{" "}
                <span className="text-sm font-normal text-neutral-500">so‘m</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-100 p-6 pt-5">
        <p className="text-sm text-neutral-600">
          Summani kiriting yoki tezkor tanlovni bosing. Keyin{" "}
          <strong className="font-medium text-neutral-800">my.click.uz</strong> sahifasida to‘lovni
          yakunlaysiz (kartani shu yerda tanlaysiz).
        </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESET_SOMS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setAmountSom(v);
              setMessage(null);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              amountSom === v
                ? "border-black bg-neutral-900 text-white"
                : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400",
            )}
          >
            {(v / 1000).toLocaleString("uz-UZ")}k
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block min-w-0 flex-1 sm:min-w-[180px]">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Summa (so‘m)</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_SOM}
            step={1000}
            value={amountSom}
            onChange={(e) => setAmountSom(Number(e.target.value))}
            className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none ring-black/5 transition focus:border-black focus:ring-2"
          />
        </label>
        <Button type="button" onClick={() => void pay()} disabled={loading} className="h-11 shrink-0">
          {loading ? "Jo‘natilmoqda…" : "CLICK ga o‘tish"}
        </Button>
      </div>

      {message ? (
        <p className="mt-4 text-sm text-amber-800" role="status">
          {message}
        </p>
      ) : null}
      </div>
    </div>
  );
}
