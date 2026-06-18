import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrash } from "react-icons/fa";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable from "../../components/common/DataTable";
import Toast from "../../components/common/Toast";
import { useCustomers } from "../../context/CustomerContext";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const Customers = () => {
  const navigate = useNavigate();
  const {
    customers,
    fetchCustomers,
    toggleCustomerStatus,
    deleteCustomer,
    pagination,
    loading,
  } = useCustomers();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    customerId: null,
  });

  useEffect(() => {
    fetchCustomers({ page, limit: 10, search: debouncedSearch }).catch((error) => {
      setToast({
        message: error?.response?.data?.message || "Failed to fetch customers",
        type: "error",
      });
    });
  }, [debouncedSearch, fetchCustomers, page]);

  const handleDelete = async () => {
    if (!confirmDelete.customerId) return;

    try {
      const result = await deleteCustomer(confirmDelete.customerId);
      setToast({
        message: result?.message || "Customer deleted successfully",
        type: result?.success ? "success" : "error",
      });
    } catch (error) {
      setToast({
        message: error?.response?.data?.message || "Failed to delete customer",
        type: "error",
      });
    } finally {
      setConfirmDelete({ show: false, customerId: null });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const result = await toggleCustomerStatus(id);
      setToast({
        message: result?.message || "Customer status updated",
        type: result?.success ? "success" : "error",
      });
    } catch (error) {
      setToast({
        message:
          error?.response?.data?.message || "Failed to update customer status",
        type: "error",
      });
    }
  };

  const columns = [
    { key: "name", label: "Customer Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (row) => row.phone || "N/A" },
    {
      key: "provider",
      label: "Provider",
      render: (row) => row.provider || "local",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <button
          type="button"
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
          onClick={() => handleToggleStatus(row._id)}
        >
          {row.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
  ];

  const actions = [
    {
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          icon={<FaEye size={12} />}
          iconOnly
          title="View customer"
          onClick={() => navigate(`/customers/${row._id}`)}
        >
          View
        </Button>
      ),
    },
    {
      render: (row) => (
        <Button
          size="sm"
          variant="danger"
          icon={<FaTrash size={12} />}
          iconOnly
          title="Delete customer"
          onClick={() =>
            setConfirmDelete({ show: true, customerId: row._id })
          }
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Customers
        </h1>
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search customers"
          className="w-full sm:w-72 border rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:text-white dark:border-gray-700"
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        actions={actions}
        currentPage={pagination.page || page}
        totalPages={pagination.totalPages || 1}
        totalRecords={pagination.totalRecords || pagination.total || 0}
        onPageChange={setPage}
        loading={loading}
      />

      <ConfirmModal
        show={confirmDelete.show}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ show: false, customerId: null })}
        confirmText="Delete"
      />

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

export default Customers;
