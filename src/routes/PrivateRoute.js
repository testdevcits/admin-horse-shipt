import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/layout/AdminLayout";
import Unauthorized from "../pages/Unauthorized";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Agar login nahi kiya, toh login page par bhej do
  if (!user) return <Navigate to="/login" />;

  // Agar role allowed nahi hai, toh Unauthorized dikhao
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <AdminLayout>
        <Unauthorized />
      </AdminLayout>
    );
  }

  // Otherwise, page dikhao with layout
  return <AdminLayout>{children}</AdminLayout>;
};

export default PrivateRoute;
