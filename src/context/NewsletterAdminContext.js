import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "../api/axios"; // your Axios instance

// Create context
export const NewsletterAdminContext = createContext();

// Provider component
export const NewsletterAdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null); // {id, role}
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [loading, setLoading] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [summary, setSummary] = useState({
    totalSubscribers: 0,
    verifiedSubscribers: 0,
    unverifiedSubscribers: 0,
  });
  const cacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());

  // Automatically set Authorization header in Axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // ---------------- Auth Functions ----------------
  const login = (token, adminInfo) => {
    setToken(token);
    localStorage.setItem("adminToken", token);
    setAdmin(adminInfo);
  };

  const logout = () => {
    setToken("");
    setAdmin(null);
    localStorage.removeItem("adminToken");
  };

  // ---------------- Newsletter Functions ----------------
  // Fetch all subscribers
  const clearSubscribersCache = useCallback(() => {
    cacheRef.current.clear();
    inFlightRef.current.clear();
  }, []);

  const fetchSubscribers = useCallback(async (filters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      search: filters.search?.trim() || undefined,
      status: filters.status || undefined,
    };
    const cacheKey = JSON.stringify(params);

    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setSubscribers(cached.data || []);
      setPagination(
        cached.pagination || {
          page: params.page,
          limit: params.limit,
          total: 0,
          totalPages: 1,
        }
      );
      setSummary(
        cached.summary || {
          totalSubscribers: 0,
          verifiedSubscribers: 0,
          unverifiedSubscribers: 0,
        }
      );
      return cached.raw;
    }

    if (inFlightRef.current.has(cacheKey)) {
      return inFlightRef.current.get(cacheKey);
    }

    try {
      setLoading(true);
      const request = axios
        .get("/admin/horse-newsletter/subscribers", { params })
        .then((res) => {
          const payload = res.data || {};
          const list = Array.isArray(payload.data) ? payload.data : [];
          const nextPagination = payload.pagination || {
            page: params.page,
            limit: params.limit,
            total: payload.total || list.length,
            totalPages: 1,
          };
          const nextSummary = payload.summary || {
            totalSubscribers: payload.total || list.length,
            verifiedSubscribers: list.filter((item) => item.isVerified).length,
            unverifiedSubscribers: list.filter((item) => !item.isVerified)
              .length,
          };

          setSubscribers(list);
          setPagination(nextPagination);
          setSummary(nextSummary);
          cacheRef.current.set(cacheKey, {
            data: list,
            pagination: nextPagination,
            summary: nextSummary,
            raw: payload,
          });

          return payload;
        })
        .finally(() => {
          inFlightRef.current.delete(cacheKey);
          setLoading(false);
        });

      inFlightRef.current.set(cacheKey, request);
      return await request;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  const deleteSubscriber = async (idOrIds) => {
    try {
      setLoading(true);

      let res;
      if (Array.isArray(idOrIds) && idOrIds.length > 0) {
        res = await axios.delete("/admin/horse-newsletter/delete/subscribers", {
          data: { ids: idOrIds },
        });
      } else if (idOrIds) {
        // Single delete: send ID in URL
        res = await axios.delete(
          `/admin/horse-newsletter/subscribers/${idOrIds}`
        );
      } else {
        throw new Error("No subscriber ID(s) provided");
      }

      clearSubscribersCache();
      setLoading(false);
      return res.data; // { success, message }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Send newsletter to all subscribers
  const sendNewsletter = async (payload) => {
    try {
      setLoading(true);
      // payload = { subject, message, htmlContent, recipients: [] }
      const res = await axios.post("/admin/horse-newsletter/send", {
        subject: payload.subject,
        message: payload.message,
        htmlContent: payload.htmlContent,
        recipients: payload.recipients,
      });

      return res.data; // {success, message, sentCount}
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <NewsletterAdminContext.Provider
      value={{
        admin,
        token,
        loading,
        subscribers,
        pagination,
        summary,
        login,
        logout,
        fetchSubscribers,
        deleteSubscriber,
        sendNewsletter,
      }}
    >
      {children}
    </NewsletterAdminContext.Provider>
  );
};
