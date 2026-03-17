import React, { useState } from "react";
import Modal from "react-modal";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { usePrivacyPolicies } from "../../context/PrivacyPolicyContext";
import { useTheme } from "../../context/ThemeContext";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

Modal.setAppElement("#root");

const PrivacyPolicyList = () => {
  const { darkMode } = useTheme();
  const {
    policies,
    loading,
    createPolicy,
    updatePolicy,
    deletePolicy,
    togglePolicyStatus,
  } = usePrivacyPolicies();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    policy: null,
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => setToast({ message, type });

  const handleAdd = () => {
    setEditingPolicy(null);
    setModalOpen(true);
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirmDelete.policy) return;
    const result = await deletePolicy(confirmDelete.policy._id);
    showToast(
      result.success ? "Policy deleted successfully" : result.message,
      result.success ? "success" : "error"
    );
    setConfirmDelete({ show: false, policy: null });
  };

  const handleToggleActive = async (policy) => {
    await togglePolicyStatus(policy._id, !policy.isActive);
    showToast(
      policy.isActive ? "Policy deactivated" : "Policy activated",
      "info"
    );
  };

  // Validation schema
  const PolicySchema = Yup.object().shape({
    title: Yup.string().trim().required("Title is required"),
    content: Yup.string().trim().required("Content is required"),
  });

  return (
    <div className={`${darkMode ? "dark" : ""}  min-h-screen`}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Privacy Policy
        </h1>
        <Button
          onClick={handleAdd}
          icon={<HiPlus size={18} />}
          variant="primary"
        >
          Add Policy
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : policies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No policies found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy, index) => (
                  <tr
                    key={policy._id}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">{index + 1} .</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                      {policy.title}
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <div
                        className="line-clamp-2 text-gray-600 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: policy.content }}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={policy.isActive}
                          onChange={() => handleToggleActive(policy)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#BF9B53] transition"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out peer-checked:translate-x-5"></div>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(policy)}
                          icon={<HiPencil />}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            setConfirmDelete({ show: true, policy })
                          }
                          icon={<HiTrash />}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-3xl mx-auto mt-20 outline-none"
      >
        <h2 className="text-lg font-bold mb-4 dark:text-white">
          {editingPolicy ? "Edit" : "Add"} Policy
        </h2>

        <Formik
          initialValues={{
            title: editingPolicy?.title || "",
            content: editingPolicy?.content || "",
          }}
          validationSchema={PolicySchema}
          onSubmit={async (values, { setSubmitting }) => {
            const trimmedValues = {
              title: values.title.trim(),
              content: values.content.trim(),
            };

            const result = editingPolicy
              ? await updatePolicy(
                  editingPolicy._id,
                  trimmedValues.title,
                  trimmedValues.content
                )
              : await createPolicy(trimmedValues.title, trimmedValues.content);

            setSubmitting(false);

            if (result.success) {
              setModalOpen(false);
              showToast("Policy saved successfully", "success");
            } else {
              showToast(result.message, "error");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block mb-1 dark:text-white">Title</label>
                <Field
                  name="title"
                  type="text"
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block mb-1 dark:text-white">Content</label>
                <Field
                  name="content"
                  as="textarea"
                  rows="6"
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                />
                <ErrorMessage
                  name="content"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      <ConfirmModal
        show={confirmDelete.show}
        title="Delete Policy"
        message="Are you sure you want to delete this policy?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ show: false, policy: null })}
        confirmText="Delete"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default PrivacyPolicyList;
