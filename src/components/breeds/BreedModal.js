import React, { useEffect, useState } from "react";

const BreedModal = ({ open, onClose, onSubmit, initialValue }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(initialValue || "");
  }, [initialValue]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name);
    setName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {initialValue ? "Edit Breed" : "Add New Breed"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter breed name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-system-primary 
              bg-white text-gray-900 placeholder-gray-400
              dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-400 text-gray-700 bg-gray-100 hover:bg-gray-200
                dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-system-primary text-white hover:opacity-90 transition"
            >
              {initialValue ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BreedModal;
