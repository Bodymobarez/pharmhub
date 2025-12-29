import type { Metadata } from "next";
import { Orbitron, Cairo, Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pharmacy Hub - نظام إدارة الصيدليات",
  description: "نظام احترافي متكامل لإدارة سلاسل الصيدليات مع دعم Multi-Tenant",
  keywords: ["pharmacy", "management", "pos", "inventory", "صيدلية", "إدارة"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${orbitron.variable} ${cairo.variable} antialiased min-h-screen`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

