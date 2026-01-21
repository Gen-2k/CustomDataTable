import React, { useState, useRef, useEffect } from "react";
import { Settings2, Check } from "lucide-react";
import { useTableSearch, useTableData, useTableActions } from "../TableContext";
import "./ColumnSettings.css";

const ColumnSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { columns: allColumns, hiddenColumns } = useTableData();
  const { handleToggleColumn } = useTableActions();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="dt-column-settings-container" ref={wrapperRef}>
      <button
        className={`dt-column-settings-toggle ${isOpen ? "is-active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Customize Columns"
      >
        <Settings2 size={20} />
      </button>

      {isOpen && (
        <div className="dt-column-settings-dropdown">
          <div className="dt-column-settings-header">
            <h4>Display Columns</h4>
          </div>
          <div className="dt-column-settings-list">
            {allColumns.map((col) => {
              const isVisible = !hiddenColumns.includes(col.key);
              return (
                <div
                  key={col.key}
                  className={`dt-column-item ${isVisible ? "is-visible" : ""}`}
                  onClick={() => handleToggleColumn(col.key)}
                >
                  <div className="dt-column-checkbox">
                    {isVisible && <Check size={14} />}
                  </div>
                  <span className="dt-column-label">{col.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnSettings;
