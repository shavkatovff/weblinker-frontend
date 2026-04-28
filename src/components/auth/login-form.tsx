"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, setTokens } from "@/lib/auth-storage";
import { postJson } from "@/lib/api";
import { e164ToDisplay, nineToE164 } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? "weblinkeruz_bot";

type PhoneRes = { ok: boolean; phone: string; display: string; bot: string };

type VerifyRes = { accessToken: string; refreshToken: string; user: unknown };

function formatNine(nine: string) {
  if (nine.length <= 2) return nine;
  if (nine.length <= 5) return `${nine.slice(0, 2)} ${nine.slice(2)}`;
  if (nine.length <= 7) return `${nine.slice(0, 2)} ${nine.slice(2, 5)} ${nine.slice(5)}`;
  return `${nine.slice(0, 2)} ${nine.slice(2, 5)} ${nine.slice(5, 7)} ${nine.slice(7, 9)}`;
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [e164, setE164] = useState("");
  const [bot, setBot] = useState(BOT);
  const [digits, setDigits] = useState("");
  const [cells, setCells] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState<string | null>(null);
  const [load, setLoad] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (getAccessToken()) router.replace("/dashboard");
  }, [router]);

  const tme = `https://t.me/${bot}`;

  const onPhoneSubmit = async () => {
    if (digits.length !== 9) return;
    setLoad(true);
    setErr(null);
    try {
      const phoneE164 = nineToE164(digits);
      const res = await postJson<PhoneRes>("/auth/phone", { phone: phoneE164 });
      setE164(res.phone);
      setBot(res.bot || BOT);
      setStep(2);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setLoad(false);
    }
  };

  const setCell = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const n = [...cells];
    n[i] = d;
    setCells(n);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const onOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !cells[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!p) return;
    const n = p.split("").concat(Array(6).fill("")).slice(0, 6) as string[];
    setCells(n);
    const last = Math.min(5, p.length - 1);
    refs.current[last]?.focus();
  };

  const onVerify = async () => {
    const code = cells.join("");
    if (code.length !== 6) {
      setErr("6 xonali kodni kiriting");
      return;
    }
    setLoad(true);
    setErr(null);
    try {
      const r = await postJson<VerifyRes>("/auth/verify", { phone: e164, code });
      setTokens(r.accessToken, r.refreshToken);
      router.replace("/dashboard");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Kod yoki muddati noto'g'ri");
    } finally {
      setLoad(false);
    }
  };

  if (step === 2) {
    return (
      <div className="space-y-5">
        <p className="text-center text-base font-medium text-neutral-900">
          {e164ToDisplay(e164)}
        </p>
        <div className="rounded-lg border border-[color:var(--border)] bg-neutral-50/80 p-3 text-sm text-neutral-700">
          <p className="leading-relaxed">
            O&lsquo;ngdagi tugma orqali botni oching va yozing: <span className="font-mono">/start</span>
          </p>
          <a
            href={tme}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-2.5 text-sm font-medium text-white hover:bg-sky-600"
          >
            @{bot}
          </a>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500">6 xonali kod</p>
          <div
            className="mt-1.5 flex justify-center gap-1.5 sm:gap-2"
            onPaste={onPasteOtp}
            role="group"
            aria-label="6 xonali kod"
          >
            {cells.map((c, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className={cn(
                  "h-11 w-9 rounded-md border text-center text-base font-mono sm:h-12 sm:w-10",
                  i === 0 && !c ? "border-emerald-500 ring-1 ring-emerald-500" : "border-[color:var(--border)]",
                )}
                inputMode="numeric"
                maxLength={1}
                value={c}
                onKeyDown={(e) => onOtpKey(i, e)}
                onChange={(e) => setCell(i, e.target.value)}
              />
            ))}
          </div>
        </div>
        {err ? <p className="text-center text-sm text-red-600">{err}</p> : null}
        <Button type="button" className="w-full" onClick={() => void onVerify()} disabled={load}>
          {load ? "…" : "Kirish"}
        </Button>
        <p className="text-center text-xs text-neutral-500">
          Kod 2 daqiqagacha. Telegramdagi <strong className="font-normal">Kodni yangilash</strong> orqali
          yangilaysiz.
        </p>
        <button
          type="button"
          onClick={() => {
            setStep(1);
            setCells(["", "", "", "", "", ""]);
            setErr(null);
          }}
          className="w-full text-center text-sm text-neutral-500 underline hover:text-black"
        >
          Boshqa raqam
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-neutral-500">Telefon raqam</p>
        <div className="mt-1.5 flex overflow-hidden rounded-lg border border-[color:var(--border)] bg-white shadow-sm">
          <span className="flex items-center border-r border-[color:var(--border)] bg-emerald-50 px-3 text-sm font-medium text-emerald-900">
            +998
          </span>
          <input
            className="min-w-0 flex-1 bg-white px-3 py-3 text-[15px] text-neutral-900 outline-none"
            type="text"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="90 000 00 00"
            value={formatNine(digits)}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 9))}
            disabled={load}
          />
        </div>
      </div>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      <Button
        type="button"
        className="w-full"
        onClick={() => void onPhoneSubmit()}
        disabled={load || digits.length !== 9}
      >
        Davom etish
      </Button>
    </div>
  );
}
