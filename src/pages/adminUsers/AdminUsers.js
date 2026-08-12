import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiPower, FiTrash2, FiX } from "react-icons/fi";
import API from "../../api/axios";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable from "../../components/common/DataTable";
import Toast from "../../components/common/Toast";
import { ADMIN_PERMISSION_KEYS, ADMIN_PERMISSIONS } from "../../config/adminPermissions";
import { useAuth } from "../../context/AuthContext";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "admin",
  permissions: [],
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-US") : "N/A";

const getAdminId = (admin) => String(admin?._id || admin?.id || "");

const AdminUsers = () => {
  const { user } = useAuth();
  const currentAdminId = getAdminId(user);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    admin: null,
  });
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    admin: null,
  });

  const debouncedSearch = useDebouncedValue(search, 350);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users", {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          status,
        },
      });

      if (res.data.success) {
        setAdmins(res.data.data || []);
        setPagination({
          page: res.data.pagination?.page || page,
          totalPages: res.data.pagination?.totalPages || 1,
          total: res.data.pagination?.total || 0,
        });
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch admin users",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, showToast, status]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openCreateModal = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: "create", admin: null });
  };

  const openEditModal = (admin) => {
    setForm({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      role: admin.role || "admin",
      permissions: admin.permissions || [],
    });
    setModal({ open: true, mode: "edit", admin });
  };

  const closeModal = () => {
    if (saving) return;
    setModal({ open: false, mode: "create", admin: null });
    setForm(emptyForm);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event) => {
    const nextRole = event.target.value;
    setForm((prev) => ({
      ...prev,
      role: nextRole,
      permissions: nextRole === "super-admin" ? ADMIN_PERMISSION_KEYS : prev.permissions,
    }));
  };

  const togglePermission = (permissionKey) => {
    setForm((prev) => {
      const selected = new Set(prev.permissions || []);
      if (selected.has(permissionKey)) {
        selected.delete(permissionKey);
      } else {
        selected.add(permissionKey);
      }

      return { ...prev, permissions: Array.from(selected) };
    });
  };

  const setAllPermissions = (checked) => {
    setForm((prev) => ({
      ...prev,
      permissions: checked ? ADMIN_PERMISSION_KEYS : [],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      showToast("Name and email are required", "error");
      return;
    }

    if (modal.mode === "create" && !form.password.trim()) {
      showToast("Password is required for new admins", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        permissions:
          form.role === "super-admin" ? [] : form.permissions || [],
      };

      if (form.password.trim()) payload.password = form.password.trim();

      const res =
        modal.mode === "create"
          ? await API.post("/admin/users", payload)
          : await API.put(`/admin/users/${getAdminId(modal.admin)}`, payload);

      if (res.data.success) {
        showToast(res.data.message, "success");
        closeModal();
        fetchAdmins();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save admin user",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      const res = await API.patch(`/admin/users/${getAdminId(admin)}/status`);
      if (res.data.success) {
        showToast(res.data.message, "success");
        fetchAdmins();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update admin status",
        "error"
      );
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.admin) return;

    try {
      const res = await API.delete(`/admin/users/${getAdminId(confirmDelete.admin)}`);
      if (res.data.success) {
        showToast(res.data.message, "success");
        setConfirmDelete({ show: false, admin: null });
        fetchAdmins();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete admin user",
        "error"
      );
    }
  };

  const columns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "role",
        label: "Role",
        render: (row) => (
          <span
            className={`px-2 py-1 text-xs font-semibold ${
              row.role === "super-admin"
                ? "bg-[#BF9B53]/15 text-[#8a6a2e] dark:bg-[#E8D7AD]/15 dark:text-[#E8D7AD]"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {row.role === "super-admin" ? "Super Admin" : "Admin"}
          </span>
        ),
      },
      {
        key: "isActive",
        label: "Status",
        render: (row) => (
          <span
            className={`px-2 py-1 text-xs font-semibold ${
              row.isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "lastLogin",
        label: "Last Login",
        render: (row) => formatDateTime(row.lastLogin),
      },
      {
        key: "createdAt",
        label: "Created",
        render: (row) => formatDateTime(row.createdAt),
      },
    ],
    []
  );

  const actions = [
    {
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          icon={<FiEdit2 size={13} />}
          iconOnly
          title="Edit admin"
          onClick={() => openEditModal(row)}
        >
          Edit
        </Button>
      ),
    },
    {
      render: (row) => {
        const isSelf = getAdminId(row) === currentAdminId;

        return (
          <Button
            size="sm"
            variant={row.isActive ? "secondary" : "primary"}
            icon={<FiPower size={13} />}
            iconOnly
            title={row.isActive ? "Deactivate admin" : "Activate admin"}
            disabled={isSelf}
            onClick={() => handleToggleStatus(row)}
          >
            Toggle
          </Button>
        );
      },
    },
    {
      render: (row) => {
        const isSelf = getAdminId(row) === currentAdminId;

        return (
          <Button
            size="sm"
            variant="danger"
            icon={<FiTrash2 size={13} />}
            iconOnly
            title="Delete admin"
            disabled={isSelf}
            onClick={() => setConfirmDelete({ show: true, admin: row })}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 min-h-screen">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Admin Users
        </h1>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search admins"
            className="w-full border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-72"
          />
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="w-full border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-36"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button icon={<FiPlus size={16} />} onClick={openCreateModal}>
            Add Admin
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={admins}
        actions={actions}
        tableMinWidth="980px"
        currentPage={pagination.page || page}
        totalPages={pagination.totalPages || 1}
        totalRecords={pagination.total || 0}
        onPageChange={setPage}
        loading={loading}
      />

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modal.mode === "create" ? "Add Admin" : "Edit Admin"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 transition hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/15 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/15 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleRoleChange}
                  className="w-full border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/15 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>

              {form.role !== "super-admin" && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Module Access
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={
                          form.permissions.length === ADMIN_PERMISSION_KEYS.length
                        }
                        onChange={(event) =>
                          setAllPermissions(event.target.checked)
                        }
                        className="h-4 w-4 accent-[#BF9B53]"
                      />
                      Select all
                    </label>
                  </div>

                  <div className="grid max-h-56 gap-2 overflow-y-auto border border-gray-200 p-3 dark:border-gray-700 sm:grid-cols-2">
                    {ADMIN_PERMISSIONS.map((permission) => (
                      <label
                        key={permission.key}
                        className="flex cursor-pointer gap-2 border border-gray-100 p-2 text-sm dark:border-gray-800"
                      >
                        <input
                          type="checkbox"
                          checked={(form.permissions || []).includes(
                            permission.key
                          )}
                          onChange={() => togglePermission(permission.key)}
                          className="mt-1 h-4 w-4 shrink-0 accent-[#BF9B53]"
                        />
                        <span className="min-w-0">
                          <span className="block font-semibold text-gray-800 dark:text-gray-100">
                            {permission.label}
                          </span>
                          <span className="block text-xs leading-5 text-gray-500 dark:text-gray-400">
                            {permission.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder={
                    modal.mode === "create"
                      ? "Required"
                      : "Leave blank to keep current password"
                  }
                  className="w-full border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/15 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  required={modal.mode === "create"}
                  minLength={6}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  {modal.mode === "create" ? "Create" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        show={confirmDelete.show}
        title="Delete Admin"
        message={`Are you sure you want to delete ${
          confirmDelete.admin?.email || "this admin"
        }?`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ show: false, admin: null })}
      />
    </div>
  );
};

export default AdminUsers;
