import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import Toast from "../../components/common/Toast";
import { useAdminShipments } from "../../context/ShipmentContext";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "N/A");

const Shipments = () => {
  const navigate = useNavigate();
  const { shipments, fetchShipments, loading } = useAdminShipments();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchShipments(status ? { status } : {}).catch((error) => {
      setToast({
        message: error?.response?.data?.message || "Failed to fetch shipments",
        type: "error",
      });
    });
  }, [fetchShipments, status]);

  const itemsPerPage = 10;
  const paginatedData = useMemo(
    () => shipments.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [shipments, page]
  );

  const columns = [
    {
      key: "shipmentCode",
      label: "Code",
      render: (row) => row.shipmentCode || row._id,
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => row.customer?.name || row.customer?.email || "N/A",
    },
    {
      key: "shipper",
      label: "Shipper",
      render: (row) => row.shipper?.name || "Not assigned",
    },
    { key: "pickupLocation", label: "Pickup" },
    { key: "deliveryLocation", label: "Delivery" },
    { key: "status", label: "Status" },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Shipments
        </h1>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2 text-sm dark:bg-gray-900 dark:text-white dark:border-gray-700"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="picked">Picked</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="open_for_offers">Open For Offers</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        currentPage={page}
        totalPages={Math.ceil(shipments.length / itemsPerPage) || 1}
        onPageChange={setPage}
        loading={loading}
        actions={[
          {
            render: (row) => (
              <Button
                size="sm"
                variant="secondary"
                icon={<FaEye size={12} />}
                onClick={() => navigate(`/shipments/${row._id}`)}
              >
                View
              </Button>
            ),
          },
        ]}
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

export default Shipments;
