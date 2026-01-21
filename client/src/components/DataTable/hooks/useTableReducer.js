export const ACTIONS = {
  START_FETCH: "START_FETCH",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  UPDATE_PARAMS: "UPDATE_PARAMS",
  SET_SEARCH_TOKENS: "SET_SEARCH_TOKENS",
  SET_FILTERS: "SET_FILTERS",
  CLEAR_FILTERS: "CLEAR_FILTERS",
  SYNC_DEBOUNCED_SEARCH: "SYNC_DEBOUNCED_SEARCH",
  SET_EDIT_CELL: "SET_EDIT_CELL",
  UPDATE_ROW: "UPDATE_ROW",
  SET_FACETS: "SET_FACETS",
  TOGGLE_COLUMN: "TOGGLE_COLUMN",
};

/**
 * Standard reducer for state management
 */
export function tableReducer(state, action) {
  switch (action.type) {
    case ACTIONS.TOGGLE_COLUMN:
      return {
        ...state,
        hiddenColumns: state.hiddenColumns.includes(action.payload)
          ? state.hiddenColumns.filter((key) => key !== action.payload)
          : [...state.hiddenColumns, action.payload],
      };
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
    case ACTIONS.SET_FACETS:
      return {
        ...state,
        facetCache: {
          ...state.facetCache,
          [action.payload.field]: action.payload.options,
        },
      };
    case ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTIONS.UPDATE_PARAMS:
      return {
        ...state,
        ...action.payload,
        currentPage: action.payload.currentPage ?? state.currentPage,
      };
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
      };
    case ACTIONS.SYNC_DEBOUNCED_SEARCH:
      return { ...state, debouncedSearchTerm: action.payload, currentPage: 1 };

    // Simplified Edit Cases
    case ACTIONS.SET_EDIT_CELL:
      return { ...state, editingCell: action.payload };
    case ACTIONS.UPDATE_ROW:
      return {
        ...state,
        editingCell: null,
        data: state.data.map((row) =>
          row.id === action.payload.id || row._id === action.payload.id
            ? { ...row, ...action.payload }
            : row,
        ),
      };

    default:
      return state;
  }
}
