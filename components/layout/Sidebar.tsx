"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Utensils,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Plus,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Menu", href: "/dashboard/menu", icon: Utensils },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Staff", href: "/dashboard/staff", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, logout, refreshProfile } = useAuth();
  const { currentRestaurant, fetchRestaurant, restaurants } = useRestaurant();

  const handleRestaurantSelect = async (slug: string) => {
    await fetchRestaurant(slug);
    setIsMobileOpen(false);
  };

  return (
    <>
      <Button
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
        variant="ghost"
        size="icon"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-ink-200 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-[var(--sidebar-width)]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:translate-x-0",
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-ink-200">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-crimson-600 flex items-center justify-center">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-ink-900">
                Mesero
              </span>
            </Link>
          )}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="icon"
            className={cn("lg:hidden", isCollapsed && "hidden")}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <nav
          className="flex-1 overflow-y-auto p-4 space-y-1"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase text-ink-500">
              Restaurants
            </h3>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsDialogOpen(true)}
              aria-label="Add restaurant"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Restaurant list - similar to Cortex workspaces */}
          {restaurants && restaurants.length > 0 ? (
            <ul className="space-y-1">
              {restaurants.map((restaurant) => (
                <li key={restaurant.slug}>
                  <button
                    onClick={() => handleRestaurantSelect(restaurant.slug)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-600 transition-all duration-150 cursor-pointer select-none",
                      "hover:bg-ink-50 hover:text-ink-900",
                      currentRestaurant?.slug === restaurant.slug &&
                        "bg-crimson-50 text-crimson-700 font-medium",
                    )}
                  >
                    <div className="h-8 w-8 rounded-lg bg-crimson-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-crimson-600" />
                    </div>
                    {!isCollapsed && (
                      <span className="truncate flex-1">{restaurant.name}</span>
                    )}
                    {currentRestaurant?.slug === restaurant.slug && (
                      <div className="h-2 w-2 rounded-full bg-crimson-600" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-ink-500 text-sm">
              <p>No restaurants yet</p>
            </div>
          )}

          <Separator className="my-4" />

          <nav
            className="space-y-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn("nav-item", isActive && "active")}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "nav-icon h-5 w-5 flex-shrink-0",
                      isActive && "text-crimson-600",
                    )}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </nav>

        <div className="p-4 border-t border-ink-200">
          <Separator className="mb-4" />

          {!isCollapsed && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900 transition-all duration-150">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.avatar_url || undefined}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="truncate font-medium text-ink-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-ink-500">
                      {user.email}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    refreshProfile();
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isCollapsed && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center justify-center px-3 py-2.5 rounded-lg transition-colors hover:bg-ink-50">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.avatar_url || undefined}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    refreshProfile();
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
