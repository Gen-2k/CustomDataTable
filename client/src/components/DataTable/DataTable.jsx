import React from "react";
import { TableProvider } from "./TableContext";
import BaseTable from "./BaseTable";
import DataTableSearch from "./DataTableSearch";

/**
 * DataTable - The primary entry point for the component.
 * It wraps the UI in a TableProvider and includes optional search/action slots.
 */
const DataTable = ({
  // Core Configuration
  apiUrl,
  columns,
  initialPageSize = 10,

  // UI Configuration
  enableSearch = true,
  searchPlaceholder = "Search...",

  // Customization Hooks (Advanced)
  requestMapper,
  responseMapper,
  customFetcher,
  customRowUpdater,
  customFacetFetcher,

  headerActions,
  renderSubTable,
  disableUrlSync = false,
  enablePagination = false,
  data: staticData,
}) => {
  return (
    <div className="ztable-container dt-scope">
      <TableProvider
        apiUrl={apiUrl}
        columns={columns}
        initialPageSize={initialPageSize}
        requestMapper={requestMapper}
        responseMapper={responseMapper}
        customFetcher={customFetcher}
        customRowUpdater={customRowUpdater}
        customFacetFetcher={customFacetFetcher}
        disableUrlSync={disableUrlSync}
        staticData={staticData}
        renderSubTable={renderSubTable}
      >
        {enableSearch && <DataTableSearch placeholder={searchPlaceholder} />}
        {headerActions && (
          <div className="ztable-actions" style={{ marginBottom: "1rem" }}>
            {headerActions}
          </div>
        )}

        <BaseTable
          renderSubTable={renderSubTable}
          enablePagination={enablePagination}
        />
      </TableProvider>
    </div>
  );
};

export default DataTable;
