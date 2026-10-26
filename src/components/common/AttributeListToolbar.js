import React from "react";
import { FaSearch } from "react-icons/fa";
import ClearSearchButton from "./ClearSearchButton";

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const AttributeListToolbar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  totalRecords,
  placeholder,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
    <div className="flex flex-1 flex-wrap items-center gap-3">
      <div className="relative flex min-w-[220px] flex-1 items-center gap-2 border border-gray-200 bg-[#faf9f6] px-3 py-2 pr-10 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
        <FaSearch size={13} />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100"
        />
        <ClearSearchButton value={search} onClear={() => onSearchChange("")} />
      </div>
      <div className="flex items-center gap-1 border border-gray-200 bg-[#faf9f6] p-1 dark:border-gray-700 dark:bg-gray-800">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onStatusChange(filter.value)}
            aria-pressed={status === filter.value}
            className={`px-3 py-1.5 text-sm transition ${
              status === filter.value
                ? "bg-white font-semibold text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
    <p className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
      Total records: <span className="font-semibold text-[#BF9B53]">{totalRecords}</span>
    </p>
  </div>
);

export default AttributeListToolbar;
