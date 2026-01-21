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
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      onCommit(text);
    }
  };

  const handleSubmit = () => {
    if (!isSaving) onCommit(text);
  };

  return ReactDOM.createPortal(
    <div className="dt-pro-modal-overlay" onClick={!isSaving ? onCancel : undefined}>
      <div className="dt-pro-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="dt-pro-modal-header">
          <div className="dt-pro-modal-title">Edit {column.label}</div>
          <button 
            className="dt-pro-modal-close" 
            onClick={onCancel} 
            disabled={isSaving}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="dt-pro-modal-body">
          <textarea
            autoFocus
            disabled={isSaving}
            className="dt-pro-modal-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your content here..."
          />
        </div>

        <div className="dt-pro-modal-footer">
          <div className="dt-pro-modal-hint">
            <span>Press <strong>Ctrl + Enter</strong> to save</span>
          </div>
          <div className="dt-pro-modal-actions">
            <button 
              className="dt-pro-btn dt-pro-btn-secondary" 
              onClick={onCancel} 
              disabled={isSaving}
            >
              Discard
            </button>
            <button 
              className="dt-pro-btn dt-pro-btn-primary" 
              onClick={handleSubmit} 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="btn-spinner" style={{ marginRight: 8 }} />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} style={{ marginRight: 8 }} />
                  Apply Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LongTextEditor;
