import React, { createContext, useCallback, useContext, useState } from "react";
import API from "../api/axios";

const CustomerContext = createContext();

export const useCustomers = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerShipments, setCustomerShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/customers/all");
      if (res.data.success) setCustomers(res.data.data || []);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerById = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/customers/${id}`);
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
        if (res.data.success) await fetchCustomers();
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
        if (res.data.success) await fetchCustomers();
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
