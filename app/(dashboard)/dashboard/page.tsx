"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Utensils,
  Package,
  Banknote,
  TrendingUp,
  Building2,
  Plus,
  Info,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";

const statusStyles: Record<string, string> = {
  PENDING: "status-pending",
  PREPARING: "status-preparing",
  DELIVERED: "status-delivered",
  CANCELLED: "status-canceled",
};

const formatStatus = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase();

const getOrderTotal = (order: any) =>
  (order.items_for_order || []).reduce(
    (sum: number, item: any) => sum + parseFloat(item.subtotal || "0"),
    0,
  );

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    currentRestaurant,
    isLoading: restaurantLoading,
    fetchRestaurant,
    fetchOrders,
    error: restaurantError,
  } = useRestaurant();

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!currentRestaurant) return;
    let active = true;

    const loadOrders = async () => {
      const data = await fetchOrders(currentRestaurant.slug);
      if (!active) return;
      setOrders(
        (Array.isArray(data) ? data : []).filter(
          (order: any) => order.restaurant === currentRestaurant.slug,
        ),
      );
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, [currentRestaurant?.slug, fetchOrders]);

  useEffect(() => {
    if (isAuthenticated && !authLoading && !currentRestaurant) {
      // Try to get restaurant from localStorage or profile
      // For now, we'll show the create restaurant state if none exists
    }
  }, [isAuthenticated, authLoading, currentRestaurant]);

  if (authLoading || restaurantLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-32 bg-neutral-200 rounded animate-shimmer" />
        </div>
      </div>
    );
  }

  const hasRestaurant = !!currentRestaurant;

  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      name: "Total Revenue",
      value: formatCurrency(12345),
      change: "+12.5%",
      icon: Banknote,
      color: "text-success-600",
      bg: "bg-success-100",
    },
    {
      name: "Orders Today",
      value: orders.length,
      change: "+8.2%",
      icon: Utensils,
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
    {
      name: "Active Tables",
      value: "12",
      change: "+3",
      icon: Users,
      color: "text-info-600",
      bg: "bg-info-100",
    },
    {
      name: "Menu Items",
      value: currentRestaurant?.menu_categories_count || 0,
      change: "+5",
      icon: Package,
      color: "text-warning-600",
      bg: "bg-warning-100",
    },
  ];

  if (!hasRestaurant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome to Mesero! Create your restaurant to get started.
          </p>
        </div>

        <Card className="border-2 border-primary-200 bg-primary-50/60">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-primary-500 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No Restaurant Yet
              </h3>
              <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                Create your first restaurant to start managing your menu,
                inventory, staff, and orders.
              </p>
              <Button asChild size="lg" className="w-auto px-8">
                <Link href="/dashboard/restaurant">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Restaurant
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  <Plus className="h-6 w-6 text-primary-600" />
                  <span className="font-medium text-neutral-900">
                    Create Restaurant
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Restaurant exists - show full dashboard
  const restaurant = currentRestaurant!;
  const menuItemsCount =
    restaurant.menu_categories?.reduce(
      (sum, cat) => sum + (cat.menu_item?.length || 0),
      0,
    ) || 0;
  const inventoryCount =
    restaurant.restaurant_inventory?.reduce(
      (sum, inv) => sum + (inv.inventory_item?.length || 0),
      0,
    ) || 0;
  const lowStockItems =
    restaurant.restaurant_inventory?.flatMap(
      (inv: any) =>
        inv.inventory_item?.filter(
          (item: any) =>
            item.quantity <= item.low_stock_threshold && item.is_available,
        ) || [],
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{restaurant.name}</h1>
          <p className="page-subtitle">
            Overview of your restaurant performance
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/restaurant">
            <Plus className="h-4 w-4 mr-2" />
            Manage Restaurant
          </Link>
        </Button>
      </div>

      {restaurantError && (
        <div className="p-4 bg-primary-50/60 border border-primary-200 rounded-lg text-primary-700">
          {restaurantError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="stat-card-primary relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-neutral-500">
                    {stat.name}
                  </p>

                  {stat.name === "Active Tables" && (
                    <div className="group relative inline-flex text-danger-600">
                      <Info
                        size={14}
                        className="cursor-help"
                        aria-hidden="true"
                      />
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-40 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-center text-[11px] font-normal leading-snug text-neutral-700 shadow-lg backdrop-blur-md group-hover:block"
                      >
                        This feature is unavailable now
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-lg font-bold text-neutral-900">
                  {stat.name === "Menu Items" ? menuItemsCount : stat.value}
                </p>
              </div>
              <div className={stat.bg + " p-3 rounded-lg"}>
                <stat.icon
                  className={stat.color + " h-5 w-5"}
                  aria-hidden="true"
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-success-600 font-medium">
                {stat.change} vs last week
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Additional stats for inventory and staff */}
        <Card className="stat-card-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Inventory Items
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {inventoryCount}
              </p>
            </div>
            <div className="bg-info-100 p-3 rounded-lg">
              <Package className="text-info-600 h-5 w-5" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-info-600 font-medium">
              {lowStockItems.length > 0
                ? `${lowStockItems.length} low stock`
                : "All stocked"}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <p className="text-sm font-medium text-neutral-500">Staff Members</p>
              <p className="text-2xl font-bold text-neutral-900">
                {restaurant.staff_count || 0}
              </p>
            </div>
            <div className="bg-warning-100 p-3 rounded-lg">
              <Users className="text-warning-600 h-5 w-5" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-warning-600 font-medium">Active team</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {order.order_reference}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {order.order_type} •{" "}
                        {order.items_for_order?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {formatCurrency(getOrderTotal(order))}
                      </p>
                    </div>
                    <span
                      className={statusStyles[order.status] || "badge-neutral"}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-6">
                  No orders yet. Create your first order from the Orders page.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Link href="/dashboard/menu">
                  <Utensils className="h-6 w-6 text-primary-600" />
                  <span className="font-semibold text-neutral-900">
                    Manage Menu
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Link href="/dashboard/inventory">
                  <Package className="h-6 w-6 text-info-600" />
                  <span className="font-semibold text-neutral-900">
                    Manage Inventory
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Link href="/dashboard/staff">
                  <Users className="h-6 w-6 text-success-600" />
                  <span className="font-semibold text-neutral-900">
                    Manage Staff
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Link href="/dashboard/settings">
                  <TrendingUp className="h-6 w-6 text-warning-600" />
                  <span className="font-semibold text-neutral-900">Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-primary-200 bg-primary-50/60">
          <CardHeader className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-primary-700">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-neutral-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-warning-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-warning-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{item.name}</p>
                      <p className="text-sm text-neutral-500">
                        {item.quantity} {item.unit_measurement} remaining
                        (threshold: {item.low_stock_threshold})
                      </p>
                    </div>
                  </div>
                  <span className="badge-warning">Low Stock</span>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <p className="text-sm text-neutral-500 text-center">
                  ... and {lowStockItems.length - 5} more items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
