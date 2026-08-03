import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import { FaTrash, FaEye } from "react-icons/fa";
import { useShippers } from "../../context/ShipperContext";
import ConfirmModal from "../../components/common/ConfirmModal";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US") : "N/A";

const formatSubscriptionStatus = (status) => {
  if (!status || status === "none") return "No Subscription";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const Shippers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    shipperId: null,
  });

  const navigate = useNavigate();

  const {
    shippers,
    fetchShippers,
    toggleShipperStatus,
    deleteShipper,
    pagination,
    loading,
  } = useShippers();

  useEffect(() => {
    fetchShippers({ page, limit: 10, search: debouncedSearch });
  }, [debouncedSearch, fetchShippers, page]);

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!confirmDelete.shipperId) return;

    await deleteShipper(confirmDelete.shipperId);
    setConfirmDelete({ show: false, shipperId: null });
  };

  const columns = [
    { key: "name", label: "Shipper Name" },
    { key: "email", label: "Email" },
    { key: "mobile", label: "Phone", render: (row) => row.mobile || "N/A" },
    {
      key: "subscriptionStatus",
      label: "Subscription",
      render: (row) => {
        const status = row.subscription?.status || "none";
        const activeStyles = ["active", "trialing"].includes(status)
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : status === "past_due"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${activeStyles}`}>
            {formatSubscriptionStatus(status)}
          </span>
        );
      },
    },
    {
      key: "subscriptionFrom",
      label: "Sub. From",
      render: (row) =>
        formatDate(
          row.subscription?.currentPeriodStart || row.subscription?.trialStart
        ),
    },
    {
      key: "subscriptionTo",
      label: "Sub. To",
      render: (row) =>
        formatDate(row.subscription?.currentPeriodEnd || row.subscription?.trialEnd),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${
            row.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
          onClick={() => toggleShipperStatus(row._id)}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      render: (row) => (
        <Button
          size="sm"
          variant="danger"
          icon={<FaTrash size={12} />}
          iconOnly
          title="Delete shipper"
          onClick={() => setConfirmDelete({ show: true, shipperId: row._id })}
        >
          Delete
        </Button>
      ),
    },
    {
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          icon={<FaEye size={12} />}
          iconOnly
          title="View shipper"
          onClick={() => navigate(`/shippers/${row._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Shippers
        </h1>

        <div className="flex w-full sm:w-auto gap-2">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search shippers"
            className="min-w-0 flex-1 sm:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none transition focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/15 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:focus:border-[#BF9B53] dark:focus:ring-[#BF9B53]/20"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900">
        <DataTable
          columns={columns}
          data={shippers}
          actions={actions}
          tableMinWidth="1080px"
          currentPage={pagination.page || page}
          totalPages={pagination.totalPages || 1}
          totalRecords={pagination.totalRecords || pagination.total || 0}
          onPageChange={setPage}
          loading={loading}
        />
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={confirmDelete.show}
        title="Delete Shipper"
        message="Are you sure you want to delete this shipper?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ show: false, shipperId: null })}
        confirmText="Delete"
      />
    </div>
  );
};

export default Shippers;
