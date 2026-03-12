import React, { createContext, useContext, useState, useCallback } from "react";

import API from "../api/axios";
import Toast from "../components/common/Toast";

const StripeAdminContext = createContext();

export const StripeAdminProvider = ({ children }) => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);

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
       FETCH STRIPE TRANSACTIONS
    ========================= */
  const fetchStripeTransactions = useCallback(async (range = "all") => {
    try {
      setLoading(true);

      const res = await API.get(`/admin/stripe/transactions?range=${range}`);

      setTransactions(res.data.data || []);
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
        transactions,
        loading,
        fetchStripeBalance,
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
