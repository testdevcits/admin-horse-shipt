import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // logged-in admin
  const [loading, setLoading] = useState(true);

  // ==================================================
  //  Fetch Admin Profile (JWT Protected)
  // ==================================================
  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("No token found");

      const res = await API.get("/admin/profile");
      setUser(res.data.admin);
      // Save admin info to localStorage
      localStorage.setItem("adminData", JSON.stringify(res.data.admin));
    } catch (error) {
      console.error("Auth error:", error);
      logout(); // invalid or expired token
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================================================
  //  Check login on app load
  // ==================================================
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

  // ==================================================
  //  Login
  // ==================================================
  const login = async (email, password) => {
    const res = await API.post("/admin/login", { email, password });
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("adminData", JSON.stringify(res.data.admin)); // save user info
    setUser(res.data.admin);
    return res.data;
  };

  // ==================================================
  //  Signup (Admin / Internal use)
  // ==================================================
  const signup = async (data) => {
    const res = await API.post("/admin/signup", data);
    return res.data;
  };

  // ==================================================
  //  Logout
  // ==================================================
  const logout = async () => {
    try {
      await API.post("/admin/logout");
    } catch (error) {
      // ignore backend failure
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData"); // remove stored user
      setUser(null);
    }
  };

  // ==================================================
  //  Change Password (Logged-in Admin)
  // ==================================================
  const changePassword = async (data) => {
    const res = await API.post("/admin/change-password", data);
    return res.data;
  };

  // ==================================================
  //  Forgot Password (Send OTP)
  // ==================================================
  const forgotPassword = async (email) => {
    const res = await API.post("/admin/forgot-password", { email });
    return res.data; // contains success message
  };

  // ==================================================
  //  Verify OTP before allowing reset
  // ==================================================
  const verifyOtp = async (email, otp) => {
    try {
      const res = await API.post("/admin/verify-otp", { email, otp });
      return res.data; // returns success if OTP is valid
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message: "OTP verification failed",
        }
      );
    }
  };

  // ==================================================
  //  Reset Password (Using OTP)
  // ==================================================
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
