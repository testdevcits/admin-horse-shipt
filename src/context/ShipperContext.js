import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import API from "../api/axios";
import Toast from "../components/common/Toast";

const ShipperContext = createContext();

export const useShippers = () => useContext(ShipperContext);

export const ShipperProvider = ({ children }) => {
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const listCacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("info");

  const showToast = useCallback((message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
  }, []);

  // Fetch all shippers
  const fetchShippers = useCallback(async (filters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      search: filters.search || "",
      status: filters.status || "",
    };
    const cacheKey = JSON.stringify(params);
    const cached = listCacheRef.current.get(cacheKey);

    if (cached) {
      setShippers(cached.data);
      setPagination(cached.pagination);
      return cached.response;
    }

    if (inFlightRef.current.has(cacheKey)) {
      return inFlightRef.current.get(cacheKey);
    }

    const request = (async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/shippers/all", { params });
      if (res.data.success) {
        const nextPagination = {
          page: res.data.pagination?.page || params.page,
          limit: res.data.pagination?.limit || params.limit,
          totalPages: res.data.pagination?.totalPages || 1,
          total: res.data.total || 0,
        };
        const nextData = res.data.data || [];
        setShippers(nextData);
        setPagination(nextPagination);
        listCacheRef.current.set(cacheKey, {
          data: nextData,
          pagination: nextPagination,
          response: res.data,
        });
      }
      return res.data;
      } catch (error) {
        showToast(
        error?.response?.data?.message || "Failed to fetch shippers",
        "error"
      );
      throw error;
    } finally {
      setLoading(false);
      inFlightRef.current.delete(cacheKey);
    }
    })();

    inFlightRef.current.set(cacheKey, request);
    return request;
  }, [showToast]);

  // Get shipper by ID
  const getShipperById = useCallback(
    async (id, params = {}) => {
      try {
        setLoading(true);
        const res = await API.get(`/admin/shippers/${id}`, { params });
        if (res.data.success) {
          const payload = res.data.data;
          const shipper = payload?.shipper || payload;
          setSelectedShipper(shipper);
          return { ...payload, shipper };
        }
      } catch (error) {
        showToast(
          error?.response?.data?.message || "Failed to fetch shipper",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Update shipper
  const updateShipper = useCallback(
    async (id, payload) => {
      try {
        setLoading(true);
        const res = await API.put(`/admin/shippers/${id}`, payload);
        if (res.data.success) {
          listCacheRef.current.clear();
          showToast(res.data.message, "success");
          fetchShippers();
        }
        return res.data;
      } catch (error) {
        showToast(
          error?.response?.data?.message || "Failed to update shipper",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchShippers, showToast]
  );

  // Toggle shipper status
  const toggleShipperStatus = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const res = await API.patch(`/admin/shippers/${id}/status`);
        if (res.data.success) {
          listCacheRef.current.clear();
          showToast(res.data.message, "success");
          fetchShippers();
        }
        return res.data;
      } catch (error) {
        showToast(
          error?.response?.data?.message || "Failed to toggle status",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchShippers, showToast]
  );

  // Delete shipper
  const deleteShipper = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const res = await API.delete(`/admin/shippers/${id}`);
        if (res.data.success) {
          listCacheRef.current.clear();
          showToast(res.data.message, "success");
          fetchShippers();
        }
        return res.data;
      } catch (error) {
        showToast(
          error?.response?.data?.message || "Failed to delete shipper",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchShippers, showToast]
  );

  const value = {
    shippers,
    loading,
    selectedShipper,
    pagination,
    fetchShippers,
    getShipperById,
    updateShipper,
    toggleShipperStatus,
    deleteShipper,
    setSelectedShipper,
    showToast,
  };

  return (
    <ShipperContext.Provider value={value}>
      {children}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </ShipperContext.Provider>
  );
};
