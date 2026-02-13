import React, { useState } from "react";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import { FaEdit, FaTrash, FaRegCommentDots, FaPlus } from "react-icons/fa";

const Shippers = () => {
  const [page, setPage] = useState(1);

  // Dummy data
  const shippers = [
    {
      id: 1,
      name: "Fast Logistics",
      email: "fast@shipper.com",
      phone: "9876543210",
      status: "Active",
    },
    {
      id: 2,
      name: "Blue Dart",
      email: "blue@shipper.com",
      phone: "9123456789",
      status: "Inactive",
    },
  ];

  // Table columns (Admin theme aligned)
  const columns = [
    { key: "name", label: "Shipper Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium
            ${
              row.status === "Active"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }
          `}
        >
          {row.status}
        </span>
      ),
    },
  ];

  // Table actions (same button system)
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
          onClick={() => console.log("Delete shipper:", row)}
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
          icon={<FaRegCommentDots size={12} />}
          onClick={() => console.log("Comment shipper:", row)}
        >
          Comment
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
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
      <div className="bg-white dark:bg-gray-900 rounded shadow">
        <DataTable
          columns={columns}
          data={shippers}
          actions={actions}
          currentPage={page}
          totalPages={5}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default Shippers;
