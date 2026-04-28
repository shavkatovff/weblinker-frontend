"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

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

/** CLICK hujjati: https://my.click.uz/services/pay — amount format N.NN */
function buildClickPayUrl(
  p: CreateClickPaymentRes,
  opts: { returnUrl: string; cardType: "uzcard" | "humo" },
): string {
  const amount = p.amountSom.toFixed(2);
  const q = new URLSearchParams({
    service_id: String(p.serviceId),
    merchant_id: String(p.merchantId),
    merchant_user_id: p.merchantUserId,
    amount,
    transaction_param: p.merchantTransId,
    return_url: opts.returnUrl,
    card_type: opts.cardType,
  });
  return `https://my.click.uz/services/pay?${q.toString()}`;
}

export function ClickTopUpPanel() {
  const [amountSom, setAmountSom] = useState(10_000);
  const [cardType, setCardType] = useState<"uzcard" | "humo">("uzcard");
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
    if (!Number.isFinite(amountSom) || amountSom < 1000) {
      setMessage("Kamida 1000 so‘m kiriting.");
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
        ? `${window.location.origin}/dashboard/billing`
        : "/dashboard/billing";

    const url = buildClickPayUrl(payment, { returnUrl, cardType });
    window.open(url, "_blank", "noopener,noreferrer");

    setMessage(
      "CLICK to‘lov sahifasi yangi tabda ochildi. To‘lovdan keyin bu yerga qayting — balans Complete callback dan keyin yangilanadi.",
    );
    setLoading(false);
    void refreshBalance();
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900">Balans to‘ldirish (CLICK)</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Rasmiy yo‘l:{" "}
        <code className="rounded bg-neutral-100 px-1 py-0.5 text-[11px]">my.click.uz/services/pay</code>{" "}
        — summa <strong className="font-medium text-neutral-800">N.NN</strong> (so‘m, ikki xona qoldiq).
        Balans faqat CLICK <strong className="font-medium text-neutral-800">Complete</strong> muvaffaqiyatidan
        keyin qo‘shiladi.
      </p>

      {balance != null && (
        <p className="mt-4 text-sm text-neutral-700">
          Joriy balans:{" "}
          <span className="font-semibold tabular-nums">
            {new Intl.NumberFormat("ru-RU").format(Math.round(balance))} so‘m
          </span>
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block min-w-0 flex-1 sm:min-w-[140px]">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Summa (so‘m)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1000}
            step={1000}
            value={amountSom}
            onChange={(e) => setAmountSom(Number(e.target.value))}
            className="h-11 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none ring-black/5 transition focus:border-black focus:ring-2"
          />
        </label>
        <label className="block min-w-0 sm:w-40">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Karta turi</span>
          <select
            value={cardType}
            onChange={(e) => setCardType(e.target.value as "uzcard" | "humo")}
            className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-black focus:ring-2"
          >
            <option value="uzcard">Uzcard</option>
            <option value="humo">Humo</option>
          </select>
        </label>
        <Button type="button" onClick={() => void pay()} disabled={loading} className="h-11 shrink-0">
          {loading ? "Kutilmoqda…" : "CLICK orqali to‘lash"}
        </Button>
      </div>

      {message ? (
        <p className="mt-4 text-sm text-neutral-700" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
