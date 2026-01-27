import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Check } from "lucide-react";
import "../../styles/LongTextEditor.css";

const LongTextEditor = ({ value, onCommit, onCancel, column, isSaving }) => {
  const [text, setText] = useState(String(value ?? ""));

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !isSaving) onCancel();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onCancel, isSaving]);

  const handleKeyDown = (e) => {
    if (isSaving) return;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onCommit(text);
    }
  };

  const handleSubmit = () => {
    if (!isSaving) onCommit(text);
  };

  return ReactDOM.createPortal(
    <div
      className="dt-scope dt-pro-modal-overlay"
      onClick={!isSaving ? onCancel : undefined}
    >
      <div className="dt-pro-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="dt-pro-modal-header">
          <div className="dt-pro-modal-title">
            <span className="dt-label-pill">{column.label}</span>
            <span className="dt-title-text">Edit Content</span>
          </div>
          <button
            className="dt-pro-modal-close"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X size={18} />
          </button>
        </div>

        <div className="dt-pro-modal-body">
          <textarea
            autoFocus
            disabled={isSaving}
            className="dt-pro-modal-textarea dt-scrollbar"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Enter ${column.label.toLowerCase()}...`}
          />
        </div>

        <div className="dt-pro-modal-footer">
          <div className="dt-pro-modal-meta">
            <div className="dt-char-count">
              <strong>{text.length}</strong> characters
            </div>
            <div className="dt-pro-modal-hint">
              <span>
                Press <strong>Cmd / Ctrl + Enter</strong> to save
              </span>
            </div>
          </div>
          <div className="dt-pro-modal-actions">
            <button
              className="dt-pro-btn dt-pro-btn-secondary"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="dt-pro-btn dt-pro-btn-primary"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="btn-spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LongTextEditor;
