"use client";

import { ThemeProvider } from "next-themes";

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      scriptProps={{ type: "application/json" }}
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
}
