import CustomDropdown from "../../components/common/CustomDropdown";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ClearSearchButton from "../../components/common/ClearSearchButton";
import { FiClock, FiRefreshCcw, FiSend } from "react-icons/fi";
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
    <div className="min-h-screen space-y-5 bg-[#f4f1eb] p-1 text-[#20201e]">
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

      <div className="grid gap-3 rounded-2xl border border-[#e8e1d6] bg-white p-3 shadow-sm lg:grid-cols-[auto_minmax(220px,1fr)_150px] lg:items-center">
        <div className="flex rounded-xl border border-[#e8e1d6] bg-[#faf8f4] p-1">
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
                  ? "rounded-lg bg-[#bf9948] text-white shadow-sm"
                  : "rounded-lg text-gray-600 hover:bg-white"
              }`}
            >
              {tab.label}
              {role === tab.value && (
                <span className="ml-2 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">
                  {tickets.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subject, category, or message"
            className="h-10 w-full rounded-lg border border-[#e8e1d6] bg-[#faf8f4] px-3 pr-10 text-sm outline-none transition focus:border-[#bf9948] focus:ring-2 focus:ring-[#bf9948]/15"
          />
          <ClearSearchButton value={search} onClear={() => setSearch("")} />
        </div>
        <CustomDropdown
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 w-full rounded-lg border border-[#e8e1d6] bg-[#faf8f4] px-3 text-sm outline-none transition focus:border-[#bf9948]"
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

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.9fr)]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e8e1d6] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-800 dark:text-white">
              {role === "shipper" ? "Shipper" : "Customer"} Ticket Table
            </p>
            <span className="text-xs font-semibold text-system-primary">
              {tickets.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-[#faf8f4] text-xs uppercase text-gray-500">
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

        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e8e1d6] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e8e1d6] px-5 py-4">
            <h2 className="text-base font-bold text-gray-800 dark:text-white">
              Ticket Details
            </h2>
            {selectedTicket && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedTicket.status]}`}>
                <span className="mr-1">•</span>{statusLabels[selectedTicket.status]}
              </span>
            )}
          </div>
          {selectedTicket ? (
            <div className="flex min-h-[520px] flex-col">
              <div className="space-y-3 border-b border-[#e8e1d6] p-4">
                <h3 className="text-base font-bold leading-snug text-slate-900">
                  {selectedTicket.subject}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{getTicketNumber(selectedTicket)}</span>
                  <span>From <b className="font-semibold text-slate-700">{requesterName(selectedTicket)}</b></span>
                  <span>Category <b className="font-semibold text-slate-700">{selectedTicket.category}</b></span>
                </div>
                <label className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                  Status
                  <CustomDropdown
                    value={selectedTicket.status}
                    onChange={(event) => updateStatus(event.target.value)}
                    disabled={saving}
                    className="h-10 min-w-[135px] rounded-lg border border-[#e8e1d6] bg-[#faf8f4] px-3 text-sm font-normal"
                  >
                    {statusOptions.filter((option) => option.value).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </CustomDropdown>
                </label>
              </div>

              <div className="max-h-[360px] min-h-[180px] flex-1 space-y-3 overflow-y-auto bg-[#faf8f4] p-4">
                {(selectedTicket.messages || []).map((item, index) => {
                  const isAdmin = item.senderRole === "admin";
                  return (
                    <div key={item._id || `${item.createdAt}-${index}`} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[88%] rounded-xl border px-3 py-2.5 ${isAdmin ? "border-[#f0e4c6] bg-[#f6edd8]" : "border-[#e8e1d6] bg-white"}`}>
                        <p className="mb-1 text-[11px] text-slate-500">
                          {isAdmin ? "You" : requesterName(selectedTicket)} · {formatDate(item.createdAt)}
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-5">{item.message}</p>
                      </div>
                    </div>
                  );
                })}
                {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                  <p className="py-8 text-center text-sm text-slate-500">No messages on this ticket yet.</p>
                )}
              </div>

              <form onSubmit={sendReply} className="border-t border-[#e8e1d6] p-4">
                <label className="mb-2 block text-xs font-semibold text-slate-700">Reply</label>
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={3}
                  placeholder={`Write a reply to ${requesterName(selectedTicket)}`}
                  className="w-full resize-y rounded-lg border border-[#e8e1d6] bg-[#faf8f4] px-3 py-2.5 text-sm outline-none focus:border-[#bf9948] focus:ring-2 focus:ring-[#bf9948]/15"
                  maxLength={3000}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="submit"
                    icon={<FiSend size={14} />}
                    loading={saving}
                    disabled={!reply.trim()}
                    className="rounded-lg bg-[#bf9948] text-white hover:bg-[#a98235]"
                  >
                    Send Reply
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
