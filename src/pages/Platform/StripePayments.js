import React, { useEffect, useState, useMemo } from "react";
import { useStripeAdmin } from "../../context/StripeAdminContext";
import { usePlatformSettings } from "../../context/PlatformSettingsContext";
import { HiOutlineCreditCard } from "react-icons/hi";
import { FiEye, FiEyeOff } from "react-icons/fi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const StripePayments = () => {
  const {
    balance,
    transactions,
    loading,
    fetchStripeBalance,
    fetchStripeTransactions,
  } = useStripeAdmin();

  const { settings } = usePlatformSettings();

  const [range, setRange] = useState("all");

  // transaction id show/hide
  const [visibleIds, setVisibleIds] = useState({});

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
     CALCULATE TOTALS
  ============================= */

  const totals = useMemo(() => {
    if (!transactions) return { paid: 0, stripeFee: 0, platformEarn: 0 };

    let paid = 0;
    let stripeFee = 0;
    let platformEarn = 0;

    transactions.forEach((t) => {
      const amount = Number(t.amount || 0);
      const fee = Number(t.fee || 0);
      const net = Number(t.net || 0);

      const platformFee = (net * platformPercent) / 100;
      const earn = net - platformFee;

      paid += amount;
      stripeFee += fee;
      platformEarn += earn;
    });

    return { paid, stripeFee, platformEarn };
  }, [transactions, platformPercent]);

  /* =============================
     CHART DATA
  ============================= */

  const chartData = useMemo(() => {
    if (!transactions) return [];

    return transactions.map((item) => {
      const net = Number(item.net || 0);
      const platformFee = (net * platformPercent) / 100;
      const earn = net - platformFee;

      return {
        date: new Date(item.created).toLocaleDateString(),
        paid: Number(item.amount),
        stripeFee: Number(item.fee),
        platformEarn: earn,
      };
    });
  }, [transactions, platformPercent]);

  return (
    <div className="space-y-6 w-full">
      {/* ================= TITLE ================= */}

      <div className="flex items-center gap-2">
        <HiOutlineCreditCard size={26} />
        <h1 className="text-xl font-bold dark:text-white">
          Payments Dashboard
        </h1>
      </div>

      {/* ================= BALANCE CARDS ================= */}

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
          <p className="text-gray-500 text-sm">Platform Earnings</p>
          <h2 className="text-2xl font-bold text-green-600">
            ${totals.platformEarn.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* ================= LINE CHART ================= */}

      <div className="bg-white dark:bg-dark shadow rounded-xl p-4 h-[260px]">
        <p className="text-sm font-semibold mb-3 dark:text-white">
          Revenue Analytics
        </p>

        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="platformEarn"
              stroke="#BF9B53"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= FILTER ================= */}

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

      {/* ================= TRANSACTION TABLE ================= */}

      <div className="bg-white dark:bg-dark shadow rounded-xl overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="border-b bg-light dark:bg-gray-800">
            <tr className="text-left text-gray-600 dark:text-gray-300">
              <th className="p-3">Transaction</th>
              <th className="p-3">Customer Paid</th>
              <th className="p-3">Payment Fee (Stripe) </th>
              <th className="p-3">After (Stripe)</th>
              <th className="p-3">Our Platform Fee</th>
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

                const platformFee = (net * platformPercent) / 100;
                const platformEarn = net - platformFee;

                return (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {/* Transaction ID hidden */}
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

                    <td className="p-3 text-yellow-600">
                      -${platformFee.toFixed(2)}
                    </td>

                    <td className="p-3 text-green-600 font-semibold">
                      ${platformEarn.toFixed(2)}
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
