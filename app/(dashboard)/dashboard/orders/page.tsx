"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

const ORDER_TYPE_OPTIONS = [
  { value: "DINE IN", label: "Dine In" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "TAKE AWAY", label: "Take Away" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PREPARING", label: "Preparing" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const ORDER_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (option) => option.value !== "ALL",
);

const formatStatus = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase();

const orderTotal = (order: any) =>
  (order.items_for_order || []).reduce(
    (sum: number, item: any) => sum + parseFloat(item.subtotal || "0"),
    0,
  );

export default function OrdersPage() {
  const {
    currentRestaurant,
    fetchCategories,
    fetchOrders,
    createOrder,
    updateOrderStatus,
  } = useRestaurant();

  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [menuSearch, setMenuSearch] = useState("");
  const [orderType, setOrderType] = useState("DINE IN");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const loadOrders = async () => {
    if (!currentRestaurant) return;
    setOrdersLoading(true);
    try {
      const data = await fetchOrders(currentRestaurant.slug);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadMenu = async () => {
    if (!currentRestaurant) return;
    setMenuLoading(true);
    try {
      const data = await fetchCategories(currentRestaurant.slug);
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load menu items");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    if (currentRestaurant) {
      loadOrders();
      loadMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRestaurant?.slug]);

  const restaurantOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.restaurant === currentRestaurant?.slug,
      ),
    [orders, currentRestaurant?.slug],
  );

  const filteredOrders = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return restaurantOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      const matchesSearch =
        !term ||
        order.order_reference?.toLowerCase().includes(term) ||
        order.order_type?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [restaurantOrders, searchQuery, statusFilter]);

  const menuItems = useMemo(
    () =>
      categories.flatMap((category: any) =>
        (category.menu_item || []).map((item: any) => ({
          ...item,
          category_name: category.name,
        })),
      ),
    [categories],
  );

  const filteredMenuItems = useMemo(() => {
    const term = menuSearch.trim().toLowerCase();
    if (!term) return menuItems;
    return menuItems.filter(
      (item: any) =>
        item.name?.toLowerCase().includes(term) ||
        item.category_name?.toLowerCase().includes(term),
    );
  }, [menuItems, menuSearch]);

  const cartItems = useMemo(
    () => menuItems.filter((item: any) => quantities[item.id] > 0),
    [menuItems, quantities],
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum: number, item: any) =>
          sum + parseFloat(String(item.price)) * quantities[item.id],
        0,
      ),
    [cartItems, quantities],
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum: number, item: any) => sum + quantities[item.id], 0),
    [cartItems, quantities],
  );

  const setQuantity = (id: number, quantity: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[id];
      } else {
        next[id] = quantity;
      }
      return next;
    });
  };

  const resetForm = () => {
    setQuantities({});
    setOrderType("DINE IN");
    setMenuSearch("");
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;
    if (cartItems.length === 0) {
      toast.error("Add at least one item to the order");
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        restaurant: currentRestaurant.slug,
        order_type: orderType,
        items: cartItems.map((item: any) => ({
          id: item.id,
          quantity: quantities[item.id],
        })),
      });
      toast.success("Order created successfully");
      setShowCreateDialog(false);
      resetForm();
      loadOrders();
    } catch {
      toast.error("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updated : order)),
      );
      toast.success(
        `Order ${updated.order_reference} marked ${formatStatus(status)}`,
      );
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const stats = useMemo(
    () => [
      {
        name: "Total Orders",
        value: restaurantOrders.length,
        color: "text-primary-600",
        bg: "bg-primary-100",
        icon: ClipboardList,
      },
      {
        name: "Pending",
        value: restaurantOrders.filter((o) => o.status === "PENDING").length,
        color: "text-warning-600",
        bg: "bg-warning-100",
        icon: ClipboardList,
      },
      {
        name: "Preparing",
        value: restaurantOrders.filter((o) => o.status === "PREPARING").length,
        color: "text-info-600",
        bg: "bg-info-100",
        icon: ClipboardList,
      },
      {
        name: "Delivered",
        value: restaurantOrders.filter((o) => o.status === "DELIVERED").length,
        color: "text-success-600",
        bg: "bg-success-100",
        icon: ClipboardList,
      },
    ],
    [restaurantOrders],
  );

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Create and track restaurant orders</p>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No Restaurant Selected
            </h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Create or select a restaurant to manage its orders.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">
            Create and track orders for {currentRestaurant.name}
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order_type">Order Type</Label>
                <Select
                  id="order_type"
                  value={orderType}
                  onValueChange={setOrderType}
                  options={ORDER_TYPE_OPTIONS}
                />
              </div>

              <div className="space-y-2">
                <Label>Menu Items</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search menu items..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-100 divide-y divide-neutral-100">
                  {menuLoading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-10 bg-neutral-100 rounded animate-shimmer"
                        />
                      ))}
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <p className="p-4 text-sm text-neutral-500 text-center">
                      {menuItems.length === 0
                        ? "No menu items yet. Add menu items first."
                        : "No items match your search."}
                    </p>
                  ) : (
                    filteredMenuItems.map((item: any) => {
                      const quantity = quantities[item.id] || 0;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 p-3 hover:bg-neutral-50"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {item.category_name} • {formatCurrency(item.price)}
                            </p>
                          </div>

                          {quantity > 0 ? (
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={() => setQuantity(item.id, quantity - 1)}
                                aria-label={`Decrease ${item.name}`}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold text-neutral-900">
                                {quantity}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={() => setQuantity(item.id, quantity + 1)}
                                aria-label={`Increase ${item.name}`}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={!item.is_available}
                              onClick={() => setQuantity(item.id, 1)}
                            >
                              Add
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {cartItems.length > 0 && (
                <div className="rounded-lg border border-neutral-100 bg-surface-secondary p-4 space-y-2">
                  <p className="text-sm font-semibold text-neutral-900">
                    Order Summary
                  </p>
                  {cartItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-neutral-600">
                        {quantities[item.id]} × {item.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-neutral-900">
                          {formatCurrency(
                            parseFloat(String(item.price)) * quantities[item.id],
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, 0)}
                          className="text-neutral-400 hover:text-primary-600"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-sm font-semibold text-neutral-900">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={cartItems.length === 0}
                >
                  Create Order{cartCount > 0 ? ` (${cartCount})` : ""}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="stat-card-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <p className="text-sm font-medium text-neutral-500">{stat.name}</p>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`${stat.color} h-5 w-5`} />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search by reference or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={STATUS_OPTIONS}
              className="sm:max-w-[180px]"
            />
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-neutral-100 rounded animate-shimmer"
                />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <ClipboardList className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
              <p>
                {restaurantOrders.length === 0
                  ? "No orders yet. Create your first order to get started."
                  : "No orders match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                    <th className="pb-3 font-medium text-neutral-900">Reference</th>
                    <th className="pb-3 font-medium text-neutral-900">Type</th>
                    <th className="pb-3 font-medium text-neutral-900">Items</th>
                    <th className="pb-3 font-medium text-neutral-900">Total</th>
                    <th className="pb-3 font-medium text-neutral-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-neutral-50">
                      <td className="py-4">
                        <p className="font-medium text-neutral-900">
                          {order.order_reference}
                        </p>
                      </td>
                      <td className="py-4">
                        <span className="badge-primary">{order.order_type}</span>
                      </td>
                      <td className="py-4 text-sm text-neutral-600">
                        {order.items_for_order?.length || 0} items
                      </td>
                      <td className="py-4 font-semibold text-neutral-900">
                        {formatCurrency(orderTotal(order))}
                      </td>
                      <td className="py-4">
                        <div className="w-36">
                          <Select
                            value={order.status}
                            options={ORDER_STATUS_OPTIONS}
                            onValueChange={(value) =>
                              handleStatusChange(order.id, value)
                            }
                            disabled={updatingOrderId === order.id}
                            aria-label={`Change status for ${order.order_reference}`}
                            className="h-8 text-xs"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
