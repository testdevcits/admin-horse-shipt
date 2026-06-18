import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import API from "../api/axios";

const TermsContext = createContext();

export const TermsProvider = ({ children }) => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

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

      const data = res.data.data || [];
      const paginationData = res.data.pagination || {};

      setTerms(data);
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || limit,
        totalPages: paginationData.totalPages || 1,
        total: paginationData.total || data.length,
      });

      return { data, pagination: paginationData };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch terms");
      return { data: [], pagination: { page, limit, totalPages: 1, total: 0 } };
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

        // Refresh the current page after creation
        await fetchTerms(pagination.page, pagination.limit);

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
    [fetchTerms, pagination.limit, pagination.page]
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

        // Refresh the current page after update
        await fetchTerms(pagination.page, pagination.limit);

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
    [fetchTerms, pagination.limit, pagination.page]
  );

  // =========================
  // DELETE TERM (PERMANENT)
  // =========================
  const deleteTerm = useCallback(
    async (id) => {
      try {
        setLoading(true);

        await API.delete(`/admin/terms-condition/${id}`);

        // Refresh the current page after deletion
        await fetchTerms(pagination.page, pagination.limit);

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
    [fetchTerms, pagination.limit, pagination.page]
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

        // Refresh the current page after status change
        await fetchTerms(pagination.page, pagination.limit);

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update status",
        };
      }
    },
    [fetchTerms, pagination.limit, pagination.page]
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

  return (
    <TermsContext.Provider
      value={{
        terms,
        loading,
        error,
        pagination,

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
