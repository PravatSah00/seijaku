"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CustomerUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  status?: string;
  createdAt?: string;
};

export type CustomerOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  itemsCount: number;
  items: Array<{
    productSlug: string;
    productTitle: string;
    quantity: number;
    unitPriceAmount: number;
    variantSummary?: string;
  }>;
};

type CustomerAuthContextValue = {
  customer: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  orders: CustomerOrder[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; wishlist?: string[] }>;
  register: (data: { email: string; password: string; name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
  refreshCustomer: () => Promise<void>;
};

const CUSTOMER_TOKEN_KEY = "seijaku-customer-token";

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(CUSTOMER_TOKEN_KEY);
    }
    return null;
  });
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentCustomer = useCallback(async (authToken: string) => {
    try {
      const res = await fetch("/api/public/customer/auth/me", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem(CUSTOMER_TOKEN_KEY);
          setToken(null);
          setCustomer(null);
          setOrders([]);
        }
        return null;
      }

      const data = await res.json();
      setCustomer(data.customer);
      setOrders(data.orders ?? []);
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (token) {
        setIsLoading(true);
        await fetchCurrentCustomer(token);
        if (isMounted) setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [token, fetchCurrentCustomer]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/public/customer/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      const authToken = data.token;
      localStorage.setItem(CUSTOMER_TOKEN_KEY, authToken);
      setToken(authToken);
      setCustomer(data.customer);
      await fetchCurrentCustomer(authToken);

      return { success: true, wishlist: data.wishlist || [] };
    } catch {
      return { success: false, error: "Network error occurred during login" };
    }
  };

  const register = async (input: { email: string; password: string; name?: string; phone?: string }) => {
    try {
      const res = await fetch("/api/public/customer/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      const authToken = data.token;
      localStorage.setItem(CUSTOMER_TOKEN_KEY, authToken);
      setToken(authToken);
      setCustomer(data.customer);
      await fetchCurrentCustomer(authToken);

      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred during registration" };
    }
  };

  const logout = () => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    setToken(null);
    setCustomer(null);
    setOrders([]);
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    if (!token) return { success: false, error: "Not logged in" };

    try {
      const res = await fetch("/api/public/customer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || "Failed to update profile" };
      }

      setCustomer(json.customer);
      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred" };
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    if (!token) return { success: false, error: "Not logged in" };

    try {
      const res = await fetch("/api/public/customer/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || "Failed to change password" };
      }

      return { success: true };
    } catch {
      return { success: false, error: "Network error occurred" };
    }
  };

  const refreshCustomer = async () => {
    if (token) {
      await fetchCurrentCustomer(token);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isLoading,
        isAuthenticated: Boolean(customer && token),
        orders,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
}
