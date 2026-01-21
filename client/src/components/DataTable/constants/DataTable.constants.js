/**
 * DataTable Configuration Constants
 * Definining operators and display labels for the filtering system.
 */

export const TYPE_OPERATORS = {
  text: [
    { value: "contains", label: "contains" },
    { value: "is", label: "is exactly" },
    { value: "neq", label: "is not" },
    { value: "starts", label: "starts with" },
    { value: "ends", label: "ends with" },
  ],
  number: [
    { value: "is", label: "equals" },
    { value: "neq", label: "not equals" },
    { value: "gt", label: "greater than (>)" },
    { value: "lt", label: "less than (<)" },
    { value: "between", label: "between (range)" },
  ],
  date: [
    { value: "between", label: "between" },
    { value: "gt", label: "after" },
    { value: "lt", label: "before" },
    { value: "is", label: "on date" },
    { value: "neq", label: "not on" },
  ],
  boolean: [
    { value: "is", label: "is" },
    { value: "neq", label: "is not" },
  ],
};

export const OPERATOR_DISPLAY_LABELS = {
  contains: "contains",
  is: "is",
  neq: "≠",
  starts: "starts",
  ends: "ends",
  gt: ">",
  lt: "<",
  between: "range",
};
