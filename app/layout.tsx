import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProviders } from "./theme-providers";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mesero - Restaurant Management",
  description: "Manage your restaurant menu, inventory, staff, and orders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        syne.variable,
        dmSans.variable,
        jetbrainsMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full bg-surface-tertiary text-ink-900">
        <ThemeProviders>
          <Providers>{children}</Providers>
        </ThemeProviders>
      </body>
    </html>
  );
}
