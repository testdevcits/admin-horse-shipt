import React, { useEffect, useState } from "react";
import NoData from "../../components/common/NoData";
import PageLoader from "../../components/common/PageLoader";
import BreedModal from "../../components/breeds/BreedModal";
import DataTable from "../../components/common/DataTable";
import ConfirmModal from "../../components/common/ConfirmModal";
import AttributeListToolbar from "../../components/common/AttributeListToolbar";
import { useHorseAttributes } from "../../context/HorseAttributeContext";
import {
  FaEdit,
  FaPlus,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const HorseAttributeList = ({ type, singularLabel, pluralLabel }) => {
  const {
    resources,
    fetchAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    updateAttributeStatus,
  } = useHorseAttributes();

  const resource = resources[type];
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editItem, setEditItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    item: null,
  });

  useEffect(() => {
    const timer = setTimeout(
      () => fetchAttributes(type, 1, { search, status }),
      250
    );
    return () => clearTimeout(timer);
  }, [fetchAttributes, type, search, status]);

  const loadPage = async (newPage) => {
    if (newPage < 1 || newPage > resource.totalPages) return;
    await fetchAttributes(type, newPage, { search, status });
  };

  const handleAddOrEdit = async (name) => {
    const result = editItem
      ? await updateAttribute(type, editItem._id, name)
      : await createAttribute(type, name);

    if (result?.success === false) return;

    setModalOpen(false);
    setEditItem(null);
    fetchAttributes(type, 1, { search, status });
  };

  const confirmDelete = async () => {
    if (confirmModal.item) {
      await deleteAttribute(type, confirmModal.item._id);
      setConfirmModal({ show: false, item: null });
      loadPage(resource.page);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7eed8] text-sm font-semibold text-[#9b742b]">
            {row.name?.charAt(0)?.toUpperCase() || "?"}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${row.isActive ? "bg-green-600" : "bg-gray-500"}`} />
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      render: (row) => (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            title={`Edit ${singularLabel.toLowerCase()}`}
            aria-label={`Edit ${singularLabel.toLowerCase()}`}
            onClick={() => {
              setEditItem(row);
              setModalOpen(true);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-[#9b742b]"
          >
            <FaEdit size={14} />
          </button>

          <button
            type="button"
            title={
              row.isActive
                ? `Deactivate ${singularLabel.toLowerCase()}`
                : `Activate ${singularLabel.toLowerCase()}`
            }
            aria-label={
              row.isActive
                ? `Deactivate ${singularLabel.toLowerCase()}`
                : `Activate ${singularLabel.toLowerCase()}`
            }
            onClick={async () => {
              const result = await updateAttributeStatus(type, row._id, !row.isActive);
              if (result?.success) loadPage(resource.page);
            }}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
              row.isActive
                ? "text-green-700 hover:bg-green-50"
                : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            {row.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
          </button>

          <button
            type="button"
            title={`Delete ${singularLabel.toLowerCase()}`}
            aria-label={`Delete ${singularLabel.toLowerCase()}`}
            onClick={() => setConfirmModal({ show: true, item: row })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <FaTrash size={13} />
          </button>
        </div>
      ),
    },
  ];

  if ((resource.loading && resource.page === 1) || !resource.hasFetched) {
    return <PageLoader text={`Loading ${pluralLabel.toLowerCase()}...`} size={24} />;
  }

  return (
    <div className="font-montserrat p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {pluralLabel}
        </h1>
        <button
          type="button"
          onClick={() => {
            setEditItem(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-system-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FaPlus size={13} />
          Add {singularLabel}
        </button>
      </div>

      <AttributeListToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        totalRecords={resource.totalRecords}
        placeholder={`Search ${pluralLabel.toLowerCase()}`}
      />

      {resource.items.length === 0 ? (
        <div>
          <NoData
            title={`No ${pluralLabel} Found`}
            description={`There are currently no ${pluralLabel.toLowerCase()} available.`}
            showGoBack={false}
            showReload={false}
          />
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setEditItem(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-system-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <FaPlus size={13} />
              Add First {singularLabel}
            </button>
          </div>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={resource.items}
            actions={actions}
            currentPage={resource.page}
            totalPages={resource.totalPages}
            totalRecords={resource.totalRecords}
            onPageChange={loadPage}
            hideTotalBar
          />

          {resource.fetchingMore && (
            <PageLoader
              text={`Loading more ${pluralLabel.toLowerCase()}...`}
              size={18}
              fullScreen={false}
            />
          )}
        </>
      )}

      <BreedModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleAddOrEdit}
        initialValue={editItem?.name}
        entityLabel={singularLabel}
        placeholder={`Enter ${singularLabel.toLowerCase()} name`}
      />

      <ConfirmModal
        show={confirmModal.show}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${confirmModal.item?.name}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ show: false, item: null })}
        confirmText="Delete"
      />
    </div>
  );
};

export default HorseAttributeList;
