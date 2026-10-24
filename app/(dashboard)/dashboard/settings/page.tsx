"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Save,
  Shield,
  Store,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", description: "Bright and clean", icon: Sun },
  { value: "dark", label: "Dark", description: "Easy on the eyes", icon: Moon },
  {
    value: "system",
    label: "System",
    description: "Match your device",
    icon: Monitor,
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, updateProfile, logout } = useAuth();
  const { currentRestaurant, updateRestaurant } = useRestaurant();

  const [mounted, setMounted] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
  });
  const [restaurantName, setRestaurantName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      gender: user.gender || "",
    });
  }, [user]);

  useEffect(() => {
    setRestaurantName(currentRestaurant?.name || "");
  }, [currentRestaurant?.slug, currentRestaurant?.name]);

  const isOwner =
    !!user && !!currentRestaurant && currentRestaurant.owner?.id === user.id;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: {
      first_name?: string;
      last_name?: string;
      gender?: string;
    } = {};

    if (profileForm.first_name.trim()) {
      payload.first_name = profileForm.first_name.trim();
    }
    if (profileForm.last_name.trim()) {
      payload.last_name = profileForm.last_name.trim();
    }
    if (profileForm.gender) {
      payload.gender = profileForm.gender;
    }

    if (Object.keys(payload).length === 0) {
      toast.error("Enter at least one field to update");
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(payload);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;
    if (!restaurantName.trim()) {
      toast.error("Restaurant name cannot be empty");
      return;
    }

    setSavingRestaurant(true);
    try {
      await updateRestaurant(currentRestaurant.slug, {
        name: restaurantName.trim(),
      });
      toast.success("Restaurant updated successfully");
    } catch {
      toast.error("Failed to update restaurant");
    } finally {
      setSavingRestaurant(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Manage your account, restaurant, and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-auto">
          <TabsTrigger value="profile">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="restaurant">
            <Store className="mr-2 h-4 w-4" />
            Restaurant
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="account">
            <Shield className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={user?.avatar_url || undefined}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="text-xl">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {user?.name || "User"}
                    </p>
                    <p className="text-sm text-neutral-500">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                    />
                    <p className="text-xs text-neutral-500">
                      Email cannot be changed here.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      id="gender"
                      value={profileForm.gender}
                      onValueChange={(value) =>
                        setProfileForm((prev) => ({ ...prev, gender: value }))
                      }
                      options={GENDER_OPTIONS}
                      placeholder="Select gender"
                    />
                  </div>
                </div>

                <Button type="submit" loading={savingProfile}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restaurant">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant</CardTitle>
              <CardDescription>
                Manage the details of your current restaurant
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentRestaurant ? (
                <form
                  onSubmit={handleRestaurantSubmit}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-primary-100">
                      {currentRestaurant.logo ? (
                        <img
                          src={currentRestaurant.logo}
                          alt={currentRestaurant.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {currentRestaurant.name}
                      </p>
                      <p className="text-sm text-neutral-500 font-mono">
                        {currentRestaurant.slug}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant_name">Restaurant Name</Label>
                      <Input
                        id="restaurant_name"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        disabled={!isOwner}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restaurant_slug">Slug</Label>
                      <Input
                        id="restaurant_slug"
                        value={currentRestaurant.slug}
                        disabled
                      />
                      <p className="text-xs text-neutral-500">
                        Used in your restaurant URL and cannot be changed.
                      </p>
                    </div>
                  </div>

                  {!isOwner && (
                    <p className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
                      Only the restaurant owner can edit these details.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      loading={savingRestaurant}
                      disabled={!isOwner}
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button asChild type="button" variant="outline">
                      <Link href="/dashboard/restaurant">
                        <Store className="h-4 w-4" />
                        Manage Restaurant
                      </Link>
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="py-10 text-center">
                  <Building2 className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                  <h3 className="mb-2 font-semibold text-neutral-900">
                    No Restaurant Selected
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-sm text-neutral-500">
                    Create a restaurant to manage its settings here.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/restaurant">
                      <Building2 className="h-4 w-4" />
                      Go to Restaurants
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Choose how Mesero looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {THEME_OPTIONS.map((option) => {
                  const isActive = mounted && theme === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      aria-pressed={isActive}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        isActive
                          ? "border-primary-600 bg-primary-50"
                          : "border-neutral-200 bg-white hover:bg-neutral-50",
                      )}
                    >
                      <div
                        className={cn(
                          "mb-3 flex h-10 w-10 items-center justify-center rounded-lg",
                          isActive
                            ? "bg-primary-600 text-white"
                            : "bg-neutral-100 text-neutral-600",
                        )}
                      >
                        <option.icon className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-neutral-900">
                        {option.label}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Your account details and session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={user?.avatar_url || undefined}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-neutral-900">
                    {user?.name || "User"}
                  </p>
                  <p className="text-sm text-neutral-500">{user?.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Email Address</Label>
                  <p className="text-neutral-900">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <Label>Account Status</Label>
                  <span className="badge-success">Active</span>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-neutral-900">Sign out</p>
                  <p className="text-sm text-neutral-500">
                    End your session on this device.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
