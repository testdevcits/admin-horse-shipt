import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import { useShippers } from "../../context/ShipperContext";

const Shippers = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const {
    shippers,
    fetchShippers,
    toggleShipperStatus,
    deleteShipper,
    loading,
  } = useShippers();

  // Fetch shippers on mount
  useEffect(() => {
    fetchShippers();
  }, [fetchShippers]);

  // Pagination setup
  const itemsPerPage = 10;
  const paginatedData = shippers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Table columns
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

  // Table actions
  const actions = [
    {
      render: (row) => (
        <Button
          size="sm"
          variant="primary"
          icon={<FaEdit size={12} />}
          onClick={() => console.log("Edit shipper:", row)}
        >
          Edit
        </Button>
      ),
    },
    {
      render: (row) => (
        <Button
          size="sm"
          variant="danger"
          icon={<FaTrash size={12} />}
          onClick={() => deleteShipper(row._id)}
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
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Shippers Management
        </h1>

        <Button
          icon={<FaPlus size={14} />}
          onClick={() => console.log("Add new shipper")}
        >
          Add Shipper
        </Button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
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
    </div>
  );
};

export default Shippers;
