import React, { createContext, useContext, useState, useCallback } from "react";

import API from "../api/axios";
import Toast from "../components/common/Toast";

const StripeAdminContext = createContext();

export const StripeAdminProvider = ({ children }) => {
  const [balance, setBalance] = useState(null);
  const [transferAvailability, setTransferAvailability] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionPagination, setTransactionPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  });

  const [loading, setLoading] = useState(false);
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
      const message =
        err.response?.data?.message || "Failed to fetch Stripe balance";

      setToast({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
       FETCH TRANSFER AVAILABILITY
    ========================= */
  const fetchTransferAvailability = useCallback(async (filters = {}) => {
    try {
      setLoading(true);

      const res = await API.get("/admin/stripe/transfer-availability", {
        params: {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
      });

      setTransferAvailability(res.data.data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to fetch transfer availability report";

      setToast({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
       FETCH STRIPE TRANSACTIONS
    ========================= */
  const fetchStripeTransactions = useCallback(async (range = "all", filters = {}) => {
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
      const message =
        err.response?.data?.message || "Failed to fetch transactions";

      setToast({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <StripeAdminContext.Provider
      value={{
        balance,
        transferAvailability,
        transactions,
        transactionPagination,
        loading,
        fetchStripeBalance,
        fetchTransferAvailability,
        fetchStripeTransactions,
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

export const useStripeAdmin = () => useContext(StripeAdminContext);
