import React, { useEffect, useState, useMemo } from "react";
import { useStripeAdmin } from "../../context/StripeAdminContext";
// import { HiOutlineCreditCard } from "react-icons/hi";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { usePlatformSettings } from "../../context/PlatformSettingsContext";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  // XAxis,
  YAxis,
  Tooltip,
  // CartesianGrid,
  // Legend,
} from "recharts";

const StripePayments = () => {
  const {
    balance,
    transactions,
    loading,
    fetchStripeBalance,
    fetchStripeTransactions,
  } = useStripeAdmin();

  const [range, setRange] = useState("all");
  const [visibleIds, setVisibleIds] = useState({});
  const { settings } = usePlatformSettings();

  // transaction id show/hide

  const platformPercent = settings?.platformFeePercent || 0;

  useEffect(() => {
    fetchStripeBalance();
    fetchStripeTransactions(range);
  }, [range, fetchStripeBalance, fetchStripeTransactions]);

  const toggleId = (id) => {
    setVisibleIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* =============================
     CALCULATE TOTALS (FROM DB VALUES)
  ============================= */
  const totals = useMemo(() => {
    if (!transactions) return { paid: 0, stripeFee: 0, platformEarn: 0 };

    let paid = 0;
    let stripeFee = 0;
    let platformEarn = 0;

    transactions.forEach((t) => {
      const amount = Number(t.amount || 0);
      const fee = Number(t.fee || 0);
      const platformFee = Number(t.platformFee || 0);

      paid += amount;
      stripeFee += fee;
      platformEarn += platformFee;
    });

    return { paid, stripeFee, platformEarn };
  }, [transactions]);

  /* =============================
     CHART DATA (only Paid + Stripe Fee)
  ============================= */
  const chartData = useMemo(() => {
    if (!transactions) return [];

    return transactions
      .map((t) => ({
        date: new Date(t.created).toLocaleDateString(),
        paid: Number(t.amount || 0),
        stripeFee: Number(t.fee || 0),
        rawDate: new Date(t.created),
      }))
      .sort((a, b) => a.rawDate - b.rawDate)
      .map(({ rawDate, ...rest }) => rest);
  }, [transactions]);

  return (
    <div className="space-y-6 w-full">
      {/* TITLE */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold dark:text-white">
          View All Transactions
        </h1>
      </div>

      {/* BALANCE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark shadow rounded-xl p-5 h-[120px] flex flex-col justify-center">
          <p className="text-gray-500 text-sm">Available Balance</p>
          <h2 className="text-2xl font-bold text-accent">
            ${Number(balance?.available || 0).toFixed(2)}
          </h2>
        </div>

        <div className="bg-white dark:bg-dark shadow rounded-xl p-5 h-[120px] flex flex-col justify-center">
          <p className="text-gray-500 text-sm">Pending Balance</p>
          <h2 className="text-2xl font-bold text-yellow-500">
            ${Number(balance?.pending || 0).toFixed(2)}
          </h2>
        </div>

        <div className="bg-white dark:bg-dark shadow rounded-xl p-5 h-[120px] flex flex-col justify-center">
          <p className="text-gray-500 text-sm">Platform Fee</p>
          <h2 className="text-2xl font-bold text-primary">
            {platformPercent}%
          </h2>
        </div>

        <div className="bg-white dark:bg-dark shadow rounded-xl p-5 h-[120px] flex flex-col justify-center">
          <p className="text-gray-500 text-sm">Total Stripe Fees</p>
          <h2 className="text-2xl font-bold text-red-500">
            ${totals.stripeFee.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-white dark:bg-dark shadow rounded-xl p-6 h-[300px]">
        <p className="text-sm font-semibold mb-3 dark:text-white">
          Revenue Analytics
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            {/* <XAxis dataKey="date" /> */}
            <YAxis />
            <Tooltip />
            {/* <Legend /> */}

            {/* Customer Paid line */}
            <Line
              type="monotone"
              dataKey="paid"
              stroke="#BF9B53"
              strokeWidth={2} // thicker line
              dot={false}
            />

            {/* Stripe Fee line */}
            <Line
              type="monotone"
              dataKey="stripeFee"
              stroke="#EF4444"
              strokeWidth={2} // thicker line
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* FILTER */}
      <div className="flex flex-wrap gap-2 justify-end">
        {["today", "week", "month", "all"].map((item) => (
          <button
            key={item}
            onClick={() => setRange(item)}
            className={`px-4 py-2 rounded-full text-sm border capitalize transition
            ${
              range === item
                ? "bg-[#BF9B53] text-white border-[#BF9B53]"
                : "bg-white dark:bg-dark border-gray-300 dark:border-gray-700 dark:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white dark:bg-dark shadow rounded-xl overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="border-b bg-light dark:bg-gray-800">
            <tr className="text-left text-gray-600 dark:text-gray-300">
              <th className="p-3">Transaction</th>
              <th className="p-3">Customer Paid</th>
              <th className="p-3">Stripe Fee</th>
              <th className="p-3">After Stripe</th>
              {/* <th className="p-3">Platform Fee (fixed)</th> */}
              <th className="p-3">Shipper Earn</th>
              <th className="p-3">Status</th>
              <th className="p-3">Currency</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="p-6 text-center">
                  Loading transactions...
                </td>
              </tr>
            ) : (
              transactions?.map((item) => {
                const amount = Number(item.amount || 0);
                const fee = Number(item.fee || 0);
                const net = Number(item.net || 0);
                const shipperEarn = Number(item.shipperReceives || 0);

                return (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {visibleIds[item.id] ? item.id : "••••••••••••••"}
                        </span>
                        <button
                          onClick={() => toggleId(item.id)}
                          className="text-gray-500 hover:text-primary"
                        >
                          {visibleIds[item.id] ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </td>

                    <td className="p-3 font-medium">${amount.toFixed(2)}</td>
                    <td className="p-3 text-red-500">-${fee.toFixed(2)}</td>
                    <td className="p-3">${net.toFixed(2)}</td>
                    {/* <td className="p-3 text-yellow-600">
                      -${platformFee.toFixed(2)}
                    </td> */}
                    <td className="p-3 text-green-600 font-semibold">
                      ${shipperEarn.toFixed(2)}
                    </td>
                    <td className="p-3 capitalize">{item.status}</td>
                    <td className="p-3 uppercase">{item.currency}</td>
                    <td className="p-3 whitespace-nowrap">
                      {new Date(item.created).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StripePayments;
