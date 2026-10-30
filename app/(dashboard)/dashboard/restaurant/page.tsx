"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Image, Building2, MapPin, Phone, Mail, Trash2, Edit } from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const restaurantSchema = {
  name: "",
  description: "",
  address: "",
  phone: "",
  email: "",
};

const EMPTY_FORM = { ...restaurantSchema };

type FormErrors = Record<string, string>;

const extractApiErrors = (err: unknown): FormErrors => {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  if (!data || typeof data !== "object") return {};

  return Object.entries(data as Record<string, unknown>).reduce<FormErrors>(
    (acc, [key, value]) => {
      const message = Array.isArray(value) ? value[0] : value;
      if (typeof message === "string") acc[key] = message;
      return acc;
    },
    {},
  );
};

const firstErrorMessage = (errors: FormErrors) =>
  Object.values(errors)[0] || null;

export default function RestaurantPage() {
  const {
    currentRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
  } = useRestaurant();
  const { user } = useAuth();
  const isOwner =
    !!user && !!currentRestaurant && currentRestaurant.owner?.id === user.id;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const openCreateDialog = () => {
    setDialogMode("create");
    resetCreateForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!currentRestaurant) return;
    setDialogMode("edit");
    setFormData({
      name: currentRestaurant.name || "",
      description: currentRestaurant.description || "",
      address: currentRestaurant.address || "",
      phone: currentRestaurant.phone || "",
      email: currentRestaurant.email || "",
    });
    setLogoPreview(currentRestaurant.logo || null);
    setCoverPreview(currentRestaurant.cover || null);
    setLogoFile(null);
    setCoverFile(null);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const resetCreateForm = () => {
    setFormData({ ...EMPTY_FORM });
    setLogoPreview(null);
    setCoverPreview(null);
    setLogoFile(null);
    setCoverFile(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Restaurant name is required.";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (logoFile && logoFile.size > 2 * 1024 * 1024) {
      errors.logo = "Logo must be 2MB or smaller.";
    }
    if (coverFile && coverFile.size > 5 * 1024 * 1024) {
      errors.cover = "Cover image must be 5MB or smaller.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildFormData = () => {
    const payload = new FormData();
    payload.append("name", formData.name.trim());
    payload.append("description", formData.description.trim());
    payload.append("address", formData.address.trim());
    payload.append("phone", formData.phone.trim());
    payload.append("email", formData.email.trim());

    if (logoFile) payload.append("logo", logoFile);
    if (coverFile) payload.append("cover", coverFile);

    return payload;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (dialogMode === "edit" && !currentRestaurant) return;

    setSubmitting(true);
    try {
      if (dialogMode === "edit" && currentRestaurant) {
        await updateRestaurant(currentRestaurant.slug, buildFormData());
        toast.success("Restaurant updated!");
      } else {
        await createRestaurant(buildFormData());
        toast.success("Restaurant created!");
      }
      setIsDialogOpen(false);
      resetCreateForm();
    } catch (err) {
      const errors = extractApiErrors(err);
      setFormErrors(errors);
      toast.error(
        firstErrorMessage(errors) ||
          (dialogMode === "edit"
            ? "Failed to update restaurant"
            : "Failed to create restaurant"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentRestaurant) return;
    if (!confirm("Are you sure you want to delete this restaurant? This cannot be undone.")) return;

    setDeleting(true);
    try {
      await deleteRestaurant(currentRestaurant.slug);
      toast.success("Restaurant deleted");
    } catch (err) {
      const errors = extractApiErrors(err);
      toast.error(firstErrorMessage(errors) || "Failed to delete restaurant");
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setPreview: (url: string | null) => void,
    setFile: (file: File | null) => void,
    maxSizeMb: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      e.target.value = "";
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Image must be ${maxSizeMb}MB or smaller.`);
      e.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    setFile(file);
  };

  const renderFieldError = (field: string) =>
    formErrors[field] ? (
      <p className="text-sm text-primary-600">{formErrors[field]}</p>
    ) : null;

  const renderCreateForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formErrors.detail && (
        <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700">
          {formErrors.detail}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Restaurant Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            placeholder="My Restaurant"
            disabled={submitting}
            required
          />
          {renderFieldError("name")}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Tell customers about your restaurant..."
            className="flex h-24 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            rows={4}
            disabled={submitting}
          />
          {renderFieldError("description")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleFieldChange("address", e.target.value)}
              placeholder="123 Main St"
              className="pl-10"
              disabled={submitting}
            />
          </div>
          {renderFieldError("address")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              placeholder="+1 234 567 890"
              className="pl-10"
              disabled={submitting}
            />
          </div>
          {renderFieldError("phone")}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              placeholder="info@restaurant.com"
              className="pl-10"
              disabled={submitting}
            />
          </div>
          {renderFieldError("email")}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <Label>Logo</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
            ) : (
              <Image className="h-8 w-8 mx-auto text-neutral-400" />
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setLogoPreview, setLogoFile, 2)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Upload logo"
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() => logoInputRef.current?.click()}
              disabled={submitting}
            >
              Upload Logo
            </Button>
            <p className="text-xs text-neutral-500">Recommended: 200x200px, max 2MB</p>
          </div>
        </div>
        {renderFieldError("logo")}
      </div>

      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-40 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 overflow-hidden">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-8 w-8 mx-auto text-neutral-400" />
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setCoverPreview, setCoverFile, 5)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Upload cover image"
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() => coverInputRef.current?.click()}
              disabled={submitting}
            >
              Upload Cover
            </Button>
            <p className="text-xs text-neutral-500">Recommended: 1200x400px, max 5MB</p>
          </div>
        </div>
        {renderFieldError("cover")}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setIsDialogOpen(false);
            resetCreateForm();
          }}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {dialogMode === "edit" ? "Save Changes" : "Create Restaurant"}
        </Button>
      </DialogFooter>
    </form>
  );

  if (!currentRestaurant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Restaurant</h1>
            <p className="page-subtitle">Create your first restaurant to get started</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Restaurant
          </Button>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetCreateForm();
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Restaurant</DialogTitle>
            </DialogHeader>
            {renderCreateForm()}
          </DialogContent>
        </Dialog>

        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Restaurant Yet</h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Create your first restaurant to start managing your menu, inventory, and staff.
            </p>
            <Button size="lg" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Restaurant
            </Button>
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
        <Button variant="outline" onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Another
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "edit" ? "Edit Restaurant" : "Create Restaurant"}
            </DialogTitle>
          </DialogHeader>
          {renderCreateForm()}
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(currentRestaurant.logo || currentRestaurant.cover) && (
              <div className="space-y-2">
                {currentRestaurant.cover && (
                  <img
                    src={currentRestaurant.cover}
                    alt={`${currentRestaurant.name} cover`}
                    className="h-40 w-full rounded-lg object-cover"
                  />
                )}
                {currentRestaurant.logo && (
                  <img
                    src={currentRestaurant.logo}
                    alt={`${currentRestaurant.name} logo`}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <p className="text-neutral-900">{currentRestaurant.name}</p>
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <p className="text-neutral-900 font-mono">{currentRestaurant.slug}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Description</Label>
                <p className="text-neutral-900">{currentRestaurant.description || "No description"}</p>
              </div>
              <div className="space-y-1">
                <Label>Address</Label>
                <p className="text-neutral-900">{currentRestaurant.address || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <p className="text-neutral-900">{currentRestaurant.phone || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <p className="text-neutral-900">{currentRestaurant.email || "Not set"}</p>
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
              <p className="text-2xl font-bold text-neutral-900">{currentRestaurant.staff_count || 0}</p>
            </div>
            <div className="space-y-1">
              <Label>Menu Categories</Label>
              <p className="text-2xl font-bold text-neutral-900">{currentRestaurant.menu_categories_count || 0}</p>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <span className="badge-success">Active</span>
            </div>
            <div className="space-y-1">
              <Label>Created</Label>
              <p className="text-neutral-900">
                {currentRestaurant.created_at
                  ? new Date(currentRestaurant.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-200">
              <Button
                variant="outline"
                className="w-full"
                onClick={openEditDialog}
                disabled={!isOwner}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
              <Button
                variant="destructive"
                className="w-full mt-2"
                onClick={handleDelete}
                loading={deleting}
                disabled={!isOwner}
              >
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