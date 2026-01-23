import React, { useState, useEffect, memo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTableData, useTableActions } from "./TableContext";
import "./styles/Pagination.css";
import "./styles/DataTable.vars.css";

/**
 * Shared button component for pagination navigation icons
 */
const NavButton = memo(({ onClick, disabled, title, children }) => (
  <button
    className="page-btn"
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
));

const Pagination = memo(() => {
  const { currentPage, totalPages, totalRows, pageSize } = useTableData();
  const {
    handlePageChange: onPageChange,
    handlePageSizeChange: onPageSizeChange,
  } = useTableActions();
  const [inputPage, setInputPage] = useState(currentPage);

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  const handlePageSubmit = () => {
    let page = parseInt(inputPage, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    onPageChange(page);
    setInputPage(page);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputPage(value);
    }
  };

  const startIdx = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalRows);

  if (totalRows === 0) return null;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <span className="highlight">{startIdx}</span> to{" "}
        <span className="highlight">{endIdx}</span> of{" "}
        <span className="highlight">{totalRows}</span> entries
      </div>

      <div className="pagination-controls">
        <div className="page-size-selector">
          <span className="selector-label">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="page-size-select"
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="pagination-nav">
          <div className="btn-group">
            <NavButton
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <ChevronsLeft size={18} />
            </NavButton>
            <NavButton
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <ChevronLeft size={18} />
            </NavButton>
          </div>

          <div className="page-input-wrapper">
            <span>Page</span>
            <input
              type="text"
              className="page-input"
              value={inputPage}
              onChange={handleInputChange}
              onBlur={handlePageSubmit}
              onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
              aria-label="Go to page"
            />
            <span>of {totalPages}</span>
          </div>

          <div className="btn-group">
            <NavButton
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <ChevronRight size={18} />
            </NavButton>
            <NavButton
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              <ChevronsRight size={18} />
            </NavButton>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Pagination;
