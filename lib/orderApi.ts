import api from "./api";

export interface CreateOrderPayload {
  restaurant: string;
  order_type?: string;
  items: { id: number; quantity: number }[];
}

export const getOrders = async (params?: { restaurant?: string }) => {
  const { data } = await api.get("/orders/", { params });
  return data;
};

export const createOrder = async (payload: CreateOrderPayload) => {
  const { data } = await api.post("/orders/", payload);
  return data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const { data } = await api.patch(`/orders/${orderId}/`, { status });
  return data;
};
