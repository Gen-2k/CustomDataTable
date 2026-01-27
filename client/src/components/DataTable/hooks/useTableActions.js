import { useCallback } from "react";
import { ACTIONS } from "./useTableReducer";

/**
 * useTableActions - The "Controller" of the DataTable.
 * This hook generates stable, memoized event handlers that child components 
 * use to interact with the table state (sorting, search, paging).
 * 
 * @param {Object} state - The current reducer state.
 * @param {Function} dispatch - The reducer dispatch function.
 */
export const useTableActions = (state, dispatch) => {
  
  /**
   * Toggles sorting on a specific column.
   * Cycles: ASC -> DESC -> Off
   */
  const handleSort = useCallback(
    (key) => {
      let direction = "asc";
      let nextKey = key;

      if (state.sortConfig.key === key) {
        if (state.sortConfig.direction === "asc") direction = "desc";
        else {
          nextKey = null;
          direction = "asc";
        }
      }

      dispatch({
        type: ACTIONS.UPDATE_PARAMS,
        payload: {
          sortConfig: { key: nextKey, direction },
          currentPage: 1, // Reset to page 1 on sort change
        },
      });
    },
    [state.sortConfig, dispatch],
  );

  /**
   * High-level handler for search interactions.
   */
  const handleSearch = useCallback(
    (actionType, payload) => {
      const searchActions = {
        global: () => dispatch({ type: ACTIONS.SET_SEARCH_TOKENS, payload }),
        setFilters: () => dispatch({ type: ACTIONS.SET_FILTERS, payload }),
        clear: () => dispatch({ type: ACTIONS.CLEAR_FILTERS }),
      };
      
      if (searchActions[actionType]) searchActions[actionType]();
    },
    [dispatch],
  );

  const handleClearFilters = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_FILTERS });
  }, [dispatch]);

  const handlePageChange = useCallback(
    (page) => {
      dispatch({
        type: ACTIONS.UPDATE_PARAMS,
        payload: { currentPage: Number(page) },
      });
    },
    [dispatch],
  );

  const handlePageSizeChange = useCallback(
    (size) => {
      dispatch({
        type: ACTIONS.UPDATE_PARAMS,
        payload: { pageSize: Number(size), currentPage: 1 },
      });
    },
    [dispatch],
  );

  const handleToggleColumn = useCallback(
    (key) => {
      dispatch({ type: ACTIONS.TOGGLE_COLUMN, payload: key });
    },
    [dispatch],
  );

  return {
    handleSort,
    handleSearch,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
    handleToggleColumn,
  };
};
