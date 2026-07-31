import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import API from "../api/axios";
import Toast from "../components/common/Toast";

const StripeAdminContext = createContext();

export const StripeAdminProvider = ({ children }) => {
  /* =========================
      STATES
  ========================= */
  const [balance, setBalance] = useState(null);
  const [transferAvailability, setTransferAvailability] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [subscriptionProduct, setSubscriptionProduct] = useState([]);

  const [transactionPagination, setTransactionPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  });

  const [loading, setLoading] = useState(false);
  const [creatingPrice, setCreatingPrice] = useState(false);
  const [updatingPrice, setUpdatingPrice] = useState(false);

  const [toast, setToast] = useState(null);

  /* =========================
      FETCH STRIPE BALANCE
  ========================= */
  const fetchStripeBalance = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/stripe/balance");

      setBalance(res.data.data);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to fetch Stripe balance",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
      FETCH TRANSFER REPORT
  ========================= */
  const fetchTransferAvailability = useCallback(async (filters = {}) => {
    try {
      setLoading(true);

      const res = await API.get(
        "/admin/stripe/transfer-availability",
        {
          params: {
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
          },
        }
      );

      setTransferAvailability(res.data.data);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to fetch transfer availability.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
      FETCH TRANSACTIONS
  ========================= */
  const fetchStripeTransactions = useCallback(
    async (range = "all", filters = {}) => {
      try {
        setLoading(true);

        const res = await API.get("/admin/stripe/transactions", {
          params: {
            range,
            page: filters.page || 1,
            limit: filters.limit || 10,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
          },
        });

        setTransactions(res.data.data || []);

        setTransactionPagination(
          res.data.pagination || {
            page: filters.page || 1,
            limit: filters.limit || 10,
            totalPages: 1,
            totalRecords: 0,
          }
        );
      } catch (err) {
        setToast({
          type: "error",
          message:
            err.response?.data?.message ||
            "Failed to fetch transactions.",
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =========================
      FETCH SUBSCRIPTION PRODUCTS
  ========================= */
  const fetchSubscriptionProduct = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get(
        "/admin/stripe/subscription-products"
      );

      setSubscriptionProduct(res.data.data || []);

      return {
        success: true,
        data: res.data.data,
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to fetch subscription products.";

      setToast({
        type: "error",
        message,
      });

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
      CREATE SUBSCRIPTION PRICE
  ========================= */
  const createSubscriptionPrice = useCallback(
    async (payload) => {
      try {
        setCreatingPrice(true);

        const res = await API.post(
          "/admin/stripe/subscription-price",
          payload
        );

        setToast({
          type: "success",
          message: res.data.message,
        });

        await fetchSubscriptionProduct();

        return {
          success: true,
          data: res.data.data,
        };
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Failed to create subscription price.";

        setToast({
          type: "error",
          message,
        });

        return {
          success: false,
          message,
        };
      } finally {
        setCreatingPrice(false);
      }
    },
    [fetchSubscriptionProduct]
  );

  /* =========================
      UPDATE SUBSCRIPTION PRICE
  ========================= */
  const updateSubscriptionPrice = useCallback(
    async (priceId, payload) => {
      try {
        setUpdatingPrice(true);

        const res = await API.put(
          `/admin/stripe/subscription-price/${priceId}`,
          payload
        );

        setToast({
          type: "success",
          message: res.data.message,
        });

        await fetchSubscriptionProduct();

        return {
          success: true,
          data: res.data.data,
        };
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Failed to update subscription price.";

        setToast({
          type: "error",
          message,
        });

        return {
          success: false,
          message,
        };
      } finally {
        setUpdatingPrice(false);
      }
    },
    [fetchSubscriptionProduct]
  );


  const deactivateSubscriptionPrice = useCallback(async (priceId) => {
  try {
    const res = await API.patch(
      `/admin/stripe/subscription-price/${priceId}/deactivate`
    );

    setToast({
      type: "success",
      message: res.data.message,
    });

    await fetchSubscriptionProduct();

    return {
      success: true,
    };
  } catch (err) {
    const message =
      err.response?.data?.message ||
      "Failed to deactivate price.";

    setToast({
      type: "error",
      message,
    });

    return {
      success: false,
      message,
    };
  }
}, [fetchSubscriptionProduct]);

  return (
    <StripeAdminContext.Provider
      value={{
  // Data
  balance,
  transferAvailability,
  transactions,
  subscriptionProduct,
  transactionPagination,

  // Loading
  loading,
  creatingPrice,
  updatingPrice,

  // Stripe
  fetchStripeBalance,
  fetchTransferAvailability,
  fetchStripeTransactions,

  // Subscription
  fetchSubscriptionProduct,
  createSubscriptionPrice,
  updateSubscriptionPrice,
  deactivateSubscriptionPrice,
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
    </StripeAdminContext.Provider>
  );
};

export const useStripeAdmin = () =>
  useContext(StripeAdminContext);