import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DataTable = ({
  columns = [],
  data = [],
  actions = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-slate-50 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                >
                  {col.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-[#BF9B53]/5 dark:hover:bg-gray-800 transition"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 align-middle"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-center border-b border-gray-100 dark:border-gray-800">
                      <div className="flex justify-center gap-1.5">
                        {actions.map((action, i) => (
                          <div key={i}>
                            {action.render ? (
                              action.render(row)
                            ) : (
                              <button
                                onClick={() => action.onClick?.(row)}
                                className={`px-3 py-1.5 text-xs rounded-md font-semibold text-white transition hover:opacity-90 ${
                                  action.className || "bg-gray-500"
                                }`}
                              >
                                {typeof action.label === "function"
                                  ? action.label(row)
                                  : action.label}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARD VIEW ================= */}
      <div className="md:hidden space-y-4 p-4">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No data found
          </div>
        ) : (
          data.map((row, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-slate-50 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.key} className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400 break-words">
                      {col.label}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 text-right break-words min-w-0">
                      {col.render ? col.render(row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>

              {actions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  {actions.map((action, i) => (
                    <div key={i}>
                      {action.render ? (
                        action.render(row)
                      ) : (
                        <button
                          onClick={() => action.onClick?.(row)}
                          className={`px-3 py-1.5 text-xs rounded-md font-semibold text-white transition hover:opacity-90 ${
                            action.className || "bg-gray-500"
                          }`}
                        >
                          {typeof action.label === "function"
                            ? action.label(row)
                            : action.label}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center p-3 border-t bg-slate-50 dark:bg-gray-900 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="w-9 h-9 inline-flex items-center justify-center border rounded-md bg-white disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
              aria-label="Previous page"
            >
              <FaChevronLeft size={12} />
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="w-9 h-9 inline-flex items-center justify-center border rounded-md bg-white disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
              aria-label="Next page"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
