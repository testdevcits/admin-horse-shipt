import React, { useState } from "react";
import { usePlatformSettings } from "../../context/PlatformSettingsContext";
import PageLoader from "../../components/common/PageLoader";
import Button from "../../components/common/Button";
import NoData from "../../components/common/NoData";
import PlatformSettingsModal from "./PlatformSettingsModal";

const PlatformSettings = () => {
  const { settings, loading } = usePlatformSettings();

  const [openModal, setOpenModal] = useState(false);

  if (loading) {
    return <PageLoader text="Loading platform settings..." size={24} />;
  }

  if (!settings) {
    return (
      <NoData
        title="Platform Settings Not Found"
        description="Admin has not configured platform fee yet."
      />
    );
  }

  return (
    <div className="font-montserrat max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Platform Payment Settings
        </h1>

        <Button variant="primary" onClick={() => setOpenModal(true)}>
          Edit Settings
        </Button>
      </div>

      {/* Settings Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">Platform Fee (%)</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {settings.platformFeePercent} %
          </span>
        </div>

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">Flat Fee</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {settings.platformFeeFlat}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Currency</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {settings.currency}
          </span>
        </div>
      </div>

      {/* Modal */}
      <PlatformSettingsModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        settings={settings}
      />
    </div>
  );
};

export default PlatformSettings;
