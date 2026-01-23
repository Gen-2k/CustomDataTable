import React, { useState, useEffect } from "react";
import { useTableData, useTableActions } from "../TableContext";
import { resolveEditor } from "./editors";

const EditableCell = ({
  value: initialValue,
  row,
  column,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}) => {
  const [val, setVal] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [prevIsEditing, setPrevIsEditing] = useState(isEditing);
  const { facetCache } = useTableData();
  const { fetchFacetOptions } = useTableActions();

  if (isEditing && !prevIsEditing) {
    setPrevIsEditing(true);
    setVal(initialValue);
    setIsSaving(false);
  } else if (!isEditing && prevIsEditing) {
    setPrevIsEditing(false);
    setIsSaving(false);
  }

  useEffect(() => {
    if (isEditing) {
      if (column.dynamicOptions && !facetCache[column.key]) {
        fetchFacetOptions(column.key);
      }
    }
  }, [
    isEditing,
    column.dynamicOptions,
    column.key,
    facetCache,
    fetchFacetOptions,
  ]);

  const handleCommit = async (finalValue) => {
    if (isSaving) return;

    const valueToSave = finalValue !== undefined ? finalValue : val;
    const isSame = JSON.stringify(initialValue) === JSON.stringify(valueToSave);
    if (isSame) return onCancel();

    setIsSaving(true);
    try {
      let casted = valueToSave;
      if (
        column.filterType === "number" &&
        valueToSave !== "" &&
        valueToSave !== null
      ) {
        casted = Number(valueToSave);
      } else if (column.filterType === "boolean") {
        casted = String(valueToSave) === "true";
      }

      await onSave(casted);
    } catch (err) {
      console.error("Save failed in cell:", err);
    } finally {
      setIsSaving(false);
    }
  };

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

  const Editor = resolveEditor(column);
  const options =
    column.options ||
    facetCache[column.key] ||
    (column.filterType === "boolean"
      ? [
          { label: "True", value: true },
          { label: "False", value: false },
        ]
      : []);

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
};

export default EditableCell;
