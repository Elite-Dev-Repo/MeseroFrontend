"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Utensils,
  Package,
  DollarSign,
  TrendingUp,
  Building2,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";

const statusStyles = {
  preparing: "status-preparing",
  pending: "status-pending",
  delivered: "status-delivered",
  canceled: "status-canceled",
};

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    currentRestaurant,
    isLoading: restaurantLoading,
    fetchRestaurant,
    error: restaurantError,
  } = useRestaurant();

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
          <div className="h-8 w-32 bg-ink-200 rounded animate-shimmer" />
        </div>
      </div>
    );
  }

  const hasRestaurant = !!currentRestaurant;

  const recentOrders = [
    {
      id: "ORD-001",
      table: "Table 5",
      items: 3,
      total: 45.5,
      status: "preparing",
      time: "2 min ago",
    },
    {
      id: "ORD-002",
      table: "Table 12",
      items: 2,
      total: 28.0,
      status: "pending",
      time: "5 min ago",
    },
    {
      id: "ORD-003",
      table: "Table 3",
      items: 4,
      total: 67.25,
      status: "delivered",
      time: "12 min ago",
    },
    {
      id: "ORD-004",
      table: "Table 8",
      items: 1,
      total: 15.0,
      status: "canceled",
      time: "18 min ago",
    },
    {
      id: "ORD-005",
      table: "Table 1",
      items: 5,
      total: 89.75,
      status: "preparing",
      time: "22 min ago",
    },
  ];

  const stats = [
    {
      name: "Total Revenue",
      value: "$12,345",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      name: "Orders Today",
      value: "47",
      change: "+8.2%",
      icon: Utensils,
      color: "text-crimson-600",
      bg: "bg-crimson-100",
    },
    {
      name: "Active Tables",
      value: "12",
      change: "+3",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Menu Items",
      value: currentRestaurant?.menu_categories_count || 0,
      change: "+5",
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-100",
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

        <Card className="border-2 border-crimson-200 bg-crimson-50">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-crimson-500 mb-4" />
              <h3 className="text-xl font-semibold text-ink-900 mb-2">
                No Restaurant Yet
              </h3>
              <p className="text-ink-500 mb-6 max-w-md mx-auto">
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
                  <Plus className="h-6 w-6 text-crimson-600" />
                  <span className="font-medium text-ink-900">
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
        <div className="p-4 bg-crimson-50 border border-crimson-200 rounded-lg text-crimson-700">
          {restaurantError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="stat-card-crimson">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <p className="text-sm font-medium text-ink-500">{stat.name}</p>
                <p className="text-2xl font-bold text-ink-900">
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
              <p className="text-xs text-green-600 font-medium">
                {stat.change} vs last week
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Additional stats for inventory and staff */}
        <Card className="stat-card-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <p className="text-sm font-medium text-ink-500">
                Inventory Items
              </p>
              <p className="text-2xl font-bold text-ink-900">
                {inventoryCount}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="text-blue-600 h-5 w-5" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600 font-medium">
              {lowStockItems.length > 0
                ? `${lowStockItems.length} low stock`
                : "All stocked"}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card-amber">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <p className="text-sm font-medium text-ink-500">Staff Members</p>
              <p className="text-2xl font-bold text-ink-900">
                {restaurant.staff_count || 0}
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Users className="text-amber-600 h-5 w-5" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-600 font-medium">Active team</p>
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
                  className="flex items-center justify-between p-4 border border-ink-100 rounded-lg hover:bg-ink-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-crimson-100 flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-crimson-600" />
                    </div>
                    <div>
                      <p className="font-medium text-ink-900">{order.id}</p>
                      <p className="text-sm text-ink-500">
                        {order.table} • {order.items} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-semibold text-ink-900">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-ink-500">{order.time}</p>
                    </div>
                    <span
                      className={
                        statusStyles[
                          order.status as keyof typeof statusStyles
                        ] || "badge-gray"
                      }
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
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
                  <Utensils className="h-6 w-6 text-crimson-600" />
                  <span className="font-semibold text-ink-900">
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
                  <Package className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold text-ink-900">
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
                  <Users className="h-6 w-6 text-green-600" />
                  <span className="font-semibold text-ink-900">
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
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                  <span className="font-semibold text-ink-900">Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-crimson-200 bg-crimson-50">
          <CardHeader className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-crimson-600" />
            <CardTitle className="text-crimson-700">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-ink-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-ink-900">{item.name}</p>
                      <p className="text-sm text-ink-500">
                        {item.quantity} {item.unit_measurement} remaining
                        (threshold: {item.low_stock_threshold})
                      </p>
                    </div>
                  </div>
                  <span className="badge-amber">Low Stock</span>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <p className="text-sm text-ink-500 text-center">
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
