"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Utensils,
  Package,
  DollarSign,
  TrendingUp,
  Building2,
  Plus,
  Mail,
  User,
  Shield,
  AlertTriangle,
  Settings,
  ArrowRight,
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
      // Auto-fetch handled by RestaurantProvider
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
  const lowStockCount = lowStockItems.length;

  // Get staff from staff_for_restaurant
  const staff = restaurant.staff_for_restaurant || [];
  const activeStaff = staff.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="page-title">{restaurant.name}</h1>
            {restaurant.logo && (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            )}
          </div>
          <p className="page-subtitle">
            {restaurant.description ||
              "Overview of your restaurant performance"}
            <span className="ml-2 text-sm text-neutral-500 font-mono">
              • {restaurant.slug}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/restaurant">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Restaurant
            </Link>
          </Button>
        </div>
      </div>

      {/* Restaurant Header Card - Owner & Basic Info */}
      <Card className="bg-gradient-to-r from-primary-50 to-white border-primary-100">
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-100">
              <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Owner</p>
                <p className="font-semibold text-neutral-900">
                  {restaurant.owner?.first_name ||
                    restaurant.owner?.email ||
                    "Unknown"}
                </p>
                <p className="text-xs text-neutral-500">
                  {restaurant.owner?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-100">
              <div className="h-12 w-12 rounded-xl bg-info-100 flex items-center justify-center">
                <Utensils className="h-6 w-6 text-info-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Menu Categories</p>
                <p className="font-bold text-2xl text-neutral-900">
                  {restaurant.menu_categories?.length || 0}
                </p>
                <p className="text-xs text-neutral-500">
                  {menuItemsCount} total items
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-100">
              <div className="h-12 w-12 rounded-xl bg-success-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Inventory</p>
                <p className="font-bold text-2xl text-neutral-900">
                  {restaurant.restaurant_inventory?.length || 0} categories
                </p>
                <p className="text-xs text-neutral-500">
                  {inventoryCount} items • {lowStockCount} low stock
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-100">
              <div className="h-12 w-12 rounded-xl bg-warning-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Staff</p>
                <p className="font-bold text-2xl text-neutral-900">
                  {staff.length}
                </p>
                <p className="text-xs text-neutral-500">{activeStaff} active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {restaurantError && (
        <div className="p-4 bg-primary-50/60 border border-primary-200 rounded-lg text-primary-700">
          {restaurantError}
        </div>
      )}

      {/* Menu Categories Section */}
      {restaurant.menu_categories && restaurant.menu_categories.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Menu Categories</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/menu">
                <Plus className="h-4 w-4 mr-2" />
                Manage Menu
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restaurant.menu_categories.map((category: any) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100 hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Utensils className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-neutral-900">
                          {category.name}
                        </h4>
                        {category.is_active ? (
                          <span className="badge-success">Active</span>
                        ) : (
                          <span className="badge-neutral">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500">
                        {category.menu_item?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500 font-mono">
                      {category.slug}
                    </span>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/menu?category=${category.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Section */}
      {restaurant.restaurant_inventory &&
        restaurant.restaurant_inventory.length > 0 && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Inventory</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/inventory">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {restaurant.restaurant_inventory.map((inv: any) => (
                <div
                  key={inv.id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-success-100 flex items-center justify-center">
                        <Package className="h-6 w-6 text-success-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900">
                          {inv.name}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {inv.inventory_item?.length || 0} items •{" "}
                          {inv.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {inv.inventory_item && inv.inventory_item.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {inv.inventory_item.slice(0, 3).map((item: any) => (
                            <span
                              key={item.id}
                              className={`px-2 py-1 text-xs rounded-full ${
                                item.quantity <= 0
                                  ? "bg-danger-100 text-danger-700"
                                  : item.quantity <= item.low_stock_threshold
                                    ? "bg-warning-100 text-warning-700"
                                    : "bg-success-100 text-success-700"
                              }`}
                            >
                              {item.name}: {item.quantity}{" "}
                              {item.unit_measurement}
                            </span>
                          ))}
                          {inv.inventory_item.length > 3 && (
                            <span className="text-xs text-neutral-500">
                              +{inv.inventory_item.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/inventory">
                          <Package className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      {/* Staff Section */}
      {staff.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Staff</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/staff">
                <Plus className="h-4 w-4 mr-2" />
                Manage Staff
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staff.map((member: any) => (
                <div
                  key={member.id ?? member.user?.id ?? member.user?.email}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100 hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.user?.avatar_url || undefined}
                        alt={member.user?.name}
                      />
                      <AvatarFallback>
                        {member.user?.first_name?.charAt(0) ||
                          member.user?.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-neutral-900">
                          {member.user?.first_name}{" "}
                          {member.user?.last_name || ""}
                        </h4>
                        <span
                          className={
                            member.role === "OWNER"
                              ? "badge-primary"
                              : member.role === "MANAGER"
                                ? "badge-info"
                                : "badge-success"
                          }
                        >
                          {member.role}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        member.is_active ? "badge-success" : "badge-neutral"
                      }
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="border-primary-200 bg-primary-50/60">
          <CardHeader className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-primary-700">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {restaurant.restaurant_inventory
                ?.flatMap(
                  (inv: any) =>
                    inv.inventory_item?.filter(
                      (item: any) =>
                        item.quantity <= item.low_stock_threshold &&
                        item.is_available,
                    ) || [],
                )
                .slice(0, 5)
                .map((item: any, index: number) => (
                  <div
                    key={item.id ?? index}
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
              {lowStockCount > 5 && (
                <p className="text-sm text-neutral-500 text-center">
                  ... and {lowStockCount - 5} more items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              asChild
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <Link href="/dashboard/menu">
                <Utensils className="h-6 w-6 text-primary-600" />
                <span className="font-semibold text-neutral-900">Manage Menu</span>
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
                <span className="font-semibold text-neutral-900">Manage Staff</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <Link href="/dashboard/settings">
                <Settings className="h-6 w-6 text-warning-600" />
                <span className="font-semibold text-neutral-900">Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
