import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import { FaTrash, FaEye, FaPlus } from "react-icons/fa";
import { useShippers } from "../../context/ShipperContext";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";

const Shippers = () => {
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    shipperId: null,
  });
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const {
    shippers,
    fetchShippers,
    toggleShipperStatus,
    deleteShipper,
    loading,
  } = useShippers();

  useEffect(() => {
    fetchShippers();
  }, [fetchShippers]);

  const itemsPerPage = 10;
  const paginatedData = shippers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const showToast = (message, type = "info") => setToast({ message, type });

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!confirmDelete.shipperId) return;

    const result = await deleteShipper(confirmDelete.shipperId);
    showToast(
      result.success ? "Shipper deleted successfully" : result.message,
      result.success ? "success" : "error"
    );
    setConfirmDelete({ show: false, shipperId: null });
  };

  const columns = [
    { key: "name", label: "Shipper Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
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

        <Button
          icon={<FaPlus size={14} />}
          onClick={() => console.log("Add new shipper")}
        >
          Add Shipper
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900">
        <DataTable
          columns={columns}
          data={paginatedData}
          actions={actions}
          currentPage={page}
          totalPages={Math.ceil(shippers.length / itemsPerPage) || 1}
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

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Shippers;
