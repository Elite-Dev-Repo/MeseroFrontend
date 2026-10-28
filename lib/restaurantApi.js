import api from "./api";

export const createRestaurant = async (formData) => {
  const { data } = await api.post("/restaurant/create/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getRestaurant = async (slug) => {
  const { data } = await api.get(`/restaurant/${slug}/`);
  return data;
};

export const updateRestaurant = async (slug, payload) => {
  const isFormData = payload instanceof FormData;
  const { data } = await api.patch(`/restaurant/${slug}/`, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
};

export const deleteRestaurant = async (slug) => {
  const { data } = await api.delete(`/restaurant/${slug}/`);
  return data;
};

export const getCategories = async (restaurantSlug) => {
  const { data } = await api.get(`/${restaurantSlug}/category/`);
  return data;
};

export const createCategory = async (restaurantSlug, payload) => {
  const { data } = await api.post(`/${restaurantSlug}/category/`, {
    ...payload,
    restaurant_slug: restaurantSlug,
  });
  return data;
};

export const getMenuItems = async (params = {}) => {
  const { data } = await api.get("/menu_items/", { params });
  return data;
};

export const createMenuItem = async (formData) => {
  const { data } = await api.post("/menu_items/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getStaff = async (restaurantSlug) => {
  const { data } = await api.get(`/staffs/${restaurantSlug}`);
  return data;
};

export const getInventory = async (restaurantSlug) => {
  const restaurant = await getRestaurant(restaurantSlug);
  return restaurant.restaurant_inventory || [];
};

// Get all restaurants for the authenticated user
export const getRestaurants = async () => {
  const { data } = await api.get("/profile/");
  return data.restaurants || [];
};