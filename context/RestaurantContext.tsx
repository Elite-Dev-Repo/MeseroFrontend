"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as restaurantApi from "@/lib/restaurantApi";
import * as orderApi from "@/lib/orderApi";

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  name?: string;
  avatar_url?: string | null;
}

interface Restaurant {
  name: string;
  slug: string;
  logo?: string | null;
  cover?: string | null;
  owner?: User;
  restaurant_inventory?: Inventory[];
  menu_categories?: Category[];
  staff_for_restaurant?: Staff[];
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  staff_count?: number;
  menu_categories_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: number;
  restaurant: string;
  name: string;
  slug: string;
  is_active: boolean;
  menu_item: MenuItem[];
}

interface MenuItem {
  id: number;
  name: string;
  category: number;
  image?: string | null;
  price: number;
  is_available: boolean;
  description: string;
  category_name?: string;
}

interface Inventory {
  id: number;
  restaurant: string;
  name: string;
  slug: string;
  is_active: boolean;
  inventory_item: InventoryItem[];
}

interface InventoryItem {
  id: number;
  name: string;
  inventory: number;
  image?: string | null;
  quantity: number;
  unit_measurement: string;
  low_stock_threshold: number;
  is_available: boolean;
}

interface Staff {
  id?: number;
  user: User;
  restaurant: string;
  role: string;
  is_active: boolean;
  joined_at?: string;
}

interface OrderItem {
  id: number;
  menu_item: number | null;
  quantity: number;
  subtotal: string;
}

interface Order {
  id: number;
  restaurant: string;
  order_reference: string;
  order_type: string;
  status: string;
  items_for_order: OrderItem[];
}

interface CreateOrderPayload {
  restaurant: string;
  order_type?: string;
  items: { id: number; quantity: number }[];
}

type ApiError = {
  response?: { data?: { detail?: string; error?: string } };
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const data = (err as ApiError)?.response?.data;
  const message = data?.detail || data?.error;
  return typeof message === "string" ? message : fallback;
};

type RestaurantPayload = Partial<
  Pick<
    Restaurant,
    "name" | "description" | "address" | "phone" | "email" | "logo" | "cover"
  >
>;

type RestaurantUpdatePayload = RestaurantPayload | FormData;

type InventoryItemPayload = {
  name: string;
  unit_measurement: string;
  quantity: number;
  low_stock_threshold: number;
  is_available: boolean;
};

interface RestaurantContextValue {
  currentRestaurant: Restaurant | null;
  restaurants: Restaurant[] | null;
  isLoading: boolean;
  error: string | null;
  fetchRestaurant: (slug: string) => Promise<void>;
  fetchRestaurants: () => Promise<void>;
  createRestaurant: (formData: FormData) => Promise<Restaurant>;
  updateRestaurant: (
    slug: string,
    payload: RestaurantUpdatePayload
  ) => Promise<Restaurant>;
  fetchCategories: (slug: string) => Promise<Category[]>;
  createCategory: (
    slug: string,
    payload: { name: string; is_active?: boolean }
  ) => Promise<Category>;
  updateCategory: (
    categoryId: number,
    payload: { name?: string; is_active?: boolean }
  ) => Promise<Category>;
  deleteCategory: (categoryId: number) => Promise<void>;
  fetchMenuItems: (params?: {
    category?: number;
    search?: string;
  }) => Promise<MenuItem[]>;
  createMenuItem: (formData: FormData) => Promise<MenuItem>;
  updateMenuItem: (itemId: number, formData: FormData) => Promise<MenuItem>;
  deleteMenuItem: (itemId: number) => Promise<void>;
  fetchInventory: (slug: string) => Promise<InventoryItem[]>;
  createInventoryItem: (
    slug: string,
    payload: InventoryItemPayload
  ) => Promise<InventoryItem>;
  updateInventoryItem: (
    itemId: number,
    payload: Partial<InventoryItemPayload>
  ) => Promise<InventoryItem>;
  deleteInventoryItem: (itemId: number) => Promise<void>;
  adjustInventoryStock: (
    itemId: number,
    delta: number
  ) => Promise<InventoryItem>;
  fetchStaff: (slug: string) => Promise<Staff[]>;
  fetchOrders: () => Promise<Order[]>;
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  updateOrderStatus: (orderId: number, status: string) => Promise<Order>;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  clearRestaurant: () => void;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export const RestaurantProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantApi.getRestaurant(slug);
      setCurrentRestaurant(data);
      localStorage.setItem("restaurant_slug", slug);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load restaurant"));
      localStorage.removeItem("restaurant_slug");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = (await restaurantApi.getRestaurants()) as Restaurant[];
      setRestaurants(data);
      // Auto-select the saved restaurant, falling back to the first one
      if (data.length > 0) {
        const storedSlug = localStorage.getItem("restaurant_slug");
        const selected =
          data.find((restaurant) => restaurant.slug === storedSlug) || data[0];
        await fetchRestaurant(selected.slug);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load restaurants"));
    } finally {
      setIsLoading(false);
    }
  }, [fetchRestaurant]);

  // Auto-fetch restaurants on load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRestaurants();
  }, [fetchRestaurants]);

  const createRestaurant = useCallback(async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantApi.createRestaurant(formData);
      setCurrentRestaurant(data);
      setRestaurants((prev) => (prev ? [data, ...prev] : [data]));
      localStorage.setItem("restaurant_slug", data.slug);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create restaurant"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRestaurant = useCallback(
    async (slug: string, payload: RestaurantUpdatePayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await restaurantApi.updateRestaurant(slug, payload);
        setCurrentRestaurant(data);
        setRestaurants(
          (prev) => prev?.map((r) => (r.slug === slug ? data : r)) || [],
        );
        return data;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to update restaurant"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchCategories = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantApi.getCategories(slug);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load categories"));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (slug: string, payload: { name: string; is_active?: boolean }) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await restaurantApi.createCategory(slug, payload);
        return data;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to create category"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateCategory = useCallback(
    async (
      categoryId: number,
      payload: { name?: string; is_active?: boolean },
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await restaurantApi.updateCategory(categoryId, payload);
        return data;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to update category"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteCategory = useCallback(async (categoryId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await restaurantApi.deleteCategory(categoryId);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete category"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMenuItems = useCallback(
    async (params?: { category?: number; search?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await restaurantApi.getMenuItems(params);
        return data;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load menu items"));
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const createMenuItem = useCallback(async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantApi.createMenuItem(formData);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create menu item"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMenuItem = useCallback(async (itemId: number, formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantApi.updateMenuItem(itemId, formData);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update menu item"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMenuItem = useCallback(async (itemId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await restaurantApi.deleteMenuItem(itemId);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete menu item"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInventory = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantApi.getInventory(slug);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load inventory"));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createInventoryItem = useCallback(
    async (slug: string, payload: InventoryItemPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await restaurantApi.createInventoryItem(slug, payload);
        return data;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to create inventory item"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateInventoryItem = useCallback(
    async (itemId: number, payload: Partial<InventoryItemPayload>) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await restaurantApi.updateInventoryItem(itemId, payload);
        return data;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to update inventory item"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteInventoryItem = useCallback(async (itemId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await restaurantApi.deleteInventoryItem(itemId);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete inventory item"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adjustInventoryStock = useCallback(
    async (itemId: number, delta: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await restaurantApi.adjustInventoryStock(itemId, delta);
        return data;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to adjust stock"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchStaff = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await restaurantApi.getStaff(slug);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load staff"));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderApi.getOrders();
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load orders"));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (payload: CreateOrderPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderApi.createOrder(payload);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create order"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: number, status: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await orderApi.updateOrderStatus(orderId, status);
        return data;
      } catch (err) {
        setError(getErrorMessage(err, "Failed to update order status"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearRestaurant = useCallback(() => {
    setCurrentRestaurant(null);
    localStorage.removeItem("restaurant_slug");
  }, []);

  const value = useMemo(
    () => ({
      currentRestaurant,
      restaurants,
      isLoading,
      error,
      fetchRestaurant,
      fetchRestaurants,
      createRestaurant,
      updateRestaurant,
      fetchCategories,
      createCategory,
      updateCategory,
      deleteCategory,
      fetchMenuItems,
      createMenuItem,
      updateMenuItem,
      deleteMenuItem,
      fetchInventory,
      createInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      adjustInventoryStock,
      fetchStaff,
      fetchOrders,
      createOrder,
      updateOrderStatus,
      setCurrentRestaurant,
      clearRestaurant,
    }),
    [
      currentRestaurant,
      restaurants,
      isLoading,
      error,
      fetchRestaurant,
      fetchRestaurants,
      createRestaurant,
      updateRestaurant,
      fetchCategories,
      createCategory,
      updateCategory,
      deleteCategory,
      fetchMenuItems,
      createMenuItem,
      updateMenuItem,
      deleteMenuItem,
      fetchInventory,
      createInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      adjustInventoryStock,
      fetchStaff,
      fetchOrders,
      createOrder,
      updateOrderStatus,
      setCurrentRestaurant,
      clearRestaurant,
    ],
  );

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export { RestaurantContext };