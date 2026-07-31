import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
// PrivateRoute Wrapper
import PrivateRoute from "./PrivateRoute";
import SubscriptionSettings from "../pages/settings/SubscriptionSettings";
// Auth Pages
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

// Dashboard & Admin Pages
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Shippers = lazy(() => import("../pages/shippers/Shippers"));
const ShipperDetail = lazy(() => import("../pages/shippers/ShipperDetail"));
const Customers = lazy(() => import("../pages/customers/Customers"));
const CustomerDetail = lazy(() => import("../pages/customers/CustomerDetail"));
const Shipments = lazy(() => import("../pages/shipments/Shipments"));
const ShipmentDetail = lazy(() => import("../pages/shipments/ShipmentDetail"));
const Settings = lazy(() => import("../pages/settings/Settings"));
const AdminProfile = lazy(() => import("../pages/profile/AdminProfile"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));
const NewsletterSubscribers = lazy(() =>
  import("../pages/Newsletter/NewsletterSubscribers")
);
const AdminNotifications = lazy(() =>
  import("../pages/notifications/AdminNotifications")
);

// Breed & Platform
const BreedList = lazy(() => import("../pages/Breed/BreedList"));
const PlatformSettings = lazy(() =>
  import("../pages/Platform/PlatformSettings")
);
const StripePayments = lazy(() => import("../pages/Platform/StripePayments"));

// Legal Pages
const PrivacyPolicyList = lazy(() =>
  import("../pages/Legal/PrivacyPolicyList")
);
const TermsConditionList = lazy(() =>
  import("../pages/Legal/TermsConditionList")
);



const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* =========================
            PRIVATE ROUTES
        ========================= */}

        <Route
  path="/subscription-settings"
  element={
    <PrivateRoute>
      <SubscriptionSettings />
    </PrivateRoute>
  }
/>

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
          path="/shippers/:id"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <ShipperDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <Customers />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <CustomerDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/shipments"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <Shipments />
            </PrivateRoute>
          }
        />
        <Route
          path="/shipments/:id"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <ShipmentDetail />
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
          path="/platform-settings"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <PlatformSettings />
            </PrivateRoute>
          }
        />

        <Route
          path="/stripe-payments"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <StripePayments />
            </PrivateRoute>
          }
        />

        {/* =========================
            LEGAL PAGES
        ========================= */}
        <Route
          path="/privacy-policy"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <PrivacyPolicyList />
            </PrivateRoute>
          }
        />

        <Route
          path="/terms-conditions"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <TermsConditionList />
            </PrivateRoute>
          }
        />
        <Route
          path="/newsletter-subscribers"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <NewsletterSubscribers />
            </PrivateRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <AdminNotifications />
            </PrivateRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <AdminProfile />
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

        {/* UNAUTHORIZED */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
