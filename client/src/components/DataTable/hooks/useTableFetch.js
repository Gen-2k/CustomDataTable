import { useEffect, useCallback, useRef } from "react";
import { ACTIONS } from "./useTableReducer";
import { updateURLFromState } from "../utils/urlSync";

const DEFAULT_REQUEST_MAPPER = (state) => ({
  page: state.currentPage,
  limit: state.pageSize,
  sortBy: state.sortConfig.key || "",
  sortOrder: state.sortConfig.direction,
  search: state.debouncedSearchTerm,
  filters:
    state.activeFilters.length > 0
      ? JSON.stringify(state.activeFilters)
      : undefined,
});

const DEFAULT_RESPONSE_MAPPER = (res) => ({
  data: res?.data || [],
  total: res?.meta?.total ?? 0,
  totalPages: res?.meta?.totalPages ?? 1,
});

/**
 * useTableFetch - Handles data synchronization with the server.
 * Responsible for:
 * 1. Building API requests from local state.
 * 2. Handling race conditions via AbortController.
 * 3. Mapping responses to the table's state.
 */
export const useTableFetch = ({
  apiUrl,
  state,
  dispatch,
  requestMapper = DEFAULT_REQUEST_MAPPER,
  responseMapper = DEFAULT_RESPONSE_MAPPER,
  customFetcher = null,
}) => {
  const abortControllerRef = useRef(null);
  const configRef = useRef({ requestMapper, responseMapper, customFetcher });

  useEffect(() => {
    configRef.current = { requestMapper, responseMapper, customFetcher };
  }, [requestMapper, responseMapper, customFetcher]);

  // Sync state to URL
  useEffect(() => {
    updateURLFromState(state);
  }, [
    state.currentPage,
    state.pageSize,
    state.searchTerm,
    state.activeFilters,
    state.sortConfig,
  ]);

  const fetchData = useCallback(async () => {
    // 1. Cancel previous pending searches (Race condition prevention)
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch({ type: ACTIONS.START_FETCH });

    try {
      const {
        requestMapper: currentMapper,
        responseMapper: currentResMapper,
        customFetcher: currentFetcher,
      } = configRef.current;

      // Map local state to API parameters
      const apiParams = currentMapper({
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        sortConfig: state.sortConfig,
        debouncedSearchTerm: state.debouncedSearchTerm,
        activeFilters: state.activeFilters,
      });

      let result;
      if (currentFetcher) {
        result = await currentFetcher(apiParams, controller.signal);
      } else if (apiUrl) {
        const query = new URLSearchParams();
        Object.entries(apiParams).forEach(([key, val]) => {
          if (val !== undefined && val !== null) query.append(key, val);
        });

        const response = await fetch(`${apiUrl}?${query}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        result = await response.json();
      } else {
        throw new Error(
          "Misconfiguration: Provide 'apiUrl' or 'customFetcher'.",
        );
      }

      const rawMapped = currentResMapper(result);
      dispatch({
        type: ACTIONS.FETCH_SUCCESS,
        payload: {
          data: Array.isArray(rawMapped?.data) ? rawMapped.data : [],
          total: Number(rawMapped?.total) || 0,
          totalPages: Number(rawMapped?.totalPages) || 1,
        },
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        dispatch({ type: ACTIONS.FETCH_ERROR, payload: err.message });
      }
    }
  }, [
    apiUrl,
    state.currentPage,
    state.pageSize,
    state.debouncedSearchTerm,
    state.activeFilters,
    state.sortConfig,
    dispatch,
  ]);

  // Main Fetch Effect
  useEffect(() => {
    fetchData();
    return () => abortControllerRef.current?.abort();
  }, [fetchData]);

  // Search Debouncing Logic
  useEffect(() => {
    const searchString = state.searchTerm.join(" ");
    if (searchString === state.debouncedSearchTerm) return;

    const timer = setTimeout(() => {
      dispatch({ type: ACTIONS.SYNC_DEBOUNCED_SEARCH, payload: searchString });
    }, 500);

    return () => clearTimeout(timer);
  }, [state.searchTerm, state.debouncedSearchTerm, dispatch]);

  return { fetchData };
};
