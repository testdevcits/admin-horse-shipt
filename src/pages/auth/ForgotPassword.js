import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/common/Toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ForgotPassword = () => {
  const { forgotPassword, verifyOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // email | otp | reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // store verified OTP
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const normalizeOtp = (value = "") => value.replace(/\D/g, "").slice(0, 6);

  // =====================
  // Email Schema
  // =====================
  const emailSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  // =====================
  // OTP Schema
  // =====================
  const otpSchema = Yup.object({
    otp: Yup.string()
      .matches(/^\d{6}$/, "OTP must be 6 digits")
      .required("OTP is required"),
  });

  // =====================
  // Password Schema
  // =====================
  const passwordSchema = Yup.object({
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  // =====================
  // Send OTP
  // =====================
  const handleSendOtp = async (values, { setSubmitting }) => {
    try {
      await forgotPassword(values.email);
      setEmail(values.email);
      setOtp("");
      setStep("otp");
      setToast({ message: "OTP sent successfully", type: "success" });
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Failed to send OTP",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =====================
  // Verify OTP
  // =====================
  const handleVerifyOtp = async (values, { setSubmitting }) => {
    try {
      await verifyOtp(email, values.otp);
      setOtp(values.otp); // save verified OTP
      setStep("reset");
      setToast({ message: "OTP verified successfully", type: "success" });
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Invalid OTP",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =====================
  // Reset Password
  // =====================
  const handleResetPassword = async (values, { setSubmitting }) => {
    try {
      if (!otp) {
        setStep("otp");
        setToast({
          message: "Please verify OTP before resetting password",
          type: "error",
        });
        return;
      }

      await resetPassword({
        email,
        otp, // use verified OTP from state
        newPassword: values.newPassword,
      });

      setToast({
        message: "Password reset successfully. Please login.",
        type: "success",
      });
      setTimeout(() => navigate("/admin/login"), 1500);
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Failed to reset password",
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

      <div className="min-h-screen flex items-center justify-center bg-light px-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-xl font-bold mb-6 text-center">
            {step === "email"
              ? "Forgot Password"
              : step === "otp"
              ? "Verify OTP"
              : "Reset Password"}
          </h2>

          {/* ================= SEND OTP ================= */}
          {step === "email" && (
            <Formik
              initialValues={{ email: "" }}
              validationSchema={emailSchema}
              onSubmit={handleSendOtp}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <Field
                      name="email"
                      placeholder="Enter registered email"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary"
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-danger text-xs mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-system-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send OTP"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* ================= VERIFY OTP ================= */}
          {step === "otp" && (
            <Formik
              initialValues={{ otp: "" }}
              validationSchema={otpSchema}
              onSubmit={handleVerifyOtp}
            >
              {({ isSubmitting, setFieldValue }) => (
                <Form className="space-y-4">
                  <div>
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
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary"
                    />
                    <ErrorMessage
                      name="otp"
                      component="p"
                      className="text-danger text-xs mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-system-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? "Verifying..." : "Verify OTP"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* ================= RESET PASSWORD ================= */}
          {step === "reset" && otp && (
            <Formik
              initialValues={{ newPassword: "", confirmPassword: "" }}
              validationSchema={passwordSchema}
              onSubmit={handleResetPassword}
            >
              {({ isSubmitting, values }) => (
                <Form className="space-y-4">
                  <div>
                    <div className="relative">
                      <Field
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    <ErrorMessage
                      name="newPassword"
                      component="p"
                      className="text-danger text-xs mt-1"
                    />
                  </div>

                  <div>
                    <div className="relative">
                      <Field
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 pr-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="confirmPassword"
                      component="p"
                      className="text-danger text-xs mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !values.newPassword ||
                      !values.confirmPassword
                    }
                    className="w-full bg-system-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
