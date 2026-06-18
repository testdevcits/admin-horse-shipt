import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // logged-in admin
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // navigate hook for redirects

  // ================= FETCH PROFILE =================
  const logout = useCallback(async () => {
    try {
      await API.post("/admin/logout");
    } catch (error) {
      // ignore backend failure
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      setUser(null);
      navigate("/"); // redirect to login
    }
  }, [navigate]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("No token found");

      const res = await API.get("/admin/profile");
      setUser(res.data.admin);
      localStorage.setItem("adminData", JSON.stringify(res.data.admin));
    } catch (error) {
      console.error("Auth error:", error);
      logout(); // proper dependency included
    } finally {
      setLoading(false);
    }
  }, [logout]); // ESLint warning fix

  // ================= CHECK LOGIN ON APP LOAD =================
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const storedUser = localStorage.getItem("adminData");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  // ================= LOGIN =================
  const login = async (email, password) => {
    const res = await API.post("/admin/login", { email, password });
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("adminData", JSON.stringify(res.data.admin));
    setUser(res.data.admin);

    navigate("/dashboard"); // redirect after login
    return res.data;
  };

  // ================= SIGNUP =================
  const signup = async (data) => {
    const res = await API.post("/admin/signup", data);
    return res.data;
  };

  // ================= CHANGE PASSWORD =================
  const changePassword = async (data) => {
    const res = await API.post("/admin/change-password", data);
    return res.data;
  };

  const updateProfile = async (data) => {
    const res = await API.put("/admin/profile", data);
    localStorage.setItem("adminData", JSON.stringify(res.data.admin));
    setUser(res.data.admin);
    return res.data;
  };

  // ================= FORGOT PASSWORD =================
  const forgotPassword = async (email) => {
    const res = await API.post("/admin/forgot-password", { email });
    return res.data;
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async (email, otp) => {
    try {
      const res = await API.post("/admin/verify-otp", { email, otp });
      return res.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "OTP verification failed",
        }
      );
    }
  };

  // ================= RESET PASSWORD =================
  const resetPassword = async ({ email, otp, newPassword }) => {
    const res = await API.post("/admin/reset-password", {
      email,
      otp,
      newPassword,
    });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        fetchProfile,
        updateProfile,
        changePassword,
        forgotPassword,
        verifyOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
