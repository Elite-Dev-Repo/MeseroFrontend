"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Edit, Trash2, Image, ChevronDown, Loader2, Eye, EyeOff, Package } from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export default function MenuPage() {
  const { 
    currentRestaurant, 
    isLoading: restaurantLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    error 
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<"categories" | "items">("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [categoryForm, setCategoryForm] = useState({ name: "", is_active: true });
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    is_available: true,
  });

  const loadCategories = async () => {
    if (!currentRestaurant) return;
    setCategoriesLoading(true);
    try {
      const data = await fetchCategories(currentRestaurant.slug);
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadMenuItems = async () => {
    if (!currentRestaurant) return;
    setItemsLoading(true);
    try {
      const data = await fetchMenuItems({ restaurant: currentRestaurant.slug, category: selectedCategory ? parseInt(selectedCategory) : undefined, search: searchQuery });
      setMenuItems(data);
    } catch (err) {
      toast.error("Failed to load menu items");
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    if (currentRestaurant) {
      loadCategories();
    }
  }, [currentRestaurant, fetchCategories]);

  useEffect(() => {
    if (currentRestaurant) {
      loadMenuItems();
    }
  }, [currentRestaurant, selectedCategory, searchQuery, fetchMenuItems]);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: categoryForm.name,
          is_active: categoryForm.is_active,
        });
        toast.success("Category updated!");
      } else {
        await createCategory(currentRestaurant!.slug, { name: categoryForm.name, is_active: categoryForm.is_active });
        toast.success("Category created!");
      }
      setShowCategoryDialog(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", is_active: true });
      loadCategories();
    } catch (err) {
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category");
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, is_active: category.is_active });
    setShowCategoryDialog(true);
  };

  const handleDeleteCategory = async (category: any) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? Its menu items will also be removed.`)) {
      return;
    }

    try {
      await deleteCategory(category.id);
      toast.success("Category deleted!");
      loadCategories();
      loadMenuItems();
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(itemForm).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        formData.append(key, value.toString());
      }
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
        toast.success("Menu item updated!");
      } else {
        await createMenuItem(formData);
        toast.success("Menu item created!");
      }
      setShowItemDialog(false);
      setEditingItem(null);
      setItemForm({ name: "", description: "", price: "", category: "", is_available: true });
      setImagePreview(null);
      setImageFile(null);
      loadMenuItems();
    } catch (err) {
      toast.error("Failed to save menu item");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      e.target.value = "";
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category.toString(),
      is_available: item.is_available,
    });
    setImagePreview(item.image || null);
    setImageFile(null);
    setShowItemDialog(true);
  };

  const handleDeleteItem = async (item: any) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await deleteMenuItem(item.id);
      toast.success("Menu item deleted!");
      loadMenuItems();
    } catch (err) {
      toast.error("Failed to delete menu item");
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Manage categories and menu items</p>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Restaurant Selected</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Create or select a restaurant to manage your menu.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryOptions = categories.map(c => ({ value: c.id.toString(), label: c.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Manage categories and menu items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab("categories")} className={activeTab === "categories" ? "bg-primary-600 text-white" : ""}>
            Categories
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("items")} className={activeTab === "items" ? "bg-primary-600 text-white" : ""}>
            Items
          </Button>
        </div>
      </div>

      {activeTab === "categories" && (
        <div className="space-y-4">
          <Dialog
            open={showCategoryDialog}
            onOpenChange={(open) => {
              setShowCategoryDialog(open);
              if (!open) {
                setEditingCategory(null);
                setCategoryForm({ name: "", is_active: true });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={categoryForm.name} onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Appetizers" required />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={categoryForm.is_active} onChange={(e) => setCategoryForm(prev => ({ ...prev, is_active: e.target.checked }))} className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                    Active
                  </Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => { setEditingCategory(null); setShowCategoryDialog(false); setCategoryForm({ name: "", is_active: true }); }}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={categoriesLoading}>
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardContent className="pt-0">
              {categoriesLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-neutral-100 rounded animate-shimmer" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <p>No categories yet. Create your first category to get started.</p>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {categories.map((cat) => (
                    <li key={cat.id} className="flex items-center justify-between p-4 hover:bg-neutral-50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <ChevronDown className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{cat.name}</p>
                          <p className="text-sm text-neutral-500">{cat.menu_item?.length || 0} items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cat.is_active ? "badge-success" : "badge-neutral"}>
                          {cat.is_active ? "Active" : "Inactive"}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleEditCategory(cat)} aria-label={`Edit ${cat.name}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat)} aria-label={`Delete ${cat.name}`}>
                          <Trash2 className="h-4 w-4 text-primary-600" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "items" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
            <Dialog
              open={showItemDialog}
              onOpenChange={(open) => {
                setShowItemDialog(open);
                if (!open) {
                  setEditingItem(null);
                  setItemForm({ name: "", description: "", price: "", category: "", is_available: true });
                  setImagePreview(null);
                  setImageFile(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleItemSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={itemForm.name} onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Margherita Pizza" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea id="description" value={itemForm.description} onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Fresh tomatoes, mozzarella, basil..." className="flex h-20 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input id="price" type="number" step="0.01" value={itemForm.price} onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))} placeholder="12.99" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        id="category"
                        value={itemForm.category}
                        onValueChange={(v) => setItemForm(prev => ({ ...prev, category: v }))}
                        options={categoryOptions}
                        placeholder="Select category"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 overflow-hidden">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <Image className="h-8 w-8 mx-auto text-neutral-400" />
                        )}
                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Upload menu item image" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button type="button" variant="outline" className="w-fit" onClick={() => imageInputRef.current?.click()}>
                          Upload Image
                        </Button>
                        <p className="text-xs text-neutral-500">Max 5MB</p>
                      </div>
                    </div>
                  </div>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={itemForm.is_available} onChange={(e) => setItemForm(prev => ({ ...prev, is_available: e.target.checked }))} className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                    Available
                  </Label>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => { setEditingItem(null); setShowItemDialog(false); setItemForm({ name: "", description: "", price: "", category: "", is_available: true }); setImagePreview(null); setImageFile(null); }}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={itemsLoading}>
                      {editingItem ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                options={[{ value: "", label: "All Categories" }, ...categoryOptions]}
                placeholder="Filter by category"
              />
            </div>
          </div>

          <Card>
            <CardContent className="pt-0">
              {itemsLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-neutral-100 rounded animate-shimmer" />
                  ))}
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <p>No menu items yet. Add your first item to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                        <th className="pb-3 font-medium text-neutral-900">Image</th>
                        <th className="pb-3 font-medium text-neutral-900">Name</th>
                        <th className="pb-3 font-medium text-neutral-900">Category</th>
                        <th className="pb-3 font-medium text-neutral-900">Price</th>
                        <th className="pb-3 font-medium text-neutral-900">Status</th>
                        <th className="pb-3 font-medium text-neutral-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {menuItems.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50">
                          <td className="py-4">
                            <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              ) : (
                                <Image className="h-6 w-6 text-neutral-400" />
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="font-medium text-neutral-900">{item.name}</p>
                            {item.description && <p className="text-sm text-neutral-500 truncate max-w-xs">{item.description}</p>}
                          </td>
                          <td className="py-4">
                            <span className="badge-primary">{item.category_name || item.category}</span>
                          </td>
                          <td className="py-4 font-semibold text-neutral-900">{formatCurrency(item.price)}</td>
                          <td className="py-4">
                            <span className={item.is_available ? "badge-success" : "badge-neutral"}>
                              {item.is_available ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item)}>
                                <Trash2 className="h-4 w-4 text-primary-600" />
                              </Button>
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
      )}
    </div>
  );
}