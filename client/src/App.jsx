import { useMemo } from "react";
import DataTable from "./components/DataTable";
import { tableColumns, renderEmployeeSubTable } from "./config/tableColumns";

const API_BASE_URL = "http://localhost:5000/api/users";

function App() {
  const columns = useMemo(() => tableColumns, []);

  return (
    <div className="app-container">
      <div className="app-content">
        <DataTable
          apiUrl={API_BASE_URL}
          columns={columns}
          initialPageSize={10}
          enablePagination={true}
          searchPlaceholder="Search employees..."
          renderSubTable={renderEmployeeSubTable}
        />
      </div>
    </div>
  );
}

export default App;
