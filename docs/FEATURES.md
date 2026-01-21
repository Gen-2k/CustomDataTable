# CustomDataTable Component - Feature Documentation

> **Version:** 1.0.0  
> **Last Updated:** January 2026  
> **Purpose:** A comprehensive, shareable React data table component for enterprise applications

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Advanced Features](#advanced-features)
5. [Component API](#component-api)
6. [Editor System](#editor-system)
7. [Styling System](#styling-system)
8. [Server Integration](#server-integration)

---

## Overview

The CustomDataTable is a **fully-featured, server-side paginated data table component** built with React. It's designed to handle large datasets (100k+ records) efficiently while providing a rich, interactive user experience.

### Key Highlights

- ✅ **Server-Side Operations**: Pagination, sorting, filtering, and search are all handled server-side
- ✅ **Modular Architecture**: Built with separation of concerns using React Context and custom hooks
- ✅ **Inline Editing**: Full CRUD support with multiple editor types
- ✅ **URL State Persistence**: Browser back/forward navigation support
- ✅ **Performance Optimized**: Memoization, debouncing, and race condition handling
- ✅ **Fully Styled**: Self-contained CSS with design tokens and CSS variables

---

## Architecture

### Directory Structure

```
DataTable/
├── DataTable.jsx          # Main table rendering component
├── DataTableSearch.jsx    # Search bar with advanced filters
├── Pagination.jsx         # Pagination controls
├── TableContext.jsx       # React Context provider (3 separate contexts)
├── index.js               # Public exports
│
├── hooks/
│   ├── useTable.js        # Orchestrator hook
│   ├── useTableFetch.js   # Data fetching & race condition handling
│   ├── useTableFilters.js # Sorting, filtering, pagination handlers
│   ├── useTableEditing.js # Inline edit lifecycle
│   └── useTableReducer.js # State management reducer
│
├── components/
│   ├── EditableCell.jsx   # Inline cell editing wrapper
│   ├── FilterBuilder.jsx  # Advanced filter UI builder
│   ├── SearchMenu.jsx     # Recent searches & field selection
│   ├── ColumnSettings.jsx # Column visibility toggle
│   └── editors/
│       ├── index.jsx      # Editor registry with auto-resolution
│       ├── BaseInput.jsx  # Text/Number/Date input editor
│       ├── SmartSelect.jsx# Autocomplete select with create option
│       ├── TagEditor.jsx  # Multi-tag editor
│       └── LongTextEditor.jsx # Modal-based textarea editor
│
├── utils/
│   ├── dataHelpers.js     # Nested value getter
│   └── urlSync.js         # URL query parameter synchronization
│
├── constants/
│   └── DataTable.constants.js # Filter operators & labels
│
└── styles/
    ├── DataTable.vars.css    # CSS custom properties (design tokens)
    ├── DataTable.css         # Core table styles
    ├── DataTableStates.css   # Loading, error, empty states
    ├── DataTable.utils.css   # Badge, chip, avatar utilities
    ├── DataTableSearch.css   # Search component styles
    ├── Pagination.css        # Pagination styles
    ├── SmartSelect.css       # Select editor styles
    ├── TagEditor.css         # Tag editor styles
    └── LongTextEditor.css    # Modal editor styles
```

### Context Architecture (Three-Context Pattern)

The component uses a **3-context split pattern** for optimal re-render performance:

| Context              | Purpose                               | Consumers             |
| -------------------- | ------------------------------------- | --------------------- |
| `TableSearchContext` | Search terms, filters, columns config | DataTableSearch       |
| `TableDataContext`   | Data, loading, pagination, sort state | DataTable, Pagination |
| `TableActionContext` | Handler functions (stable refs)       | All components        |

This ensures that search input changes don't re-render the table body, and data updates don't re-render the search bar.

---

## Core Features

### 1. Server-Side Pagination

**Implementation:** Fully server-rendered pagination with configurable page sizes.

```jsx
// Usage
<TableProvider apiUrl="/api/users" initialPageSize={10}>
  <DataTable />
</TableProvider>
```

**Features:**

- Configurable page sizes: 5, 10, 20, 50, 100
- Direct page number input with validation
- First/Previous/Next/Last navigation buttons
- Record count display ("Showing 1 to 10 of 100,000 entries")

### 2. Server-Side Sorting

**Implementation:** Click column headers to sort ascending → descending → unsorted.

**Features:**

- Visual sort indicators (chevron icons)
- Third-click clears sort state
- Maintains sort order in URL for sharing
- Multi-type support: strings, numbers, dates

### 3. Server-Side Filtering

**Filter Types:**

| Type      | Operators                                                    |
| --------- | ------------------------------------------------------------ |
| `text`    | contains, is exactly, is not, starts with, ends with         |
| `number`  | equals, not equals, greater than, less than, between (range) |
| `date`    | between, after, before, on date, not on                      |
| `boolean` | is, is not                                                   |

**Features:**

- Column-specific filter builder UI
- Multi-field filter capability (AND logic)
- Filter chips with edit/remove functionality
- Range inputs for "between" operators

### 4. Global Search (Tokenized)

**Implementation:** Multi-token search across all searchable fields.

```jsx
// Example: Searching "John Manager"
// Matches records where "john" AND "manager" appear in any searchable field
```

**Features:**

- Space-separated token support
- Enter to add search token as chip
- Backspace to edit last token
- Recent searches stored in localStorage (up to 5)
- Click recent search to re-apply

### 5. URL State Synchronization

**Implementation:** All table state persists in URL query parameters.

**Synchronized Parameters:**

- `page` - Current page number
- `limit` - Page size
- `search` - Comma-separated search tokens
- `sortBy` - Sort column key
- `sortOrder` - asc/desc
- `filters` - JSON-encoded filter array
- `hide` - Hidden column keys

**Benefits:**

- Shareable URLs with exact table state
- Browser back/forward navigation works
- Deep linking support
- State preserved on page refresh

---

## Advanced Features

### 6. Inline Cell Editing

**Implementation:** Double-click any editable cell to enter edit mode.

**Edit Lifecycle:**

1. Double-click cell → fetch metadata (facets) if needed
2. Render appropriate editor component
3. User modifies value
4. Click confirm → PUT request to API
5. Optimistic UI update on success
6. Facet cache invalidation for modified fields

**Features:**

- Loading state during save
- Error handling with graceful fallback
- Type casting (string → number, boolean conversion)
- Escape key to cancel

### 7. Editor Registry System

**Implementation:** Automatic editor resolution based on column configuration.

```javascript
// Editor Resolution Priority:
1. column.editorType (explicit: "tags", "textarea", "select")
2. column.options || column.dynamicOptions || column.filterType === "boolean" → SmartSelect
3. column.filterType ("number", "date", "text") → BaseInput with type
4. Default → BaseInput (text)
```

**Available Editors:**

| Editor           | Use Case             | Features                                       |
| ---------------- | -------------------- | ---------------------------------------------- |
| `BaseInput`      | Text, numbers, dates | Auto-type detection, keyboard shortcuts        |
| `SmartSelect`    | Dropdowns, booleans  | Autocomplete, "Add new" option, strict mode    |
| `TagEditor`      | Multi-value arrays   | Add/remove tags, suggestions, backspace delete |
| `LongTextEditor` | Long text/bio        | Modal overlay, Ctrl+Enter to save              |

### 8. Dynamic Facet Loading

**Implementation:** Server-provided dropdown options for select editors.

```javascript
// Column config with dynamic options
{
  key: "work.department",
  editable: true,
  dynamicOptions: true,  // Fetches from /api/facets/work.department
  strict: true           // Only allow values from the list
}
```

**Features:**

- Lazy loading (fetch on first edit)
- In-memory caching (facetCache)
- Cache invalidation on successful edit
- Precomputed facets on server for 100k+ records

### 9. Column Visibility Toggle

**Implementation:** Settings gear icon opens column selection dropdown.

**Features:**

- Toggle individual columns on/off
- Checkmark indicators for visible columns
- State persisted in URL (`hide` parameter)
- Click outside to close

### 10. Loading States

**Implementation:** Multiple loading indicators based on context.

| State                  | Visual                                  |
| ---------------------- | --------------------------------------- |
| Initial load (no data) | Skeleton rows with pulse animation      |
| Re-fetch (has data)    | Progress bar + semi-transparent overlay |
| Cell saving            | Spinner inside action button            |
| Metadata loading       | "Loading..." text in dropdown           |

---

## Component API

### TableProvider Props

```typescript
interface TableProviderProps {
  apiUrl: string; // Base API endpoint
  columns: ColumnConfig[]; // Column definitions
  initialPageSize?: number; // Default: 10
  requestMapper?: Function; // Custom request parameter builder
  responseMapper?: Function; // Custom response parser
  customFetcher?: Function; // Replace fetch with Axios/GraphQL
}
```

### Column Configuration

```typescript
interface ColumnConfig {
  label: string; // Display header
  key: string; // Data path (supports dots: "work.title")
  filterKey?: string; // Override for filtering (comma-separated for multi-field)
  filterType?: "text" | "number" | "date" | "boolean";
  editable?: boolean; // Enable inline editing
  editorType?: "text" | "select" | "tags" | "textarea";
  dynamicOptions?: boolean; // Fetch options from /api/facets/:key
  options?: { label; value }[]; // Static options for select
  strict?: boolean; // Only allow values from options list
  sortable?: boolean; // Default: true
  width?: string; // CSS width (e.g., "250px")
  render?: (row) => ReactNode; // Custom cell renderer
}
```

### Exported Hooks

```typescript
// Full context access (triggers re-render on any change)
useTableContext(): SearchState & DataState & Actions

// Granular access (recommended)
useTableSearch(): { searchTerm, activeFilters, debouncedSearchTerm, columns }
useTableData(): { data, loading, error, currentPage, totalPages, totalRows, pageSize, sortConfig, facetCache, hiddenColumns }
useTableActions(): { handleSort, handleSearch, handleClearFilters, handlePageChange, handlePageSizeChange, handleStartEdit, handleCancelEdit, handleSaveEdit, handleToggleColumn, fetchFacetOptions }
```

---

## Editor System

### SmartSelect Features

- **Autocomplete filtering**: Type to filter options
- **Keyboard navigation**: Arrow keys + Enter to select
- **Highlight matching text**: Query text bolded in options
- **Create new option**: "Add [value]" when no exact match (unless `strict: true`)
- **Portal rendering**: Dropdown escapes table overflow constraints

### TagEditor Features

- **Chip-based UI**: Visual tag pills with remove button
- **Multi-add support**: Enter, comma, or Tab to add tag
- **Backspace delete**: Remove last tag when input empty
- **Dedupe logic**: Prevents duplicate tags
- **Suggestion dropdown**: Shows matching options from facets

### LongTextEditor Features

- **Modal overlay**: Full modal for comfortable editing
- **Keyboard shortcuts**: Ctrl+Enter to save, Escape to cancel
- **Loading state**: Button spinner during save
- **Click outside**: Closes modal (when not saving)

---

## Styling System

### Design Tokens (CSS Variables)

All styling is controlled via CSS custom properties in `DataTable.vars.css`:

```css
/* Color System */
--dt-primary: #3b82f6;
--dt-bg-main: #ffffff;
--dt-border-color: #e2e8f0;
--dt-text-main: #1e293b;

/* Semantic States */
--dt-success-text: #16a34a;
--dt-error-text: #dc2626;
--dt-warning-text: #c2410c;
--dt-info-text: #0369a1;

/* Shapes & Shadows */
--dt-radius-lg: 12px;
--dt-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07);

/* Transitions */
--dt-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Scoped Styles

All component styles are scoped under the `.dt-scope` class to prevent conflicts with parent application styles.

### Pre-built Utility Classes

- **Badges**: `.dt-badge`, `.dt-badge-success`, `.dt-badge-warning`, etc.
- **Chips**: `.dt-chip`, `.dt-chips-container`
- **Avatars**: `.dt-avatar`
- **Info Stack**: `.dt-info-stack`, `.dt-info-stack-title`, `.dt-info-stack-subtitle`

---

## Server Integration

### Expected API Contract

**GET /api/users**

```
Query: ?page=1&limit=10&sortBy=work.title&sortOrder=asc&search=john&filters=[...]
Response: {
  data: [...],
  meta: {
    total: 100000,
    page: 1,
    limit: 10,
    totalPages: 10000
  }
}
```

**PUT /api/users/:id**

```
Body: { "work.department": "Engineering" }
Response: { ...updatedRecord }
```

**GET /api/facets/:field**

```
Response: ["Engineering", "Marketing", "Sales", ...]
```

### Custom Fetcher Example

```javascript
const customFetcher = async (params, signal) => {
  const response = await axios.get('/api/custom-endpoint', {
    params,
    signal
  });
  return response.data;
};

<TableProvider
  customFetcher={customFetcher}
  responseMapper={(res) => ({
    data: res.items,
    total: res.totalCount,
    totalPages: Math.ceil(res.totalCount / res.pageSize)
  })}
>
```

---

## Performance Optimizations

### Implemented Optimizations

1. **React.memo**: TableRow, Pagination, DataTable components are memoized
2. **useMemo**: Context values, filtered columns, computed styles
3. **useCallback**: All handler functions have stable references
4. **Debounced Search**: 500ms debounce before API call
5. **AbortController**: Cancels in-flight requests on new search
6. **Facet Caching**: Options cached in memory per field
7. **URL Sync with replaceState**: Avoids history pollution during filtering

---

## Quick Start Example

```jsx
import {
  DataTable,
  DataTableSearch,
  TableProvider,
} from "./components/DataTable";

const columns = [
  { label: "Name", key: "name", editable: true },
  { label: "Email", key: "email", filterType: "text" },
  {
    label: "Status",
    key: "status",
    editable: true,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    label: "Created",
    key: "createdAt",
    filterType: "date",
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

function App() {
  return (
    <TableProvider apiUrl="/api/users" columns={columns}>
      <DataTableSearch placeholder="Search users..." />
      <DataTable />
    </TableProvider>
  );
}
```

---

_This documentation covers all current features of the CustomDataTable component. For gaps and improvements needed for production readiness, see [GAPS_AND_IMPROVEMENTS.md](./GAPS_AND_IMPROVEMENTS.md)._
