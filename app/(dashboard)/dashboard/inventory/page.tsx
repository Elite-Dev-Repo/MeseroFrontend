"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Plus, Minus, Search, Edit, Trash2, Package, AlertTriangle, Loader2 } from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";

const UNIT_OPTIONS = [
  { value: "pcs", label: "Pieces" },
  { value: "kg", label: "Kilograms" },
  { value: "g", label: "Grams" },
  { value: "l", label: "Liters" },
  { value: "ml", label: "Milliliters" },
  { value: "boxes", label: "Boxes" },
  { value: "bags", label: "Bags" },
  { value: "bottles", label: "Bottles" },
  { value: "cans", label: "Cans" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Items" },
  { value: "ok", label: "In Stock" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
  { value: "inactive", label: "Inactive" },
];

interface InventoryItem {
  id: number;
  inventory: number;
  name: string;
  image?: string | null;
  quantity: number;
  unit_measurement: string;
  low_stock_threshold: number;
  is_available: boolean;
}

interface InventoryForm {
  name: string;
  unit_measurement: string;
  quantity: string;
  low_stock_threshold: string;
  is_available: boolean;
}

const EMPTY_FORM: InventoryForm = {
  name: "",
  unit_measurement: "pcs",
  quantity: "",
  low_stock_threshold: "",
  is_available: true,
};

export default function InventoryPage() {
  const {
    currentRestaurant,
    fetchInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustInventoryStock,
  } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [adjustingId, setAdjustingId] = useState<number | null>(null);

  const reloadInventory = async () => {
    if (!currentRestaurant) return;
    setInventoryLoading(true);
    try {
      const data = await fetchInventory(currentRestaurant.slug);
      setInventory(data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    if (!currentRestaurant) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await fetchInventory(currentRestaurant.slug);
        if (!cancelled) setInventory(data);
      } catch {
        if (!cancelled) toast.error("Failed to load inventory");
      } finally {
        if (!cancelled) setInventoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentRestaurant, fetchInventory]);

  const getStockStatus = (item: InventoryItem) => {
    if (!item.is_available) return "inactive";
    if (item.quantity <= 0) return "out";
    if (item.quantity <= item.low_stock_threshold) return "low";
    return "ok";
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit_measurement.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getStockStatus(item);
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    if (!formData.name.trim()) {
      toast.error("Item name is required.");
      return;
    }

    const quantity = Number(formData.quantity);
    const threshold = Number(formData.low_stock_threshold);

    if (!Number.isInteger(quantity) || quantity < 0) {
      toast.error("Quantity must be a whole number of 0 or more.");
      return;
    }
    if (!Number.isInteger(threshold) || threshold < 0) {
      toast.error("Low stock threshold must be a whole number of 0 or more.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      unit_measurement: formData.unit_measurement,
      quantity,
      low_stock_threshold: threshold,
      is_available: formData.is_available,
    };

    setSubmitting(true);
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, payload);
        toast.success("Inventory item updated!");
      } else {
        await createInventoryItem(currentRestaurant.slug, payload);
        toast.success("Inventory item added!");
      }
      setShowDialog(false);
      setEditingItem(null);
      setFormData(EMPTY_FORM);
      reloadInventory();
    } catch (err) {
      toast.error(
        getErrorMessage(err, editingItem ? "Failed to update item" : "Failed to add item"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      unit_measurement: item.unit_measurement,
      quantity: String(item.quantity),
      low_stock_threshold: String(item.low_stock_threshold),
      is_available: item.is_available,
    });
    setShowDialog(true);
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await deleteInventoryItem(item.id);
      toast.success("Inventory item deleted!");
      reloadInventory();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete item"));
    }
  };

  const handleAdjust = async (item: InventoryItem, delta: number) => {
    setAdjustingId(item.id);
    try {
      const updated = await adjustInventoryStock(item.id, delta);
      setInventory((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to adjust stock"));
    } finally {
      setAdjustingId(null);
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage your inventory items and stock levels</p>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Restaurant Selected</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Create or select a restaurant to manage inventory.
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
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage stock levels, units, and low stock alerts</p>
        </div>
        <Dialog
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
              setEditingItem(null);
              setFormData(EMPTY_FORM);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Tomatoes" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit_measurement">Unit *</Label>
                  <Select
                    id="unit_measurement"
                    name="unit_measurement"
                    value={formData.unit_measurement}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, unit_measurement: v }))}
                    options={UNIT_OPTIONS}
                    placeholder="Select unit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Current Quantity *</Label>
                  <Input id="quantity" type="number" step="1" min="0" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="low_stock_threshold">Low Stock Threshold *</Label>
                <Input id="low_stock_threshold" type="number" step="1" min="0" name="low_stock_threshold" value={formData.low_stock_threshold} onChange={handleChange} placeholder="10" required />
              </div>
              <div className="flex items-center gap-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_available} onChange={(e) => setFormData((prev) => ({ ...prev, is_available: e.target.checked }))} className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                  Available
                </Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => { setShowDialog(false); setEditingItem(null); setFormData(EMPTY_FORM); }}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingItem ? "Save Changes" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
          options={STATUS_FILTER_OPTIONS}
          placeholder="Filter by status"
        />
      </div>

      <Card>
        <CardContent className="pt-0">
          {inventoryLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-neutral-100 rounded animate-shimmer" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">No inventory items found</p>
              <p className="text-sm text-neutral-400 mt-1">Add your first inventory item to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                    <th className="pb-3 font-medium text-neutral-900">Item</th>
                    <th className="pb-3 font-medium text-neutral-900">Unit</th>
                    <th className="pb-3 font-medium text-neutral-900">Quantity</th>
                    <th className="pb-3 font-medium text-neutral-900">Threshold</th>
                    <th className="pb-3 font-medium text-neutral-900">Status</th>
                    <th className="pb-3 font-medium text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredItems.map((item) => {
                    const status = getStockStatus(item);
                    const adjusting = adjustingId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-neutral-500" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">{item.name}</p>
                              <p className="text-sm text-neutral-500">{item.unit_measurement}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-neutral-900">{item.unit_measurement}</td>
                        <td className="py-4 font-mono text-neutral-900">{Number(item.quantity).toLocaleString()}</td>
                        <td className="py-4 text-neutral-500">{Number(item.low_stock_threshold).toLocaleString()}</td>
                        <td className="py-4">
                          {status === "out" && <span className="badge-primary flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Out of Stock</span>}
                          {status === "low" && <span className="badge-warning flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Low Stock</span>}
                          {status === "ok" && <span className="badge-success">In Stock</span>}
                          {status === "inactive" && <span className="badge-neutral">Inactive</span>}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleAdjust(item, -1)} disabled={adjusting || item.quantity <= 0} aria-label={`Decrease ${item.name} stock`}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleAdjust(item, 1)} disabled={adjusting} aria-label={`Increase ${item.name} stock`}>
                              {adjusting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} aria-label={`Edit ${item.name}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} aria-label={`Delete ${item.name}`}>
                              <Trash2 className="h-4 w-4 text-primary-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
