import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import API from "../api/axios";

const BreedContext = createContext();

export const BreedProvider = ({ children }) => {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);

  // =========================
  // FETCH BREEDS (PAGINATED)
  // =========================
  const fetchBreeds = useCallback(
    async (newPage = 1) => {
      try {
        if (newPage === 1) setLoading(true);
        else setFetchingMore(true);

        const res = await API.get(
          `/admin/breeds?page=${newPage}&limit=${limit}`
        );
        const { data, totalPages: tp } = res.data;

        if (newPage === 1) setBreeds(data || []);
        else setBreeds((prev) => [...prev, ...(data || [])]);

        setPage(newPage);
        setTotalPages(tp || 1);
        setHasFetched(true);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch breeds");
        setHasFetched(true);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [limit]
  );

  // =========================
  // CREATE BREED
  // =========================
  const createBreed = useCallback(async (name) => {
    try {
      setLoading(true);
      const res = await API.post("/admin/breeds", { name });
      setBreeds((prev) => [res.data.data, ...prev]);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create breed",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // DELETE BREED
  // =========================
  const deleteBreed = useCallback(async (id) => {
    try {
      await API.delete(`/admin/breeds/${id}`);
      setBreeds((prev) => prev.filter((b) => b._id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete breed",
      };
    }
  }, []);

  // =========================
  // ACTIVATE / DEACTIVATE
  // =========================
  const updateBreedStatus = useCallback(async (id, isActive) => {
    try {
      const res = await API.patch(`/admin/breeds/${id}/status`, { isActive });
      setBreeds((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isActive } : b))
      );
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update status",
      };
    }
  }, []);

  return (
    <BreedContext.Provider
      value={{
        breeds,
        loading,
        error,
        hasFetched,
        page,
        totalPages,
        fetchingMore,
        fetchBreeds,
        createBreed,
        deleteBreed,
        updateBreedStatus,
      }}
    >
      {children}
    </BreedContext.Provider>
  );
};

export const useBreeds = () => useContext(BreedContext);
