// 1. Primary Entry Point (The "Smart" Table)
export { default as DataTable } from "./DataTable";
export { default } from "./DataTable";

// 2. Base Components (For custom layouts)
export { default as BaseTable } from "./BaseTable";
export { default as DataTableSearch } from "./DataTableSearch";
export { default as Pagination } from "./Pagination";

// 3. Advanced Context & Hooks
export {
  TableProvider,
  useTableSearch,
  useTableData,
  useTableActions,
  useTableContext,
} from "./TableContext";
