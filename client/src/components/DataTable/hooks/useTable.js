import { useReducer, useMemo, useCallback } from "react";
import { tableReducer, ACTIONS } from "./useTableReducer";
import { useTableFetch } from "./useTableFetch";
import { useTableFilters } from "./useTableFilters";
import { useTableEditing } from "./useTableEditing";
import { getInitialStateFromURL } from "../utils/urlSync";

const useTable = (config = {}) => {
  const {
    apiUrl,
    initialPageSize = 10,
    requestMapper,
    responseMapper,
    customFetcher,
    disableUrlSync = false,
    staticData,
  } = config;

  const initialState = useMemo(
    () =>
      disableUrlSync
        ? {
            data: staticData || [],
            totalRows: staticData?.length || 0,
            totalPages: 1,
            loading: !staticData,
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
            expandedRows: [],
          }
        : getInitialStateFromURL({
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
            expandedRows: [],
          }),
    [initialPageSize, disableUrlSync, staticData],
  );

  const [state, dispatch] = useReducer(tableReducer, initialState);

  // 1. Data Fetching
  const { fetchData } = useTableFetch({
    apiUrl,
    state,
    dispatch,
    requestMapper,
    responseMapper,
    customFetcher,
    disableUrlSync,
    staticData,
  });

  // 2. Specialized Feature Actions
  const filterActions = useTableFilters(state, dispatch);

  const editActions = useTableEditing({
    apiUrl,
    state,
    dispatch,
    columns: config.columns,
    customRowUpdater: config.customRowUpdater,
    customFacetFetcher: config.customFacetFetcher,
  });

  // 3. Row Expansion Logic (Consolidated here since it's lightweight)
  const handleToggleRowExpansion = useCallback(
    (rowId) => {
      dispatch({ type: ACTIONS.TOGGLE_ROW_EXPANSION, payload: rowId });
    },
    [dispatch],
  );

  const handleExpandAll = useCallback(
    (rowIds) => {
      dispatch({ type: ACTIONS.EXPAND_ALL, payload: rowIds });
    },
    [dispatch],
  );

  const handleCollapseAll = useCallback(() => {
    dispatch({ type: ACTIONS.COLLAPSE_ALL });
  }, [dispatch]);

  return {
    ...state,
    ...filterActions,
    ...editActions,
    handleToggleRowExpansion,
    handleExpandAll,
    handleCollapseAll,
    fetchData,
  };
};

export default useTable;
