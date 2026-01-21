/**
 * urlSync - Utilities to synchronize table state with URL query parameters.
 */

export const getInitialStateFromURL = (defaults) => {
  const params = new URLSearchParams(window.location.search);

  const state = { ...defaults };

  if (params.has("page")) state.currentPage = Number(params.get("page"));
  if (params.has("limit")) state.pageSize = Number(params.get("limit"));
  if (params.has("search")) {
    state.searchTerm = params.get("search").split(",").filter(Boolean);
    state.debouncedSearchTerm = state.searchTerm.join(" ");
  }
  if (params.has("sortBy")) {
    state.sortConfig = {
      key: params.get("sortBy"),
      direction: params.get("sortOrder") || "asc",
    };
  }
  if (params.has("filters")) {
    try {
      state.activeFilters = JSON.parse(params.get("filters"));
    } catch (e) {
      console.error("Failed to parse filters from URL", e);
    }
  }

  return state;
};

export const updateURLFromState = (state) => {
  const params = new URLSearchParams();

  if (state.currentPage > 1) params.set("page", state.currentPage);
  if (state.pageSize !== 10) params.set("limit", state.pageSize);
  if (state.searchTerm && state.searchTerm.length > 0) {
    params.set("search", state.searchTerm.join(","));
  }
  if (state.sortConfig?.key) {
    params.set("sortBy", state.sortConfig.key);
    params.set("sortOrder", state.sortConfig.direction);
  }
  if (state.activeFilters && state.activeFilters.length > 0) {
    params.set("filters", JSON.stringify(state.activeFilters));
  }

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}`;

  // Use replaceState to avoid cluttering history during active filtering
  window.history.replaceState(null, "", url);
};
