import React, { useState, useEffect, memo } from "react";
import { useTableData, useTableActions } from "../TableContext";
import { resolveEditor } from "./editors";

/**
 * EditableCell - A wrapper component that toggles between 
 * a "View" state and an "Edit" state (Editor).
 */
const EditableCell = memo(({
  value: initialValue,
  row,
  column,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}) => {
  // Internal state for the current editing value
  const [val, setVal] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  
  const { facetCache } = useTableData();
  const { fetchFacetOptions } = useTableActions();

  /**
   * Sync internal state when entering/exiting edit mode.
   * This ensures the editor always starts with the freshest data from the row.
   */
  useEffect(() => {
    if (isEditing) {
      setVal(initialValue);
      setIsSaving(false);

      // Trigger metadata fetch if needed for dropdowns
      if (column.dynamicOptions && !facetCache[column.key]) {
        fetchFacetOptions(column.key);
      }
    }
  }, [isEditing, initialValue, column.dynamicOptions, column.key, facetCache, fetchFacetOptions]);

  const handleCommit = async (finalValue) => {
    if (isSaving) return;

    // Use passed value or current state value
    const valueToSave = finalValue !== undefined ? finalValue : val;
    
    // Safety: If no change, just cancel
    if (JSON.stringify(initialValue) === JSON.stringify(valueToSave)) {
      return onCancel();
    }

    setIsSaving(true);
    try {
      let casted = valueToSave;
      
      // Basic type casting based on column metadata
      if (column.filterType === "number" && valueToSave !== "" && valueToSave !== null) {
        casted = Number(valueToSave);
      } else if (column.filterType === "boolean") {
        casted = String(valueToSave) === "true";
      }

      await onSave(casted);
    } catch (err) {
      console.error("DataTable: Save failed in EditableCell.", err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * --- RENDER VIEW STATE ---
   */
  if (!isEditing) {
    return (
      <div
        className={`editable-cell-view ${isSaving ? "is-saving" : ""}`}
        onDoubleClick={!isSaving ? onStartEdit : undefined}
        title={isSaving ? "Saving changes..." : "Double click to edit"}
      >
        <span className="cell-value-text">
          {column.render ? column.render(row) : (initialValue ?? "")}
        </span>
        {isSaving && <div className="cell-loading-spinner" />}
      </div>
    );
  }

  /**
   * --- RENDER EDIT STATE ---
   */
  const Editor = resolveEditor(column);
  
  // Resolve options (Static -> Dynamic -> Fallbacks)
  const options = column.options || facetCache[column.key] || (
    column.filterType === "boolean" ? [
      { label: "True", value: true },
      { label: "False", value: false }
    ] : []
  );

  const isMetadataLoading = column.dynamicOptions && !facetCache[column.key];

  return (
    <Editor
      value={val}
      onChange={setVal}
      onCommit={handleCommit}
      onCancel={onCancel}
      options={options}
      isLoading={isMetadataLoading}
      isSaving={isSaving}
      column={column}
      row={row}
    />
  );
});

export default EditableCell;
