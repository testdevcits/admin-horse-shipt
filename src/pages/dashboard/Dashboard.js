import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FaDollarSign, FaHorse, FaShippingFast, FaUsers } from "react-icons/fa";
import DataTable from "../../components/common/DataTable";
import API from "../../api/axios";

const money = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await API.get("/admin/dashboard/overview");
        if (res.data.success) setDashboard(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totals = useMemo(() => dashboard?.totals || {}, [dashboard]);
  const monthly = dashboard?.charts?.monthly || [];
  const shipmentStatus = dashboard?.charts?.shipmentStatus || [];
  const recentShipments = dashboard?.recent?.shipments || [];

  const stats = useMemo(
    () => [
      {
        label: "Customers",
        value: totals.customers || 0,
        icon: <FaUsers />,
      },
      {
        label: "Shippers",
        value: totals.shippers || 0,
        icon: <FaHorse />,
      },
      {
        label: "Shipments",
        value: totals.shipments || 0,
        icon: <FaShippingFast />,
      },
      {
        label: "Payments",
        value: money(totals.totalPayments || 0),
        icon: <FaDollarSign />,
      },
    ],
    [totals]
  );

  return (
    <div className="space-y-6 font-montserrat">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Live overview for users, payments, and shipments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 p-5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {loading ? "..." : stat.value}
                </p>
              </div>
              <span className="w-10 h-10 rounded-md bg-amber-100 text-system-primary dark:bg-gray-700 flex items-center justify-center">
                {stat.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 min-h-[320px]">
          <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
            Payments by Month
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => money(value)} />
              <Area
                type="monotone"
                dataKey="payments"
                stroke="#BF9B53"
                fill="#F5E7C2"
                name="Payments"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 min-h-[320px]">
          <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
            Users and Shipments
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="customers" fill="#2E86AB" name="Customers" />
              <Bar dataKey="shippers" fill="#4F7CAC" name="Shippers" />
              <Bar dataKey="shipments" fill="#BF9B53" name="Shipments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div>
          <h2 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
            Recent Shipments
          </h2>
          <DataTable
            loading={loading}
            columns={[
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
            ]}
            data={recentShipments}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
            Shipment Status
          </h2>
          <div className="space-y-3">
            {shipmentStatus.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.name}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 rounded bg-gray-100 dark:bg-gray-700">
                  <div
                    className="h-2 rounded bg-system-primary"
                    style={{
                      width: `${
                        totals.shipments
                          ? Math.min((item.value / totals.shipments) * 100, 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
