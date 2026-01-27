/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from "react";
import useTable from "./hooks/useTable";

// 3 Precision contexts (Industry Standard Split)
const TableSearchContext = createContext(null);
const TableDataContext = createContext(null);
const TableActionContext = createContext(null);

/**
 * TableProvider - The brain of the DataTable system.
 *
 * New Universal Props:
 * @param {string} apiUrl - The default URL endpoint.
 * @param {Function} requestMapper - (Optional) Customize how params are sent to the server.
 * @param {Function} responseMapper - (Optional) Customize how to read the JSON response.
 * @param {Function} customFetcher - (Optional) Replace built-in fetch with Axios/SDK.
 */
export const TableProvider = ({
  apiUrl,
  initialPageSize = 10,
  columns,
  children,
  requestMapper,
  responseMapper,
  customFetcher,
  customRowUpdater,
  customFacetFetcher,
  disableUrlSync,
  staticData,
  renderSubTable,
}) => {
  const tableData = useTable({
    apiUrl,
    initialPageSize,
    columns,
    requestMapper,
    responseMapper,
    customFetcher,
    customRowUpdater,
    customFacetFetcher,
    disableUrlSync,
    staticData,
  });

  const {
    // 1. Search bucket
    searchTerm,
    activeFilters,
    debouncedSearchTerm,
    // 2. Action bucket
    handleSort,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    // 3. UI/State variables
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalRows,
    pageSize,
    sortConfig,
    facetCache,
    // Edit State
    editingCell,
    // Edit Actions
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleClearFilters,
    handleToggleColumn,
    fetchFacetOptions,
    // Column Customization
    hiddenColumns,
    // Expansion
    expandedRows,
    handleToggleRowExpansion,
    handleExpandAll,
    handleCollapseAll,
  } = tableData;

  // 1. Memoize Search State
  const searchValue = useMemo(
    () => ({ searchTerm, activeFilters, debouncedSearchTerm, columns }),
    [searchTerm, activeFilters, debouncedSearchTerm, columns],
  );

  const dataValue = useMemo(
    () => ({
      data,
      loading,
      error,
      currentPage,
      totalPages,
      totalRows,
      pageSize,
      sortConfig,
      columns,
      editingCell,
      facetCache,
      hiddenColumns,
      expandedRows,
      showExpandControls: !!renderSubTable,
    }),
    [
      data,
      loading,
      error,
      currentPage,
      totalPages,
      totalRows,
      pageSize,
      sortConfig,
      columns,
      editingCell,
      facetCache,
      hiddenColumns,
      expandedRows,
      renderSubTable,
    ],
  );

  // 3. Memoize Stable Actions
  const actionValue = useMemo(
    () => ({
      handleSort,
      handleSearch,
      handleClearFilters,
      handlePageChange,
      handlePageSizeChange,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      handleToggleColumn,
      fetchFacetOptions,
      handleToggleRowExpansion,
      handleExpandAll,
      handleCollapseAll,
    }),
    [
      handleSort,
      handleSearch,
      handleClearFilters,
      handlePageChange,
      handlePageSizeChange,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      handleToggleColumn,
      fetchFacetOptions,
      handleToggleRowExpansion,
      handleExpandAll,
      handleCollapseAll,
    ],
  );

  return (
    <TableSearchContext.Provider value={searchValue}>
      <TableDataContext.Provider value={dataValue}>
        <TableActionContext.Provider value={actionValue}>
          {children}
        </TableActionContext.Provider>
      </TableDataContext.Provider>
    </TableSearchContext.Provider>
  );
};

export const useTableSearch = () => {
  const context = useContext(TableSearchContext);
  if (!context)
    throw new Error("useTableSearch must be used within TableProvider");
  return context;
};

export const useTableData = () => {
  const context = useContext(TableDataContext);
  if (!context)
    throw new Error("useTableData must be used within TableProvider");
  return context;
};

export const useTableActions = () => {
  const context = useContext(TableActionContext);
  if (!context)
    throw new Error("useTableActions must be used within TableProvider");
  return context;
};

export const useTableContext = () => ({
  ...useTableSearch(),
  ...useTableData(),
  ...useTableActions(),
});

export default TableDataContext;
