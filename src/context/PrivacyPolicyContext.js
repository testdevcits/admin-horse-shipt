import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import API from "../api/axios";

const PrivacyPolicyContext = createContext();

export const PrivacyPolicyProvider = ({ children }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setPolicies(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch privacy policies"
      );
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

        // Refresh the list after creation
        await fetchPolicies();

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
    [fetchPolicies]
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

        // Refresh the list after update
        await fetchPolicies();

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
    [fetchPolicies]
  );

  // =========================
  // DELETE POLICY (PERMANENT)
  // =========================
  const deletePolicy = useCallback(
    async (id) => {
      try {
        setLoading(true);

        await API.delete(`/admin/privacy-policy/${id}`);

        // Refresh the list after deletion
        await fetchPolicies();

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
    [fetchPolicies]
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

        // Refresh the list after status change
        await fetchPolicies();

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update status",
        };
      }
    },
    [fetchPolicies]
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

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return (
    <PrivacyPolicyContext.Provider
      value={{
        policies,
        loading,
        error,

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
