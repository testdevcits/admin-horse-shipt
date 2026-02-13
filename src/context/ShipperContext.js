import React, { createContext, useContext, useState, useCallback } from "react";
import API from "../api/axios";
import Toast from "../components/common/Toast";

// Create context
const ShipperContext = createContext();

// Custom hook
export const useShippers = () => useContext(ShipperContext);

// Provider component
export const ShipperProvider = ({ children }) => {
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("info");

  const showToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
  };

  // ----------------------------
  // Fetch all shippers (stable with useCallback)
  // ----------------------------
  const fetchShippers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/shippers/all");
      if (res.data.success) setShippers(res.data.data);
    } catch (error) {
      console.error("Error fetching shippers:", error);
      showToast(
        error?.response?.data?.message || "Failed to fetch shippers",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------
  // Get shipper by ID
  // ----------------------------
  const getShipperById = async (id) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/shippers/${id}`);
      if (res.data.success) {
        setSelectedShipper(res.data.data);
        return res.data.data;
      }
    } catch (error) {
      console.error("Error fetching shipper:", error);
      showToast(
        error?.response?.data?.message || "Failed to fetch shipper",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Update shipper
  // ----------------------------
  const updateShipper = async (id, payload) => {
    try {
      setLoading(true);
      const res = await API.put(`/admin/shippers/${id}`, payload);
      if (res.data.success) {
        showToast(res.data.message, "success");
        fetchShippers();
      }
      return res.data;
    } catch (error) {
      console.error("Error updating shipper:", error);
      showToast(
        error?.response?.data?.message || "Failed to update shipper",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Toggle shipper status
  // ----------------------------
  const toggleShipperStatus = async (id) => {
    try {
      setLoading(true);
      const res = await API.patch(`/admin/shippers/${id}/status`);
      if (res.data.success) {
        showToast(res.data.message, "success");
        fetchShippers();
      }
      return res.data;
    } catch (error) {
      console.error("Error toggling shipper status:", error);
      showToast(
        error?.response?.data?.message || "Failed to toggle status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Delete shipper
  // ----------------------------
  const deleteShipper = async (id) => {
    try {
      setLoading(true);
      const res = await API.delete(`/admin/shippers/${id}`);
      if (res.data.success) {
        showToast(res.data.message, "success");
        fetchShippers();
      }
      return res.data;
    } catch (error) {
      console.error("Error deleting shipper:", error);
      showToast(
        error?.response?.data?.message || "Failed to delete shipper",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Context value
  // ----------------------------
  const value = {
    shippers,
    loading,
    selectedShipper,
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
