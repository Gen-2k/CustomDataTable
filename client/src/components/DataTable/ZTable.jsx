import React from "react";
import { TableProvider } from "./TableContext";
import DataTable from "./DataTable";
import DataTableSearch from "./DataTableSearch";

const ZTable = ({
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

  // Slot for extra content (e.g. Export buttons)
  headerActions,
}) => {
  return (
    <div className="ztable-container">
      <TableProvider
        apiUrl={apiUrl}
        columns={columns}
        initialPageSize={initialPageSize}
        requestMapper={requestMapper}
        responseMapper={responseMapper}
        customFetcher={customFetcher}
        customRowUpdater={customRowUpdater}
        customFacetFetcher={customFacetFetcher}
      >
        {enableSearch && <DataTableSearch placeholder={searchPlaceholder} />}
        {headerActions && (
          <div className="ztable-actions" style={{ marginBottom: "1rem" }}>
            {headerActions}
          </div>
        )}

        <DataTable />
      </TableProvider>
    </div>
  );
};

export default ZTable;
