"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Utensils } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-surface-tertiary flex", className)}>
      <div className="hidden md:flex md:w-1/2 bg-ink-900 p-12 flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-crimson-900/50 to-crimson-700/50" />
        <div className="relative z-10 max-w-md text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="h-12 w-12 rounded-xl bg-crimson-600 flex items-center justify-center">
              <Utensils className="h-7 w-7 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">
              Mesero
            </span>
          </Link>
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Restaurant Management Made Simple
          </h1>
          <p className="text-ink-300 text-lg">
            Manage your menu, inventory, staff, and orders all in one place.
            Built for modern restaurants.
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-500 text-sm">
          © {new Date().getFullYear()} Mesero. All rights reserved.
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
