import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import Toast from "../../components/common/Toast";
import { useCustomers } from "../../context/CustomerContext";
import { FaEye } from "react-icons/fa";

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "N/A");

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, loading } = useCustomers();

  const [customer, setCustomer] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCustomerById(id)
      .then((data) => {
        setCustomer(data?.customer || null);
        setShipments(data?.shipments || []);
        setPayments(data?.payments || []);
        setQuotes(data?.quotes || []);
      })
      .catch((error) => {
        setToast({
          message: error?.response?.data?.message || "Failed to fetch customer",
          type: "error",
        });
      });
  }, [getCustomerById, id]);

  if (loading || !customer) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const itemsPerPage = 5;
  const paginatedShipments = shipments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const shipmentColumns = [
    {
      key: "shipmentCode",
      label: "Code",
      render: (row) => row.shipmentCode || row._id,
    },
    { key: "pickupLocation", label: "Pickup" },
    { key: "deliveryLocation", label: "Delivery" },
    {
      key: "shipper",
      label: "Shipper",
      render: (row) => row.shipper?.name || "Not assigned",
    },
    { key: "status", label: "Status" },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen space-y-6">
      <Button onClick={() => navigate(-1)}>Back</Button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {(customer.profileImage?.url || customer.profilePicture) && (
          <img
            src={customer.profileImage?.url || customer.profilePicture}
            alt={customer.name}
            className="w-28 h-28 rounded-full object-cover border"
          />
        )}

        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {customer.name || "Unnamed Customer"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{customer.email}</p>
          <p className="text-sm text-gray-500">ID: {customer.uniqueId}</p>
          <p className="text-sm text-gray-500">Phone: {customer.phone || "N/A"}</p>
          <span
            className={`inline-block px-3 py-1 text-xs rounded-full mt-1 ${
              customer.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {customer.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Account Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm dark:text-gray-200">
          <p>
            <span className="font-medium">Provider:</span>{" "}
            {customer.provider || "local"}
          </p>
          <p>
            <span className="font-medium">Email Verified:</span>{" "}
            {customer.emailVerified ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">Phone Verified:</span>{" "}
            {customer.phoneVerified ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">Currently Logged In:</span>{" "}
            {customer.isLogin ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">Created:</span>{" "}
            {formatDate(customer.createdAt)}
          </p>
          <p>
            <span className="font-medium">Updated:</span>{" "}
            {formatDate(customer.updatedAt)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Customer Shipments
        </h3>
        <DataTable
          columns={shipmentColumns}
          data={paginatedShipments}
          currentPage={page}
          totalPages={Math.ceil(shipments.length / itemsPerPage) || 1}
          onPageChange={setPage}
          actions={[
            {
              render: (row) => (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<FaEye size={12} />}
                  iconOnly
                  title="View shipment"
                  onClick={() => navigate(`/shipments/${row._id}`)}
                >
                  View
                </Button>
              ),
            },
          ]}
        />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Payment Settings
          </h3>
          <DataTable
            columns={[
              { key: "serviceName", label: "Service" },
              {
                key: "pkLive",
                label: "Public Key",
                render: (row) => row.pkLive || "N/A",
              },
              {
                key: "active",
                label: "Active",
                render: (row) => (row.active ? "Yes" : "No"),
              },
              {
                key: "updatedAt",
                label: "Updated",
                render: (row) => formatDate(row.updatedAt),
              },
            ]}
            data={payments}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Payment Transactions
          </h3>
          <DataTable
            columns={[
              { key: "contractId", label: "Contract" },
              {
                key: "shipper",
                label: "Shipper",
                render: (row) => row.shipper?.name || row.shipper?.email || "N/A",
              },
              {
                key: "totalPrice",
                label: "Total",
                render: (row) => `$${Number(row.totalPrice || 0).toFixed(2)}`,
              },
              { key: "paymentStatus", label: "Payment" },
            ]}
            data={quotes}
          />
        </div>
      </div>

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

export default CustomerDetail;
