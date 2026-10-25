import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProviders } from "./theme-providers";
import { cn } from "@/lib/utils";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
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
      className={cn("h-full", "antialiased", spaceMono.variable, "font-body")}
    >
      <body className="min-h-full bg-surface-tertiary text-neutral-900">
        <ThemeProviders>
          <Providers>{children}</Providers>
        </ThemeProviders>
      </body>
    </html>
  );
}
