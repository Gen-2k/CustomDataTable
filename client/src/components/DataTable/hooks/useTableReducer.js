/**
 * useTableReducer - The central "Brain" for state management.
 * Handles all state transitions for data, filtering, sorting, and UI interactions.
 */

export const ACTIONS = {
  // Data Lifecycle
  START_FETCH: "START_FETCH",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",

  // Search & Filtering
  SET_SEARCH_TOKENS: "SET_SEARCH_TOKENS",
  SET_FILTERS: "SET_FILTERS",
  CLEAR_FILTERS: "CLEAR_FILTERS",
  SYNC_DEBOUNCED_SEARCH: "SYNC_DEBOUNCED_SEARCH",

  // Table Configuration/Parameters
  UPDATE_PARAMS: "UPDATE_PARAMS",
  TOGGLE_COLUMN: "TOGGLE_COLUMN",

  // Inline Editing
  SET_EDIT_CELL: "SET_EDIT_CELL",
  UPDATE_ROW: "UPDATE_ROW",
  SET_FACETS: "SET_FACETS",

  // Row Expansion
  TOGGLE_ROW_EXPANSION: "TOGGLE_ROW_EXPANSION",
  EXPAND_ALL: "EXPAND_ALL",
  COLLAPSE_ALL: "COLLAPSE_ALL",
};

/**
 * Centrailzed reducer for the DataTable.
 * Uses a standard Flux-pattern to ensure predictable state changes.
 */
export function tableReducer(state, action) {
  switch (action.type) {
    // --- DATA ACTIONS ---
    case ACTIONS.START_FETCH:
      return { ...state, loading: true, error: null };

    case ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload.data,
        totalRows: action.payload.total,
        totalPages: action.payload.totalPages,
      };

    case ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };

    // --- SEARCH / FILTER ACTIONS ---
    case ACTIONS.SET_SEARCH_TOKENS:
      return { ...state, searchTerm: action.payload };

    case ACTIONS.SET_FILTERS:
      return { ...state, activeFilters: action.payload, currentPage: 1 };

    case ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        activeFilters: [],
        searchTerm: [],
        debouncedSearchTerm: "",
        allExpanded: false,
        expandedRows: [],
      };

    case ACTIONS.SYNC_DEBOUNCED_SEARCH:
      return { ...state, debouncedSearchTerm: action.payload, currentPage: 1 };

    // --- COLUMN / PARAM ACTIONS ---
    case ACTIONS.UPDATE_PARAMS:
      return {
        ...state,
        ...action.payload,
        currentPage: action.payload.currentPage ?? state.currentPage,
      };

    case ACTIONS.TOGGLE_COLUMN:
      return {
        ...state,
        hiddenColumns: state.hiddenColumns.includes(action.payload)
          ? state.hiddenColumns.filter((key) => key !== action.payload)
          : [...state.hiddenColumns, action.payload],
      };

    // --- EDITING ACTIONS ---
    case ACTIONS.SET_EDIT_CELL:
      return { ...state, editingCell: action.payload };

    case ACTIONS.UPDATE_ROW:
      return {
        ...state,
        editingCell: null,
        data: state.data.map((row) =>
          row[state.idKey] === action.payload[state.idKey]
            ? { ...row, ...action.payload }
            : row,
        ),
      };

    case ACTIONS.SET_FACETS:
      return {
        ...state,
        facetCache: {
          ...state.facetCache,
          [action.payload.field]: action.payload.options,
        },
      };

    // --- EXPANSION ACTIONS ---
    case ACTIONS.TOGGLE_ROW_EXPANSION: {
      const rowId = action.payload;

      // Logic A: Accordion Mode (Single selection)
      if (state.accordionMode) {
        const isCurrentlyExpanded = state.expandedRows.includes(rowId);
        return {
          ...state,
          allExpanded: false,
          expandedRows: isCurrentlyExpanded ? [] : [rowId],
        };
      }

      // Logic B: Standard Multi-selection
      const isExpanded = state.expandedRows.includes(rowId);
      return {
        ...state,
        allExpanded: false,
        expandedRows: isExpanded
          ? state.expandedRows.filter((id) => id !== rowId)
          : [...state.expandedRows, rowId],
      };
    }

    case ACTIONS.EXPAND_ALL:
      return {
        ...state,
        allExpanded: true,
        expandedRows: [], // Clear individual overrides when master is on
      };

    case ACTIONS.COLLAPSE_ALL:
      return {
        ...state,
        allExpanded: false,
        expandedRows: [],
      };

    default:
      return state;
  }
}
