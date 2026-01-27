/**
 * urlSync - Professional URL & Storage state management.
 * 
 * This utility handles the "Deep Linking" and "Persistence" capabilities of the DataTable.
 * 
 * Strategy:
 * - URL: Priority for shareable state (Pagination, Search, Sort).
 * - LocalStorage: Priority for User Preferences (Column Visibility).
 * - SessionStorage: Priority for Navigation State (Recent Expansions).
 */

/**
 * Parses the current URL and Local Storage to rebuild the initial table state.
 * 
 * @param {Object} defaults - The baseline state of the table.
 * @returns {Object} - The hydrated state from URL/Storage.
 */
export const getInitialStateFromURL = (defaults) => {
  const params = new URLSearchParams(window.location.search);
  const state = { ...defaults };
  
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

  // --- 4. Column Visibility (Hybrid Recovery) ---
  let urlHidden = [];
  if (params.has("hide")) {
    urlHidden = params.get("hide").split(",").filter(Boolean);
  }

  let localHidden = [];
  try {
    const saved = localStorage.getItem("dt_hidden_columns");
    if (saved) localHidden = JSON.parse(saved);
  } catch (e) {
    // Fail silently
  }

  // Combine both, giving priority to URL for specific shared links
  state.hiddenColumns = [...new Set([...urlHidden, ...localHidden])];

  // --- 5. Expansion Logic (Hybrid URL + SessionStorage) ---
  let urlExpanded = [];
  if (params.has("expanded")) {
    const val = params.get("expanded");
    if (val === "all") {
      state.allExpanded = true;
      state.expandedRows = [];
    } else {
      urlExpanded = val.split(",").filter(Boolean);
    }
  }

  let sessionExpanded = [];
  try {
    const saved = sessionStorage.getItem("dt_expanded_state");
    if (saved) sessionExpanded = JSON.parse(saved);
  } catch {
    // Fail silently
  }

  // Merge both sources, ensuring uniqueness
  state.expandedRows = [...new Set([...urlExpanded, ...sessionExpanded])];

  return state;
};

/**
 * Synchronizes the internal table state to the browser and local storage.
 * 
 * @param {Object} state - The current reducer state.
 * @param {Object} options - Sync configurations.
 */
export const updateURLFromState = (state, options = {}) => {
  const { disableExpansionSync = false } = options;
  const params = new URLSearchParams();

  // --- Sync Core Parameters (Shared) ---
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

  // --- Column Visibility (Persistence) ---
  if (state.hiddenColumns?.length > 0) {
    // URL for sharing
    params.set("hide", state.hiddenColumns.join(","));
    // LocalStorage for persistence across refreshes
    try {
      localStorage.setItem("dt_hidden_columns", JSON.stringify(state.hiddenColumns));
    } catch (e) {}
  } else {
    try {
      localStorage.removeItem("dt_hidden_columns");
    } catch (e) {}
  }

  // --- Hybrid Expansion Logic ---
  if (!disableExpansionSync) {
    if (state.allExpanded) {
      params.set("expanded", "all");
      try { sessionStorage.removeItem("dt_expanded_state"); } catch (e) {}
    } 
    else if (state.expandedRows?.length > 0) {
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
