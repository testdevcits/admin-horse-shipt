import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import API from "../../api/axios";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const schema = Yup.object({
    otp: Yup.string().length(6).required(),
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
          <Form className="space-y-4">
            <Field
              name="otp"
              placeholder="Enter OTP"
              className="w-full px-4 py-3 border rounded-xl"
            />

            <Field
              name="newPassword"
              type="password"
              placeholder="New Password"
              className="w-full px-4 py-3 border rounded-xl"
            />

            <button className="w-full bg-system-primary text-white py-3 rounded-xl">
              Reset Password
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default ResetPassword;
