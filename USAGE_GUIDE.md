# 📘 Developer Usage Guide: DataTable Component

This guide covers everything a developer needs to know to integrate, customize, and extend the `DataTable` component.

---

## 1. Installation

The `DataTable` is designed as a **self-contained feature folder**. To use it in a new project:

1. Copy the `src/components/DataTable` directory.
2. Ensure you have `lucide-react` installed:
   ```bash
   npm install lucide-react
   ```

---

## 2. Standard Integration

The simplest way to use the table is to import the folder (which uses the `index.js` entry point).

```jsx
import DataTable from "./components/DataTable";

function MyPage() {
  const columns = [
    { key: "firstName", label: "First Name", sortable: true },
    { key: "email", label: "Email Address" },
    { key: "role", label: "Permission", filterType: "text" },
  ];

  return (
    <DataTable apiUrl="https://api.myapp.com/v1/users" columns={columns} />
  );
}
```

---

## 3. Configuration Deep-Dive

### A. Column Definitions

The `columns` array is the most important configuration. Every object represents a column.

| Key              | Description                                                         |
| :--------------- | :------------------------------------------------------------------ |
| `key`            | (String) JSON key. Supports nested paths like `user.profile.name`.  |
| `label`          | (String) Display name in header.                                    |
| `width`          | (String) CSS width (e.g. `200px`, `15%`).                           |
| `sortable`       | (Boolean) Enables server-side sorting clickable headers.            |
| `sticky`         | (`"left"` or `"right"`) Freezes the column.                         |
| `editable`       | (Boolean) Enable inline editing (Double-click to activate).         |
| `filterType`     | (`"text"`, `"number"`, `"date"`, `"boolean"`) Sets filter logic.    |
| `editorType`     | (`"select"`, `"tags"`, `"textarea"`, `"date"`) Sets UI for editing. |
| `options`        | (Array) Static list for selects: `['Admin', 'User']`.               |
| `dynamicOptions` | (Boolean) Automatically fetch unique values from API.               |

### B. Dynamic Options (Facets)

If `dynamicOptions: true` is set, the table will try to fetch a list of possible values for that field.

- **Default Behavior**: It hits `${apiUrl.parent}/facets/${columnKey}`.
- **Override**: Use `optionsUrl: "/api/roles"` to point to a specific endpoint.

---

## 4. Advanced Data Handling

### Overriding the API Shape (Mappers)

If your API doesn't return `{ data: [], meta: { total: 100 } }`, use a mapper:

```jsx
<DataTable
  apiUrl="/users"
  responseMapper={(res) => ({
    data: res.results, // Where the rows are
    total: res.total_records, // Total count for pagination
    totalPages: res.pages, // Total pages
  })}
/>
```

### Manual Data Loading (customFetcher)

Use this for GraphQL, LocalStorage, or specialized SDKs.

```jsx
const myFetcher = async (params, signal) => {
  const { page, limit, search } = params;
  const data = await myApi.query({ page, limit, search }, { signal });
  return data; // Response mapper will still run on this returned object
};

<DataTable customFetcher={myFetcher} />;
```

---

## 5. Inline Editing Logic

The table handles the UI for editing, but you can control the **Persistence**.

### Default REST Persistence

By default, the table sends a `PUT` request to `${apiUrl}/${rowId}` with the updated fields in the body.

### Custom Persistence Logic

```jsx
const handleSave = async (id, updates) => {
  // Use your own SDK or custom logic
  const updatedUser = await sdk.users.update(id, updates);
  toast.success("User updated!");
  return updatedUser; // Critical: Return the fresh object to update the local table state
};

<DataTable customRowUpdater={handleSave} />;
```

---

## 6. Layout Customization

### Sticky Columns

To handle wide data sets, use the `sticky` property:

```javascript
{ key: 'actions', label: 'Actions', sticky: 'right', width: '100px' }
```

### Custom Cell Rendering

You can render anything inside a cell (Avatars, Status Badges, Progress Bars):

```jsx
{
  key: "status",
  label: "Status",
  render: (row) => (
    <span className={`badge badge-${row.status}`}>
      {row.status.toUpperCase()}
    </span>
  )
}
```

---

## 7. Developer Best Practices

1. **Memoize Columns**: Always use `useMemo` for your columns array to prevent unnecessary re-renders of the entire grid.
2. **Unique Keys**: Ensure your API data includes a unique `id` or `_id` field.
3. **CSS Isolation**: Always keep the `styles/` folder nearby. It uses localized tokens that won't interfere with your global app styles.
4. **Error Boundaries**: While the table has internal error handling, wrapping it in a React Error Boundary is recommended for production.
