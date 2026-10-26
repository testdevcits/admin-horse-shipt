import CustomDropdown from "../../components/common/CustomDropdown";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ClearSearchButton from "../../components/common/ClearSearchButton";
import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiRefreshCcw,
  FiSend,
} from "react-icons/fi";
import API from "../../api/axios";
import Button from "../../components/common/Button";

const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const statusStyles = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
};

const tabs = [
  { label: "Shipper Tickets", value: "shipper" },
  { label: "Customer Tickets", value: "customer" },
];

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "N/A";

const requesterName = (ticket) =>
  ticket.requester?.name || ticket.requester?.email || "Unknown user";

const getTicketNumber = (ticket) =>
  ticket?._id ? `HS-${ticket._id.slice(-6).toUpperCase()}` : "HS-NEW";

const getInitialIssue = (ticket) =>
  ticket?.messages?.find((item) => item.senderRole === ticket.requesterRole);

const getLatestAdminReply = (ticket) =>
  [...(ticket?.messages || [])]
    .reverse()
    .find((item) => item.senderRole === "admin");

const SupportInbox = () => {
  const [role, setRole] = useState("shipper");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket._id === selectedId) || null,
    [selectedId, tickets]
  );

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await API.get("/admin/support", {
        params: {
          role,
          status: status || undefined,
          search: search || undefined,
          limit: 50,
        },
      });
      const nextTickets = res.data?.data || [];
      setTickets(nextTickets);
      setSelectedId((current) => {
        if (nextTickets.some((ticket) => ticket._id === current)) return current;
        return nextTickets[0]?._id || null;
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.response?.data?.message || "Failed to load support tickets.",
      });
    } finally {
      setLoading(false);
    }
  }, [role, search, status]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const replaceTicket = (updatedTicket) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket._id === updatedTicket._id ? updatedTicket : ticket
      )
    );
  };

  const updateStatus = async (nextStatus) => {
    if (!selectedTicket) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await API.patch(`/admin/support/${selectedTicket._id}/status`, {
        status: nextStatus,
      });
      replaceTicket(res.data?.data);
      setNotice({ type: "success", message: "Ticket status updated." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.response?.data?.message || "Failed to update ticket.",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!selectedTicket || !reply.trim()) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await API.post(`/admin/support/${selectedTicket._id}/reply`, {
        message: reply,
      });
      replaceTicket(res.data?.data);
      setReply("");
      setNotice({ type: "success", message: "Admin response saved." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.response?.data?.message || "Failed to save response.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Support Tickets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review user queries, reply, and update ticket status.
          </p>
        </div>
        <Button
          variant="outline"
          icon={<FiRefreshCcw size={14} />}
          onClick={loadTickets}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-3 border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center">
        <div className="inline-flex w-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800 md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setRole(tab.value);
                setSelectedId(null);
              }}
              className={`flex-1 px-4 py-2 text-sm font-semibold transition md:flex-none ${
                role === tab.value
                  ? "bg-system-primary text-white"
                  : "text-gray-600 hover:text-system-primary dark:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subject, category, or message"
            className="w-full border border-gray-300 px-3 py-2 pr-10 text-sm outline-none transition focus:border-system-primary focus:ring-2 focus:ring-system-primary/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <ClearSearchButton value={search} onClear={() => setSearch("")} />
        </div>
        <CustomDropdown
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-system-primary focus:ring-2 focus:ring-system-primary/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </CustomDropdown>
      </div>

      {notice && (
        <div
          className={`border px-4 py-3 text-sm font-medium ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
              : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-800 dark:text-white">
              {role === "shipper" ? "Shipper" : "Customer"} Ticket Table
            </p>
            <span className="text-xs font-semibold text-system-primary">
              {tickets.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-5 text-sm text-gray-500">
                      Loading tickets...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-5 text-sm text-gray-500">
                      No support tickets found.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      onClick={() => setSelectedId(ticket._id)}
                      className={`cursor-pointer border-t border-gray-100 transition hover:bg-system-primary/5 dark:border-gray-800 dark:hover:bg-gray-800 ${
                        selectedId === ticket._id ? "bg-system-primary/10 dark:bg-gray-800" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-bold text-system-primary">
                        {getTicketNumber(ticket)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {requesterName(ticket)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {ticket.requester?.email || "No email"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {ticket.subject}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {ticket.category}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-bold ${
                            statusStyles[ticket.status]
                          }`}
                        >
                          {statusLabels[ticket.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(ticket.lastMessageAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-bold text-gray-800 dark:text-white">
              Ticket Details
            </h2>
          </div>
          {selectedTicket ? (
            <div className="space-y-5 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-xs font-bold uppercase text-gray-500">Ticket ID</p>
                  <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                    {getTicketNumber(selectedTicket)}
                  </p>
                </div>
                <div className="border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-xs font-bold uppercase text-gray-500">Priority</p>
                  <p className="mt-1 text-sm font-bold capitalize text-gray-900 dark:text-white">
                    {selectedTicket.priority}
                  </p>
                </div>
                <div className="border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-xs font-bold uppercase text-gray-500">Status</p>
                  <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                    {statusLabels[selectedTicket.status]}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Submitted By</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {requesterName(selectedTicket)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTicket.requester?.email || "No email"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Subject</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedTicket.subject}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Issue Details</p>
                <div className="mt-2 border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800 dark:text-gray-100">
                    {getInitialIssue(selectedTicket)?.message || "No issue details available."}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Latest Admin Response</p>
                <div className="mt-2 border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  {getLatestAdminReply(selectedTicket) ? (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800 dark:text-gray-100">
                        {getLatestAdminReply(selectedTicket).message}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {formatDate(getLatestAdminReply(selectedTicket).createdAt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No admin response yet.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase text-gray-500">
                  Ticket Activity
                </p>
                <div className="space-y-3">
                  {selectedTicket.messages?.map((item) => (
                    <div
                      key={item._id || item.createdAt}
                      className="border-l-2 border-system-primary pl-3"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-gray-500">
                        {item.senderRole === "admin" ? <FiCheckCircle /> : <FiFileText />}
                        {item.senderRole === "admin" ? "Admin Response" : "User Update"}
                        <span className="font-medium normal-case">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-800 dark:text-gray-100">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={sendReply} className="border-t border-gray-200 pt-4 dark:border-gray-800">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Admin Response
                </label>
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={4}
                  placeholder="Write a clear support response"
                  className="w-full resize-none border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-system-primary focus:ring-2 focus:ring-system-primary/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  maxLength={3000}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    icon={<FiSend size={14} />}
                    loading={saving}
                    disabled={!reply.trim()}
                  >
                    Save Reply
                  </Button>
                  <Button
                    variant="outline"
                    icon={<FiClock size={14} />}
                    disabled={saving || selectedTicket.status === "in_progress"}
                    onClick={() => updateStatus("in_progress")}
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    variant="outline"
                    icon={<FiCheckCircle size={14} />}
                    disabled={saving || selectedTicket.status === "resolved"}
                    onClick={() => updateStatus("resolved")}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center gap-2 p-8 text-center text-gray-500 dark:text-gray-400">
              <FiClock />
              Select a ticket from the table.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SupportInbox;
