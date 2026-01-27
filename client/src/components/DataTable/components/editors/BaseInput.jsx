import React, { memo, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";

/**
 * BaseInput - Standard single-line text/number/date editor.
 * Optimized for keyboard-only interaction.
 */
const BaseInput = memo(({
  value,
  onChange,
  onCommit,
  onCancel,
  isSaving,
  type = "text",
}) => {
  const inputRef = useRef(null);

  /**
   * Industry Standard: Autofocus and select content on mount.
   * This allows the user to start typing over the old value immediately.
   */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Only select if it's a text/number type (dates can be finicky)
      if (type === "text" || type === "number") {
        inputRef.current.select();
      }
    }
  }, [type]);

  const handleKeyDown = (e) => {
    if (isSaving) return;
    
    // Standard keyboard shortcuts
    if (e.key === "Enter") {
      onCommit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const wrapperClass = `editable-cell-input-wrapper${isSaving ? " is-saving" : ""}`;

  return (
    <div className={wrapperClass}>
      <input
        ref={inputRef}
        disabled={isSaving}
        type={type}
        className="editable-cell-input"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      
      {/* Floating Action Bubble */}
      <div className="dt-editor-actions-bubble">
        <button
          className="dt-action-btn dt-confirm"
          onClick={() => !isSaving && onCommit()}
          disabled={isSaving}
          title="Save Changes (Enter)"
        >
          {isSaving ? <div className="btn-spinner" /> : <Check size={14} />}
        </button>
        <button
          className="dt-action-btn dt-cancel"
          onClick={() => !isSaving && onCancel()}
          disabled={isSaving}
          title="Cancel (Esc)"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
});

export default BaseInput;
