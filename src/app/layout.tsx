import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weblinker — 15 daqiqada biznes saytingizni yarating",
  description:
    "O'zbekistondagi kichik va o'rta biznes uchun oson va qulay sayt yaratish platformasi. Shablon tanlang, matnni tahrirlang va saytingiz tayyor.",
  metadataBase: new URL("https://weblinker.uz"),
  openGraph: {
    title: "Weblinker — 15 daqiqada biznes saytingizni yarating",
    description:
      "Dasturchisiz va dizaynersiz o'z biznes saytingizni yarating. 10 kun bepul sinov.",
    type: "website",
    locale: "uz_UZ",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
