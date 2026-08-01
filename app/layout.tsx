import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Lato } from "next/font/google";
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
  title: "Claims Assistant",
  description:
    "Tax benefits claims assistant for reimbursements and vehicle registration.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F1F1F1",
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
        {children}
      </body>
    </html>
  );
}
