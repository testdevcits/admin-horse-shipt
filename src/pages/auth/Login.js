import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import logo from "../../assets/images/logo.png";
import Toast from "../../components/common/Toast";
import { Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const [toast, setToast] = useState(null);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Invalid email or password",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-light font-montserrat px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={logo}
              alt="Admin Logo"
              className="h-16 object-contain mb-3"
            />
            <h2 className="text-2xl font-bold text-systemText">Admin Login</h2>
          </div>

          {/* Form */}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-systemText mb-2">
                    Email Address
                  </label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="admin@horseshipt.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-danger text-xs mt-1"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-systemText mb-2">
                    Password
                  </label>
                  <Field
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-danger text-xs mt-1"
                  />

                  {/* Forgot Password Link */}
                  <div className="text-right mt-2">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-system-primary hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-system-primary hover:bg-tabActive text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </Form>
            )}
          </Formik>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-8">
            © {new Date().getFullYear()} Horse-Shipt Admin Panel
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
