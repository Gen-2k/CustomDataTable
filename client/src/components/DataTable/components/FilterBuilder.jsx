import { ArrowLeft } from "lucide-react";
import { TYPE_OPERATORS } from "../constants/DataTable.constants";

const FilterBuilder = ({
  activeField,
  searchableFields,
  onBack,
  onApply,
  setActiveField,
  operator,
  setOperator,
  filterValue,
  setFilterValue,
}) => {
  const availableOperators =
    TYPE_OPERATORS[activeField.type] || TYPE_OPERATORS.text;
  const isRange = operator === "between";

  const [start, end] = isRange
    ? filterValue.includes(",")
      ? filterValue.split(",")
      : ["", ""]
    : [filterValue, ""];

  const handleRangeChange = (val, pos) => {
    if (pos === "start") setFilterValue(`${val},${end}`);
    else setFilterValue(`${start},${val}`);
  };

  return (
    <div className="dt-builder-compact">
      <button className="dt-icon-btn" onClick={onBack} title="Back to fields">
        <ArrowLeft size={16} />
      </button>
      <div className="dt-builder-controls">
        <select
          className="dt-field-select"
          value={activeField.key}
          onChange={(e) => {
            const field = searchableFields.find(
              (f) => f.key === e.target.value,
            );
            if (field) {
              setActiveField(field);
              const allowed = TYPE_OPERATORS[field.type] || TYPE_OPERATORS.text;
              setOperator(allowed[0].value);
            }
          }}
        >
          {searchableFields.map((f, idx) => (
            <option key={idx} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className="dt-operator-select-compact"
          value={operator}
          onChange={(e) => {
            const nextOp = e.target.value;
            setOperator(nextOp);
            if (nextOp === "between") setFilterValue(",");
            else if (operator === "between") setFilterValue("");
          }}
        >
          {availableOperators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>
      {isRange ? (
        <div className="dt-compact-range-inputs">
          <input
            type={activeField.type === "date" ? "date" : "text"}
            className="dt-range-input-small"
            value={start}
            placeholder="From"
            onChange={(e) => handleRangeChange(e.target.value, "start")}
          />
          <span className="dt-range-sep">-</span>
          <input
            type={activeField.type === "date" ? "date" : "text"}
            className="dt-range-input-small"
            value={end}
            placeholder="To"
            onChange={(e) => handleRangeChange(e.target.value, "end")}
          />
        </div>
      ) : activeField.type === "boolean" ? (
        <select
          className="dt-compact-input"
          value={filterValue || "true"}
          onChange={(e) => setFilterValue(e.target.value)}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      ) : (
        <input
          autoFocus
          type={activeField.type === "date" ? "date" : "text"}
          className="dt-compact-input"
          placeholder="Type value..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
        />
      )}
      <button className="dt-search-submit-btn" onClick={onApply}>
        Apply
      </button>
    </div>
  );
};

export default FilterBuilder;
