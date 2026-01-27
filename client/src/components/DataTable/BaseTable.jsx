import React, { memo, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
} from "lucide-react";
import { getNestedValue } from "./utils/dataHelpers";
import Pagination from "./Pagination";
import EditableCell from "./components/EditableCell";
import { useTableData, useTableActions } from "./TableContext";

// Styles
import "./styles/DataTable.css";
import "./styles/DataTableStates.css";
import "./styles/DataTable.vars.css";
import "./styles/DataTable.utils.css";

/**
 * SortIcon - Visual indicator for the current sort state of a column.
 */
const SortIcon = memo(({ sortConfig, columnKey }) => {
  if (!sortConfig || sortConfig.key !== columnKey) {
    return <ChevronsUpDown size={14} className="sort-icon-default" />;
  }
  return sortConfig.direction === "asc" ? (
    <ChevronUp size={14} className="sort-icon-active" />
  ) : (
    <ChevronDown size={14} className="sort-icon-active" />
  );
});

/**
 * SkeletonRow - Dynamic placeholders shown during initial data load.
 */
const SkeletonRow = memo(({ columns = [] }) => (
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
));

/**
 * TableRow - Efficient renderer for a single data record.
 * Uses React.memo to skip re-renders if the specific row data or expanded state hasn't changed.
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
    isExpanded,
    onToggle,
    idKey,
  }) => {
    const rowId = row[idKey] || `row-${rowIdx}`;

    return (
      <tr className={`table-row ${isExpanded ? "is-expanded" : ""}`}>
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
                {col.isExpansionToggle ? (
                  <button
                    className="expansion-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(rowId);
                    }}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Collapse row" : "Expand row"}
                  >
                    {isExpanded ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                ) : col.editable ? (
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
                  (() => {
                    const val = getNestedValue(row, col.key);
                    if (typeof val === "object" && val !== null) {
                      return JSON.stringify(val);
                    }
                    return val;
                  })()
                )}
              </div>
            </td>
          );
        })}
      </tr>
    );
  },
);

/**
 * BaseTable - The core rendering engine for the DataTable.
 * Handles the calculation of layout (sticky columns) and rendering logic.
 */
const BaseTable = memo(({ renderSubTable, enablePagination }) => {
  // 1. Data Subscriptions
  const dataStore = useTableData();
  const {
    columns: allColumns = [],
    data = [],
    loading,
    error,
    sortConfig,
    pageSize,
    editingCell,
    hiddenColumns = [],
    expandedRows = [],
    idKey,
    allExpanded,
  } = dataStore;

  // 2. Action Subscriptions
  const {
    handleSort: onSort,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleToggleRowExpansion,
    handleExpandAll,
    handleCollapseAll,
  } = useTableActions();

  // 3. Computed Properties
  const isAllExpanded = allExpanded;
  
  // IDs for mass actions
  const allPageIds = useMemo(
    () => (allExpanded ? [] : data.map((row, idx) => row[idKey] || `row-${idx}`)),
    [data, idKey, allExpanded],
  );

  /**
   * Layout Logic:
   * Dynamically calculates sticky column offsets (left/right) 
   * so that multiple sticky columns can stack correctly.
   */
  const columns = useMemo(() => {
    let visibleCols = allColumns.filter(
      (col) => !hiddenColumns.includes(col.key),
    );

    // Inject expansion toggle if needed
    if (renderSubTable) {
      visibleCols = [
        {
          key: "__expand__",
          label: "",
          width: "50px",
          sticky: "left",
          sortable: false,
          isExpansionToggle: true,
        },
        ...visibleCols,
      ];
    }

    // Process Left Sticky Offsets
    let leftOffset = 0;
    const withLeft = visibleCols.map((col) => {
      const isSticky = col.sticky === "left";
      const style = isSticky
        ? { position: "sticky", left: leftOffset, zIndex: 15 }
        : {};
      if (isSticky) {
        const w = parseInt(col.width) || 150;
        leftOffset += w;
      }
      return { ...col, stickyStyle: style };
    });

    // Process Right Sticky Offsets
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
  }, [allColumns, hiddenColumns, renderSubTable]);

  // --- SUB-VIEWS ---

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <span className="error-icon"></span>
          <span>Something went wrong: {error}</span>
          <button onClick={() => window.location.reload()} className="error-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (columns.length === 0 && !loading) {
    return (
      <div className="error-container">
        <p>No columns configured. Please check your columns array.</p>
      </div>
    );
  }

  return (
    <div className={`dt-scope table-wrapper-main ${loading ? "is-loading" : ""}`}>
      {/* Loading States */}
      {loading && data.length > 0 && (
        <>
          <div className="loading-overlay"><div className="loading-spinner" /></div>
          <div className="loading-progress-bar" role="progressbar"><div className="loading-bar-inner" /></div>
        </>
      )}

      <div className="table-scroll-container dt-scrollbar">
        <table className="custom-table" aria-busy={loading}>
          <thead>
            <tr>
              {columns.map((col, index) => {
                const isSortable = col.sortable !== false;
                const isSorted = sortConfig?.key === col.key;
                const ariaSort = !sortConfig || sortConfig.key !== col.key ? "none" : (sortConfig.direction === "asc" ? "ascending" : "descending");

                return (
                  <th
                    key={col.key || `col-${index}`}
                    className={`table-header ${isSortable ? "clickable" : ""} ${
                      col.sticky ? "is-sticky" : ""
                    } ${col.sticky === "right" ? "is-sticky-right" : ""} ${
                      col.isExpansionToggle ? "is-expansion-header" : ""
                    }`}
                    onClick={() => isSortable && onSort && onSort(col.key)}
                    aria-sort={ariaSort}
                    role="columnheader"
                    style={{
                      width: col.width,
                      ...col.stickyStyle,
                      zIndex: col.sticky ? 20 : 10,
                    }}
                  >
                    <div className="header-content">
                      {col.isExpansionToggle ? (
                        <button
                          className={`expansion-toggle-btn master-toggle ${isAllExpanded ? "is-active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            isAllExpanded ? handleCollapseAll() : handleExpandAll(allPageIds);
                          }}
                          aria-label={isAllExpanded ? "Collapse all" : "Expand all"}
                          title={isAllExpanded ? "Collapse all" : "Expand all"}
                        >
                          {isAllExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      ) : (
                        <>
                          <span className="header-label">{col.label}</span>
                          {isSortable && (
                            <span className={`sort-icon-wrapper ${isSorted ? "is-active" : ""}`}>
                              <SortIcon sortConfig={sortConfig} columnKey={col.key} />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="table-body">
            {/* 1. Loading Skeleton */}
            {loading && data.length === 0 ? (
              [...Array(pageSize || 5)].map((_, i) => (
                <SkeletonRow key={`skeleton-row-${i}`} columns={columns} />
              ))
            ) : 
            
            /* 2. Empty State */
            Array.isArray(data) && data.length === 0 ? (
              <tr className="table-row">
                <td colSpan={columns.length} className="table-cell empty-state">
                  <div className="empty-content">
                    <p>No results found</p>
                    <span>Try adjusting your search or filters</span>
                  </div>
                </td>
              </tr>
            ) : 
            
            /* 3. Data Render */
            (
              data.map((row, rowIdx) => {
                const rowId = row[idKey] || `row-${rowIdx}`;
                const isExpanded = allExpanded || expandedRows.includes(rowId);

                return (
                  <React.Fragment key={rowId}>
                    <TableRow
                      row={row}
                      rowIdx={rowIdx}
                      columns={columns}
                      editingCell={editingCell}
                      handleStartEdit={handleStartEdit}
                      handleSaveEdit={handleSaveEdit}
                      handleCancelEdit={handleCancelEdit}
                      isExpanded={isExpanded}
                      onToggle={handleToggleRowExpansion}
                      idKey={idKey}
                    />
                    {isExpanded && renderSubTable && (
                      <tr className="sub-table-row">
                        <td colSpan={columns.length} className="sub-table-cell">
                          <div className="sub-table-container">
                            {renderSubTable(row)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && <Pagination />}
    </div>
  );
});

export default BaseTable;
