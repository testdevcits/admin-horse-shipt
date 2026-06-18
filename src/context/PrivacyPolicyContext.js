import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import API from "../api/axios";

const PrivacyPolicyContext = createContext();

export const PrivacyPolicyProvider = ({ children }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const { page: currentPage, limit: currentLimit } = pagination;

  // =========================
  // FETCH POLICIES (PAGINATED)
  // =========================
  const fetchPolicies = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get(
        `/admin/privacy-policy?page=${page}&limit=${limit}`
      );

      const data = res.data.data || [];
      const paginationData = res.data.pagination || {};

      setPolicies(data);
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || limit,
        totalPages: paginationData.totalPages || 1,
        total: paginationData.total || data.length,
      });

      return { data, pagination: paginationData };
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch privacy policies"
      );
      return { data: [], pagination: { page, limit, totalPages: 1, total: 0 } };
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // CREATE POLICY
  // =========================
  const createPolicy = useCallback(
    async (title, content) => {
      try {
        setLoading(true);

        const res = await API.post("/admin/privacy-policy", { title, content });

        // Refresh the current page after creation
        await fetchPolicies(currentPage, currentLimit);

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create policy",
        };
      } finally {
        setLoading(false);
      }
    },
    [currentLimit, currentPage, fetchPolicies]
  );

  // =========================
  // UPDATE POLICY
  // =========================
  const updatePolicy = useCallback(
    async (id, title, content) => {
      try {
        setLoading(true);

        const res = await API.patch(`/admin/privacy-policy/${id}`, {
          title,
          content,
        });

        // Refresh the current page after update
        await fetchPolicies(currentPage, currentLimit);

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update policy",
        };
      } finally {
        setLoading(false);
      }
    },
    [currentLimit, currentPage, fetchPolicies]
  );

  // =========================
  // DELETE POLICY (PERMANENT)
  // =========================
  const deletePolicy = useCallback(
    async (id) => {
      try {
        setLoading(true);

        await API.delete(`/admin/privacy-policy/${id}`);

        // Refresh the current page after deletion
        await fetchPolicies(currentPage, currentLimit);

        return { success: true };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to delete policy",
        };
      } finally {
        setLoading(false);
      }
    },
    [currentLimit, currentPage, fetchPolicies]
  );

  // =========================
  // TOGGLE ACTIVE STATUS
  // =========================
  const togglePolicyStatus = useCallback(
    async (id, isActive) => {
      try {
        const res = await API.patch(`/admin/privacy-policy/${id}/status`, {
          isActive,
        });

        // Refresh the current page after status change
        await fetchPolicies(currentPage, currentLimit);

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update status",
        };
      }
    },
    [currentLimit, currentPage, fetchPolicies]
  );

  // =========================
  // GET ACTIVE POLICIES (PUBLIC)
  // =========================
  const getPolicies = useCallback(async () => {
    try {
      const res = await API.get("/privacy-policy");
      return res.data.data || [];
    } catch (err) {
      console.error("Fetch active policy error:", err);
      return [];
    }
  }, []);

  return (
    <PrivacyPolicyContext.Provider
      value={{
        policies,
        loading,
        error,
        pagination,

        // actions
        fetchPolicies,
        createPolicy,
        updatePolicy,
        deletePolicy,
        togglePolicyStatus,
        getPolicies,
      }}
    >
      {children}
    </PrivacyPolicyContext.Provider>
  );
};

export const usePrivacyPolicies = () => useContext(PrivacyPolicyContext);
