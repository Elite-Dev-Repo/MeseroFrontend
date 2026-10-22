"use client";

import { AuthProvider } from "@/context/AuthContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RestaurantProvider>
        {children}
        <Toaster position="top-right" />
      </RestaurantProvider>
    </AuthProvider>
  );
}