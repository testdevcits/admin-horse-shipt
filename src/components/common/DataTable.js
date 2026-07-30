import React from "react";
import Pagination from "./Pagination";
import { CardListSkeleton, TableSkeleton } from "./Skeleton";

const DataTable = ({
  columns = [],
  data = [],
  actions = [],
  currentPage = 1,
  totalPages = 1,
  totalRecords,
  totalLabel = "Total records",
  onPageChange,
  loading = false,
  tableMinWidth = "760px",
  noWrap = false,
}) => {
  const resolvedTotalRecords =
    totalRecords === undefined || totalRecords === null
      ? data.length
      : totalRecords;

  return (
    <div className="max-w-full overflow-hidden bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-slate-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {totalLabel}:{" "}
          <span className="text-[#BF9B53]">{resolvedTotalRecords}</span>
        </p>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="customscroll hidden max-w-full md:block overflow-x-scroll">
        <table
          className="w-full border-collapse"
          style={{ minWidth: tableMinWidth }}
        >
          <thead className="bg-slate-50 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 ${
                    noWrap ? "whitespace-nowrap" : ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th
                  className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 ${
                    noWrap ? "whitespace-nowrap" : ""
                  }`}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableSkeleton
                rows={6}
                columns={columns.length + (actions.length > 0 ? 1 : 0)}
              />
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
                      className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 align-middle ${
                        noWrap ? "whitespace-nowrap" : ""
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td
                      className={`px-4 py-3 text-center border-b border-gray-100 dark:border-gray-800 ${
                        noWrap ? "whitespace-nowrap" : ""
                      }`}
                    >
                      <div className="flex justify-center gap-1.5">
                        {actions.map((action, i) => (
                          <div key={i}>
                            {action.render ? (
                              action.render(row)
                            ) : (
                              <button
                                onClick={() => action.onClick?.(row)}
                                className={`px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 ${
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
          <CardListSkeleton rows={4} />
        ) : data.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No data found
          </div>
        ) : (
          data.map((row, index) => (
            <div
              key={index}
              className="border p-4 bg-slate-50 dark:bg-gray-800 dark:border-gray-700"
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
                          className={`px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 ${
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        isLoading={loading}
      />
    </div>
  );
};

export default DataTable;
