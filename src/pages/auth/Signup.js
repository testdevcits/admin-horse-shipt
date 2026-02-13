import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import logo from "../../assets/images/logo.png";
import Toast from "../../components/common/Toast";
import { Link } from "react-router-dom";

const Signup = () => {
  const { signup } = useAuth();
  const [toast, setToast] = useState(null);

  const schema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await signup(values);

      setToast({
        message: "Admin account created successfully",
        type: "success",
      });

      resetForm();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Signup failed",
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

      <div className="min-h-screen flex items-center justify-center bg-light px-4 font-montserrat">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <img
              src={logo}
              alt="Admin Logo"
              className="h-16 object-contain mb-3"
            />
            <h2 className="text-2xl font-bold text-systemText">Admin Signup</h2>
          </div>

          <Formik
            initialValues={{ name: "", email: "", password: "" }}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <div>
                  <Field
                    name="name"
                    placeholder="Full Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary"
                  />
                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-danger text-xs mt-1"
                  />
                </div>

                <div>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-danger text-xs mt-1"
                  />
                </div>

                <div>
                  <Field
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-danger text-xs mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-system-primary hover:bg-tabActive text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Admin"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/admin/login"
              className="text-system-primary font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
