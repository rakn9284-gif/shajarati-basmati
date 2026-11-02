import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: {
    default: "شجرتي بصمتي | SHAJARATI BASMATI — Skikda",
    template: "%s | شجرتي بصمتي",
  },
  description:
    "منصة رقمية لمتابعة وإدارة الأشجار في ولاية سكيكدة: جواز رقمي لكل شجرة، حملات تشجير، خرائط تفاعلية، ومجلة مجتمعية. لا نغرس شجرة ونرحل، بل نتابعها حتى تنمو.",
  keywords: [
    "شجرتي بصمتي",
    "سكيكدة",
    "تشجير",
    "بيئة",
    "الجزائر",
    "SHAJARATI BASMATI",
    "Skikda",
    "tree management",
    "reforestation",
  ],
  authors: [{ name: "Shajarati Basmati" }],
  openGraph: {
    title: "شجرتي بصمتي | SHAJARATI BASMATI",
    description:
      "كل شجرة لها هوية، وكل بصمة تصنع ظلاً. منصة إدارة التشجير لولاية سكيكدة.",
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
