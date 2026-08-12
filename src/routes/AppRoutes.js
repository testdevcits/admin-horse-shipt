import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
// PrivateRoute Wrapper
import PrivateRoute from "./PrivateRoute";
import SubscriptionSettings from "../pages/settings/SubscriptionSettings";
import PageLoader from "../components/common/PageLoader";
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
const AdminUsers = lazy(() => import("../pages/adminUsers/AdminUsers"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));
const NewsletterSubscribers = lazy(() =>
  import("../pages/Newsletter/NewsletterSubscribers")
);
const AdminNotifications = lazy(() =>
  import("../pages/notifications/AdminNotifications")
);

// Breed & Platform
const BreedList = lazy(() => import("../pages/Breed/BreedList"));
const ColorList = lazy(() => import("../pages/HorseAttributes/ColorList"));
const SexList = lazy(() => import("../pages/HorseAttributes/SexList"));
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
    <Suspense fallback={<PageLoader text="Loading, please wait..." fullScreen />}>
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
    <PrivateRoute permission="platform:manage">
      <SubscriptionSettings />
    </PrivateRoute>
  }
/>

        <Route
          path="/dashboard"
          element={
            <PrivateRoute permission="dashboard:view">
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/shippers"
          element={
            <PrivateRoute permission="shippers:view">
              <Shippers />
            </PrivateRoute>
          }
        />
        <Route
          path="/shippers/:id"
          element={
            <PrivateRoute permission="shippers:view">
              <ShipperDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <PrivateRoute permission="customers:view">
              <Customers />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <PrivateRoute permission="customers:view">
              <CustomerDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/shipments"
          element={
            <PrivateRoute permission="shipments:view">
              <Shipments />
            </PrivateRoute>
          }
        />
        <Route
          path="/shipments/:id"
          element={
            <PrivateRoute permission="shipments:view">
              <ShipmentDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/breeds"
          element={
            <PrivateRoute permission="horse_attributes:manage">
              <BreedList />
            </PrivateRoute>
          }
        />

        <Route
          path="/colors"
          element={
            <PrivateRoute permission="horse_attributes:manage">
              <ColorList />
            </PrivateRoute>
          }
        />

        <Route
          path="/sexes"
          element={
            <PrivateRoute permission="horse_attributes:manage">
              <SexList />
            </PrivateRoute>
          }
        />

        <Route
          path="/platform-settings"
          element={
            <PrivateRoute permission="platform:manage">
              <PlatformSettings />
            </PrivateRoute>
          }
        />

        <Route
          path="/stripe-payments"
          element={
            <PrivateRoute permission="platform:manage">
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
            <PrivateRoute permission="legal:manage">
              <PrivacyPolicyList />
            </PrivateRoute>
          }
        />

        <Route
          path="/terms-conditions"
          element={
            <PrivateRoute permission="legal:manage">
              <TermsConditionList />
            </PrivateRoute>
          }
        />
        <Route
          path="/newsletter-subscribers"
          element={
            <PrivateRoute permission="newsletter:manage">
              <NewsletterSubscribers />
            </PrivateRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <PrivateRoute permission="notifications:view">
              <AdminNotifications />
            </PrivateRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/profile"
          element={
            <PrivateRoute permission="account:manage">
              <AdminProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin-users"
          element={
            <PrivateRoute allowedRoles={["super-admin"]}>
              <AdminUsers />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute permission="account:manage">
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
