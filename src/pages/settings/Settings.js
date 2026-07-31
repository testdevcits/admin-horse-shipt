import React, { useEffect, useState } from "react";
import {
  FiBell,
  FiCheckCircle,
  FiLock,
  FiMail,
  FiMoon,
  FiShield,
  FiSun,
  FiUser,
} from "react-icons/fi";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Toast from "../../components/common/Toast";
import API from "../../api/axios";

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "facebook", label: "Facebook", icon: FaFacebook },
  { key: "twitter", label: "X", icon: FaXTwitter, placeholder: "https://x.com/horse-shipt" },
  { key: "youtube", label: "YouTube", icon: FaYoutube },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedin },
];

const emptySocialSettings = SOCIAL_PLATFORMS.reduce((acc, platform) => {
  acc[platform.key] = "";
  return acc;
}, {});

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
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialSaving, setSocialSaving] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    inApp: true,
    email: true,
    emailRecipient: "",
  });
  const [notificationErrors, setNotificationErrors] = useState({});
  const [socialErrors, setSocialErrors] = useState({});
  const [socialLinks, setSocialLinks] = useState(emptySocialSettings);
  const [savedSocialLinks, setSavedSocialLinks] = useState(emptySocialSettings);
  const [socialSettingsId, setSocialSettingsId] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const storedTheme = darkMode ? "dark" : "light";

  useEffect(() => {
    let mounted = true;

    const fetchSettings = async () => {
      setSocialLoading(true);
      setNotificationLoading(true);
      try {
        const [socialRes, notificationRes] = await Promise.all([
          API.get("/admin/social-media-settings"),
          API.get("/admin/notifications/settings"),
        ]);
        if (!mounted) return;
        const data = { ...emptySocialSettings, ...(socialRes.data?.data || {}) };
        setSocialLinks(data);
        setSavedSocialLinks(data);
        setSocialSettingsId(socialRes.data?.data?._id || "");
        const notificationData = notificationRes.data?.data || {};
        setNotificationSettings({
          inApp:
            notificationData.notifications?.inApp ??
            notificationData.notificationEnabled !== false,
          email: notificationData.notifications?.email !== false,
          emailRecipient: notificationData.notifications?.emailRecipient || "",
        });
      } catch (error) {
        if (!mounted) return;
        setToast({
          type: "error",
          message:
            error?.response?.data?.message ||
            "Failed to fetch settings",
        });
      } finally {
        if (mounted) {
          setSocialLoading(false);
          setNotificationLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const validateSocialLinks = () => {
    const nextErrors = {};
    const seenUrls = new Map();

    SOCIAL_PLATFORMS.forEach(({ key }) => {
      const value = (socialLinks[key] || "").trim();
      if (!value) return;

      try {
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol)) {
          nextErrors[key] = "Enter a valid URL";
        }
      } catch (_error) {
        nextErrors[key] = "Enter a valid URL";
      }

      const normalized = value.toLowerCase();
      if (seenUrls.has(normalized)) {
        nextErrors[key] = "Duplicate URL";
        nextErrors[seenUrls.get(normalized)] = "Duplicate URL";
      }
      seenUrls.set(normalized, key);
    });

    setSocialErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSocialChange = (key, value) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
    setSocialErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSocialSave = async (event) => {
    event.preventDefault();
    if (!validateSocialLinks()) return;

    setSocialSaving(true);
    try {
      const payload = SOCIAL_PLATFORMS.reduce((acc, platform) => {
        acc[platform.key] = (socialLinks[platform.key] || "").trim();
        return acc;
      }, {});
      const res = socialSettingsId
        ? await API.put("/admin/social-media-settings", payload)
        : await API.post("/admin/social-media-settings", payload);
      const data = { ...emptySocialSettings, ...(res.data?.data || {}) };
      setSocialLinks(data);
      setSavedSocialLinks(data);
      setSocialSettingsId(res.data?.data?._id || socialSettingsId);
      setToast({
        type: "success",
        message: res.data?.message || "Social media settings saved",
      });
    } catch (error) {
      setSocialErrors(error?.response?.data?.errors || {});
      setToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to save social media settings",
      });
    } finally {
      setSocialSaving(false);
    }
  };

  const handleSocialReset = () => {
    setSocialLinks(savedSocialLinks);
    setSocialErrors({});
  };

  const handleSocialDelete = async (platform) => {
    setSocialSaving(true);
    try {
      const res = await API.delete(`/admin/social-media-settings/${platform}`);
      const data = { ...emptySocialSettings, ...(res.data?.data || {}) };
      setSocialLinks(data);
      setSavedSocialLinks(data);
      setSocialSettingsId(res.data?.data?._id || socialSettingsId);
      setSocialErrors({});
      setToast({
        type: "success",
        message: res.data?.message || "Social media link removed",
      });
    } catch (error) {
      setToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to delete social media link",
      });
    } finally {
      setSocialSaving(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const nextSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };
    setNotificationSaving(true);
    try {
      const res = await API.put("/admin/notifications/settings", {
        notifications: nextSettings,
      });
      const notificationData = res.data?.data || {};
      setNotificationSettings({
        inApp:
          notificationData.notifications?.inApp ??
          notificationData.notificationEnabled !== false,
        email: notificationData.notifications?.email !== false,
        emailRecipient: notificationData.notifications?.emailRecipient || "",
      });
      setToast({
        type: "success",
        message: "Admin notification settings updated",
      });
    } catch (error) {
      setToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to update notification settings",
      });
    } finally {
      setNotificationSaving(false);
    }
  };

  const handleNotificationEmailChange = (event) => {
    setNotificationSettings((prev) => ({
      ...prev,
      emailRecipient: event.target.value,
    }));
    setNotificationErrors((prev) => ({ ...prev, emailRecipient: "" }));
  };

  const handleNotificationEmailSave = async (event) => {
    event.preventDefault();
    const emailRecipient = (notificationSettings.emailRecipient || "").trim();

    if (
      emailRecipient &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRecipient)
    ) {
      setNotificationErrors({
        emailRecipient: "Enter a valid email address",
      });
      return;
    }

    setNotificationSaving(true);
    try {
      const res = await API.put("/admin/notifications/settings", {
        notifications: {
          ...notificationSettings,
          emailRecipient,
        },
      });
      const notificationData = res.data?.data || {};
      setNotificationSettings({
        inApp:
          notificationData.notifications?.inApp ??
          notificationData.notificationEnabled !== false,
        email: notificationData.notifications?.email !== false,
        emailRecipient: notificationData.notifications?.emailRecipient || "",
      });
      setNotificationErrors({});
      setToast({
        type: "success",
        message: "Admin notification email updated",
      });
    } catch (error) {
      setNotificationErrors(error?.response?.data?.errors || {});
      setToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to update admin notification email",
      });
    } finally {
      setNotificationSaving(false);
    }
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
          title="Notifications"
          description="Control admin panel notifications and admin email alerts."
          icon={<FiBell size={18} />}
        >
          <div className="flex flex-col gap-4">
            {[
              {
                key: "inApp",
                title: "Admin notification table",
                description: "Show or hide notification activity in admin panel.",
              },
              {
                key: "email",
                title: "Mail notifications",
                description: "Control admin notification emails. Password reset OTP emails always send.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex flex-col items-start justify-between gap-4 rounded-md border border-gray-100 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    Status: {notificationSettings[item.key] ? "On" : "Off"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle(item.key)}
                  disabled={notificationLoading || notificationSaving}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    notificationSettings[item.key]
                      ? "bg-[#BF9B53]"
                      : "bg-gray-300"
                  }`}
                  aria-pressed={notificationSettings[item.key]}
                  aria-label={`Toggle ${item.title}`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                      notificationSettings[item.key]
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
            <form
              onSubmit={handleNotificationEmailSave}
              className="rounded-md border border-gray-100 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950"
            >
              <label className="text-sm font-bold text-gray-900 dark:text-white">
                Admin email for new user alerts
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Customer and shipper signup emails will be sent to this address.
                Leave empty to use active admin accounts.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={notificationSettings.emailRecipient || ""}
                  onChange={handleNotificationEmailChange}
                  placeholder="admin@example.com"
                  className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={notificationLoading || notificationSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#BF9B53] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#997C42] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiMail />
                  {notificationSaving ? "Saving..." : "Save Email"}
                </button>
              </div>
              {notificationErrors.emailRecipient && (
                <p className="mt-2 text-xs font-semibold text-red-500">
                  {notificationErrors.emailRecipient}
                </p>
              )}
            </form>
            <a
              href="/notifications"
              className="inline-flex w-fit items-center gap-2 rounded-md border border-[#BF9B53]/30 px-4 py-2 text-sm font-bold text-[#997C42] transition hover:bg-[#BF9B53]/10 dark:text-[#E8D7AD]"
            >
              <FiBell />
              View Notifications
            </a>
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
              ["Legal Content", "/privacy-policy", FiCheckCircle],
              ["Newsletter", "/newsletter-subscribers", FiMail],
              ["Notifications", "/notifications", FiBell],
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

        <SettingsCard
          title="Social Media"
          description="Manage footer social links without changing code."
          icon={<FaInstagram size={18} />}
        >
          <form onSubmit={handleSocialSave} className="space-y-4">
            {socialLoading ? (
              <div className="rounded-md border border-gray-100 bg-slate-50 p-4 text-sm font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-950">
                Loading social media settings...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                      <Icon className="text-[#BF9B53]" />
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={socialLinks[key] || ""}
                        onChange={(event) =>
                          handleSocialChange(key, event.target.value)
                        }
                        placeholder={placeholder || `https://${key}.com/horse-shipt`}
                        className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleSocialDelete(key)}
                        disabled={socialSaving || !savedSocialLinks[key]}
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:bg-red-950"
                      >
                        Delete
                      </button>
                    </div>
                    {socialErrors[key] && (
                      <p className="text-xs font-semibold text-red-500">
                        {socialErrors[key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={socialLoading || socialSaving}
                className="rounded-md bg-[#BF9B53] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#997C42] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {socialSaving
                  ? "Saving..."
                  : socialSettingsId
                  ? "Update Links"
                  : "Create Links"}
              </button>
              <button
                type="button"
                onClick={handleSocialReset}
                disabled={socialLoading || socialSaving}
                className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
              >
                Reset
              </button>
            </div>
          </form>
        </SettingsCard>
      </div>
    </div>
  );
};

export default Settings;
