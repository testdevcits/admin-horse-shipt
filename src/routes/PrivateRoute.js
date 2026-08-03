import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/layout/AdminLayout";
import Unauthorized from "../pages/Unauthorized";
import PageLoader from "../components/common/PageLoader";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader text="Checking access..." fullScreen />;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <AdminLayout>
        <Unauthorized />
      </AdminLayout>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default PrivateRoute;
