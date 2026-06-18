import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import Toast from "../../components/common/Toast";
import { useAdminShipments } from "../../context/ShipmentContext";

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "N/A");

const NoteLog = ({ entries = [], fallback }) => {
  const notes = entries.length ? entries : fallback ? [{ note: fallback }] : [];
  if (!notes.length) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Chronological Notes
      </p>
      {notes.map((entry, index) => (
        <div
          key={index}
          className="rounded-sm border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold">{entry.userName || "Customer"}</span>
            {entry.createdAt && <span>{formatDate(entry.createdAt)}</span>}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-200">
            {entry.note}
          </p>
        </div>
      ))}
    </div>
  );
};

const Info = ({ label, value }) => (
  <p className="text-sm dark:text-gray-200">
    <span className="font-medium">{label}:</span> {value || "N/A"}
  </p>
);

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getShipmentById, loading } = useAdminShipments();

  const [shipment, setShipment] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [tablePagination, setTablePagination] = useState({});
  const [toast, setToast] = useState(null);
  const [quotePage, setQuotePage] = useState(1);

  useEffect(() => {
    getShipmentById(id, {
      quotePage,
      quoteLimit: 5,
    })
      .then((data) => {
        setShipment(data?.shipment || null);
        setQuotes(data?.quotes || []);
        setTablePagination(data?.pagination || {});
      })
      .catch((error) => {
        setToast({
          message: error?.response?.data?.message || "Failed to fetch shipment",
          type: "error",
        });
      });
  }, [getShipmentById, id, quotePage]);

  if (loading || !shipment) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const quoteColumns = [
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
    { key: "status", label: "Status" },
    { key: "paymentStatus", label: "Payment" },
    { key: "payoutStatus", label: "Payout" },
    { key: "tripStatus", label: "Trip" },
  ];

  return (
    <div className="min-h-screen space-y-6">
      <Button onClick={() => navigate(-1)}>Back</Button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Shipment {shipment.shipmentCode || shipment._id}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created {formatDate(shipment.createdAt)}
            </p>
          </div>
          <span className="self-start px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100">
            {shipment.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Info
            label="Customer"
            value={shipment.customer?.name || shipment.customer?.email}
          />
          <Info
            label="Assigned Shipper"
            value={shipment.shipper?.name || shipment.shipper?.email}
          />
          <Info label="Pickup" value={shipment.pickupLocation} />
          <Info label="Delivery" value={shipment.deliveryLocation} />
          <Info label="Pickup Window" value={`${formatDate(shipment.pickupDateRange?.start)} - ${formatDate(shipment.pickupDateRange?.end)}`} />
          <Info label="Delivery Window" value={`${formatDate(shipment.deliveryDateRange?.start)} - ${formatDate(shipment.deliveryDateRange?.end)}`} />
          <Info label="Horses" value={shipment.numberOfHorses} />
          <Info label="Published" value={shipment.publish ? "Yes" : "No"} />
          <Info label="Recipient Email" value={shipment.recipientEmail} />
          <Info label="Delivered At" value={formatDate(shipment.deliveredAt)} />
        </div>

        {shipment.additionalInfo && (
          <div className="mt-5 text-sm dark:text-gray-200">
            <span className="font-medium">Additional Info:</span>{" "}
            {shipment.additionalInfo}
            <NoteLog
              entries={shipment.additionalInfoLog || []}
              fallback={shipment.additionalInfo}
            />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Horses
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {(shipment.horses || []).map((horse, index) => (
            <div
              key={`${horse.registeredName}-${index}`}
              className="border rounded-lg p-4 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {horse.registeredName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {horse.breed} {horse.sex ? `- ${horse.sex}` : ""}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Stall: {horse.requestedStallSize || "N/A"}
              </p>
              <NoteLog entries={horse.notesLog || []} fallback={horse.notes} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Quotes
        </h2>
        <DataTable
          columns={quoteColumns}
          data={quotes}
          currentPage={tablePagination.quotes?.page || quotePage}
          totalPages={tablePagination.quotes?.totalPages || 1}
          totalRecords={
            tablePagination.quotes?.totalRecords ||
            tablePagination.quotes?.total ||
            0
          }
          onPageChange={setQuotePage}
        />
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

export default ShipmentDetail;
