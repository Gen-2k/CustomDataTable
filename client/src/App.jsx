import { useMemo } from "react";
import DataTable from "./components/DataTable"; // Using the new default export
import { tableColumns } from "./config/tableColumns";

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
          searchPlaceholder="Search employees by name, role, or ID..."
        />
      </div>
    </div>
  );
}

export default App;
