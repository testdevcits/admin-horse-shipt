import React from "react";

export const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-md bg-gray-200/80 dark:bg-gray-700/70 ${className}`}
  />
);

export const TableSkeleton = ({ columns = 5, rows = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        {Array.from({ length: columns }).map((__, columnIndex) => (
          <td
            key={columnIndex}
            className="px-4 py-3 border-b border-gray-100 dark:border-gray-800"
          >
            <Skeleton
              className={
                columnIndex === 0
                  ? "h-4 w-28"
                  : columnIndex === columns - 1
                  ? "h-7 w-20 mx-auto rounded-full"
                  : "h-4 w-full max-w-[150px]"
              }
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const CardListSkeleton = ({ rows = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className="border rounded-lg p-4 bg-slate-50 dark:bg-gray-800 dark:border-gray-700"
      >
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-10/12" />
          <Skeleton className="h-3 w-8/12" />
        </div>
      </div>
    ))}
  </div>
);

export const PageSkeleton = ({ cards = 4, tableRows = 6 }) => (
  <div className="w-full min-h-[70vh] p-4 sm:p-6 font-montserrat">
    <div className="mb-6">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-72 mt-3" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-5"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-5">
      <Skeleton className="h-5 w-36 mb-5" />
      <div className="space-y-4">
        {Array.from({ length: tableRows }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
