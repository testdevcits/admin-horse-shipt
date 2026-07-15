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
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiRefreshCw,
  FiTruck,
  FiUsers,
  FiX,
} from "react-icons/fi";
import API from "../../api/axios";
import Pagination from "../../components/common/Pagination";
import { Skeleton } from "../../components/common/Skeleton";
import { useStripeAdmin } from "../../context/StripeAdminContext";

const money = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const moneyDetailed = (value = 0, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const number = (value = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const CHART_GOLD = "#BF9B53";
const rangeOptions = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const stripeRangeMap = {
  day: "today",
  week: "week",
  month: "month",
};

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const parseDateKey = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const monthTitle = (date) =>
  date.toLocaleString("en-US", { month: "long", year: "numeric" });

const buildCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: toDateKey(date),
      day: date.getDate(),
      date,
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

const formatRangeLabel = (rangeValue) =>
  rangeValue.startDate && rangeValue.endDate
    ? `${rangeValue.startDate} - ${rangeValue.endDate}`
    : "Select Date Range";

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

const SmoothLoader = ({ show }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-start justify-center bg-slate-100/55 pt-24 backdrop-blur-[1px] transition-opacity dark:bg-gray-950/45">
      <div className="flex items-center gap-3 rounded-sm border border-[#BF9B53]/30 bg-white px-4 py-3 text-xs font-semibold text-gray-700 shadow-lg dark:bg-gray-900 dark:text-gray-200">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#E8D7AD] border-t-[#BF9B53]" />
        Updating dashboard data...
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [draftDateRange, setDraftDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const pendingPageSize = 5;
  const {
    balance,
    transferAvailability,
    transactions,
    fetchStripeBalance,
    fetchTransferAvailability,
    fetchStripeTransactions,
  } = useStripeAdmin();
  const hasCustomDateRange = Boolean(dateRange.startDate && dateRange.endDate);
  const filterParams = useMemo(() => {
    if (hasCustomDateRange) {
      return {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
    }

    return { range };
  }, [dateRange.endDate, dateRange.startDate, hasCustomDateRange, range]);
  const stripeRange = hasCustomDateRange ? "custom" : stripeRangeMap[range] || "month";

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardRes] = await Promise.all([
          API.get("/admin/dashboard/overview", {
            params: filterParams,
          }),
          fetchStripeBalance(),
          fetchTransferAvailability(filterParams),
          fetchStripeTransactions(stripeRange, {
            ...filterParams,
            page: 1,
            limit: 10,
          }),
        ]);

        if (active && dashboardRes.data.success) {
          setDashboard(dashboardRes.data.data);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, [
    fetchStripeBalance,
    fetchStripeTransactions,
    fetchTransferAvailability,
    filterParams,
    stripeRange,
  ]);

  const totals = useMemo(() => dashboard?.totals || {}, [dashboard]);
  const monthly = useMemo(
    () => dashboard?.charts?.trend || dashboard?.charts?.monthly || [],
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

  const ledger = transferAvailability?.ledger || {};
  const stripeReport = transferAvailability?.stripe || {};
  const reportCurrency = (
    transferAvailability?.currency ||
    balance?.currency ||
    "usd"
  ).toUpperCase();
  const transferBreakdown = [
    {
      label: "Monthly/Annual Fees",
      value: ledger.subscriptionFees,
      note: "Paid subscription income",
    },
    {
      label: "Completed Shipment Fees",
      value: ledger.shipmentPlatformFees,
      note: "Completed and paid out",
    },
    {
      label: "Pending Shipper Transfers",
      value: ledger.pendingShipperTransfers,
      note: "Do not move to client bank yet",
    },
    {
      label: "Stripe Pending",
      value: stripeReport.pending,
      note: "Not available for transfer",
    },
  ];
  const stripeChartData = (transactions || [])
    .map((item) => ({
      date: item.created ? new Date(item.created).toLocaleDateString() : "N/A",
      paid: Number(item.amount || 0),
      stripeFee: Number(item.fee || 0),
      platformFee: Number(item.platformFee || 0),
      rawDate: item.created ? new Date(item.created) : new Date(0),
    }))
    .sort((a, b) => a.rawDate - b.rawDate)
    .map(({ rawDate, ...item }) => item);
  const recentPlatformFees =
    transferAvailability?.recentCompletedShipmentFees || [];
  const refreshStripeSummary = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStripeBalance(),
        fetchTransferAvailability(filterParams),
        fetchStripeTransactions(stripeRange, {
          ...filterParams,
          page: 1,
          limit: 10,
        }),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (value) => {
    setRange(value);
    setDateRange({ startDate: "", endDate: "" });
    setDraftDateRange({ startDate: "", endDate: "" });
  };

  const openCalendar = () => {
    setDraftDateRange(dateRange);
    const initialDate = parseDateKey(dateRange.startDate) || new Date();
    setCalendarMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    setCalendarOpen(true);
  };

  const closeCalendar = () => {
    setCalendarOpen(false);
    setDraftDateRange(dateRange);
  };

  const moveCalendarMonth = (direction) => {
    setCalendarMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + direction);
      return next;
    });
  };

  const handleCalendarDayClick = (dayKey) => {
    setDraftDateRange((current) => {
      if (!current.startDate || current.endDate || dayKey < current.startDate) {
        return { startDate: dayKey, endDate: "" };
      }

      return { ...current, endDate: dayKey };
    });
  };

  const applyDateRange = () => {
    if (!draftDateRange.startDate || !draftDateRange.endDate) return;
    setDateRange(draftDateRange);
    setCalendarOpen(false);
  };

  const calendarDays = buildCalendarDays(calendarMonth);
  const draftStart = draftDateRange.startDate;
  const draftEnd = draftDateRange.endDate;
  const isRefreshing = loading && dashboard;

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-base font-bold text-[#17184b] dark:text-white">
          Dashboard
        </h1>

        <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end sm:self-auto">
          <div className="flex items-center gap-1 rounded-sm border border-gray-100 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
            {rangeOptions.map((item) => (
              <button
                key={item.value}
                onClick={() => handleRangeChange(item.value)}
                className={`h-8 px-4 rounded-sm text-[11px] font-semibold transition ${
                  range === item.value && !hasCustomDateRange
                    ? "bg-[#BF9B53] text-white"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={openCalendar}
              className={`inline-flex h-10 min-w-[220px] items-center justify-between gap-3 rounded-sm border px-3 text-xs font-semibold transition ${
                hasCustomDateRange
                  ? "border-[#BF9B53] bg-[#fff7df] text-[#9a741e]"
                  : "border-gray-100 bg-white text-gray-600 hover:border-[#BF9B53] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <FiCalendar size={14} />
                {formatRangeLabel(dateRange)}
              </span>
            </button>

            {calendarOpen && (
              <div className="absolute right-0 top-12 z-40 w-[350px] max-w-[calc(100vw-2rem)] rounded-md border border-[#D9A43A] bg-white p-4 shadow-2xl dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Select Date Range
                    </h3>
                    <p className="mt-2 text-[11px] text-gray-500">
                      Dashboard data will update after apply.
                    </p>
                  </div>
                  <button
                    onClick={closeCalendar}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <FiX size={16} />
                  </button>
                </div>

                <div className="mt-4 rounded-md border border-[#D9A43A] p-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => moveCalendarMonth(-1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-[#D9A43A] text-[#BF9B53] transition hover:bg-[#fff7df]"
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {monthTitle(calendarMonth)}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Select start and end date
                      </p>
                    </div>
                    <button
                      onClick={() => moveCalendarMonth(1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-[#D9A43A] text-[#BF9B53] transition hover:bg-[#fff7df]"
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-500">
                    {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {calendarDays.map((day) => {
                      const isStart = day.key === draftStart;
                      const isEnd = day.key === draftEnd;
                      const isInRange =
                        draftStart && draftEnd && day.key > draftStart && day.key < draftEnd;
                      return (
                        <button
                          key={day.key}
                          onClick={() => handleCalendarDayClick(day.key)}
                          className={`h-9 rounded-sm text-xs font-semibold transition ${
                            isStart || isEnd
                              ? "bg-[#C79B3A] text-white"
                              : isInRange
                              ? "bg-[#fff0bf] text-[#9a741e]"
                              : day.isCurrentMonth
                              ? "text-gray-800 hover:bg-[#fff7df] dark:text-gray-100"
                              : "text-gray-300 hover:bg-gray-50 dark:text-gray-600 dark:hover:bg-gray-800"
                          }`}
                        >
                          {day.day}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-sm border border-[#D9A43A] bg-[#fffaf2] px-3 py-2 text-xs font-semibold text-[#9a741e]">
                    {formatRangeLabel(draftDateRange)}
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={closeCalendar}
                      className="h-9 rounded-sm border border-gray-200 px-4 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyDateRange}
                      disabled={!draftStart || !draftEnd}
                      className="h-9 rounded-sm border border-[#D9A43A] px-5 text-xs font-semibold text-[#9a741e] transition hover:bg-[#BF9B53] hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <SmoothLoader show={isRefreshing} />

      <section className="bg-white dark:bg-gray-800 border border-[#BF9B53]/30 dark:border-[#BF9B53]/40 rounded-sm p-5 transition-opacity duration-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#BF9B53]">
              Stripe Client Bank Transfer
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-950 dark:text-white">
              Dashboard Home Report
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-gray-500 dark:text-gray-400">
              Shows the amount actually available to move to the client bank:
              subscription fees plus completed shipment platform fees, capped by
              live Stripe available balance.
            </p>
          </div>
          <button
            onClick={refreshStripeSummary}
            disabled={isRefreshing}
            className="inline-flex h-9 items-center justify-center gap-2 border border-[#BF9B53] px-3 text-xs font-semibold text-[#BF9B53] transition hover:bg-[#BF9B53] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-[#BF9B53]"
          >
            <FiRefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="border border-gray-100 bg-[#fffaf2] p-5 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs font-semibold text-gray-500">
              Recommended Transfer To Bank
            </p>
            <p className="mt-3 text-3xl font-black text-emerald-600">
              {moneyDetailed(
                transferAvailability?.recommendedTransferToClientBank || 0,
                reportCurrency
              )}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500">Stripe Available</p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">
                  {moneyDetailed(stripeReport.available || 0, reportCurrency)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Ledger Platform Funds</p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">
                  {moneyDetailed(
                    ledger.appLedgerPlatformFunds || 0,
                    reportCurrency
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {transferBreakdown.map((item) => (
              <div
                key={item.label}
                className="border border-gray-100 p-4 dark:border-gray-700"
              >
                <p className="text-xs font-semibold text-gray-500">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-bold text-gray-950 dark:text-white">
                  {moneyDetailed(item.value || 0, reportCurrency)}
                </p>
                <p className="mt-1 text-[11px] text-gray-500">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="h-[260px] border border-gray-100 p-4 dark:border-gray-700">
            {stripeChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stripeChartData} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid stroke="#edf0f7" vertical={false} />
                  <XAxis
                    dataKey="date"
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
                    formatter={(value, name) => [
                      moneyDetailed(value, reportCurrency),
                      name === "paid"
                        ? "Customer Paid"
                        : name === "stripeFee"
                        ? "Stripe Fee"
                        : "Platform Fee",
                    ]}
                    contentStyle={{
                      borderRadius: 4,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="paid"
                    stroke={CHART_GOLD}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="platformFee"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="stripeFee"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState message="No Stripe transaction data found." />
            )}
          </div>

          <div className="border border-gray-100 dark:border-gray-700">
            <div className="border-b border-gray-100 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Recent completed shipment fees
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                {ledger.completedPaidTransferredShipments || 0} paid-out
                completed shipments in ledger
              </p>
            </div>
            <div className="max-h-[260px] overflow-y-auto overflow-x-hidden">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="sticky top-0 bg-white dark:bg-gray-800">
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="w-[38%] p-3 font-medium">Shipper</th>
                    <th className="w-[20%] p-3 font-medium">Paid</th>
                    <th className="w-[22%] p-3 font-medium">Platform Fee</th>
                    <th className="w-[20%] p-3 font-medium">Released</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPlatformFees.length ? (
                    recentPlatformFees.slice(0, 6).map((item) => (
                      <tr
                        key={item.quoteId}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="truncate p-3 text-gray-700 dark:text-gray-200">
                          {item.shipper?.companyName ||
                            item.shipper?.name ||
                            item.shipper?.email ||
                            "Shipper"}
                        </td>
                        <td className="truncate p-3 text-gray-600">
                          {moneyDetailed(item.totalPrice || 0, reportCurrency)}
                        </td>
                        <td className="truncate p-3 font-semibold text-[#BF9B53]">
                          {moneyDetailed(item.platformFee || 0, reportCurrency)}
                        </td>
                        <td className="truncate p-3 text-gray-600">
                          {item.paymentReleasedAt
                            ? new Date(item.paymentReleasedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-gray-500">
                        No completed paid shipment fees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white dark:bg-gray-800 border border-[#BF9B53]/30 dark:border-[#BF9B53]/40 rounded-sm p-5">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Orders
            </h2>
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
          <div className="mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Payments
            </h2>
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
    </div>
  );
};

export default Dashboard;
