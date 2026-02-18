import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShippers } from "../../context/ShipperContext";
import Button from "../../components/common/Button";

const ShipperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getShipperById, loading } = useShippers();
  const [shipper, setShipper] = useState(null);

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

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen space-y-6">
      <Button onClick={() => navigate(-1)}>Back</Button>

      {/* Banner */}
      {shipper.bannerImage?.url && (
        <img
          src={shipper.bannerImage.url}
          alt="Banner"
          className="w-full h-48 object-cover rounded"
        />
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-4">
        {/* Profile */}
        {shipper.profileImage?.url && (
          <img
            src={shipper.profileImage.url}
            alt={shipper.name}
            className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
          />
        )}

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {shipper.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{shipper.email}</p>
          <p>
            Status:{" "}
            <span
              className={`font-medium ${
                shipper.isActive
                  ? "text-green-600 dark:text-green-300"
                  : "text-red-600 dark:text-red-300"
              }`}
            >
              {shipper.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          Login History
        </h3>
        {shipper.loginHistory && shipper.loginHistory.length > 0 ? (
          <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
            {shipper.loginHistory.map((login) => (
              <li key={login._id}>
                IP: {login.ip} | Date:{" "}
                {new Date(login.loginAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No login history available.</p>
        )}
      </div>

      {/* Current Location */}
      {shipper.currentLocation && (
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Current Location
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Latitude: {shipper.currentLocation.latitude}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Longitude: {shipper.currentLocation.longitude}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Last Updated:{" "}
            {new Date(shipper.currentLocation.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShipperDetail;
