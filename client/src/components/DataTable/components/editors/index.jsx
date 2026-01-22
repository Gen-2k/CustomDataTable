import BaseInput from "./BaseInput";
import SmartSelect from "./SmartSelect";
import LongTextEditor from "./LongTextEditor";

const EditorRegistry = {
  text: BaseInput,
  number: (props) => <BaseInput {...props} type="number" />,
  date: (props) => <BaseInput {...props} type="date" />,
  select: SmartSelect,
  textarea: LongTextEditor,
  tags: SmartSelect, // Now unified into SmartSelect
};

export const resolveEditor = (column) => {
  if (column.editorType && EditorRegistry[column.editorType]) {
    return EditorRegistry[column.editorType];
  }

  const hasSelectableOptions =
    column.options || column.dynamicOptions || column.filterType === "boolean";
  if (hasSelectableOptions) {
    return EditorRegistry.select;
  }

  return EditorRegistry[column.filterType] || EditorRegistry.text;
};

export default EditorRegistry;
