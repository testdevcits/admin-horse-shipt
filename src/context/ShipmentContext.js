import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import API from "../api/axios";

const ShipmentContext = createContext();

export const useAdminShipments = () => useContext(ShipmentContext);

export const ShipmentProvider = ({ children }) => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentQuotes, setShipmentQuotes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const listCacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());

  const fetchShipments = useCallback(async (filters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      search: filters.search || "",
      status: filters.status || "",
      shipper: filters.shipper || "",
      customer: filters.customer || "",
    };
    const cacheKey = JSON.stringify(params);
    const cached = listCacheRef.current.get(cacheKey);

    if (cached) {
      setShipments(cached.data);
      setPagination(cached.pagination);
      return cached.response;
    }

    if (inFlightRef.current.has(cacheKey)) {
      return inFlightRef.current.get(cacheKey);
    }

    const request = (async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/shipments/all", { params });
      if (res.data.success) {
        const nextPagination = {
          page: res.data.pagination?.page || params.page,
          limit: res.data.pagination?.limit || params.limit,
          totalPages: res.data.pagination?.totalPages || 1,
          total: res.data.total || 0,
        };
        const nextData = res.data.data || [];
        setShipments(nextData);
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

  const getShipmentById = useCallback(async (id, params = {}) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/shipments/${id}`, { params });
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
        pagination,
        loading,
        fetchShipments,
        getShipmentById,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};
