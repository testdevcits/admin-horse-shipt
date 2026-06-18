import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShippers } from "../../context/ShipperContext";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import { FaEye } from "react-icons/fa";

const ShipperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getShipperById, loading } = useShippers();

  const [shipper, setShipper] = useState(null);
  const [shipperData, setShipperData] = useState({});
  const [tablePagination, setTablePagination] = useState({});

  const [loginPage, setLoginPage] = useState(1);
  const [shipmentPage, setShipmentPage] = useState(1);
  const [vehiclePage, setVehiclePage] = useState(1);
  const [driverPage, setDriverPage] = useState(1);
  const loginPerPage = 5;

  useEffect(() => {
    const fetchShipper = async () => {
      const data = await getShipperById(id, {
        shipmentPage,
        shipmentLimit: 10,
        vehiclePage,
        vehicleLimit: 5,
        driverPage,
        driverLimit: 5,
      });
      setShipper(data?.shipper || data);
      setShipperData(data || {});
      setTablePagination(data?.pagination || {});
    };
    fetchShipper();
  }, [driverPage, getShipperById, id, shipmentPage, vehiclePage]);

  if (loading || !shipper) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const paginatedLoginHistory = shipper.loginHistory?.slice(
    (loginPage - 1) * loginPerPage,
    loginPage * loginPerPage
  );

  const totalLoginPages = Math.ceil(
    (shipper.loginHistory?.length || 0) / loginPerPage
  );
  const shipmentColumns = [
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
    { key: "pickupLocation", label: "Pickup" },
    { key: "deliveryLocation", label: "Delivery" },
    { key: "status", label: "Status" },
    {
      key: "createdAt",
      label: "Created",
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A",
    },
  ];

  return (
    <div className=" min-h-screen space-y-6">
      {/* Back Button */}
      <Button onClick={() => navigate(-1)}>Back</Button>

      {/* Banner */}
      {shipper.bannerImage?.url && (
        <div className="rounded-lg overflow-hidden shadow">
          <img
            src={shipper.bannerImage.url}
            alt="Banner"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {shipper.profileImage?.url && (
          <img
            src={shipper.profileImage.url}
            alt={shipper.name}
            className="w-28 h-28 rounded-full object-cover border"
          />
        )}

        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {shipper.name}
          </h2>

          <p className="text-gray-600 dark:text-gray-300">{shipper.email}</p>

          <p className="text-sm text-gray-500">ID: {shipper.uniqueId}</p>

          <p className="text-sm text-gray-500">Role: {shipper.role}</p>

          <span
            className={`inline-block px-3 py-1 text-xs rounded-full mt-1 ${
              shipper.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {shipper.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Stripe Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Stripe Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <p>
            <span className="font-medium">Stripe Account ID:</span>{" "}
            {shipper.stripeAccountId || "N/A"}
          </p>

          <p>
            <span className="font-medium">Verified:</span>{" "}
            {shipper.stripeVerified ? "Yes" : "No"}
          </p>

          <p>
            <span className="font-medium">Charges Enabled:</span>{" "}
            {shipper.stripeChargesEnabled ? "Yes" : "No"}
          </p>

          <p>
            <span className="font-medium">Payouts Enabled:</span>{" "}
            {shipper.stripePayoutsEnabled ? "Yes" : "No"}
          </p>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Account Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <p>
            <span className="font-medium">Email Verified:</span>{" "}
            {shipper.emailVerified ? "Yes" : "No"}
          </p>

          <p>
            <span className="font-medium">Currently Logged In:</span>{" "}
            {shipper.isLogin ? "Yes" : "No"}
          </p>

          <p>
            <span className="font-medium">Account Created:</span>{" "}
            {new Date(shipper.createdAt).toLocaleString()}
          </p>

          <p>
            <span className="font-medium">Last Updated:</span>{" "}
            {new Date(shipper.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Login History
        </h3>

        {shipper.loginHistory && shipper.loginHistory.length > 0 ? (
          <>
            <div className="border-b border-gray-200 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Total login history:{" "}
                <span className="text-[#BF9B53]">
                  {shipper.loginHistory.length}
                </span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                    <th className="p-2 border">#</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLoginHistory.map((login, index) => {
                    const date = new Date(login.loginAt);

                    return (
                      <tr key={login._id} className="border-t">
                        <td className="p-2 border">
                          {(loginPage - 1) * loginPerPage + index + 1}
                        </td>

                        <td className="p-2 border">
                          {date.toLocaleDateString("en-IN")}
                        </td>

                        <td className="p-2 border">
                          {date.toLocaleTimeString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={loginPage}
              totalPages={totalLoginPages || 1}
              onPageChange={setLoginPage}
            />
          </>
        ) : (
          <p className="text-sm text-gray-500">No login history available.</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Shipper Shipments
        </h3>
        <DataTable
          columns={shipmentColumns}
          data={shipperData.shipments || []}
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Vehicles
          </h3>
          <DataTable
            columns={[
              { key: "vehicleNumber", label: "Vehicle #" },
              { key: "vehicleType", label: "Type" },
              { key: "numberOfStalls", label: "Stalls" },
              { key: "verificationStatus", label: "Verification" },
            ]}
            data={shipperData.vehicles || []}
            currentPage={tablePagination.vehicles?.page || vehiclePage}
            totalPages={tablePagination.vehicles?.totalPages || 1}
            totalRecords={
              tablePagination.vehicles?.totalRecords ||
              tablePagination.vehicles?.total ||
              0
            }
            onPageChange={setVehiclePage}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Drivers
          </h3>
          <DataTable
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "driverStatus", label: "Status" },
            ]}
            data={shipperData.drivers || []}
            currentPage={tablePagination.drivers?.page || driverPage}
            totalPages={tablePagination.drivers?.totalPages || 1}
            totalRecords={
              tablePagination.drivers?.totalRecords ||
              tablePagination.drivers?.total ||
              0
            }
            onPageChange={setDriverPage}
          />
        </div>
      </div>
    </div>
  );
};

export default ShipperDetail;
