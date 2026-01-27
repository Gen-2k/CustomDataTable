/**
 * urlSync - Professional URL state management.
 * 
 * This utility handles the "Deep Linking" capability of the DataTable.
 * It ensures the browser URL reflects the current UI state (sort, search, pagination)
 * while maintaining performance via a Hybrid Persistence strategy.
 */

/**
 * Parses the current URL and Storage to rebuild the initial table state.
 * 
 * @param {Object} defaults - The baseline state of the table.
 * @returns {Object} - The hydated state from URL/Storage.
 */
export const getInitialStateFromURL = (defaults) => {
  const params = new URLSearchParams(window.location.search);
  const state = { ...defaults };
  let urlExpandedIds = [];

  // --- 1. Basic Navigation & Search ---
  if (params.has("page")) state.currentPage = Number(params.get("page"));
  if (params.has("limit")) state.pageSize = Number(params.get("limit"));
  if (params.has("search")) {
    state.searchTerm = params.get("search").split(",").filter(Boolean);
    state.debouncedSearchTerm = state.searchTerm.join(" ");
  }

  // --- 2. Sorting State ---
  if (params.has("sortBy")) {
    state.sortConfig = {
      key: params.get("sortBy"),
      direction: params.get("sortOrder") || "asc",
    };
  }

  // --- 3. Structured Filters ---
  if (params.has("filters")) {
    try {
      state.activeFilters = JSON.parse(params.get("filters"));
    } catch (err) {
      console.warn("DataTable: Invalid filter JSON in URL.", err);
    }
  }

  // --- 4. UI Customizations (Hidden Columns) ---
  if (params.has("hide")) {
    state.hiddenColumns = params.get("hide").split(",").filter(Boolean);
  }

  // --- 5. Hybrid Expansion Logic (URL + SessionStorage) ---
  if (params.has("expanded")) {
    const val = params.get("expanded");
    if (val === "all") {
      state.allExpanded = true;
      state.expandedRows = [];
    } else {
      urlExpandedIds = val.split(",").filter(Boolean);
    }
  }

  let sessionExpandedIds = [];
  try {
    const saved = sessionStorage.getItem("dt_expanded_state");
    if (saved) sessionExpandedIds = JSON.parse(saved);
  } catch {
    // Fail silently if storage is locked (incognito mode)
  }

  // Merge both sources, ensuring uniqueness
  state.expandedRows = [...new Set([...urlExpandedIds, ...sessionExpandedIds])];

  return state;
};

/**
 * Synchronizes the internal table state to the browser address bar.
 * Uses a Micro-Debounce (calculated in useTableFetch) to maintain 60fps UI.
 * 
 * @param {Object} state - The current reducer state.
 * @param {Object} options - Sync configurations (e.g., disableExpansionSync).
 */
export const updateURLFromState = (state, options = {}) => {
  const { disableExpansionSync = false } = options;
  const params = new URLSearchParams();

  // --- Sync Core Parameters ---
  if (state.currentPage > 1) params.set("page", state.currentPage);
  if (state.pageSize !== 10) params.set("limit", state.pageSize);
  
  if (state.searchTerm?.length > 0) {
    params.set("search", state.searchTerm.join(","));
  }

  if (state.sortConfig?.key) {
    params.set("sortBy", state.sortConfig.key);
    params.set("sortOrder", state.sortConfig.direction);
  }

  if (state.activeFilters?.length > 0) {
    params.set("filters", JSON.stringify(state.activeFilters));
  }

  if (state.hiddenColumns?.length > 0) {
    params.set("hide", state.hiddenColumns.join(","));
  }

  // --- Hybrid Expansion Logic ---
  if (!disableExpansionSync) {
    if (state.allExpanded) {
      params.set("expanded", "all");
      try { sessionStorage.removeItem("dt_expanded_state"); } catch (e) {}
    } 
    else if (state.expandedRows?.length > 0) {
      // Logic: Store everything locally, but only share 10 to keep URL safe.
      try {
        sessionStorage.setItem("dt_expanded_state", JSON.stringify(state.expandedRows));
      } catch (e) {}

      const shareableIds = state.expandedRows.slice(0, 10);
      params.set("expanded", shareableIds.join(","));
    } 
    else {
      try { sessionStorage.removeItem("dt_expanded_state"); } catch (e) {}
    }
  }

  // Update without reloading the page
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", url);
};
