import { useMemo } from "react";
import {
  DataTable,
  DataTableSearch,
  TableProvider,
} from "./components/DataTable";
import { tableColumns } from "./config/tableColumns";

const API_BASE_URL = "http://localhost:5000/api/users";

function App() {
  console.log("[App] Rendered");
  const columns = useMemo(() => tableColumns, []);

  return (
    <div className="app-container">
      <div className="app-content">
        <TableProvider
          apiUrl={API_BASE_URL}
          columns={columns}
          initialPageSize={10}
        >
          <DataTableSearch placeholder="Search employees..." />
          <DataTable />
        </TableProvider>
      </div>
    </div>
  );
}

export default App;
