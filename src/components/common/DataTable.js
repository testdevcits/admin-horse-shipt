import React from "react";

const DataTable = ({
  columns = [],
  data = [],
  actions = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded shadow">
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b"
                >
                  {col.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-b">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-center border-b">
                      <div className="flex justify-center gap-2 flex-wrap">
                        {actions.map((action, i) => (
                          <div key={i}>
                            {action.render ? (
                              action.render(row)
                            ) : (
                              <button
                                onClick={() => action.onClick?.(row)}
                                className={`px-3 py-1 text-xs rounded text-white ${
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
        {data.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No data found
          </div>
        ) : (
          data.map((row, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
            >
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.key} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {col.label}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 text-right">
                      {col.render ? col.render(row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>

              {actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {actions.map((action, i) => (
                    <div key={i}>
                      {action.render ? (
                        action.render(row)
                      ) : (
                        <button
                          onClick={() => action.onClick?.(row)}
                          className={`px-3 py-1 text-xs rounded text-white ${
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
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center p-3 border-t dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
            >
              Prev
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
