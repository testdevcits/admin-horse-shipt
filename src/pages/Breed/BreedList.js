import React, { useEffect, useState } from "react";
import { useBreeds } from "../../context/BreedContext";
import NoData from "../../components/common/NoData";
import PageLoader from "../../components/common/PageLoader";
import BreedModal from "../../components/breeds/BreedModal";
import DataTable from "../../components/common/DataTable";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  FaEdit,
  FaPlus,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const BreedList = () => {
  const {
    breeds,
    loading,
    hasFetched,
    fetchingMore,
    page,
    totalPages,
    totalRecords,
    fetchBreeds,
    deleteBreed,
    updateBreedStatus,
    createBreed,
    updateBreed,
  } = useBreeds();

  const [modalOpen, setModalOpen] = useState(false);
  const [editBreed, setEditBreed] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    breed: null,
  });

  useEffect(() => {
    fetchBreeds(1);
  }, [fetchBreeds]);

  const loadPage = async (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    await fetchBreeds(newPage);
  };

  const handleAddOrEdit = async (name) => {
    let result;
    if (editBreed) {
      result = await updateBreed(editBreed._id, name);
    } else {
      result = await createBreed(name);
    }

    if (result?.success === false) return;

    setModalOpen(false);
    setEditBreed(null);
    fetchBreeds(1);
  };

  const handleDelete = (breed) => {
    setConfirmModal({ show: true, breed });
  };

  const confirmDelete = async () => {
    if (confirmModal.breed) {
      await deleteBreed(confirmModal.breed._id);
      setConfirmModal({ show: false, breed: null });
      loadPage(page);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            row.isActive
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            title="Edit breed"
            aria-label="Edit breed"
            onClick={() => {
              setEditBreed(row);
              setModalOpen(true);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
          >
            <FaEdit size={14} />
          </button>

          <button
            type="button"
            title={row.isActive ? "Deactivate breed" : "Activate breed"}
            aria-label={row.isActive ? "Deactivate breed" : "Activate breed"}
            onClick={() => updateBreedStatus(row._id, !row.isActive)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
              row.isActive
                ? "border-green-100 bg-green-50 text-green-600 hover:bg-green-100"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {row.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
          </button>

          <button
            type="button"
            title="Delete breed"
            aria-label="Delete breed"
            onClick={() => handleDelete(row)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
          >
            <FaTrash size={13} />
          </button>
        </div>
      ),
    },
  ];

  if ((loading && page === 1) || !hasFetched)
    return <PageLoader text="Loading breeds..." size={24} />;

  return (
    <div className="font-montserrat p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Breed List
        </h1>
        <button
          type="button"
          onClick={() => {
            setEditBreed(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-system-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FaPlus size={13} />
          Add Breed
        </button>
      </div>

      {breeds.length === 0 ? (
        <div>
          <NoData
            title="No Breeds Found"
            description="There are currently no breeds available."
            showGoBack={false}
            showReload={false}
          />
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setEditBreed(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-system-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <FaPlus size={13} />
              Add First Breed
            </button>
          </div>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={breeds}
            actions={actions}
            currentPage={page}
            totalPages={totalPages}
            totalRecords={totalRecords}
            onPageChange={loadPage}
          />

          {fetchingMore && (
            <PageLoader
              text="Loading more breeds..."
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
          setEditBreed(null);
        }}
        onSubmit={handleAddOrEdit}
        initialValue={editBreed?.name}
      />

      <ConfirmModal
        show={confirmModal.show}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${confirmModal.breed?.name}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ show: false, breed: null })}
        confirmText="Delete"
      />
    </div>
  );
};

export default BreedList;
