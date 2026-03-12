import React, { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import { usePlatformSettings } from "../../context/PlatformSettingsContext";

const PlatformSettingsModal = ({ open, onClose, settings }) => {
  const { updatePlatformSettings } = usePlatformSettings();

  const [form, setForm] = useState({
    platformFeePercent: "",
    platformFeeFlat: "",
    currency: "usd",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        platformFeePercent: settings.platformFeePercent || "",
        platformFeeFlat: settings.platformFeeFlat || "",
        currency: settings.currency || "usd",
      });
    }
  }, [settings]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    const success = await updatePlatformSettings({
      platformFeePercent: Number(form.platformFeePercent),
      platformFeeFlat: Number(form.platformFeeFlat),
      currency: form.currency,
    });

    setSaving(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Update Platform Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Fee Percent */}
          <input
            type="number"
            name="platformFeePercent"
            placeholder="Platform Fee (%)"
            value={form.platformFeePercent}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary
            bg-white text-gray-900 placeholder-gray-400
            dark:bg-gray-800 dark:text-white"
            required
          />

          {/* Flat Fee */}
          <input
            type="number"
            name="platformFeeFlat"
            placeholder="Flat Fee"
            value={form.platformFeeFlat}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary
            bg-white text-gray-900 placeholder-gray-400
            dark:bg-gray-800 dark:text-white"
          />

          {/* Currency */}
          <input
            type="text"
            name="currency"
            placeholder="Currency (usd)"
            value={form.currency}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary
            bg-white text-gray-900 placeholder-gray-400
            dark:bg-gray-800 dark:text-white"
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>

            <Button type="submit" loading={saving}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlatformSettingsModal;
