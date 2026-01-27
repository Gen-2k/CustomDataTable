import { useEffect, useCallback, useRef } from "react";
import { ACTIONS } from "./useTableReducer";
import { updateURLFromState } from "../utils/urlSync";
import { getNestedValue } from "../utils/dataHelpers";

/**
 * useTableFetch - Optimized Data Retrieval Engine.
 */

const DEFAULT_REQUEST_MAPPER = (state) => ({
  page: state.currentPage,
  limit: state.pageSize,
  sortBy: state.sortConfig.key || "",
  sortOrder: state.sortConfig.direction,
  search: state.debouncedSearchTerm,
  filters: state.activeFilters.length > 0 ? JSON.stringify(state.activeFilters) : undefined,
});

const DEFAULT_RESPONSE_MAPPER = (res) => ({
  data: res?.data || [],
  total: res?.meta?.total ?? 0,
  totalPages: res?.meta?.totalPages ?? 1,
});

export const useTableFetch = ({
  apiUrl,
  state,
  dispatch,
  requestMapper = DEFAULT_REQUEST_MAPPER,
  responseMapper = DEFAULT_RESPONSE_MAPPER,
  customFetcher = null,
  disableUrlSync = false,
  staticData = null,
  disableExpansionSync = false,
}) => {
  const abortControllerRef = useRef(null);
  const urlTimerRef = useRef(null);

  // 1. Optimized URL Sync (Debounced to prevent UI lag)
  useEffect(() => {
    if (disableUrlSync) return;

    if (urlTimerRef.current) clearTimeout(urlTimerRef.current);
    
    urlTimerRef.current = setTimeout(() => {
      updateURLFromState(state, { disableExpansionSync });
    }, 100); // 100ms micro-debounce ensures UI updates first

    return () => clearTimeout(urlTimerRef.current);
  }, [
    state.currentPage, 
    state.pageSize, 
    state.searchTerm, 
    state.activeFilters, 
    state.sortConfig, 
    state.expandedRows, 
    state.allExpanded, 
    state.hiddenColumns,
    disableUrlSync, 
    disableExpansionSync
  ]);

  // 2. Data Fetching Logic
  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Optimization: Don't show global loading for static data sorts
    if (!staticData) {
      dispatch({ type: ACTIONS.START_FETCH });
    }

    try {
      const apiParams = requestMapper(state);
      let result;

      if (customFetcher) {
        result = await customFetcher(apiParams, controller.signal);
      } 
      else if (staticData) {
        // PERFORMANCE: Fast local processing
        let processed = [...staticData];

        if (state.debouncedSearchTerm) {
          const s = state.debouncedSearchTerm.toLowerCase();
          processed = processed.filter(item => {
            // Faster than JSON.stringify: Just check some key values
            return Object.values(item).some(val => 
              String(val).toLowerCase().includes(s)
            );
          });
        }

        if (state.sortConfig.key) {
          const { key, direction } = state.sortConfig;
          processed.sort((a, b) => {
            const aVal = getNestedValue(a, key);
            const bVal = getNestedValue(b, key);
            if (aVal === bVal) return 0;
            const res = aVal < bVal ? -1 : 1;
            return direction === "asc" ? res : -res;
          });
        }

        dispatch({
          type: ACTIONS.FETCH_SUCCESS,
          payload: { data: processed, total: processed.length, totalPages: 1 }
        });
        return;
      } 
      else if (apiUrl) {
        const query = new URLSearchParams();
        Object.entries(apiParams).forEach(([k, v]) => {
          if (v !== undefined && v !== null) query.append(k, v);
        });

        const res = await fetch(`${apiUrl}?${query}`, { signal: controller.signal });
        if (!res.ok) throw new Error("API Error");
        result = await res.json();
      }

      const mapped = responseMapper(result);
      dispatch({
        type: ACTIONS.FETCH_SUCCESS,
        payload: {
          data: Array.isArray(mapped?.data) ? mapped.data : [],
          total: Number(mapped?.total) || 0,
          totalPages: Number(mapped?.totalPages) || 1,
        },
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        dispatch({ type: ACTIONS.FETCH_ERROR, payload: err.message });
      }
    }
  }, [apiUrl, state.currentPage, state.pageSize, state.debouncedSearchTerm, state.activeFilters, state.sortConfig, staticData, customFetcher, requestMapper, responseMapper, dispatch]);

  useEffect(() => {
    fetchData();
    return () => abortControllerRef.current?.abort();
  }, [fetchData]);

  // Search Debounce (Slightly reduced for snappier feel)
  useEffect(() => {
    const searchString = state.searchTerm.join(" ");
    if (searchString === state.debouncedSearchTerm) return;
    const timer = setTimeout(() => {
      dispatch({ type: ACTIONS.SYNC_DEBOUNCED_SEARCH, payload: searchString });
    }, 300); // Reduced from 400ms to 300ms for responsiveness
    return () => clearTimeout(timer);
  }, [state.searchTerm, state.debouncedSearchTerm, dispatch]);

  return { fetchData };
};
