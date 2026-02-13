import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/layout/AdminLayout";
import Unauthorized from "../pages/Unauthorized";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

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
