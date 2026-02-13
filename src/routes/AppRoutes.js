import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import Shippers from "../pages/shippers/Shippers";
import Settings from "../pages/settings/Settings";
import Unauthorized from "../pages/Unauthorized";
import PrivateRoute from "./PrivateRoute";
import BreedList from "../pages/Breed/BreedList";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Private Routes */}
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

      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
