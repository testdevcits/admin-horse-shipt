import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import Shippers from "../pages/shippers/Shippers";
import Settings from "../pages/settings/Settings";
import Unauthorized from "../pages/Unauthorized";
import PrivateRoute from "./PrivateRoute";
import { useAuth } from "../context/AuthContext";
import BreedList from "../pages/Breed/BreedList";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* =====================
          AUTH ROUTES
      ====================== */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to="/" /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={user ? <Navigate to="/" /> : <ResetPassword />}
      />

      {/* PROTECTED ROUTES */}

      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/shippers"
        element={
          <PrivateRoute allowedRoles={["super-admin"]}>
            <Shippers />
          </PrivateRoute>
        }
      />

      <Route
        path="/breeds"
        element={
          <PrivateRoute allowedRoles={["super-admin"]}>
            <BreedList />
          </PrivateRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <PrivateRoute allowedRoles={["super-admin"]}>
            <Settings />
          </PrivateRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* =====================
          FALLBACK
      ====================== */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
