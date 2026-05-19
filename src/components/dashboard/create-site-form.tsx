"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  startTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  createSite,
  normalizeSlug,
  saveSite,
  slugExists,
  suggestSlug,
} from "@/lib/store/store";
import {
  buildVizitkaCreatePayload,
  postVizitka,
  uploadVizitkaLogo,
  uploadVizitkaPhoto,
} from "@/lib/vizitka-client";
import { api, ApiError } from "@/lib/api";
import {
  buildClickPayUrl,
  type CreateClickPaymentRes,
} from "@/lib/click-checkout";
import {
  buildVizitkaFreePackage,
  buildVizitkaPackages,
  formatSom,
  packagePriceByMonths,
} from "@/lib/vizitka-packages";
import {
  FALLBACK_PUBLIC_PRICING,
  fetchVizitkaPricing,
  type PublicPricing,
} from "@/lib/vizitka-pricing";
import {
  clickInvoiceAmountSom,
  computeClickTopUpNeedSom,
} from "@/lib/click-invoice-amount";
import { chargeLandingAiStarter, chargeLandingCreatePackage } from "@/lib/landing-client";
import { DEFAULT_LANDING_HERO_DESCRIPTION } from "@/lib/landings/defaults";
import { TAHRIR_WIZARD_FROM_CREATE_KEY } from "@/lib/landings/preview-storage";
import {
  buildLandingFreePackage,
  buildLandingPackages,
  landingPackagePriceByMonths,
  LANDING_AI_STARTER_PRICE_SOM,
} from "@/lib/landing-pricing";
import {
  ColorThemeId,
  LandingTemplateId,
  PatternId,
  SiteImage,
  SiteType,
  SocialLinks,
  TemplateId,
  UnknownSite,
  VIZITKA_TEMPLATES,
  VizitkaTemplateId,
  getColorTheme,
} from "@/lib/store/types";
import { defaultVizitkaContent, deriveInitials } from "@/lib/store/defaults";
import { normalizeSite } from "@/lib/store/normalize";
import { dataUrlToFile } from "@/lib/image-utils";
import { VizitkaTemplate } from "@/components/sites/vizitka-template";
import { MapEmbed } from "@/components/sites/map-embed";
import { ImageUpload } from "@/components/editor/image-upload";
import { Field, TextAreaInput, TextInput } from "@/components/editor/fields";
import { HoursEditor } from "@/components/editor/hours-editor";
import { PhoneFrame } from "@/components/editor/phone-frame";
import { ColorPicker } from "@/components/editor/color-picker";
import { PatternPicker } from "@/components/editor/pattern-picker";
import { SocialEditor } from "@/components/editor/social-editor";

type Step = 1 | 2 | 3;

type SiteCreatedSuccessState = {
  siteId: string;
  slug: string;
  businessName: string;
  uploadWarning?: string | null;
};

function businessNameFromSite(site: UnknownSite): string {
  return (
    site.content.businessName?.trim() ||
    site.slug
  );
}

const RESERVED_SLUGS = new Set([
  "dashboard",
  "login",
  "signup",
  "api",
  "admin",
  "pricing",
  "terms",
  "privacy",
  "_next",
  "settings",
  "inbox",
  "billing",
]);

const steps = [
  { n: 1, label: "Nom" },
  { n: 2, label: "Shablon" },
  { n: 3, label: "Ma'lumotlar" },
];

const noopSubscribe = () => () => {};

/** SSR da `false`, klientda `true` — `slugExists` va avto-slug faqat brauzerda */
function useClientReady(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** CLICK dan qaytganda — vizitka oy paketi */
const SESSION_SUB_MONTHS = "weblinker.newSite.subscriptionMonths";
/** CLICK dan qaytganda — landing oy paketi */
const SESSION_LANDING_SUB_MONTHS = "weblinker.newSite.landingSubscriptionMonths";
/** CLICK dan qaytgan — landing AI paketi uchun balans to‘ldirish */
const SESSION_LANDING_AI_PENDING = "weblinker.newSite.landingAiPending";

const COMMON_CATEGORIES = [
  "Chayxana",
  "Restoran",
  "Kafe",
  "Beauty salon",
  "Fitnes markaz",
  "Atelye",
  "Ta'mirlash xizmati",
  "Avtomobil xizmati",
  "Kiyim do'koni",
  "Gul do'koni",
  "Ta'lim markazi",
  "Tibbiy xizmatlar",
  "Yuridik xizmatlar",
  "IT xizmatlari",
  "Yetkazib berish",
  "Qurilish",
  "Fotograf / Videograf",
];

export function CreateSiteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [siteType, setSiteType] = useState<SiteType | null>(null);
  const [step, setStep] = useState<Step>(1);
  const ready = useClientReady();

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("");

  const [vizitkaTemplateId, setVizitkaTemplateId] =
    useState<VizitkaTemplateId>("minimal");
  const [colorTheme, setColorTheme] = useState<ColorThemeId>("mono");
  const [pattern, setPattern] = useState<PatternId>("none");
  const landingTemplateId: LandingTemplateId = "simple";

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hoursLine, setHoursLine] = useState("Du–Sh: 09:00 – 20:00");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [social, setSocial] = useState<SocialLinks>([]);
  const [mapsUrl, setMapsUrl] = useState("");
  const [logoImage, setLogoImage] = useState<SiteImage | undefined>();
  const [heroImage, setHeroImage] = useState<SiteImage | undefined>();

  const [submitting, setSubmitting] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [tierPayLoading, setTierPayLoading] = useState<6 | 12 | "ai" | null>(null);
  /** Vizitka: bepul kunlar va paket narxlari API dan */
  const [pricing, setPricing] = useState<PublicPricing>(FALLBACK_PUBLIC_PRICING);
  const [vizitkaTier, setVizitkaTier] = useState<"free" | 6 | 12 | null>(null);
  const [landingTier, setLandingTier] = useState<"free" | "ai" | 6 | 12 | null>(null);
  /** Landing: shablon bosqichidan keyin ma'lumotlar formasi hali tayyor emas */
  const [landingComingSoon, setLandingComingSoon] = useState(false);
  const [siteCreated, setSiteCreated] = useState<SiteCreatedSuccessState | null>(null);

  const priceByMonths = useMemo(() => packagePriceByMonths(pricing), [pricing]);
  const landingPriceByMonths = useMemo(
    () => landingPackagePriceByMonths(pricing),
    [pricing],
  );

  useEffect(() => {
    void fetchVizitkaPricing().then(setPricing).catch(() => {});
  }, []);

  /** CLICK dan qaytgan — sessiyadan oy paketini tiklash */
  useEffect(() => {
    if (searchParams.get("click") !== "1") return;
    const m = sessionStorage.getItem(SESSION_SUB_MONTHS);
    const l = sessionStorage.getItem(SESSION_LANDING_SUB_MONTHS);
    const aiPending = sessionStorage.getItem(SESSION_LANDING_AI_PENDING);

    if (m === "6" || m === "12") {
      startTransition(() => {
        setVizitkaTier(Number(m) as 6 | 12);
        setStep(1);
      });
    }
    if (l === "6" || l === "12") {
      sessionStorage.removeItem(SESSION_LANDING_SUB_MONTHS);
      startTransition(() => {
        setSiteType("landing");
        setLandingTier(Number(l) as 6 | 12);
        setStep(1);
      });
      router.replace("/dashboard/sites/new", { scroll: false });
      return;
    }
    if (aiPending === "1") {
      sessionStorage.removeItem(SESSION_LANDING_AI_PENDING);
      void chargeLandingAiStarter()
        .then(() => {
          setSiteType("landing");
          setLandingTier("ai");
          setStep(1);
          router.replace("/dashboard/sites/new", { scroll: false });
        })
        .catch((e) => {
          const msg =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : "Balansdan yechilmadi";
          setFinishError(msg);
        });
      return;
    }

    sessionStorage.removeItem(SESSION_SUB_MONTHS);
    sessionStorage.removeItem(SESSION_LANDING_SUB_MONTHS);
    router.replace("/dashboard/sites/new", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    if (slugTouched || !ready) return;
    startTransition(() => {
      setSlug(businessName.trim() ? suggestSlug(businessName) : "");
    });
  }, [businessName, slugTouched, ready]);

  const normalizedSlug = useMemo(() => normalizeSlug(slug), [slug]);
  const slugError = useMemo(() => validateSlug(normalizedSlug, ready), [
    normalizedSlug,
    ready,
  ]);

  const canNextFromStep1 =
    businessName.trim().length >= 2 && normalizedSlug.length >= 3 && !slugError;

  const resetCreateFlow = useCallback(() => {
    setSiteCreated(null);
    setSiteType(null);
    setStep(1);
    setBusinessName("");
    setSlug("");
    setSlugTouched(false);
    setCategory("");
    setVizitkaTemplateId("minimal");
    setColorTheme("mono");
    setPattern("none");
    setPhone("");
    setAddress("");
    setHoursLine("Du–Sh: 09:00 – 20:00");
    setTagline("");
    setDescription("");
    setSocial([]);
    setMapsUrl("");
    setLogoImage(undefined);
    setHeroImage(undefined);
    setFinishError(null);
    setVizitkaTier(null);
    setLandingTier(null);
    setLandingComingSoon(false);
  }, []);

  const handleVizitkaTierSelect = useCallback(
    async (tier: "free" | 6 | 12) => {
      setFinishError(null);
      if (tier === "free") {
        sessionStorage.removeItem(SESSION_SUB_MONTHS);
        setVizitkaTier("free");
        setStep(1);
        return;
      }
      const price = priceByMonths[tier];
      setTierPayLoading(tier);
      try {
        const me = await api<{ user: { balance: number } }>("/auth/me");
        const need = clickInvoiceAmountSom(
          computeClickTopUpNeedSom(price, me.user.balance),
        );
        if (need === 0) {
          setVizitkaTier(tier);
          setStep(1);
          return;
        }
        sessionStorage.setItem(SESSION_SUB_MONTHS, String(tier));
        const payment = await api<CreateClickPaymentRes>("/payments/click", {
          method: "POST",
          body: JSON.stringify({ amount: need }),
        });
        const returnUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard/sites/new?click=1`
            : "/dashboard/sites/new?click=1";
        window.location.assign(buildClickPayUrl(payment, returnUrl));
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "To‘lov boshlanmadi";
        setFinishError(msg);
      } finally {
        setTierPayLoading(null);
      }
    },
    [priceByMonths],
  );

  const handleLandingTierSelect = useCallback(
    async (tier: "free" | "ai" | 6 | 12) => {
      setFinishError(null);
      if (tier === "free") {
        sessionStorage.removeItem(SESSION_LANDING_SUB_MONTHS);
        sessionStorage.removeItem(SESSION_LANDING_AI_PENDING);
        setLandingTier("free");
        setStep(1);
        return;
      }
      if (tier === "ai") {
        sessionStorage.removeItem(SESSION_LANDING_SUB_MONTHS);
        sessionStorage.removeItem(SESSION_LANDING_AI_PENDING);
        const price = LANDING_AI_STARTER_PRICE_SOM;
        setTierPayLoading("ai");
        try {
          const me = await api<{ user: { balance: number } }>("/auth/me");
          const need = clickInvoiceAmountSom(
            computeClickTopUpNeedSom(price, me.user.balance),
          );
          if (need === 0) {
            await chargeLandingAiStarter();
            setLandingTier("ai");
            setStep(1);
            return;
          }
          sessionStorage.setItem(SESSION_LANDING_AI_PENDING, "1");
          const payment = await api<CreateClickPaymentRes>("/payments/click", {
            method: "POST",
            body: JSON.stringify({ amount: need }),
          });
          const returnUrl =
            typeof window !== "undefined"
              ? `${window.location.origin}/dashboard/sites/new?click=1`
              : "/dashboard/sites/new?click=1";
          window.location.assign(buildClickPayUrl(payment, returnUrl));
        } catch (e) {
          const msg =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : "To‘lov boshlanmadi";
          setFinishError(msg);
        } finally {
          setTierPayLoading(null);
        }
        return;
      }
    },
    [],
  );

  const payLandingPackage = useCallback(
    async (tier: 6 | 12) => {
      setFinishError(null);
      const price = landingPriceByMonths[tier];
      sessionStorage.removeItem(SESSION_LANDING_AI_PENDING);
      setTierPayLoading(tier);
      try {
        const me = await api<{ user: { balance: number } }>("/auth/me");
        const need = clickInvoiceAmountSom(
          computeClickTopUpNeedSom(price, me.user.balance),
        );
        if (need === 0) {
          setLandingTier(tier);
          setStep(1);
          return;
        }
        sessionStorage.setItem(SESSION_LANDING_SUB_MONTHS, String(tier));
        const payment = await api<CreateClickPaymentRes>("/payments/click", {
          method: "POST",
          body: JSON.stringify({ amount: need }),
        });
        const returnUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard/sites/new?click=1`
            : "/dashboard/sites/new?click=1";
        window.location.assign(buildClickPayUrl(payment, returnUrl));
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "To‘lov boshlanmadi";
        setFinishError(msg);
      } finally {
        setTierPayLoading(null);
      }
    },
    [landingPriceByMonths],
  );

  const startLandingTrial = useCallback(() => {
    setFinishError(null);
    sessionStorage.removeItem(SESSION_LANDING_SUB_MONTHS);
    sessionStorage.removeItem(SESSION_LANDING_AI_PENDING);
    setLandingTier("free");
    setStep(1);
  }, []);

  const goToTahrirAfterLandingDomain = useCallback(async () => {
    if (!canNextFromStep1 || landingTier === null) return;
    setFinishError(null);
    if (landingTier === 6 || landingTier === 12) {
      setSubmitting(true);
      try {
        await chargeLandingCreatePackage(landingTier);
      } catch (e) {
        setFinishError(
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Balansdan yechilmadi",
        );
        return;
      } finally {
        setSubmitting(false);
      }
    }
    try {
      sessionStorage.setItem(
        TAHRIR_WIZARD_FROM_CREATE_KEY,
        JSON.stringify({
          name: normalizedSlug,
          brandName: businessName.trim(),
          heroTitle: businessName.trim(),
          description: DEFAULT_LANDING_HERO_DESCRIPTION,
          category: category.trim(),
          subscriptionMonths:
            landingTier === 6 || landingTier === 12 ? landingTier : undefined,
        }),
      );
    } catch {
      /* ignore */
    }
    router.push("/tahrir");
  }, [
    canNextFromStep1,
    landingTier,
    normalizedSlug,
    businessName,
    category,
    router,
  ]);

  const handleFinish = async () => {
    if (!canNextFromStep1 || !siteType) return;
    setSubmitting(true);
    setFinishError(null);
    const templateId: TemplateId =
      siteType === "vizitka" ? vizitkaTemplateId : landingTemplateId;
    try {
      if (siteType === "vizitka") {
        const payload = buildVizitkaCreatePayload({
          name: normalizedSlug,
          headline: businessName.trim(),
          category: category.trim() || "Xizmat / Biznes turi",
          tagline: tagline.trim(),
          description: description.trim(),
          phone: phone.trim(),
          address: address.trim(),
          hoursLine: hoursLine.trim(),
          mapsUrl: mapsUrl.trim(),
          social,
          templateId: vizitkaTemplateId,
          colorTheme,
          pattern,
          subscriptionMonths:
            vizitkaTier !== null && vizitkaTier !== "free"
              ? vizitkaTier
              : undefined,
        });
        try {
          const res = await postVizitka(payload);
          if (res?.site) {
            let normalized = normalizeSite(res.site as UnknownSite);
            const sid = normalized.id;
            try {
              if (heroImage?.dataUrl?.startsWith("data:")) {
                const hf = await dataUrlToFile(
                  heroImage.dataUrl,
                  heroImage.name || "hero.jpg",
                );
                const up = await uploadVizitkaPhoto(sid, hf);
                normalized = normalizeSite(up.site as UnknownSite);
              }
              if (logoImage?.dataUrl?.startsWith("data:")) {
                const lf = await dataUrlToFile(
                  logoImage.dataUrl,
                  logoImage.name || "logo.jpg",
                );
                const up = await uploadVizitkaLogo(sid, lf);
                normalized = normalizeSite(up.site as UnknownSite);
              }
            } catch (uploadErr) {
              const warn =
                uploadErr instanceof Error ? uploadErr.message : "Rasm yuklashda xato";
              saveSite(normalized);
              setSiteCreated({
                siteId: sid,
                slug: normalized.slug,
                businessName: businessNameFromSite(normalized),
                uploadWarning: warn,
              });
              return;
            }
            saveSite(normalized);
            setSiteCreated({
              siteId: sid,
              slug: normalized.slug,
              businessName: businessNameFromSite(normalized),
            });
            return;
          }
          setFinishError("Server javob bermadi. Qayta urinib ko‘ring.");
        } catch (e) {
          setFinishError(e instanceof Error ? e.message : "Saqlashda xato");
          return;
        }
        return;
      }
      if (landingTier === null) {
        setFinishError("Avval obuna muddatini tanlang.");
        return;
      }
      if (landingTier === 6 || landingTier === 12) {
        try {
          await chargeLandingCreatePackage(landingTier);
        } catch (e) {
          setFinishError(
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : "Balansdan yechilmadi",
          );
          return;
        }
      }
      const site = createSite({
        type: siteType,
        businessName: businessName.trim(),
        slug: normalizedSlug,
        templateId,
        partial: {
          category: category.trim() || "Xizmat / Biznes turi",
          tagline: tagline.trim() || "",
          description: description.trim() || "",
          phone: phone.trim() || "",
          address: address.trim() || "",
          hoursLine: hoursLine.trim() || "",
          social,
          mapsUrl: mapsUrl.trim(),
          accentInitials: deriveInitials(businessName.trim()),
          logoImage,
          heroImage,
          colorTheme,
          pattern,
        },
      });
      const nextSite =
        landingTier === "free"
          ? {
              ...site,
              trialEndsAt: computeLandingTrialEnds(pricing.freePublishDays),
            }
          : landingTier === "ai"
            ? {
                ...site,
                trialEndsAt: computeLandingTrialEnds(pricing.freePublishDays),
              }
            : {
                ...site,
                subscriptionEndsAt: computeLandingSubscriptionEnds(landingTier),
              };
      saveSite(nextSite);
      setSiteCreated({
        siteId: nextSite.id,
        slug: nextSite.slug,
        businessName: businessNameFromSite(nextSite),
      });
      return;
    } finally {
      setSubmitting(false);
    }
  };

  const previewContent = useMemo(() => {
    return {
      businessName: businessName || "Chayxana Alisher",
      category: category || "Milliy taomlar",
      tagline: tagline || "Toshkent · 2015 dan",
      description: description || "Tandir non va choyxona muhiti.",
      phone: phone || "+998 90 123 45 67",
      address: address || "Chilonzor, Toshkent",
      hoursLine: hoursLine || "09:00 – 22:00",
      mapsUrl,
      social: social.length
        ? social
        : [
            { id: "preview-ig", network: "instagram" as const, value: "chayxana_alisher" },
            { id: "preview-tg", network: "telegram" as const, value: "chayxana_uz" },
          ],
      accentInitials: deriveInitials(businessName || "CA"),
      logoImage,
      heroImage,
      colorTheme,
      pattern,
    };
  }, [
    businessName,
    category,
    tagline,
    description,
    phone,
    address,
    hoursLine,
    mapsUrl,
    social,
    logoImage,
    heroImage,
    colorTheme,
    pattern,
  ]);

  if (!siteType) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-10">
        <TypePicker pricing={pricing} onPick={setSiteType} />
      </div>
    );
  }

  if (siteType === "vizitka" && vizitkaTier === null) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-10">
        {finishError ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {finishError}
          </div>
        ) : null}
        <VizitkaPackagePicker
          pricing={pricing}
          payingTier={tierPayLoading === 6 || tierPayLoading === 12 ? tierPayLoading : null}
          onBack={() => {
            setFinishError(null);
            setSiteType(null);
            setStep(1);
          }}
          onSelectTier={handleVizitkaTierSelect}
        />
      </div>
    );
  }

  if (siteType === "landing" && landingTier === null) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-10">
        {finishError ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {finishError}
          </div>
        ) : null}
        <LandingPackagePicker
          pricing={pricing}
          payingTier={tierPayLoading}
          onBack={() => {
            setFinishError(null);
            setSiteType(null);
            setStep(1);
          }}
          onSelectFree={() => void handleLandingTierSelect("free")}
          onStartTrial={startLandingTrial}
          onPayPackage={payLandingPackage}
        />
      </div>
    );
  }

  if (siteCreated) {
    return (
      <div className="mx-auto max-w-lg px-5 py-10 lg:px-10">
        <SiteCreatedSuccess
          state={siteCreated}
          onCreateAnother={resetCreateFlow}
        />
      </div>
    );
  }

  if (siteType === "landing" && landingTier != null && landingComingSoon) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500">
              Tarif: <span className="font-semibold text-black">Landing</span>
            </p>
            {landingTier === "free" ? (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                Bepul — shablon asosida · {pricing.freePublishDays} kunlik sinov
              </p>
            ) : landingTier === "ai" ? (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                AI bilan landing — {formatSom(LANDING_AI_STARTER_PRICE_SOM)}
              </p>
            ) : (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                {landingTier} oy — {formatSom(landingPriceByMonths[landingTier])}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setLandingTier(null);
              setLandingComingSoon(false);
            }}
            className="text-xs font-medium text-black underline underline-offset-4"
          >
            Tarifni o&apos;zgartirish
          </button>
        </div>

        <StepIndicator current={3} />

        <LandingInfoComingSoonPlaceholder
          variant={landingTier === "ai" ? "ai" : "template"}
        />
      </div>
    );
  }

  if (siteType === "landing" && landingTier != null && !landingComingSoon) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
        {finishError ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {finishError}
          </div>
        ) : null}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500">
              Tarif: <span className="font-semibold text-black">Landing</span>
            </p>
            {landingTier === "free" ? (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                Bepul — shablon asosida · {pricing.freePublishDays} kunlik sinov
              </p>
            ) : landingTier === "ai" ? (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                AI bilan landing — {formatSom(LANDING_AI_STARTER_PRICE_SOM)}
              </p>
            ) : (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                {landingTier} oy — {formatSom(landingPriceByMonths[landingTier])}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setFinishError(null);
              setLandingTier(null);
              setStep(1);
            }}
            className="text-xs font-medium text-black underline underline-offset-4"
          >
            Tarifni o&apos;zgartirish
          </button>
        </div>

        <StepOne
          businessName={businessName}
          setBusinessName={setBusinessName}
          slug={slug}
          setSlug={(v) => {
            setSlug(normalizeSlug(v));
            setSlugTouched(true);
          }}
          category={category}
          setCategory={setCategory}
          slugError={slugError}
          canNext={canNextFromStep1}
          onNext={() => void goToTahrirAfterLandingDomain()}
          nextLabel="Tahrirda davom etish →"
          submitting={submitting}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-500">
            Tarif:{" "}
            <span className="font-semibold text-black">
              {siteType === "vizitka" ? "Vizitka" : "Landing"}
            </span>
          </p>
          {siteType === "vizitka" && vizitkaTier != null ? (
            vizitkaTier === "free" ? (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                Bepul — {pricing.freePublishDays} kunlik sinov
              </p>
            ) : (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                {vizitkaTier} oy —{" "}
                {formatSom(priceByMonths[vizitkaTier])}
              </p>
            )
          ) : null}
          {siteType === "landing" && landingTier != null ? (
            landingTier === "free" ? (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                Bepul — shablon asosida · {pricing.freePublishDays} kunlik sinov
              </p>
            ) : landingTier === "ai" ? (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                AI bilan landing — {formatSom(LANDING_AI_STARTER_PRICE_SOM)}
              </p>
            ) : (
              <p className="mt-0.5 text-[11px] text-neutral-600">
                {landingTier} oy —{" "}
                {formatSom(landingPriceByMonths[landingTier])}
              </p>
            )
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            setStep(1);
            setLandingComingSoon(false);
            if (siteType === "vizitka") {
              setVizitkaTier(null);
              return;
            }
            if (siteType === "landing") {
              setLandingTier(null);
              return;
            }
            setSiteType(null);
          }}
          className="text-xs font-medium text-black underline underline-offset-4"
        >
          Tarifni o&apos;zgartirish
        </button>
      </div>

      <StepIndicator current={step} />

      <div className="mt-8">
        {step === 1 ? (
          <StepOne
            businessName={businessName}
            setBusinessName={setBusinessName}
            slug={slug}
            setSlug={(v) => {
              setSlug(normalizeSlug(v));
              setSlugTouched(true);
            }}
            category={category}
            setCategory={setCategory}
            slugError={slugError}
            canNext={canNextFromStep1}
            onNext={() => setStep(2)}
          />
        ) : null}

        {step === 2 ? (
          siteType === "vizitka" ? (
            <StepTwoVizitka
              previewContent={previewContent}
              templateId={vizitkaTemplateId}
              setTemplateId={setVizitkaTemplateId}
              colorTheme={colorTheme}
              setColorTheme={setColorTheme}
              pattern={pattern}
              setPattern={setPattern}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          ) : (
            <StepTwoLanding
              onBack={() => {
                setLandingComingSoon(false);
                setStep(1);
              }}
              onNext={() => {
                if (landingTier === "free" || landingTier === "ai") {
                  setLandingComingSoon(true);
                } else {
                  setLandingComingSoon(false);
                }
                setStep(3);
              }}
            />
          )
        ) : null}

        {step === 3 &&
        !(siteType === "landing" && landingComingSoon) ? (
          <StepThree
            siteType={siteType}
            templateId={vizitkaTemplateId}
            previewContent={previewContent}
            tagline={tagline}
            setTagline={setTagline}
            description={description}
            setDescription={setDescription}
            phone={phone}
            setPhone={setPhone}
            address={address}
            setAddress={setAddress}
            hoursLine={hoursLine}
            setHoursLine={setHoursLine}
            social={social}
            setSocial={setSocial}
            mapsUrl={mapsUrl}
            setMapsUrl={setMapsUrl}
            logoImage={logoImage}
            setLogoImage={setLogoImage}
            heroImage={heroImage}
            setHeroImage={setHeroImage}
            submitting={submitting}
            finishError={finishError}
            onBack={() => setStep(2)}
            onFinish={handleFinish}
          />
        ) : null}
      </div>
    </div>
  );
}

function VizitkaPackagePicker({
  onBack,
  onSelectTier,
  pricing,
  payingTier,
}: {
  onBack: () => void;
  onSelectTier: (tier: "free" | 6 | 12) => void | Promise<void>;
  pricing: PublicPricing;
  payingTier: 6 | 12 | null;
}) {
  const freePackage = useMemo(
    () => buildVizitkaFreePackage(pricing.freePublishDays),
    [pricing.freePublishDays],
  );
  const packages = useMemo(() => buildVizitkaPackages(pricing), [pricing]);
  const busy = payingTier !== null;
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
          Obuna muddatini tanlang
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Avvalo bepul{" "}
          <strong className="font-medium text-neutral-800">
            {pricing.freePublishDays} kun
          </strong>{" "}
          sinov yoki to&apos;lovli paket. Paket tanlansa yetishmaydigan summa{" "}
          <strong className="font-medium text-neutral-800">CLICK</strong> orqali balansga
          o&apos;tadi; keyin &quot;Saytni yaratish&quot; bosilganda balansdan paket narxi
          yechiladi va muddat qo&apos;shiladi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSelectTier("free")}
          className="group relative flex flex-col gap-3 rounded-2xl border-2 border-dashed border-teal-400/80 bg-gradient-to-b from-teal-50/80 to-white p-6 text-left transition-all hover:border-teal-600 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Bepul
          </span>
          <div className="mt-1">
            <p className="text-lg font-semibold text-black">
              {freePackage.title}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-teal-800">
              {freePackage.priceLabel}
            </p>
            <p className="mt-1 text-xs text-neutral-600">{freePackage.subtitle}</p>
            <p className="mt-2 text-[11px] font-medium text-teal-700">
              {pricing.freePublishDays} kun sinov
            </p>
          </div>
          <span className="mt-auto pt-2 text-sm font-semibold text-teal-900">
            Tanlash →
          </span>
        </button>

        {packages.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={busy}
            onClick={() => void onSelectTier(p.months)}
            className={cn(
              "group relative flex flex-col gap-3 rounded-2xl border p-6 text-left transition-all disabled:pointer-events-none disabled:opacity-50",
              p.recommended
                ? "border-2 border-black bg-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]"
                : "border border-[color:var(--border)] bg-white hover:border-black",
            )}
          >
            {p.recommended ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Tavsiya
              </span>
            ) : null}
            <div className="mt-1">
              <p className="text-lg font-semibold text-black">{p.title}</p>
              <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">
                {formatSom(p.priceSom)}
              </p>
              <p className="mt-1 text-xs text-neutral-600">{p.subtitle}</p>
              {p.hint ? (
                <p className="mt-2 text-[11px] text-neutral-500">{p.hint}</p>
              ) : null}
            </div>
            <span className="mt-auto pt-2 text-sm font-semibold text-black">
              {payingTier === p.months ? "CLICK ga yo‘naltirilmoqda…" : "Tanlash →"}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-neutral-600 underline underline-offset-4 hover:text-black"
        >
          ← Sayt turini qayta tanlash
        </button>
      </div>
    </div>
  );
}

function LandingPackagePicker({
  onBack,
  onSelectFree,
  onStartTrial,
  onPayPackage,
  pricing,
  payingTier,
}: {
  onBack: () => void;
  onSelectFree: () => void | Promise<void>;
  onStartTrial: () => void;
  onPayPackage: (months: 6 | 12) => void | Promise<void>;
  pricing: PublicPricing;
  payingTier: 6 | 12 | "ai" | null;
}) {
  const [selectedMonths, setSelectedMonths] = useState<6 | 12 | null>(null);
  const freePackage = useMemo(
    () => buildLandingFreePackage(pricing.freePublishDays),
    [pricing.freePublishDays],
  );
  const pkg6 = useMemo(() => {
    const list = buildLandingPackages(pricing);
    return list.find((p) => p.months === 6) ?? list[0];
  }, [pricing]);
  const pkg12 = useMemo(() => {
    const list = buildLandingPackages(pricing);
    return list.find((p) => p.months === 12) ?? list[list.length - 1];
  }, [pricing]);
  const busy = payingTier !== null;
  const selectedPkg =
    selectedMonths === 6 ? pkg6 : selectedMonths === 12 ? pkg12 : null;
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
          Landing paketini tanlang
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          <strong className="font-medium text-neutral-800">Bepul</strong> — tayyor shablon asosida;
          yoki <strong className="font-medium text-neutral-800">AI</strong> bilan qisqa savollar orqali
          landing · <strong className="font-medium text-neutral-800">6 oy</strong> yoki{" "}
          <strong className="font-medium text-neutral-800">1 yillik</strong> obuna. Yetishmaydigan summa{" "}
          <strong className="font-medium text-neutral-800">CLICK</strong> orqali balansga
          o&apos;tadi. Obuna paketida avval sinov yoki to‘lovni tanlang.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSelectFree()}
          className="group relative flex flex-col gap-3 rounded-2xl border-2 border-dashed border-teal-400/80 bg-gradient-to-b from-teal-50/80 to-white p-6 text-left transition-all hover:border-teal-600 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Shablon
          </span>
          <div className="mt-1">
            <p className="text-lg font-semibold text-black">Bepul</p>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-teal-800">
              {freePackage.priceLabel}
            </p>
            <p className="mt-1 text-xs text-neutral-600">
              Tayyor shablon asosida landing — bloklar va forma.
            </p>
            <p className="mt-2 text-[11px] font-medium text-teal-700">
              {pricing.freePublishDays} kun sinov
            </p>
          </div>
          <span className="mt-auto pt-2 text-sm font-semibold text-teal-900">
            Tanlash →
          </span>
        </button>

        <div
          role="note"
          aria-label="AI bilan landing — tez orada"
          className={cn(
            "group relative flex cursor-not-allowed flex-col gap-3 rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-violet-50/60 to-neutral-50/90 p-6 text-left",
            busy && "opacity-50",
          )}
        >
          <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-violet-600/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            AI
          </span>
          <div className="mt-1">
            <p className="text-lg font-semibold text-black">AI bilan landing</p>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-violet-900/80">
              {formatSom(LANDING_AI_STARTER_PRICE_SOM)}
            </p>
            <p className="mt-1 text-xs text-neutral-600">
              Sun&apos;iy intellekt yordamida matn va tuzilmani tezda yig&apos;ish — bir martalik
              boshlang&apos;ich paket.
            </p>
          </div>
          <p className="mt-auto border-t border-neutral-200/90 pt-4 text-center text-2xl font-extrabold tracking-tight text-neutral-500 sm:text-3xl">
            Tez orada
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => setSelectedMonths(6)}
          className={cn(
            "group relative flex flex-col gap-3 rounded-2xl border-2 bg-white p-6 text-left shadow-[0_18px_40px_-24px_rgba(0,0,0,0.25)] transition-all hover:border-black hover:shadow-md disabled:pointer-events-none disabled:opacity-50",
            selectedMonths === 6
              ? "border-black ring-2 ring-black/15"
              : "border-neutral-300",
          )}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-neutral-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Obuna · 6 oy
          </span>
          <div className="mt-1">
            <p className="text-lg font-semibold text-black">{pkg6.title}</p>
            {pkg6.hint ? (
              <>
                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">
                  {pkg6.hint}
                </p>
                <p className="mt-1 text-xs text-neutral-600">{pkg6.subtitle}</p>
                <p className="mt-2 text-[20px] font-medium tabular-nums text-neutral-500">
                  {formatSom(pkg6.priceSom)}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">
                  {formatSom(pkg6.priceSom)}
                </p>
                <p className="mt-1 text-xs text-neutral-600">{pkg6.subtitle}</p>
              </>
            )}
          </div>
          <span className="mt-auto pt-2 text-sm font-semibold text-black">
            {selectedMonths === 6 ? "Tanlangan" : "Tanlash →"}
          </span>
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => setSelectedMonths(12)}
          className={cn(
            "group relative flex flex-col gap-3 rounded-2xl border-2 bg-gradient-to-b from-amber-50/70 to-white p-6 text-left shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)] transition-all hover:shadow-md disabled:pointer-events-none disabled:opacity-50",
            selectedMonths === 12
              ? "border-black ring-2 ring-black/15"
              : "border-black/40",
          )}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Obuna · 1 yil
          </span>
          <div className="mt-1">
            <p className="text-lg font-semibold text-black">{pkg12.title}</p>
            {pkg12.hint ? (
              <>
                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">
                  {pkg12.hint}
                </p>
                <p className="mt-1 text-xs text-neutral-600">{pkg12.subtitle}</p>
                <p className="mt-2 text-[20px] font-medium tabular-nums text-neutral-500">
                  {formatSom(pkg12.priceSom)}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">
                  {formatSom(pkg12.priceSom)}
                </p>
                <p className="mt-1 text-xs text-neutral-600">{pkg12.subtitle}</p>
              </>
            )}
          </div>
          <span className="mt-auto pt-2 text-sm font-semibold text-black">
            {selectedMonths === 12 ? "Tanlangan" : "Tanlash →"}
          </span>
        </button>
      </div>

      {selectedMonths != null && selectedPkg ? (
        <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-black">
            {selectedPkg.title} — {formatSom(selectedPkg.priceSom)}
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Bepul {pricing.freePublishDays} kun sinov bilan boshlang yoki paketni hozir to‘lang.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={onStartTrial}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-teal-600 bg-teal-50 px-4 text-sm font-semibold text-teal-900 transition hover:bg-teal-100 disabled:opacity-50"
            >
              {pricing.freePublishDays} kun sinov muddati
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onPayPackage(selectedMonths)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {payingTier === selectedMonths
                ? "To‘lov tekshirilmoqda…"
                : "To‘lash"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-neutral-600 underline underline-offset-4 hover:text-black"
        >
          ← Sayt turini qayta tanlash
        </button>
      </div>
    </div>
  );
}

function TypePicker({
  onPick,
  pricing,
}: {
  onPick: (type: SiteType) => void;
  pricing: PublicPricing;
}) {
  const startPrice = formatSom(pricing.pricesSom["6"]);
  const landingLine = `Bepul shablon · AI ${formatSom(LANDING_AI_STARTER_PRICE_SOM)} · 6 oy ${formatSom(pricing.landingPricesSom["6"])}`;
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
          Qaysi tarifda sayt yaratasiz?
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Tarifni keyin ham o&apos;zgartirish mumkin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TypeCard
          title="Vizitka"
          price={`Bepul ${pricing.freePublishDays} kun yoki ${startPrice} dan · paketlar`}
          description="Bir ekranli biznes kartasi — kontaktlar, ijtimoiy tarmoq linklari, manzil. Obuna muddatini tanlaysiz."
          features={[
            "1 ekranli sayt",
            "4 ta joylashuv · 8 ta rang",
            "Logo va hero rasm",
            "Mobile birinchi dizayn",
          ]}
          onClick={() => onPick("vizitka")}
        />
        <TypeCard
          title="Landing"
          price={landingLine}
          description="Shablon asosida sahifa: tartibli bloklar va pastda ariza formasi — egaga Telegram orqali keladi."
          features={[
            "Header va matn bloklari tahrirlash",
            "Pastki forma: ism, telefon, Telegram, izoh",
            "Oddiy yoki to‘liq shablon",
            "Nashr — URL da jonli",
          ]}
          recommended
          onClick={() => onPick("landing")}
        />
      </div>
    </div>
  );
}

function TypeCard({
  title,
  price,
  description,
  features,
  recommended,
  disabled,
  onClick,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const cardClass = cn(
    "group relative flex flex-col gap-5 rounded-2xl p-6 text-left transition-all",
    disabled
      ? "cursor-not-allowed border border-neutral-200 bg-neutral-50/90 text-neutral-600"
      : recommended
        ? "border-2 border-black bg-white"
        : "border border-[color:var(--border)] bg-white hover:border-black",
  );

  const body = (
    <>
      {disabled ? (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-neutral-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
          Tez orada
        </span>
      ) : recommended ? (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
          Tavsiya
        </span>
      ) : null}

      <div>
        <h3
          className={cn(
            "text-xl font-semibold tracking-tight",
            disabled ? "text-neutral-700" : "text-black",
          )}
        >
          {title}
        </h3>
        <p className="mt-1 text-sm text-neutral-500">{price}</p>
      </div>

      <p
        className={cn(
          "text-sm leading-relaxed",
          disabled ? "text-neutral-600" : "text-neutral-700",
        )}
      >
        {description}
      </p>

      <ul className="space-y-2">
        {features.map((f) => (
          <li
            key={f}
            className={cn(
              "flex items-start gap-2 text-sm",
              disabled ? "text-neutral-600" : "text-black",
            )}
          >
            <svg
              viewBox="0 0 14 14"
              className="mt-[3px] h-4 w-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 7.5L6 10.5L11 4.5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      {disabled ? (
        <span className="mt-auto pt-2 text-sm font-medium text-neutral-500">
          Tez orada
        </span>
      ) : (
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-black">
          Tanlash
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3 7H11M11 7L7 3M11 7L7 11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </>
  );

  if (disabled) {
    return (
      <div
        className={cardClass}
        aria-disabled="true"
        aria-label={`${title} — tez orada`}
      >
        {body}
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cardClass}>
      {body}
    </button>
  );
}

function StepIndicator({ current }: { current: Step }) {
  return (
    <ol className="flex items-center gap-3 text-xs">
      {steps.map((s, idx) => (
        <li key={s.n} className="flex flex-1 items-center gap-3">
          <div className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                current >= s.n
                  ? "bg-black text-white"
                  : "bg-neutral-200 text-neutral-500",
              )}
            >
              {s.n}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                current >= s.n ? "text-black" : "text-neutral-500",
              )}
            >
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 ? (
            <span
              aria-hidden
              className={cn(
                "h-px flex-1",
                current > s.n ? "bg-black" : "bg-[color:var(--border)]",
              )}
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function StepOne({
  businessName,
  setBusinessName,
  slug,
  setSlug,
  category,
  setCategory,
  slugError,
  canNext,
  onNext,
  nextLabel,
  submitting,
}: {
  businessName: string;
  setBusinessName: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  slugError: string | null;
  canNext: boolean;
  onNext: () => void;
  nextLabel?: string;
  submitting?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[color:var(--border)] bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight text-black">
        Biznes nomi
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Saytda sarlavha sifatida ko&apos;rinadi va manzil avtomatik yaratiladi.
      </p>

      <div className="mt-6 space-y-4">
        <Field label="Biznes nomi">
          <TextInput
            value={businessName}
            onChange={setBusinessName}
            placeholder="Masalan: Chayxana Alisher"
          />
        </Field>
        <Field label="Kategoriya">
          <CategorySelect value={category} onChange={setCategory} />
        </Field>
        <Field
          label="Veb-manzil"
          error={slugError}
          hint="Sayt havolasi: weblinker.uz/… (bu jismoniy manzil emas)"
        >
          <TextInput
            prefix="weblinker.uz/"
            value={slug}
            onChange={setSlug}
            placeholder="chayxana-alisher"
          />
        </Field>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canNext || Boolean(submitting)}
        >
          {submitting ? "Kutilmoqda…" : nextLabel ?? "Davom etish →"}
        </Button>
      </div>
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="space-y-2" ref={ref}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-[color:var(--border)] bg-white px-3 text-left text-sm text-black transition-colors hover:border-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <span
            className={cn(
              "truncate",
              !value && "text-neutral-400",
            )}
          >
            {value || "Kategoriya tanlash"}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
            className={cn(
              "flex-shrink-0 transition-transform",
              open && "rotate-180",
            )}
          >
            <path
              d="M3 5L7 9L11 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-[color:var(--border)] bg-white py-1 shadow-[0_14px_40px_-18px_rgba(0,0,0,0.3)]">
            {COMMON_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onChange(cat);
                  setCustomMode(false);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-100",
                  value === cat && !customMode
                    ? "font-semibold text-black"
                    : "text-neutral-700",
                )}
              >
                {value === cat && !customMode ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                      d="M3 7L6 10L11 4"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="w-[14px]" aria-hidden />
                )}
                {cat}
              </button>
            ))}
            <div className="my-1 h-px bg-[color:var(--border)]" />
            <button
              type="button"
              onClick={() => {
                setCustomMode(true);
                setOpen(false);
                onChange("");
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-black hover:bg-neutral-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Boshqa...
            </button>
          </div>
        ) : null}
      </div>

      {customMode ? (
        <TextInput
          value={value}
          onChange={onChange}
          placeholder="O'z kategoriyangizni yozing"
        />
      ) : null}
    </div>
  );
}

function StepTwoVizitka({
  previewContent,
  templateId,
  setTemplateId,
  colorTheme,
  setColorTheme,
  pattern,
  setPattern,
  onBack,
  onNext,
}: {
  previewContent: ReturnType<typeof defaultVizitkaContent>;
  templateId: VizitkaTemplateId;
  setTemplateId: (id: VizitkaTemplateId) => void;
  colorTheme: ColorThemeId;
  setColorTheme: (id: ColorThemeId) => void;
  pattern: PatternId;
  setPattern: (id: PatternId) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-black">
          Joylashuv va rang
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          4 ta joylashuv va 8 ta rang — barcha kombinatsiyalar.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-[color:var(--border)] bg-white p-3">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
              Rang · 16 ta (8 to&apos;q, 8 och)
            </p>
            <p className="text-[11px] font-medium text-black">
              {getColorTheme(colorTheme).name}
            </p>
          </div>
          <ColorPicker value={colorTheme} onChange={setColorTheme} />
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-white p-3">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
            Naqsh · shablon ichidagi bezak
          </p>
          <PatternPicker
            value={pattern}
            onChange={setPattern}
            color={getColorTheme(colorTheme).primary}
          />
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
            Joylashuv
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {VIZITKA_TEMPLATES.map((tpl) => {
              const selected = tpl.id === templateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplateId(tpl.id)}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-xl border-2 bg-white text-left transition-all",
                    selected
                      ? "border-black shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)]"
                      : "border-[color:var(--border)] hover:border-neutral-400",
                  )}
                >
                  <TemplateThumb
                    templateId={tpl.id}
                    content={previewContent}
                  />
                  <div className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black">
                        {tpl.name}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-neutral-500">
                        {tpl.description}
                      </p>
                    </div>
                    <Radio checked={selected} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button size="lg" variant="secondary" onClick={onBack}>
          ← Orqaga
        </Button>
        <Button size="lg" onClick={onNext}>
          Davom etish →
        </Button>
      </div>
    </div>
  );
}

function LandingInfoComingSoonPlaceholder({
  variant,
}: {
  variant: "template" | "ai";
}) {
  const blurLayers =
    variant === "ai"
      ? "from-violet-100/70 via-white/50 to-violet-50/40"
      : "from-neutral-100/85 via-white/45 to-neutral-200/55";

  return (
    <div className="mt-8">
      <div className="relative isolate overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-inner">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${blurLayers} animate-pulse`}
          style={{ animationDuration: "3s" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 animate-pulse rounded-full bg-neutral-300/70 blur-3xl"
          style={{ animationDuration: "2.8s" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 animate-pulse rounded-full bg-[rgba(181,107,37,.18)] blur-3xl"
          style={{ animationDuration: "3.4s" }}
        />
        <div className="relative backdrop-blur-[10px]">
          <div className="flex min-h-[min(52vh,480px)] flex-col items-center justify-center px-6 py-14 text-center sm:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Ma&apos;lumotlar
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 motion-safe:animate-[pulse_2.2s_ease-in-out_infinite] sm:text-4xl">
                Tez kunda
              </h2>
              <span className="mb-1 inline-flex gap-1 pb-1 sm:mb-2" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block h-2 w-2 rounded-full bg-neutral-400 motion-safe:animate-bounce"
                    style={{
                      animationDelay: `${i * 160}ms`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </span>
            </div>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
              {variant === "ai"
                ? "AI yordamida landing tuzish bosqichi tez orada ochiladi. To‘langan paketingiz hisobingizda qoladi."
                : "Shablon asosidagi landingni yakunlash va ma’lumotlarni to‘ldirish tez orada mavjud bo‘ladi."}
            </p>
            <div className="mt-10 flex justify-center">
              <Button size="lg" href="/">
                Bosh sahifaga qaytish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTwoLanding({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-black">
          Shablon
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Landing uchun hozircha 1 ta shablon mavjud — boshqa variantlar tez orada.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-black bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Default
            </p>
            <h3 className="mt-1 text-lg font-semibold text-black">
              Landing — Classic
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Hero, statistika, afzalliklar, xizmatlar, galereya, mijozlar fikri,
              aloqa bloki va Telegram forma.
            </p>
          </div>
          <Radio checked />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button size="lg" variant="secondary" onClick={onBack}>
          ← Orqaga
        </Button>
        <Button size="lg" onClick={onNext}>
          Davom etish →
        </Button>
      </div>
    </div>
  );
}

function TemplateThumb({
  templateId,
  content,
}: {
  templateId: VizitkaTemplateId;
  content: ReturnType<typeof defaultVizitkaContent>;
}) {
  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden border-b border-[color:var(--border)] bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          transform: "scale(0.52)",
          width: `${100 / 0.52}%`,
          height: `${100 / 0.52}%`,
        }}
      >
        <VizitkaTemplate content={content} templateId={templateId} />
      </div>
    </div>
  );
}

function StepThree({
  siteType,
  templateId,
  previewContent,
  tagline,
  setTagline,
  description,
  setDescription,
  phone,
  setPhone,
  address,
  setAddress,
  hoursLine,
  setHoursLine,
  social,
  setSocial,
  mapsUrl,
  setMapsUrl,
  logoImage,
  setLogoImage,
  heroImage,
  setHeroImage,
  submitting,
  finishError,
  onBack,
  onFinish,
}: {
  siteType: SiteType;
  templateId: VizitkaTemplateId;
  previewContent: ReturnType<typeof defaultVizitkaContent>;
  tagline: string;
  setTagline: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  hoursLine: string;
  setHoursLine: (v: string) => void;
  social: SocialLinks;
  setSocial: (v: SocialLinks) => void;
  mapsUrl: string;
  setMapsUrl: (v: string) => void;
  logoImage: SiteImage | undefined;
  setLogoImage: (v: SiteImage | undefined) => void;
  heroImage: SiteImage | undefined;
  setHeroImage: (v: SiteImage | undefined) => void;
  submitting: boolean;
  finishError?: string | null;
  onBack: () => void;
  onFinish: () => void;
}) {
  const supportsHero =
    siteType === "landing" ||
    (VIZITKA_TEMPLATES.find((t) => t.id === templateId)?.supportsHero ?? false);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-black">
          Asosiy ma&apos;lumotlar
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          O&apos;ng tomonda jonli ko&apos;rinadi. Keyin tahrirlash mumkin.
        </p>

        <div className="mt-6 space-y-5">
          {supportsHero ? (
            <ImageUpload
              label="Hero rasm"
              hint="Tepadagi katta rasm. 16:9 nisbatda yaxshi ko'rinadi."
              value={heroImage}
              onChange={setHeroImage}
              aspect="wide"
            />
          ) : null}

          <ImageUpload
            label="Logo rasm (ixtiyoriy)"
            hint="Rasm yuklamagan taqdirda bosh harflar ishlatiladi."
            value={logoImage}
            onChange={setLogoImage}
            aspect="square"
          />

          <Field label="Telefon">
            <TextInput
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+998 90 123 45 67"
            />
          </Field>

          <Field
            label="Manzil"
            hint="Ko‘cha, shahar — xarita kartochkasi shu matn bo‘yicha ko‘rinadi"
          >
            <TextInput
              value={address}
              onChange={setAddress}
              placeholder="Toshkent, Chilonzor"
            />
          </Field>

          <Field label="Ish vaqti" hint="Presetlardan tanlang yoki moslang">
            <HoursEditor value={hoursLine} onChange={setHoursLine} />
          </Field>

          <Field label="Qisqa taqdimot" hint="Biznes nomi ostida chiqadi">
            <TextInput
              value={tagline}
              onChange={setTagline}
              placeholder="Toshkentdagi eng yaxshi ..."
            />
          </Field>

          <Field label="Tavsif">
            <TextAreaInput
              value={description}
              onChange={setDescription}
              rows={3}
              placeholder="Biznesingiz haqida 1-2 jumlada..."
            />
          </Field>

          <Field
            label="Xarita havolasi (ixtiyoriy)"
            hint="To‘liq Google/Yandex sahifa havolasi — kartochka ustiga bosganda shu yerga ochiladi (yuqoridagi manzil faqat ko‘rinish uchun)"
          >
            <TextInput
              value={mapsUrl}
              onChange={setMapsUrl}
              placeholder="https://maps.google.com/..."
            />
          </Field>

          {(address.trim() || mapsUrl.trim()) && siteType === "vizitka" ? (
            <div className="space-y-2 rounded-xl border border-[color:var(--border)] bg-neutral-50/80 p-4">
              <p className="text-[11px] font-medium text-neutral-600">
                Oldindan ko‘rinish — manzil bo‘yicha; bosilsa pastdagi havola ochiladi (bo‘lsa)
              </p>
              <MapEmbed
                address={address}
                mapsUrl={mapsUrl}
                height={160}
                className="w-full"
                rounded="rounded-xl"
              />
            </div>
          ) : null}

          <Field
            label="Ijtimoiy tarmoqlar"
            hint="Kerakli tarmoqni tanlab, username yoki havolani kiriting"
          >
            <SocialEditor value={social} onChange={setSocial} />
          </Field>
        </div>

        <div className="mt-8 space-y-3">
          {finishError ? (
            <p className="text-sm text-red-700" role="alert">
              {finishError}
            </p>
          ) : null}
          <div className="flex justify-between gap-3">
            <Button size="lg" variant="secondary" onClick={onBack}>
              ← Orqaga
            </Button>
            <Button size="lg" onClick={onFinish} disabled={submitting}>
              {submitting ? "Yaratilmoqda..." : "Saytni yaratish"}
            </Button>
          </div>
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            Jonli ko&apos;rinish
          </p>
          {siteType === "vizitka" ? (
            <ScaledPhone scale={0.85}>
              <VizitkaTemplate
                content={previewContent}
                templateId={templateId}
              />
            </ScaledPhone>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-white p-4 text-center text-xs text-neutral-500">
              Landing preview tez orada
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function SiteCreatedSuccess({
  state,
  onCreateAnother,
}: {
  state: SiteCreatedSuccessState;
  onCreateAnother: () => void;
}) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const publicPath = `/${state.slug}`;
  const publicHref = `${origin}${publicPath}`;

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-black">
          Sayt muvaffaqiyatli yaratildi
        </h2>
        <p className="mt-1.5 text-sm text-neutral-600">{state.businessName}</p>
        {state.uploadWarning ? (
          <p className="mt-4 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {state.uploadWarning}
          </p>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
          Jamoat havolasi
        </p>
        <a
          href={publicHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block break-all text-sm font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900"
        >
          {publicHref}
        </a>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button
          href={publicPath}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          className="min-w-[160px]"
        >
          Saytni ko&apos;rish
        </Button>
        <Button
          href={`/dashboard/sites/${state.siteId}`}
          variant="secondary"
          size="lg"
          className="min-w-[160px]"
        >
          Tahrirlash
        </Button>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="mt-4 w-full border border-dashed border-neutral-300"
        onClick={onCreateAnother}
      >
        Yana sayt yaratish
      </Button>
    </div>
  );
}

function ScaledPhone({
  children,
  scale,
}: {
  children: React.ReactNode;
  scale: number;
}) {
  const naturalW = 413;
  const naturalH = 872;
  const w = Math.round(naturalW * scale);
  const h = Math.round(naturalH * scale);
  return (
    <div className="relative" style={{ width: w, height: h }}>
      <div
        className="absolute left-0 top-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <PhoneFrame>{children}</PhoneFrame>
      </div>
    </div>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        checked ? "border-black" : "border-[color:var(--border)]",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full transition-colors",
          checked ? "bg-black" : "bg-transparent",
        )}
      />
    </span>
  );
}

function validateSlug(slug: string, ready: boolean): string | null {
  if (!slug) return "Manzilni kiriting";
  if (slug.length < 3) return "Kamida 3 ta belgi bo'lishi kerak";
  if (slug.length > 40) return "40 tadan ko'p belgi yo'q";
  if (RESERVED_SLUGS.has(slug)) return "Bu manzil band qilingan";
  if (ready && slugExists(slug)) return "Bu manzil allaqachon ishlatilgan";
  return null;
}

function computeLandingTrialEnds(freeDays: number): string {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + freeDays);
  trialEnd.setHours(23, 59, 59, 999);
  return trialEnd.toISOString();
}

function computeLandingSubscriptionEnds(months: 6 | 12): string {
  const end = new Date();
  end.setMonth(end.getMonth() + months);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}
