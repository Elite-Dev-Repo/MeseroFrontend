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

export const updateCategory = async (categoryId, payload) => {
  const { data } = await api.patch(`/category/${categoryId}/`, payload);
  return data;
};

export const deleteCategory = async (categoryId) => {
  const { data } = await api.delete(`/category/${categoryId}/`);
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

export const updateMenuItem = async (itemId, formData) => {
  const { data } = await api.patch(`/menu_items/${itemId}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteMenuItem = async (itemId) => {
  const { data } = await api.delete(`/menu_items/${itemId}/`);
  return data;
};

export const getStaff = async (restaurantSlug) => {
  const { data } = await api.get(`/staffs/${restaurantSlug}/`);
  return data;
};

export const inviteStaff = async (restaurantSlug, payload) => {
  const { data } = await api.post(`/staffs/${restaurantSlug}/invite/`, payload);
  return data;
};

export const updateStaff = async (restaurantSlug, staffId, payload) => {
  const { data } = await api.patch(
    `/staffs/${restaurantSlug}/${staffId}/`,
    payload,
  );
  return data;
};

export const removeStaff = async (restaurantSlug, staffId) => {
  const { data } = await api.delete(`/staffs/${restaurantSlug}/${staffId}/`);
  return data;
};

export const getInventory = async (restaurantSlug) => {
  const { data } = await api.get(`/${restaurantSlug}/inventory/items/`);
  return data;
};

export const createInventoryItem = async (restaurantSlug, payload) => {
  const { data } = await api.post(`/${restaurantSlug}/inventory/items/`, payload);
  return data;
};

export const updateInventoryItem = async (itemId, payload) => {
  const { data } = await api.patch(`/inventory/items/${itemId}/`, payload);
  return data;
};

export const deleteInventoryItem = async (itemId) => {
  const { data } = await api.delete(`/inventory/items/${itemId}/`);
  return data;
};

export const adjustInventoryStock = async (itemId, delta) => {
  const { data } = await api.post(`/inventory/items/${itemId}/adjust/`, { delta });
  return data;
};

// Get all restaurants for the authenticated user
export const getRestaurants = async () => {
  const { data } = await api.get("/profile/");
  return data.restaurants || [];
};