# 📊 Enterprise DataTable Component

A professional, high-performance, and fully customizable React Data Table designed for enterprise-grade applications. This component is self-contained, handles its own state (including URL sync), and is compatible with any backend API.

## 🚀 Quick Start

```jsx
import DataTable from "./components/DataTable";

const columns = [
  { key: "id", label: "ID", width: "80px" },
  { key: "name", label: "Employee Name", sortable: true, editable: true },
  {
    key: "status",
    label: "Status",
    editorType: "select",
    options: ["Active", "Idle"],
  },
];

function App() {
  return <DataTable apiUrl="https://api.example.com/users" columns={columns} />;
}
```

---

## 🛠 Component Props

| Prop                 | Type      | Default              | Description                                                        |
| :------------------- | :-------- | :------------------- | :----------------------------------------------------------------- |
| `apiUrl`             | `string`  | `undefined`          | The base endpoint for fetching and updating data.                  |
| `columns`            | `array`   | `[]`                 | **Required.** Array of column definition objects.                  |
| `initialPageSize`    | `number`  | `10`                 | Default number of rows per page.                                   |
| `enableSearch`       | `boolean` | `true`               | Show/Hide the intelligent search bar.                              |
| `searchPlaceholder`  | `string`  | `"Search..."`        | Placeholder text for the search input.                             |
| `headerActions`      | `node`    | `null`               | Slot for extra UI (e.g., Export buttons) between search and table. |
| `requestMapper`      | `func`    | `(state) => params`  | Map table state to API query parameters.                           |
| `responseMapper`     | `func`    | `(res) => data`      | Map API response JSON to table format.                             |
| `customFetcher`      | `func`    | `fetch` builtin      | Replace default fetch logic (e.g., for Axios or SDKs).             |
| `customRowUpdater`   | `func`    | `PUT` request        | Intercept and handle row updates manually.                         |
| `customFacetFetcher` | `func`    | `(field) => options` | Manually provide options for dropdowns/tags.                       |

---

## 📐 Column Configuration

Each object in the `columns` array can have the following properties:

### Basic Setup

- `key`: (String) The field name in your data (supports nesting like `profile.firstName`).
- `label`: (String) The display name in the header.
- `width`: (String) CSS width (e.g., `"150px"`, `"20%"`).
- `render`: (Function) Custom JSX renderer: `(row) => <span>{row.name}</span>`.

### Interactivity

- `sortable`: (Boolean) Enable/Disable server-side sorting for this column.
- `sticky`: (String) `"left"` or `"right"` to freeze the column during horizontal scroll.

### Editing & Filtering

- `editable`: (Boolean) Enable inline double-click editing.
- `filterType`: (String) One of `"text"`, `"number"`, `"date"`, `"boolean"`. Controls the advanced filter operators.
- `editorType`: (String) Defines the UI for editing. Options:
  - `"text"` (Default)
  - `"number"`
  - `"date"`
  - `"textarea"` (Opens an expanded modal editor)
  - `"select"` (Standard dropdown)
  - `"tags"` (Multi-select pill interface)
- `options`: (Array) List of static options for `select` or `tags`.
- `dynamicOptions`: (Boolean) If true, the table will fetch options from the server (facets).
- `optionsUrl`: (String) Override the URL used to fetch dynamic options.

---

## 🧠 Advanced Features

### 1. URL State Persistence

The table automatically syncs its state (page, filters, search, sorting) to the URL. This allows users to refresh the page or share a link without losing their current view.

### 2. Intelligent Search & Filtering

The search bar supports:

- **Global Search**: Type and press Enter to search across all fields.
- **Field Filters**: Click the filter icon to add specific rules (e.g., `Age > 25`).
- **Recent Searches**: Remembers your last 5 searches in local storage.

### 3. Infinite API Compatibility

If your backend doesn't match the default expected format, use mappers:

```jsx
<DataTable
  apiUrl="/api/data"
  columns={cols}
  responseMapper={(res) => ({
    data: res.items, // Array of data
    total: res.pagination.total, // Total record count
    totalPages: res.pageCount, // Total pages
  })}
/>
```

### 4. Custom API Clients (Axios/GraphQL)

```jsx
<DataTable
  customFetcher={async (params, signal) => {
    const res = await myAxios.get("/users", { params, signal });
    return res.data;
  }}
/>
```

---

## 🎨 Styling & Design System

The component is wrapped in a `.dt-scope` class to prevent style leaking. It uses a **Variable System** defined in `styles/DataTable.vars.css`. You can customize the look by overriding these variables:

```css
:root {
  --dt-primary: #6366f1; /* Brand color */
  --dt-radius-lg: 8px; /* Roundness */
  --dt-font-family: "Poppins", sans-serif;
}
```

---

## 📂 Folder Structure

- `hooks/`: Specialized logic for fetching, filtering, and editing.
- `components/`: UI sub-components (Pagination, Search, Editors).
- `styles/`: Modular CSS files and global tokens.
- `utils/`: Data helpers and URL synchronization logic.
- `DataTable.jsx`: The "Smart" entry point.
- `BaseTable.jsx`: The pure UI implementation.

---

## ⚖️ License

Internal Production Ready Component. Created for high-performance React applications.
