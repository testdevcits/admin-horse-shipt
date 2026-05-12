import React, { useState } from "react";
import {
  FiCheckCircle,
  FiLock,
  FiMail,
  FiMoon,
  FiShield,
  FiSun,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Toast from "../../components/common/Toast";

const SettingsCard = ({ title, description, icon, children }) => (
  <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#BF9B53]/10 text-[#BF9B53]">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    {children}
  </section>
);

const InfoRow = ({ label, value }) => (
  <div className="rounded-md border border-gray-100 bg-slate-50 p-3 dark:border-gray-800 dark:bg-gray-950">
    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">
      {value || "N/A"}
    </p>
  </div>
);

const Settings = () => {
  const { user, changePassword, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const storedTheme = darkMode ? "dark" : "light";

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwords.newPassword.length < 6) {
      setToast({ type: "error", message: "New password must be at least 6 characters" });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setToast({ type: "error", message: "New password and confirm password do not match" });
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({
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
      setSaving(false);
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

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[#BF9B53]">
          Admin Controls
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="max-w-3xl text-sm text-gray-500 dark:text-gray-400">
          Manage your admin profile, security, interface preference, and quick
          operational shortcuts from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SettingsCard
          title="Admin Profile"
          description="Signed-in admin details used across the dashboard."
          icon={<FiUser size={18} />}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoRow label="Name" value={user?.name} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Role" value={user?.role || "super-admin"} />
            <InfoRow
              label="Session"
              value={localStorage.getItem("adminToken") ? "Active" : "Not active"}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          title="Appearance"
          description="Switch the admin dashboard between light and dark mode."
          icon={darkMode ? <FiMoon size={18} /> : <FiSun size={18} />}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-md border border-gray-100 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {darkMode ? "Dark mode" : "Light mode"}
                </p>
                <p className="text-xs text-gray-500">
                  Current preference: {storedTheme}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-md bg-[#BF9B53] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#997C42]"
              >
                {darkMode ? <FiSun /> : <FiMoon />}
                Switch
              </button>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Security"
          description="Update your admin password. Keep it unique and private."
          icon={<FiLock size={18} />}
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Current password"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                required
              />
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="New password"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm password"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-gray-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-[#4C3E21] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#BF9B53] dark:hover:bg-[#997C42]"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </SettingsCard>

        <SettingsCard
          title="Operations"
          description="Common admin areas and support actions."
          icon={<FiShield size={18} />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Platform Settings", "/platform-settings", FiCheckCircle],
              ["Stripe Payments", "/stripe-payments", FiCheckCircle],
              ["Legal Content", "/privacy-policy", FiCheckCircle],
              ["Newsletter", "/newsletter-subscribers", FiMail],
            ].map(([label, href, Icon]) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-md border border-gray-100 bg-slate-50 p-3 text-sm font-semibold text-gray-700 transition hover:border-[#BF9B53]/40 hover:bg-[#BF9B53]/10 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
              >
                <Icon className="text-[#BF9B53]" />
                {label}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-5 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950"
          >
            Logout
          </button>
        </SettingsCard>
      </div>
    </div>
  );
};

export default Settings;
