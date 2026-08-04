import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import API from "../api/axios";

const HorseAttributeContext = createContext();

const RESOURCE_CONFIG = {
  colors: {
    endpoint: "/admin/colors",
    label: "color",
  },
  sexes: {
    endpoint: "/admin/sexes",
    label: "sex",
  },
};

const createInitialState = () => ({
  items: [],
  loading: false,
  error: null,
  hasFetched: false,
  page: 1,
  limit: 10,
  totalPages: 1,
  totalRecords: 0,
  fetchingMore: false,
});

export const HorseAttributeProvider = ({ children }) => {
  const [resources, setResources] = useState({
    colors: createInitialState(),
    sexes: createInitialState(),
  });

  const patchResource = useCallback((type, patch) => {
    setResources((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...(typeof patch === "function" ? patch(prev[type]) : patch),
      },
    }));
  }, []);

  const fetchAttributes = useCallback(
    async (type, newPage = 1) => {
      const config = RESOURCE_CONFIG[type];
      if (!config) return;

      try {
        patchResource(type, {
          loading: newPage === 1,
          fetchingMore: newPage !== 1,
          error: null,
        });

        const limit = 10;
        const res = await API.get(
          `${config.endpoint}?page=${newPage}&limit=${limit}`
        );
        const { data, totalPages, total } = res.data;

        patchResource(type, {
          items: data || [],
          page: newPage,
          totalPages: totalPages || 1,
          totalRecords: total || 0,
          hasFetched: true,
        });
      } catch (err) {
        patchResource(type, {
          error:
            err.response?.data?.message ||
            `Failed to fetch ${config.label}s`,
          hasFetched: true,
        });
      } finally {
        patchResource(type, {
          loading: false,
          fetchingMore: false,
        });
      }
    },
    [patchResource]
  );

  const createAttribute = useCallback(
    async (type, name) => {
      const config = RESOURCE_CONFIG[type];
      if (!config) return { success: false, message: "Invalid resource" };

      try {
        patchResource(type, { loading: true });
        const res = await API.post(config.endpoint, { name });
        patchResource(type, (current) => ({
          items: [res.data.data, ...(current?.items || [])],
        }));
        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message ||
            `Failed to create ${config.label}`,
        };
      } finally {
        patchResource(type, { loading: false });
      }
    },
    [patchResource]
  );

  const updateAttribute = useCallback(
    async (type, id, name) => {
      const config = RESOURCE_CONFIG[type];
      if (!config) return { success: false, message: "Invalid resource" };

      try {
        patchResource(type, { loading: true });
        const res = await API.put(`${config.endpoint}/${id}`, { name });
        patchResource(type, (current) => ({
          items: (current?.items || []).map((item) =>
            item._id === id ? res.data.data : item
          ),
        }));
        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message ||
            `Failed to update ${config.label}`,
        };
      } finally {
        patchResource(type, { loading: false });
      }
    },
    [patchResource]
  );

  const deleteAttribute = useCallback(
    async (type, id) => {
      const config = RESOURCE_CONFIG[type];
      if (!config) return { success: false, message: "Invalid resource" };

      try {
        await API.delete(`${config.endpoint}/${id}`);
        patchResource(type, (current) => ({
          items: (current?.items || []).filter((item) => item._id !== id),
        }));
        return { success: true };
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message ||
            `Failed to delete ${config.label}`,
        };
      }
    },
    [patchResource]
  );

  const updateAttributeStatus = useCallback(
    async (type, id, isActive) => {
      const config = RESOURCE_CONFIG[type];
      if (!config) return { success: false, message: "Invalid resource" };

      try {
        const res = await API.patch(`${config.endpoint}/${id}/status`, {
          isActive,
        });
        patchResource(type, (current) => ({
          items: (current?.items || []).map((item) =>
            item._id === id ? { ...item, isActive } : item
          ),
        }));
        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message ||
            `Failed to update ${config.label} status`,
        };
      }
    },
    [patchResource]
  );

  return (
    <HorseAttributeContext.Provider
      value={{
        resources,
        fetchAttributes,
        createAttribute,
        updateAttribute,
        deleteAttribute,
        updateAttributeStatus,
      }}
    >
      {children}
    </HorseAttributeContext.Provider>
  );
};

export const useHorseAttributes = () => useContext(HorseAttributeContext);
