"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Image, Building2, MapPin, Phone, Mail, Loader2, Trash2, Edit } from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { toast } from "sonner";

const restaurantSchema = {
  name: "",
  description: "",
  address: "",
  phone: "",
  email: "",
};

export default function RestaurantPage() {
  const { 
    currentRestaurant, 
    setCurrentRestaurant,
    isLoading, 
    fetchRestaurant,
    createRestaurant,
    updateRestaurant,
    error 
  } = useRestaurant();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
  });

  const loadRestaurant = async () => {
    // Try to get user's restaurant from profile or localStorage
    // For now, we don't auto-fetch - user needs to create or we need a profile endpoint
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    // Add images if present
    if (logoPreview) {
      // logoPreview is a blob URL, would need to convert to file
    }
    if (coverPreview) {
      // same for cover
    }

    try {
      await createRestaurant(formData);
      toast.success("Restaurant created!");
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", address: "", phone: "", email: "" });
      setLogoPreview(null);
      setCoverPreview(null);
    } catch (err) {
      toast.error("Failed to create restaurant");
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;
    
    try {
      await updateRestaurant(currentRestaurant.slug, formData);
      toast.success("Restaurant updated!");
    } catch (err) {
      toast.error("Failed to update restaurant");
    }
  };

  const handleDelete = async () => {
    if (!currentRestaurant) return;
    if (!confirm("Are you sure you want to delete this restaurant? This cannot be undone.")) return;
    
    setDeleting(true);
    try {
      // No delete endpoint in API yet
      toast.error("Delete not implemented yet");
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Restaurant</h1>
            <p className="page-subtitle">Create your first restaurant to get started</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Restaurant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Restaurant</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Restaurant Name *</Label>
                    <Input id="name" {...{ value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })) }} placeholder="My Restaurant" required />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      {...{ value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })) }}
                      placeholder="Tell customers about your restaurant..."
                      className="flex h-24 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                      <Input id="address" {...{ value: formData.address, onChange: (e) => setFormData(prev => ({ ...prev, address: e.target.value })) }} placeholder="123 Main St" className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                      <Input id="phone" type="tel" {...{ value: formData.phone, onChange: (e) => setFormData(prev => ({ ...prev, phone: e.target.value })) }} placeholder="+1 234 567 890" className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                      <Input id="email" type="email" {...{ value: formData.email, onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })) }} placeholder="info@restaurant.com" className="pl-10" />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-ink-200 bg-ink-50 overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                      ) : (
                        <Image className="h-8 w-8 mx-auto text-ink-400" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setLogoPreview)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        aria-label="Upload logo"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" className="w-fit">Upload Logo</Button>
                      <p className="text-xs text-ink-500">Recommended: 200x200px, max 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-40 rounded-lg border-2 border-dashed border-ink-200 bg-ink-50 overflow-hidden">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-8 w-8 mx-auto text-ink-400" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setCoverPreview)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        aria-label="Upload cover image"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" className="w-fit">Upload Cover</Button>
                      <p className="text-xs text-ink-500">Recommended: 1200x400px, max 5MB</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => { setIsDialogOpen(false); setFormData({ name: "", description: "", address: "", phone: "", email: "" }); setLogoPreview(null); setCoverPreview(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={false}>
                    Create Restaurant
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-16 w-16 mx-auto text-ink-300 mb-4" />
            <h3 className="text-lg font-semibold text-ink-900 mb-2">No Restaurant Yet</h3>
            <p className="text-ink-500 mb-6 max-w-md mx-auto">
              Create your first restaurant to start managing your menu, inventory, and staff.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Restaurant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Restaurant</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="name">Restaurant Name *</Label>
                      <Input id="name" {...{ value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })) }} placeholder="My Restaurant" required />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        {...{ value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })) }}
                        placeholder="Tell customers about your restaurant..."
                        className="flex h-24 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                        <Input id="address" {...{ value: formData.address, onChange: (e) => setFormData(prev => ({ ...prev, address: e.target.value })) }} placeholder="123 Main St" className="pl-10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                        <Input id="phone" type="tel" {...{ value: formData.phone, onChange: (e) => setFormData(prev => ({ ...prev, phone: e.target.value })) }} placeholder="+1 234 567 890" className="pl-10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                        <Input id="email" type="email" {...{ value: formData.email, onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })) }} placeholder="info@restaurant.com" className="pl-10" />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-ink-200 bg-ink-50 overflow-hidden">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                        ) : (
                          <Image className="h-8 w-8 mx-auto text-ink-400" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setLogoPreview)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          aria-label="Upload logo"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button type="button" variant="outline" className="w-fit">Upload Logo</Button>
                        <p className="text-xs text-ink-500">Recommended: 200x200px, max 2MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-40 rounded-lg border-2 border-dashed border-ink-200 bg-ink-50 overflow-hidden">
                        {coverPreview ? (
                          <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-8 w-8 mx-auto text-ink-400" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setCoverPreview)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          aria-label="Upload cover image"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button type="button" variant="outline" className="w-fit">Upload Cover</Button>
                        <p className="text-xs text-ink-500">Recommended: 1200x400px, max 5MB</p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => { setIsDialogOpen(false); setFormData({ name: "", description: "", address: "", phone: "", email: "" }); setLogoPreview(null); setCoverPreview(null); }}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={false}>
                      Create Restaurant
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Restaurant exists - show details and edit
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{currentRestaurant.name}</h1>
          <p className="page-subtitle">Manage your restaurant details</p>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Another
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <p className="text-ink-900">{currentRestaurant.name}</p>
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <p className="text-ink-900 font-mono">{currentRestaurant.slug}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Description</Label>
                <p className="text-ink-900">{currentRestaurant.description || "No description"}</p>
              </div>
              <div className="space-y-1">
                <Label>Address</Label>
                <p className="text-ink-900">{currentRestaurant.address || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <p className="text-ink-900">{currentRestaurant.phone || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <p className="text-ink-900">{currentRestaurant.email || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Staff Members</Label>
              <p className="text-2xl font-bold text-ink-900">{currentRestaurant.staff_count || 0}</p>
            </div>
            <div className="space-y-1">
              <Label>Menu Categories</Label>
              <p className="text-2xl font-bold text-ink-900">{currentRestaurant.menu_categories_count || 0}</p>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <span className={currentRestaurant.is_active ? "badge-green" : "badge-gray"}>
                {currentRestaurant.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="space-y-1">
              <Label>Created</Label>
              <p className="text-ink-900">
                {currentRestaurant.created_at
                  ? new Date(currentRestaurant.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div className="pt-4 border-t border-ink-200">
              <Button variant="outline" className="w-full" onClick={() => { /* Edit modal */ }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
              <Button variant="destructive" className="w-full mt-2" onClick={() => { /* Delete */ }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Restaurant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}