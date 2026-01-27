/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from "react";
import useTable from "./hooks/useTable";

/**
 * TableContexts - The "Nervous System" of the DataTable.
 * 
 * We use a "Context Split" pattern (Industry Standard) to prevent unnecessary re-renders.
 * - SearchContext: Changes when the user types or filters.
 * - DataContext: Changes when data is fetched or rows are expanded.
 * - ActionContext: Stable functions that never trigger re-renders.
 */
const TableSearchContext = createContext(null);
const TableDataContext = createContext(null);
const TableActionContext = createContext(null);

/**
 * TableProvider - The High-Level Controller.
 * 
 * It initializes the shared state and provides it to the entire table sub-tree.
 * This allows components like <Pagination />, <SearchBar />, and <BaseTable />
 * to communicate without "prop drilling."
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
  idKey = "id",
  disableExpansionSync = false,
  accordionMode = false,
}) => {
  // Initialize the master hook that contains all logic
  const table = useTable({
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
    idKey,
    disableExpansionSync,
    accordionMode,
  });

  /**
   * 1. Search & Filter State
   * Contains everything related to finding data.
   */
  const searchValue = useMemo(
    () => ({
      searchTerm: table.searchTerm,
      activeFilters: table.activeFilters,
      debouncedSearchTerm: table.debouncedSearchTerm,
      columns,
    }),
    [table.searchTerm, table.activeFilters, table.debouncedSearchTerm, columns],
  );

  /**
   * 2. Data & UI State
   * Contains the actual records and visibility statuses.
   */
  const dataValue = useMemo(
    () => ({
      data: table.data,
      loading: table.loading,
      error: table.error,
      currentPage: table.currentPage,
      totalPages: table.totalPages,
      totalRows: table.totalRows,
      pageSize: table.pageSize,
      sortConfig: table.sortConfig,
      columns,
      editingCell: table.editingCell,
      facetCache: table.facetCache,
      hiddenColumns: table.hiddenColumns,
      expandedRows: table.expandedRows,
      allExpanded: table.allExpanded,
      showExpandControls: !!renderSubTable,
      idKey,
      disableExpansionSync,
      accordionMode,
    }),
    [
      table.data,
      table.loading,
      table.error,
      table.currentPage,
      table.totalPages,
      table.totalRows,
      table.pageSize,
      table.sortConfig,
      table.editingCell,
      table.facetCache,
      table.hiddenColumns,
      table.expandedRows,
      table.allExpanded,
      columns,
      renderSubTable,
      idKey,
      disableExpansionSync,
      accordionMode,
    ],
  );

  /**
   * 3. Stable Actions
   * Contains the functions to update the table.
   * These are wrapped in useCallback (inside useTable) to ensure
   * consumers don't re-render unless absolutely necessary.
   */
  const actionValue = useMemo(
    () => ({
      handleSort: table.handleSort,
      handleSearch: table.handleSearch,
      handleClearFilters: table.handleClearFilters,
      handlePageChange: table.handlePageChange,
      handlePageSizeChange: table.handlePageSizeChange,
      handleStartEdit: table.handleStartEdit,
      handleCancelEdit: table.handleCancelEdit,
      handleSaveEdit: table.handleSaveEdit,
      handleToggleColumn: table.handleToggleColumn,
      fetchFacetOptions: table.fetchFacetOptions,
      handleToggleRowExpansion: table.handleToggleRowExpansion,
      handleExpandAll: table.handleExpandAll,
      handleCollapseAll: table.handleCollapseAll,
      fetchData: table.fetchData,
    }),
    [
      table.handleSort,
      table.handleSearch,
      table.handleClearFilters,
      table.handlePageChange,
      table.handlePageSizeChange,
      table.handleStartEdit,
      table.handleCancelEdit,
      table.handleSaveEdit,
      table.handleToggleColumn,
      table.fetchFacetOptions,
      table.handleToggleRowExpansion,
      table.handleExpandAll,
      table.handleCollapseAll,
      table.fetchData,
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

// --- CUSTOM CONSUMER HOOKS ---

/**
 * Access the search and filter state.
 */
export const useTableSearch = () => {
  const context = useContext(TableSearchContext);
  if (!context) throw new Error("useTableSearch must be used within a TableProvider");
  return context;
};

/**
 * Access the raw data and UI visibility/loading states.
 */
export const useTableData = () => {
  const context = useContext(TableDataContext);
  if (!context) throw new Error("useTableData must be used within a TableProvider");
  return context;
};

/**
 * Access the action functions (Click handlers).
 */
export const useTableActions = () => {
  const context = useContext(TableActionContext);
  if (!context) throw new Error("useTableActions must be used within a TableProvider");
  return context;
};

/**
 * Aggregated hook - Access everything at once (Use carefully, 
 * as this will cause re-renders on ANY state change).
 */
export const useTableContext = () => ({
  ...useTableSearch(),
  ...useTableData(),
  ...useTableActions(),
});

export default TableProvider;
