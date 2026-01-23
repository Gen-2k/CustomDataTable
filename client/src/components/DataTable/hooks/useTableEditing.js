import { useCallback } from "react";
import { ACTIONS } from "./useTableReducer";

/**
 * useTableEditing - Manages the inline cell editing lifecycle.
 * Handles: Starting edit mode, persistence to server, and metadata (facets).
 */
export const useTableEditing = ({
  apiUrl,
  state,
  dispatch,
  columns = [],
  customRowUpdater,
  customFacetFetcher,
}) => {
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

      if (!apiUrl) return;

      try {
        const response = await fetch(`${apiUrl}/${rowId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error("Failed to save changes");
        const updatedRecord = await response.json();

        dispatch({ type: ACTIONS.UPDATE_ROW, payload: updatedRecord });

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

  const fetchFacetOptions = useCallback(
    async (field) => {
      if (state.facetCache[field]) return;

      const column = columns.find((c) => c.key === field);
      if (column?.options) {
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

      if (customFacetFetcher) {
        try {
          const options = await customFacetFetcher(field, column);
          dispatch({
            type: ACTIONS.SET_FACETS,
            payload: { field, options },
          });
        } catch (err) {
          console.error(`Custom facet fetch failed for ${field}:`, err);
        }
        return;
      }

      let fetchUrl = column?.optionsUrl;

      if (!fetchUrl && apiUrl) {
        const baseUrl = apiUrl.split("/").slice(0, -1).join("/");
        fetchUrl = `${baseUrl}/facets/${field}`;
      }

      if (fetchUrl) {
        try {
          const response = await fetch(fetchUrl);
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
      }
    },
    [apiUrl, state.facetCache, dispatch, columns, customFacetFetcher],
  );

  return {
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    fetchFacetOptions,
  };
};
