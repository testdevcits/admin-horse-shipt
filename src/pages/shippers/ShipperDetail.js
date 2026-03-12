import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShippers } from "../../context/ShipperContext";
import Button from "../../components/common/Button";

const ShipperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getShipperById, loading } = useShippers();

  const [shipper, setShipper] = useState(null);

  const [loginPage, setLoginPage] = useState(1);
  const loginPerPage = 5;

  useEffect(() => {
    const fetchShipper = async () => {
      const data = await getShipperById(id);
      setShipper(data);
    };
    fetchShipper();
  }, [id, getShipperById]);

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

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen space-y-6">
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

            {/* Pagination */}
            <div className="flex justify-end mt-4 gap-2">
              <button
                disabled={loginPage === 1}
                onClick={() => setLoginPage(loginPage - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span className="px-3 py-1 text-sm">
                {loginPage} / {totalLoginPages || 1}
              </span>

              <button
                disabled={loginPage === totalLoginPages}
                onClick={() => setLoginPage(loginPage + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">No login history available.</p>
        )}
      </div>
    </div>
  );
};

export default ShipperDetail;
