# ZTable Usage Guide

The `ZTable` component is a production-ready, drop-in data grid solution. It unifies the Table Provider, Search, and Grid into a single component.

## 1. Installation

Copy the `src/components/DataTable` folder into your project.

## 2. Basic Usage (The "Drop-in" Scenario)

If you have a standard REST API that follows the convention:

- **Data:** `GET /api/users`
- **Metadata/Options:** `GET /api/facets/{fieldName}` (Optional)

You can use the table with zero configuration:

```jsx
import { ZTable } from "./components/DataTable";

const columns = [
  { label: "Name", key: "name", filterType: "text" },
  { label: "Role", key: "role", filterType: "text", dynamicOptions: true },
];

function EmployeePage() {
  return (
    <ZTable
      apiUrl="https://my-api.com/api/employees"
      columns={columns}
      searchPlaceholder="Search employees..."
    />
  );
}
```

---

## 3. Advanced Scenarios

### Scenario A: Custom Dropdown Options (Static)

You don't have an API endpoint for options, just a static list.

```javascript
/* tableColumns.js */
export const columns = [
  {
    label: "Status",
    key: "status",
    editable: true,
    // Directly provide options
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];
```

### Scenario B: Custom Dropdown Options (Specific URL)

Your options endpoint doesn't match the default naming convention.

```javascript
/* tableColumns.js */
export const columns = [
  {
    label: "Department",
    key: "dept_id",
    editable: true,
    dynamicOptions: true,
    // Tell the table exactly where to look
    optionsUrl: "https://my-api.com/v2/reference/departments",
  },
];
```

### Scenario C: Custom Data Fetching (Non-Standard API / GraphQL / Firebase)

Your API response doesn't match the standard shape `{ data: [], meta: { total: 100 } }`.

```jsx
const myResponseMapper = (response) => ({
  data: response.results, // My API calls it 'results'
  total: response.count, // My API calls it 'count'
  totalPages: Math.ceil(response.count / 10),
});

<ZTable apiUrl="..." columns={columns} responseMapper={myResponseMapper} />;
```

### Scenario D: Completely Custom Data Source (No API URL)

You want to load data from LocalStorage or an SDK, not a `fetch` URL.

```jsx
const fetchFromLocalStorage = async (params) => {
  const allData = JSON.parse(localStorage.getItem("users"));
  // ... filter and sort logic ...
  return { data: finalData, meta: { total: finalData.length } };
};

<ZTable columns={columns} customFetcher={fetchFromLocalStorage} />;
```

### Scenario E: Custom Save Logic

You need to do something special when a user edits a cell, like updating a completely different store or using a specific SDK method.

```jsx
const handleRowUpdate = async (rowId, updates) => {
  console.log("Saving to Firebase:", rowId, updates);
  await db.collection("users").doc(rowId).update(updates);
  return { ...row, ...updates }; // Return the updated object
};

<ZTable columns={columns} customRowUpdater={handleRowUpdate} />;
```

---

## 4. Header Actions

You can easily inject buttons (like "Export" or "Create New") into the header next to the search bar.

```jsx
<ZTable
  apiUrl="..."
  columns={columns}
  headerActions={
    <button className="btn-primary" onClick={handleExport}>
      Export CSV
    </button>
  }
/>
```
