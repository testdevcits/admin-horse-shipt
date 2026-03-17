import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import API from "../api/axios";

const TermsContext = createContext();

export const TermsProvider = ({ children }) => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // FETCH TERMS (PAGINATED)
  // =========================
  const fetchTerms = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get(
        `/admin/terms-condition?page=${page}&limit=${limit}`
      );
      setTerms(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch terms");
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // CREATE TERM
  // =========================
  const createTerm = useCallback(
    async (title, content) => {
      try {
        setLoading(true);

        const res = await API.post("/admin/terms-condition", {
          title,
          content,
        });

        // Refresh the list after creation
        await fetchTerms();

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to create term",
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchTerms]
  );

  // =========================
  // UPDATE TERM
  // =========================
  const updateTerm = useCallback(
    async (id, title, content) => {
      try {
        setLoading(true);

        const res = await API.patch(`/admin/terms-condition/${id}`, {
          title,
          content,
        });

        // Refresh the list after update
        await fetchTerms();

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update term",
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchTerms]
  );

  // =========================
  // DELETE TERM (PERMANENT)
  // =========================
  const deleteTerm = useCallback(
    async (id) => {
      try {
        setLoading(true);

        await API.delete(`/admin/terms-condition/${id}`);

        // Refresh the list after deletion
        await fetchTerms();

        return { success: true };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to delete term",
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchTerms]
  );

  // =========================
  // TOGGLE ACTIVE STATUS
  // =========================
  const toggleTermStatus = useCallback(
    async (id, isActive) => {
      try {
        const res = await API.patch(`/admin/terms-condition/${id}/status`, {
          isActive,
        });

        // Refresh the list after status change
        await fetchTerms();

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update status",
        };
      }
    },
    [fetchTerms]
  );

  // =========================
  // GET ACTIVE TERMS (PUBLIC)
  // =========================
  const getActiveTerms = useCallback(async () => {
    try {
      const res = await API.get("/terms-condition/active");
      return res.data.data || [];
    } catch (err) {
      console.error("Fetch active terms error:", err);
      return [];
    }
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  return (
    <TermsContext.Provider
      value={{
        terms,
        loading,
        error,

        // actions
        fetchTerms,
        createTerm,
        updateTerm,
        deleteTerm,
        toggleTermStatus,
        getActiveTerms,
      }}
    >
      {children}
    </TermsContext.Provider>
  );
};

export const useTerms = () => useContext(TermsContext);
