import { useReducer, useMemo } from "react";
import { tableReducer } from "./useTableReducer";
import { useTableFetch } from "./useTableFetch";
import { useTableFilters } from "./useTableFilters";
import { useTableEditing } from "./useTableEditing";
import { getInitialStateFromURL } from "../utils/urlSync";

/**
 * useTable - The orchestrator hook for the DataTable system.
 * It initializes the shared state and delegates specialized logic
 * to micro-hooks for better maintainability.
 */
const useTable = (config = {}) => {
  const {
    apiUrl,
    initialPageSize = 10,
    requestMapper,
    responseMapper,
    customFetcher,
  } = config;

  // 1. Core State Initialization with URL Persistence
  const initialState = useMemo(
    () =>
      getInitialStateFromURL({
        data: [],
        totalRows: 0,
        totalPages: 0,
        loading: true,
        error: null,
        currentPage: 1,
        pageSize: initialPageSize,
        searchTerm: [],
        debouncedSearchTerm: "",
        activeFilters: [],
        sortConfig: { key: null, direction: "asc" },
        editingCell: null,
        facetCache: {},
        hiddenColumns: [],
      }),
    [initialPageSize],
  );

  const [state, dispatch] = useReducer(tableReducer, initialState);

  // 2. Specialized Logic Delegation

  // Handles all API Read operations and search debouncing
  const { fetchData } = useTableFetch({
    apiUrl,
    state,
    dispatch,
    requestMapper,
    responseMapper,
    customFetcher,
  });

  // Handles all UI interactions (sorting, filtering, paging)
  const filterActions = useTableFilters(state, dispatch);

  // Handles all Write operations (editing cells) and facet metadata
  const editActions = useTableEditing({
    apiUrl,
    state,
    dispatch,
    columns: config.columns, // Pass columns from config
    customRowUpdater: config.customRowUpdater,
    customFacetFetcher: config.customFacetFetcher,
  });

  // 3. Return a unified interface for the TableProvider
  return {
    ...state,
    ...filterActions,
    ...editActions,
    fetchData, // Exposed for manual refreshes
  };
};

export default useTable;
