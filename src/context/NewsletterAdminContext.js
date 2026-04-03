import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axios"; // your Axios instance

// Create context
export const NewsletterAdminContext = createContext();

// Provider component
export const NewsletterAdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null); // {id, role}
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [loading, setLoading] = useState(false);

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
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/horse-newsletter/subscribers");
      setLoading(false);
      return res.data; // {success, count, data}
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

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
    }
  };

  return (
    <NewsletterAdminContext.Provider
      value={{
        admin,
        token,
        loading,
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
