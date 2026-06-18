import React, { useEffect, useState } from "react";
import { FiLock, FiMail, FiSave, FiShield, FiUser } from "react-icons/fi";
import Toast from "../../components/common/Toast";
import { useAuth } from "../../context/AuthContext";

const Field = ({ label, icon, children }) => (
  <label className="block">
    <span className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
      {icon}
      {label}
    </span>
    {children}
  </label>
);

const AdminProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [toast, setToast] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      await updateProfile(profileForm);
      setToast({ type: "success", message: "Profile updated successfully" });
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      setToast({
        type: "error",
        message: "New password must be at least 6 characters",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({
        type: "error",
        message: "New password and confirm password do not match",
      });
      return;
    }

    setSavingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setToast({ type: "success", message: "Password updated successfully" });
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to update password",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 font-montserrat">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#BF9B53]">
          Admin Account
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
          Manage your admin identity, email address, and password.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#BF9B53]/10 text-[#BF9B53]">
              <FiUser size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Profile Details
              </h2>
              <p className="text-sm text-gray-500">
                These details are used in the admin dashboard.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Field label="Name" icon={<FiUser />}>
              <input
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                required
              />
            </Field>

            <Field label="Email" icon={<FiMail />}>
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                required
              />
            </Field>

            <div className="rounded-md border border-gray-100 bg-slate-50 p-3 dark:border-gray-800 dark:bg-gray-950">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                <FiShield />
                Role
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-gray-900 dark:text-white">
                {user?.role || "admin"}
              </p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-md bg-[#BF9B53] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#997C42] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave />
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#BF9B53]/10 text-[#BF9B53]">
              <FiLock size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Security
              </h2>
              <p className="text-sm text-gray-500">
                Update your password for this admin account.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {[
              ["currentPassword", "Current Password"],
              ["newPassword", "New Password"],
              ["confirmPassword", "Confirm Password"],
            ].map(([name, label]) => (
              <Field key={name} label={label} icon={<FiLock />}>
                <input
                  type="password"
                  value={passwordForm[name]}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      [name]: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  required
                />
              </Field>
            ))}

            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-[#4C3E21] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#BF9B53] dark:hover:bg-[#997C42]"
            >
              <FiLock />
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminProfile;
