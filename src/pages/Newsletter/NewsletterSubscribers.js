import React, { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { NewsletterAdminContext } from "../../context/NewsletterAdminContext";
import { FiTrash2, FiMail, FiSearch, FiX } from "react-icons/fi";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import Pagination from "../../components/common/Pagination";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const NewsletterSubscribers = () => {
  const context = useContext(NewsletterAdminContext);

  if (!context) {
    throw new Error(
      "NewsletterSubscribers must be used inside NewsletterAdminProvider"
    );
  }

  const {
    fetchSubscribers,
    deleteSubscriber,
    sendNewsletter,
    loading,
    pagination,
    summary,
  } = context;

  // State management
  const [subscribers, setSubscribers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const debouncedSearchEmail = useDebouncedValue(searchEmail, 400);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null, // "delete", "deleteMultiple" or "send"
    targetId: null,
    targetEmail: null,
  });

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    htmlContent: "",
  });

  const loadSubscribers = useCallback(async () => {
    try {
      setIsLoadingSubscribers(true);
      const res = await fetchSubscribers({
        page,
        limit: 10,
        search: debouncedSearchEmail,
        status: statusFilter,
      });

      const subscribersList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setSubscribers(subscribersList);
      setSelectAll(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Fetch subscribers error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch subscribers");
      setSubscribers([]);
    } finally {
      setIsLoadingSubscribers(false);
    }
  }, [debouncedSearchEmail, fetchSubscribers, page, statusFilter]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  // Handle individual checkbox
  const handleCheckboxChange = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(
      subscribers.length > 0 && newSelected.size === subscribers.length
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(subscribers.map((sub) => sub._id));
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  const verifiedCount =
    summary?.verifiedSubscribers ??
    subscribers.filter((s) => s.isVerified).length;
  const totalSubscribers = summary?.totalSubscribers ?? pagination?.total ?? 0;
  const unverifiedCount =
    summary?.unverifiedSubscribers ??
    subscribers.filter((s) => !s.isVerified).length;
  const currentPage = pagination?.page || page;
  const pageLimit = pagination?.limit || 10;
  const totalPages = pagination?.totalPages || 1;
  const filteredTotal = pagination?.total ?? subscribers.length;

  // Open delete confirmation modal (single)
  const openDeleteConfirm = (id, email) => {
    setConfirmModal({
      open: true,
      type: "delete",
      targetId: id,
      targetEmail: email,
    });
  };

  // Open delete multiple confirmation modal
  const openDeleteMultipleConfirm = () => {
    setConfirmModal({
      open: true,
      type: "deleteMultiple",
      targetId: null,
      targetEmail: null,
    });
  };

  // Open send confirmation modal
  const openSendConfirm = () => {
    if (verifiedCount === 0) {
      toast.error("No verified subscribers to send newsletter to");
      return;
    }
    setConfirmModal({
      open: true,
      type: "send",
      targetId: null,
      targetEmail: null,
    });
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      type: null,
      targetId: null,
      targetEmail: null,
    });
  };

  // Confirm delete single
  const confirmDelete = async () => {
    const { targetId } = confirmModal;

    try {
      await deleteSubscriber(targetId);
      await loadSubscribers();
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(targetId);
        return newSet;
      });
      toast.success("Subscriber deleted successfully");
      closeConfirmModal();
    } catch (err) {
      console.error("Delete subscriber error:", err);
      toast.error(err.response?.data?.message || "Failed to delete subscriber");
    }
  };

  // Confirm delete multiple
  const confirmDeleteMultiple = async () => {
    if (selectedIds.size === 0) {
      toast.error("No subscribers selected");
      return;
    }

    try {
      const idsArray = Array.from(selectedIds);
      await deleteSubscriber(idsArray);
      await loadSubscribers();
      toast.success(`${selectedIds.size} subscriber(s) deleted successfully`);
      setSelectedIds(new Set());
      setSelectAll(false);
      closeConfirmModal();
    } catch (err) {
      console.error("Delete multiple error:", err);
      toast.error(
        err.response?.data?.message || "Failed to delete subscribers"
      );
    }
  };

  // Confirm send newsletter (VERIFIED ONLY)
  const confirmSend = async () => {
    // Validation
    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!formData.message.trim() && !formData.htmlContent.trim()) {
      toast.error("Please enter message or HTML content");
      return;
    }

    if (verifiedCount === 0) {
      toast.error("No verified subscribers to send newsletter to");
      return;
    }

    try {
      setIsSending(true);

      const payload = {
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        htmlContent: formData.htmlContent.trim(),
      };

      const response = await sendNewsletter(payload);

      const sentCount = response?.sentCount || verifiedCount;
      toast.success(
        `Newsletter sent successfully to ${sentCount} verified subscriber${
          sentCount !== 1 ? "s" : ""
        }`
      );

      // Reset and close
      handleCloseModal();
      closeConfirmModal();
    } catch (err) {
      console.error("Send newsletter error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send newsletter";
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      subject: "",
      message: "",
      htmlContent: "",
    });
  };

  // Loading state
  if (isLoadingSubscribers && loading && subscribers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Loading subscribers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-1">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Newsletter Subscribers
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
              Manage your email subscriber list and send newsletters to verified
              subscribers
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedIds.size > 0 && (
              <button
                onClick={openDeleteMultipleConfirm}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <FiTrash2 size={20} />
                Delete ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={loading || verifiedCount === 0}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <FiMail size={20} />
              Send Newsletter
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Subscribers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Subscribers
                </p>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  {totalSubscribers}
                </p>
              </div>
              <div className="text-blue-500 text-5xl opacity-20">
                <FiMail />
              </div>
            </div>
          </div>

          {/* Verified Subscribers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Verified
                </p>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  {verifiedCount}
                </p>
              </div>
              <div className="text-green-500 text-5xl opacity-20">
                <AiOutlineCheckCircle />
              </div>
            </div>
          </div>

          {/* Unverified Subscribers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Unverified
                </p>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  {unverifiedCount}
                </p>
              </div>
              <div className="text-red-500 text-5xl opacity-20">
                <AiOutlineCloseCircle />
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 hover:shadow-lg transition-shadow duration-200">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <FiSearch className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by email address..."
                value={searchEmail}
                onChange={(e) => {
                  setPage(1);
                  setSearchEmail(e.target.value);
                }}
                className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 text-sm md:text-base"
              />
              {loading && searchEmail !== debouncedSearchEmail && (
                <span className="h-4 w-4 animate-spin border-2 border-[#BF9B53] border-t-transparent" />
              )}
              {searchEmail && (
                <button
                  onClick={() => {
                    setPage(1);
                    setSearchEmail("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value);
              }}
              className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm outline-none"
            >
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          {(debouncedSearchEmail || statusFilter) && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Found{" "}
              <span className="font-semibold text-[#BF9B53]">
                {filteredTotal}
              </span>{" "}
              of <span className="font-semibold">{totalSubscribers}</span>{" "}
              subscribers
            </p>
          )}
        </div>

        {/* Subscribers Table */}
        {loading && subscribers.length > 0 && (
          <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Updating subscribers...
          </div>
        )}
        {subscribers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center hover:shadow-lg transition-shadow duration-200">
            <FiMail className="mx-auto text-5xl text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              {debouncedSearchEmail || statusFilter
                ? "No subscribers found matching your search"
                : "No subscribers yet"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {debouncedSearchEmail || statusFilter
                ? "Try adjusting your search or status filter"
                : "When subscribers join, they will appear here"}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800 md:px-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Total subscribers:{" "}
                <span className="text-[#BF9B53]">{filteredTotal}</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          disabled={loading || subscribers.length === 0}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        />
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      #
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Email
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Subscribed At
                    </th>
                    <th className="px-4 md:px-6 py-4 text-center text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subscribers.map((sub, idx) => (
                    <tr
                      key={sub._id}
                      className={`transition-colors duration-150 ${
                        selectedIds.has(sub._id)
                          ? "bg-blue-50 dark:bg-blue-900"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <td className="px-4 md:px-6 py-4 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(sub._id)}
                          onChange={() => handleCheckboxChange(sub._id)}
                          disabled={loading}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {(currentPage - 1) * pageLimit + idx + 1}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700 dark:text-gray-300 break-all">
                        {sub.email}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm">
                        {sub.isVerified ? (
                          <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                            <AiOutlineCheckCircle size={14} />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                            <AiOutlineCloseCircle size={14} />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        <button
                          onClick={() => openDeleteConfirm(sub._id, sub.email)}
                          disabled={loading}
                          className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-200 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 size={14} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold">
                  {subscribers.length}
                </span>{" "}
                of <span className="font-semibold">{filteredTotal}</span>{" "}
                subscribers
                {selectedIds.size > 0 && (
                  <span className="ml-3 text-blue-600 dark:text-blue-400">
                    • {selectedIds.size} selected
                  </span>
                )}
              </p>
              <div className="mt-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  isLoading={loading}
                  className="justify-end"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send Newsletter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Send Newsletter
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Recipients:{" "}
                  <span className="font-semibold text-green-600">
                    {verifiedCount}
                  </span>{" "}
                  verified subscriber{verifiedCount !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={isSending || loading}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl disabled:opacity-50 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Welcome to our newsletter..."
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  disabled={isSending}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Plain Text Message
                </label>
                <textarea
                  placeholder="Enter your message here (optional)..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  disabled={isSending}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This will be sent as plain text email content
                </p>
              </div>

              {/* HTML Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  HTML Content
                </label>
                <textarea
                  placeholder="Or paste your HTML code here for rich formatting (optional)..."
                  value={formData.htmlContent}
                  onChange={(e) =>
                    setFormData({ ...formData, htmlContent: e.target.value })
                  }
                  disabled={isSending}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  HTML content will override plain text if both are provided
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 space-y-2">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Verified Only:</strong> This newsletter will be sent
                  to {verifiedCount} verified subscriber
                  {verifiedCount !== 1 ? "s" : ""} only.
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Note:</strong> Subject and (message OR HTML content)
                  are required.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex gap-3 justify-end sticky bottom-0">
              <button
                onClick={handleCloseModal}
                disabled={isSending || loading}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={openSendConfirm}
                disabled={
                  isSending ||
                  !formData.subject.trim() ||
                  (!formData.message.trim() && !formData.htmlContent.trim())
                }
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSending ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FiMail size={18} />
                    <span>Send Newsletter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {confirmModal.type === "delete"
                  ? "Delete Subscriber"
                  : confirmModal.type === "deleteMultiple"
                  ? "Delete Multiple Subscribers"
                  : "Send Newsletter"}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              {confirmModal.type === "delete" ? (
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete this subscriber?
                  </p>
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>Email:</strong> {confirmModal.targetEmail}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This action cannot be undone.
                  </p>
                </div>
              ) : confirmModal.type === "deleteMultiple" ? (
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-red-600">
                      {selectedIds.size}
                    </span>{" "}
                    subscriber{selectedIds.size !== 1 ? "s" : ""}?
                  </p>
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>Selected:</strong> {selectedIds.size} subscriber
                      {selectedIds.size !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This action cannot be undone.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to send this newsletter to{" "}
                    <span className="font-semibold text-green-600">
                      {verifiedCount}
                    </span>{" "}
                    verified subscriber
                    {verifiedCount !== 1 ? "s" : ""}?
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3 space-y-1">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Subject:</strong> {formData.subject}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Recipients:</strong> {verifiedCount} verified
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Please review before confirming.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={closeConfirmModal}
                disabled={isSending}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === "delete") {
                    confirmDelete();
                  } else if (confirmModal.type === "deleteMultiple") {
                    confirmDeleteMultiple();
                  } else {
                    confirmSend();
                  }
                }}
                disabled={isSending}
                className={`px-6 py-2.5 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  confirmModal.type === "send"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSending ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span>
                    <span>
                      {confirmModal.type === "send"
                        ? "Sending..."
                        : "Deleting..."}
                    </span>
                  </>
                ) : (
                  <>
                    {confirmModal.type === "send" ? (
                      <>
                        <FiMail size={18} />
                        Confirm & Send
                      </>
                    ) : (
                      <>
                        <FiTrash2 size={18} />
                        Delete
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscribers;
