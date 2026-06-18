import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import API from "../api/axios";

const CustomerContext = createContext();

export const useCustomers = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerShipments, setCustomerShipments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const listCacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());

  const fetchCustomers = useCallback(async (filters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      search: filters.search || "",
      status: filters.status || "",
    };
    const cacheKey = JSON.stringify(params);
    const cached = listCacheRef.current.get(cacheKey);

    if (cached) {
      setCustomers(cached.data);
      setPagination(cached.pagination);
      return cached.response;
    }

    if (inFlightRef.current.has(cacheKey)) {
      return inFlightRef.current.get(cacheKey);
    }

    const request = (async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/customers/all", { params });
      if (res.data.success) {
        const nextPagination = {
          page: res.data.pagination?.page || params.page,
          limit: res.data.pagination?.limit || params.limit,
          totalPages: res.data.pagination?.totalPages || 1,
          total: res.data.total || 0,
        };
        const nextData = res.data.data || [];
        setCustomers(nextData);
        setPagination(nextPagination);
        listCacheRef.current.set(cacheKey, {
          data: nextData,
          pagination: nextPagination,
          response: res.data,
        });
      }
      return res.data;
    } finally {
      setLoading(false);
      inFlightRef.current.delete(cacheKey);
    }
    })();

    inFlightRef.current.set(cacheKey, request);
    return request;
  }, []);

  const getCustomerById = useCallback(async (id, params = {}) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/customers/${id}`, { params });
      if (res.data.success) {
        setSelectedCustomer(res.data.data.customer);
        setCustomerShipments(res.data.data.shipments || []);
        return res.data.data;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCustomerStatus = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const res = await API.patch(`/admin/customers/${id}/status`);
        if (res.data.success) {
          listCacheRef.current.clear();
          await fetchCustomers();
        }
        return res.data;
      } finally {
        setLoading(false);
      }
    },
    [fetchCustomers]
  );

  const deleteCustomer = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const res = await API.delete(`/admin/customers/${id}`);
        if (res.data.success) {
          listCacheRef.current.clear();
          await fetchCustomers();
        }
        return res.data;
      } finally {
        setLoading(false);
      }
    },
    [fetchCustomers]
  );

  return (
    <CustomerContext.Provider
      value={{
        customers,
        selectedCustomer,
        customerShipments,
        pagination,
        loading,
        fetchCustomers,
        getCustomerById,
        toggleCustomerStatus,
        deleteCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
