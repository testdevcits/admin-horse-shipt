import React, { useEffect } from "react";
import { useBreeds } from "../../context/BreedContext";

const Dashboard = () => {
  const { breeds, fetchBreeds } = useBreeds();

  useEffect(() => {
    fetchBreeds();
  }, [fetchBreeds]);

  // For example purpose, total shippers, pending requests, revenue are static
  const totalShippers = 2;
  const pendingRequests = 14;
  const revenue = "$ 2,45,000";

  return (
    <div className="font-montserrat">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">
            Total Shippers
          </h3>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {totalShippers}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">
            Total Breeds
          </h3>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {breeds.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">
            Pending Requests
          </h3>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {pendingRequests}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Revenue</h3>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {revenue}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Activity
        </h2>

        <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
          <li>New user registered</li>
          <li>Order #1023 created</li>
          <li>Payment pending for Order #1018</li>
          <li>Shipment completed</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
