import { useReducer, useMemo, useCallback } from "react";
import { tableReducer, ACTIONS } from "./useTableReducer";
import { useTableFetch } from "./useTableFetch";
import { useTableActions } from "./useTableActions";
import { useTableEditing } from "./useTableEditing";
import { getInitialStateFromURL } from "../utils/urlSync";

/**
 * useTable - The Master Orchestrator Hook.
 * 
 * This hook initializes the data table's state machine and wires up 
 * specialized sub-hooks for fetching, actions (sort/search/page), 
 * and inline editing.
 * 
 * @param {Object} config - Configuration options for the table.
 * @returns {Object} Full state and action handlers for the table.
 */
const useTable = (config = {}) => {
  const {
    apiUrl,
    initialPageSize = 10,
    requestMapper,
    responseMapper,
    customFetcher,
    disableUrlSync = false,
    staticData,
    idKey = "id",
    disableExpansionSync = false,
    accordionMode = false,
  } = config;

  /**
   * Initialize State. 
   * If URL sync is enabled, we derive the state from query parameters.
   */
  const initialState = useMemo(
    () => {
      const baseState = {
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
        allExpanded: false,
        idKey,
        accordionMode,
      };

      return disableUrlSync ? baseState : getInitialStateFromURL(baseState);
    },
    [initialPageSize, disableUrlSync, staticData, idKey, accordionMode],
  );

  const [state, dispatch] = useReducer(tableReducer, initialState);

  // 1. Data Retrieval Engine
  const { fetchData } = useTableFetch({
    apiUrl,
    state,
    dispatch,
    requestMapper,
    responseMapper,
    customFetcher,
    disableUrlSync,
    staticData,
    idKey,
    disableExpansionSync,
    accordionMode,
  });

  // 2. Interaction Logic (Sorting, Search, Pagination, Columns)
  const handlers = useTableActions(state, dispatch);

  // 3. Edit & Meta Logic
  const editActions = useTableEditing({
    apiUrl,
    state,
    dispatch,
    columns: config.columns,
    customRowUpdater: config.customRowUpdater,
    customFacetFetcher: config.customFacetFetcher,
    idKey,
  });

  // 4. Lightweight UI Actions (Row Expansion)
  const handleToggleRowExpansion = useCallback(
    (rowId) => {
      dispatch({ type: ACTIONS.TOGGLE_ROW_EXPANSION, payload: rowId });
    },
    [dispatch],
  );

  const handleExpandAll = useCallback(
    () => {
      dispatch({ type: ACTIONS.EXPAND_ALL });
    },
    [dispatch],
  );

  const handleCollapseAll = useCallback(() => {
    dispatch({ type: ACTIONS.COLLAPSE_ALL });
  }, [dispatch]);

  return {
    ...state,
    ...handlers,
    ...editActions,
    handleToggleRowExpansion,
    handleExpandAll,
    handleCollapseAll,
    fetchData,
  };
};

export default useTable;
