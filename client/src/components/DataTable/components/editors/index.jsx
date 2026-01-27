import React from "react";
import BaseInput from "./BaseInput";
import SmartSelect from "./SmartSelect";
import LongTextEditor from "./LongTextEditor";

/**
 * EditorRegistry - A map of available editor components by type.
 * This allows the table to dynamically swap editors based on column configuration.
 */
const EditorRegistry = {
  text: BaseInput,
  number: (props) => <BaseInput {...props} type="number" />,
  date: (props) => <BaseInput {...props} type="date" />,
  select: SmartSelect,
  textarea: LongTextEditor,
  tags: SmartSelect,
};

/**
 * resolveEditor - Smart logic to determine the appropriate editor component for a column.
 * 
 * Order of operations:
 * 1. Explicit editorType (e.g., "tags", "textarea")
 * 2. Presence of options (auto-select dropdown)
 * 3. Data type fallback (e.g., "number", "date")
 * 4. Default to standard text input
 * 
 * @param {Object} column - The column configuration object.
 * @returns {React.Component} - The React component to render for editing.
 */
export const resolveEditor = (column) => {
  // Priority 1: Explicit Override
  if (column.editorType && EditorRegistry[column.editorType]) {
    return EditorRegistry[column.editorType];
  }

  // Priority 2: Semantic Logic (Does it look like a choice?)
  const hasSelectableOptions =
    column.options || column.dynamicOptions || column.filterType === "boolean";
  
  if (hasSelectableOptions) {
    return EditorRegistry.select;
  }

  // Priority 3: Data-Type Logic
  return EditorRegistry[column.filterType] || EditorRegistry.text;
};

export default EditorRegistry;
