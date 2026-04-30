"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Me = { user: { balance: number } };

type CreateClickPaymentRes = {
  paymentId: number;
  merchantTransId: string;
  amount: number;
  amountSom: number;
  serviceId: number;
  merchantId: number;
  merchantUserId: string;
};

const PRESET_SOMS = [10_000, 25_000, 50_000, 100_000] as const;
const MIN_SOM = 1000;

/**
 * Rasmiy: https://my.click.uz/services/pay
 * (O‘qituvchi loyihadagi kabi: service_id, merchant_id, amount, transaction_param, return_url;
 * karta turi — Click o‘z sahifasida tanlanadi, `card_type` yuborilmaydi.)
 */
function buildClickPayUrl(
  p: CreateClickPaymentRes,
  returnUrl: string,
): string {
  const amount = p.amountSom.toFixed(2);
  const q = new URLSearchParams({
    service_id: String(p.serviceId),
    merchant_id: String(p.merchantId),
    merchant_user_id: p.merchantUserId,
    amount,
    transaction_param: p.merchantTransId,
    return_url: returnUrl,
  });
  return `https://my.click.uz/services/pay?${q.toString()}`;
}

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
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900">Balans to‘ldirish (CLICK)</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Summani kiriting yoki tezkor tanlovni bosing. To‘lov{" "}
        <strong className="font-medium text-neutral-800">my.click.uz</strong> da ochiladi — Uzcard yoki
        Humoni <strong className="font-medium text-neutral-800">Click sahifasida</strong> tanlaysiz.
        Balans to‘lov muvaffaqiyatidan keyin yangilanadi.
      </p>

      {balance != null && (
        <p className="mt-4 text-sm text-neutral-700">
          Joriy balans:{" "}
          <span className="font-semibold tabular-nums">
            {new Intl.NumberFormat("ru-RU").format(Math.round(balance))} so‘m
          </span>
        </p>
      )}

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

      <p className="mt-4 text-xs text-neutral-500">
        Serverda Prepare/Complete URL lar kabinetga mos qo‘yilgan bo‘lishi kerak (
        <code className="rounded bg-neutral-100 px-1">/api/payments/click/prepare</code> va{" "}
        <code className="rounded bg-neutral-100 px-1">complete</code>).
      </p>
    </div>
  );
}
