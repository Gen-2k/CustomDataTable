import { useCallback } from "react";
import { ACTIONS } from "./useTableReducer";

/**
 * useTableEditing - Manages the inline cell editing lifecycle.
 * Handles the "Edit -> Save -> Refresh" loop.
 */
export const useTableEditing = ({
  apiUrl,
  state,
  dispatch,
  columns = [],
  customRowUpdater,
  customFacetFetcher,
  idKey = "id",
}) => {
  
  /**
   * Activates edit mode for a specific cell.
   */
  const handleStartEdit = useCallback(
    (cellMeta) => {
      dispatch({ type: ACTIONS.SET_EDIT_CELL, payload: cellMeta });
    },
    [dispatch],
  );

  /**
   * Discards changes and exits edit mode.
   */
  const handleCancelEdit = useCallback(() => {
    dispatch({ type: ACTIONS.SET_EDIT_CELL, payload: null });
  }, [dispatch]);

  /**
   * Persists changes to the server or local state.
   */
  const handleSaveEdit = useCallback(
    async (rowId, updates) => {
      // Logic A: Use local/custom update function if provided
      if (customRowUpdater) {
        try {
          const updatedRecord = await customRowUpdater(rowId, updates);
          dispatch({ type: ACTIONS.UPDATE_ROW, payload: updatedRecord });
          return updatedRecord;
        } catch (err) {
          dispatch({ type: ACTIONS.SET_EDIT_CELL, payload: null });
          throw err;
        }
      }

      // Logic B: Default API PUT request
      if (!apiUrl) return;

      try {
        const response = await fetch(`${apiUrl}/${rowId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error("Update failed");
        const updatedRecord = await response.json();

        dispatch({ type: ACTIONS.UPDATE_ROW, payload: updatedRecord });

        // Invalidate facet cache for edited fields to ensure dropdowns stay fresh
        Object.keys(updates).forEach((field) => {
          dispatch({
            type: ACTIONS.SET_FACETS,
            payload: { field, options: null },
          });
        });

        return updatedRecord;
      } catch (err) {
        dispatch({ type: ACTIONS.SET_EDIT_CELL, payload: null });
        throw err;
      }
    },
    [apiUrl, dispatch, customRowUpdater],
  );

  /**
   * Fetches metadata for searchable/suggestible fields.
   */
  const fetchFacetOptions = useCallback(
    async (field) => {
      if (state.facetCache[field]) return;

      const column = columns.find((c) => c.key === field);
      if (!column) return;

      // Logic C: Use static options from column config
      if (column.options) {
        dispatch({
          type: ACTIONS.SET_FACETS,
          payload: {
            field,
            options: column.options.map((v) =>
              typeof v === "object" ? v : { label: String(v), value: v },
            ),
          },
        });
        return;
      }

      // --- INDUSTRY STANDARD FETCHING CONTRACT ---
      let options = null;

      try {
        // Option A: Specific URL provided in Column Config
        if (column.facetUrl) {
          const res = await fetch(column.facetUrl);
          if (res.ok) options = await res.json();
        } 
        // Option B: Global Custom Fetcher provided as a Prop
        else if (customFacetFetcher) {
          options = await customFacetFetcher(field, column);
        } 
        // Option C: Smart Default (Only if apiUrl is provided)
        else if (apiUrl) {
          const fallbackUrl = apiUrl.split("?")[0].replace(/\/users$/, "") + `/facets/${field}`;
          const res = await fetch(fallbackUrl);
          if (res.ok) options = await res.json();
        }

        // Standardize result into { label, value } format
        if (options && Array.isArray(options)) {
          const normalizedOptions = options.map((v) =>
            typeof v === "object" ? v : { label: String(v), value: v },
          );
          dispatch({ type: ACTIONS.SET_FACETS, payload: { field, options: normalizedOptions } });
        }
      } catch (err) {
        console.warn(`DataTable: Facet lookup failed for [${field}]`, err);
      }
    },
    [state.facetCache, dispatch, columns, customFacetFetcher, apiUrl],
  );

  return {
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    fetchFacetOptions,
  };
};
