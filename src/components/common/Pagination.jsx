import React, { useMemo } from "react";

const ELLIPSIS = "ellipsis";

const range = (start, end) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => start + index);
};

const getPaginationRange = (
  currentPage,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1
) => {
  const totalPageNumbers = siblingCount * 2 + boundaryCount * 2 + 3;

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages);
  }

  const pages = [];
  const leftSiblingIndex = Math.max(
    currentPage - siblingCount,
    boundaryCount + 2
  );
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages - boundaryCount - 1
  );

  const showLeftEllipsis = leftSiblingIndex > boundaryCount + 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - boundaryCount - 1;

  pages.push(...range(1, boundaryCount));

  if (!showLeftEllipsis) {
    pages.push(...range(boundaryCount + 1, leftSiblingIndex - 1));
  } else {
    pages.push(ELLIPSIS);
  }

  pages.push(...range(leftSiblingIndex, rightSiblingIndex));

  if (!showRightEllipsis) {
    pages.push(...range(rightSiblingIndex + 1, totalPages - boundaryCount));
  } else {
    pages.push(ELLIPSIS);
  }

  pages.push(...range(totalPages - boundaryCount + 1, totalPages));

  return pages;
};

const Pagination = React.memo(
  ({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    isLoading = false,
    className = "",
    showInfo = true,
  }) => {
    const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
    const safeCurrentPage = Math.min(
      Math.max(Number(currentPage) || 1, 1),
      safeTotalPages
    );
    const paginationRange = useMemo(
      () =>
        getPaginationRange(
          safeCurrentPage,
          safeTotalPages,
          siblingCount,
          boundaryCount
        ),
      [safeCurrentPage, safeTotalPages, siblingCount, boundaryCount]
    );

    if (!onPageChange) {
      return null;
    }

    const disabled = isLoading;
    const handleChange = (page) => {
      if (
        disabled ||
        page < 1 ||
        page > safeTotalPages ||
        page === safeCurrentPage
      ) {
        return;
      }
      onPageChange(page);
    };

    const buttonClass =
      "inline-flex min-w-[36px] h-9 items-center justify-center rounded border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-700";
    const activeClass =
      "inline-flex min-w-[36px] h-9 items-center justify-center rounded border border-[#BF9B53] bg-[#BF9B53] px-3 text-xs font-semibold text-white shadow-sm";

    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-2 p-3 border-t bg-slate-50 dark:bg-gray-900 dark:border-gray-700 ${className}`}
      >
        {showInfo && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Page {safeCurrentPage} of {safeTotalPages}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={safeCurrentPage === 1 || disabled}
            onClick={() => handleChange(1)}
            className={buttonClass}
            aria-label="First page"
          >
            First
          </button>

          <button
            type="button"
            disabled={safeCurrentPage === 1 || disabled}
            onClick={() => handleChange(safeCurrentPage - 1)}
            className={buttonClass}
            aria-label="Previous page"
          >
            &lt;
          </button>

          {paginationRange.map((item, index) =>
            item === ELLIPSIS ? (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex min-w-[36px] h-9 items-center justify-center rounded px-3 text-xs font-semibold text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                disabled={disabled}
                onClick={() => handleChange(item)}
                className={
                  item === safeCurrentPage ? activeClass : buttonClass
                }
                aria-current={item === safeCurrentPage ? "page" : undefined}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            disabled={safeCurrentPage === safeTotalPages || disabled}
            onClick={() => handleChange(safeCurrentPage + 1)}
            className={buttonClass}
            aria-label="Next page"
          >
            &gt;
          </button>

          <button
            type="button"
            disabled={safeCurrentPage === safeTotalPages || disabled}
            onClick={() => handleChange(safeTotalPages)}
            className={buttonClass}
            aria-label="Last page"
          >
            Last
          </button>
        </div>
      </div>
    );
  }
);

export default Pagination;
