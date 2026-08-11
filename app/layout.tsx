import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Lato } from "next/font/google";
import { AddToHomeScreenPrompt } from "@/components/shared/AddToHomeScreenPrompt";
import { ServiceWorkerRegistrar } from "@/components/shared/ServiceWorkerRegistrar";
import { withBasePath } from "@/lib/basePath";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

const ppTelegraf = localFont({
  src: [
    {
      path: "../fonts/pp-telegraf/PPTelegraf-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/pp-telegraf/PPTelegraf-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/pp-telegraf/PPTelegraf-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/pp-telegraf/PPTelegraf-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pp-telegraf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Benefits Assistant",
  description:
    "Tax benefits claims assistant for reimbursements and vehicle registration.",
  applicationName: "Benefits Assistant",
  // iOS Safari ignores the manifest's `display`, so standalone launch and the
  // home screen icon have to be declared separately.
  appleWebApp: {
    capable: true,
    title: "Benefits Assistant",
    statusBarStyle: "default",
  },
  icons: {
    icon: withBasePath("/assets/pwa/icon-192.png"),
    apple: withBasePath("/assets/pwa/apple-touch-icon.png"),
  },
  other: {
    // Next emits only the modern `mobile-web-app-capable`. iOS before 16.4
    // honours the manifest's `display` not at all and needs this instead.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8FAF8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} ${ppTelegraf.variable} ${lato.className} antialiased`}
      >
        <div className="desktop-mobile-frame">
          {children}
          <AddToHomeScreenPrompt />
        </div>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
