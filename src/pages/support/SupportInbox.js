import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiMessageSquare, FiRefreshCcw, FiSend } from "react-icons/fi";
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
  { label: "Shipper", value: "shipper" },
  { label: "Customer", value: "customer" },
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
        hour: "numeric",
        minute: "2-digit",
      })
    : "N/A";

const requesterName = (ticket) =>
  ticket.requester?.name || ticket.requester?.email || "Unknown user";

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
      setNotice({ type: "success", message: "Reply sent successfully." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.response?.data?.message || "Failed to send reply.",
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
            Support Inbox
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Reply to support messages and mark requests in progress or resolved.
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
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search subject, category, or message"
          className="min-w-0 flex-1 border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-system-primary focus:ring-2 focus:ring-system-primary/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-system-primary focus:ring-2 focus:ring-system-primary/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-800 dark:text-white">
              {role === "shipper" ? "Shipper" : "Customer"} Queries
            </p>
            <span className="text-xs font-semibold text-system-primary">
              {tickets.length}
            </span>
          </div>
          <div className="max-h-[680px] overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                Loading tickets...
              </p>
            ) : tickets.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                No support queries found.
              </p>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket._id}
                  type="button"
                  onClick={() => setSelectedId(ticket._id)}
                  className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-system-primary/5 dark:border-gray-800 dark:hover:bg-gray-800 ${
                    selectedId === ticket._id
                      ? "bg-system-primary/10 dark:bg-gray-800"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800 dark:text-white">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {requesterName(ticket)} • {ticket.category}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 text-[10px] font-bold ${
                        statusStyles[ticket.status]
                      }`}
                    >
                      {statusLabels[ticket.status]}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">
                    {ticket.latestMessage?.message || "No message"}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="flex min-h-[680px] flex-col border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {selectedTicket ? (
            <>
              <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {requesterName(selectedTicket)} • {selectedTicket.requester?.email || "No email"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Created {formatDate(selectedTicket.createdAt)} • Last message {formatDate(selectedTicket.lastMessageAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<FiClock size={13} />}
                      disabled={saving || selectedTicket.status === "in_progress"}
                      onClick={() => updateStatus("in_progress")}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<FiCheckCircle size={13} />}
                      disabled={saving || selectedTicket.status === "resolved"}
                      onClick={() => updateStatus("resolved")}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-5 dark:bg-gray-950/40">
                {selectedTicket.messages?.map((item) => {
                  const adminMessage = item.senderRole === "admin";
                  return (
                    <div
                      key={item._id || item.createdAt}
                      className={`flex ${adminMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] border px-4 py-3 text-sm shadow-sm ${
                          adminMessage
                            ? "border-system-primary/30 bg-system-primary text-white"
                            : "border-gray-200 bg-white text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-6">{item.message}</p>
                        <p
                          className={`mt-2 text-[10px] ${
                            adminMessage ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {adminMessage ? "Admin" : selectedTicket.requesterRole} • {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={sendReply} className="border-t border-gray-200 p-4 dark:border-gray-800">
                <div className="flex gap-3">
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    rows={2}
                    placeholder="Write admin reply"
                    className="min-h-[44px] flex-1 resize-none border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-system-primary focus:ring-2 focus:ring-system-primary/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    maxLength={3000}
                  />
                  <button
                    type="submit"
                    disabled={saving || !reply.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center bg-system-primary text-white transition hover:opacity-90 disabled:opacity-60"
                    title="Send reply"
                  >
                    {saving ? <FiMessageSquare /> : <FiSend />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
              Select a support query to view messages.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SupportInbox;
