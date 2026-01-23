import React, { memo, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { getNestedValue } from "./utils/dataHelpers";
import Pagination from "./Pagination";
import EditableCell from "./components/EditableCell";
import { useTableData, useTableActions } from "./TableContext";
import "./styles/DataTable.css";
import "./styles/DataTableStates.css";
import "./styles/DataTable.vars.css";
import "./styles/DataTable.utils.css";

/**
 * Renders the sorting icon based on current sort state
 */
const SortIcon = ({ sortConfig, columnKey }) => {
  if (!sortConfig || sortConfig.key !== columnKey) {
    return <ChevronsUpDown size={14} className="sort-icon-default" />;
  }
  return sortConfig.direction === "asc" ? (
    <ChevronUp size={14} className="sort-icon-active" />
  ) : (
    <ChevronDown size={14} className="sort-icon-active" />
  );
};

/**
 * Helper to render a skeleton loading row
 */
const SkeletonRow = ({ columns = [] }) => (
  <tr className="table-row">
    {columns.map((col, idx) => (
      <td
        key={`skeleton-cell-${idx}`}
        className={`table-cell ${col.sticky ? "is-sticky" : ""} ${
          col.sticky === "right" ? "is-sticky-right" : ""
        }`}
        style={{ ...col.stickyStyle }}
      >
        <div
          className={
            col.key?.includes("firstName") || col.key?.includes("avatar")
              ? "skeleton-avatar"
              : "skeleton-cell"
          }
        />
      </td>
    ))}
  </tr>
);

/**
 * Renders a single row of the table.
 * Memoized to prevent re-renders when other rows or state slices change.
 */
const TableRow = memo(
  ({
    row,
    rowIdx,
    columns,
    editingCell,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
  }) => {
    const rowId = row.id || row._id || `row-${rowIdx}`;

    return (
      <tr className="table-row">
        {columns.map((col, colIdx) => {
          const isEditing =
            editingCell?.rowId === rowId && editingCell?.colKey === col.key;

          const isSticky = !!col.sticky;

          return (
            <td
              key={col.key || colIdx}
              className={`table-cell ${isSticky ? "is-sticky" : ""} ${
                col.sticky === "right" ? "is-sticky-right" : ""
              }`}
              style={{ ...col.stickyStyle }}
            >
              <div className="cell-content">
                {col.editable ? (
                  <EditableCell
                    value={getNestedValue(row, col.key)}
                    row={row}
                    column={col}
                    isEditing={isEditing}
                    onStartEdit={() =>
                      handleStartEdit({ rowId, colKey: col.key })
                    }
                    onSave={(val) => handleSaveEdit(rowId, { [col.key]: val })}
                    onCancel={handleCancelEdit}
                  />
                ) : col.render ? (
                  col.render(row)
                ) : (
                  getNestedValue(row, col.key)
                )}
              </div>
            </td>
          );
        })}
      </tr>
    );
  },
);

const DataTable = memo(() => {
  const {
    columns: allColumns = [],
    data = [],
    loading,
    error,
    sortConfig,
    pageSize,
    editingCell,
    hiddenColumns = [],
  } = useTableData();

  const {
    handleSort: onSort,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
  } = useTableActions();

  // 1. Calculate Sticky Offsets
  const columns = useMemo(() => {
    const visibleCols = allColumns.filter(
      (col) => !hiddenColumns.includes(col.key),
    );

    let leftOffset = 0;
    const withLeft = visibleCols.map((col) => {
      const isSticky = col.sticky === "left";
      const style = isSticky
        ? {
            position: "sticky",
            left: leftOffset,
            zIndex: 15,
          }
        : {};
      if (isSticky) {
        // Parse width to number if possible, else default to 150
        const w = parseInt(col.width) || 150;
        leftOffset += w;
      }
      return { ...col, stickyStyle: style };
    });

    let rightOffset = 0;
    for (let i = withLeft.length - 1; i >= 0; i--) {
      if (withLeft[i].sticky === "right") {
        withLeft[i].stickyStyle = {
          ...withLeft[i].stickyStyle,
          position: "sticky",
          right: rightOffset,
          zIndex: 15,
        };
        const w = parseInt(withLeft[i].width) || 150;
        rightOffset += w;
      }
    }
    return withLeft;
  }, [allColumns, hiddenColumns]);

  // 2. Guards
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <span className="error-icon"></span>
          <span>Something went wrong: {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="error-retry-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (columns.length === 0 && !loading) {
    return (
      <div className="error-container">
        <p>No columns configured. Please provide a columns array.</p>
      </div>
    );
  }

  const getSortAria = (colKey) => {
    if (!sortConfig || sortConfig.key !== colKey) return "none";
    return sortConfig.direction === "asc" ? "ascending" : "descending";
  };

  return (
    <div
      className={`dt-scope table-wrapper-main ${loading ? "is-loading" : ""}`}
    >
      <div className="table-scroll-container">
        {/* Premium Progress Bar for re-fetching/searching/sorting */}
        {loading && data.length > 0 && (
          <div
            className="loading-progress-bar"
            role="progressbar"
            aria-label="Loading data"
          >
            <div className="loading-bar-inner" />
          </div>
        )}

        <table className="custom-table" aria-busy={loading}>
          <thead>
            <tr>
              {columns.map((col, index) => {
                const isSortable = col.sortable !== false;
                const isSorted = sortConfig?.key === col.key;

                return (
                  <th
                    key={col.key || `col-${index}`}
                    className={`table-header ${isSortable ? "clickable" : ""} ${
                      col.sticky ? "is-sticky" : ""
                    } ${col.sticky === "right" ? "is-sticky-right" : ""}`}
                    onClick={() => isSortable && onSort && onSort(col.key)}
                    aria-sort={getSortAria(col.key)}
                    role="columnheader"
                    style={{
                      width: col.width,
                      ...col.stickyStyle,
                      zIndex: col.sticky ? 20 : 10, // Headers need higher z-index
                    }}
                  >
                    <div className="header-content">
                      <span className="header-label">{col.label}</span>
                      {isSortable && (
                        <span
                          className={`sort-icon-wrapper ${
                            isSorted ? "is-active" : ""
                          }`}
                        >
                          <SortIcon
                            sortConfig={sortConfig}
                            columnKey={col.key}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="table-body">
            {loading && data.length === 0 ? (
              [...Array(pageSize || 5)].map((_, i) => (
                <SkeletonRow key={`skeleton-row-${i}`} columns={columns} />
              ))
            ) : Array.isArray(data) && data.length === 0 ? (
              <tr className="table-row">
                <td colSpan={columns.length} className="table-cell empty-state">
                  <div className="empty-content">
                    <p>No results found</p>
                    <span>Try adjusting your search or filters</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <TableRow
                  key={row.id || row._id || `row-${rowIdx}`}
                  row={row}
                  rowIdx={rowIdx}
                  columns={columns}
                  editingCell={editingCell}
                  handleStartEdit={handleStartEdit}
                  handleSaveEdit={handleSaveEdit}
                  handleCancelEdit={handleCancelEdit}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Full Loading Overlay only for large updates or if requested */}
      {loading && data.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}

      <Pagination />
    </div>
  );
});

export default DataTable;
