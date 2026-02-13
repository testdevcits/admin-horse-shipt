import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/layout/AdminLayout";
import Unauthorized from "../pages/Unauthorized";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Optional: loading state handle karo (optional)
  if (loading) return <div>Loading...</div>; // ya spinner

  // Agar login nahi hai, login page bhej do
  if (!user) return <Navigate to="/login" />;

  // Agar role restricted hai aur user ka role allowed nahi → Unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <AdminLayout>
        <Unauthorized />
      </AdminLayout>
    );
  }

  // Otherwise → page dikhao
  return <AdminLayout>{children}</AdminLayout>;
};

export default PrivateRoute;
