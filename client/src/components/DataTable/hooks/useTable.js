import { useReducer, useMemo } from "react";
import { tableReducer } from "./useTableReducer";
import { useTableFetch } from "./useTableFetch";
import { useTableFilters } from "./useTableFilters";
import { useTableEditing } from "./useTableEditing";
import { getInitialStateFromURL } from "../utils/urlSync";

const useTable = (config = {}) => {
  const {
    apiUrl,
    initialPageSize = 10,
    requestMapper,
    responseMapper,
    customFetcher,
  } = config;

  const initialState = useMemo(
    () =>
      getInitialStateFromURL({
        data: [],
        totalRows: 0,
        totalPages: 0,
        loading: true,
        error: null,
        currentPage: 1,
        pageSize: initialPageSize,
        searchTerm: [],
        debouncedSearchTerm: "",
        activeFilters: [],
        sortConfig: { key: null, direction: "asc" },
        editingCell: null,
        facetCache: {},
        hiddenColumns: [],
      }),
    [initialPageSize],
  );

  const [state, dispatch] = useReducer(tableReducer, initialState);

  const { fetchData } = useTableFetch({
    apiUrl,
    state,
    dispatch,
    requestMapper,
    responseMapper,
    customFetcher,
  });

  const filterActions = useTableFilters(state, dispatch);

  const editActions = useTableEditing({
    apiUrl,
    state,
    dispatch,
    columns: config.columns,
    customRowUpdater: config.customRowUpdater,
    customFacetFetcher: config.customFacetFetcher,
  });
  return {
    ...state,
    ...filterActions,
    ...editActions,
    fetchData,
  };
};

export default useTable;
