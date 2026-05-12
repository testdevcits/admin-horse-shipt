import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiBox,
  FiDollarSign,
  FiMoreVertical,
  FiSearch,
  FiShoppingBag,
  FiTag,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import API from "../../api/axios";
import { Skeleton } from "../../components/common/Skeleton";

const money = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const number = (value = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const statusClass = {
  published: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  draft: "bg-gray-100 text-gray-600",
  cancelled: "bg-rose-50 text-rose-600",
  canceled: "bg-rose-50 text-rose-600",
  completed: "bg-green-50 text-green-600",
  accepted: "bg-blue-50 text-blue-600",
};

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#f5f6fb] -m-4 sm:-m-6 p-4 sm:p-6 font-montserrat">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-5 w-28" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-sm" />
        <Skeleton className="h-8 w-8 rounded-sm" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-sm border border-gray-100 p-5 min-h-[145px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
          <div className="mt-5 grid grid-cols-[1fr_95px] gap-3 items-end">
            <div className="space-y-3">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      ))}
    </div>

    <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
      {["Orders", "Payments"].map((title) => (
        <div key={title} className="bg-white rounded-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-12 rounded-sm" />
              <Skeleton className="h-8 w-12 rounded-sm" />
              <Skeleton className="h-8 w-14 rounded-sm" />
            </div>
          </div>
          <Skeleton className="h-[280px] w-full" />
        </div>
      ))}
    </div>

    <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-sm border border-gray-100 p-5 min-h-[112px]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="h-3 w-24 mt-4" />
          <Skeleton className="h-6 w-20 mt-3" />
          <Skeleton className="h-3 w-28 mt-3" />
        </div>
      ))}
    </div>

    <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
      {Array.from({ length: 2 }).map((_, tableIndex) => (
        <div key={tableIndex} className="bg-white rounded-sm border border-gray-100 p-5">
          <Skeleton className="h-4 w-28 mb-5" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((__, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatCard = ({ active, color, icon, label, value, trend, data }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-sm border p-5 min-h-[145px] ${
      active
        ? "border-[#1e9bff] ring-2 ring-[#1e9bff]/20"
        : "border-gray-100 dark:border-gray-700"
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <span
          className="w-9 h-9 rounded-md flex items-center justify-center border"
          style={{
            color,
            background: `${color}12`,
            borderColor: `${color}28`,
          }}
        >
          {icon}
        </span>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
      </div>
      <FiMoreVertical className="text-gray-400" />
    </div>

    <div className="mt-4 grid grid-cols-[1fr_95px] gap-3 items-end">
      <div>
        <p className="text-2xl font-bold text-gray-950 dark:text-white">
          {value}
        </p>
        <p className="mt-2 text-[11px] text-gray-500">
          <span style={{ color }}>{trend}</span> vs last month
        </p>
      </div>

      <ResponsiveContainer width="100%" height={54}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("Day");

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
  const monthly = useMemo(
    () => dashboard?.charts?.monthly || [],
    [dashboard]
  );
  const recentShipments = useMemo(
    () => dashboard?.recent?.shipments || [],
    [dashboard]
  );

  const chartData = useMemo(() => {
    if (!monthly.length) {
      return Array.from({ length: 30 }, (_, index) => ({
        label: `${index + 1}`,
        orders: index < 4 ? 4 : Math.round(18 + Math.sin(index / 1.7) * 12),
        payments: index < 4 ? 0 : Math.round(900 + Math.cos(index / 2) * 350),
      }));
    }

    return monthly.map((item, index) => ({
      label: item.label || `${index + 1}`,
      orders: item.shipments || item.orders || 0,
      payments: item.payments || 0,
      customers: item.customers || 0,
      shippers: item.shippers || 0,
    }));
  }, [monthly]);

  const miniSeries = useMemo(
    () =>
      chartData.slice(-6).map((item) => ({
        value: item.orders || item.payments || 0,
      })),
    [chartData]
  );

  const recentOrders = recentShipments.slice(0, 5);
  const topRoutes = recentShipments.slice(0, 5);

  const todayOrders = chartData[chartData.length - 1]?.orders || 0;

  const primaryStats = [
    {
      label: "Total Orders",
      value: number(totals.shipments || 0),
      trend: "+18%",
      color: "#10b981",
      icon: <FiShoppingBag size={17} />,
      active: true,
      data: miniSeries,
    },
    {
      label: "Total Revenue (GMV)",
      value: money(totals.totalPayments || 0),
      trend: "-12%",
      color: "#ef4444",
      icon: <FiTruck size={17} />,
      data: miniSeries,
    },
    {
      label: "Today Orders",
      value: number(todayOrders),
      trend: "+23%",
      color: "#10b981",
      icon: <FiTag size={17} />,
      data: miniSeries,
    },
  ];

  const secondaryStats = [
    {
      label: "Customers",
      value: number(totals.customers || 0),
      trend: "+8%",
      color: "#10b981",
      icon: <FiUsers size={17} />,
    },
    {
      label: "Shippers",
      value: number(totals.shippers || 0),
      trend: "+5%",
      color: "#ef4444",
      icon: <FiTruck size={17} />,
    },
    {
      label: "Open Shipments",
      value: number(totals.shipments || 0),
      trend: "-2%",
      color: "#f97316",
      icon: <FiBox size={17} />,
    },
  ];

  if (loading && !dashboard) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f5f6fb] -m-4 sm:-m-6 p-4 sm:p-6 font-montserrat">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-base font-bold text-[#17184b] dark:text-white">
          Dashboard
        </h1>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 bg-white border border-gray-100 text-[#17184b] flex items-center justify-center rounded-sm">
            <FiSearch size={14} />
          </button>
          <button className="w-8 h-8 bg-white border border-gray-100 text-[#17184b] flex items-center justify-center rounded-sm">
            <FiDollarSign size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {primaryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Orders
            </h2>

            <div className="flex items-center gap-1">
              {["Day", "Week", "Month"].map((item) => (
                <button
                  key={item}
                  onClick={() => setRange(item)}
                  className={`px-3 h-8 rounded-sm text-[11px] font-semibold ${
                    range === item
                      ? "bg-[#17184b] text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8d889" stopOpacity={0.42} />
                  <stop offset="100%" stopColor="#f8d889" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#edf0f7" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "payments" ? money(value) : number(value),
                  name === "payments" ? "Revenue" : "Orders",
                ]}
                contentStyle={{
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#3844b8"
                strokeWidth={2}
                fill="url(#ordersFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#3844b8" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Payments
            </h2>

            <div className="flex items-center gap-1">
              {["Day", "Week", "Month"].map((item) => (
                <button
                  key={item}
                  onClick={() => setRange(item)}
                  className={`px-3 h-8 rounded-sm text-[11px] font-semibold ${
                    range === item
                      ? "bg-[#17184b] text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ left: -10, right: 10 }}>
              <defs>
                <linearGradient id="paymentsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#edf0f7" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${number(value)}`}
              />
              <Tooltip
                formatter={(value) => [money(value), "Payments"]}
                contentStyle={{
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="payments"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#paymentsFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-sm p-5 min-h-[112px]"
          >
            <div className="flex items-start justify-between">
              <span
                className="w-9 h-9 rounded-md flex items-center justify-center border"
                style={{
                  color: stat.color,
                  background: `${stat.color}12`,
                  borderColor: `${stat.color}28`,
                }}
              >
                {stat.icon}
              </span>
              <FiMoreVertical className="text-gray-400" />
            </div>
            <p className="mt-3 text-xs font-medium text-gray-500">
              {stat.label}
            </p>
            <p className="mt-2 text-xl font-bold text-gray-950 dark:text-white">
              {stat.value}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              <span style={{ color: stat.color }}>{stat.trend}</span> vs last
              month
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-sm p-5 overflow-hidden">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">
            Top Routes
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-[11px] text-gray-500 border-b border-gray-100">
                  <th className="font-medium pb-3">Route</th>
                  <th className="font-medium pb-3">Customer</th>
                  <th className="font-medium pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.length ? (
                  topRoutes.map((shipment) => (
                    <tr
                      key={shipment._id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-3">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {shipment.pickupLocation || "Pickup pending"}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {shipment.deliveryLocation || "Delivery pending"}
                        </p>
                      </td>
                      <td className="py-3 text-xs text-gray-600">
                        {shipment.customer?.name ||
                          shipment.customer?.email ||
                          "Customer"}
                      </td>
                      <td className="py-3 text-xs font-semibold text-gray-900 dark:text-white text-right">
                        {money(shipment.amount || shipment.totalAmount || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-8 text-center text-xs text-gray-500"
                    >
                      No route data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-sm p-5 overflow-hidden">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">
            Recent Orders
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-[11px] text-gray-500 border-b border-gray-100">
                  <th className="font-medium pb-3">Order ID</th>
                  <th className="font-medium pb-3">Customer</th>
                  <th className="font-medium pb-3">Date</th>
                  <th className="font-medium pb-3">Amount</th>
                  <th className="font-medium pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length ? (
                  recentOrders.map((shipment) => {
                    const status = String(shipment.status || "pending");
                    return (
                      <tr
                        key={shipment._id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-3 text-xs font-semibold text-gray-900 dark:text-white">
                          #{shipment.shipmentCode || shipment._id?.slice(-7)}
                        </td>
                        <td className="py-3 text-xs text-gray-600">
                          {shipment.customer?.name ||
                            shipment.customer?.email ||
                            "Customer"}
                        </td>
                        <td className="py-3 text-xs text-gray-600">
                          {shipment.createdAt
                            ? new Date(shipment.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3 text-xs text-gray-600">
                          {money(shipment.amount || shipment.totalAmount || 0)}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold ${
                              statusClass[status.toLowerCase()] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-8 text-center text-xs text-gray-500"
                    >
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
