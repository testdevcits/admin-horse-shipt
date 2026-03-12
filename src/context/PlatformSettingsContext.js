import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import API from "../api/axios";
import Toast from "../components/common/Toast";

const PlatformSettingsContext = createContext();

export const PlatformSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState(null);

  // =========================
  // FETCH PLATFORM SETTINGS
  // =========================
  const fetchPlatformSettings = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/platform-settings");

      setSettings(res.data.data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to fetch platform settings";

      setToast({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // UPDATE PLATFORM SETTINGS
  // =========================
  const updatePlatformSettings = useCallback(async (data) => {
    try {
      setLoading(true);

      const res = await API.put("/admin/platform-settings", data);

      setSettings(res.data.data);

      setToast({
        type: "success",
        message: res.data?.message || "Platform settings updated successfully",
      });

      return true;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update platform settings";

      setToast({
        type: "error",
        message,
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatformSettings();
  }, [fetchPlatformSettings]);

  return (
    <PlatformSettingsContext.Provider
      value={{
        settings,
        loading,
        fetchPlatformSettings,
        updatePlatformSettings,
      }}
    >
      {children}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </PlatformSettingsContext.Provider>
  );
};

export const usePlatformSettings = () => useContext(PlatformSettingsContext);
