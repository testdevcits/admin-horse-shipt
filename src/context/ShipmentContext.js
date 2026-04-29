import React, { createContext, useCallback, useContext, useState } from "react";
import API from "../api/axios";

const ShipmentContext = createContext();

export const useAdminShipments = () => useContext(ShipmentContext);

export const ShipmentProvider = ({ children }) => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentQuotes, setShipmentQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchShipments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const query = params.toString();
      const res = await API.get(`/admin/shipments/all${query ? `?${query}` : ""}`);
      if (res.data.success) setShipments(res.data.data || []);
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getShipmentById = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/shipments/${id}`);
      if (res.data.success) {
        setSelectedShipment(res.data.data.shipment);
        setShipmentQuotes(res.data.data.quotes || []);
        return res.data.data;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        selectedShipment,
        shipmentQuotes,
        loading,
        fetchShipments,
        getShipmentById,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};
