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
import Pagination from "../../components/common/Pagination";
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
  open_for_offers: "bg-cyan-50 text-cyan-600",
  pending: "bg-amber-50 text-amber-600",
  paid: "bg-emerald-50 text-emerald-600",
  unpaid: "bg-amber-50 text-amber-600",
  draft: "bg-gray-100 text-gray-600",
  cancelled: "bg-rose-50 text-rose-600",
  canceled: "bg-rose-50 text-rose-600",
  rejected: "bg-rose-50 text-rose-600",
  completed: "bg-green-50 text-green-600",
  accepted: "bg-blue-50 text-blue-600",
  assigned: "bg-indigo-50 text-indigo-600",
};

const formatStatus = (value = "pending") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const shortId = (value = "") => String(value || "").slice(-7).toUpperCase();

const userName = (user, fallback = "Unknown") =>
  user?.name || user?.email || fallback;

const CHART_GOLD = "#BF9B53";
const CHART_GOLD_DARK = "#997C42";
const rangeOptions = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-100 dark:bg-gray-950 -m-4 sm:-m-6 p-4 sm:p-6 font-montserrat">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-5 w-28" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-sm" />
        <Skeleton className="h-8 w-8 rounded-sm" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 p-5 min-h-[145px]">
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
        <div key={title} className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 p-5">
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
        <div key={index} className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 p-5 min-h-[112px]">
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
        <div key={tableIndex} className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-700 p-5">
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

const ChartEmptyState = ({ message }) => (
  <div className="flex h-[280px] items-center justify-center border border-dashed border-[#BF9B53]/30 bg-[#BF9B53]/5 text-xs font-medium text-gray-500 dark:text-gray-300">
    {message}
  </div>
);

const StatCard = ({ active, color, icon, label, value, note, data }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-sm border p-5 min-h-[145px] ${
      active
        ? "border-[#BF9B53] ring-2 ring-[#BF9B53]/20"
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
        <p className="mt-2 text-[11px] text-gray-500">{note}</p>
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
  const [range, setRange] = useState("month");
  const [pendingPage, setPendingPage] = useState(1);
  const pendingPageSize = 5;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await API.get("/admin/dashboard/overview", {
          params: { range },
        });
        if (res.data.success) setDashboard(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [range]);

  const totals = useMemo(() => dashboard?.totals || {}, [dashboard]);
  const monthly = useMemo(
    () => dashboard?.charts?.trend || dashboard?.charts?.monthly || [],
    [dashboard]
  );
  const recentShipments = useMemo(
    () => dashboard?.recent?.shipments || [],
    [dashboard]
  );
  const recentPayments = useMemo(
    () => dashboard?.recent?.payments || [],
    [dashboard]
  );
  const pendingSignups = useMemo(
    () => dashboard?.recent?.pendingSignups || [],
    [dashboard]
  );
  const pendingTotalPages = Math.max(
    1,
    Math.ceil(pendingSignups.length / pendingPageSize)
  );
  const paginatedPendingSignups = pendingSignups.slice(
    (pendingPage - 1) * pendingPageSize,
    pendingPage * pendingPageSize
  );

  const chartData = useMemo(() => {
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

  const recentOrders = recentPayments.slice(0, 5);
  const topRoutes = recentShipments.slice(0, 5);
  const paymentSeries = chartData.slice(-6).map((item) => ({
    value: item.payments || 0,
  }));

  const primaryStats = [
    {
      label: "Total Orders",
      value: number(totals.shipments || 0),
      note: "Live total from dashboard API",
      color: CHART_GOLD,
      icon: <FiShoppingBag size={17} />,
      active: true,
      data: miniSeries,
    },
    {
      label: "Total Revenue (GMV)",
      value: money(totals.totalPayments || 0),
      note: "Paid and recorded payment total",
      color: CHART_GOLD_DARK,
      icon: <FiTruck size={17} />,
      data: paymentSeries,
    },
    {
      label: "Paid Transactions",
      value: number(totals.paidTransactions || 0),
      note: "Successful payment count",
      color: CHART_GOLD,
      icon: <FiTag size={17} />,
      data: miniSeries,
    },
  ];

  const secondaryStats = [
    {
      label: "Customers",
      value: number(totals.customers || 0),
      note: "Registered customer accounts",
      color: "#10b981",
      icon: <FiUsers size={17} />,
    },
    {
      label: "Shippers",
      value: number(totals.shippers || 0),
      note: "Registered shipper accounts",
      color: "#ef4444",
      icon: <FiTruck size={17} />,
    },
    {
      label: "Pending Shipments",
      value: number(totals.pendingShipments || 0),
      note: "Shipments waiting for action",
      color: "#f97316",
      icon: <FiBox size={17} />,
    },
    {
      label: "Pending Signups",
      value: number(totals.pendingSignups || 0),
      note: "Email verification pending",
      color: CHART_GOLD,
      icon: <FiUsers size={17} />,
    },
  ];

  if (loading && !dashboard) {
    return <DashboardSkeleton />;
  }

  const hasOrderChartData = chartData.some((item) => Number(item.orders) > 0);
  const hasPaymentChartData = chartData.some(
    (item) => Number(item.payments) > 0
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 -m-4 sm:-m-6 p-4 sm:p-6 font-montserrat">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-base font-bold text-[#17184b] dark:text-white">
          Dashboard
        </h1>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[#17184b] dark:text-white flex items-center justify-center rounded-sm">
            <FiSearch size={14} />
          </button>
          <button className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[#17184b] dark:text-white flex items-center justify-center rounded-sm">
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
        <section className="bg-white dark:bg-gray-800 border border-[#BF9B53]/30 dark:border-[#BF9B53]/40 rounded-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Orders
            </h2>

            <div className="flex items-center gap-1">
              {rangeOptions.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setRange(item.value)}
                  className={`px-3 h-8 rounded-sm border text-[11px] font-semibold ${
                    range === item.value
                      ? "bg-[#BF9B53] border-[#BF9B53] text-white"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {hasOrderChartData ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_GOLD} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_GOLD} stopOpacity={0.04} />
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
                  stroke={CHART_GOLD}
                  strokeWidth={2}
                  fill="url(#ordersFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: CHART_GOLD }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="No order data for this range." />
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 border border-[#BF9B53]/30 dark:border-[#BF9B53]/40 rounded-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Payments
            </h2>

            <div className="flex items-center gap-1">
              {rangeOptions.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setRange(item.value)}
                  className={`px-3 h-8 rounded-sm border text-[11px] font-semibold ${
                    range === item.value
                      ? "bg-[#BF9B53] border-[#BF9B53] text-white"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {hasPaymentChartData ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="paymentsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_GOLD} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={CHART_GOLD} stopOpacity={0.04} />
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
                  stroke={CHART_GOLD}
                  strokeWidth={2}
                  fill="url(#paymentsFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: CHART_GOLD }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="No payment data for this range." />
          )}
        </section>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-5">
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
              {stat.note}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-sm p-5 overflow-hidden">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">
            Top Routes
          </h2>

          <div className="mb-3 border border-gray-100 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Total routes:{" "}
              <span className="text-[#BF9B53]">{topRoutes.length}</span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-[11px] text-gray-500 border-b border-gray-100">
                  <th className="font-medium pb-3">Route</th>
                  <th className="font-medium pb-3">Customer</th>
                  <th className="font-medium pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.length ? (
                  topRoutes.map((shipment) => {
                    const status = String(shipment.status || "pending");
                    return (
                      <tr
                        key={shipment._id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-3 min-w-[220px]">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">
                            {shipment.pickupLocation || "Pickup pending"}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1">
                            {shipment.deliveryLocation || "Delivery pending"}
                          </p>
                        </td>
                        <td className="py-3 text-xs text-gray-600">
                          <p>{userName(shipment.customer, "Unknown Customer")}</p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {shipment.shipmentCode || `#${shortId(shipment._id)}`}
                          </p>
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                              statusClass[status.toLowerCase()] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatStatus(status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
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

          <div className="mb-3 border border-gray-100 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Total recent orders:{" "}
              <span className="text-[#BF9B53]">{recentOrders.length}</span>
            </p>
          </div>

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
                  recentOrders.map((payment) => {
                    const status = String(
                      payment.paymentStatus || payment.status || "pending"
                    );
                    const shipment = payment.shipment;
                    return (
                      <tr
                        key={payment._id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-3 text-xs font-semibold text-gray-900 dark:text-white">
                          #{shipment?.shipmentCode || shortId(payment._id)}
                        </td>
                        <td className="py-3 text-xs text-gray-600">
                          <p>{userName(shipment?.customer, "Unknown Customer")}</p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            Shipper: {userName(payment.shipper, "Unknown Shipper")}
                          </p>
                        </td>
                        <td className="py-3 text-xs text-gray-600">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3 text-xs text-gray-600">
                          {money(payment.totalPrice || 0)}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold ${
                              statusClass[status.toLowerCase()] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatStatus(status)}
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

      <section className="mt-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-sm p-5 overflow-hidden">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">
          Pending Email Verifications
        </h2>

        <div className="mb-3 border border-gray-100 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Total pending verifications:{" "}
            <span className="text-[#BF9B53]">{pendingSignups.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-[11px] text-gray-500 border-b border-gray-100">
                <th className="font-medium pb-3">Name</th>
                <th className="font-medium pb-3">Email</th>
                <th className="font-medium pb-3">Role</th>
                <th className="font-medium pb-3">OTP Expires</th>
                <th className="font-medium pb-3 text-right">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPendingSignups.length ? (
                paginatedPendingSignups.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-3 text-xs font-semibold text-gray-900 dark:text-white">
                      {item.name || "Pending user"}
                    </td>
                    <td className="py-3 text-xs text-gray-600">
                      {item.email}
                    </td>
                    <td className="py-3 text-xs text-gray-600 capitalize">
                      {item.role}
                    </td>
                    <td className="py-3 text-xs text-gray-600">
                      {item.otpExpiresAt
                        ? new Date(item.otpExpiresAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="py-3 text-xs text-gray-600 text-right">
                      {item.attempts || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-xs text-gray-500"
                  >
                    No pending email verifications.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={pendingPage}
          totalPages={pendingTotalPages}
          onPageChange={setPendingPage}
        />
      </section>
    </div>
  );
};

export default Dashboard;
