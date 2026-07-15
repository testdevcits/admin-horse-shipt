import React, { useCallback, useEffect, useState } from "react";
import { FiBell, FiCheckCircle, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import API from "../../api/axios";
import ConfirmModal from "../../components/common/ConfirmModal";
import Pagination from "../../components/common/Pagination";
import Toast from "../../components/common/Toast";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const roleOptions = [
  { label: "All Roles", value: "" },
  { label: "Customer", value: "customer" },
  { label: "Shipper", value: "shipper" },
  { label: "Admin", value: "admin" },
  { label: "Super Admin", value: "super-admin" },
];

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState({ total: 0, unread: 0, enabled: true });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    ids: [],
  });
  const [toast, setToast] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 400);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/notifications", {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          role,
          status,
        },
      });
      setNotifications(Array.isArray(res.data?.data) ? res.data.data : []);
      setSummary(res.data?.summary || { total: 0, unread: 0, enabled: true });
      setPagination(
        res.data?.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 1,
        }
      );
      setSelectedIds(new Set());
    } catch (error) {
      setToast({
        type: "error",
        message:
          error?.response?.data?.message || "Failed to fetch notifications",
      });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, role, status]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const enabled = summary.enabled !== false;
  const allSelected =
    notifications.length > 0 && selectedIds.size === notifications.length;

  const toggleSelectAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(notifications.map((item) => item._id))
    );
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openDeleteConfirm = (ids) => {
    if (!ids.length) return;
    setDeleteConfirm({ open: true, ids });
  };

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setDeleteConfirm({ open: false, ids: [] });
  };

  const confirmDeleteNotifications = async () => {
    const ids = deleteConfirm.ids;
    if (!ids.length) return;
    setDeleting(true);
    try {
      if (ids.length === 1) {
        await API.delete(`/admin/notifications/${ids[0]}`);
      } else {
        await API.delete("/admin/notifications", { data: { ids } });
      }
      setToast({
        type: "success",
        message: `${ids.length} notification${
          ids.length !== 1 ? "s" : ""
        } deleted successfully`,
      });
      setDeleteConfirm({ open: false, ids: [] });
      await loadNotifications();
    } catch (error) {
      setToast({
        type: "error",
        message:
          error?.response?.data?.message || "Failed to delete notification",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 -m-4 p-4 font-montserrat dark:bg-gray-950 sm:-m-6 sm:p-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <ConfirmModal
        show={deleteConfirm.open}
        title={
          deleteConfirm.ids.length > 1
            ? "Delete Notifications"
            : "Delete Notification"
        }
        message={`Are you sure you want to delete ${
          deleteConfirm.ids.length
        } notification${deleteConfirm.ids.length !== 1 ? "s" : ""}? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        onCancel={closeDeleteConfirm}
        onConfirm={confirmDeleteNotifications}
      />

      <div className="mb-6 flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[#BF9B53]">
          Admin Center
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>
        <p className="max-w-3xl text-sm text-gray-500 dark:text-gray-400">
          View shipment, quote, payment, and user notification activity.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500">Total Notifications</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {summary.total || 0}
          </p>
        </div>
        <div className="border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500">Unread</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {summary.unread || 0}
          </p>
        </div>
        <div className="border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500">Admin View</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            {enabled ? (
              <>
                <FiCheckCircle className="text-green-600" />
                Enabled
              </>
            ) : (
              <>
                <FiX className="text-red-600" />
                Disabled
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mb-5 border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="flex items-center gap-3 border border-gray-200 bg-slate-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <FiSearch className="text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search title, message, event..."
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-500 dark:text-gray-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setSearch("");
                }}
                className="text-gray-400 hover:text-[#997C42]"
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          <select
            value={role}
            onChange={(event) => {
              setPage(1);
              setRole(event.target.value);
            }}
            className="border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#BF9B53] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#BF9B53] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!enabled ? (
        <div className="border border-dashed border-[#BF9B53]/30 bg-white p-12 text-center shadow-sm dark:bg-gray-900">
          <FiBell className="mx-auto mb-4 text-5xl text-[#BF9B53]/40" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Admin notifications are turned off
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Turn them on from Settings to view notification activity here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900 md:px-6">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              All notifications:{" "}
              <span className="text-[#BF9B53]">{pagination.total || 0}</span>
              {selectedIds.size > 0 && (
                <span className="ml-3 text-[#997C42]">
                  - {selectedIds.size} selected
                </span>
              )}
            </p>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => openDeleteConfirm(Array.from(selectedIds))}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-sm bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiTrash2 />
                Delete Selected
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px]">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-800">
                  <th className="px-4 py-4 text-left md:px-6">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      disabled={loading || notifications.length === 0}
                      className="h-4 w-4 rounded border-gray-300 accent-[#BF9B53]"
                      aria-label="Select all notifications"
                    />
                  </th>
                  {["#", "Title", "Message", "Role", "Status", "Created", "Action"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-300 md:px-6"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center text-sm font-semibold text-gray-500"
                    >
                      Loading notifications...
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center text-sm font-semibold text-gray-500"
                    >
                      No notifications found
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification, index) => (
                    <tr
                      key={notification._id}
                      className="transition hover:bg-[#BF9B53]/5 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-4 text-sm md:px-6">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(notification._id)}
                          onChange={() => toggleSelection(notification._id)}
                          disabled={deleting}
                          className="h-4 w-4 rounded border-gray-300 accent-[#BF9B53]"
                          aria-label="Select notification"
                        />
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 md:px-6">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white md:px-6">
                        {notification.title || "Notification"}
                        <p className="mt-1 text-xs font-normal text-gray-500">
                          {notification.event || notification.type || "general"}
                        </p>
                      </td>
                      <td className="max-w-[360px] px-4 py-4 text-sm text-gray-600 dark:text-gray-300 md:px-6">
                        <p className="line-clamp-2">
                          {notification.message || "N/A"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm md:px-6">
                        <span className="inline-flex rounded-full bg-[#BF9B53]/10 px-3 py-1 text-xs font-bold capitalize text-[#997C42] dark:text-[#E8D7AD]">
                          {notification.role || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm md:px-6">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            notification.read
                              ? "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-200"
                              : "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200"
                          }`}
                        >
                          {notification.read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 md:px-6">
                        {formatDate(notification.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm md:px-6">
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm([notification._id])}
                          disabled={deleting}
                          className="inline-flex items-center gap-1.5 rounded-sm bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-900/40 dark:text-red-200"
                        >
                          <FiTrash2 size={14} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            onPageChange={setPage}
            isLoading={loading || deleting}
          />
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
