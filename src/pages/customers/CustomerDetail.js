import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import Toast from "../../components/common/Toast";
import { useCustomers } from "../../context/CustomerContext";
import PageLoader from "../../components/common/PageLoader";
import { FaEye, FaFileInvoiceDollar } from "react-icons/fa";

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "N/A");

const formatMoney = (value = 0, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatSettlementFee = (row, field) => {
  const amount = Number(row[field]);
  if (amount > 0 || row.payoutStatus === "transferred") {
    return formatMoney(amount, row.payoutCurrency || row.currency || "USD");
  }
  return row.paymentStatus === "paid" ? "Pending settlement" : "—";
};

const formatShipperPayout = (row) => {
  if (row.payoutStatus !== "transferred") return "Pending";
  return formatMoney(
    row.shipperPayoutAmount,
    row.payoutCurrency || row.currency || "USD"
  );
};

const formatStatus = (value) =>
  value ? value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—";

const openPdf = (url) => {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
};

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, loading } = useCustomers();

  const [customer, setCustomer] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [tablePagination, setTablePagination] = useState({});
  const [toast, setToast] = useState(null);
  const [shipmentPage, setShipmentPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [quotePage, setQuotePage] = useState(1);

  useEffect(() => {
    getCustomerById(id, {
      shipmentPage,
      shipmentLimit: 5,
      paymentPage,
      paymentLimit: 5,
      quotePage,
      quoteLimit: 5,
    })
      .then((data) => {
        setCustomer(data?.customer || null);
        setShipments(data?.shipments || []);
        setPayments(data?.payments || []);
        setQuotes(data?.quotes || []);
        setTablePagination(data?.pagination || {});
      })
      .catch((error) => {
        setToast({
          message: error?.response?.data?.message || "Failed to fetch customer",
          type: "error",
        });
      });
  }, [getCustomerById, id, paymentPage, quotePage, shipmentPage]);

  if (loading || !customer) {
    return <PageLoader text="Loading customer details..." variant="spinner" />;
  }

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
    <div className="w-full min-w-0 max-w-full min-h-screen space-y-6">
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

      <div className="min-w-0 max-w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Customer Shipments
        </h3>
        <DataTable
          columns={shipmentColumns}
          data={shipments}
          currentPage={tablePagination.shipments?.page || shipmentPage}
          totalPages={tablePagination.shipments?.totalPages || 1}
          totalRecords={
            tablePagination.shipments?.totalRecords ||
            tablePagination.shipments?.total ||
            0
          }
          onPageChange={setShipmentPage}
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

      <div className="space-y-6">
        <div className="min-w-0 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
            currentPage={tablePagination.payments?.page || paymentPage}
            totalPages={tablePagination.payments?.totalPages || 1}
            totalRecords={
              tablePagination.payments?.totalRecords ||
              tablePagination.payments?.total ||
              0
            }
            onPageChange={setPaymentPage}
          />
        </div>

        <div className="min-w-0 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Payment Transactions
          </h3>
          <DataTable
            columns={[
              {
                key: "shipment",
                label: "Shipment",
                render: (row) =>
                  row.shipment?.shipmentCode || row.shipment?._id || "N/A",
              },
              {
                key: "totalPrice",
                label: "Customer Paid",
                render: (row) => formatMoney(row.totalPrice, row.currency || "USD"),
              },
              {
                key: "stripeFee",
                label: "Stripe Fee",
                render: (row) => formatSettlementFee(row, "stripeFee"),
              },
              {
                key: "platformFee",
                label: "Platform Fee",
                render: (row) => formatSettlementFee(row, "platformFee"),
              },
              {
                key: "shipperPayoutAmount",
                label: "Shipper Payout",
                render: formatShipperPayout,
              },
              {
                key: "paymentStatus",
                label: "Payment",
                render: (row) => formatStatus(row.paymentStatus),
              },
              {
                key: "payoutStatus",
                label: "Payout",
                render: (row) => formatStatus(row.payoutStatus),
              },
            ]}
            data={quotes}
            currentPage={tablePagination.quotes?.page || quotePage}
            totalPages={tablePagination.quotes?.totalPages || 1}
            totalRecords={
              tablePagination.quotes?.totalRecords ||
              tablePagination.quotes?.total ||
              0
            }
            onPageChange={setQuotePage}
            actions={[
              {
                render: (row) =>
                  row.shipment?._id ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<FaEye size={12} />}
                        iconOnly
                        title="View shipment"
                        onClick={() => navigate(`/shipments/${row.shipment._id}`)}
                      >
                        View
                      </Button>
                      {row.taxInvoices?.customer?.url && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<FaFileInvoiceDollar size={12} />}
                          iconOnly
                          title="View customer invoice"
                          onClick={() => openPdf(row.taxInvoices.customer.url)}
                        >
                          Invoice
                        </Button>
                      )}
                    </>
                  ) : null,
              },
            ]}
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
