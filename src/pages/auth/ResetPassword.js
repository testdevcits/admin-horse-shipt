import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import API from "../../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ResetPassword = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const normalizeOtp = (value = "") => value.replace(/\D/g, "").slice(0, 6);

  const schema = Yup.object({
    otp: Yup.string()
      .matches(/^\d{6}$/, "OTP must be 6 digits")
      .required("OTP is required"),
    newPassword: Yup.string().min(6).required(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await API.post("/admin/reset-password", {
        email: state.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });

      alert("Password reset successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-center">Reset Password</h2>

        <Formik
          initialValues={{ otp: "", newPassword: "" }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="space-y-4">
              <Field
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                onChange={(event) =>
                  setFieldValue("otp", normalizeOtp(event.target.value))
                }
                onPaste={(event) => {
                  event.preventDefault();
                  setFieldValue(
                    "otp",
                    normalizeOtp(event.clipboardData.getData("text"))
                  );
                }}
                className="w-full px-4 py-3 border rounded-xl"
              />

              <div className="relative">
                <Field
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="w-full px-4 py-3 pr-11 border rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <button className="w-full bg-system-primary text-white py-3 rounded-xl">
                Reset Password
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ResetPassword;
