import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Kirish — Weblinker",
  description: "Telegram orqali tezkor kirish",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Kirish</h1>
        <p className="mt-1 text-sm text-neutral-500">Telegram bot — tezkor kirish</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
