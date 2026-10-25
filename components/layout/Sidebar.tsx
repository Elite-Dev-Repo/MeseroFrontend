"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Utensils,
  Package,
  Users,
  Settings,
  PanelRight,
  Menu,
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
import { HugeiconsIcon } from "@hugeicons/react";
import { Napkins02Icon } from "@hugeicons/core-free-icons";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: ClipboardList },
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
          "fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-neutral-200 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-[var(--sidebar-width)]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:translate-x-0",
        )}
        aria-label="Sidebar"
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-neutral-200",
            isCollapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <HugeiconsIcon
                  icon={Napkins02Icon}
                  className="h-5 w-5 text-white"
                />
              </div>
              <span className="font-display font-bold text-lg text-neutral-900">
                Mesero
              </span>
            </Link>
          )}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelRight
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                isCollapsed && "rotate-180",
              )}
            />
          </Button>
        </div>

        <nav
          className="flex-1 overflow-y-auto no-scrollbar space-y-1"
          role="navigation"
          aria-label="Main navigation"
        >
          <div
            className={cn(
              "mb-4 flex items-center",
              isCollapsed ? "justify-center p-4" : "justify-between p-4",
            )}
          >
            {!isCollapsed && (
              <h3 className="text-xs font-semibold uppercase text-neutral-500">
                Restaurants
              </h3>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsDialogOpen(true)}
              aria-label="Add restaurant"
              title="Add restaurant"
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
                    title={isCollapsed ? restaurant.name : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium text-neutral-600 transition-all duration-150 cursor-pointer select-none",
                      "hover:bg-success-50 hover:text-neutral-900 hover:border-r-4 border-r-primary-500",
                      isCollapsed && "justify-center px-2",
                      currentRestaurant?.slug === restaurant.slug &&
                        "bg-primary-50/60 text-primary-700 border-r-4 border-r-primary-500 font-medium",
                    )}
                  >
                    <div className="h-6 w-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-primary-600" />
                    </div>
                    {!isCollapsed && (
                      <span className="truncate flex-1">{restaurant.name}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-neutral-500 text-sm">
              {isCollapsed ? (
                <Building2 className="h-4 w-4 mx-auto" />
              ) : (
                <p>No restaurants yet</p>
              )}
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
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "nav-item",
                    isActive && "active",
                    isCollapsed && "justify-center px-0",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "nav-icon h-5 w-5 flex-shrink-0",
                      isActive && "text-primary-600 ",
                    )}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </nav>

        <div
          className={cn(
            "border-t border-neutral-200",
            isCollapsed ? "p-2" : "p-4",
          )}
        >
          <Separator className="mb-4" />

          {!isCollapsed && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all duration-150">
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
                    <p className="truncate font-medium text-neutral-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
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
                <button className="flex w-full items-center justify-center rounded-lg px-0 py-2.5 transition-colors hover:bg-neutral-50">
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
