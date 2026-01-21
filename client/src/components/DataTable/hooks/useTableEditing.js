import { useCallback } from "react";
import { ACTIONS } from "./useTableReducer";

/**
 * useTableEditing - Manages the inline cell editing lifecycle.
 * Handles: Starting edit mode, persistence to server, and metadata (facets).
 */
export const useTableEditing = (apiUrl, state, dispatch) => {
  const handleStartEdit = useCallback(
    (cellId) => {
      dispatch({ type: ACTIONS.SET_EDIT_CELL, payload: cellId });
    },
    [dispatch],
  );

  const handleCancelEdit = useCallback(() => {
    dispatch({ type: ACTIONS.SET_EDIT_CELL, payload: null });
  }, [dispatch]);

  const handleSaveEdit = useCallback(
    async (rowId, updates) => {
      if (!apiUrl) return;

      try {
        const response = await fetch(`${apiUrl}/${rowId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error("Failed to save changes");
        const updatedRecord = await response.json();

        // Update local state immediately
        dispatch({ type: ACTIONS.UPDATE_ROW, payload: updatedRecord });

        // Invalidate facet cache for modified fields so they refresh on next open
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
    [apiUrl, dispatch],
  );

  const fetchFacetOptions = useCallback(
    async (field) => {
      // Return cached values if available
      if (state.facetCache[field] || !apiUrl) return;

      try {
        // Derive facet endpoint from base apiUrl
        const baseUrl = apiUrl.split("/").slice(0, -1).join("/");
        const response = await fetch(`${baseUrl}/facets/${field}`);

        if (response.ok) {
          const options = await response.json();
          dispatch({
            type: ACTIONS.SET_FACETS,
            payload: {
              field,
              options: options.map((v) => ({ label: String(v), value: v })),
            },
          });
        }
      } catch (err) {
        console.error(`Facet fetch failed for ${field}:`, err);
      }
    },
    [apiUrl, state.facetCache, dispatch],
  );

  return {
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    fetchFacetOptions,
  };
};
