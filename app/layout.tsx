import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import BottomNav from "@/components/BottomNav";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "حملتي | HAMALATI — Skikda",
    template: "%s | حملتي",
  },
  description:
    "منصة رقمية موحدة لإدارة حملات التشجير ومواقع الغرس في ولاية سكيكدة: حدود المواقع على الخريطة، رمز QR واحد لكل حملة، وإحصائيات الأشجار والمتطوعين.",
  keywords: [
    "حملتي",
    "HAMALATI",
    "سكيكدة",
    "تشجير",
    "حملات تشجير",
    "مواقع غرس",
    "بيئة",
    "الجزائر",
    "Skikda",
    "reforestation campaigns",
  ],
  authors: [{ name: "Hamalati" }],
  openGraph: {
    title: "حملتي | HAMALATI",
    description:
      "كل حملة تشجير لها موقع موثّق ورمز QR واحد يفتح بطاقتها ومتابعة نموها.",
    type: "website",
    locale: "ar_DZ",
  },
};

export const viewport: Viewport = {
  themeColor: "#022c22",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/30 font-sans text-emerald-950 antialiased">
        <AppProvider>
          {children}
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
