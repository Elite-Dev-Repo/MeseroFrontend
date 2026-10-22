"use client";

import { useContext } from "react";
import { RestaurantContext } from "@/context/RestaurantContext";

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return ctx;
};

export default useRestaurant;