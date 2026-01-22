import { Check, X } from "lucide-react";

const BaseInput = ({
  value,
  onChange,
  onCommit,
  onCancel,
  isSaving,
  type = "text",
}) => {
  const handleKeyDown = (e) => {
    if (isSaving) return;
    if (e.key === "Enter") onCommit();
    if (e.key === "Escape") onCancel();
  };

  const disabled = isSaving;
  const wrapperClass = `editable-cell-input-wrapper${isSaving ? " is-saving" : ""}`;

  return (
    <div className={wrapperClass}>
      <input
        autoFocus
        disabled={disabled}
        type={type}
        className="editable-cell-input"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="dt-editor-actions-bubble">
        <button
          className="dt-action-btn dt-confirm"
          onClick={() => !isSaving && onCommit()}
          disabled={disabled}
        >
          {isSaving ? <div className="btn-spinner" /> : <Check size={14} />}
        </button>
        <button
          className="dt-action-btn dt-cancel"
          onClick={() => !isSaving && onCancel()}
          disabled={disabled}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default BaseInput;
