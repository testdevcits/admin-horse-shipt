import React, { useEffect, useState } from "react";
import { useBreeds } from "../../context/BreedContext";
import NoData from "../../components/common/NoData";
import PageLoader from "../../components/common/PageLoader";
import BreedModal from "../../components/breeds/BreedModal";
import DataTable from "../../components/common/DataTable";
import ConfirmModal from "../../components/common/ConfirmModal";

const BreedList = () => {
  const {
    breeds,
    loading,
    hasFetched,
    fetchingMore,
    page,
    totalPages,
    fetchBreeds,
    deleteBreed,
    updateBreedStatus,
    createBreed,
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
    if (editBreed) {
      await deleteBreed(editBreed._id);
      await createBreed(name);
    } else {
      await createBreed(name);
    }
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
      label: "Edit",
      className: "bg-blue-500",
      onClick: (row) => {
        setEditBreed(row);
        setModalOpen(true);
      },
    },
    {
      label: (row) => (row.isActive ? "Deactivate" : "Activate"),
      className: "bg-system-primary",
      onClick: (row) => updateBreedStatus(row._id, !row.isActive),
    },
    {
      label: "Delete",
      className: "bg-red-500",
      onClick: handleDelete,
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
          onClick={() => {
            setEditBreed(null);
            setModalOpen(true);
          }}
          className="px-5 py-2 rounded-xl bg-system-primary text-white hover:opacity-90 transition"
        >
          + Add New Breed
        </button>
      </div>

      {breeds.length === 0 ? (
        <NoData
          title="No Breeds Found"
          description="There are currently no breeds added. Please add a breed to get started."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={breeds}
            actions={actions}
            currentPage={page}
            totalPages={totalPages}
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
