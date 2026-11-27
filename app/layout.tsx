import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: {
    default: "حملتي | HAMALATI — Skikda",
    template: "%s | حملتي",
  },
  description:
    "منصة رقمية لإدارة وتوثيق حملات التشجير الجماعية ومواقع الغرس في ولاية سكيكدة: حدود الموقع على الخريطة، رمز QR واحد لكل حملة، إحصائيات الأشجار والأنواع، ومجلة مجتمعية.",
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
  themeColor: "#123B2A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
